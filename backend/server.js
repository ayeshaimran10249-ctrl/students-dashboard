
const dns = require("node:dns");

// DNS configuration
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Student model
const Student = mongoose.model("Student", {
  name: String,
  email: String,
  course: String,
});

// Get all students
app.get("/students", async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (error) {
    console.error("Fetch students error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Add student
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
    console.error("Add student error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete student
app.delete("/students/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(
      req.params.id
    );

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    res.json({ message: "Student deleted" });
  } catch (error) {
    console.error("Delete student error:", error.message);
    res.status(400).json({
      message: "Invalid student ID",
    });
  }
});

// Connect to MongoDB and start server
async function startServer() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from .env file");
    }

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
    });

    console.log("MongoDB Connected!");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("\nMongoDB connection failed:", error.message);
    console.error("Error name:", error.name);
    console.error("Error code:", error.code);

    if (error.reason) {
      console.error("Topology details:", error.reason);
    }

    if (error.cause) {
      console.error("Cause:", error.cause.message);
    }
  }
}

startServer();
