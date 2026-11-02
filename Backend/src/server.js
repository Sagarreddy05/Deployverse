// Load environment variables from .env BEFORE any other require()
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const db = require("./config/db");

const authRoutes = require("./routes/authRoutes");

const app = express();
const projectRoutes = require("./routes/projectRoutes");
const jenkinsRoutes = require("./routes/jenkinsRoutes");

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/jenkins", jenkinsRoutes);

// Health check
app.get("/api/health", (req, res) => {
    res.json({
        status: "success",
        message: "DeployVerse backend is running"
    });
});

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`DeployVerse backend running on port ${PORT}`);
});
