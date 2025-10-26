import User from "../../models/User.schema.js";
import Company from "../../models/Company.schema.js";
import PartnerConnection from "../../models/PartnerConnection.schema.js";
import { roles } from "../../enums/role.enum.js";
import { partnerConnectionStatus } from "../../enums/partnerConnectionStatus.enum.js";
import jwt from "jsonwebtoken";

export default function joinChatAndNotificationRoomsHandler(io, socket) {
  return async ({ token }) => {
    console.log("join-chat-and-notification-rooms event received");
    try {
      // verify token
      if (!token) {
        socket.emit("error", "Token is required");
        socket.disconnect();
        return;
      }
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        console.error("Invalid token" + err.message);
        socket.emit("error", "Invalid token: " + err.message);
        socket.disconnect();
        return;
      }
      const userId = decoded.id;

      // get user data with company
      const user = await User.findById(userId).populate("company");
      if (!user) {
        socket.emit("error", "User not found");
        socket.disconnect();
        return;
      }

      // join notification room
      const notificationRoom = `notification-${userId}`;
      socket.join(notificationRoom);
      socket.userId = userId;
      console.log(
        `Registered user ${userId} on notification room socket ${notificationRoom}`
      );

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
      console.error("Error joining rooms: " + err.message);
      socket.emit("error", "Failed to join rooms");
      socket.disconnect();
      return;
    }
  };
}
