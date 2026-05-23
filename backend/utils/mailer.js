const nodemailer = require("nodemailer");

const requiredSmtpKeys = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"];

const isSmtpConfigured = () => {
  return requiredSmtpKeys.every((key) => Boolean(process.env[key]));
};

const getAppUrl = () => {
  return process.env.FRONTEND_URL || "http://localhost:5173";
};

const sendPasswordResetEmail = async ({ email, name, resetLink }) => {
  if (!isSmtpConfigured()) {
    return { sent: false, reason: "smtp-not-configured" };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  await transporter.sendMail({
    from,
    to: email,
    subject: "Reset your SYNAR password",
    text: [
      `Hi ${name || "there"},`,
      "",
      "We received a request to reset your SYNAR password.",
      `Open this link to set a new password: ${resetLink}`,
      "",
      "This link expires in 30 minutes. If you did not request it, you can ignore this email.",
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
        <h2>Reset your SYNAR password</h2>
        <p>Hi ${name || "there"},</p>
        <p>We received a request to reset your SYNAR password.</p>
        <p>
          <a href="${resetLink}" style="display: inline-block; padding: 12px 18px; border-radius: 10px; background: #f97316; color: #ffffff; text-decoration: none; font-weight: 700;">
            Set new password
          </a>
        </p>
        <p>This link expires in 30 minutes. If you did not request it, you can ignore this email.</p>
      </div>
    `,
  });

  return { sent: true };
};

module.exports = { getAppUrl, isSmtpConfigured, sendPasswordResetEmail };
