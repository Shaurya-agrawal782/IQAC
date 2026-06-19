import React, { useState } from "react";

export default function InterventionQueue({ items, onFilterChange, onSimulateIntervention }) {
  const [expandedId, setExpandedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState("");
  const [showAll, setShowAll] = useState(false);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const severityChips = {
    critical: "bg-[#fff1f2] text-[#e11d48] border border-[#fecdd3] dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/40",
    high: "bg-[#fffbeb] text-[#d97706] border border-[#fde68a] dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/40",
    moderate: "bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe] dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/40",
    low: "bg-[#ecfdf5] text-[#059669] border border-[#bbf7d0] dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/40"
  };

  const entityTypeBadges = {
    student: "bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe] dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-900/30",
    cohort: "bg-[#faf5ff] text-[#7c3aed] border border-[#e9d5ff] dark:bg-purple-950/30 dark:text-purple-300 dark:border-purple-900/30",
    department: "bg-[#eef2ff] text-[#4f46e5] border border-[#c7d2fe] dark:bg-indigo-950/30 dark:text-indigo-300 dark:border-indigo-900/30",
    accreditation: "bg-[#f0fdfa] text-[#0d9488] border border-[#99f6e4] dark:bg-teal-950/30 dark:text-teal-300 dark:border-teal-900/30"
  };

  const driverLabels = {
    low_attendance: "Attendance",
    cgpa_decline: "GPA Drop",
    active_backlogs: "Backlogs",
    subject_failures: "Failures",
    placement_readiness_gap: "Placement",
    accreditation_gap: "Accreditation",
    low_engagement: "Engagement",
    low_risk: "Healthy"
  };

  // Filter items
  const filtered = (items || []).filter(item => {
    const matchesSearch = item.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.department && item.department.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDept = selectedDept === "" || item.department === selectedDept;
    const matchesSeverity = selectedSeverity === "" || item.severity === selectedSeverity;
    return matchesSearch && matchesDept && matchesSeverity;
  });

  // Limit display size
  const displayedItems = showAll ? filtered : filtered.slice(0, 4);

  const uniqueDepts = Array.from(new Set((items || []).map(item => item.department).filter(Boolean)));

  return (
    <div className="rounded-3xl border border-slate-200/40 bg-gradient-to-br from-blue-50/30 via-white/80 to-cyan-50/20 p-5 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-slate-900/80 dark:from-slate-900/80 dark:to-slate-900/85 flex flex-col justify-between h-full transition-all duration-300 hover:shadow-md">
      <div className="space-y-4">
        {/* Header and filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/40 pb-3 dark:border-white/10">
          <div>
            <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-slate-100">Intervention Stack</h3>
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
              Ranked cohort and individual priority levels
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 text-[10px]">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-white/15 dark:bg-slate-800 dark:text-white max-w-[120px]"
            />

            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-1 py-1 text-slate-700 outline-none focus:border-blue-500 dark:border-white/15 dark:bg-slate-800 dark:text-white"
            >
              <option value="">Depts</option>
              {uniqueDepts.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-1 py-1 text-slate-700 outline-none focus:border-blue-500 dark:border-white/15 dark:bg-slate-800 dark:text-white"
            >
              <option value="">Severity</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="moderate">Moderate</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* List of items (No scrollbars, clean rows) */}
        <div className="space-y-2">
          {displayedItems.map((item, index) => {
            const isExpanded = expandedId === item.id;
            return (
              <article
                key={item.id}
                onClick={() => toggleExpand(item.id)}
                className={`overflow-hidden rounded-xl border transition-all duration-200 hover:shadow-sm cursor-pointer ${
                  isExpanded 
                    ? "border-blue-500/40 bg-blue-50/20 dark:border-blue-400/40 dark:bg-blue-950/20" 
                    : "border-slate-200/60 bg-white/95 hover:bg-white dark:border-white/5 dark:bg-slate-900/30 dark:hover:bg-slate-800/40"
                } ${item.severity === "critical" ? "border-l-4 border-l-[#e11d48]" : ""}`}
              >
                {/* Collapsed view summary */}
                <div className="flex items-center justify-between gap-3 p-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-[#112a46] text-xs font-black text-white dark:bg-blue-600 dark:text-white">
                      {index + 1}
                    </span>
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`rounded px-1.5 py-0.2 text-[8px] font-extrabold uppercase tracking-wider ${entityTypeBadges[item.entityType]}`}>
                          {item.entityType}
                        </span>
                        <h4 className="font-bold text-slate-900 dark:text-slate-100 truncate">
                          {item.label}
                        </h4>
                      </div>

                      {/* Details row */}
                      <div className="mt-0.5 flex flex-wrap gap-x-2 text-[10px] text-slate-500 dark:text-slate-400">
                        {item.department && <span>{item.department}</span>}
                        {item.semester && <span>Sem {item.semester}</span>}
                        <span className="truncate">
                          Drivers: <strong className="font-semibold text-slate-700 dark:text-slate-300">{item.drivers.slice(0, 2).map(d => driverLabels[d] || d).join(", ")}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & scores */}
                  <div className="flex items-center gap-3">
                    {onSimulateIntervention && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSimulateIntervention(item);
                        }}
                        className="rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-sm hover:shadow hover:brightness-105 active:scale-[0.98] transition-all px-2.5 py-1 text-[10px] font-bold select-none"
                      >
                        Simulate
                      </button>
                    )}

                    <div className="text-right flex-shrink-0">
                      <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider leading-none">Score</span>
                      <span className="text-sm font-black text-slate-900 dark:text-white leading-none">{item.score}</span>
                    </div>

                    <span className={`rounded-md border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider flex-shrink-0 ${severityChips[item.severity]}`}>
                      {item.severity}
                    </span>
                  </div>
                </div>

                {/* Expanded Details Drawer */}
                {isExpanded && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="border-t border-slate-200/40 bg-white/60 p-4 dark:border-white/5 dark:bg-slate-900/40 text-[11px] leading-relaxed"
                  >
                    <div className="grid gap-4 md:grid-cols-[1.2fr,1.8fr]">
                      
                      {/* Metric Values Grid */}
                      <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-3 dark:border-white/5 dark:bg-slate-900/60">
                        <h5 className="font-bold text-slate-900 dark:text-slate-350 uppercase tracking-wider text-[9px] border-b pb-1 dark:border-white/10">
                          Metric Breakdown
                        </h5>
                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                          {item.metrics.cgpa !== null && (
                            <div>
                              <span className="block text-slate-500 dark:text-slate-400">CGPA</span>
                              <span className="font-bold text-slate-700 dark:text-slate-200">{item.metrics.cgpa}</span>
                            </div>
                          )}
                          {item.metrics.attendancePercent !== null && (
                            <div>
                              <span className="block text-slate-500 dark:text-slate-400">Attendance</span>
                              <span className={`font-bold ${item.metrics.attendancePercent < 75 ? "text-[#e11d48]" : "text-slate-700 dark:text-slate-200"}`}>{item.metrics.attendancePercent}%</span>
                            </div>
                          )}
                          {item.metrics.backlogCount !== null && (
                            <div>
                              <span className="block text-slate-500 dark:text-slate-400">Active Backlogs</span>
                              <span className={`font-bold ${item.metrics.backlogCount > 0 ? "text-[#e11d48]" : "text-slate-700 dark:text-slate-200"}`}>{item.metrics.backlogCount}</span>
                            </div>
                          )}
                          {item.metrics.failedSubjects !== null && (
                            <div>
                              <span className="block text-slate-500 dark:text-slate-400">Term Failures</span>
                              <span className={`font-bold ${item.metrics.failedSubjects > 0 ? "text-[#e11d48]" : "text-slate-700 dark:text-slate-200"}`}>{item.metrics.failedSubjects} subjects</span>
                            </div>
                          )}
                          {item.metrics.placementReadiness !== null && (
                            <div>
                              <span className="block text-slate-500 dark:text-slate-400">Placement Readiness</span>
                              <span className={`font-bold ${item.metrics.placementReadiness < 50 ? "text-[#d97706]" : "text-[#059669]"}`}>{item.metrics.placementReadiness}%</span>
                            </div>
                          )}
                          {item.metrics.accreditationCompletion !== null && (
                            <div>
                              <span className="block text-slate-500 dark:text-slate-400">Accreditation</span>
                              <span className="font-bold text-slate-700 dark:text-slate-200">{Math.round(item.metrics.accreditationCompletion)}%</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Gaps Reasons & Recommended Action Checklist */}
                      <div className="space-y-3">
                        <div>
                          <h5 className="font-bold text-slate-900 dark:text-slate-300 uppercase tracking-wider text-[9px]">
                            Identified Risk Signals
                          </h5>
                          <ul className="mt-1 list-disc pl-3 text-slate-700 dark:text-slate-300 space-y-0.5 text-[10px]">
                            {item.reasons.map((reason, i) => (
                              <li key={i}>{reason}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="border-t border-slate-200/50 pt-2 dark:border-white/10">
                          <h5 className="font-bold text-blue-650 dark:text-sky-400 uppercase tracking-wider text-[9px]">
                            Intervention Strategy checklist
                          </h5>
                          <div className="mt-1.5 space-y-1.5">
                            {item.recommendedActions.map((action, i) => (
                              <label key={i} className="flex items-start gap-2 cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-white/15 dark:bg-slate-800 accent-blue-600"
                                  readOnly
                                  checked={false}
                                />
                                <span className="text-slate-750 dark:text-slate-300 text-[10px] leading-tight">{action}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                )}
              </article>
            );
          })}

          {filtered.length === 0 && (
            <div className="py-8 text-center text-slate-500 dark:text-slate-500 font-medium">
              No entities matching filter parameters.
            </div>
          )}
        </div>
      </div>

      {/* Show more toggle */}
      {filtered.length > 4 && (
        <div className="flex justify-center pt-4 border-t border-slate-200/40 dark:border-white/10 mt-4">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-xs font-bold text-blue-600 hover:text-blue-750 dark:text-sky-400 dark:hover:text-sky-350 transition-colors bg-blue-50 border border-blue-100 hover:bg-blue-100 dark:hover:bg-sky-950/40 px-3.5 py-1.5 rounded-xl select-none"
          >
            {showAll ? "Show Less" : `Show More (${filtered.length - 4} items hidden)`}
          </button>
        </div>
      )}
    </div>
  );
}
