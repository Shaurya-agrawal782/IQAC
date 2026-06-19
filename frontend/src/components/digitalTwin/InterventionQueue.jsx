import React, { useState } from "react";

export default function InterventionQueue({ items, onFilterChange, onSimulateIntervention }) {
  const [expandedId, setExpandedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState("");

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const severityColors = {
    critical: "bg-red-500/10 text-red-600 border border-red-500/30 dark:text-red-400",
    high: "bg-orange-500/10 text-orange-600 border border-orange-500/30 dark:text-orange-400",
    moderate: "bg-yellow-500/10 text-yellow-600 border border-yellow-500/30 dark:text-yellow-400",
    low: "bg-green-500/10 text-green-600 border border-green-500/30 dark:text-green-400"
  };

  const entityTypeBadges = {
    student: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    cohort: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    department: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
    accreditation: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300"
  };

  const driverLabels = {
    low_attendance: "Attendance Shortage",
    cgpa_decline: "GPA Decline",
    active_backlogs: "Active Backlogs",
    subject_failures: "Subject Failures",
    placement_readiness_gap: "Placement Gap",
    accreditation_gap: "Accreditation Gap",
    low_engagement: "Engagement Gap",
    low_risk: "Healthy"
  };

  // Internal client-side search/filtering overlay
  const filtered = (items || []).filter(item => {
    const matchesSearch = item.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.department && item.department.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDept = selectedDept === "" || item.department === selectedDept;
    const matchesSeverity = selectedSeverity === "" || item.severity === selectedSeverity;
    return matchesSearch && matchesDept && matchesSeverity;
  });

  // Extract unique departments for dropdown
  const uniqueDepts = Array.from(new Set((items || []).map(item => item.department).filter(Boolean)));

  return (
    <section className="rounded-3xl border border-white/50 bg-white/70 p-5 shadow-xl shadow-slate-200/35 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/60">
      
      {/* Filtering Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
        <div>
          <h3 className="font-heading text-xl text-brand-ink dark:text-white">Urgent Intervention Queue</h3>
          <p className="text-xs text-brand-ink/75 dark:text-slate-400">
            Real-time ranked cohort/individual quality improvement stack
          </p>
        </div>

        {/* Filters Controls */}
        <div className="flex flex-wrap gap-2 text-xs">
          <input
            type="text"
            placeholder="Search roll no / name / dept..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white/80 px-3 py-1.5 outline-none focus:border-brand-ocean dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white/80 px-2 py-1.5 outline-none focus:border-brand-ocean dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="">All Departments</option>
            {uniqueDepts.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white/80 px-2 py-1.5 outline-none focus:border-brand-ocean dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="moderate">Moderate</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Queue Stack */}
      <div className="mt-4 space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
        {filtered.map((item, index) => {
          const isExpanded = expandedId === item.id;
          return (
            <article
              key={item.id}
              onClick={() => toggleExpand(item.id)}
              className={`group overflow-hidden rounded-2xl border transition-all duration-200 hover:border-brand-ocean/40 cursor-pointer ${isExpanded ? "border-brand-ocean bg-slate-50/40 dark:border-slate-700 dark:bg-slate-800/10" : "border-slate-100 bg-white/50 dark:border-slate-800/40 dark:bg-slate-900/30"}`}
            >
              
              {/* Card Summary Header Row */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    #{index + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${entityTypeBadges[item.entityType] || "bg-slate-100 text-slate-800"}`}>
                        {item.entityType}
                      </span>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        {item.label}
                      </h4>
                    </div>
                    
                    {/* Compact stats strip */}
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-brand-ink/60 dark:text-slate-400">
                      {item.department && (
                        <span>Dept: <strong className="font-semibold text-brand-ink/80 dark:text-slate-300">{item.department}</strong></span>
                      )}
                      {item.semester && (
                        <span>Sem: <strong className="font-semibold text-brand-ink/80 dark:text-slate-300">{item.semester}</strong></span>
                      )}
                      <span className="flex items-center gap-1">
                        Drivers:
                        <span className="font-semibold text-brand-ink/85 dark:text-slate-200">
                          {item.drivers.map(d => driverLabels[d] || d).join(", ")}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Score & Severity columns */}
                <div className="flex items-center gap-4">
                  {onSimulateIntervention && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSimulateIntervention(item);
                      }}
                      className="rounded-lg bg-brand-ocean/10 px-2 py-1 text-[10px] font-bold text-brand-ocean hover:bg-brand-ocean/20 dark:text-sky-400 dark:bg-sky-400/10 dark:hover:bg-sky-400/20 transition-all select-none"
                    >
                      Simulate
                    </button>
                  )}
                  <div className="text-right">
                    <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
                      Priority Score
                    </span>
                    <span className="text-lg font-black text-slate-800 dark:text-white">
                      {item.score} <span className="text-xs font-normal text-slate-400">/100</span>
                    </span>
                  </div>

                  <span className={`inline-block rounded-lg px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${severityColors[item.severity] || "bg-slate-100 text-slate-700"}`}>
                    {item.severity}
                  </span>
                </div>
              </div>

              {/* Card Expanded Detail Panel */}
              {isExpanded && (
                <div
                  onClick={(e) => e.stopPropagation()} // stop toggle collapse when clicking inner panel details
                  className="border-t border-slate-100 bg-white/70 p-5 dark:border-slate-850 dark:bg-slate-900/40 text-xs"
                >
                  <div className="grid gap-5 md:grid-cols-[1fr,2fr]">
                    
                    {/* Left details - Metrics matrix */}
                    <div className="space-y-4 rounded-xl bg-slate-50/50 p-4 dark:bg-slate-800/10">
                      <h5 className="font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] border-b pb-1.5 dark:border-slate-800">
                        Detailed Metric Matrix
                      </h5>
                      <div className="grid grid-cols-2 gap-3">
                        {item.metrics.cgpa !== null && (
                          <div>
                            <span className="block text-brand-ink/55 dark:text-slate-500">Current CGPA</span>
                            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{item.metrics.cgpa}</span>
                          </div>
                        )}
                        {item.metrics.attendancePercent !== null && (
                          <div>
                            <span className="block text-brand-ink/55 dark:text-slate-500">Attendance</span>
                            <span className={`text-sm font-bold ${item.metrics.attendancePercent < 75 ? "text-red-500" : "text-slate-850 dark:text-slate-200"}`}>{item.metrics.attendancePercent}%</span>
                          </div>
                        )}
                        {item.metrics.backlogCount !== null && (
                          <div>
                            <span className="block text-brand-ink/55 dark:text-slate-500">Active Backlogs</span>
                            <span className={`text-sm font-bold ${item.metrics.backlogCount > 0 ? "text-red-500" : "text-slate-850 dark:text-slate-200"}`}>{item.metrics.backlogCount}</span>
                          </div>
                        )}
                        {item.metrics.failedSubjects !== null && (
                          <div>
                            <span className="block text-brand-ink/55 dark:text-slate-500">Term Failures</span>
                            <span className={`text-sm font-bold ${item.metrics.failedSubjects > 0 ? "text-red-500" : "text-slate-850 dark:text-slate-200"}`}>{item.metrics.failedSubjects} subjects</span>
                          </div>
                        )}
                        {item.metrics.placementReadiness !== null && (
                          <div>
                            <span className="block text-brand-ink/55 dark:text-slate-500">Placement Readiness</span>
                            <span className={`text-sm font-bold ${item.metrics.placementReadiness < 50 ? "text-orange-500" : "text-emerald-500"}`}>{item.metrics.placementReadiness}%</span>
                          </div>
                        )}
                        {item.metrics.accreditationCompletion !== null && (
                          <div>
                            <span className="block text-brand-ink/55 dark:text-slate-500">Accreditation Uploads</span>
                            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{Math.round(item.metrics.accreditationCompletion)}% complete</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right details - Causes and Actions */}
                    <div className="space-y-4">
                      
                      {/* Risk factors */}
                      <div>
                        <h5 className="font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                          Risk Vectors Identified
                        </h5>
                        <ul className="mt-1.5 space-y-1 list-disc pl-3 text-slate-600 dark:text-slate-350">
                          {item.reasons.map((reason, i) => (
                            <li key={i}>{reason}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Intervention list */}
                      <div className="border-t border-slate-100 pt-3 dark:border-slate-800">
                        <h5 className="font-semibold text-brand-ocean dark:text-sky-400 uppercase tracking-wider text-[10px]">
                          HOD Prescribed Action Checklist
                        </h5>
                        <div className="mt-2 space-y-2">
                          {item.recommendedActions.map((action, i) => (
                            <div key={i} className="flex items-start gap-2.5">
                              <input
                                type="checkbox"
                                className="mt-0.5 rounded border-slate-300 text-brand-ocean focus:ring-brand-ocean"
                                readOnly
                                checked={false}
                              />
                              <span className="text-slate-700 dark:text-slate-200 leading-snug">{action}</span>
                            </div>
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
          <div className="py-8 text-center text-brand-ink/50 dark:text-slate-500">
            No entities matching filter parameters. All systems compliant.
          </div>
        )}
      </div>
    </section>
  );
}
