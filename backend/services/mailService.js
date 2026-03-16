const nodemailer = require('nodemailer');

function createTransporter() {
  if (process.env.MAIL_HOST && process.env.MAIL_USER && process.env.MAIL_PASS) {
    return nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT || 587),
      secure: process.env.MAIL_SECURE === 'true',
      connectionTimeout: Number(process.env.MAIL_CONNECTION_TIMEOUT || 10000),
      greetingTimeout: Number(process.env.MAIL_GREETING_TIMEOUT || 10000),
      socketTimeout: Number(process.env.MAIL_SOCKET_TIMEOUT || 15000),
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS.replace(/\s+/g, '')
      }
    });
  }

  return nodemailer.createTransport({ jsonTransport: true });
}

async function sendOtpEmail({ to, otp, purpose, name }) {
  const transporter = createTransporter();
  const title = purpose === 'register' ? 'Verify your Pizza Store account' : 'Your Pizza Store login OTP';
  const intro = purpose === 'register'
    ? `Hello ${name || 'there'}, welcome to Pizza Store.`
    : `Hello ${name || 'there'}, use this OTP to complete your login.`;

  const mailOptions = {
    from: process.env.MAIL_FROM || process.env.MAIL_USER || 'no-reply@pizzastore.local',
    to,
    subject: title,
    text: `${intro}\n\nYour OTP is ${otp}.\nIt will expire in 10 minutes.\n\nIf you did not request this, you can ignore this email.`
  };

  try {
    const info = await transporter.sendMail(mailOptions);

    if (!process.env.MAIL_HOST || !process.env.MAIL_USER || !process.env.MAIL_PASS) {
      console.log(`[MAIL PREVIEW] OTP for ${to}: ${otp}`);
      console.log(info.message?.toString?.() || '');
    }

    return info;
  } catch (error) {
    console.error('[MAIL] OTP email failed:', error.message);

    if (!process.env.MAIL_HOST || !process.env.MAIL_USER || !process.env.MAIL_PASS) {
      throw new Error('OTP email service is not configured on the server');
    }

    if (error.code === 'EAUTH') {
      throw new Error('OTP email login failed. Check MAIL_USER and MAIL_PASS');
    }

    if (error.code === 'ETIMEDOUT' || error.code === 'ESOCKET' || error.code === 'ECONNECTION') {
      throw new Error('OTP email service timed out. Please try again');
    }

    throw new Error('Unable to send OTP email right now');
  }
}

module.exports = { sendOtpEmail };
