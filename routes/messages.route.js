import express from "express";
import { createChatRoom } from "../controllers/messages/createChatRoom.controller.js";
import { getChatRoomMessages } from "../controllers/messages/getChatRoomMessages.controller.js";
import { changeChatRoomStatus } from "../controllers/messages/changeChatRoomStatus.controller.js";

const router = express.Router();

router.route("/chatRoom/:chatRoomId").get(getChatRoomMessages);
// router.route("/chatRoom").post(createChatRoom);

router.route("/chatRoom/:chatRoomId").patch(changeChatRoomStatus);

export default router;
