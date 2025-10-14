import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import { handleChatEvents } from "./chat.handler.js";
import { handleNotificationEvents } from "./notification.handler.js";

let io;
export const initRealtime = (server) => {
  io = new Server(server, {
    cors: { origin: process.env.FRONTEND_URL || "*" },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("register", ({ token }) => {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;
        const notificationRoom = `notification-${userId}`;
        socket.join(notificationRoom);
        socket.userId = userId;
        console.log(
          `Registered user ${userId} on notification room socket ${notificationRoom}`
        );
      } catch (err) {
        console.error("Invalid token on socket register");
        socket.disconnect();
      }
    });

    handleChatEvents(io, socket);
    handleNotificationEvents(io, socket);

    socket.on("disconnect", () => {
      console.log(`User ${socket.userId} disconnected`);
    });
  });
};

export const getIO = () => io;
