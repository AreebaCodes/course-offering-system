import { useState } from "react";
import "./App.css";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "./redux/store";
import { logout } from "./redux/auth/authSlice";
import { CourseOffer } from "./components/CourseOffer";
import { StudentRegistration } from "./components/StudentRegistration";
import { WorkloadDashboard } from "./components/WorkloadDashboard";
import { Auth } from "./components/Auth";

export default function App() {
	const { user } = useSelector((state: RootState) => state.auth);
	const dispatch = useDispatch<AppDispatch>();
	const [adminView, setAdminView] = useState<"offer" | "workload">("offer");

	if (!user) {
		return <Auth />;
	}

	return (
		<div className="App">
			<div style={{
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
				padding: "10px 4px 16px",
				flexWrap: "wrap",
				gap: 10,
				fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Roboto, sans-serif",
			}}>
				<div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
					<span style={{ fontSize: 13, color: "#6b7280" }}>
						Signed in as <strong style={{ color: "#1f2937" }}>{user.name}</strong>{" "}
						<span style={{
							fontSize: 10.5,
							fontWeight: 700,
							color: user.role === "admin" ? "#2d6a4f" : "#1b2a4a",
							background: user.role === "admin" ? "#e7f3ed" : "#eef1f6",
							padding: "2px 8px",
							borderRadius: 999,
							marginLeft: 6,
							textTransform: "uppercase",
							letterSpacing: "0.03em",
						}}>
							{user.role}
						</span>
					</span>

					{user.role === "admin" && (
						<div style={{ display: "inline-flex", background: "#eef1f6", borderRadius: 999, padding: 3, gap: 2 }}>
							<button
								type="button"
								onClick={() => setAdminView("offer")}
								style={{
									appearance: "none",
									border: "none",
									background: adminView === "offer" ? "#1b2a4a" : "transparent",
									color: adminView === "offer" ? "#fff" : "#5b6472",
									fontSize: 12.5,
									fontWeight: 600,
									padding: "6px 14px",
									borderRadius: 999,
									cursor: "pointer",
								}}
							>
								Course Offer
							</button>
							<button
								type="button"
								onClick={() => setAdminView("workload")}
								style={{
									appearance: "none",
									border: "none",
									background: adminView === "workload" ? "#1b2a4a" : "transparent",
									color: adminView === "workload" ? "#fff" : "#5b6472",
									fontSize: 12.5,
									fontWeight: 600,
									padding: "6px 14px",
									borderRadius: 999,
									cursor: "pointer",
								}}
							>
								Workload
							</button>
						</div>
					)}
				</div>

				<button
					type="button"
					onClick={() => dispatch(logout())}
					style={{
						appearance: "none",
						border: "1px solid #e2e5eb",
						background: "#fff",
						color: "#374151",
						fontSize: 12.5,
						fontWeight: 600,
						padding: "6px 14px",
						borderRadius: 7,
						cursor: "pointer",
					}}
				>
					Log Out
				</button>
			</div>

			{user.role === "admin" ? (
				adminView === "offer" ? <CourseOffer /> : <WorkloadDashboard />
			) : (
				<StudentRegistration />
			)}
		</div>
	);
}