// @ts-nocheck
import Admin from '../models/Admin.js';
import jwt from 'jsonwebtoken';
import { successResponse, errorResponse } from '../utils/responseHandler.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = '1h';
const REFRESH_TOKEN_EXPIRES_IN = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Generate JWT tokens
 */
const generateTokens = (admin) => {
  const accessToken = jwt.sign(
    { 
      id: admin.id, 
      email: admin.email, 
      role: admin.role,
      name: `${admin.first_name} ${admin.last_name}`
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    { id: admin.id, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

/**
 * Validate email format
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate Lebanese phone format
 */
const isValidLebanesePhone = (phone) => {
  // Accepts: +961 XX XXX XXX, 961XXXXXXXX, 0X XXX XXX, etc.
  const phoneRegex = /^(\+961|961|0)?[ -]?(1|3|70|71|76|78|79|81)[ -]?[0-9]{3}[ -]?[0-9]{3}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Validate password strength
 */
const isValidPassword = (password) => {
  // At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Admin Login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return errorResponse(res, { message: 'Email and password are required' }, 400);
    }

    if (!isValidEmail(email)) {
      return errorResponse(res, { message: 'Invalid email format' }, 400);
    }

    // Find admin
    const admin = await Admin.findByEmail(email);

    if (!admin) {
      return errorResponse(res, { message: 'Invalid credentials' }, 401);
    }

    // Verify password
    const isValidPass = await Admin.verifyPassword(password, admin.password_hash);

    if (!isValidPass) {
      return errorResponse(res, { message: 'Invalid credentials' }, 401);
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(admin);

    // Store refresh token
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN);
    await Admin.storeRefreshToken(admin.id, refreshToken, expiresAt);

    // Update last login
    await Admin.updateLastLogin(admin.id);

    // Set refresh token in httpOnly cookie
    res.cookie('admin_refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: REFRESH_TOKEN_EXPIRES_IN
    });

    successResponse(res, {
      accessToken,
      admin: {
        id: admin.id,
        email: admin.email,
        firstName: admin.first_name,
        lastName: admin.last_name,
        role: admin.role
      }
    }, 'Login successful');

  } catch (error) {
    console.error('Login error:', error);
    errorResponse(res, { message: 'Login failed. Please try again.' }, 500);
  }
};

/**
 * Admin Logout
 */
export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.admin_refresh_token;

    if (refreshToken) {
      await Admin.deleteRefreshToken(refreshToken);
    }

    res.clearCookie('admin_refresh_token');
    successResponse(res, null, 'Logged out successfully');

  } catch (error) {
    console.error('Logout error:', error);
    errorResponse(res, error);
  }
};

/**
 * Refresh access token
 */
export const refreshToken = async (req, res) => {
  try {
    const refreshTokenCookie = req.cookies.admin_refresh_token;

    if (!refreshTokenCookie) {
      return errorResponse(res, { message: 'No refresh token provided' }, 401);
    }

    // Verify refresh token in database
    const session = await Admin.verifyRefreshToken(refreshTokenCookie);

    if (!session) {
      res.clearCookie('admin_refresh_token');
      return errorResponse(res, { message: 'Invalid or expired refresh token' }, 401);
    }

    const admin = session.admins;

    // Generate new access token
    const accessToken = jwt.sign(
      { 
        id: admin.id, 
        email: admin.email, 
        role: admin.role,
        name: `${admin.first_name} ${admin.last_name}`
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    successResponse(res, { accessToken }, 'Token refreshed');

  } catch (error) {
    console.error('Refresh token error:', error);
    res.clearCookie('admin_refresh_token');
    errorResponse(res, { message: 'Failed to refresh token' }, 401);
  }
};

/**
 * Get current admin profile
 */
export const getProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id);

    if (!admin) {
      return errorResponse(res, { message: 'Admin not found' }, 404);
    }

    successResponse(res, admin, 'Profile retrieved');

  } catch (error) {
    errorResponse(res, error);
  }
};

/**
 * Create new admin (super_admin only)
 */
export const createAdmin = async (req, res) => {
  try {
    // Check if requester is super_admin
    if (req.admin.role !== 'super_admin') {
      return errorResponse(res, { message: 'Only super admin can create new admins' }, 403);
    }

    const { email, password, first_name, last_name, phone, role } = req.body;

    // Validate required fields
    if (!email || !password || !first_name || !last_name) {
      return errorResponse(res, { message: 'Email, password, first name, and last name are required' }, 400);
    }

    // Validate email
    if (!isValidEmail(email)) {
      return errorResponse(res, { message: 'Invalid email format' }, 400);
    }

    // Validate password strength
    if (!isValidPassword(password)) {
      return errorResponse(res, { 
        message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character' 
      }, 400);
    }

    // Validate phone if provided
    if (phone && !isValidLebanesePhone(phone)) {
      return errorResponse(res, { message: 'Invalid Lebanese phone number format' }, 400);
    }

    // Check if email already exists
    const existingAdmin = await Admin.findByEmail(email);
    if (existingAdmin) {
      return errorResponse(res, { message: 'Email already registered' }, 409);
    }

    // Create admin
    const newAdmin = await Admin.create({
      email,
      password,
      first_name,
      last_name,
      phone,
      role: role || 'admin'
    });

    successResponse(res, newAdmin, 'Admin created successfully', 201);

  } catch (error) {
    console.error('Create admin error:', error);
    errorResponse(res, error);
  }
};

/**
 * Get all admins (super_admin only)
 */
export const getAllAdmins = async (req, res) => {
  try {
    if (req.admin.role !== 'super_admin') {
      return errorResponse(res, { message: 'Access denied' }, 403);
    }

    const admins = await Admin.getAll();
    successResponse(res, admins, 'Admins retrieved');

  } catch (error) {
    errorResponse(res, error);
  }
};

/**
 * Update admin (super_admin only)
 */
export const updateAdmin = async (req, res) => {
  try {
    if (req.admin.role !== 'super_admin') {
      return errorResponse(res, { message: 'Access denied' }, 403);
    }

    const { id } = req.params;
    const updateData = req.body;

    // Validate email if being updated
    if (updateData.email && !isValidEmail(updateData.email)) {
      return errorResponse(res, { message: 'Invalid email format' }, 400);
    }

    // Validate password if being updated
    if (updateData.password && !isValidPassword(updateData.password)) {
      return errorResponse(res, { 
        message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character' 
      }, 400);
    }

    // Validate phone if being updated
    if (updateData.phone && !isValidLebanesePhone(updateData.phone)) {
      return errorResponse(res, { message: 'Invalid Lebanese phone number format' }, 400);
    }

    const admin = await Admin.update(id, updateData);
    successResponse(res, admin, 'Admin updated');

  } catch (error) {
    errorResponse(res, error);
  }
};

/**
 * Delete admin (super_admin only)
 */
export const deleteAdmin = async (req, res) => {
  try {
    if (req.admin.role !== 'super_admin') {
      return errorResponse(res, { message: 'Access denied' }, 403);
    }

    const { id } = req.params;

    // Prevent self-deletion
    if (id === req.admin.id) {
      return errorResponse(res, { message: 'Cannot delete your own account' }, 400);
    }

    await Admin.delete(id);
    successResponse(res, null, 'Admin deleted');

  } catch (error) {
    errorResponse(res, error);
  }
};

/**
 * Verify admin token (for protected pages)
 */
export const verifyToken = async (req, res) => {
  try {
    // If we reach here, the middleware already verified the token
    successResponse(res, { 
      valid: true,
      admin: req.admin 
    }, 'Token valid');
  } catch (error) {
    errorResponse(res, error);
  }
};

