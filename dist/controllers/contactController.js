import EmailService from '../utils/emailService.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';
export const submitContactForm = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        if (!name || !email || !subject || !message) {
            return errorResponse(res, { message: 'All fields are required' }, 400);
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return errorResponse(res, { message: 'Invalid email address' }, 400);
        }
        await EmailService.sendContactEmail({ name, email, subject, message });
        try {
            await EmailService.sendContactConfirmation({ name, email, subject });
        }
        catch (err) {
            console.error('Failed to send confirmation email:', err);
        }
        successResponse(res, null, 'Message sent successfully! We\'ll get back to you soon.');
    }
    catch (error) {
        console.error('Contact form error:', error);
        errorResponse(res, { message: 'Failed to send message. Please try again later.' }, 500);
    }
};
//# sourceMappingURL=contactController.js.map