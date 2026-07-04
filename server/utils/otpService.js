const nodemailer = require('nodemailer');
const twilio = require('twilio');

exports.sendEmailOtp = async (email, otp) => {
  if (process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.SMTP_EMAIL,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      const mailOptions = {
        from: `OAV Balarampur <${process.env.SMTP_EMAIL}>`,
        to: email,
        subject: 'Your OAV Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
            <h2 style="color: #4f46e5; text-align: center;">OAV Balarampur</h2>
            <p style="font-size: 16px; color: #333;">Hello,</p>
            <p style="font-size: 16px; color: #333;">Your email verification code is:</p>
            <div style="text-align: center; margin: 30px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e293b; background: #f8fafc; padding: 15px 30px; border-radius: 8px; border: 1px dashed #cbd5e1;">${otp}</span>
            </div>
            <p style="font-size: 14px; color: #64748b; text-align: center;">This code will expire in 10 minutes.</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
            <p style="font-size: 12px; color: #94a3b8; text-align: center;">If you didn't request this code, you can safely ignore this email.</p>
          </div>
        `,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`📧 REAL EMAIL SENT to ${email}`);
      console.log(`🌐 PREVIEW URL: ${nodemailer.getTestMessageUrl(info)}`);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email verification. Please check SMTP credentials or try again later.');
    }
  } else {
    // Graceful fallback to mock mode if no credentials provided
    console.log(`\n========================================`);
    console.log(`📧 MOCK EMAIL SENT`);
    console.log(`To: ${email}`);
    console.log(`Subject: Your OAV Verification Code`);
    console.log(`Body: Your email verification code is: ${otp}. It will expire in 10 minutes.`);
    console.log(`========================================\n`);
    return true;
  }
};

exports.sendSmsOtp = async (phone, otp) => {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
    try {
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      await client.messages.create({
        body: `Your OAV Balarampur verification code is: ${otp}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone,
      });
      console.log(`📱 REAL SMS SENT to ${phone}`);
      return true;
    } catch (error) {
      console.error('Error sending SMS:', error);
      throw new Error('Failed to send SMS verification. Please check your Twilio credentials or try again later.');
    }
  } else {
    // Graceful fallback to mock mode if no credentials provided
    console.log(`\n========================================`);
    console.log(`📱 MOCK SMS SENT`);
    console.log(`To: ${phone}`);
    console.log(`Message: Your OAV Balarampur verification code is: ${otp}`);
    console.log(`========================================\n`);
    return true;
  }
};
