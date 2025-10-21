import mongoose from "mongoose";
const { Schema } = mongoose;

const chatRoomStatusSchema = new Schema(
  {
    chatRoom: { type: Schema.Types.ObjectId, ref: "ChatRoom", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    lastReadAt: { type: Date, default: null },
    lastReadMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    canReply: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// make combination of chatRoom and user unique
chatRoomStatusSchema.index({ chatRoom: 1, user: 1 }, { unique: true });
export default mongoose.model("ChatRoomStatus", chatRoomStatusSchema);
