import Message from "../../models/Message.schema.js";
import ChatRoom from "../../models/ChatRoom.schema.js";
import ChatRoomStatus from "../../models/ChatRoomStatus.schema.js";
import User from "../../models/User.schema.js";
import Company from "../../models/Company.schema.js";
import PartnerConnection from "../../models/PartnerConnection.schema.js";
import { roles } from "../../enums/role.enum.js";
import { partnerConnectionStatus } from "../../enums/partnerConnectionStatus.enum.js";
import jwt from "jsonwebtoken";

export default function sendMessageHandler(io, socket) {
  return async ({ token, messageId, roomId, content }) => {
    try {
      console.log(
        "send-message event received for room:",
        roomId,
        "content:",
        content,
        "from user:",
        jwt.verify(token, process.env.JWT_SECRET).id
      );

      // verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;

      if (!content?.trim()) {
        return socket.emit("error", messageId, "Message content is required");
      }

      // get user data and room data
      const user = await User.findById(userId).populate("company");
      const chatRoom = await ChatRoom.findById(roomId);

      if (!user || !chatRoom) {
        return socket.emit("error", messageId, "User or room not found");
      }

      console.log(`User ${userId} sending message to room ${roomId}`);

      // check send permission in the room
      const canSend = await checkSendPermission(user, chatRoom);
      if (!canSend) {
        return socket.emit(
          "error",
          messageId,
          "You don't have permission to send messages in this room"
        );
      }

      console.log(`User ${userId} has permission to send in room ${roomId}`);

      // get all participants in the room
      const allParticipants = await getRoomParticipants(chatRoom);

      // create message
      const message = await Message.create({
        chatRoom: roomId,
        sender: userId,
        content: content.trim(),
      });

      // update sender's ChatRoomStatus
      await ChatRoomStatus.findOneAndUpdate(
        { chatRoom: roomId, user: userId },
        {
          lastReadAt: new Date(),
          lastReadMessage: message._id,
        },
        { upsert: true }
      );

      // get message with sender data
      const populatedMessage = await Message.findById(message._id)
        .populate("sender", "name email role avatar")
        .populate("chatRoom");

      // send message to all connected users in the room
      socket.broadcast.to(roomId).emit("new-message", {
        _id: populatedMessage._id,
        content: populatedMessage.content,
        sender: populatedMessage.sender,
        chatRoom: roomId,
        createdAt: populatedMessage.createdAt,
      });

      // send confirmation to sender only
      socket.emit("message-sent", {
        _id: populatedMessage._id,
        content: populatedMessage.content,
        messageId,
        chatRoom: roomId,
        createdAt: populatedMessage.createdAt,
        status: "sent",
      });

      console.log(`Message sent in room ${roomId} by user ${userId}`);
    } catch (err) {
      console.error("Error sending message:", err);
      socket.emit("error", err.message || "Failed to send message");
    }
  };
}

async function getRoomParticipants(chatRoom) {
  const participants = [];

  if (chatRoom.type === "company_to_company") {
    const connection = await PartnerConnection.findOne({
      chatRoom: chatRoom._id,
    });
    if (connection) {
      const users = await User.find({
        company: { $in: [connection.recipient, connection.requester] },
        role: { $in: [roles.COMPANY_ADMIN, roles.COMPANY_MANAGER] },
      });
      participants.push(...users);
    }
  } else if (chatRoom.type === "platform_to_company") {
    const platformAdmins = await User.find({
      role: roles.PLATFORM_ADMIN,
    });
    const company = await Company.findOne({ chatRoom: chatRoom._id });
    if (company) {
      const companyUsers = await User.find({
        company: company._id,
        role: { $in: [roles.COMPANY_ADMIN, roles.COMPANY_MANAGER] },
      });
      participants.push(...platformAdmins, ...companyUsers);
    }
  } else if (chatRoom.type === "in_company") {
    const staff = await User.findOne({
      chatRoom: chatRoom._id,
    });
    const users = await User.find({
      company: staff.company,
      role: { $in: [roles.COMPANY_ADMIN, roles.COMPANY_MANAGER] },
    });
    participants.push(...users, staff);
  }

  return participants.map((u) => u._id.toString());
}

// function to check send permission
async function checkSendPermission(user, chatRoom) {
  try {
    switch (chatRoom.type) {
      case "platform_to_company":
        // only platform_admin and admin of the company
        if (user.role === roles.PLATFORM_ADMIN) return true;
        if (user.role === roles.ADMIN) {
          const company = await Company.findOne({
            _id: user.company,
            chatRoom: chatRoom._id,
          });
          return !!company;
        }
        return false;

      case "company_to_company":
        // only admin and manager from the connected companies
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
        // staff can only talk with admin and manager of the company
        if (user.role === roles.STAFF) {
          // check that this is the user's personal room
          return user.chatRoom?.toString() === chatRoom._id.toString();
        }
        // admin and manager can reply to staff
        if (user.role === roles.ADMIN || user.role === roles.MANAGER) {
          // check that the room belongs to a staff in the same company
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
    console.error("Error checking send permission:", err);
    return false;
  }
}
