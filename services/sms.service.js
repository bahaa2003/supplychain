import renderTemplate from "../utils/templateRenderer";
import NotificationSettings from "../models/NotificationSettings";

async function sendSms(templateName, data, users) {
  for (const user of users) {
    const settings = await NotificationSettings.findOne({ user: user._id });
    if (settings?.sms.enabled) {
      const message = renderTemplate("sms", templateName, data);

      // integrate with an SMS service here
      // For demonstration, we'll just log the message
      console.log(`Sending SMS to ${user.phone}: ${message}`);
    }
  }
}
module.exports = sendSms;
