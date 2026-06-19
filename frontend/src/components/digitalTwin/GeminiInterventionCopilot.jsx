import React, { useState, useEffect } from "react";
import { askInterventionCopilot } from "../../api/client";

export default function GeminiInterventionCopilot({ selectedEntity }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const quickPrompts = [
    "Explain top priority risk",
    "Create 7-day intervention plan",
    "What improves after simulation?"
  ];

  const handleAsk = async (textToQuery) => {
    const activeQuery = textToQuery || query;
    if (!activeQuery.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const payload = {
        question: activeQuery,
        selectedEntity: selectedEntity || null
      };
      
      const res = await askInterventionCopilot(payload);
      if (res.data.success) {
        setResult(res.data.data);
      } else {
        setError("Unable to obtain copilot response.");
      }
    } catch (err) {
      console.error("Copilot request error:", err);
      setError("Gemini is unavailable. Showing fallback institutional recommendation.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleAsk();
    }
  };

  const severityColors = {
    critical: "bg-[#fff1f2] text-[#e11d48] border-[#fecdd3] dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/40",
    high: "bg-[#fffbeb] text-[#d97706] border-[#fde68a] dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/40",
    moderate: "bg-[#eff6ff] text-[#2563eb] border-[#bfdbfe] dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/40",
    low: "bg-[#ecfdf5] text-[#059669] border-[#bbf7d0] dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/40"
  };

  const providerBadges = {
    gemini: "bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-none",
    ollama: "bg-purple-100 text-purple-800 border-purple-250 dark:bg-purple-950/30 dark:text-purple-300",
    fallback: "bg-amber-100 text-amber-800 border-amber-250 dark:bg-amber-950/30 dark:text-amber-300"
  };

  return (
    <article className="rounded-3xl border border-slate-200/40 bg-gradient-to-br from-blue-50/30 via-white/80 to-cyan-50/20 p-5 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-slate-900/80 dark:from-slate-900/80 dark:to-slate-900/85 transition-all duration-300 hover:shadow-md text-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/40 pb-3 dark:border-white/10">
        <div>
          <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-slate-100">Gemini Intervention Copilot</h3>
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
            Ask why a risk is urgent and what action the institution should take next.
          </p>
        </div>

        {selectedEntity && (
          <span className="inline-flex items-center rounded-lg bg-sky-50 border border-sky-100/85 px-2 py-0.5 text-[9px] font-extrabold text-sky-700 dark:bg-sky-950/20 dark:text-sky-400 dark:border-sky-900/30">
            Context: {selectedEntity.label}
          </span>
        )}
      </div>

      {/* Input controls */}
      <div className="mt-4 space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder='Ask: "Which department needs urgent intervention this week and why?"'
            className="flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-white/15 dark:bg-slate-800 dark:text-white"
          />
          <button
            onClick={() => handleAsk()}
            disabled={loading}
            className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-sm hover:shadow hover:brightness-105 active:scale-[0.98] transition-all px-4 py-2 font-bold select-none disabled:opacity-50"
          >
            {loading ? "Analyzing..." : "Ask Gemini"}
          </button>
        </div>

        {/* Quick prompts */}
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Quick Prompts:</span>
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => {
                setQuery(prompt);
                handleAsk(prompt);
              }}
              className="rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200/50 px-2 py-1 text-[9.5px] font-semibold text-slate-650 dark:bg-slate-800 dark:text-slate-350 dark:border-white/5 dark:hover:bg-slate-750 transition-all select-none"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="mt-6 flex flex-col items-center justify-center py-6 text-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600"></div>
          <span className="mt-2.5 font-bold text-slate-650 dark:text-slate-400">Analyzing intervention signals...</span>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="mt-6 rounded-xl bg-rose-50 border border-rose-100 p-3 text-rose-700 dark:bg-rose-950/20 dark:border-[#e11d48]/20 dark:text-rose-300">
          <p className="font-semibold">{error}</p>
        </div>
      )}

      {/* Structured Output */}
      {result && !loading && (
        <div className="mt-6 space-y-4">
          
          {/* Metadata Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/40 pb-2 dark:border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wide">AI Provider:</span>
              <span className={`rounded-md border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${providerBadges[result.provider] || providerBadges.fallback}`}>
                {result.provider}
              </span>
            </div>
            
            <div className="flex items-center gap-1">
              <span className="text-[9px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wide">Confidence:</span>
              <span className="font-extrabold text-slate-700 dark:text-slate-300">{(result.answer.confidence * 100).toFixed(0)}%</span>
            </div>
          </div>

          {/* 1. Summary Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-white/5 dark:bg-slate-900/60 leading-relaxed text-slate-700 dark:text-slate-300">
            <p className="font-semibold">{result.answer.summary}</p>
          </div>

          {/* 2. Top Risk & Why it Matters row */}
          <div className="grid gap-4 md:grid-cols-[1.2fr,1.8fr]">
            
            {/* Top Risk details box */}
            <div className={`rounded-xl border p-3 flex flex-col justify-between ${severityColors[result.answer.topRisk.severity] || severityColors.moderate}`}>
              <div>
                <span className="block text-[8px] font-bold uppercase tracking-wider opacity-75">Flagged Vector</span>
                <h4 className="mt-1 font-heading text-sm font-bold truncate" title={result.answer.topRisk.entity}>
                  {result.answer.topRisk.entity}
                </h4>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <span className="block text-[8px] font-bold uppercase tracking-wider opacity-75">Score</span>
                  <span className="text-lg font-black">{result.answer.topRisk.score} APS</span>
                </div>
                
                <span className="rounded px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-wider border border-current">
                  {result.answer.topRisk.severity}
                </span>
              </div>
            </div>

            {/* Why it matters list */}
            <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-white/5 dark:bg-slate-900/60">
              <h5 className="font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider text-[9px] border-b pb-1 dark:border-white/10">
                Risk Attribution Drivers
              </h5>
              <ul className="mt-1.5 list-disc pl-3.5 space-y-1 text-slate-700 dark:text-slate-355 text-[10.5px]">
                {result.answer.whyItMatters.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

          </div>

          {/* 3. Recommended Actions Table */}
          <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-white/5 dark:bg-slate-900/60">
            <h5 className="font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider text-[9px] border-b pb-1 dark:border-white/10">
              Recommended Intervention Protocols
            </h5>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full text-left border-collapse text-[10.5px]">
                <thead>
                  <tr className="border-b border-slate-200/50 dark:border-white/15 text-slate-450 dark:text-slate-400">
                    <th className="pb-1 font-bold">Action Plan</th>
                    <th className="pb-1 font-bold">Owner</th>
                    <th className="pb-1 font-bold">Timeline</th>
                    <th className="pb-1 font-bold">Expected Impact</th>
                  </tr>
                </thead>
                <tbody>
                  {result.answer.recommendedActions.map((act, idx) => (
                    <tr key={idx} className="border-b border-slate-100/50 dark:border-white/5 last:border-none">
                      <td className="py-2 text-slate-800 dark:text-slate-200 font-semibold pr-2">{act.action}</td>
                      <td className="py-2 pr-2">
                        <span className="rounded bg-slate-100 text-slate-700 px-1 py-0.2 font-bold dark:bg-slate-800 dark:text-slate-300">
                          {act.owner}
                        </span>
                      </td>
                      <td className="py-2 text-slate-500 dark:text-slate-400 pr-2 font-medium">{act.timeline}</td>
                      <td className="py-2 text-slate-650 dark:text-slate-350">{act.expectedImpact}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. What-If Scenario Suggestion */}
          <div className="rounded-xl bg-[#eff6ff] border border-[#bfdbfe] text-[#1e3a8a] dark:bg-blue-950/20 dark:border-blue-900/30 dark:text-blue-300 p-3">
            <span className="block font-bold uppercase tracking-wider text-[9px]">Simulation Suggestion</span>
            <p className="mt-1 text-[10.5px]">
              <strong className="font-extrabold">Scenario:</strong> {result.answer.simulationSuggestion.scenario}
            </p>
            <p className="mt-0.5 text-[10.5px]">
              <strong className="font-extrabold">Projected Change:</strong> {result.answer.simulationSuggestion.expectedChange}
            </p>
          </div>

          {/* 5. Evidence Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[9px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Evidence Used:</span>
            {result.answer.evidenceUsed.map((chip) => (
              <span
                key={chip}
                className="rounded-md bg-slate-100 border border-slate-200/50 dark:bg-slate-800 dark:text-slate-300 dark:border-white/5 px-2 py-0.5 text-[9px] font-semibold text-slate-600"
              >
                {chip}
              </span>
            ))}
          </div>

          {/* 6. Follow-up Questions */}
          {result.answer.followUpQuestions && result.answer.followUpQuestions.length > 0 && (
            <div className="mt-3 space-y-1.5 border-t border-slate-200/40 pt-3 dark:border-white/10">
              <span className="block text-[9px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Suggested Follow-ups:</span>
              <div className="flex flex-col gap-1 text-[10px]">
                {result.answer.followUpQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      setQuery(q);
                      handleAsk(q);
                    }}
                    className="w-full text-left rounded-lg bg-white/40 border border-slate-200/60 hover:bg-white hover:border-slate-300 hover:text-blue-650 px-3 py-1.5 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300 dark:border-white/5 dark:hover:bg-slate-850 dark:hover:text-sky-400 transition-all select-none font-semibold truncate"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </article>
  );
}
