
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const Student =
  mongoose.models.Student ||
  mongoose.model(
    "Student",
    new mongoose.Schema({
      name: String,
      email: String,
      course: String,
    })
  );

let connectionPromise;

async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing");
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(
      process.env.MONGO_URI,
      { serverSelectionTimeoutMS: 10000 }
    );
  }

  try {
    await connectionPromise;
  } catch (error) {
    connectionPromise = null;
    throw error;
  }
}

app.get("/", (req, res) => {
  res.json({ message: "Student API is running" });
});

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  }    catch (error) {
    console.error("Database connection failed:", {
      name: error.name,
      code: error.code || null,
      message: error.message,
    });

    res.status(500).json({
      message: "Database connection failed",
      errorType: error.message === "MONGO_URI is missing"
        ? "MONGO_URI is missing"
        : error.name,
      errorCode: error.code || null,
    });
}
});

app.get("/students", async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Could not fetch students" });
  }
});

app.post("/students", async (req, res) => {
  try {
    const { name, email, course } = req.body;

    if (!name || !email || !course) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const student = await Student.create({
      name,
      email,
      course,
    });

    res.status(201).json(student);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Could not add student" });
  }
});

app.delete("/students/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    res.json({ message: "Student deleted" });
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ message: "Invalid student ID" });
  }
});

module.exports = app;
