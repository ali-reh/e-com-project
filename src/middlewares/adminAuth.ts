// @ts-nocheck
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import { errorResponse } from '../utils/responseHandler.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

/**
 * Verify JWT token middleware
 * Protects admin routes
 */
export const verifyToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    // Also check for token in cookies
    if (!token && req.cookies && req.cookies.admin_access_token) {
      token = req.cookies.admin_access_token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Get admin from database to ensure they still exist and are active
    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Admin not found or has been deleted.'
      });
    }

    if (!admin.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Admin account is deactivated.'
      });
    }

    // Attach admin to request
    req.admin = {
      id: admin.id,
      email: admin.email,
      role: admin.role,
      first_name: admin.first_name,
      last_name: admin.last_name
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please refresh your token.',
        code: 'TOKEN_EXPIRED'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }

    console.error('Token verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error verifying token.'
    });
  }
};

/**
 * Check if admin has super_admin role
 */
export const requireSuperAdmin = (req, res, next) => {
  if (!req.admin) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    });
  }

  if (req.admin.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Super admin access required.'
    });
  }

  next();
};

/**
 * Check if admin has at least admin role
 */
export const requireAdmin = (req, res, next) => {
  if (!req.admin) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    });
  }

  if (!['admin', 'super_admin'].includes(req.admin.role)) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required.'
    });
  }

  next();
};

/**
 * Optional auth - attaches admin if token present, but doesn't require it
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    if (!token && req.cookies && req.cookies.admin_access_token) {
      token = req.cookies.admin_access_token;
    }

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      const admin = await Admin.findById(decoded.id);

      if (admin && admin.is_active) {
        req.admin = {
          id: admin.id,
          email: admin.email,
          role: admin.role,
          first_name: admin.first_name,
          last_name: admin.last_name
        };
      }
    }

    next();
  } catch (error) {
    // Token invalid or expired, but we continue without admin
    next();
  }
};

export default {
  verifyToken,
  requireSuperAdmin,
  requireAdmin,
  optionalAuth
};

