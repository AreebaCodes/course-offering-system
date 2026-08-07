// Run this once to create the fixed admin account.
// Usage:  node seedAdmin.js
//
// Default login (change the password below before running in anything real):
//   email:    admin@szabist.pk
//   password: Admin@123
import bcrypt from "bcryptjs";
import { db } from "./models/index.js";

const ADMIN_NAME = "Department Admin";
const ADMIN_EMAIL = "admin@szabist.pk";
const ADMIN_PASSWORD = "Admin@123";

(async () => {
    try {
        const existing = await db.User.findOne({ email: ADMIN_EMAIL });
        if (existing) {
            console.log(`Admin account already exists for ${ADMIN_EMAIL}. Nothing to do.`);
            process.exit();
        }

        const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
        await db.User.create({
            name: ADMIN_NAME,
            email: ADMIN_EMAIL,
            passwordHash,
            role: "admin",
        });

        console.log(`Admin account created.`);
        console.log(`  email:    ${ADMIN_EMAIL}`);
        console.log(`  password: ${ADMIN_PASSWORD}`);
        console.log(`Change this password later if this app goes anywhere near real use.`);
    } catch (err) {
        console.error("Failed to create admin account:", err);
    } finally {
        process.exit();
    }
})();