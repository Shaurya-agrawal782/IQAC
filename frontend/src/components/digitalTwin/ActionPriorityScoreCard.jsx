import React from "react";

export default function ActionPriorityScoreCard({ overview }) {
  if (!overview) return null;

  const {
    actionPriorityScore,
    severity,
    topEntity,
    mainDrivers,
    recommendation
  } = overview;

  const severityChips = {
    critical: "bg-[#fff1f2] text-[#e11d48] border-[#fecdd3] dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/40",
    high: "bg-[#fffbeb] text-[#d97706] border-[#fde68a] dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/40",
    moderate: "bg-[#eff6ff] text-[#2563eb] border-[#bfdbfe] dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/40",
    low: "bg-[#ecfdf5] text-[#059669] border-[#bbf7d0] dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/40"
  };

  const scoreColors = {
    critical: "text-[#e11d48] dark:text-rose-400",
    high: "text-[#d97706] dark:text-amber-400",
    moderate: "text-[#2563eb] dark:text-blue-400",
    low: "text-[#059669] dark:text-emerald-400"
  };

  const driverLabels = {
    low_attendance: "Attendance",
    cgpa_decline: "GPA Decline",
    active_backlogs: "Backlogs",
    subject_failures: "Failures",
    placement_readiness_gap: "Placement Gap",
    accreditation_gap: "Accreditation",
    low_engagement: "Engagement",
    low_risk: "Healthy"
  };

  // Extract one primary recommended action
  const primaryAction = recommendation?.immediateActions?.[0] || "Monitor progress and weekly attendance.";

  return (
    <article className="rounded-3xl border border-slate-200/40 bg-gradient-to-br from-blue-50/30 via-white/80 to-cyan-50/20 p-5 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-slate-900/80 dark:from-slate-900/80 dark:to-slate-900/85 flex flex-col justify-between h-full transition-all duration-300 hover:shadow-md">
      <div className="flex items-center gap-4">
        {/* Left: Score Gauge */}
        <div className="relative flex flex-shrink-0 items-center justify-center">
          <svg className="h-20 w-20 transform -rotate-90">
            <circle
              cx="40"
              cy="40"
              r="34"
              stroke="rgba(226, 232, 240, 0.5)"
              strokeWidth="6"
              fill="transparent"
              className="dark:stroke-white/10"
            />
            <circle
              cx="40"
              cy="40"
              r="34"
              stroke="currentColor"
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 34}
              strokeDashoffset={2 * Math.PI * 34 * (1 - actionPriorityScore / 100)}
              className={`${scoreColors[severity] || "text-blue-500"} transition-all duration-700 ease-out`}
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100 leading-none">
              {actionPriorityScore}
            </span>
            <span className="text-[7.5px] font-black text-slate-500 dark:text-slate-400 uppercase mt-0.5 tracking-wider">
              APS
            </span>
          </div>
        </div>

        {/* Right: Top Priority Details */}
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${severityChips[severity]}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${severity === "critical" ? "bg-[#e11d48]" : severity === "high" ? "bg-[#d97706]" : severity === "moderate" ? "bg-[#2563eb]" : "bg-[#059669]"}`} />
              {severity}
            </span>
          </div>

          <div className="min-w-0">
            <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 leading-none">
              Top Priority Threat Vector
            </span>
            <h4 className="mt-1 font-heading text-sm text-slate-900 dark:text-slate-100 truncate font-bold" title={topEntity}>
              {topEntity}
            </h4>
          </div>

          {/* Drivers */}
          <div className="flex flex-wrap gap-1">
            {mainDrivers.slice(0, 3).map((driver) => (
              <span
                key={driver}
                className="rounded-md bg-slate-100 text-slate-600 border border-slate-200/50 dark:bg-slate-800 dark:text-slate-300 dark:border-white/5 px-1.5 py-0.5 text-[9px] font-bold"
              >
                {driverLabels[driver] || driver}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom: Recommended Action */}
      <div className="mt-4 pt-3 border-t border-slate-200/40 dark:border-white/10">
        <span className="block text-[8.5px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Recommended Action
        </span>
        <p className="mt-0.5 text-xs font-semibold text-slate-700 dark:text-slate-300 truncate" title={primaryAction}>
          {primaryAction}
        </p>
      </div>
    </article>
  );
}
