// @ts-nocheck
import EmailService from '../utils/emailService.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';

/**
 * Handle contact form submission
 */
export const submitContactForm = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return errorResponse(res, { message: 'All fields are required' }, 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return errorResponse(res, { message: 'Invalid email address' }, 400);
    }

    // Send email to admin
    await EmailService.sendContactEmail({ name, email, subject, message });

    // Send confirmation to customer (must await for Vercel serverless)
    try {
      await EmailService.sendContactConfirmation({ name, email, subject });
    } catch (err) {
      console.error('Failed to send confirmation email:', err);
      // Don't fail the request if confirmation fails
    }

    successResponse(res, null, 'Message sent successfully! We\'ll get back to you soon.');
  } catch (error) {
    console.error('Contact form error:', error);
    errorResponse(res, { message: 'Failed to send message. Please try again later.' }, 500);
  }
};

