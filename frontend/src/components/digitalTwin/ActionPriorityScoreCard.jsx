import React from "react";

export default function ActionPriorityScoreCard({ overview }) {
  if (!overview) return null;

  const {
    actionPriorityScore,
    severity,
    topEntity,
    criticalItems,
    highItems,
    mainDrivers,
    recommendation
  } = overview;

  const severityColors = {
    critical: "bg-red-500/10 text-red-500 border border-red-500/30",
    high: "bg-orange-500/10 text-orange-500 border border-orange-500/30",
    moderate: "bg-yellow-500/10 text-yellow-500 border border-yellow-500/30",
    low: "bg-green-500/10 text-green-500 border border-green-500/30"
  };

  const scoreBadgeColors = {
    critical: "text-red-500",
    high: "text-orange-500",
    moderate: "text-yellow-500",
    low: "text-green-500"
  };

  const driverLabels = {
    low_attendance: "Low Attendance",
    cgpa_decline: "GPA Decline",
    active_backlogs: "Active Backlogs",
    subject_failures: "Subject Failures",
    placement_readiness_gap: "Placement Gap",
    accreditation_gap: "Accreditation Gap",
    low_engagement: "Low Engagement",
    low_risk: "Low Risk"
  };

  return (
    <div className="grid gap-5 md:grid-cols-[1fr,2fr] rounded-3xl border border-white/50 bg-white/70 p-6 shadow-xl shadow-slate-200/35 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/60 dark:shadow-none">
      
      {/* Gauge and Status Summary */}
      <div className="flex flex-col items-center justify-between border-slate-200/60 pb-5 md:border-r md:pb-0 md:pr-6 dark:border-slate-800/60">
        <div className="text-center w-full">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-ink/65 dark:text-slate-400">
            Action Priority Score
          </p>
          <p className="text-[10px] text-brand-ink/50 dark:text-slate-500">
            Calculated college-wide urgency index
          </p>
        </div>

        {/* Circular Progress Gauge */}
        <div className="relative my-4 flex items-center justify-center">
          <svg className="h-32 w-32 transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="54"
              stroke="rgba(226, 232, 240, 0.5)"
              strokeWidth="10"
              fill="transparent"
              className="dark:stroke-slate-800/40"
            />
            <circle
              cx="64"
              cy="64"
              r="54"
              stroke="currentColor"
              strokeWidth="10"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 54}
              strokeDashoffset={2 * Math.PI * 54 * (1 - actionPriorityScore / 100)}
              className={`${scoreBadgeColors[severity] || "text-blue-500"} transition-all duration-700 ease-out`}
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-3xl font-bold tracking-tight text-brand-ink dark:text-white">
              {actionPriorityScore}
            </span>
            <span className="text-[10px] font-medium text-brand-ink/60 uppercase dark:text-slate-400">
              Score
            </span>
          </div>
        </div>

        <div className="w-full text-center space-y-3">
          <div className="inline-flex rounded-full px-3.5 py-1 text-xs font-bold uppercase tracking-wider shadow-sm select-none border items-center gap-1.5 justify-center leading-none bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100">
            <span className={`inline-block h-2 w-2 rounded-full ${severity === "critical" ? "bg-red-500 animate-pulse" : severity === "high" ? "bg-orange-500 animate-pulse" : severity === "moderate" ? "bg-yellow-500" : "bg-green-500"}`}></span>
            Status: <span className="font-extrabold uppercase">{severity}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-left pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="rounded-xl bg-slate-50/50 p-2.5 dark:bg-slate-800/30">
              <span className="block text-[10px] uppercase text-brand-ink/50 dark:text-slate-500">Critical Gaps</span>
              <span className="text-lg font-bold text-red-500 dark:text-red-400">{criticalItems}</span>
            </div>
            <div className="rounded-xl bg-slate-50/50 p-2.5 dark:bg-slate-800/30">
              <span className="block text-[10px] uppercase text-brand-ink/50 dark:text-slate-500">High Urgency</span>
              <span className="text-lg font-bold text-orange-500 dark:text-orange-400">{highItems}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Drivers and HOD Intervention Recommendations */}
      <div className="flex flex-col justify-between space-y-4 md:pl-2">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2 dark:border-slate-800">
            <div>
              <h4 className="font-heading text-lg text-brand-ink dark:text-white">Intervention Intelligence</h4>
              <p className="text-xs text-brand-ink/75 dark:text-slate-400">
                Primary driver signals requiring resolution
              </p>
            </div>
            {/* Drivers Tags */}
            <div className="flex flex-wrap gap-1.5">
              {mainDrivers.map((driver) => (
                <span
                  key={driver}
                  className="rounded-lg bg-slate-100/80 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  {driverLabels[driver] || driver}
                </span>
              ))}
              {mainDrivers.length === 0 && (
                <span className="rounded-lg bg-slate-100/85 px-2.5 py-1 text-[10px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  No Active Drivers
                </span>
              )}
            </div>
          </div>

          <div className="mt-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Top Priority Threat Vector
            </p>
            <p className="mt-0.5 text-sm font-bold text-slate-800 dark:text-slate-200">
              {topEntity}
            </p>
          </div>
        </div>

        {/* Detailed Recommendation Card */}
        {recommendation && (
          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/20">
            <h5 className="font-semibold text-brand-ink text-sm dark:text-white flex items-center gap-1">
              <span className="text-brand-ocean">✦</span> {recommendation.title}
            </h5>
            <p className="mt-1 text-xs text-brand-ink/80 dark:text-slate-300 leading-relaxed">
              {recommendation.summary}
            </p>

            <div className="mt-3 grid gap-3 sm:grid-cols-2 text-xs">
              <div>
                <span className="block text-[10px] uppercase font-bold text-brand-ink/40 dark:text-slate-500">
                  Immediate Actions Required
                </span>
                <ul className="mt-1 space-y-1 list-disc pl-3 text-brand-ink/75 dark:text-slate-300 font-medium">
                  {recommendation.immediateActions.map((action, i) => (
                    <li key={i}>{action}</li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col justify-between gap-2 border-t pt-2 sm:border-t-0 sm:pt-0 sm:pl-3 sm:border-l border-slate-100 dark:border-slate-850">
                <div>
                  <span className="block text-[10px] uppercase font-bold text-brand-ink/40 dark:text-slate-500">
                    Expected Impact
                  </span>
                  <span className="block mt-0.5 text-brand-ink/80 dark:text-slate-300 font-medium">
                    {recommendation.expectedImpact}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-brand-ink/40 dark:text-slate-500">
                    Action Timeline
                  </span>
                  <span className="inline-block mt-0.5 text-brand-ocean font-bold dark:text-sky-400">
                    {recommendation.timeline}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
