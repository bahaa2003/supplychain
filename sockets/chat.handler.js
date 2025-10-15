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
      // create message
      const message = await Message.create({
        chatRoom: roomId,
        sender: userId,
        content: content.trim(),
        isCreate: true,
      });

      // get message with sender data
      const populatedMessage = await Message.findById(message._id)
        .populate("sender", "name email role avatar")
        .populate("chatRoom");

      // send message to all connected users in the room
      io.to(roomId).emit("new-message", {
        _id: populatedMessage._id,
        content: populatedMessage.content,
        sender: populatedMessage.sender,
        chatRoom: roomId,
        createdAt: populatedMessage.createdAt,
        isCreate: populatedMessage.isCreate,
        isDeliver: false,
        isRead: false,
      });

      console.log(`Message sent in room ${roomId} by user ${userId}`);
    } catch (err) {
      console.error("Error sending message:", err);
      socket.emit("error", err.message || "Failed to send message");
    }
  });

  // update message status (delivered/read)
  socket.on("update-message-status", async ({ token, messageId, status }) => {
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

      // update the status
      if (status === "read" && !message.isRead) {
        message.isRead = true;
        await message.save();

        // notify the sender that the message is read
        io.to(message.chatRoom.toString()).emit("message-read", {
          messageId: message._id,
          readBy: userId,
        });
      }
    } catch (err) {
      console.error("Error updating message status:", err);
      socket.emit("error", "Failed to update message status");
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
