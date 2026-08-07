import mongoose from "mongoose";
import { Curriculum } from "./Curriculum.js";
import { Faculty } from "./Faculty.js";
import { Area } from "./Area.js";
import { Course } from "./Course.js";
import { Offer } from "./Offer.js";
import { CourseFaculty } from "./CourseFaculty.js";
import { User } from "./User.js";
import { Registration } from "./Registration.js";



(async () => {
    //await mongoose.connect(`mongodb://localhost:27017/?readPreference=primary&ssl=false&directConnection=true`);
    await mongoose.connect(`mongodb://127.0.0.1:27017/semester`);
    //await mongoose.connect(`mongodb+srv://dbUser:dbUser@cluster0.enbv6.mongodb.net/pharmacy`);
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