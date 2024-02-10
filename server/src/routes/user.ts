import express from "express";
import jwt from "jsonwebtoken";
import { User } from "../db/db-index";
import dotenv from "dotenv";
import { authenticatejwt } from "../middleware/auth";
const router = express.Router();

dotenv.config({ path: "./config/.env.local" });
const secret = process.env.JWT_SECRET;
if (!secret) {
  console.error(
    "JWT_SECRET is not defined in the environment variables in user.ts."
  );
  process.exit(1);
}

interface LoginRequest {
  username: string,
  password: string
}

router.get("/me", authenticatejwt, async (req, res) => {
  const idHeader = req.headers.userId;
  if (!idHeader) {
    res.status(404).json({ message: "unable to find userId" });
  }
  const currentUser = await User.findOne({ _id: idHeader });
  if (!currentUser) {
    res.status(403).json({ message: "user is not logged in" });
  } else {
    res.json({ username: currentUser.username });
  }
});

router.post("/signup", async (req, res) => {
  // TODO: Add validation using zod to check if the user is not sending erroneous requests in req.body, publish it on npm, bring it as a type using z.infer in TS
  const { username, password }: LoginRequest = req.body;
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    res.status(400).json({ message: "User already exists" });
  } else {
    const newAdmin = new User({ username, password });
    await newAdmin.save();
    const token = jwt.sign({ id: newAdmin._id }, secret, { expiresIn: "1h" });
    res.json({ username, token, message: "new user created" });
    console.log("username: ", username, "token: ", token);
  }
});

router.post("/signin", async (req, res) => {
  const { username, password }: LoginRequest = req.body;
  const existingUser = await User.findOne({ username, password });
  if (!existingUser) {
    res.status(404).json({ message: "Invalid credentials" });
  } else {
    const token = jwt.sign({ id: existingUser._id }, secret, {
      expiresIn: "1h",
    });
    res.json({ message: "Logged in successfully", token });
  }
});

export default router;
