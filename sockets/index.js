import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import { handleChatEvents } from "./chat.handler.js";
import { handleNotificationEvents } from "./notification.handler.js";

const connectedUsers = new Map();

export const initRealtime = (server) => {
  const io = new Server(server, {
    cors: { origin: process.env.FRONTEND_URL || "*" },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("register", ({ token }) => {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;
        socket.userId = userId;
        connectedUsers.set(userId, socket.id);
        console.log(`Registered user ${userId} on socket ${socket.id}`);
      } catch (err) {
        console.error("Invalid token on socket register");
        socket.disconnect();
      }
    });

    handleChatEvents(io, socket);
    handleNotificationEvents(io, socket);

    socket.on("disconnect", () => {
      for (const [userId, socketId] of connectedUsers.entries()) {
        if (socketId === socket.id) {
          connectedUsers.delete(userId);
          console.log(`User ${userId} disconnected`);
          break;
        }
      }
    });
  });
};

export const getIO = () => io;
export const getConnectedUsers = () => connectedUsers;
