import nodemailer from 'nodemailer';

// 🔐 Always keep credentials in environment variables
// In Vercel or .env file:
// ZOHO_EMAIL=noreply@clyth.online
// ZOHO_PASS=your_app_password_here

const EMAIL = 'noreply@globaltravelglob.shop';
const PASSWORD = 'gpfUfb1D86g0';

// ✅ Zoho SMTP configuration
const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.in',
  port: 465,
  secure: true, // SSL
  auth: { user: EMAIL, pass: PASSWORD },
});

export default async function handler(req, res) {
  const credit = 'Made by Anuj Sehrawat (tg: tg_anujsehrawat, insta: @a9x2k)';

  console.log('📨 Incoming request:', {
    method: req.method,
    query: req.query,
  });

  // Only allow GET requests
  if (req.method !== 'GET') {
    console.warn('❌ Invalid HTTP method:', req.method);
    return res.status(405).json({
      status: 'error',
      success: false,
      error: 'Only GET method allowed',
      credit,
    });
  }

  const {
    to,
    subject,
    message,
    isHtml = 'false',
    fromName = 'GlobalTravel',
  } = req.query;

  // Validate required fields
  if (!to || !subject || !message) {
    console.error('❌ Missing required query parameters:', {
      to,
      subject,
      message,
    });
    return res.status(400).json({
      status: 'error',
      success: false,
      error:
        'Missing required parameter(s): "to", "subject", and/or "message"',
      credit,
    });
  }

  // ✅ Reply disabled, HTML fully supported
  const mailOptions = {
    from: `"${fromName}" <${EMAIL}>`,
    to,
    subject,
    text: isHtml === 'true' ? '' : message,
    html: isHtml === 'true' ? message : '',
    headers: {
      'Reply-To': '', // disables replies
      'X-Auto-Response-Suppress': 'All', // prevents auto-replies
      'Auto-Submitted': 'auto-generated', // marks as system message
    },
  };

  console.log('📦 Sending email with options:', mailOptions);

  try {
    const info = await transporter.sendMail(mailOptions);
    const timestamp = Date.now();

    console.log('✅ Email sent successfully:', {
      messageId: info.messageId,
      accepted: info.accepted,
      response: info.response,
    });

    res.status(200).json({
      status: 'success',
      success: true,
      info: {
        messageId: info.messageId,
        accepted: info.accepted,
        response: info.response,
      },
      emailDetails: {
        fromEmail: EMAIL,
        fromName,
        to,
        subject,
        message,
        isHtml: isHtml === 'true',
        timestamp,
      },
      credit,
    });
  } catch (error) {
    console.error('❌ Failed to send email:', error.message);
    res.status(500).json({
      status: 'error',
      success: false,
      error: error.message,
      credit,
    });
  }
}
