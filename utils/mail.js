const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');
const mongoose = require('mongoose'); 

CLIENT_ID = '14505838145-p2ctlj21gdci8jfnbvsmt7a6gro61b83.apps.googleusercontent.com';
CLIENT_SEC = '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';
REFRESH_TOKEN = '1//044aYfGwMrZ7uCgYIARAAGAQSNwF-L9Ir7ae1NzjAE7h9LwSbpprhZPV7T8YWtwkNqZcMWzYb8fewMovK1iyLnmuZ78u-zhnmJGA';
USER = 'padma.test.project@gmail.com';

// Create an OAuth2 client using your client credentials
const oAuth2Client = new OAuth2Client({
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SEC,
  redirectUri: 'https://developers.google.com/oauthplayground',
});
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

// Set up the Gmail API
const gmail = google.gmail({
  version: 'v1',
  auth: oAuth2Client,
});

// Create a function to send a verification email
async function sendVerificationEmail(recipientEmail, verificationToken) {
  try {
    // Get an access token for the OAuth2 client
    const { token } = await oAuth2Client.getAccessToken();

    // Create a nodemailer transporter using the Gmail API
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: USER,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SEC,
        refreshToken: REFRESH_TOKEN,
        accessToken: token,
      },
    });

    // Construct the verification link
    const verificationLink = `http://localhost:3000/library/api/users/verify-email/${verificationToken}`;

    // Set up the email data
    const mailOptions = {
      from: USER,
      to: recipientEmail,
      subject: 'Email Verification',
      html: `<p>Click <a href="${verificationLink}">here</a> to verify your email.</p>`
    };

    // Send the email using the nodemailer transporter
    const result = await transporter.sendMail(mailOptions);
    console.log('Verification email sent:', result);
  } catch (err) {
    console.error('Error sending verification email:', err);
  }
}


function isValidVerificationToken(token) {
    // Adjust these values based on your token requirements
    const minLength = 32; // Minimum token length
    const maxLength = 256; // Maximum token length

    // Regular expression to match alphanumeric characters
    const alphanumericRegex = /^[a-zA-Z0-9]+$/;

    return (
      token.length >= minLength &&
      token.length <= maxLength &&
      alphanumericRegex.test(token)
    );
  }


  // Create a function to send a password reset email
async function sendPasswordResetEmail(recipientEmail, resetToken) {
  try {
    // Get an access token for the OAuth2 client
    const { token } = await oAuth2Client.getAccessToken();
  // Send the password reset email
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: USER,
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SEC,
      refreshToken: REFRESH_TOKEN,
      accessToken: token,
    },
});

const resetLink = `http://localhost:3000/library/api/users/set-forgot-password/${resetToken}`;
const mailOptions = {
    from: USER,
    to: recipientEmail,
    subject: 'Password Reset',
    html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
};

 const result = await transporter.sendMail(mailOptions);
 console.log('Password reset email sent:', result);
} catch (error) {
  console.error('Error sending password reset email:', error);
}
};

  
module.exports = {
  sendVerificationEmail,
  isValidVerificationToken,
  sendPasswordResetEmail
};
