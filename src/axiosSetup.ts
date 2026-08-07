import axios from "axios";

// Attaches the current session's auth token (if any) to every outgoing request.
// Runs once at app startup; reads fresh from sessionStorage on each request so
// login/logout during the session are picked up automatically.
axios.interceptors.request.use((config) => {
	const token = sessionStorage.getItem("token");
	if (token) {
		config.headers = config.headers || {};
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});