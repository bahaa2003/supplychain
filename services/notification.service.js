import { createAndEmitNotification } from "../sockets/notification.handler.js";
import { getIO, getConnectedUsers } from "../sockets/index.js";

export default async function createNotification(type, data, recipients) {
  await createAndEmitNotification(
    getIO(),
    getConnectedUsers(),
    type,
    data,
    recipients
  );
}
