import Message from "../../models/Message.schema.js";
import ChatRoomStatus from "../../models/ChatRoomStatus.schema.js";
import jwt from "jsonwebtoken";

export default function markMessageReadHandler(
  io,
  socket,
  readType = "message"
) {
  return async (data) => {
    try {
      const { token } = data;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;

      if (!userId || userId !== socket.userId) {
        return socket.emit("error", "Unauthorized");
      }

      let targetMessage;
      let targetRoomId;

      // if readType is "last-message", get the last message in the room
      if (readType === "last-message") {
        const { roomId } = data;

        if (!roomId) {
          return socket.emit("error", "Room ID is required for mark-room-read");
        }

        // get last message in the room (excluding messages from the user)
        targetMessage = await Message.findOne({
          chatRoom: roomId,
          sender: { $ne: userId },
        }).sort({ createdAt: -1 });

        if (!targetMessage) {
          // no messages to mark as read (room is empty or only user's messages)
          return socket.emit("room-read-confirmed", {
            roomId: roomId,
            unreadCount: 0,
          });
        }
        targetRoomId = roomId;
      } else {
        // readType is "message", mark specific message as read
        const { messageId } = data;

        if (!messageId) {
          return socket.emit(
            "error",
            "Message ID is required for mark-message-read"
          );
        }

        targetMessage = await Message.findById(messageId);
        if (!targetMessage) {
          return socket.emit("error", "Message not found");
        }
        targetRoomId = targetMessage.chatRoom;
      }

      // check that the user is not the sender
      if (targetMessage.sender.toString() === userId) {
        return; // the sender does not update the message status
      }

      // update or create ChatRoomStatus
      const chatRoomStatus = await ChatRoomStatus.findOneAndUpdate(
        { chatRoom: targetRoomId, user: userId },
        {
          lastReadAt: new Date(),
          lastReadMessage: targetMessage._id,
        },
        { upsert: true, new: true }
      );

      // calculate unread count after this read
      const unreadCount = await Message.countDocuments({
        chatRoom: targetRoomId,
        sender: { $ne: userId },
        createdAt: { $gt: targetMessage.createdAt },
      });

      // notify all users in the room about the read status
      socket.broadcast.to(targetRoomId.toString()).emit("message-read", {
        messageId: targetMessage._id,
        readBy: userId,
        roomId: targetRoomId,
        lastReadAt: chatRoomStatus.lastReadAt,
        readType: readType,
      });

      // send confirmation to user based on readType
      if (readType === "last-message") {
        socket.emit("room-read-confirmed", {
          roomId: targetRoomId,
          lastReadMessage: targetMessage._id,
          unreadCount: unreadCount,
        });
        console.log(
          `Room ${targetRoomId} marked as fully read by user ${userId}. Remaining unread: ${unreadCount}`
        );
      } else {
        socket.emit("message-read-confirmed", {
          messageId: targetMessage._id,
          roomId: targetRoomId,
          unreadCount: unreadCount,
        });
        console.log(
          `Message ${messageId} marked as read by user ${userId}. Remaining unread: ${unreadCount}`
        );
      }
    } catch (err) {
      console.error("Error marking message as read:", err);
      socket.emit("error", "Failed to mark message as read");
    }
  };
}
