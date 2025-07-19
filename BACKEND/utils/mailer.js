// import nodemailer from 'nodemailer';
// import dotenv from 'dotenv';
// dotenv.config();

// export const sendMail = async (to, subject, text) => {
//   try {
//     const transporter = nodemailer.createTransport({
//       host: process.env.MAILTRAP_SMTP_HOST,
//       port: process.env.MAILTRAP_SMTP_PORT,
//       auth: {
//         user: process.env.MAILTRAP_SMTP_USER,
//         pass: process.env.MAILTRAP_SMTP_PASS,
//       },
//     });

//     const info = await transporter.sendMail({
//       from: `"Inngest TMS" <noreply@inngest.com>`,
//       to,
//       subject,
//       text,
//     });

//     console.log("Message sent:", info.messageId);
//     return info;
//   } catch (error) {
//     console.error("Error sending email:", error.message);
//     throw new Error("Failed to send email");
//   }
// };

import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const sendMail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"TMS App" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      text,
    });

    console.log("Message sent: ", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error.message);
    throw new Error("Failed to send email");
  }
};
