import Message from "../../models/Message.schema.js";
import ChatRoomStatus from "../../models/ChatRoomStatus.schema.js";
import jwt from "jsonwebtoken";

export default function unreadCountHandler(io, socket) {
  return async ({ token, roomId }) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;

      // get user's room status
      const roomStatus = await ChatRoomStatus.findOne({
        chatRoom: roomId,
        user: userId,
      });

      let unreadCount = 0;

      // if user has no status in this room, return 0
      if (!roomStatus || !roomStatus.lastReadMessage) {
        // count all messages in the room that are not sent by this user
        unreadCount = await Message.countDocuments({
          chatRoom: roomId,
          sender: { $ne: userId },
        });
      } else {
        // get the last read message
        const lastReadMessage = await Message.findById(
          roomStatus.lastReadMessage
        );

        if (lastReadMessage) {
          // count messages after the last read message
          unreadCount = await Message.countDocuments({
            chatRoom: roomId,
            sender: { $ne: userId },
            createdAt: { $gt: lastReadMessage.createdAt },
          });
        } else {
          // if last read message was deleted, count all messages after lastReadAt
          unreadCount = await Message.countDocuments({
            chatRoom: roomId,
            sender: { $ne: userId },
            createdAt: { $gt: roomStatus.lastReadAt || new Date(0) },
          });
        }
      }

      socket.emit("unread-count", {
        roomId: roomId,
        count: unreadCount,
      });

      console.log(
        `Unread count for user ${userId} in room ${roomId}: ${unreadCount}`
      );
    } catch (err) {
      console.error("Error getting unread count:", err);
      socket.emit("error", "Failed to get unread count");
    }
  };
}
