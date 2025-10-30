// utils/notifications.js
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransporter({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendEmailNotification = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html
    });
  } catch (error) {
    console.error('Email sending error:', error);
  }
};

export const notifyBloodRequest = async (donors, request) => {
  const subject = 'New Blood Request in Your Area';
  const html = `
    <h2>New Blood Request</h2>
    <p>Blood Type: ${request.bloodType}</p>
    <p>Units Needed: ${request.units}</p>
    <p>Urgency: ${request.urgency}</p>
    <p>Location: ${request.address?.city || 'Near you'}</p>
    <a href="${process.env.FRONTEND_URL}/requests/${request._id}">View Request</a>
  `;

  // In a real application, you'd send to actual donor emails
  // This is a simplified version
  console.log(`Notifying ${donors.length} donors about new blood request`);
};