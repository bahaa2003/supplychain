import mongoose from "mongoose";
const { Schema } = mongoose;

const chatRoomSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["company_to_company", "platform_to_company", "in_company"],
      required: true,
    },
    participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export default mongoose.model("ChatRoom", chatRoomSchema);
