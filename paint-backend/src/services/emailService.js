const transporter = require('../config/email');

const sendEmail = async (options) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: options.to || options.email,
            subject: options.subject,
            html: options.html
        };

        const info = await transporter.sendMail(mailOptions);

        console.log('Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Email send error:', error.message);
        return { success: false, error: error.message };
    }
};

// Export sendEmail for direct use
exports.sendEmail = sendEmail;

// Simple professional email template wrapper
const emailWrapper = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  ${content}
  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
  <p style="font-size: 12px; color: #888; text-align: center;">
    Chandan House Painting<br>
    36 Harbourtown Crescent, Ontario, Canada<br>
    705-951-0764 | chandansingh3016@gmail.com
  </p>
</body>
</html>
`;

// 1. WELCOME EMAIL
exports.sendWelcomeEmail = async (user) => {
  const html = emailWrapper(`
    <h2 style="color: #1e3a5f; margin-bottom: 20px;">Welcome, ${user.name}!</h2>
    
    <p>Thank you for joining Chandan House Painting. We're excited to help transform your space.</p>
    
    <p><strong>What you can do now:</strong></p>
    <ul style="padding-left: 20px;">
      <li>Browse our services and portfolio</li>
      <li>Request a free quote for your project</li>
      <li>Use our AI Room Visualizer</li>
    </ul>
    
    <p style="margin-top: 25px;">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" style="background: #1e3a5f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">View Our Services</a>
    </p>
    
    <p style="margin-top: 25px; color: #666;">
      Questions? Call us at 705-951-0764
    </p>
  `);

  return await sendEmail({
    email: user.email,
    subject: 'Welcome to Chandan House Painting',
    html
  });
};

// 2. QUOTE CONFIRMATION EMAIL
exports.sendQuoteConfirmationEmail = async (quote, user) => {
  const html = emailWrapper(`
    <h2 style="color: #1e3a5f; margin-bottom: 20px;">Quote Request Received</h2>
    
    <p>Hi ${user.name},</p>
    
    <p>Thank you for your quote request. We'll review it and get back to you within 24 hours.</p>
    
    <div style="background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
      <p style="margin: 0 0 10px 0;"><strong>Reference:</strong> #${quote._id.toString().slice(-8).toUpperCase()}</p>
      <p style="margin: 0 0 10px 0;"><strong>Estimated Price:</strong> $${quote.estimatedPrice.toLocaleString()}</p>
      <p style="margin: 0 0 10px 0;"><strong>Room:</strong> ${quote.roomType.replace('_', ' ')} (${quote.roomSize} sq ft)</p>
      <p style="margin: 0;"><strong>Paint Quality:</strong> ${quote.paintQuality}</p>
    </div>
    
    <p><strong>Price Breakdown:</strong></p>
    <ul style="padding-left: 20px;">
      <li>Labor: $${quote.priceBreakdown.laborCost}</li>
      <li>Materials: $${quote.priceBreakdown.materialCost}</li>
      <li>Additional Services: $${quote.priceBreakdown.additionalServicesCost}</li>
    </ul>
    
    <p style="color: #666; font-size: 14px;">*This is a preliminary estimate. Final quote will be provided after review.</p>
    
    <p style="margin-top: 25px; color: #666;">
      Questions? Call us at 705-951-0764
    </p>
  `);

  return await sendEmail({
    email: user.email,
    subject: `Quote Request #${quote._id.toString().slice(-8).toUpperCase()} Received`,
    html
  });
};

