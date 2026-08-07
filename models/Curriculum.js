import { Schema, model } from "mongoose";

const curriculumSchema = new Schema({
	curid: {
		type: "Number",
	},
	cid: {
		type: "Number",
	},
	semno: {
		type: "Number",
	},
});

export const Curriculum = model("Curriculum", curriculumSchema);
