const nodemailer = require("nodemailer");

const isMailConfigured = () =>
  Boolean(process.env.MAIL_HOST && process.env.MAIL_USER && process.env.MAIL_PASS);

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    const port = Number(process.env.MAIL_PORT) || 587;
    transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port,
      secure: port === 465,
      auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
    });
  }
  return transporter;
};

const siteUrl = () => (process.env.SITE_URL || process.env.FRONTEND_URL || "").replace(/\/+$/, "");

/**
 * Sends one message. Throws when mail is not configured so callers can decide
 * whether that is an error for them.
 */
const sendMail = async ({ to, bcc, subject, html, text, replyTo }) => {
  if (!isMailConfigured()) throw new Error("Mail is not configured");

  return getTransporter().sendMail({
    from: process.env.MAIL_FROM || `"TechCruncher" <${process.env.MAIL_USER}>`,
    to,
    bcc,
    subject,
    html,
    text,
    replyTo,
  });
};

module.exports = { sendMail, isMailConfigured, siteUrl };
