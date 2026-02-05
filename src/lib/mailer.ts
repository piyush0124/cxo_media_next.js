import nodemailer from "nodemailer";

function getTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || "587");
  const secure = String(process.env.SMTP_SECURE || "false") === "true";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error("SMTP not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

export async function sendSetPasswordEmail(args: {
  to: string;
  siteName?: string;
  setPasswordUrl: string;
  username: string;
}) {
  const transporter = getTransport();
  const from = process.env.MAIL_FROM || process.env.SMTP_USER || "no-reply@example.com";
  const siteName = args.siteName || "CXO Media";

  await transporter.sendMail({
    from,
    to: args.to,
    subject: `Set your password for ${siteName}`,
    text: `Hello,\n\nUsername: ${args.username}\n\nSet password:\n${args.setPasswordUrl}\n`,
    html: `<p><b>Username:</b> ${args.username}</p><p><a href="${args.setPasswordUrl}">Set Password</a></p>`,
  });
}
