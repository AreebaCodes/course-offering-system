import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../redux/store";
import { login, signup, clearAuthError } from "../redux/auth/authSlice";
import "./Auth.css";

export const Auth = function () {
	const [mode, setMode] = useState<"login" | "signup">("login");
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const dispatch = useDispatch<AppDispatch>();
	const { loading, error } = useSelector((state: RootState) => state.auth);

	const switchMode = (next: "login" | "signup") => {
		setMode(next);
		dispatch(clearAuthError());
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (mode === "login") {
			dispatch(login({ email, password }));
		} else {
			dispatch(signup({ name, email, password }));
		}
	};

	return (
		<div className="auth-wrapper">
			<div className="auth-card">
				<div className="auth-header">
					<div className="auth-badge">SZ</div>
					<h1>Course Offering Portal</h1>
					<p>{mode === "login" ? "Sign in to continue" : "Create your student account"}</p>
				</div>

				<div className="auth-tabs">
					<button
						type="button"
						className={`auth-tab${mode === "login" ? " active" : ""}`}
						onClick={() => switchMode("login")}
					>
						Log In
					</button>
					<button
						type="button"
						className={`auth-tab${mode === "signup" ? " active" : ""}`}
						onClick={() => switchMode("signup")}
					>
						Sign Up
					</button>
				</div>

				<form className="auth-form" onSubmit={handleSubmit}>
					{mode === "signup" && (
						<label className="auth-field">
							<span>Full name</span>
							<input
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="Areeba Khan"
								required
							/>
						</label>
					)}

					<label className="auth-field">
						<span>Email</span>
						<input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="you@szabist.pk"
							required
						/>
					</label>

					<label className="auth-field">
						<span>Password</span>
						<input
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="••••••••"
							required
							minLength={mode === "signup" ? 6 : undefined}
						/>
					</label>

					{error && <div className="auth-error">{error}</div>}

					<button type="submit" className="auth-submit" disabled={loading}>
						{loading ? "Please wait…" : mode === "login" ? "Log In" : "Create Account"}
					</button>
				</form>

				{mode === "signup" && (
					<p className="auth-note">Signup creates a student account. Admin access is granted separately.</p>
				)}
			</div>
		</div>
	);
};