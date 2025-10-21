import User from "../../models/User.schema.js";
import jwt from "jsonwebtoken";
export default function isTypingHandler(io, socket) {
  return async ({ token, roomId, isTyping }) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;

      if (!userId || userId !== socket.userId) {
        return socket.emit("error", "Unauthorized");
      }

      const user = await User.findById(userId);

      // send typing status to other users in the room
      socket.to(roomId).emit("typing", {
        userId,
        userName: user.name,
        roomId,
        isTyping,
      });
    } catch (err) {
      console.error("Error in typing event:", err);
    }
  };
}
