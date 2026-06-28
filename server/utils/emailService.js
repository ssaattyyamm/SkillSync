const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTPEmail = async (toEmail, otp, userName) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"SkillSync 🚀" <satyam.singh.931559@gmail.com>`,
    to: toEmail,
    subject: `${otp} — Your SkillSync Password Reset OTP`,
    html: `
      <div style="background:#0f1117;padding:40px;font-family:Arial,sans-serif;">
        <div style="max-width:480px;margin:0 auto;background:#1c2333;border-radius:16px;padding:36px;border:1px solid #2a3350;">
          <h2 style="color:#e8eaf0;">Hi ${userName} 👋</h2>
          <p style="color:#8892a4;">Your SkillSync password reset OTP is:</p>
          <div style="background:#0f1117;border:2px dashed #4f8ef7;border-radius:12px;padding:24px;text-align:center;margin:24px 0;">
            <div style="font-size:42px;font-weight:800;letter-spacing:12px;color:#4f8ef7;font-family:monospace;">
              ${otp}
            </div>
            <p style="color:#4e5a70;font-size:12px;margin:8px 0 0;">Expires in 10 minutes</p>
          </div>
          <p style="color:#f59e0b;font-size:13px;">⚠️ Do not share this OTP with anyone.</p>
          <p style="color:#4e5a70;font-size:12px;">If you did not request this, ignore this email.</p>
        </div>
      </div>
    `
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`✅ OTP email sent to ${toEmail}`);
  return info;
};

module.exports = { generateOTP, sendOTPEmail };
