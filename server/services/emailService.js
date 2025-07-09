const nodemailer = require('nodemailer');
const config = require('../config');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      // secure: config.email.port === 465, // true for 465, false for other ports like 587
      auth: {
        user: config.email.username,
        pass: config.email.password,
      },
      // tls: { // Optional: For development with self-signed certificates
      //   rejectUnauthorized: false
      // }
    });

    if (process.env.NODE_ENV !== 'test') { // Avoid transporter logging during tests
        this.transporter
            .verify()
            .then(() => logger.info('Email transporter configured and verified successfully.'))
            .catch(err => logger.error('Email transporter verification failed:', err));
    }
  }

  async sendMail({ to, subject, text, html }) {
    const mailOptions = {
      from: `"${config.email.fromName}" <${config.email.fromAddress}>`,
      to, // list of receivers (comma separated if multiple)
      subject, // Subject line
      text, // plain text body
      html, // html body
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent: ${info.messageId} to ${to}`);
      return info;
    } catch (error) {
      logger.error(`Error sending email to ${to} with subject "${subject}":`, error);
      // Depending on the importance, you might want to throw the error
      // or handle it gracefully (e.g., queue for retry)
      throw new Error('Email could not be sent');
    }
  }

  async sendPasswordResetEmail(userEmail, resetToken, origin) {
    // Origin is the base URL of the client application (e.g., http://localhost:3000)
    const resetURL = `${origin}/reset-password/${resetToken}`;

    const subject = 'Password Reset Request';
    const textBody = `You are receiving this email because you (or someone else) have requested the reset of a password. Please make a PUT request to: \n\n ${resetURL} \n\nIf you did not request this, please ignore this email and your password will remain unchanged.\nThis link will expire in 10 minutes.`;
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Password Reset Request</h2>
        <p>You are receiving this email because you (or someone else) have requested the reset of your account's password.</p>
        <p>Please click on the link below to reset your password:</p>
        <p><a href="${resetURL}" target="_blank" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
        <p>If the button doesn't work, you can copy and paste the following link into your browser:</p>
        <p><a href="${resetURL}" target="_blank">${resetURL}</a></p>
        <p>This link is valid for <strong>10 minutes</strong>.</p>
        <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
        <hr/>
        <p><small>If you're having trouble clicking the Password Reset button, copy and paste the URL below into your web browser: ${resetURL}</small></p>
      </div>
    `;

    await this.sendMail({
      to: userEmail,
      subject,
      text: textBody,
      html: htmlBody,
    });
  }

  async sendAccountVerificationEmail(userEmail, verificationToken, origin) {
    const verificationURL = `${origin}/verify-email/${verificationToken}`;

    const subject = 'Verify Your Email Address';
    const textBody = `Thank you for registering! Please verify your email address by clicking the link: \n\n ${verificationURL} \n\nIf you did not create an account, please ignore this email. This link will expire in 1 hour.`;
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Verify Your Email Address</h2>
        <p>Thank you for registering with us! Please click the button below to verify your email address and activate your account.</p>
        <p><a href="${verificationURL}" target="_blank" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a></p>
        <p>If the button doesn't work, copy and paste the following link into your browser:</p>
        <p><a href="${verificationURL}" target="_blank">${verificationURL}</a></p>
        <p>This link is valid for <strong>1 hour</strong>.</p>
        <p>If you did not create an account, no further action is required.</p>
      </div>
    `;

    await this.sendMail({
      to: userEmail,
      subject,
      text: textBody,
      html: htmlBody,
    });
  }

  // Add more email templates as needed (e.g., welcome email, order confirmation)
  async sendWelcomeEmail(userEmail, userName) {
    const subject = `Welcome to Our Store, ${userName}!`;
    const textBody = `Hi ${userName},\n\nWelcome to our store! We are excited to have you.\n\nExplore our products and enjoy your shopping experience.\n\nBest regards,\nThe Store Team`;
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Welcome, ${userName}!</h2>
        <p>We are thrilled to have you join our community. Get ready to discover amazing furniture and enjoy a seamless shopping experience.</p>
        <p>Feel free to explore our latest collections and special offers.</p>
        <p>Happy Shopping!</p>
        <p><strong>The Store Team</strong></p>
      </div>
    `;

    await this.sendMail({
      to: userEmail,
      subject,
      text: textBody,
      html: htmlBody,
    });
  }
}

// Export a single instance of the service
module.exports = new EmailService();
