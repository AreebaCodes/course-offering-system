import { Schema, model } from "mongoose";

const courseSchema = new Schema({
    cid: {
        type: "Number"
    },
    title: {
        type: "String"
    }
});

export const Course = model("Course", courseSchema);
