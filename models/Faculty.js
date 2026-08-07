import { Schema, model } from "mongoose";

const facultySchema = new Schema(
    {
        fid: {
            type: "Number"
        },
        TeacherName: {
            type: "String"
        }, 
        fulltime: {
            type: "Boolean"
        }
    }
);

export const Faculty = model("Faculty", facultySchema);
