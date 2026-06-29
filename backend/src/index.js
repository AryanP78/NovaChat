import express from "express";
import "dotenv/config";
import User from "./models/User.js";

import { clerkMiddleware } from "@clerk/express";
import { connectDb } from "./lib/db.js";
import cors from "cors";

import path from "path";
import fs from "fs";
import job from "./lib/cron.js";

const app = express();
const PORT = process.env.PORT;
const FRONTEND_URL = process.env.FRONTEND_URL;
const publicDir = path.join(process.cwd(), "public");
app.use(express.json());
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(clerkMiddleware());

app.get("/health", (req, res) => {
  res.status(200).json({ ok: true });
});

//* This is for Production Build
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
  app.get("/{*any}", (req, res) => {
    res.sendFile(path.join(publicDir, "index.html"), (err) => nextTick(err));
  });
}

app.listen(PORT, () => {
  connectDb();
  console.log(`Server is up and running on port ${PORT}`);

  if (process.env.NODE_ENV === "production") {
    job.start();
  }
});
