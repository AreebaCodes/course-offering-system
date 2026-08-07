import { Schema, model } from "mongoose";

// A single student's registration into a specific offered section.
const registrationSchema = new Schema({
    studentId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    cid: {
        type: Number,
        required: true
    },
    sec: {
        type: String,
        required: true
    },
    semester: {
        type: String,
        required: true
    }
}, { timestamps: true });

// A student can only register once for the same course in the same semester.
registrationSchema.index({ studentId: 1, cid: 1, semester: 1 }, { unique: true });

export const Registration = model("Registration", registrationSchema);