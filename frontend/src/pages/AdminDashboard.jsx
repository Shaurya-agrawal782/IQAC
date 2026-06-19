import { useEffect, useMemo, useState } from "react";
import client, { getActionPriorityQueue, getActionPriorityOverview } from "../api/client";
import Sidebar from "../components/Sidebar.jsx";
import StatsCards from "../components/StatsCards.jsx";
import RiskChart from "../components/RiskChart.jsx";
import DepartmentChart from "../components/DepartmentChart.jsx";
import AddFacultyDrawer from "../components/AddFacultyDrawer.jsx";
import NlqSearchBar from "../components/NlqSearchBar.jsx";
import ActionPriorityScoreCard from "../components/digitalTwin/ActionPriorityScoreCard.jsx";
import InterventionQueue from "../components/digitalTwin/InterventionQueue.jsx";
import WhatIfSimulator from "../components/digitalTwin/WhatIfSimulator.jsx";
import GeminiInterventionCopilot from "../components/digitalTwin/GeminiInterventionCopilot.jsx";


const NAV_ITEMS = [
  "Overview",
  "Add Department",
  "Add Faculty",
  "Accreditation Reports",
  "Department Compare",
  "Institutional Analysis"
];

const DRIVER_LABELS = {
  low_attendance: "Attendance",
  cgpa_decline: "GPA Decline",
  active_backlogs: "Backlogs",
  subject_failures: "Failures",
  placement_readiness_gap: "Placement Gap",
  accreditation_gap: "Accreditation",
  low_engagement: "Engagement",
  low_risk: "Healthy"
};

