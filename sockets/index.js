import { Server } from "socket.io";
import { handleChatEvents } from "./chat.handler.js";

let io;
export const initRealtime = (server) => {
  io = new Server(server, {
    cors: { origin: process.env.FRONTEND_URL || "*" },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);
    handleChatEvents(io, socket);

    socket.on("disconnect", () => {
      console.log(`User ${socket.userId} disconnected`);
    });
  });
};

export const getIO = () => io;
