import express from "express";
import { createChatRoom } from "../controllers/messages/createChatRoom.controller.js";
import { getChatRoomMessages } from "../controllers/messages/getChatRoomMessages.controller.js";

const router = express.Router();

router.route("/chatRoom/:chatRoomId").get(getChatRoomMessages);
router.route("/chatRoom").post(createChatRoom);

export default router;
