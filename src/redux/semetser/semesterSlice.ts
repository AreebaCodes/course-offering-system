import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../store";
//import { api } from "../../api/api";
import axios from "axios";
import { Curriculum, Faculty  } from "../../components/types";

export interface CourseFacultyMap {
	cid: number;
	fid: number;
}

export interface SavedOffer {
	cid: number;
	fid: number;
	sec: string;
	semno: number;
	semester: string;
}

interface SemesterState {
	
	loading: boolean;
	saving: boolean;
	semester: "Fall" | "Spring";
	error: string;
	curriculum: Curriculum[];
	faculty: Faculty[];
	courseFaculty: CourseFacultyMap[];
	offers: SavedOffer[];

}

const initialState: SemesterState = {
	
	loading: false,
	saving: false,
	semester: "Fall",
	curriculum: [],
	faculty: [],
	courseFaculty: [],
	offers: [],
	error: "",
};

const timeout = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const getCurriculum = createAsyncThunk("semester/getCurriculum", async () => {
	//await timeout(5000);
	const response = await axios.get(`/api/curriculum`);
	return response.data as Curriculum[];
});

export const getFaculties = createAsyncThunk("semester/getFaculty", async () => {
	//await timeout(5000);
	const response = await axios.get(`/api/faculties`);
	return response.data as Faculty[];
});

export const getCourseFaculty = createAsyncThunk("semester/getCourseFaculty", async () => {
	const response = await axios.get(`/api/course-faculty`);
	return response.data as CourseFacultyMap[];
});

export const getOffers = createAsyncThunk("semester/getOffers", async () => {
	const response = await axios.get(`/api/offers`);
	return response.data as SavedOffer[];
});

export const saveOffers = createAsyncThunk(
	"semester/saveOffers",
	async (params: { semester: string; offers: Omit<SavedOffer, "semester">[] }) => {
		const response = await axios.post(`/api/offers`, params);
		return response.data;
	}
);




export const semesterSlice = createSlice({
	name: "semester",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(getCurriculum.pending, (state) => {
				state.loading = true;
			})
			.addCase(getCurriculum.fulfilled, (state, { payload }) => {
				state.loading = false;
				state.curriculum = payload;
			})
			.addCase(getCurriculum.rejected, (state, { payload }) => {
				state.loading = false;
				state.error = payload as string;
			})
			.addCase(getFaculties.pending, (state) => {
				state.loading = true;
			})
			.addCase(getFaculties.fulfilled, (state, { payload }) => {
				state.loading = false;
				state.faculty = payload;
			})
			.addCase(getFaculties.rejected, (state, { payload }) => {
				state.loading = false;
				state.error = payload as string;
			})
			.addCase(getCourseFaculty.fulfilled, (state, { payload }) => {
				state.courseFaculty = payload;
			})
			.addCase(getOffers.fulfilled, (state, { payload }) => {
				state.offers = payload;
			})
			.addCase(saveOffers.pending, (state) => {
				state.saving = true;
			})
			.addCase(saveOffers.fulfilled, (state) => {
				state.saving = false;
			})
			.addCase(saveOffers.rejected, (state, { payload }) => {
				state.saving = false;
				state.error = payload as string;
			})
	},
});

export const {  } = semesterSlice.actions;
export const semesterReducer = semesterSlice.reducer;
export const selectCount = (state: RootState) => state.semester;