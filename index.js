const express = require("express");
const mongoose = require("mongoose"); // Fix the import statement
const app = express();
const cookieParser = require("cookie-parser");
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");
require("dotenv").config();
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const { connectDB } = require("./config/db");
//midleare
app.use(cookieParser());
app.use(express.json());
app.use("/images", express.static(path.join(__dirname, "/images")));
// app.use(cors({ origin: "http://localhost:5173", credentials: true }));
// app.use(cors({ origin: "*", credentials: true }));
app.use(
  cors({ origin: "https://mern-forntend-main.vercel.app", credentials: true })
);

app.use("/api/auth/", authRoute);
app.use("/api/posts/", postRoute);

//Image upload
const storage = multer.diskStorage({
  destination: (req, file, fn) => {
    fn(null, "images");
  },
  filename: (req, file, fn) => {
    fn(null, req.body.img);
  },
});

const upload = multer({ storage: storage });

app.post("/api/upload", upload.single("file"), (req, res) => {
  res.status(200).json("Image has been uploaded successfully");
});

//database connection
connectDB()
  .then(() => {
    console.log("Database connection established successfully");
    // You can start using the database in this file after a successful connection
  })
  .catch((error) => {
    console.error("Error connecting to the database:", error);
  });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Port is running on port ${PORT}`));
