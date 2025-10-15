import Message from "../../models/Message.schema.js";
import ChatRoom from "../../models/chatRoom.schema.js";

import { AppError } from "../../utils/AppError.js";

export const getChatRoomMessages = async (req, res, next) => {
  try {
    const userCompanyId = req.user.company?._id || req.user.company;
    const { chatRoomId } = req.params;
    const { before, sort = -1, limit = 20 } = req.query;

    const filter = { chatRoom: chatRoomId };
    if (before) filter.createdAt = { $lt: new Date(before) };

    const messages = await Message.find(filter)
      .sort({ createdAt: sort })
      .limit(limit);

    const notReadCount = await Message.countDocuments({
      chatRoom: chatRoomId,
      notRead: userCompanyId,
    });

    res.status(200).json({
      status: "success",
      data: {
        messages,
        notReadCount,
      },
    });
  } catch (err) {
    next(
      new AppError(err.message || "Failed to get messages for the company", 500)
    );
  }
};
