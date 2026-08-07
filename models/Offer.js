import { Schema, model } from "mongoose";

const offerSchema = new Schema({
    semno: {
      type: "Number"
    },
    cid: {
      type: "Number"
    },
    fid: {
      type: "Number"
    },
    sec: {
      type: "String"
    },
    semester: {
      type: "String"
    }
  });

export const Offer = model("Offer", offerSchema);
