import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendPasswordResetCode(email: string, code: string): Promise<boolean> {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@holding.com.tr',
      to: email,
      subject: 'Şifre Sıfırlama Kodu - Holding Şirketi',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Şifre Sıfırlama Kodu</h2>
          <p>Merhaba,</p>
          <p>Şifre sıfırlama talebiniz alınmıştır. Aşağıdaki kodu kullanarak şifrenizi sıfırlayabilirsiniz:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #313131; font-size: 32px; letter-spacing: 5px; margin: 0;">${code}</h1>
          </div>
          <p>Bu kod 10 dakika geçerlidir.</p>
          <p>Eğer bu talebi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
          <p>Saygılarımızla,<br>Holding Şirketi</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email gönderme hatası:', error);
    return false;
  }
}
