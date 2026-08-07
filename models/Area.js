import { Schema, model } from "mongoose";

const areaSchema = new Schema(
    {
        cid: {
            type: "Number"
        },
        fid: {
            type: "Number"
        }
    }
);

export const Area = model("Area", areaSchema);

