const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const secret = process.env.SECRET;
// console.log("serect code", secret);
// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email is already in use" });
    }

    // If email is not in use, proceed with user registration
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hashSync(password, salt);
    const newUser = new User({ username, email, password: hashedPassword });
    const savedUser = await newUser.save();
    res.status(200).json(savedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//LOGIN
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json("User not found!");
    }

    const match = await bcrypt.compare(req.body.password, user.password);

    if (!match) {
      return res.status(401).json("Wrong credentials!");
    }

    const token = jwt.sign(
      { _id: user._id, username: user.username, email: user.email },
      process.env.SECRET,
      { expiresIn: "3d" }
    );

    const { password, ...info } = user._doc;

    res
      .cookie("token", token, {
        secure: true,
        sameSite: "None",
      })
      .status(200)
      .json(info);
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json(err);
  }
});

// ========================LOGOUT=======================
router.get("/logout", async (req, res) => {
  try {
    res
      .clearCookie("token", {
        httpOnly: true,
        sameSite: "none",
        secure: true,
      })
      .status(200)
      .send("User logged out successfully!");
  } catch (err) {
    res.status(500).json(err);
  }
});

//LOGIN
// router.post("/login", async (req, res) => {
//   try {
//     // ... (existing code)

//     const token = jwt.sign(
//       { _id: user._id, username: user.username, email: user.email },
//       "rohitkurmar",
//       { expiresIn: "3d" }
//     );
//     const { password, ...info } = user._doc;

//     // Update the cookie name to "jwtToken"
//     res
//       .cookie("jwtToken", token, {
//         httpOnly: true,
//         sameSite: "none",
//         secure: true,
//       })
//       .status(200)
//       .json(info);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

// REFETCH
router.get("/refetch", (req, res) => {
  const token = req.cookies.token;

  jwt.verify(token, process.env.SECRET, {}, async (err, data) => {
    if (err) {
      return res.status(404).json(err);
    }
    res.status(200).json(data);
  });
});

module.exports = router;
