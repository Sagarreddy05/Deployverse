const db = require("../config/db");

// Create project
const createProject = (req, res) => {
    const { user_id, name, repository_url, branch } = req.body;

    if (!user_id || !name || !repository_url) {
        return res.status(400).json({
            message: "User ID, project name and repository URL are required"
        });
    }

    const projectBranch = branch || "main";

    const sql = `
        INSERT INTO projects
        (user_id, name, repository_url, branch)
        VALUES (?, ?, ?, ?)
    `;

    db.run(
        sql,
        [user_id, name, repository_url, projectBranch],
        function (err) {
            if (err) {
                console.error("Project creation error:", err.message);

                return res.status(500).json({
                    message: "Failed to create project"
                });
            }

            res.status(201).json({
                message: "Project created successfully",
                projectId: this.lastID
            });
        }
    );
};


// Get projects for a user
const getProjects = (req, res) => {
    const userId = req.params.userId;

    const sql = `
        SELECT *
        FROM projects
        WHERE user_id = ?
        ORDER BY created_at DESC
    `;

    db.all(sql, [userId], (err, projects) => {
        if (err) {
            console.error("Project fetch error:", err.message);

            return res.status(500).json({
                message: "Failed to fetch projects"
            });
        }

        res.json({
            projects
        });
    });
};


// Get single project
const getProject = (req, res) => {
    const projectId = req.params.id;

    const sql = `
        SELECT *
        FROM projects
        WHERE id = ?
    `;

    db.get(sql, [projectId], (err, project) => {
        if (err) {
            console.error("Project fetch error:", err.message);

            return res.status(500).json({
                message: "Failed to fetch project"
            });
        }

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        res.json({
            project
        });
    });
};


// Delete project — requires user_id in request body for ownership verification
const deleteProject = (req, res) => {
    const projectId = req.params.id;
    const { user_id } = req.body;

    if (!user_id) {
        return res.status(400).json({
            message: "user_id is required to delete a project"
        });
    }

    // First verify the project exists and belongs to this user
    const checkSql = `SELECT id, user_id FROM projects WHERE id = ?`;

    db.get(checkSql, [projectId], (err, project) => {
        if (err) {
            console.error("Project ownership check error:", err.message);
            return res.status(500).json({ message: "Failed to verify project ownership" });
        }

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        // Strict ownership check — compare as strings to handle type differences
        if (String(project.user_id) !== String(user_id)) {
            console.warn(`Ownership violation: user ${user_id} tried to delete project ${projectId} owned by user ${project.user_id}`);
            return res.status(403).json({ message: "You do not have permission to delete this project" });
        }

        // Ownership confirmed — proceed with deletion
        const deleteSql = `DELETE FROM projects WHERE id = ?`;

        db.run(deleteSql, [projectId], function (err) {
            if (err) {
                console.error("Project deletion error:", err.message);
                return res.status(500).json({ message: "Failed to delete project" });
            }

            res.json({ message: "Project deleted successfully" });
        });
    });
};


module.exports = {
    createProject,
    getProjects,
    getProject,
    deleteProject
};