const SibApiV3Sdk = require('sib-api-v3-sdk');

const sendOTPEmail = async (toEmail, otp, userName) => {
  const defaultClient = SibApiV3Sdk.ApiClient.instance;
  const apiKey = defaultClient.authentications['api-key'];
  apiKey.apiKey = process.env.BREVO_API_KEY;

  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  const sendSmtpEmail = {
    to: [{ email: toEmail }],
    sender: { email: 'satyam.singh.931559@gmail.com', name: 'SkillSync' },
    subject: `${otp} - Your SkillSync Password Reset OTP`,
    htmlContent: `<h2>Hi ${userName}</h2><p>Your OTP is: <strong>${otp}</strong></p><p>Expires in 10 minutes.</p>`
  };

  await apiInstance.sendTransacEmail(sendSmtpEmail);
  console.log('OTP email sent to ' + toEmail);
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

module.exports = { generateOTP, sendOTPEmail };
