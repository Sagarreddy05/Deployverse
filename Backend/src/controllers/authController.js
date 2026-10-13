const db = require("../config/db");

// Register user
const register = (req, res) => {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
        return res.status(400).json({
            message: "Name, email and password are required"
        });
    }

    const sql = `
        INSERT INTO users (name, email, password)
        VALUES (?, ?, ?)
    `;

    db.run(sql, [name, email, password], function (err) {
        if (err) {
            if (err.message.includes("UNIQUE")) {
                return res.status(409).json({
                    message: "Email already registered"
                });
            }

            console.error("Registration error:", err.message);

            return res.status(500).json({
                message: "Registration failed"
            });
        }

        res.status(201).json({
            message: "User registered successfully",
            userId: this.lastID
        });
    });
};


// Login user
const login = (req, res) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required"
        });
    }

    const sql = `
        SELECT id, name, email
        FROM users
        WHERE email = ? AND password = ?
    `;

    db.get(sql, [email, password], (err, user) => {
        if (err) {
            console.error("Login error:", err.message);

            return res.status(500).json({
                message: "Login failed"
            });
        }

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        res.json({
            message: "Login successful",
            user: user
        });
    });
};


// Export functions
module.exports = {
    register,
    login
};