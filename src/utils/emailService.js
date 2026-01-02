import transporter from '../config/mailtrap.js';

/**
 * Email Service
 * Handles sending emails via Mailtrap
 */

const EmailService = {
  /**
   * Send contact form email
   */
  async sendContactEmail({ name, email, subject, message }) {
    const subjectLabels = {
      'general': 'General Inquiry',
      'order': 'Order Support',
      'returns': 'Returns & Refunds',
      'product': 'Product Question',
      'partnership': 'Partnership',
      'other': 'Other'
    };

    const subjectLabel = subjectLabels[subject] || subject;
    const currentDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Contact Form Submission</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, rgb(41, 121, 77) 0%, rgb(34, 100, 64) 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: 1px;">BRAND</h1>
              <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">New Contact Form Submission</p>
            </td>
          </tr>

          <!-- Alert Badge -->
          <tr>
            <td style="padding: 30px 30px 0 30px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="background-color: #fff8e1; border-left: 4px solid #ffc107; padding: 15px 20px; border-radius: 4px;">
                    <p style="margin: 0; color: #856404; font-size: 14px;">
                      <strong>📬 New Message Received</strong> — ${currentDate}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Contact Details -->
          <tr>
            <td style="padding: 30px;">
              <h2 style="margin: 0 0 20px 0; color: #333; font-size: 20px; border-bottom: 2px solid #eee; padding-bottom: 10px;">
                Contact Details
              </h2>
              
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <!-- Name -->
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="width: 40px; vertical-align: top;">
                          <div style="width: 36px; height: 36px; background-color: rgba(41, 121, 77, 0.1); border-radius: 8px; text-align: center; line-height: 36px;">
                            👤
                          </div>
                        </td>
                        <td style="padding-left: 15px; vertical-align: middle;">
                          <p style="margin: 0; color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Full Name</p>
                          <p style="margin: 4px 0 0 0; color: #333; font-size: 16px; font-weight: 500;">${name}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Email -->
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="width: 40px; vertical-align: top;">
                          <div style="width: 36px; height: 36px; background-color: rgba(41, 121, 77, 0.1); border-radius: 8px; text-align: center; line-height: 36px;">
                            ✉️
                          </div>
                        </td>
                        <td style="padding-left: 15px; vertical-align: middle;">
                          <p style="margin: 0; color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Email Address</p>
                          <p style="margin: 4px 0 0 0; color: #333; font-size: 16px; font-weight: 500;">
                            <a href="mailto:${email}" style="color: rgb(41, 121, 77); text-decoration: none;">${email}</a>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Subject -->
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="width: 40px; vertical-align: top;">
                          <div style="width: 36px; height: 36px; background-color: rgba(41, 121, 77, 0.1); border-radius: 8px; text-align: center; line-height: 36px;">
                            📋
                          </div>
                        </td>
                        <td style="padding-left: 15px; vertical-align: middle;">
                          <p style="margin: 0; color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Subject</p>
                          <p style="margin: 4px 0 0 0; color: #333; font-size: 16px; font-weight: 500;">
                            <span style="display: inline-block; background-color: rgba(41, 121, 77, 0.1); color: rgb(41, 121, 77); padding: 4px 12px; border-radius: 20px; font-size: 14px;">${subjectLabel}</span>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Message -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <h2 style="margin: 0 0 15px 0; color: #333; font-size: 20px; border-bottom: 2px solid #eee; padding-bottom: 10px;">
                Message
              </h2>
              <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; border-left: 4px solid rgb(41, 121, 77);">
                <p style="margin: 0; color: #555; font-size: 15px; line-height: 1.7; white-space: pre-wrap;">${message}</p>
              </div>
            </td>
          </tr>

          <!-- Quick Reply Button -->
          <tr>
            <td style="padding: 0 30px 30px 30px; text-align: center;">
              <a href="mailto:${email}?subject=Re: ${subjectLabel} - BRAND Support" 
                 style="display: inline-block; background: linear-gradient(135deg, rgb(41, 121, 77) 0%, rgb(34, 100, 64) 100%); color: #ffffff; text-decoration: none; padding: 14px 35px; border-radius: 8px; font-size: 14px; font-weight: 600; letter-spacing: 0.5px;">
                Reply to ${name.split(' ')[0]}
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 25px 30px; border-top: 1px solid #eee;">
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="text-align: center;">
                    <p style="margin: 0 0 10px 0; color: #999; font-size: 13px;">
                      This email was sent from the contact form on your website
                    </p>
                    <p style="margin: 0; color: #999; font-size: 12px;">
                      © ${new Date().getFullYear()} BRAND. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const plainText = `
NEW CONTACT FORM SUBMISSION
============================

Received: ${currentDate}

CONTACT DETAILS
---------------
Name: ${name}
Email: ${email}
Subject: ${subjectLabel}

MESSAGE
-------
${message}

---
Reply to this customer: ${email}
    `;

    const mailOptions = {
      from: '"BRAND Contact Form" <noreply@brand.com>',
      to: 'youssef_ahz@hotmail.com',
      replyTo: email,
      subject: `[BRAND] New Contact: ${subjectLabel} - from ${name}`,
      text: plainText,
      html: htmlContent
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Contact email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending contact email:', error);
      throw error;
    }
  },

  /**
   * Send auto-reply confirmation to customer
   */
  async sendContactConfirmation({ name, email, subject }) {
    const subjectLabels = {
      'general': 'General Inquiry',
      'order': 'Order Support',
      'returns': 'Returns & Refunds',
      'product': 'Product Question',
      'partnership': 'Partnership',
      'other': 'Other'
    };

    const subjectLabel = subjectLabels[subject] || subject;
    const firstName = name.split(' ')[0];

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank You for Contacting Us</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, rgb(41, 121, 77) 0%, rgb(34, 100, 64) 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: 1px;">BRAND</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #333; font-size: 24px;">Thank You, ${firstName}! 👋</h2>
              
              <p style="margin: 0 0 20px 0; color: #555; font-size: 16px; line-height: 1.7;">
                We've received your message regarding <strong>"${subjectLabel}"</strong> and our team is already on it!
              </p>

              <div style="background-color: #f0f9f4; border-radius: 8px; padding: 20px; margin: 25px 0;">
                <p style="margin: 0; color: rgb(41, 121, 77); font-size: 15px;">
                  <strong>⏱️ Expected Response Time:</strong> Within 24-48 business hours
                </p>
              </div>

              <p style="margin: 0 0 20px 0; color: #555; font-size: 16px; line-height: 1.7;">
                In the meantime, feel free to browse our latest collection or check out our FAQ section for quick answers.
              </p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="https://alirehawi.vercel.app/pages/shop.html" style="display: inline-block; background: linear-gradient(135deg, rgb(41, 121, 77) 0%, rgb(34, 100, 64) 100%); color: #ffffff; text-decoration: none; padding: 14px 35px; border-radius: 8px; font-size: 14px; font-weight: 600; margin: 0 5px;">
                  Shop Now
                </a>
                <a href="https://alirehawi.vercel.app/pages/contact.html#contact-faq" style="display: inline-block; background: #ffffff; color: rgb(41, 121, 77); text-decoration: none; padding: 14px 35px; border-radius: 8px; font-size: 14px; font-weight: 600; border: 2px solid rgb(41, 121, 77); margin: 0 5px;">
                  View FAQ
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 25px 30px; border-top: 1px solid #eee; text-align: center;">
              <p style="margin: 0 0 15px 0; color: #666; font-size: 14px;">
                Need immediate help? Reach us at <a href="mailto:support@brand.com" style="color: rgb(41, 121, 77);">support@brand.com</a>
              </p>
              <p style="margin: 0; color: #999; font-size: 12px;">
                © ${new Date().getFullYear()} BRAND. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const mailOptions = {
      from: '"BRAND" <noreply@brand.com>',
      to: email,
      subject: `Thank you for contacting BRAND!`,
      html: htmlContent
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Confirmation email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending confirmation email:', error);
      // Don't throw - confirmation email is not critical
    }
  }
};

export default EmailService;
