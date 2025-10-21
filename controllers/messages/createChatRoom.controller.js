import Message from "../../models/Message.schema.js";
import ChatRoom from "../../models/ChatRoom.schema.js";
import { AppError } from "../../utils/AppError.js";

export const createChatRoom = async (req, res, next) => {
  try {
    const userCompanyId = req.user.company?._id || req.user.company;

    res.status(200).json({
      status: "success",
    });
  } catch (err) {
    next(
      new AppError(err.message || "Failed to get messages for the user", 500)
    );
  }
};
