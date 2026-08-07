import mongoose from "mongoose";
import "dotenv/config";
import { Curriculum } from "./Curriculum.js";
import { Faculty } from "./Faculty.js";
import { Area } from "./Area.js";
import { Course } from "./Course.js";
import { Offer } from "./Offer.js";
import { CourseFaculty } from "./CourseFaculty.js";
import { User } from "./User.js";
import { Registration } from "./Registration.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/semester";

(async () => {
    await mongoose.connect(MONGO_URI);
})();

export const db = {
    Curriculum, 
    Faculty, 
    Area, 
    Course, 
    Offer,
    CourseFaculty,
    User,
    Registration
};