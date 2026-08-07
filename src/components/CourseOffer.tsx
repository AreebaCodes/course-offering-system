import { Fragment, useEffect, useMemo, useState } from "react";
import { getCurriculum, getFaculties, getCourseFaculty, getOffers, saveOffers } from "../redux/semetser/semesterSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../redux/store";
import courses from "./listCourses";
import "./CourseOffer.css";

export const CourseOffer = function () {
	const [semesterIndex, setSemesterIndex] = useState(0);
	const semesters = ["Fall", "Spring"];
	const { faculty, curriculum, courseFaculty, offers, saving } = useSelector((state: RootState) => state.semester);
	const dispatch = useDispatch<AppDispatch>();

	const [selectedFaculty, setSelectedFaculty] = useState<{ [key: string]: string }>({});
	const [showClearConfirm, setShowClearConfirm] = useState(false);
	const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
	const [hasLoadedOffers, setHasLoadedOffers] = useState(false);

	useEffect(() => {
		dispatch(getCurriculum());
		dispatch(getFaculties());
		dispatch(getCourseFaculty());
		dispatch(getOffers());
	}, []);

	// Once faculty + offers are both available, hydrate selectedFaculty from the saved offers
	// (fid -> TeacherName lookup) so previously saved assignments show up in the dropdowns.
	useEffect(() => {
		if (hasLoadedOffers) return;
		if (!faculty.length || !offers) return;

		const fidToName: { [fid: number]: string } = {};
		faculty.forEach((f: any) => {
			fidToName[f.fid] = f.TeacherName;
		});

		const hydrated: { [key: string]: string } = {};
		offers.forEach((o) => {
			const name = fidToName[o.fid];
			if (name) {
				hydrated[`${o.cid}-${o.sec}`] = name;
			}
		});

		if (Object.keys(hydrated).length > 0) {
			setSelectedFaculty((prev) => ({ ...hydrated, ...prev }));
		}
		setHasLoadedOffers(true);
	}, [faculty, offers, hasLoadedOffers]);

	const handleFacultyChange = (courseId: number, column: string, value: string) => {
		const key = `${courseId}-${column}`;
		setSelectedFaculty({ ...selectedFaculty, [key]: value });
		setSaveStatus("idle");
	};

	const sems = [
		{ sno: 1, name: "1st" },
		{ sno: 2, name: "2nd" },
		{ sno: 3, name: "3rd" },
		{ sno: 4, name: "4th" },
		{ sno: 5, name: "5th" },
		{ sno: 6, name: "6th" },
		{ sno: 7, name: "7th" },
		{ sno: 8, name: "8th" },
	];

	const displayData = (curriculum && curriculum.length > 0) ? curriculum : courses;

	// Which sno values belong to the semester type currently on screen (Fall = odd, Spring = even).
	const currentSemSnos = sems
		.filter(s => semesterIndex === 0 ? s.sno % 2 === 1 : s.sno % 2 === 0)
		.map(s => s.sno);

	const nameToFid = useMemo(() => {
		const map: { [name: string]: number } = {};
		faculty.forEach((f: any) => {
			map[f.TeacherName] = f.fid;
		});
		return map;
	}, [faculty]);

	// Count how many times each teacher has been picked, per course, across that course's A-G sections.
	const buildCourseUsageMap = (courseId: number) => {
		const usageCount: { [name: string]: number } = {};
		['A', 'B', 'C', 'D', 'E', 'F', 'G'].forEach((col) => {
			const name = selectedFaculty[`${courseId}-${col}`];
			if (name) {
				usageCount[name] = (usageCount[name] || 0) + 1;
			}
		});
		return usageCount;
	};

	// For permanent faculty: only ONE course in the whole semester may use them up to 4 times.
	// Once any course has them at 4, every other course caps them at 2.
	const courseHoldsFourSlot = (teacherName: string, courseId: number) => {
		const coursesWithFour = displayData.filter((c: any) => {
			if (c.courseid === courseId) return false;
			const usage = buildCourseUsageMap(c.courseid);
			return (usage[teacherName] || 0) >= 4;
		});
		return coursesWithFour.length === 0;
	};

	// For a given course row, return the faculty allowed to still show in a given select:
	// - must be eligible to teach this course (per courseFaculty mapping), OR already selected here
	// - respects the per-course usage limits (visiting max 2, permanent max 4/2 rule)
	const getAvailableFacultyForCourse = (courseId: number, currentValue: string) => {
		const usageCount = buildCourseUsageMap(courseId);

		const eligibleFids = new Set(
			courseFaculty.filter((m) => m.cid === courseId).map((m) => m.fid)
		);

		return faculty.filter((f: any) => {
			if (f.TeacherName === currentValue) return true;
			if (!eligibleFids.has(f.fid)) return false;
			const used = usageCount[f.TeacherName] || 0;
			if (!f.fulltime) {
				return used < 2;
			}
			const limit = courseHoldsFourSlot(f.TeacherName, courseId) ? 4 : 2;
			return used < limit;
		});
	};

	// Clear every selection belonging to courses in the currently viewed semester type only.
	const handleClearAll = () => {
		const coursesInView = new Set(
			displayData
				.filter((c: any) => currentSemSnos.includes(c.semester))
				.map((c: any) => c.courseid)
		);

		setSelectedFaculty((prev) => {
			const next = { ...prev };
			Object.keys(next).forEach((key) => {
				const courseId = Number(key.split("-")[0]);
				if (coursesInView.has(courseId)) {
					delete next[key];
				}
			});
			return next;
		});
		setShowClearConfirm(false);
		setSaveStatus("idle");
	};

	// Save only the selections belonging to the currently viewed semester type (Fall or Spring).
	const handleSave = async () => {
		const courseSemMap: { [courseId: number]: number } = {};
		displayData.forEach((c: any) => {
			courseSemMap[c.courseid] = c.semester;
		});

		const offersToSave: { cid: number; fid: number; sec: string; semno: number }[] = [];
		Object.entries(selectedFaculty).forEach(([key, name]) => {
			if (!name) return;
			const [courseIdStr, sec] = key.split("-");
			const courseId = Number(courseIdStr);
			const semno = courseSemMap[courseId];
			if (!currentSemSnos.includes(semno)) return;
			const fid = nameToFid[name];
			if (fid === undefined) return;
			offersToSave.push({ cid: courseId, fid, sec, semno });
		});

		try {
			await dispatch(saveOffers({ semester: semesters[semesterIndex], offers: offersToSave })).unwrap();
			setSaveStatus("success");
		} catch {
			setSaveStatus("error");
		}
	};

	return (
		<div className="co-wrapper">
			<div className="co-topbar">
				<div className="co-semester-toggle">
					{semesters.map((label, idx) => (
						<button
							key={label}
							type="button"
							className={`co-semester-btn${semesterIndex === idx ? " active" : ""}`}
							onClick={() => setSemesterIndex(idx)}
						>
							{label} Semester
						</button>
					))}
				</div>

				<div className="co-legend">
					<span className="co-legend-item">
						<span className="co-dot permanent" />
						Permanent faculty
					</span>
					<span className="co-legend-item">
						<span className="co-dot visiting" />
						Visiting faculty
					</span>
				</div>

				<div className="co-actions">
					{saveStatus === "success" && <span className="co-save-msg success">Saved ✓</span>}
					{saveStatus === "error" && <span className="co-save-msg error">Save failed</span>}
					<button
						type="button"
						className="co-clear-btn"
						onClick={() => setShowClearConfirm(true)}
					>
						Clear All
					</button>
					<button
						type="button"
						className="co-save-btn"
						onClick={handleSave}
						disabled={saving}
					>
						{saving ? "Saving…" : "Save"}
					</button>
				</div>
			</div>

			<div className="co-card">
				<table className="co-table">
					<tbody>
						{sems
							.filter(s => semesterIndex === 0 ? s.sno % 2 === 1 : s.sno % 2 === 0)
							.map((s) => {
								const semesterCourses = displayData.filter((c: any) => c.semester === s.sno);
								return (
									<Fragment key={s.sno}>
										<tr className="co-sem-row">
											<th colSpan={2} className="co-sem-label">{s.name} Semester</th>
											<th className="co-sec-header">A</th>
											<th className="co-sec-header">B</th>
											<th className="co-sec-header">C</th>
											<th className="co-sec-header">D</th>
											<th className="co-sec-header">E</th>
											<th className="co-sec-header">F</th>
											<th className="co-sec-header">G</th>
										</tr>

										{semesterCourses.map((c: any, i: number) => (
											<tr key={c.courseid} className="co-course-row">
												<td className="co-idx">{i + 1}</td>
												<td className="co-title-cell">
													<span className="co-code">{c.code}</span>
													{c.title}
													<span className="co-crhr"> ({c.crhr}, 0)</span>
												</td>
												{['A', 'B', 'C', 'D', 'E', 'F', 'G'].map((col) => {
													const key = `${c.courseid}-${col}`;
													const currentValue = selectedFaculty[key] || '';
													const availableFaculty = getAvailableFacultyForCourse(c.courseid, currentValue);
													return (
														<td key={col} className="co-sec-cell">
															<select
																value={currentValue}
																onChange={(e) => handleFacultyChange(c.courseid, col, e.target.value)}
																className={`co-select${currentValue ? " co-select-filled" : " co-select-empty"}`}
															>
																<option value="">— Select —</option>
																{availableFaculty.map((f: any) => (
																	<option
																		key={f.fid}
																		value={f.TeacherName}
																		style={{ fontWeight: f.fulltime ? 700 : 400 }}
																	>
																		{f.TeacherName}
																	</option>
																))}
															</select>
														</td>
													);
												})}
											</tr>
										))}
									</Fragment>
								);
							})}
					</tbody>
				</table>
			</div>

			{showClearConfirm && (
				<div className="co-modal-overlay" onClick={() => setShowClearConfirm(false)}>
					<div className="co-modal" onClick={(e) => e.stopPropagation()}>
						<h3>Clear all selections?</h3>
						<p>
							This removes every faculty selection for the {semesters[semesterIndex]} semester
							courses shown below. This can't be undone.
						</p>
						<div className="co-modal-actions">
							<button
								type="button"
								className="co-modal-btn cancel"
								onClick={() => setShowClearConfirm(false)}
							>
								Cancel
							</button>
							<button
								type="button"
								className="co-modal-btn confirm"
								onClick={handleClearAll}
							>
								Clear All
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};