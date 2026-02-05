import nodemailer from "nodemailer";
import { getSetting } from "@/lib/settings";

export async function getTransportFromSettings() {
  const host = await getSetting("smtp.host");
  const port = Number(await getSetting("smtp.port", "587"));
  const secure = (await getSetting("smtp.secure", "0")) === "1";
  const user = await getSetting("smtp.user");
  const pass = await getSetting("smtp.pass");

  if (!host || !user || !pass) {
    throw new Error("SMTP is not configured in Settings → SMTP");
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
  const transporter = await getTransportFromSettings();
  const from = await getSetting("smtp.from", "CXO Media <no-reply@example.com>");
  const siteName = args.siteName || "CXO Media";

  await transporter.sendMail({
    from,
    to: args.to,
    subject: `Set your password for ${siteName}`,
    text: `Username: ${args.username}\n\nSet password:\n${args.setPasswordUrl}\n`,
    html: `<p><b>Username:</b> ${args.username}</p><p><a href="${args.setPasswordUrl}">Set Password</a></p>`,
  });
}
