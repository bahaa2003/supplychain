// sockets/chat.handler.js
import Message from "../models/Message.schema.js";
import ChatRoom from "../models/chatRoom.schema.js";
import User from "../models/User.schema.js";
import Company from "../models/Company.schema.js";
import PartnerConnection from "../models/PartnerConnection.schema.js";
import { roles } from "../enums/role.enum.js";
import { partnerConnectionStatus } from "../enums/partnerConnectionStatus.enum.js";
import jwt from "jsonwebtoken";

export const handleChatEvents = (io, socket) => {
  // register and join rooms when connecting
  socket.on("join-rooms", async ({ token }) => {
    console.log("join-rooms event received");
    try {
      // verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;

      // get user data with company
      const user = await User.findById(userId).populate("company");
      if (!user) {
        return socket.emit("error", "User not found");
      }

      const roomsToJoin = [];

      // 1. personal chat room (for communication with admin and manager of the company)
      if (user.chatRoom) {
        roomsToJoin.push(user.chatRoom.toString());
        socket.join(user.chatRoom.toString());
      }

      // 2. company chat room with platform_admin
      if (user.role === roles.ADMIN && user.company?.chatRoom) {
        roomsToJoin.push(user.company.chatRoom.toString());
        socket.join(user.company.chatRoom.toString());
      }

      // 3. platform_admin rooms
      if (user.role === roles.PLATFORM_ADMIN) {
        // join all company rooms
        const companies = await Company.find({ chatRoom: { $exists: true } });
        for (const company of companies) {
          if (company.chatRoom) {
            roomsToJoin.push(company.chatRoom.toString());
            socket.join(company.chatRoom.toString());
          }
        }
      }

      // 4. company_to_company rooms for admin and manager
      if (user.role === roles.ADMIN || user.role === roles.MANAGER) {
        const connections = await PartnerConnection.find({
          $or: [
            { requester: user.company._id },
            { recipient: user.company._id },
          ],
          status: partnerConnectionStatus.ACTIVE,
          chatRoom: { $exists: true },
        });

        for (const connection of connections) {
          if (connection.chatRoom) {
            roomsToJoin.push(connection.chatRoom.toString());
            socket.join(connection.chatRoom.toString());
          }
        }
      }

      // 5. if manager, join rooms of staff in the same company
      if (user.role === roles.MANAGER) {
        const companyStaff = await User.find({
          company: user.company._id,
          role: roles.STAFF,
          chatRoom: { $exists: true },
        });

        for (const staff of companyStaff) {
          if (staff.chatRoom) {
            roomsToJoin.push(staff.chatRoom.toString());
            socket.join(staff.chatRoom.toString());
          }
        }
      }

      console.log(`User ${userId} joined rooms:`, roomsToJoin);
      socket.emit("roomsJoined", { rooms: roomsToJoin });
    } catch (err) {
      console.error("Error joining rooms:", err);
      socket.emit("error", "Failed to join rooms");
    }
  });

  // send message
  socket.on("send-message", async ({ token, roomId, content }) => {
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
        return socket.emit("error", "Message content is required");
      }

      // get user data and room data
      const user = await User.findById(userId).populate("company");
      const chatRoom = await ChatRoom.findById(roomId);

      if (!user || !chatRoom) {
        return socket.emit("error", "User or room not found");
      }

      console.log(`User ${userId} sending message to room ${roomId}`);

      // check send permission in the room
      const canSend = await checkSendPermission(user, chatRoom);
      if (!canSend) {
        return socket.emit(
          "error",
          "You don't have permission to send messages in this room"
        );
      }

      console.log(`User ${userId} has permission to send in room ${roomId}`);

      // get all participants in the room
      const allParticipants = await getRoomParticipants(chatRoom);

      // exclude sender from notRead list
      const notReadUsers = allParticipants.filter((pId) => pId !== userId);

      // create message
      const message = await Message.create({
        chatRoom: roomId,
        sender: userId,
        content: content.trim(),
        notRead: notReadUsers,
      });

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
        notRead: populatedMessage.notRead,
        isRead: notReadUsers.length === 0, // if no one to read, mark as read
      });

      // send confirmation to sender only
      socket.emit("message-sent", {
        _id: populatedMessage._id,
        content: populatedMessage.content,
        sender: populatedMessage.sender,
        chatRoom: roomId,
        createdAt: populatedMessage.createdAt,
        status: "sent",
      });

      console.log(`Message sent in room ${roomId} by user ${userId}`);
    } catch (err) {
      console.error("Error sending message:", err);
      socket.emit("error", err.message || "Failed to send message");
    }
  });

  // mark message as read
  socket.on("mark-message-read", async ({ token, messageId }) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;

      if (!userId || userId !== socket.userId) {
        return socket.emit("error", "Unauthorized");
      }

      const message = await Message.findById(messageId);
      if (!message) {
        return socket.emit("error", "Message not found");
      }

      // check that the user is not the sender
      if (message.sender.toString() === userId) {
        return; // the sender does not update the message status
      }

      // check if the user is in the notRead list
      const userIndex = message.notRead.findIndex(
        (id) => id.toString() === userId
      );

      if (userIndex !== -1) {
        // remove user from notRead list
        message.notRead.splice(userIndex, 1);
        await message.save();

        // notify all users in the room about the read status
        socket.broadcast.to(message.chatRoom.toString()).emit("message-read", {
          messageId: message._id,
          readBy: userId,
          notReadCount: message.notRead.length,
          isFullyRead: message.notRead.length === 0,
        });

        console.log(
          `Message ${messageId} marked as read by user ${userId}. Remaining unread: ${message.notRead.length}`
        );
      }
    } catch (err) {
      console.error("Error marking message as read:", err);
      socket.emit("error", "Failed to mark message as read");
    }
  });

  // mark multiple messages as read (e.g., when opening the chat)
  socket.on("mark-messages-read", async ({ token, roomId }) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;

      if (!userId || userId !== socket.userId) {
        return socket.emit("error", "Unauthorized");
      }

      // update all messages in the room that are not read by the user
      const result = await Message.updateMany(
        {
          chatRoom: roomId,
          notRead: userId,
          sender: { $ne: userId }, // exclude messages sent by the user
        },
        {
          $pull: { notRead: userId },
        }
      );

      if (result.modifiedCount > 0) {
        // send notification to all users in the room
        socket.broadcast.to(roomId).emit("messages-read", {
          roomId: roomId,
          readBy: userId,
          count: result.modifiedCount,
        });

        console.log(
          `User ${userId} marked ${result.modifiedCount} messages as read in room ${roomId}`
        );
      }
    } catch (err) {
      console.error("Error marking messages as read:", err);
      socket.emit("error", "Failed to mark messages as read");
    }
  });

  // get unread count for a room
  socket.on("get-unread-count", async ({ token, roomId }) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;

      const unreadCount = await Message.countDocuments({
        chatRoom: roomId,
        notRead: userId,
      });

      socket.emit("unread-count", {
        roomId: roomId,
        count: unreadCount,
      });
    } catch (err) {
      console.error("Error getting unread count:", err);
      socket.emit("error", "Failed to get unread count");
    }
  });

  // real-time typing
  socket.on("is-typing", async ({ token, roomId, isTyping }) => {
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
  });
};

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
