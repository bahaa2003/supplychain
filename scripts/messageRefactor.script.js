import mongoose from "mongoose";
import Message from "../models/Message.schema.js";
import ChatRoomStatus from "../models/ChatRoomStatus.schema.js";
import ChatRoom from "../models/ChatRoom.schema.js";
import User from "../models/User.schema.js";
import PartnerConnection from "../models/PartnerConnection.schema.js";
import Company from "../models/Company.schema.js";
import dotenv from "dotenv";
dotenv.config();

async function migrateMessagesToNewSystem() {
  try {
    console.log("Starting migration...");

    // get all chat rooms
    const chatRooms = await ChatRoom.find({});
    console.log(`Number of chat rooms: ${chatRooms.length}`);

    let processedRooms = 0;
    let createdStatuses = 0;

    for (const room of chatRooms) {
      console.log(`\nProcessing chat room: ${room._id}`);

      // get all participants in the chat room
      const participants = await getRoomParticipants(room);
      console.log(`Number of participants: ${participants.length}`);

      for (const userId of participants) {
        // get the last read message for the user from the old system
        const lastReadMessage = await findLastReadMessage(room._id, userId);

        // create or update ChatRoomStatus
        const existingStatus = await ChatRoomStatus.findOne({
          chatRoom: room._id,
          user: userId,
        });

        if (!existingStatus) {
          await ChatRoomStatus.create({
            chatRoom: room._id,
            user: userId,
            lastReadAt: lastReadMessage ? lastReadMessage.createdAt : null,
            lastReadMessage: lastReadMessage ? lastReadMessage._id : null,
            canReply: true,
          });
          createdStatuses++;
          console.log(`Status created for user: ${userId}`);
        } else {
          console.log(`User ${userId} already has a status`);
        }
      }

      processedRooms++;
      console.log(`Chat room ${processedRooms}/${chatRooms.length} processed`);
    }

    // delete notRead field from all messages
    console.log("\nRemoving notRead field from all messages...");
    const updateResult = await Message.updateMany(
      {},
      { $unset: { notRead: "" } }
    );
    console.log(`Updated ${updateResult.modifiedCount} messages`);

    console.log("\nMigration completed successfully!");
    console.log(`Statistics:`);
    console.log(`   - Processed chat rooms: ${processedRooms}`);
    console.log(`   - Created statuses: ${createdStatuses}`);
    console.log(`   - Updated messages: ${updateResult.modifiedCount}`);

    return {
      success: true,
      processedRooms,
      createdStatuses,
      updatedMessages: updateResult.modifiedCount,
    };
  } catch (error) {
    console.error("Error in migration:", error);
    throw error;
  }
}

/**
 * find the last read message for the user in the old system
 * we assume that the message is read if the user is not in the notRead list
 */
async function findLastReadMessage(roomId, userId) {
  try {
    // find the last message in the room that the user is not in the notRead list
    // or messages that do not have the notRead field (old messages)
    const lastReadMessage = await Message.findOne({
      chatRoom: roomId,
      sender: { $ne: userId }, // exclude messages from the user himself
      $or: [
        { notRead: { $exists: false } }, // old messages without notRead field
        { notRead: { $not: { $in: [userId] } } }, // messages that the user has read
      ],
    })
      .sort({ createdAt: -1 })
      .limit(1);

    return lastReadMessage;
  } catch (error) {
    console.error(`Error finding last read message for user ${userId}:`, error);
    return null;
  }
}

/**
 * get the participants in the room (same logic as the original code)
 */
async function getRoomParticipants(chatRoom) {
  const participants = [];

  try {
    if (chatRoom.type === "company_to_company") {
      const connection = await PartnerConnection.findOne({
        chatRoom: chatRoom._id,
      });
      if (connection) {
        const users = await User.find({
          company: { $in: [connection.recipient, connection.requester] },
          role: { $in: ["admin", "manager"] },
        });
        participants.push(...users.map((u) => u._id.toString()));
      }
    } else if (chatRoom.type === "platform_to_company") {
      const platformAdmins = await User.find({
        role: "platform_admin",
      });
      const company = await Company.findOne({ chatRoom: chatRoom._id });
      if (company) {
        const companyUsers = await User.find({
          company: company._id,
          role: { $in: ["admin", "manager"] },
        });
        participants.push(
          ...platformAdmins.map((u) => u._id.toString()),
          ...companyUsers.map((u) => u._id.toString())
        );
      }
    } else if (chatRoom.type === "in_company") {
      const staff = await User.findOne({
        chatRoom: chatRoom._id,
      });
      if (staff) {
        const users = await User.find({
          company: staff.company,
          role: { $in: ["admin", "manager"] },
        });
        participants.push(
          ...users.map((u) => u._id.toString()),
          staff._id.toString()
        );
      }
    }
  } catch (error) {
    console.error(`Error getting participants in the room:`, error);
  }

  return [...new Set(participants)]; // remove duplicates
}

// run the script
async function runMigration() {
  try {
    // connect to the database
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to the database");

    // run the migration
    const result = await migrateMessagesToNewSystem();

    console.log("\nMigration completed successfully:", result);

    // close the connection
    await mongoose.connection.close();
    console.log("Connection closed");

    process.exit(0);
  } catch (error) {
    console.error("Error in migration:", error);
    process.exit(1);
  }
}

runMigration();
