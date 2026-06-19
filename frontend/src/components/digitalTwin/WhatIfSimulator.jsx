import React, { useState, useEffect } from "react";
import { runWhatIfSimulation } from "../../api/client";

export default function WhatIfSimulator({ selectedEntity, defaultBaseline }) {
  const [adjustments, setAdjustments] = useState({
    attendanceDelta: 0,
    mentorMeetings: 0,
    remedialSessions: 0,
    skillBootcamp: false,
    expectedBacklogsCleared: 0,
    evidenceItemsCompleted: 0
  });

  const [loading, setLoading] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);
  const [error, setError] = useState("");

  const activeEntity = selectedEntity || defaultBaseline;

  useEffect(() => {
    setAdjustments({
      attendanceDelta: 0,
      mentorMeetings: 0,
      remedialSessions: 0,
      skillBootcamp: false,
      expectedBacklogsCleared: 0,
      evidenceItemsCompleted: 0
    });
  }, [selectedEntity]);

  useEffect(() => {
    if (!activeEntity) return;

    const triggerSimulation = async () => {
      setLoading(true);
      setError("");
      try {
        const payload = {
          entityId: activeEntity.id || activeEntity.entityId,
          entityType: activeEntity.entityType,
          adjustments,
          baseMetrics: activeEntity.metrics || {
            attendancePercent: activeEntity.attendancePercent || 75,
            cgpa: activeEntity.cgpa || 7.0,
            backlogCount: activeEntity.backlogCount || 0,
            failedSubjects: activeEntity.failedSubjects || 0,
            placementReadiness: activeEntity.placementReadiness || 50,
            accreditationCompletion: activeEntity.accreditationCompletion || 70,
            coCurricularCount: activeEntity.coCurricularCount || 1,
            coreSubjectAvg: activeEntity.coreSubjectAvg || 70
          }
        };

        const res = await runWhatIfSimulation(payload);
        if (res.data.success) {
          setSimulationResult(res.data.data.result);
        }
      } catch (err) {
        console.error("Simulation failed:", err);
        setError("Unable to run scenario simulation.");
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(triggerSimulation, 250);
    return () => clearTimeout(timer);
  }, [activeEntity, adjustments]);

  const handleInputChange = (field, value) => {
    setAdjustments(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!activeEntity) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-350 bg-white/40 p-8 text-center text-slate-500 dark:border-white/10 dark:bg-slate-900/20">
        <p className="font-semibold text-xs text-slate-650">
          Select an item from the Intervention Queue to load simulation data.
        </p>
      </div>
    );
  }

  const current = simulationResult?.current || {};
  const projected = simulationResult?.projected || {};
  const deltas = simulationResult?.deltas || {};
  const explanation = simulationResult?.explanation || [];
  const recommendedNextStep = simulationResult?.recommendedNextStep || "";

  const renderDeltaBadge = (delta, isGoodLower = false) => {
    if (delta === 0) return <span className="inline-flex items-center rounded bg-slate-50 border border-slate-200 px-1.5 py-0.5 text-[8.5px] font-bold text-slate-500 dark:bg-slate-800/40 dark:text-slate-450 dark:border-white/5">no change</span>;
    const isPositive = delta > 0;
    const isGood = isGoodLower ? !isPositive : isPositive;
    return (
      <span className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[8.5px] font-extrabold leading-none ${isGood ? "bg-emerald-50 text-[#059669] border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-450 dark:border-emerald-900/20" : "bg-rose-50 text-[#e11d48] border border-rose-100 dark:bg-rose-950/20 dark:text-rose-455 dark:border-rose-900/20"}`}>
        {isPositive ? `+${delta}` : delta} {isGood ? "↑" : "↓"}
      </span>
    );
  };

  const displayLabel = activeEntity.label;
  const deptSemString = [activeEntity.department, activeEntity.semester ? `Sem ${activeEntity.semester}` : null].filter(Boolean).join(" / ");
  const simulatingText = deptSemString ? `${displayLabel} (${deptSemString})` : displayLabel;

  return (
    <div className="rounded-3xl border border-slate-200/40 bg-gradient-to-br from-blue-50/30 via-white/80 to-cyan-50/20 p-5 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-slate-900/80 dark:from-slate-900/80 dark:to-slate-900/85 flex flex-col justify-between h-full transition-all duration-300 hover:shadow-md text-xs">
      <div>
        {/* Header Section */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/40 pb-3 dark:border-white/10">
          <div>
            <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-slate-100">What-If Intervention Simulator</h3>
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
              Estimate impact before taking action.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-lg bg-sky-50 border border-sky-100/80 px-2.5 py-1 text-[9px] font-extrabold text-sky-700 dark:bg-sky-950/20 dark:text-sky-400 dark:border-sky-900/30">
              Simulating: {simulatingText}
            </span>
            {loading && (
              <span className="text-[9px] font-bold text-sky-650 dark:text-sky-400 animate-pulse">
                Recalculating...
              </span>
            )}
          </div>
        </div>

        {/* Adjustments & Output Grid */}
        <div className="mt-4 grid gap-5 md:grid-cols-2">
          {/* Left: Sim Controls Grid */}
          <div className="space-y-3.5 pr-0 md:pr-4 md:border-r border-slate-200/40 dark:border-white/10 flex flex-col justify-between">
            <div className="space-y-3">
              <h4 className="font-bold text-[9px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Action Parameters
              </h4>

              <div className="grid grid-cols-2 gap-2.5">
                {/* Slider for Attendance */}
                <div className="space-y-1 rounded-xl border border-slate-200 bg-white p-2.5 dark:border-white/10 dark:bg-slate-900 col-span-2">
                  <div className="flex justify-between text-[10.5px] font-bold text-slate-700 dark:text-slate-300">
                    <span>Attendance Improvement</span>
                    <span className="text-blue-600 dark:text-sky-400 font-extrabold">+{adjustments.attendanceDelta}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={adjustments.attendanceDelta}
                    onChange={(e) => handleInputChange("attendanceDelta", Number(e.target.value))}
                    className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                {/* Mentor Meetings */}
                <div className="space-y-0.5 rounded-xl border border-slate-200 bg-white p-2.5 dark:border-white/10 dark:bg-slate-900">
                  <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-400">Mentor Meetings</label>
                  <select
                    value={adjustments.mentorMeetings}
                    onChange={(e) => handleInputChange("mentorMeetings", Number(e.target.value))}
                    className="w-full text-[10.5px] font-bold bg-transparent text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
                  >
                    {[0, 1, 2, 3, 4].map(n => (
                      <option key={n} value={n} className="text-slate-800 dark:bg-slate-900 dark:text-white">{n} Sessions</option>
                    ))}
                  </select>
                </div>

                {/* Remedial Sessions */}
                <div className="space-y-0.5 rounded-xl border border-slate-200 bg-white p-2.5 dark:border-white/10 dark:bg-slate-900">
                  <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-400">Remedial Sessions</label>
                  <select
                    value={adjustments.remedialSessions}
                    onChange={(e) => handleInputChange("remedialSessions", Number(e.target.value))}
                    className="w-full text-[10.5px] font-bold bg-transparent text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
                  >
                    {[0, 1, 2, 3, 4, 5, 6].map(n => (
                      <option key={n} value={n} className="text-slate-800 dark:bg-slate-900 dark:text-white">{n} Sessions</option>
                    ))}
                  </select>
                </div>

                {/* Backlogs Cleared */}
                <div className="space-y-0.5 rounded-xl border border-slate-200 bg-white p-2.5 dark:border-white/10 dark:bg-slate-900">
                  <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-400">Backlogs Cleared</label>
                  <select
                    value={adjustments.expectedBacklogsCleared}
                    onChange={(e) => handleInputChange("expectedBacklogsCleared", Number(e.target.value))}
                    className="w-full text-[10.5px] font-bold bg-transparent text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
                  >
                    {[0, 1, 2, 3, 4, 5].map(n => (
                      <option key={n} value={n} className="text-slate-800 dark:bg-slate-900 dark:text-white">{n} subjects</option>
                    ))}
                  </select>
                </div>

                {/* Accreditation Uploads */}
                <div className="space-y-0.5 rounded-xl border border-slate-200 bg-white p-2.5 dark:border-white/10 dark:bg-slate-900">
                  <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-400">Accreditation Gaps</label>
                  <select
                    value={adjustments.evidenceItemsCompleted}
                    onChange={(e) => handleInputChange("evidenceItemsCompleted", Number(e.target.value))}
                    className="w-full text-[10.5px] font-bold bg-transparent text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
                  >
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                      <option key={n} value={n} className="text-slate-800 dark:bg-slate-900 dark:text-white">{n} documents</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Bootcamp Toggle */}
            <div className="mt-3 flex items-center justify-between rounded-xl bg-white border border-slate-200 p-2.5 dark:bg-slate-900 dark:border-white/10">
              <div className="space-y-0.5 min-w-0 pr-1">
                <span className="block font-bold text-slate-750 dark:text-slate-200 text-[10px] truncate">DSA + Aptitude Bootcamp</span>
                <span className="block text-[8px] text-slate-500 dark:text-slate-400 truncate leading-none">Elevate placement eligibility</span>
              </div>
              <button
                onClick={() => handleInputChange("skillBootcamp", !adjustments.skillBootcamp)}
                className={`relative inline-flex h-4.5 w-8 flex-shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none ${adjustments.skillBootcamp ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-800"}`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-200 ${adjustments.skillBootcamp ? "translate-x-4" : "translate-x-0.5"}`}
                />
              </button>
            </div>
          </div>

          {/* Right: Projections Output Card Columns */}
          <div className="flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <h4 className="font-bold text-[9px] uppercase tracking-wider text-slate-400 dark:text-slate-550">
                Performance Forecasts
              </h4>

              {error && <div className="text-rose-500 font-semibold">{error}</div>}

              {/* Dynamic Delta Projections */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* 1. Action Priority */}
                <article className="rounded-2xl border border-slate-200 bg-white p-2.5 dark:border-white/10 dark:bg-slate-900 flex flex-col justify-between">
                  <span className="block text-[8.5px] font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wider leading-none">APS Urgency</span>
                  <div className="mt-2 flex flex-wrap items-baseline gap-1 leading-none">
                    <span className="text-[10px] text-slate-400 line-through font-medium">{current.actionPriorityScore}</span>
                    <span className="text-xs font-bold text-slate-450 mx-0.5">→</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white">{projected.actionPriorityScore}</span>
                  </div>
                  <div className="mt-1.5">
                    {renderDeltaBadge(deltas.actionPriorityScore, true)}
                  </div>
                </article>

                {/* 2. Dropout Risk */}
                <article className="rounded-2xl border border-slate-200 bg-white p-2.5 dark:border-white/10 dark:bg-slate-900 flex flex-col justify-between">
                  <span className="block text-[8.5px] font-bold text-slate-500 dark:text-slate-455 uppercase tracking-wider leading-none">Dropout Risk</span>
                  <div className="mt-2 flex flex-wrap items-baseline gap-1 leading-none">
                    <span className="text-[10px] text-slate-400 line-through font-medium">{current.dropoutRisk}%</span>
                    <span className="text-xs font-bold text-slate-450 mx-0.5">→</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white">{projected.dropoutRisk}%</span>
                  </div>
                  <div className="mt-1.5">
                    {renderDeltaBadge(deltas.dropoutRisk, true)}
                  </div>
                </article>

                {/* 3. Placement Readiness */}
                <article className="rounded-2xl border border-slate-200 bg-white p-2.5 dark:border-white/10 dark:bg-slate-900 flex flex-col justify-between">
                  <span className="block text-[8.5px] font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wider leading-none">Placement %</span>
                  <div className="mt-2 flex flex-wrap items-baseline gap-1 leading-none">
                    <span className="text-[10px] text-slate-400 line-through font-medium">{current.placementReadiness}%</span>
                    <span className="text-xs font-bold text-slate-450 mx-0.5">→</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white">{projected.placementReadiness}%</span>
                  </div>
                  <div className="mt-1.5">
                    {renderDeltaBadge(deltas.placementReadiness, false)}
                  </div>
                </article>

                {/* 4. Accreditation Compliance */}
                <article className="rounded-2xl border border-slate-200 bg-white p-2.5 dark:border-white/10 dark:bg-slate-900 flex flex-col justify-between">
                  <span className="block text-[8.5px] font-bold text-slate-500 dark:text-slate-455 uppercase tracking-wider leading-none">Accreditation</span>
                  <div className="mt-2 flex flex-wrap items-baseline gap-1 leading-none">
                    <span className="text-[10px] text-slate-400 line-through font-medium">{current.accreditationReadiness}%</span>
                    <span className="text-xs font-bold text-slate-455 mx-0.5">→</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white">{projected.accreditationReadiness}%</span>
                  </div>
                  <div className="mt-1.5">
                    {renderDeltaBadge(deltas.accreditationReadiness, false)}
                  </div>
                </article>
              </div>
            </div>

            {/* Explanation actions box */}
            {explanation.length > 0 && (
              <div className="rounded-xl bg-[#eff6ff] border border-[#bfdbfe] text-[#1e3a8a] dark:bg-blue-950/20 dark:border-blue-900/30 dark:text-blue-300 p-3 text-[10px]">
                <span className="block font-bold uppercase tracking-wider">Simulated Intervention Impact</span>
                <ul className="mt-1 list-disc pl-3 text-slate-750 dark:text-slate-300 space-y-0.5 leading-snug">
                  {explanation.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggested Direction */}
            {recommendedNextStep && (
              <div className="pt-1.5">
                <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider leading-none">Suggested Direction</span>
                <p className="mt-1 text-[11px] font-bold text-slate-900 dark:text-slate-200">
                  {recommendedNextStep}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="text-[9.5px] text-slate-500 dark:text-slate-500 text-center italic mt-4 border-t border-slate-200/40 dark:border-white/10 pt-2 select-none">
        Scenario model based on historical academic indices.
      </div>
    </div>
  );
}
