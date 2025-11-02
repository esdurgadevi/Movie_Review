import nodemailer from "nodemailer";

export const sendVerificationEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const message = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code for verification is ${otp}. It is valid for 5 minutes.`,
  };

  await transporter.sendMail(message);
};
