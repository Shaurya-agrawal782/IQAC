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

  // Reset adjustments when selected entity changes
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

  const activeEntity = selectedEntity || defaultBaseline;

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

    // Debounce simulation requests slightly to prevent API hammer
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
      <div className="rounded-3xl border border-dashed border-slate-350 bg-white/40 p-8 text-center text-brand-ink/60 dark:border-slate-800 dark:bg-slate-900/20">
        <p className="font-medium">Select a student, cohort, or department from the Intervention Queue to load the What-If Simulator.</p>
      </div>
    );
  }

  const current = simulationResult?.current || {};
  const projected = simulationResult?.projected || {};
  const deltas = simulationResult?.deltas || {};
  const explanation = simulationResult?.explanation || [];
  const recommendedNextStep = simulationResult?.recommendedNextStep || "";

  const renderDelta = (delta, isGoodLower = false) => {
    if (delta === 0) return <span className="text-[10px] text-slate-400 font-semibold">(No Change)</span>;
    const isPositive = delta > 0;
    const isGood = isGoodLower ? !isPositive : isPositive;
    return (
      <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded leading-none ${isGood ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-red-500/10 text-red-600 dark:text-red-400"}`}>
        {isPositive ? `+${delta}` : delta} {isGood ? "↑" : "↓"}
      </span>
    );
  };

  return (
    <div className="rounded-3xl border border-white/50 bg-white/70 p-6 shadow-xl shadow-slate-200/35 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/60 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-850">
        <div>
          <h3 className="font-heading text-lg text-brand-ink dark:text-white">What-If Intervention Simulator</h3>
          <p className="text-[10px] text-brand-ink/75 dark:text-slate-400">
            Simulating for: <strong className="font-bold text-brand-ocean dark:text-sky-400">{activeEntity.label}</strong>
          </p>
        </div>
        {loading && <span className="text-[10px] font-bold text-brand-ocean dark:text-sky-400 animate-pulse">Recalculating...</span>}
      </div>

      <div className="mt-4 grid gap-5 md:grid-cols-2">
        {/* Left Side: Interventions Config */}
        <div className="space-y-4 pr-0 md:pr-4 md:border-r border-slate-100 dark:border-slate-850">
          <h4 className="font-bold text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Simulated Action Controls
          </h4>

          {/* Slider: Attendance */}
          <div className="space-y-1">
            <div className="flex justify-between font-semibold">
              <label className="text-slate-700 dark:text-slate-300">Attendance Improvement</label>
              <span className="text-brand-ocean dark:text-sky-400">+{adjustments.attendanceDelta}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              value={adjustments.attendanceDelta}
              onChange={(e) => handleInputChange("attendanceDelta", Number(e.target.value))}
              className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-ocean"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Stepper: Mentor Meetings */}
            <div className="space-y-1">
              <label className="block font-semibold text-slate-700 dark:text-slate-300">Mentor Meetings</label>
              <select
                value={adjustments.mentorMeetings}
                onChange={(e) => handleInputChange("mentorMeetings", Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-white/80 p-2 outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              >
                {[0, 1, 2, 3, 4].map(n => (
                  <option key={n} value={n}>{n} Sessions</option>
                ))}
              </select>
            </div>

            {/* Stepper: Remedial Sessions */}
            <div className="space-y-1">
              <label className="block font-semibold text-slate-700 dark:text-slate-300">Remedial Sessions</label>
              <select
                value={adjustments.remedialSessions}
                onChange={(e) => handleInputChange("remedialSessions", Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-white/80 p-2 outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              >
                {[0, 1, 2, 3, 4, 5, 6].map(n => (
                  <option key={n} value={n}>{n} Sessions</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Stepper: Expected Backlogs Cleared */}
            <div className="space-y-1">
              <label className="block font-semibold text-slate-700 dark:text-slate-300">Backlogs Cleared</label>
              <select
                value={adjustments.expectedBacklogsCleared}
                onChange={(e) => handleInputChange("expectedBacklogsCleared", Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-white/80 p-2 outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              >
                {[0, 1, 2, 3, 4, 5].map(n => (
                  <option key={n} value={n}>{n} Subjects</option>
                ))}
              </select>
            </div>

            {/* Stepper: Evidence Items Completed */}
            <div className="space-y-1">
              <label className="block font-semibold text-slate-700 dark:text-slate-300">Accreditation Uploads</label>
              <select
                value={adjustments.evidenceItemsCompleted}
                onChange={(e) => handleInputChange("evidenceItemsCompleted", Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-white/80 p-2 outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              >
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                  <option key={n} value={n}>{n} documents</option>
                ))}
              </select>
            </div>
          </div>

          {/* Toggle: Skill Bootcamp */}
          <div className="flex items-center justify-between rounded-xl bg-slate-50/50 p-2.5 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
            <div>
              <span className="block font-bold text-slate-700 dark:text-slate-300">DSA + Aptitude Bootcamp</span>
              <span className="block text-[10px] text-slate-400">Boosts student placement clearance rates</span>
            </div>
            <button
              onClick={() => handleInputChange("skillBootcamp", !adjustments.skillBootcamp)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${adjustments.skillBootcamp ? "bg-brand-ocean" : "bg-slate-200 dark:bg-slate-800"}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${adjustments.skillBootcamp ? "translate-x-6" : "translate-x-1"}`}
              />
            </button>
          </div>
        </div>

        {/* Right Side: Projections Outputs */}
        <div className="flex flex-col justify-between space-y-4">
          <div>
            <h4 className="font-bold text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Estimated Scenario Impact
            </h4>

            {error && <div className="mt-2 text-red-500">{error}</div>}

            {/* Performance metrics grid */}
            <div className="mt-3.5 grid grid-cols-2 gap-3.5">
              {/* Card 1: Action Priority Score */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-850 dark:bg-slate-800/10">
                <span className="block text-[10px] font-bold text-brand-ink/50 dark:text-slate-400">APS Urgency Index</span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-sm font-semibold text-slate-400 line-through">{current.actionPriorityScore}</span>
                  <span className="text-base font-black text-brand-ink dark:text-white">{projected.actionPriorityScore}</span>
                  {renderDelta(deltas.actionPriorityScore, true)}
                </div>
              </div>

              {/* Card 2: Academic Dropout Risk */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-850 dark:bg-slate-800/10">
                <span className="block text-[10px] font-bold text-brand-ink/50 dark:text-slate-400">Dropout Risk Rate</span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-sm font-semibold text-slate-400 line-through">{current.dropoutRisk}%</span>
                  <span className="text-base font-black text-slate-850 dark:text-slate-200">{projected.dropoutRisk}%</span>
                  {renderDelta(deltas.dropoutRisk, true)}
                </div>
              </div>

              {/* Card 3: Placement Readiness */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-850 dark:bg-slate-800/10">
                <span className="block text-[10px] font-bold text-brand-ink/50 dark:text-slate-400">Placement Readiness</span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-sm font-semibold text-slate-400 line-through">{current.placementReadiness}%</span>
                  <span className="text-base font-black text-emerald-500">{projected.placementReadiness}%</span>
                  {renderDelta(deltas.placementReadiness, false)}
                </div>
              </div>

              {/* Card 4: Accreditation Readiness */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-850 dark:bg-slate-800/10">
                <span className="block text-[10px] font-bold text-brand-ink/50 dark:text-slate-400">Accreditation Readiness</span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-sm font-semibold text-slate-400 line-through">{current.accreditationReadiness}%</span>
                  <span className="text-base font-black text-slate-800 dark:text-slate-200">{projected.accreditationReadiness}%</span>
                  {renderDelta(deltas.accreditationReadiness, false)}
                </div>
              </div>
            </div>
          </div>

          {/* Explanation bullets */}
          {explanation.length > 0 && (
            <div className="rounded-2xl bg-brand-ocean/5 p-3 dark:bg-slate-800/30">
              <span className="block text-[10px] uppercase font-bold text-brand-ocean dark:text-sky-400">Projected Actions Summary</span>
              <ul className="mt-1 list-disc pl-3 text-slate-700 dark:text-slate-350 space-y-0.5 leading-snug">
                {explanation.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* HOD recommendation next step */}
          {recommendedNextStep && (
            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-400">HOD Suggested Direction</span>
              <p className="mt-0.5 font-bold text-slate-800 dark:text-slate-200">
                {recommendedNextStep}
              </p>
            </div>
          )}

          <div className="text-[10px] text-slate-400 text-center italic mt-2 border-t pt-2 dark:border-slate-850">
            Estimated scenario based on current academic indicators.
          </div>
        </div>
      </div>
    </div>
  );
}
