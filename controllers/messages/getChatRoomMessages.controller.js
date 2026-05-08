import Message from "../../models/Message.schema.js";
import ChatRoom from "../../models/chatRoom.schema.js";
import User from "../../models/User.schema.js";
import Company from "../../models/Company.schema.js";
import PartnerConnection from "../../models/PartnerConnection.schema.js";
import { roles } from "../../enums/role.enum.js";
import { partnerConnectionStatus } from "../../enums/partnerConnectionStatus.enum.js";
import { AppError } from "../../utils/AppError.js";

async function checkReadPermission(user, chatRoom) {
  try {
    switch (chatRoom.type) {
      case "platform_to_company":
        if (user.role === roles.PLATFORM_ADMIN) return true;
        if (user.role === roles.ADMIN || user.role === roles.MANAGER) {
          const company = await Company.findOne({
            _id: user.company,
            chatRoom: chatRoom._id,
          });
          return !!company;
        }
        return false;

      case "company_to_company":
        if (user.role === roles.ADMIN || user.role === roles.MANAGER) {
          const connection = await PartnerConnection.findOne({
            chatRoom: chatRoom._id,
            status: partnerConnectionStatus.ACTIVE,
            $or: [{ requester: user.company }, { recipient: user.company }],
          });
          return !!connection;
        }
        return false;

      case "in_company":
        if (user.role === roles.STAFF) {
          return user.chatRoom?.toString() === chatRoom._id.toString();
        }

        if (user.role === roles.ADMIN || user.role === roles.MANAGER) {
          const staffUser = await User.findOne({
            chatRoom: chatRoom._id,
            company: user.company,
            role: roles.STAFF,
          });
          return !!staffUser;
        }
        return false;

      default:
        return false;
    }
  } catch (err) {
    console.error("Error checking read permission:", err);
    return false;
  }
}

export const getChatRoomMessages = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { chatRoomId } = req.params;
    const { before, sort = -1, limit = 20 } = req.query;

    const chatRoom = await ChatRoom.findById(chatRoomId);
    if (!chatRoom) {
      return next(new AppError("Chat room not found", 404));
    }

    // check if the user has permission to read this chat room
    const canRead = await checkReadPermission(req.user, chatRoom);
    if (!canRead) {
      return next(
        new AppError("You don't have permission to read this chat room", 403)
      );
    }

    const filter = { chatRoom: chatRoomId };
    if (before) filter.createdAt = { $lt: new Date(before) };

    // fetch messages with sender details
    const messages = await Message.find(filter)
      .populate("sender", "name email role avatar")
      .sort({ createdAt: sort })
      .limit(parseInt(limit));

    // count unread messages for the user in this chat room
    const notReadCount = await Message.countDocuments({
      chatRoom: chatRoomId,
      notRead: userId,
    });

    res.status(200).json({
      status: "success",
      data: {
        messages,
        notReadCount,
        hasMore: messages.length === parseInt(limit), // for pagination
      },
    });
  } catch (err) {
    next(
      new AppError(err.message || "Failed to get messages for the user", 500)
    );
  }
};