export default function AdminDashboard() {
  const [activeItem, setActiveItem] = useState("Overview");
  const [reportMode, setReportMode] = useState("");
  const [reportType, setReportType] = useState("STUDENT_PROGRESS");
  const [documentFormat, setDocumentFormat] = useState("PDF");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [downloadingReport, setDownloadingReport] = useState("");
  const [reportHistoryRows, setReportHistoryRows] = useState([]);
  const [reportStatus, setReportStatus] = useState("");
  const [entities, setEntities] = useState({ departments: [], faculties: [], students: [] });
  const [analytics, setAnalytics] = useState(null);
  const [faculties, setFaculties] = useState([]);
  const [departmentComparisonRows, setDepartmentComparisonRows] = useState([]);
  const [priorityOverview, setPriorityOverview] = useState(null);
  const [priorityQueue, setPriorityQueue] = useState([]);
  const [priorityLoading, setPriorityLoading] = useState(true);
  const [priorityError, setPriorityError] = useState("");
  const [selectedPriorityEntity, setSelectedPriorityEntity] = useState(null);

  const loadPriorityData = async () => {
    setPriorityLoading(true);
    setPriorityError("");
    try {
      const [overviewRes, queueRes] = await Promise.all([
        getActionPriorityOverview(),
        getActionPriorityQueue()
      ]);
      setPriorityOverview(overviewRes.data.data);
      setPriorityQueue(queueRes.data.data.items);
    } catch (err) {
      console.error("Error loading priority data:", err);
      setPriorityError("Unable to load intervention queue right now.");
    } finally {
      setPriorityLoading(false);
    }
  };

  const loadDashboard = async () => {
    const [entitiesRes, analyticsRes, facultyRes, departmentCompareRes] = await Promise.all([
      client.get("/admin/entities"),
      client.get("/admin/analytics"),
      client.get("/faculty"),
      client.get("/admin/department-comparison")
    ]);

    setEntities(entitiesRes.data.data || { departments: [], faculties: [], students: [] });
    setAnalytics(analyticsRes.data.data || null);
    setFaculties(facultyRes.data.data || []);
    setDepartmentComparisonRows(departmentCompareRes.data.data || []);
  };

  useEffect(() => {
    loadDashboard().catch(() => null);
    loadPriorityData().catch(() => null);
  }, []);

  useEffect(() => {
    if (activeItem === "Add Faculty") {
      setDrawerOpen(true);
    }

    if (activeItem !== "Accreditation Reports") {
      setReportMode("");
      setReportStatus("");
      setDownloadingReport("");
    }
  }, [activeItem]);

  const downloadReport = async () => {
    if (!reportType) return;
    setReportStatus("");
    setDownloadingReport(reportType);

    try {
      const payload = { reportType, format: documentFormat };
      const res = await client.post("/reports/generate", payload, {
        responseType: "blob"
      });

      const blob = new Blob([res.data], { type: documentFormat === "PDF" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");

      const ext = documentFormat === "PDF" ? "pdf" : "xlsx";
      a.href = url;
      a.download = `${reportType.toLowerCase()}_report.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setReportStatus("Report downloaded successfully.");
    } catch (error) {
      let msg = "Unable to generate report";
      try {
        if (error.response?.data instanceof Blob) {
          const text = await error.response.data.text();
          const json = JSON.parse(text);
          msg = json.message || msg;
        } else if (error.response?.data?.message) {
          msg = error.response.data.message;
        }
      } catch (_) { /* parsing failed, use default */ }
      setReportStatus(msg);
    } finally {
      setDownloadingReport("");
    }
  };

  const loadReportHistory = async () => {
    setReportStatus("");
    try {
      const { data } = await client.get("/reports/history");
      setReportHistoryRows(data.data || []);
    } catch (error) {
      setReportStatus(error.response?.data?.message || "Unable to load report history");
    }
  };

  const stats = useMemo(
    () => [
      {
        title: "Total Students",
        value: String(analytics?.summary?.totalStudents || entities.students?.length || 0),
        trend: "",
        trendUp: true,
        color: "from-blue-500/70 via-sky-400/70 to-cyan-300/70"
      },
      {
        title: "Total Faculty",
        value: String(analytics?.summary?.totalFaculties || faculties.length || 0),
        trend: "",
        trendUp: true,
        color: "from-emerald-500/65 via-teal-400/65 to-cyan-300/65"
      },
      {
        title: "Departments",
        value: String(analytics?.summary?.totalDepartments || entities.departments?.length || 0),
        trend: "",
        trendUp: true,
        color: "from-indigo-500/65 via-violet-400/65 to-fuchsia-300/65"
      },
      {
        title: "Faculty Achievements",
        value: String(analytics?.summary?.totalFacultyAchievements || 0),
        trend: "",
        trendUp: true,
        color: "from-amber-500/65 via-orange-400/65 to-rose-300/65"
      }
    ],
    [analytics, entities, faculties]
  );

  const riskDistribution = useMemo(() => {
    const rows = analytics?.departmentComparison || [];
    const sums = rows.reduce(
      (acc, row) => {
        acc.high += Number(row.riskDistribution?.high || 0);
        acc.medium += Number(row.riskDistribution?.medium || 0);
        acc.low += Number(row.riskDistribution?.low || 0);
        return acc;
      },
      { high: 0, medium: 0, low: 0 }
    );

    return [
      { name: "High Risk", value: sums.high, color: "#ef4444" },
      { name: "Medium Risk", value: sums.medium, color: "#f97316" },
      { name: "Low Risk", value: sums.low, color: "#16a34a" }
    ];
  }, [analytics]);

  const departmentComparison = useMemo(() => {
    return (departmentComparisonRows || []).map((row) => ({
      department: row.department,
      passPercentage: Number(row.passPercentage || 0),
      placementRate: Number(row.placementRate || 0),
      averageCGPA: Number(row.averageCGPA || 0)
    }));
  }, [departmentComparisonRows]);

  const facultyByDepartment = useMemo(() => {
    const buckets = new Map();
    faculties.forEach((row) => {
      const key = row.department?.code || row.department?.name || "UNASSIGNED";
      buckets.set(key, (buckets.get(key) || 0) + 1);
    });

    return Array.from(buckets.entries())
      .map(([department, count]) => ({ department, count }))
      .sort((a, b) => b.count - a.count);
  }, [faculties]);

  const handleCreateFaculty = async (payload) => {
    setSubmitting(true);
    try {
      await client.post("/faculty/add", payload);
      await loadDashboard();
      setActiveItem("Overview");
      setDrawerOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-[78vh] gap-6 lg:grid-cols-[260px,1fr]">
      <Sidebar items={NAV_ITEMS} activeItem={activeItem} onSelect={setActiveItem} />

      <section className="space-y-6">
        <header className="relative overflow-hidden rounded-3xl border border-white/45 bg-[radial-gradient(circle_at_15%_20%,rgba(37,99,235,0.16),transparent_38%),radial-gradient(circle_at_80%_30%,rgba(16,185,129,0.16),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.82),rgba(243,248,254,0.92))] p-5 shadow-xl shadow-slate-200/40 backdrop-blur-md">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-brand-ink/65">IQAC Academic Intelligence</p>
              <h1 className="mt-2 font-heading text-2xl text-brand-ink sm:text-3xl">University Analytics Control Panel</h1>
              <p className="mt-1 text-sm text-brand-ink/75">
                Institutional metrics, faculty intelligence, accreditation readiness, and department comparisons in one cockpit.
              </p>
            </div>
            <button
              onClick={() => setDrawerOpen(true)}
              className="rounded-xl bg-gradient-to-r from-brand-ink to-brand-ocean px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:scale-[1.02]"
            >
              Add Faculty
            </button>
          </div>
        </header>

        {activeItem === "Overview" && (
          <div className="space-y-6">
            <NlqSearchBar />
            <StatsCards stats={stats} />

            {/* College Digital Twin Intervention Engine */}
            <section className="space-y-4">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="font-heading text-2xl font-bold text-brand-ink dark:text-white">
                    College Digital Twin Intervention Engine
                  </h2>
                  <p className="text-sm text-brand-ink/75 dark:text-slate-400">
                    Ranks urgent academic, placement, and accreditation risks, then simulates intervention impact.
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="inline-flex items-center rounded-full bg-brand-ocean/10 px-2.5 py-1 text-[10px] font-bold text-brand-ocean dark:bg-sky-450/10 dark:text-sky-400">
                    Live from academic data
                  </span>
                  <span className="inline-flex items-center rounded-full bg-brand-mint/10 px-2.5 py-1 text-[10px] font-bold text-emerald-600 dark:bg-emerald-450/10 dark:text-emerald-450">
                    Explainable scoring
                  </span>
                  <span className="inline-flex items-center rounded-full bg-brand-flame/10 px-2.5 py-1 text-[10px] font-bold text-brand-flame dark:bg-rose-450/10 dark:text-rose-400">
                    Scenario simulation
                  </span>
                </div>
              </div>

              {priorityLoading ? (
                <div className="space-y-5 animate-pulse">
                  {/* Top Row Skeletons */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="h-44 rounded-3xl border border-slate-200/40 bg-gradient-to-br from-blue-50/20 via-white/80 to-cyan-50/20 p-5 dark:border-white/5 dark:bg-slate-900/30 flex flex-col justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 rounded-full bg-slate-200/50 dark:bg-slate-800"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-3 w-16 bg-slate-200/50 dark:bg-slate-800 rounded"></div>
                            <div className="h-4 w-32 bg-slate-200/50 dark:bg-slate-800 rounded"></div>
                          </div>
                        </div>
                        <div className="h-3.5 bg-slate-200/50 dark:bg-slate-800 rounded w-5/6"></div>
                      </div>
                    ))}
                  </div>
                  {/* Bottom Row Skeletons */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                    <div className="h-96 rounded-3xl border border-slate-200/40 bg-gradient-to-br from-blue-50/20 via-white/80 to-cyan-50/20 p-5 dark:border-white/5 dark:bg-slate-900/30"></div>
                    <div className="h-96 rounded-3xl border border-slate-200/40 bg-gradient-to-br from-blue-50/20 via-white/80 to-cyan-50/20 p-5 dark:border-white/5 dark:bg-slate-900/30"></div>
                  </div>
                </div>
              ) : priorityError ? (
                <div className="rounded-3xl border border-slate-200 bg-white/70 p-6 text-center text-sm text-red-500 dark:bg-slate-900/30">
                  {priorityError}
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Top Row: 3 Insight Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <ActionPriorityScoreCard overview={priorityOverview} />
                    
                    {/* Card 2: Critical Gaps Card (rose gradient) */}
                    <article className="rounded-3xl border border-slate-200/40 bg-gradient-to-br from-rose-50/40 via-white/80 to-white/90 p-5 shadow-sm backdrop-blur-md dark:border-white/10 dark:from-rose-950/10 dark:bg-slate-900/80 flex flex-col justify-between h-full transition-all duration-300 hover:shadow-md">
                      <div>
                        <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          System Threat Counter
                        </span>
                        <h4 className="mt-1.5 font-heading text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">
                          Urgent Risk Vectors
                        </h4>
                      </div>

                      <div className="mt-4 flex items-center gap-4">
                        <div className="flex-1 text-center bg-[#fff1f2] border border-[#fecdd3] rounded-2xl py-3 px-2 dark:bg-[#e11d48]/15 dark:border-[#e11d48]/30">
                          <span className="block text-2xl font-black text-[#e11d48] dark:text-rose-400 leading-none">
                            {priorityOverview.criticalItems || 0}
                          </span>
                          <span className="mt-1 block text-[9px] font-bold text-rose-600 dark:text-rose-455 uppercase tracking-wide">
                            Critical
                          </span>
                        </div>
                        <div className="flex-1 text-center bg-[#fffbeb] border border-[#fde68a] rounded-2xl py-3 px-2 dark:bg-[#d97706]/15 dark:border-[#d97706]/30">
                          <span className="block text-2xl font-black text-[#d97706] dark:text-amber-400 leading-none">
                            {priorityOverview.highItems || 0}
                          </span>
                          <span className="mt-1 block text-[9px] font-bold text-amber-600 dark:text-amber-455 uppercase tracking-wide">
                            High Urgency
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-200/40 dark:border-white/10">
                        <span className="block text-[8.5px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Status Overview
                        </span>
                        <p className="mt-0.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Requires intervention simulation before execution.
                        </p>
                      </div>
                    </article>

                    {/* Card 3: Urgency Drivers & Average APS (indigo gradient) */}
                    <article className="rounded-3xl border border-slate-200/40 bg-gradient-to-br from-indigo-50/40 via-white/80 to-white/90 p-5 shadow-sm backdrop-blur-md dark:border-white/10 dark:from-indigo-950/10 dark:bg-slate-900/80 flex flex-col justify-between h-full transition-all duration-300 hover:shadow-md">
                      <div>
                        <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Core Engine Indicator
                        </span>
                        <h4 className="mt-1.5 font-heading text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">
                          Average Urgency Score
                        </h4>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-3">
                        <div className="flex items-baseline gap-1">
                          <span className={`text-3xl font-black ${priorityOverview.actionPriorityScore >= 80 ? "text-[#e11d48] dark:text-rose-400" : priorityOverview.actionPriorityScore >= 60 ? "text-[#d97706] dark:text-amber-400" : "text-[#2563eb] dark:text-blue-450"}`}>
                            {priorityOverview.actionPriorityScore || 0}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">/ 100 APS</span>
                        </div>
                        
                        <div className="text-right">
                          <span className="block text-[8px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Primary Driver</span>
                          <span className="mt-0.5 inline-block rounded-lg bg-[#eff6ff] border border-[#bfdbfe] px-2 py-0.5 text-[10px] font-bold text-[#2563eb] dark:bg-blue-950/30 dark:text-sky-400 dark:border-sky-900/30 font-body">
                            {DRIVER_LABELS[priorityOverview.mainDrivers?.[0]] || priorityOverview.mainDrivers?.[0] || "None"}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-200/40 dark:border-white/10">
                        <span className="block text-[8.5px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Risk Drivers Analysis
                        </span>
                        <p className="mt-0.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Primary threat component affecting overall score.
                        </p>
                      </div>
                    </article>
                  </div>

                  {/* Second Row: Queue and Simulator Side-by-Side */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-stretch">
                    <InterventionQueue
                      items={priorityQueue}
                      onSimulateIntervention={setSelectedPriorityEntity}
                    />
                    <WhatIfSimulator
                      selectedEntity={selectedPriorityEntity}
                      defaultBaseline={priorityQueue && priorityQueue[0] ? priorityQueue[0] : null}
                    />
                  </div>

                  <GeminiInterventionCopilot selectedEntity={selectedPriorityEntity} />
                </div>
              )}
            </section>

            <div className="grid gap-5 xl:grid-cols-2">
              <RiskChart data={riskDistribution} />
              <DepartmentChart data={departmentComparison} />
            </div>

            <section className="rounded-3xl border border-white/45 bg-white/45 p-5 shadow-xl shadow-slate-200/35 backdrop-blur-md">
              <h3 className="font-heading text-xl text-brand-ink">Department Faculty Distribution</h3>
              <p className="mt-1 text-sm text-brand-ink/75">This updates instantly whenever a new faculty profile is created.</p>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {facultyByDepartment.map((row) => (
                  <article key={row.department} className="rounded-2xl border border-white/60 bg-white/70 p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.14em] text-brand-ink/60">{row.department}</p>
                    <p className="mt-2 text-3xl font-semibold text-brand-ink">{row.count}</p>
                    <p className="text-xs text-brand-ink/70">Faculty members</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-white/45 bg-white/45 p-5 shadow-xl shadow-slate-200/35 backdrop-blur-md">
              <h3 className="font-heading text-xl text-brand-ink">Faculty Directory Snapshot</h3>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="text-brand-ink/70">
                    <tr>
                      <th className="px-3 py-2">Name</th>
                      <th className="px-3 py-2">Employee ID</th>
                      <th className="px-3 py-2">Department</th>
                      <th className="px-3 py-2">Designation</th>
                      <th className="px-3 py-2">Sections</th>
                    </tr>
                  </thead>
                  <tbody>
                    {faculties.slice(0, 8).map((row) => (
                      <tr key={row._id} className="border-t border-brand-ink/10">
                        <td className="px-3 py-2 font-medium text-brand-ink">{row.name}</td>
                        <td className="px-3 py-2">{row.employeeId}</td>
                        <td className="px-3 py-2">{row.department?.code || row.department?.name}</td>
                        <td className="px-3 py-2">{row.designation}</td>
                        <td className="px-3 py-2">{(row.sections || []).join(", ") || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {activeItem !== "Overview" && activeItem !== "Add Faculty" && (
          <section className="rounded-3xl border border-white/45 bg-white/45 p-6 shadow-xl shadow-slate-200/35 backdrop-blur-md">
            <h3 className="font-heading text-xl text-brand-ink">{activeItem}</h3>
            <p className="mt-2 text-sm text-brand-ink/75">
              This panel is ready for workflow integration. The analytics widgets above are fully functional with live institutional data.
            </p>
            {activeItem === "Department Compare" && (
              <div className="mt-6">
                <DepartmentChart data={departmentComparison} />
              </div>
            )}
            {activeItem === "Accreditation Reports" && (
              <div className="mt-6 space-y-5">
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setReportMode("generate")}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold text-white shadow transition hover:scale-[1.02] ${reportMode === "generate" ? "bg-gradient-to-r from-brand-ink to-brand-ocean" : "bg-gradient-to-r from-brand-ink/80 to-brand-ocean/80"}`}
                  >
                    Report Generation
                  </button>
                  <button
                    onClick={async () => {
                      setReportMode("history");
                      await loadReportHistory();
                    }}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold text-white shadow transition hover:scale-[1.02] ${reportMode === "history" ? "bg-gradient-to-r from-brand-ocean to-brand-flame" : "bg-gradient-to-r from-brand-ocean/80 to-brand-flame/80"}`}
                  >
                    View Previous Reports
                  </button>
                </div>

                {reportStatus && <p className="text-sm text-brand-ink">{reportStatus}</p>}

                {reportMode === "generate" && (
                  <div className="rounded-2xl border border-white/55 bg-white/70 p-6 shadow-sm">
                    <h4 className="font-semibold text-brand-ink">Generate New System Report</h4>
                    <p className="mt-2 text-sm text-brand-ink/75">Select the report type and format. System will auto-aggregate data and attach LLM analysis where applicable.</p>

                    <div className="mt-5 grid max-w-lg gap-4">
                      <div>
                        <label className="text-sm font-medium text-brand-ink/80 block mb-1">Report Target</label>
                        <select
                          className="w-full rounded-xl border-brand-ink/20 bg-white/80 p-2 text-sm shadow-sm outline-none focus:border-brand-ocean focus:ring-1 focus:ring-brand-ocean"
                          value={reportType}
                          onChange={(e) => setReportType(e.target.value)}
                        >
                          <option value="STUDENT_PROGRESS">Student Academic Progress Report</option>
                          <option value="DEPARTMENT_PERFORMANCE">Department Performance Comparison</option>
                          <option value="CGPA_DISTRIBUTION">Institution CGPA Distribution Analysis</option>
                          <option value="BACKLOG_ANALYSIS">Backlog and Risk Analysis Report</option>
                          <option value="PLACEMENT">Placement Forecast and Statistics</option>
                          <option value="FACULTY_CONTRIBUTION">Faculty Contribution (NBA Criterion 4)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-brand-ink/80 block mb-1">Export Format</label>
                        <select
                          className="w-full rounded-xl border-brand-ink/20 bg-white/80 p-2 text-sm shadow-sm outline-none focus:border-brand-ocean focus:ring-1 focus:ring-brand-ocean"
                          value={documentFormat}
                          onChange={(e) => setDocumentFormat(e.target.value)}
                        >
                          <option value="PDF">Professional PDF Document</option>
                          <option value="EXCEL">Excel Spreadsheet (.xlsx)</option>
                        </select>
                      </div>

                      <button
                        onClick={downloadReport}
                        disabled={!!downloadingReport}
                        className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-ink to-brand-ocean px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:scale-[1.02] disabled:opacity-60"
                      >
                        {downloadingReport ? "Building Document..." : "Generate and Download"}
                      </button>
                    </div>
                  </div>
                )}

                {reportMode === "history" && (
                  <div className="overflow-x-auto rounded-2xl border border-white/50 bg-white/70 p-3">
                    <table className="min-w-full text-left text-sm">
                      <thead className="text-brand-ink/70">
                        <tr>
                          <th className="px-3 py-2">Report Type</th>
                          <th className="px-3 py-2">Format</th>
                          <th className="px-3 py-2">Generated By</th>
                          <th className="px-3 py-2">Created At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportHistoryRows.map((row) => (
                          <tr key={row._id} className="border-t border-brand-ink/10">
                            <td className="px-3 py-2">{row.reportType}</td>
                            <td className="px-3 py-2">{row.format}</td>
                            <td className="px-3 py-2">{row.generatedBy?.name || row.generatedBy?.email || "System"}</td>
                            <td className="px-3 py-2">{new Date(row.createdAt).toLocaleString()}</td>
                          </tr>
                        ))}
                        {!reportHistoryRows.length && (
                          <tr>
                            <td colSpan={4} className="px-3 py-5 text-center text-brand-ink/60">No previous reports found.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {activeItem === "Add Faculty" && (
          <section className="rounded-3xl border border-white/45 bg-white/45 p-6 shadow-xl shadow-slate-200/35 backdrop-blur-md">
            <h3 className="font-heading text-xl text-brand-ink">Faculty Management</h3>
            <p className="mt-2 text-sm text-brand-ink/75">Use the Add Faculty button to open the full profile creation drawer.</p>
            <button onClick={() => setDrawerOpen(true)} className="mt-4 rounded-xl bg-brand-ink px-4 py-2 text-white">Open Add Faculty</button>
          </section>
        )}
      </section>

      <AddFacultyDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          if (activeItem === "Add Faculty") setActiveItem("Overview");
        }}
        departments={entities.departments || []}
        onSubmit={handleCreateFaculty}
        loading={submitting}
      />
    </div>
  );
}
