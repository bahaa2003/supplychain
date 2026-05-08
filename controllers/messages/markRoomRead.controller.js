import ChatRoom from "../../models/chatRoom.schema.js";
import Message from "../../models/Message.schema.js";
import { AppError } from "../../utils/AppError.js";

export const markRoomRead = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { chatRoomId } = req.params;

    // check if the chat room exists
    const chatRoom = await ChatRoom.findById(chatRoomId);
    if (!chatRoom) {
      return next(new AppError("Chat room not found", 404));
    }

    // update all messages in the room to remove the user from notRead array
    const result = await Message.updateMany(
      {
        chatRoom: chatRoomId,
        notRead: userId,
        sender: { $ne: userId }, // not sent by the user himself
      },
      {
        $pull: { notRead: userId },
      }
    );

    // if we want to notify other users in real-time via websockets
    // req.app.get('io').to(chatRoomId).emit('messages-read', {
    //   chatRoomId: chatRoomId,
    //   readBy: userId,
    //   count: result.modifiedCount,
    // });

    res.status(200).json({
      status: "success",
      data: {
        chatRoomId,
        markedAsReadCount: result.modifiedCount,
        message: `${result.modifiedCount} message(s) marked as read`,
      },
    });
  } catch (err) {
    next(
      new AppError(
        err.message || "Failed to mark messages as read",
        err.statusCode || 500
      )
    );
  }
};
