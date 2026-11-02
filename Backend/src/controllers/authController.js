const db      = require("../config/db");
const bcrypt  = require("bcryptjs");

// Bcrypt cost factor — 10 rounds balances security and performance.
// At 10 rounds, hashing takes ~100ms on a modern machine (acceptable for auth).
const SALT_ROUNDS = 10;

// ── Register user ─────────────────────────────────────────────────────────────
const register = async (req, res) => {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
        return res.status(400).json({
            message: "Name, email and password are required"
        });
    }

    if (password.length < 6) {
        return res.status(400).json({
            message: "Password must be at least 6 characters"
        });
    }

    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({
            message: "Invalid email address"
        });
    }

    try {
        // Hash the password — bcryptjs generates a random salt automatically
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const sql = `
            INSERT INTO users (name, email, password)
            VALUES (?, ?, ?)
        `;

        db.run(sql, [name, email, hashedPassword], function (err) {
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

    } catch (err) {
        console.error("Bcrypt hashing error:", err.message);
        return res.status(500).json({ message: "Registration failed" });
    }
};


// ── Login user ────────────────────────────────────────────────────────────────
const login = async (req, res) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required"
        });
    }

    const sql = `
        SELECT id, name, email, password
        FROM users
        WHERE email = ?
    `;

    db.get(sql, [email], async (err, user) => {
        if (err) {
            console.error("Login DB error:", err.message);
            return res.status(500).json({ message: "Login failed" });
        }

        if (!user) {
            // Return generic message — don't reveal whether email exists
            return res.status(401).json({ message: "Invalid email or password" });
        }

        try {
            const passwordMatch = await bcrypt.compare(password, user.password);

            if (!passwordMatch) {
                return res.status(401).json({ message: "Invalid email or password" });
            }

            // Never return the hashed password to the client
            return res.json({
                message: "Login successful",
                user: {
                    id:    user.id,
                    name:  user.name,
                    email: user.email
                }
            });

        } catch (bcryptErr) {
            console.error("Bcrypt compare error:", bcryptErr.message);
            return res.status(500).json({ message: "Login failed" });
        }
    });
};


// Export functions
module.exports = {
    register,
    login
};