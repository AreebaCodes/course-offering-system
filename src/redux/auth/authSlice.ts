import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../store";
import axios from "axios";

export interface AuthUser {
	id: string;
	name: string;
	email: string;
	role: "admin" | "student";
}

interface AuthState {
	user: AuthUser | null;
	token: string | null;
	loading: boolean;
	error: string;
}

// sessionStorage (not localStorage) on purpose: session should end when the browser tab/window closes.
const storedToken = sessionStorage.getItem("token");
const storedUser = sessionStorage.getItem("user");

const initialState: AuthState = {
	user: storedUser ? JSON.parse(storedUser) : null,
	token: storedToken || null,
	loading: false,
	error: "",
};

export const login = createAsyncThunk(
	"auth/login",
	async (params: { email: string; password: string }, { rejectWithValue }) => {
		try {
			const response = await axios.post("/api/auth/login", params);
			return response.data as { token: string; user: AuthUser };
		} catch (err: any) {
			return rejectWithValue(err?.response?.data?.message || "Login failed");
		}
	}
);

export const signup = createAsyncThunk(
	"auth/signup",
	async (params: { name: string; email: string; password: string }, { rejectWithValue }) => {
		try {
			const response = await axios.post("/api/auth/signup", params);
			return response.data as { token: string; user: AuthUser };
		} catch (err: any) {
			return rejectWithValue(err?.response?.data?.message || "Signup failed");
		}
	}
);

export const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		logout: (state) => {
			state.user = null;
			state.token = null;
			state.error = "";
			sessionStorage.removeItem("token");
			sessionStorage.removeItem("user");
		},
		clearAuthError: (state) => {
			state.error = "";
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(login.pending, (state) => {
				state.loading = true;
				state.error = "";
			})
			.addCase(login.fulfilled, (state, { payload }) => {
				state.loading = false;
				state.user = payload.user;
				state.token = payload.token;
				sessionStorage.setItem("token", payload.token);
				sessionStorage.setItem("user", JSON.stringify(payload.user));
			})
			.addCase(login.rejected, (state, { payload }) => {
				state.loading = false;
				state.error = (payload as string) || "Login failed";
			})
			.addCase(signup.pending, (state) => {
				state.loading = true;
				state.error = "";
			})
			.addCase(signup.fulfilled, (state, { payload }) => {
				state.loading = false;
				state.user = payload.user;
				state.token = payload.token;
				sessionStorage.setItem("token", payload.token);
				sessionStorage.setItem("user", JSON.stringify(payload.user));
			})
			.addCase(signup.rejected, (state, { payload }) => {
				state.loading = false;
				state.error = (payload as string) || "Signup failed";
			});
	},
});

export const { logout, clearAuthError } = authSlice.actions;
export const authReducer = authSlice.reducer;
export const selectAuth = (state: RootState) => state.auth;