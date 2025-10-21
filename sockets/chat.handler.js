import joinRoomsHandler from "./chatEvents/joinRooms.handler.js";
import sendMessageHandler from "./chatEvents/sendMessage.handler.js";
import unreadCountHandler from "./chatEvents/unreadCount.handler.js";
import isTypingHandler from "./chatEvents/isTyping.handler.js";
import markMessageReadHandler from "./chatEvents/markMessageRead.handler.js";

export const handleChatEvents = (io, socket) => {
  // register and join rooms when connecting
  socket.on("join-rooms", joinRoomsHandler(io, socket));

  // send message
  socket.on("send-message", sendMessageHandler(io, socket));

  // mark message as read
  socket.on("mark-message-read", markMessageReadHandler(io, socket, "message"));

  // mark chatroom messages as read
  socket.on(
    "mark-room-read",
    markMessageReadHandler(io, socket, "last-message")
  );

  // get unread count for a room
  socket.on("get-unread-count", unreadCountHandler(io, socket));

  // real-time typing
  socket.on("is-typing", isTypingHandler(io, socket));
};
