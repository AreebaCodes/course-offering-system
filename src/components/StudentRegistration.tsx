import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../redux/store";
import { getCurriculum, getFaculties, getOffers } from "../redux/semetser/semesterSlice";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import courses from "./listCourses";
import "./StudentRegistration.css";

interface MyRegistration {
	_id: string;
	cid: number;
	sec: string;
	semester: string;
}

export const StudentRegistration = function () {
	const [semesterIndex, setSemesterIndex] = useState(0);
	const semesters = ["Fall", "Spring"];
	const { curriculum, faculty, offers } = useSelector((state: RootState) => state.semester);
	const { user } = useSelector((state: RootState) => state.auth);
	const dispatch = useDispatch<AppDispatch>();

	const [myRegistrations, setMyRegistrations] = useState<MyRegistration[]>([]);
	// Local, unsaved picks: { [cid]: sec }. Nothing here touches the backend until Save is pressed.
	const [pendingSelections, setPendingSelections] = useState<{ [cid: number]: string }>({});
	const [saving, setSaving] = useState(false);
	const [busyKey, setBusyKey] = useState<string | null>(null);
	const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

	useEffect(() => {
		dispatch(getCurriculum());
		dispatch(getFaculties());
		dispatch(getOffers());
		fetchMyRegistrations();
	}, []);

	// Switching semester tabs should not carry over unsaved picks from the other semester's view.
	useEffect(() => {
		setPendingSelections({});
	}, [semesterIndex]);

	const fetchMyRegistrations = async () => {
		try {
			const res = await axios.get("/api/my-registrations");
			setMyRegistrations(res.data);
		} catch {
			// silent — registrations panel just stays empty
		}
	};

	const displayData = (curriculum && curriculum.length > 0) ? curriculum : courses;

	const fidToFaculty = useMemo(() => {
		const map: { [fid: number]: any } = {};
		faculty.forEach((f: any) => {
			map[f.fid] = f;
		});
		return map;
	}, [faculty]);

	const currentSemesterLabel = semesters[semesterIndex];

	// Offered sections for the current semester, grouped by course.
	const offersByCourse = useMemo(() => {
		const grouped: { [cid: number]: { sec: string; fid: number }[] } = {};
		offers
			.filter((o) => o.semester === currentSemesterLabel)
			.forEach((o) => {
				if (!grouped[o.cid]) grouped[o.cid] = [];
				grouped[o.cid].push({ sec: o.sec, fid: o.fid });
			});
		return grouped;
	}, [offers, currentSemesterLabel]);

	const myRegisteredCids = useMemo(() => {
		const set = new Set<number>();
		myRegistrations
			.filter((r) => r.semester === currentSemesterLabel)
			.forEach((r) => set.add(r.cid));
		return set;
	}, [myRegistrations, currentSemesterLabel]);

	const getMyRegistrationFor = (cid: number) =>
		myRegistrations.find((r) => r.cid === cid && r.semester === currentSemesterLabel);

	// Clicking a section only stages it locally — one pending pick per course.
	const handleSelectSection = (cid: number, sec: string) => {
		setMessage(null);
		setPendingSelections((prev) => {
			const next = { ...prev };
			if (next[cid] === sec) {
				delete next[cid]; // clicking the same section again un-picks it
			} else {
				next[cid] = sec;
			}
			return next;
		});
	};

	const pendingCount = Object.keys(pendingSelections).length;

	const handleSave = async () => {
		if (pendingCount === 0) return;
		setSaving(true);
		setMessage(null);

		let successCount = 0;
		let firstError = "";

		for (const [cidStr, sec] of Object.entries(pendingSelections)) {
			const cid = Number(cidStr);
			try {
				await axios.post("/api/register", { cid, sec, semester: currentSemesterLabel });
				successCount++;
			} catch (err: any) {
				firstError = err?.response?.data?.message || "Some registrations failed.";
			}
		}

		await fetchMyRegistrations();
		setPendingSelections({});
		setSaving(false);

		if (firstError) {
			setMessage({ type: "error", text: `${successCount} registered, but: ${firstError}` });
		} else {
			setMessage({ type: "success", text: `Saved ${successCount} registration${successCount === 1 ? "" : "s"}.` });
		}
	};

	// Clears only unsaved local picks — already-saved registrations are untouched.
	const handleClearPending = () => {
		setPendingSelections({});
		setMessage(null);
	};

	const handleDrop = async (registrationId: string) => {
		setBusyKey(registrationId);
		setMessage(null);
		try {
			await axios.delete(`/api/register/${registrationId}`);
			await fetchMyRegistrations();
			setMessage({ type: "success", text: "Dropped." });
		} catch (err: any) {
			setMessage({ type: "error", text: err?.response?.data?.message || "Could not drop course." });
		} finally {
			setBusyKey(null);
		}
	};

	// Builds a PDF of the student's own saved registrations for the semester currently on screen.
	const handleExportPdf = () => {
		const cidToCourse: { [cid: number]: any } = {};
		displayData.forEach((c: any) => {
			cidToCourse[c.courseid] = c;
		});

		const rows = myRegistrations
			.filter((r) => r.semester === currentSemesterLabel)
			.map((r) => {
				const course = cidToCourse[r.cid];
				const offer = offers.find((o) => o.cid === r.cid && o.sec === r.sec && o.semester === currentSemesterLabel);
				const teacher = offer ? fidToFaculty[offer.fid] : undefined;
				return [
					course?.code || "—",
					course?.title || "—",
					r.sec,
					String(course?.crhr ?? "—"),
					teacher?.TeacherName || "TBA",
				];
			});

		const doc = new jsPDF();

		doc.setFontSize(14);
		doc.text("Course Registration Slip", 14, 18);
		doc.setFontSize(10);
		doc.setTextColor(100);
		doc.text(`Student: ${user?.name || "—"}  |  Email: ${user?.email || "—"}`, 14, 25);
		doc.text(`Semester: ${currentSemesterLabel}  |  Generated: ${new Date().toLocaleDateString()}`, 14, 30);

		autoTable(doc, {
			startY: 36,
			head: [["Code", "Title", "Section", "Cr Hr", "Faculty"]],
			body: rows.length > 0 ? rows : [["—", "No registered courses this semester", "—", "—", "—"]],
			headStyles: { fillColor: [27, 42, 74] },
			styles: { fontSize: 9, cellPadding: 3 },
		});

		const fileSafeName = (user?.name || "student").replace(/[^a-z0-9]+/gi, "_");
		doc.save(`${fileSafeName}_${currentSemesterLabel}_registration.pdf`);
	};

	// Only show courses that have at least one offered section this semester.
	const coursesWithOfferings = displayData.filter((c: any) => offersByCourse[c.courseid]?.length > 0);

	return (
		<div className="sr-wrapper">
			<div className="sr-topbar">
				<div className="sr-semester-toggle">
					{semesters.map((label, idx) => (
						<button
							key={label}
							type="button"
							className={`sr-semester-btn${semesterIndex === idx ? " active" : ""}`}
							onClick={() => setSemesterIndex(idx)}
						>
							{label} Semester
						</button>
					))}
				</div>
				<h2>Course Registration</h2>
				<div className="sr-actions">
					<button
						type="button"
						className="sr-export-btn"
						onClick={handleExportPdf}
						disabled={myRegistrations.filter((r) => r.semester === currentSemesterLabel).length === 0}
					>
						Export PDF
					</button>
					<button
						type="button"
						className="sr-clear-btn"
						onClick={handleClearPending}
						disabled={pendingCount === 0}
					>
						Clear
					</button>
					<button
						type="button"
						className="sr-save-btn"
						onClick={handleSave}
						disabled={pendingCount === 0 || saving}
					>
						{saving ? "Saving…" : `Save${pendingCount > 0 ? ` (${pendingCount})` : ""}`}
					</button>
				</div>
			</div>

			{message && (
				<div className={`sr-banner ${message.type}`}>{message.text}</div>
			)}

			<div className="sr-list">
				{coursesWithOfferings.length === 0 && (
					<div className="sr-empty">No sections have been offered for {currentSemesterLabel} yet. Check back later.</div>
				)}

				{coursesWithOfferings.map((c: any) => {
					const sections = offersByCourse[c.courseid] || [];
					const myReg = getMyRegistrationFor(c.courseid);
					const alreadyRegistered = myRegisteredCids.has(c.courseid);
					const pendingSec = pendingSelections[c.courseid];

					return (
						<div key={c.courseid} className="sr-course-card">
							<div className="sr-course-head">
								<div>
									<span className="sr-code">{c.code}</span>
									<span className="sr-title">{c.title}</span>
									<span className="sr-crhr">({c.crhr} cr hr)</span>
								</div>
								{alreadyRegistered && myReg && (
									<span className="sr-registered-pill">
										Registered — Section {myReg.sec}
										<button
											type="button"
											className="sr-drop-btn"
											onClick={() => handleDrop(myReg._id)}
											disabled={busyKey === myReg._id}
										>
											{busyKey === myReg._id ? "…" : "Drop"}
										</button>
									</span>
								)}
								{!alreadyRegistered && pendingSec && (
									<span className="sr-pending-pill">Pending — Section {pendingSec}</span>
								)}
							</div>

							<div className="sr-sections">
								{sections.map(({ sec, fid }) => {
									const f = fidToFaculty[fid];
									const isMySection = myReg?.sec === sec;
									const isPending = !alreadyRegistered && pendingSec === sec;
									return (
										<div
											key={sec}
											className={`sr-section-row${isMySection ? " sr-section-mine" : ""}${isPending ? " sr-section-pending" : ""}`}
										>
											<span className="sr-sec-label">Sec {sec}</span>
											<span className="sr-sec-teacher">
												{f ? f.TeacherName : "TBA"}
												{f?.fulltime && <span className="sr-badge">Permanent</span>}
											</span>
											<button
												type="button"
												className={`sr-register-btn${isMySection ? " sr-register-btn-mine" : ""}${isPending ? " sr-register-btn-pending" : ""}`}
												disabled={alreadyRegistered}
												onClick={() => handleSelectSection(c.courseid, sec)}
											>
												{isMySection
													? "✓ Your section"
													: alreadyRegistered
													? "Unavailable"
													: isPending
													? "Selected"
													: "Select"}
											</button>
										</div>
									);
								})}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};