import { createTransport } from "nodemailer";

export const sendEmail = async (data) => {
  if (!data.html && data.attachments?.length && !data.text) {
    throw new Error("Missing Email Content!");
  }

  const transporter = createTransport({
    service: "gmail",
    auth: {
      user: process.env.APP_EMAIL,
      pass: process.env.APP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  await transporter.sendMail({
    ...data,
    from: `"${process.env.APPLICATION_NAME}" <${process.env.APP_EMAIL}>`,
  });
};