// 3. FINAL QUOTE EMAIL
exports.sendFinalQuoteEmail = async (quote, user) => {
  const finalPrice = quote.finalPrice || quote.estimatedPrice;
  const discount = quote.discount || 0;
  
  const html = emailWrapper(`
    <h2 style="color: #1e3a5f; margin-bottom: 20px;">Your Quote is Ready</h2>
    
    <p>Hi ${user.name},</p>
    
    <p>We've reviewed your project and prepared your final quote.</p>
    
    <div style="background: #f8f9fa; padding: 25px; border-radius: 6px; margin: 20px 0; text-align: center;">
      <p style="margin: 0; font-size: 36px; font-weight: bold; color: #1e3a5f;">$${finalPrice.toLocaleString()}</p>
      ${discount > 0 ? `<p style="margin: 10px 0 0 0; color: #16a34a; font-weight: 500;">${discount}% discount applied</p>` : ''}
    </div>
    
    ${quote.adminResponse ? `<p style="background: #f0f9ff; padding: 15px; border-radius: 6px; font-style: italic;">"${quote.adminResponse}"</p>` : ''}
    
    <p><strong>Quote valid until:</strong> ${new Date(quote.expiryDate).toLocaleDateString()}</p>
    
    <p><strong>What's included:</strong></p>
    <ul style="padding-left: 20px;">
      <li>${quote.paintQuality} quality paint</li>
      <li>${quote.numberOfCoats} coats</li>
      <li>Surface preparation</li>
      <li>Clean-up after completion</li>
      ${quote.additionalServices.length > 0 ? `<li>${quote.additionalServices.join(', ')}</li>` : ''}
    </ul>
    
    <p style="margin-top: 25px;">
      <a href="${process.env.FRONTEND_URL}/quotes/${quote._id}" style="background: #1e3a5f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">View & Accept Quote</a>
    </p>
    
    <p style="margin-top: 25px; color: #666;">
      Questions? Call us at 705-951-0764
    </p>
  `);

  return await sendEmail({
    email: user.email,
    subject: `Your Quote - $${finalPrice.toLocaleString()}`,
    html
  });
};

// 4. QUOTE ACCEPTED EMAIL
exports.sendQuoteAcceptedEmail = async (quote, user) => {
  const html = emailWrapper(`
    <h2 style="color: #1e3a5f; margin-bottom: 20px;">Quote Accepted - Thank You!</h2>
    
    <p>Hi ${user.name},</p>
    
    <p>Thank you for accepting our quote. We're excited to work on your project!</p>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #16a34a;">
      <p style="margin: 0 0 10px 0;"><strong>Amount:</strong> $${(quote.finalPrice || quote.estimatedPrice).toLocaleString()}</p>
      <p style="margin: 0;"><strong>Preferred Start:</strong> ${quote.preferredStartDate ? new Date(quote.preferredStartDate).toLocaleDateString() : 'To be scheduled'}</p>
    </div>
    
    <p><strong>What happens next:</strong></p>
    <ol style="padding-left: 20px;">
      <li>We'll contact you within 24 hours to schedule</li>
      <li>Confirm all project details</li>
      <li>Our team arrives on the scheduled date</li>
      <li>Final walkthrough upon completion</li>
    </ol>
    
    <p style="margin-top: 25px; color: #666;">
      Need to reschedule? Call us at 705-951-0764
    </p>
  `);

  return await sendEmail({
    email: user.email,
    subject: 'Quote Accepted - Chandan House Painting',
    html
  });
};

// 5. REVIEW REQUEST EMAIL
exports.sendReviewRequestEmail = async (user, projectDetails) => {
  const html = emailWrapper(`
    <h2 style="color: #1e3a5f; margin-bottom: 20px;">How was your experience?</h2>
    
    <p>Hi ${user.name},</p>
    
    <p>Thank you for choosing Chandan House Painting! We hope you love your newly painted space.</p>
    
    <p>We'd really appreciate if you could take a moment to share your experience. Your feedback helps us improve and helps others make informed decisions.</p>
    
    <p style="margin-top: 25px; text-align: center;">
      <a href="${process.env.FRONTEND_URL}/reviews/new" style="background: #1e3a5f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Write a Review</a>
    </p>
    
    <p style="margin-top: 25px; text-align: center; color: #666; font-size: 14px;">
      As a thank you, get 10% off your next project!
    </p>
  `);

  return await sendEmail({
    email: user.email,
    subject: 'How was your experience? - Chandan House Painting',
    html
  });
};

// 6. PASSWORD RESET EMAIL
exports.sendPasswordResetEmail = async (user, resetUrl) => {
  const html = emailWrapper(`
    <h2 style="color: #1e3a5f; margin-bottom: 20px;">Password Reset Request</h2>
    
    <p>Hi ${user.name},</p>
    
    <p>We received a request to reset your password. Click the button below to create a new password.</p>
    
    <p style="margin: 25px 0; text-align: center;">
      <a href="${resetUrl}" style="background: #1e3a5f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
    </p>
    
    <p style="background: #fef3c7; padding: 15px; border-radius: 6px; font-size: 14px;">
      <strong>This link expires in 10 minutes.</strong> If you didn't request this, you can safely ignore this email.
    </p>
    
    <p style="margin-top: 20px; font-size: 13px; color: #666; word-break: break-all;">
      If the button doesn't work, copy this link: ${resetUrl}
    </p>
  `);

  return await sendEmail({
    email: user.email,
    subject: 'Password Reset - Chandan House Painting',
    html
  });
};

module.exports = exports;