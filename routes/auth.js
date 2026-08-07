import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import "dotenv/config"
import { db } from "../models/index.js"

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "semester-app-dev-secret-change-me";


router.post('/auth/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: "name, email, and password are required" });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const existing = await db.User.findOne({ email: email.toLowerCase().trim() });
        if (existing) {
            return res.status(409).json({ message: "An account with this email already exists" });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const user = await db.User.create({
            name,
            email: email.toLowerCase().trim(),
            passwordHash,
            role: "student",
        });

        const token = jwt.sign({ uid: user._id, role: user.role }, JWT_SECRET, { expiresIn: "12h" });
        res.status(201).json({
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
        });
    } catch (err) {
        res.status(500).json({ message: "Signup failed", error: String(err) });
    }
});

// Both admins and students log in here.
router.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "email and password are required" });
        }

        const user = await db.User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const match = await bcrypt.compare(password, user.passwordHash);
        if (!match) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign({ uid: user._id, role: user.role }, JWT_SECRET, { expiresIn: "12h" });
        res.status(200).json({
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
        });
    } catch (err) {
        res.status(500).json({ message: "Login failed", error: String(err) });
    }
});


export const requireAuth = (req, res, next) => {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) {
        return res.status(401).json({ message: "Missing auth token" });
    }
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = payload;
        next();
    } catch {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

// Middleware: only allows admins through. Use after requireAuth.
export const requireAdmin = (req, res, next) => {
    if (req.user?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
    }
    next();
};

export default router;