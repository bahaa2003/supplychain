import joinChatAndNotificationRoomsHandler from "./chatEvents/joinChatAndNotificationRooms.handler.js";
import sendMessageHandler from "./chatEvents/sendMessage.handler.js";
import unreadCountHandler from "./chatEvents/unreadCount.handler.js";
import isTypingHandler from "./chatEvents/isTyping.handler.js";
import markMessageReadHandler from "./chatEvents/markMessageRead.handler.js";

export const handleChatEvents = (io, socket) => {
  socket.on(
    "join-chat-and-notification-rooms",
    joinChatAndNotificationRoomsHandler(io, socket)
  );

  socket.on("send-message", sendMessageHandler(io, socket));

  socket.on("mark-message-read", markMessageReadHandler(io, socket, "message"));

  socket.on(
    "mark-room-read",
    markMessageReadHandler(io, socket, "last-message")
  );

  socket.on("get-unread-count", unreadCountHandler(io, socket));

  socket.on("is-typing", isTypingHandler(io, socket));
};
