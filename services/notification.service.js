import { createAndEmitNotification } from "../sockets/notification.handler.js";

export default async function createNotification(type, data, recipients) {
  await createAndEmitNotification(type, data, recipients);
}
