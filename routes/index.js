import express from 'express'
const router = express.Router();
import { db } from "../models/index.js"
import { requireAuth, requireAdmin } from "./auth.js"

router.get('/curriculum', async (req, res) => {
    const curriculum = await db.Curriculum.aggregate([
        { $lookup: { from: "courses", foreignField: "cid", localField: "cid", as: "course" } },
        { $unwind: "$course" }, { $project: { _id: 1, curid: 1, cid: 1, title: "$course.title", semno: 1 } }]).sort('semno')
    res.status(200).json(curriculum);
});

router.get('/faculties', async (req, res) => {
    const faculties = await db.Faculty.find()
    res.status(200).json(faculties);
});

router.get('/course-faculty', async (req, res) => {
    const mapping = await db.CourseFaculty.find()
    res.status(200).json(mapping);
});

// Load all saved faculty assignments (optionally filter by semester: Fall/Spring)
router.get('/offers', async (req, res) => {
    const filter = req.query.semester ? { semester: req.query.semester } : {};
    const offers = await db.Offer.find(filter);
    res.status(200).json(offers);
});

// Save faculty assignments for a semester. Admin only.
// Expects: { semester: "Fall", offers: [{ cid, fid, sec, semno }] }
// Replaces all existing saved offers for that semester with the new set.
router.post('/offers', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { semester, offers } = req.body;
        if (!semester || !Array.isArray(offers)) {
            return res.status(400).json({ message: "semester and offers[] are required" });
        }
        await db.Offer.deleteMany({ semester });
        if (offers.length > 0) {
            await db.Offer.insertMany(offers.map((o) => ({ ...o, semester })));
        }
        res.status(200).json({ message: "Saved", count: offers.length });
    } catch (err) {
        res.status(500).json({ message: "Failed to save offers", error: String(err) });
    }
});

// Student registers for a specific offered section. Requires login (any role).
// Expects: { cid, sec, semester }
router.post('/register', requireAuth, async (req, res) => {
    try {
        const { cid, sec, semester } = req.body;
        if (!cid || !sec || !semester) {
            return res.status(400).json({ message: "cid, sec, and semester are required" });
        }

        // Only allow registering into a section that the admin has actually offered.
        const offerExists = await db.Offer.findOne({ cid, sec, semester });
        if (!offerExists) {
            return res.status(400).json({ message: "This section is not currently offered" });
        }

        const registration = await db.Registration.create({
            studentId: req.user.uid,
            cid,
            sec,
            semester,
        });
        res.status(201).json(registration);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: "You're already registered for this course this semester" });
        }
        res.status(500).json({ message: "Registration failed", error: String(err) });
    }
});

// Get the logged-in student's own registrations (optionally filter by semester).
router.get('/my-registrations', requireAuth, async (req, res) => {
    const filter = { studentId: req.user.uid };
    if (req.query.semester) filter.semester = req.query.semester;
    const registrations = await db.Registration.find(filter);
    res.status(200).json(registrations);
});

// Drop a registration. Students can only drop their own.
router.delete('/register/:id', requireAuth, async (req, res) => {
    const registration = await db.Registration.findById(req.params.id);
    if (!registration) {
        return res.status(404).json({ message: "Registration not found" });
    }
    if (String(registration.studentId) !== String(req.user.uid)) {
        return res.status(403).json({ message: "You can only drop your own registrations" });
    }
    await registration.deleteOne();
    res.status(200).json({ message: "Dropped" });
});

export default router;