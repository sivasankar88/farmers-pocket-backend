const express = require("express");
const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();
require("dotenv").config();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "user already exists." });
    }
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const user = new User({ name, email, password });
    await user.save();
    return res.status(201).json({ message: "user registred successfully." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Email id not exist, please register" });
    }
    if (password !== user.password) {
      return res.status(400).json({ message: "Invalid password" });
    }
    const payload = {
      id: user._id,
      email: user.email,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    return res.status(200).json({ token: token });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "server error" });
  }
});

module.exports = router;
