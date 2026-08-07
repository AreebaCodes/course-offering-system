import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../redux/store";
import { getFaculties, getOffers } from "../redux/semetser/semesterSlice";
import "./WorkloadDashboard.css";

type SortKey = "load-desc" | "load-asc" | "name";

export const WorkloadDashboard = function () {
	const [semesterIndex, setSemesterIndex] = useState(0);
	const semesters = ["Fall", "Spring"];
	const [sortKey, setSortKey] = useState<SortKey>("load-desc");
	const [showIdleOnly, setShowIdleOnly] = useState(false);

	const { faculty, offers } = useSelector((state: RootState) => state.semester);
	const dispatch = useDispatch<AppDispatch>();

	useEffect(() => {
		dispatch(getFaculties());
		dispatch(getOffers());
	}, []);

	const currentSemesterLabel = semesters[semesterIndex];

	const rows = useMemo(() => {
		const semesterOffers = offers.filter((o) => o.semester === currentSemesterLabel);

		return faculty.map((f: any) => {
			const assigned = semesterOffers.filter((o) => o.fid === f.fid);
			const distinctCourses = new Set(assigned.map((o) => o.cid)).size;
			const limit = f.fulltime ? 4 : 2;
			const sectionCount = assigned.length;
			const pctOfLimit = Math.min(100, Math.round((sectionCount / limit) * 100));

			return {
				fid: f.fid,
				name: f.TeacherName,
				fulltime: f.fulltime as boolean,
				sectionCount,
				distinctCourses,
				limit,
				pctOfLimit,
				overLimit: sectionCount > limit,
			};
		});
	}, [faculty, offers, currentSemesterLabel]);

	const filteredRows = useMemo(() => {
		let result = rows;
		if (showIdleOnly) {
			result = result.filter((r) => r.sectionCount === 0);
		}
		return [...result].sort((a, b) => {
			if (sortKey === "load-desc") return b.sectionCount - a.sectionCount;
			if (sortKey === "load-asc") return a.sectionCount - b.sectionCount;
			return a.name.localeCompare(b.name);
		});
	}, [rows, sortKey, showIdleOnly]);

	const totals = useMemo(() => {
		const totalSections = rows.reduce((sum, r) => sum + r.sectionCount, 0);
		const activeFaculty = rows.filter((r) => r.sectionCount > 0).length;
		const idleFaculty = rows.filter((r) => r.sectionCount === 0).length;
		const overLimitFaculty = rows.filter((r) => r.overLimit).length;
		return { totalSections, activeFaculty, idleFaculty, overLimitFaculty };
	}, [rows]);

	return (
		<div className="wl-wrapper">
			<div className="wl-topbar">
				<div className="wl-semester-toggle">
					{semesters.map((label, idx) => (
						<button
							key={label}
							type="button"
							className={`wl-semester-btn${semesterIndex === idx ? " active" : ""}`}
							onClick={() => setSemesterIndex(idx)}
						>
							{label} Semester
						</button>
					))}
				</div>
				<h2>Faculty Workload</h2>
			</div>

			<div className="wl-stats">
				<div className="wl-stat-card">
					<span className="wl-stat-value">{totals.totalSections}</span>
					<span className="wl-stat-label">Sections offered</span>
				</div>
				<div className="wl-stat-card">
					<span className="wl-stat-value">{totals.activeFaculty}</span>
					<span className="wl-stat-label">Faculty assigned</span>
				</div>
				<div className="wl-stat-card wl-stat-idle">
					<span className="wl-stat-value">{totals.idleFaculty}</span>
					<span className="wl-stat-label">Faculty with no load</span>
				</div>
				<div className={`wl-stat-card${totals.overLimitFaculty > 0 ? " wl-stat-warning" : ""}`}>
					<span className="wl-stat-value">{totals.overLimitFaculty}</span>
					<span className="wl-stat-label">Over their limit</span>
				</div>
			</div>

			<div className="wl-controls">
				<label className="wl-checkbox">
					<input
						type="checkbox"
						checked={showIdleOnly}
						onChange={(e) => setShowIdleOnly(e.target.checked)}
					/>
					Show idle faculty only
				</label>

				<select
					className="wl-sort-select"
					value={sortKey}
					onChange={(e) => setSortKey(e.target.value as SortKey)}
				>
					<option value="load-desc">Sort: Highest load first</option>
					<option value="load-asc">Sort: Lowest load first</option>
					<option value="name">Sort: Name (A–Z)</option>
				</select>
			</div>

			<div className="wl-card">
				<table className="wl-table">
					<thead>
						<tr>
							<th className="wl-th-name">Faculty</th>
							<th>Type</th>
							<th>Courses</th>
							<th>Sections</th>
							<th className="wl-th-progress">Load vs limit</th>
						</tr>
					</thead>
					<tbody>
						{filteredRows.length === 0 && (
							<tr>
								<td colSpan={5} className="wl-empty">No faculty match this filter.</td>
							</tr>
						)}
						{filteredRows.map((r) => (
							<tr key={r.fid} className={r.sectionCount === 0 ? "wl-row-idle" : ""}>
								<td className="wl-name-cell">
									<span style={{ fontWeight: r.fulltime ? 700 : 400 }}>{r.name}</span>
								</td>
								<td>
									<span className={`wl-badge${r.fulltime ? " wl-badge-permanent" : " wl-badge-visiting"}`}>
										{r.fulltime ? "Permanent" : "Visiting"}
									</span>
								</td>
								<td className="wl-num">{r.distinctCourses}</td>
								<td className="wl-num">{r.sectionCount} / {r.limit}</td>
								<td>
									<div className="wl-progress-track">
										<div
											className={`wl-progress-fill${r.overLimit ? " wl-progress-over" : ""}`}
											style={{ width: `${r.pctOfLimit}%` }}
										/>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};