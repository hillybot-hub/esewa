// config/email.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const createTransporter = () => {
  return nodemailer.createTransporter({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

export const emailTemplates = {
  welcome: (user) => ({
    subject: `Welcome to BloodDonation, ${user.name}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #dc2626; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">BloodDonation</h1>
        </div>
        <div style="padding: 20px;">
          <h2>Welcome, ${user.name}!</h2>
          <p>Thank you for joining our community of life-savers. Your registration as a <strong>${user.role}</strong> has been successfully completed.</p>
          
          <div style="background: #f8fafc; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #dc2626; margin-top: 0;">What you can do now:</h3>
            <ul>
              ${user.role === 'donor' ? '<li>Update your medical profile</li>' : ''}
              ${user.role === 'donor' ? '<li>Respond to blood requests in your area</li>' : ''}
              ${user.role === 'hospital' ? '<li>Manage your blood inventory</li>' : ''}
              ${user.role === 'hospital' ? '<li>Create and track blood requests</li>' : ''}
              ${user.role === 'receiver' ? '<li>Request blood donations when needed</li>' : ''}
              <li>Track your donation/request history</li>
              <li>Connect with other members in your community</li>
            </ul>
          </div>
          
          <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              Best regards,<br>
              The BloodDonation Team<br>
              <a href="mailto:support@blooddonation.com" style="color: #dc2626;">support@blooddonation.com</a>
            </p>
          </div>
        </div>
      </div>
    `
  }),

  bloodRequest: (request, donor) => ({
    subject: `Urgent: Blood Donation Request - ${request.bloodType} Needed`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #dc2626; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Blood Donation Request</h1>
        </div>
        <div style="padding: 20px;">
          <h2>Your Help is Needed!</h2>
          <p>Hello ${donor.name},</p>
          <p>There is an urgent need for blood donation in your area that matches your blood type <strong>${donor.bloodType}</strong>.</p>
          
          <div style="background: #fef2f2; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #dc2626; margin-top: 0;">Request Details:</h3>
            <p><strong>Blood Type:</strong> ${request.bloodType}</p>
            <p><strong>Units Needed:</strong> ${request.units}</p>
            <p><strong>Urgency:</strong> <span style="color: #dc2626; font-weight: bold;">${request.urgency.toUpperCase()}</span></p>
            <p><strong>Location:</strong> ${request.address?.city || 'Your area'}</p>
            ${request.reason ? `<p><strong>Reason:</strong> ${request.reason}</p>` : ''}
          </div>
          
          <p>If you are eligible and available to donate, please respond to this request through the app as soon as possible.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/requests/${request._id}" 
               style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Request Details
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">
            Thank you for considering this request. Your donation can save lives!<br><br>
            BloodDonation System
          </p>
        </div>
      </div>
    `
  }),

  requestAccepted: (request, acceptor) => ({
    subject: 'Your Blood Request Has Been Accepted!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #10b981; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Request Accepted!</h1>
        </div>
        <div style="padding: 20px;">
          <h2>Great News!</h2>
          <p>Your blood request has been accepted by a donor.</p>
          
          <div style="background: #f0fdf4; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #10b981; margin-top: 0;">Acceptance Details:</h3>
            <p><strong>Accepted by:</strong> ${acceptor.name || acceptor.hospitalName}</p>
            <p><strong>Contact:</strong> ${acceptor.phone}</p>
            <p><strong>Blood Type:</strong> ${request.bloodType}</p>
            <p><strong>Units:</strong> ${request.units}</p>
          </div>
          
          <p>Please contact the donor/hospital to arrange the donation process.</p>
          
          <div style="background: #fffbeb; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h4 style="color: #d97706; margin-top: 0;">Next Steps:</h4>
            <ol>
              <li>Contact the acceptor to confirm details</li>
              <li>Arrange a meeting time and location</li>
              <li>Complete the donation process</li>
              <li>Update the request status in the app</li>
            </ol>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">
            If you have any questions, please contact our support team.<br><br>
            BloodDonation System
          </p>
        </div>
      </div>
    `
  })
};

export default createTransporter;