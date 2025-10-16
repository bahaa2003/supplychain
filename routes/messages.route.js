import express from "express";
import { createChatRoom } from "../controllers/messages/createChatRoom.controller.js";
import { getChatRoomMessages } from "../controllers/messages/getChatRoomMessages.controller.js";
import { markRoomRead } from "../controllers/messages/markRoomRead.controller.js";

const router = express.Router();

router.route("/chatRoom/:chatRoomId").get(getChatRoomMessages);
// router.route("/chatRoom").post(createChatRoom);

router.route("/chatRoom/:chatRoomId/mark-read").patch(markRoomRead);

export default router;
