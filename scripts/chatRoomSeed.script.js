import mongoose from "mongoose";
import ChatRoom from "../models/chatRoom.schema.js";
import Company from "../models/Company.schema.js";
import User from "../models/User.schema.js";
import PartnerConnection from "../models/PartnerConnection.schema.js";
import dotenv from "dotenv";
dotenv.config();
async function createChatRooms() {
  try {
    console.log("starting...");

    // company_to_company rooms
    const connections = await PartnerConnection.find({
      status: { $nin: ["Pending", "Rejected"] },
    });
    for (const conn of connections) {
      const room = await ChatRoom.create({
        type: "company_to_company",
      });
      conn.chatRoom = room._id;
      await conn.save();
    }
    console.log(`${connections.length} room company_to_company`);

    // platform_to_company rooms
    const companies = await Company.find();
    for (const company of companies) {
      const room = await ChatRoom.create({
        type: "platform_to_company",
      });
      company.chatRoom = room._id;
      await company.save();
    }
    console.log(`${companies.length} room platform_to_company`);

    // in_company rooms
    const staff = await User.find({
      role: "staff",
      company: { $ne: null },
    }).populate("company");
    for (const user of staff) {
      const admin = await User.findById(user.company.createdBy);
      const room = await ChatRoom.create({
        type: "in_company",
      });
      user.chatRoom = room._id;
      await user.save();
    }
    console.log(`${staff.length} room in_company`);

    console.log(
      `\ntotal: ${connections.length + companies.length + staff.length} room`
    );
  } catch (error) {
    console.error("error:", error);
    throw error;
  }
}

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("connected to database\n");
  await createChatRooms();
  await mongoose.connection.close();
  console.log("\ndisconnected from database");
  process.exit(0);
};

await run();
