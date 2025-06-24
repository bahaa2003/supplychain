import { Router } from "express";
import { stripeWebhookHandler } from "../controllers/webhook/stripe.webhook.controller.js";

const router = Router();

router.post("/stripe", stripeWebhookHandler);

export default router;
