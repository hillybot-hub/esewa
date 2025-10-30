// services/emailService.js
import nodemailer from 'nodemailer';

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendEmail(to, subject, html) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        html
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Email sent to ${to}`);
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendWelcomeEmail(user) {
    const subject = 'Welcome to BloodDonation System';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Welcome to BloodDonation System!</h2>
        <p>Hello ${user.name},</p>
        <p>Thank you for registering as a ${user.role} on our platform. Your account has been successfully created.</p>
        <p>You can now:</p>
        <ul>
          ${user.role === 'donor' ? '<li>Update your medical information</li>' : ''}
          ${user.role === 'donor' ? '<li>Respond to blood requests</li>' : ''}
          ${user.role === 'hospital' ? '<li>Manage blood inventory</li>' : ''}
          ${user.role === 'hospital' ? '<li>Create blood requests</li>' : ''}
          ${user.role === 'receiver' ? '<li>Request blood donations</li>' : ''}
          <li>Track your activities</li>
        </ul>
        <p>If you have any questions, please don't hesitate to contact our support team.</p>
        <br>
        <p>Best regards,<br>BloodDonation Team</p>
      </div>
    `;

    await this.sendEmail(user.email, subject, html);
  }

  async sendBloodRequestNotification(donors, request) {
    const subject = 'Urgent: Blood Donation Request';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Blood Donation Request</h2>
        <p>There is an urgent need for blood donation in your area.</p>
        <div style="background: #fef2f2; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p><strong>Blood Type:</strong> ${request.bloodType}</p>
          <p><strong>Units Needed:</strong> ${request.units}</p>
          <p><strong>Urgency:</strong> ${request.urgency}</p>
          <p><strong>Location:</strong> ${request.address?.city || 'Near you'}</p>
        </div>
        <p>If you are available and eligible to donate, please respond to this request through the app.</p>
        <br>
        <p>Thank you for your life-saving contribution!</p>
      </div>
    `;

    // In production, you would send to actual donor emails
    console.log(`Notifying ${donors.length} donors about blood request`);
  }

  async sendRequestAcceptedNotification(request, acceptor) {
    const subject = 'Blood Request Accepted';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Blood Request Accepted</h2>
        <p>Your blood request has been accepted!</p>
        <div style="background: #f0f9ff; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p><strong>Accepted by:</strong> ${acceptor.name || acceptor.hospitalName}</p>
          <p><strong>Contact:</strong> ${acceptor.phone}</p>
          <p><strong>Blood Type:</strong> ${request.bloodType}</p>
          <p><strong>Units:</strong> ${request.units}</p>
        </div>
        <p>Please contact the acceptor to arrange the donation.</p>
      </div>
    `;

    // Get requester email and send
    // This would require fetching requester details
    console.log('Sending request accepted notification');
  }
}

export default new EmailService();