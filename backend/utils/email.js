const nodemailer = require("nodemailer");

const emailConfigured = Boolean(process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS);

let transporter = null;
if (emailConfigured) {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: Number(process.env.EMAIL_PORT) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

/**
 * Sends an email if SMTP is configured in .env. If not configured, logs the
 * content to the server console instead (useful for local development before
 * a real email account is set up) and never throws.
 */
const sendEmail = async ({ to, subject, html }) => {
  if (!emailConfigured) {
    console.log("\n===== EMAIL NOT SENT (no SMTP configured in .env) =====");
    console.log("To:", to);
    console.log("Subject:", subject);
    console.log(html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
    console.log("=========================================================\n");
    return { sent: false };
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    html,
  });
  return { sent: true };
};

module.exports = { sendEmail, emailConfigured };
