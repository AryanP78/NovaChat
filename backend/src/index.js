import express from "express";
import "dotenv/config";
import { clerkMiddleware } from "@clerk/express";
import { connectDb } from "./lib/db.js";
import cors from "cors";
import clerkWebhook from "./webhooks/clerk.webhook.js";
import path from "path";
import fs from "fs";
import job from "./lib/cron.js";
import authRoutes from "./routes/auth.route.js";
import messageRoute from "./routes/message.route.js";
import { app, server } from "./lib/socket.js";

const PORT = process.env.PORT;
const FRONTEND_URL = process.env.FRONTEND_URL;
const publicDir = path.join(process.cwd(), "public");

const clerkWebhookHandler = [express.raw({ type: "*/*" }), clerkWebhook];

app.use("/api/webhooks/clerk", clerkWebhookHandler);

app.use(express.json());
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(clerkMiddleware());

app.get("/health", (req, res) => {
  res.status(200).json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoute);

//* This is for Production Build
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
  app.get("/{*any}", (req, res, next) => {
    res.sendFile(path.join(publicDir, "index.html"), (err) => {
      if (err) next(err);
    });
  });
}

async function startServer() {
  await connectDb();

  server.listen(PORT, () => {
    console.log(`Server is up and running on port ${PORT}`);

    if (process.env.NODE_ENV === "production") {
      job.start();
    }
  });
}

startServer();
