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
  },

  /**
   * Send order confirmation email to customer
   */
  async sendOrderConfirmation(order) {
    const currentDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const itemsHTML = order.items.map(item => `
      <tr>
        <td style="padding: 15px; border-bottom: 1px solid #eee;">
          <div style="display: flex; align-items: center; gap: 15px;">
            ${item.image_url ? `<img src="${item.image_url}" alt="${item.product_name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">` : ''}
            <div>
              <p style="margin: 0; font-weight: 500; color: #333;">${item.product_name}</p>
              ${item.size_name ? `<p style="margin: 5px 0 0 0; font-size: 13px; color: #666;">Size: ${item.size_name}</p>` : ''}
            </div>
          </div>
        </td>
        <td style="padding: 15px; border-bottom: 1px solid #eee; text-align: center; color: #666;">${item.quantity}</td>
        <td style="padding: 15px; border-bottom: 1px solid #eee; text-align: right; font-weight: 500;">$${parseFloat(item.subtotal).toFixed(2)}</td>
      </tr>
    `).join('');

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
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
              <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Order Confirmation</p>
            </td>
          </tr>

          <!-- Success Message -->
          <tr>
            <td style="padding: 40px 30px 20px 30px; text-align: center;">
              <div style="width: 70px; height: 70px; background: linear-gradient(135deg, rgb(41, 121, 77) 0%, rgb(34, 100, 64) 100%); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 30px;">✓</span>
              </div>
              <h2 style="margin: 0 0 10px 0; color: #333; font-size: 24px;">Thank You for Your Order!</h2>
              <p style="margin: 0; color: #666; font-size: 16px;">Order #${order.order_number}</p>
              <p style="margin: 10px 0 0 0; color: #999; font-size: 14px;">${currentDate}</p>
            </td>
          </tr>

          <!-- Delivery Notice -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <div style="background-color: #f0f9f4; border-radius: 8px; padding: 20px; text-align: center;">
                <p style="margin: 0; color: rgb(41, 121, 77); font-size: 16px; font-weight: 500;">
                  🚚 Your order will be shipped within 72 hours
                </p>
              </div>
            </td>
          </tr>

          <!-- Order Items -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px; border-bottom: 2px solid #eee; padding-bottom: 10px;">Order Details</h3>
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr>
                    <th style="padding: 10px 15px; text-align: left; color: #666; font-size: 13px; font-weight: 600; text-transform: uppercase;">Product</th>
                    <th style="padding: 10px 15px; text-align: center; color: #666; font-size: 13px; font-weight: 600; text-transform: uppercase;">Qty</th>
                    <th style="padding: 10px 15px; text-align: right; color: #666; font-size: 13px; font-weight: 600; text-transform: uppercase;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHTML}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Order Totals -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f8f9fa; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="padding: 12px 20px; color: #666;">Subtotal</td>
                  <td style="padding: 12px 20px; text-align: right; color: #333;">$${parseFloat(order.subtotal).toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; color: #666;">Shipping</td>
                  <td style="padding: 12px 20px; text-align: right; color: #333;">$${parseFloat(order.shipping_cost).toFixed(2)}</td>
                </tr>
                <tr style="border-top: 2px solid #ddd;">
                  <td style="padding: 15px 20px; font-weight: 700; font-size: 18px; color: #333;">Total</td>
                  <td style="padding: 15px 20px; text-align: right; font-weight: 700; font-size: 18px; color: rgb(41, 121, 77);">$${parseFloat(order.total).toFixed(2)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Shipping Address -->
          <tr>
            <td style="padding: 0 30px 20px 30px;">
              <h3 style="margin: 0 0 15px 0; color: #333; font-size: 16px;">Shipping Address</h3>
              <p style="margin: 0; color: #666; line-height: 1.6;">
                ${order.customer_name}<br>
                ${order.shipping_address}<br>
                📞 ${order.customer_phone}
              </p>
            </td>
          </tr>

          <!-- Billing Address (only show if different) -->
          ${order.billing_address && order.billing_address !== order.shipping_address ? `
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <h3 style="margin: 0 0 15px 0; color: #333; font-size: 16px;">Billing Address</h3>
              <p style="margin: 0; color: #666; line-height: 1.6;">
                ${order.billing_details ? `${order.billing_details.firstName} ${order.billing_details.lastName}<br>` : ''}
                ${order.billing_address}<br>
                ${order.billing_details?.phone ? `📞 ${order.billing_details.phone}` : ''}
              </p>
            </td>
          </tr>
          ` : ''}

          <!-- Payment Method -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <div style="background-color: #fff8e1; border-left: 4px solid #ffc107; padding: 15px 20px; border-radius: 4px;">
                <p style="margin: 0; color: #856404; font-size: 14px;">
                  <strong>💵 Cash on Delivery</strong> — Pay when your order arrives
                </p>
              </div>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 30px 30px 30px; text-align: center;">
              <a href="https://alirehawi.vercel.app/pages/shop.html" style="display: inline-block; background: linear-gradient(135deg, rgb(41, 121, 77) 0%, rgb(34, 100, 64) 100%); color: #ffffff; text-decoration: none; padding: 14px 35px; border-radius: 8px; font-size: 14px; font-weight: 600;">
                Continue Shopping
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 25px 30px; border-top: 1px solid #eee; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">
                Questions? Contact us at <a href="mailto:support@brand.com" style="color: rgb(41, 121, 77);">support@brand.com</a>
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
      to: order.customer_email,
      subject: `Order Confirmed! #${order.order_number}`,
      html: htmlContent
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Order confirmation email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending order confirmation email:', error);
      throw error;
    }
  },

  /**
   * Send order notification email to seller
   */
  async sendOrderNotification(order) {
    const currentDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const itemsHTML = order.items.map(item => `
      <tr>
        <td style="padding: 12px 15px; border-bottom: 1px solid #eee;">${item.product_name}</td>
        <td style="padding: 12px 15px; border-bottom: 1px solid #eee; text-align: center;">${item.size_name || '-'}</td>
        <td style="padding: 12px 15px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px 15px; border-bottom: 1px solid #eee; text-align: right;">$${parseFloat(item.unit_price).toFixed(2)}</td>
        <td style="padding: 12px 15px; border-bottom: 1px solid #eee; text-align: right; font-weight: 500;">$${parseFloat(item.subtotal).toFixed(2)}</td>
      </tr>
    `).join('');

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Order Received</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 650px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">🛒 NEW ORDER RECEIVED</h1>
              <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.8); font-size: 14px;">${currentDate}</p>
            </td>
          </tr>

          <!-- Order Info Banner -->
          <tr>
            <td style="padding: 25px 30px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, rgb(41, 121, 77) 0%, rgb(34, 100, 64) 100%); border-radius: 10px; overflow: hidden;">
                <tr>
                  <td style="padding: 20px 25px; color: #fff;">
                    <p style="margin: 0 0 5px 0; font-size: 13px; opacity: 0.9;">ORDER NUMBER</p>
                    <p style="margin: 0; font-size: 22px; font-weight: 700;">#${order.order_number}</p>
                  </td>
                  <td style="padding: 20px 25px; color: #fff; text-align: right;">
                    <p style="margin: 0 0 5px 0; font-size: 13px; opacity: 0.9;">TOTAL AMOUNT</p>
                    <p style="margin: 0; font-size: 22px; font-weight: 700;">$${parseFloat(order.total).toFixed(2)}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Customer Details -->
          <tr>
            <td style="padding: 0 30px 25px 30px;">
              <h3 style="margin: 0 0 15px 0; color: #333; font-size: 16px; border-bottom: 2px solid #eee; padding-bottom: 10px;">👤 Customer Information</h3>
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666; width: 120px;">Name:</td>
                  <td style="padding: 8px 0; color: #333; font-weight: 500;">${order.customer_name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Email:</td>
                  <td style="padding: 8px 0;"><a href="mailto:${order.customer_email}" style="color: rgb(41, 121, 77);">${order.customer_email}</a></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Phone:</td>
                  <td style="padding: 8px 0; color: #333; font-weight: 500;">${order.customer_phone}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Shipping Address -->
          <tr>
            <td style="padding: 0 30px 20px 30px;">
              <h3 style="margin: 0 0 15px 0; color: #333; font-size: 16px; border-bottom: 2px solid #eee; padding-bottom: 10px;">📦 Shipping Address</h3>
              <div style="background-color: #f8f9fa; padding: 15px 20px; border-radius: 8px; border-left: 4px solid rgb(41, 121, 77);">
                <p style="margin: 0; color: #333; line-height: 1.7;">${order.shipping_address}</p>
              </div>
            </td>
          </tr>

          <!-- Billing Address (only show if different) -->
          ${order.billing_address && order.billing_address !== order.shipping_address ? `
          <tr>
            <td style="padding: 0 30px 25px 30px;">
              <h3 style="margin: 0 0 15px 0; color: #333; font-size: 16px; border-bottom: 2px solid #eee; padding-bottom: 10px;">🧾 Billing Address</h3>
              <div style="background-color: #f8f9fa; padding: 15px 20px; border-radius: 8px; border-left: 4px solid #6c757d;">
                <p style="margin: 0; color: #333; line-height: 1.7;">
                  ${order.billing_details ? `<strong>${order.billing_details.firstName} ${order.billing_details.lastName}</strong><br>` : ''}
                  ${order.billing_address}<br>
                  ${order.billing_details?.phone ? `📞 ${order.billing_details.phone}` : ''}
                </p>
              </div>
            </td>
          </tr>
          ` : ''}

          <!-- Order Items -->
          <tr>
            <td style="padding: 0 30px 25px 30px;">
              <h3 style="margin: 0 0 15px 0; color: #333; font-size: 16px; border-bottom: 2px solid #eee; padding-bottom: 10px;">📋 Order Items</h3>
              <table role="presentation" style="width: 100%; border-collapse: collapse; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
                <thead>
                  <tr style="background-color: #f8f9fa;">
                    <th style="padding: 12px 15px; text-align: left; color: #333; font-size: 13px; font-weight: 600;">Product</th>
                    <th style="padding: 12px 15px; text-align: center; color: #333; font-size: 13px; font-weight: 600;">Size</th>
                    <th style="padding: 12px 15px; text-align: center; color: #333; font-size: 13px; font-weight: 600;">Qty</th>
                    <th style="padding: 12px 15px; text-align: right; color: #333; font-size: 13px; font-weight: 600;">Price</th>
                    <th style="padding: 12px 15px; text-align: right; color: #333; font-size: 13px; font-weight: 600;">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHTML}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Order Summary -->
          <tr>
            <td style="padding: 0 30px 25px 30px;">
              <table role="presentation" style="width: 250px; margin-left: auto; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666;">Subtotal:</td>
                  <td style="padding: 8px 0; text-align: right; color: #333;">$${parseFloat(order.subtotal).toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Shipping:</td>
                  <td style="padding: 8px 0; text-align: right; color: #333;">$${parseFloat(order.shipping_cost).toFixed(2)}</td>
                </tr>
                <tr style="border-top: 2px solid #333;">
                  <td style="padding: 12px 0; font-weight: 700; font-size: 16px; color: #333;">Total:</td>
                  <td style="padding: 12px 0; text-align: right; font-weight: 700; font-size: 16px; color: rgb(41, 121, 77);">$${parseFloat(order.total).toFixed(2)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Payment Method -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <div style="background-color: #fff8e1; border: 1px solid #ffc107; padding: 15px 20px; border-radius: 8px; text-align: center;">
                <p style="margin: 0; color: #856404; font-size: 15px; font-weight: 500;">
                  💵 Payment Method: Cash on Delivery (COD)
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #1a1a2e; padding: 20px 30px; text-align: center;">
              <p style="margin: 0; color: rgba(255,255,255,0.7); font-size: 13px;">
                BRAND E-Commerce Admin Notification
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
      from: '"BRAND Orders" <orders@brand.com>',
      to: 'youssef_ahz@hotmail.com',
      subject: `🛒 New Order #${order.order_number} - $${parseFloat(order.total).toFixed(2)}`,
      html: htmlContent
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Order notification email sent to seller:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending order notification email:', error);
      throw error;
    }
  }
};

export default EmailService;
