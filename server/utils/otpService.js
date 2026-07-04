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
        text: `Your OAV Balarampur verification code is: ${otp}\n\nThis code will expire in 10 minutes.`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td align="center">
                  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px 30px; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                    <h2 style="color: #4f46e5; text-align: center; margin-top: 0; font-size: 24px; margin-bottom: 25px;">OAV Balarampur</h2>
                    <p style="font-size: 16px; color: #334155; line-height: 1.5; margin-bottom: 10px;">Hello,</p>
                    <p style="font-size: 16px; color: #334155; line-height: 1.5; margin-bottom: 25px;">Your email verification code is:</p>
                    <div style="text-align: center; margin: 30px 0;">
                      <span style="display: inline-block; font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #0f172a; background: #f1f5f9; padding: 20px 40px; border-radius: 10px; border: 2px dashed #cbd5e1;">${otp}</span>
                    </div>
                    <p style="font-size: 14px; color: #64748b; text-align: center; margin-top: 30px;">This code will expire in 10 minutes.</p>
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
                    <p style="font-size: 12px; color: #94a3b8; text-align: center; line-height: 1.6;">If you didn't request this code, you can safely ignore this email.</p>
                  </div>
                </td>
              </tr>
            </table>
          </body>
          </html>
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
