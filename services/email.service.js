import nodemailer from "nodemailer";
import renderTemplate from "../utils/templateRenderer.js";
import NotificationSettings from "../models/NotificationSettings.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "bahaamohammed012003@gmail.com",
    // pass: "pqpr hocv ylcl ilxp",
    pass: "pqprhocvylclilxp",
  },
});

export default async function sendEmail(templateName, data, users) {
  const subjects = {
    verifyEmail: "Welcome to ChainFlow!",
    resetPassword: "Password Reset Request",
    teamInvite: "You've been invited to join a team on ChainFlow!",
  };

  const userList = Array.isArray(users) ? users : [users];
  const html = renderTemplate("emails", templateName, data);
  for (const user of userList) {
    const settings = await NotificationSettings.findOne({ user: user._id });
    if (!settings?.email?.enabled) continue;
    console.log(process.env.NODEMAILER_USER, process.env.NODEMAILER_PASS);
    await transporter.sendMail({
      from: `"ChainFlow" <${process.env.NODEMAILER_USER}>`,
      to: user.email,
      subject: subjects[templateName] || "Notification from ChainFlow",
      html,
    });
  }
}
