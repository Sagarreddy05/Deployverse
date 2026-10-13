const express = require("express");

const {
    createProject,
    getProjects,
    getProject,
    deleteProject
} = require("../controllers/projectController");

const router = express.Router();

router.post("/", createProject);

router.get("/user/:userId", getProjects);

router.get("/:id", getProject);

router.delete("/:id", deleteProject);

module.exports = router;