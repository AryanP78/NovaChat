import express from "express";
import User from "../models/User.js";
import { verifyWebhook } from "@clerk/express/webhooks";

const router = express.Router();

router.post("/", async (req, res) => {
  let evt;
  const signingSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET?.trim();

  console.log("Clerk webhook request received", {
    contentType: req.get("content-type"),
    hasSvixId: Boolean(req.get("svix-id")),
    hasSvixTimestamp: Boolean(req.get("svix-timestamp")),
    hasSvixSignature: Boolean(req.get("svix-signature")),
    hasSigningSecret: Boolean(signingSecret),
  });

  try {
    evt = await verifyWebhook(req, { signingSecret });
    console.log(`Clerk webhook verified: ${evt.type}`);
  } catch (error) {
    console.error("Clerk webhook verification failed:", error.message);
    res.status(400).json({
      message: "Webhook verification failed",
      error: error.message,
    });
    return;
  }

  try {
    if (evt.type === "user.created" || evt.type === "user.updated") {
      const u = evt.data;

      const email =
        u.email_addresses?.find((e) => e.id === u.primary_email_address_id)
          ?.email_address ?? u.email_addresses?.[0]?.email_address;

      const fullName =
        [u.first_name, u.last_name].filter(Boolean).join(" ") ||
        u.username ||
        email?.split("@")[0];

      await User.findOneAndUpdate(
        { clerkId: u.id },
        { clerkId: u.id, email, fullName, profilePic: u.image_url },
        { new: true, upsert: true, setDefaultsOnInsert: true },
      );

      console.log(`Mongo user synced from Clerk: ${u.id}`);
    }

    if (evt.type === "user.deleted") {
      if (evt.data.id) {
        await User.findOneAndDelete({ clerkId: evt.data.id });
        console.log(`Mongo user deleted from Clerk: ${evt.data.id}`);
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Clerk webhook Mongo sync failed:", error);
    res.status(500).json({ message: "Webhook received but Mongo sync failed" });
  }
});

export default router;
