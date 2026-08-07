import { Schema, model } from "mongoose";

// Maps which faculty (fid) are eligible to teach which course (cid).
const courseFacultySchema = new Schema({
    cid: {
        type: "Number"
    },
    fid: {
        type: "Number"
    }
});

export const CourseFaculty = model("CourseFaculty", courseFacultySchema);