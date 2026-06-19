import { GoogleGenAI } from "@google/genai";

let aiClient = null;

const SYSTEM_INSTRUCTION = `You are the IQAC Intervention Copilot for a College Digital Twin.
Your job is to convert academic, placement, and accreditation risk signals into practical institutional actions.
Use only the provided JSON data.
Do not invent students, departments, metrics, evidence, or scores.
If data is missing, say data unavailable.
Return concise, structured, decision-ready recommendations.
Avoid medical, disciplinary, or sensitive personal advice.
Prefer aggregate/cohort actions unless the user explicitly selected a student.
All recommendations should be realistic within 1 to 4 weeks.`;

const responseSchema = {
  type: "OBJECT",
  properties: {
    summary: { type: "STRING" },
    topRisk: {
      type: "OBJECT",
      properties: {
        title: { type: "STRING" },
        severity: { type: "STRING", enum: ["low", "moderate", "high", "critical"] },
        entity: { type: "STRING" },
        score: { type: "NUMBER" }
      },
      required: ["title", "severity", "entity", "score"]
    },
    whyItMatters: {
      type: "ARRAY",
      items: { type: "STRING" }
    },
    recommendedActions: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          action: { type: "STRING" },
          owner: { type: "STRING", enum: ["Admin", "HOD", "Faculty", "Mentor", "IQAC"] },
          timeline: { type: "STRING" },
          expectedImpact: { type: "STRING" }
        },
        required: ["action", "owner", "timeline", "expectedImpact"]
      }
    },
    simulationSuggestion: {
      type: "OBJECT",
      properties: {
        scenario: { type: "STRING" },
        expectedChange: { type: "STRING" }
      },
      required: ["scenario", "expectedChange"]
    },
    evidenceUsed: {
      type: "ARRAY",
      items: { type: "STRING" }
    },
    confidence: { type: "NUMBER" },
    followUpQuestions: {
      type: "ARRAY",
      items: { type: "STRING" }
    }
  },
  required: [
    "summary",
    "topRisk",
    "whyItMatters",
    "recommendedActions",
    "simulationSuggestion",
    "evidenceUsed",
    "confidence",
    "followUpQuestions"
  ]
};

export async function getGeminiInterventionAdvice(contextData, userQuestion) {
  const hasKey = !!process.env.GEMINI_API_KEY;
  const provider = (hasKey && process.env.AI_PROVIDER !== "fallback") ? "gemini" : "fallback";

  if (provider === "gemini") {
    try {
      if (!aiClient) {
        aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      }
      
      const model = process.env.GEMINI_MODEL || "gemini-3.5-flash";
      const contents = `CONTEXT DATA:\n${JSON.stringify(contextData, null, 2)}\n\nUSER QUESTION:\n${userQuestion}`;
      
      const res = await aiClient.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: responseSchema,
          temperature: 0.2
        }
      });

      const text = res.text || res.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        const parsed = JSON.parse(text.trim());
        return {
          provider: "gemini",
          fallbackUsed: false,
          answer: parsed
        };
      }
      throw new Error("Empty candidate response from Gemini.");
    } catch (err) {
      console.error("Gemini Copilot execution failed, falling back to deterministic response generator:", err.message);
    }
  }

  // Fallback Generation
  const fallbackAnswer = generateFallbackAnswer(contextData, userQuestion);
  return {
    provider: "fallback",
    fallbackUsed: true,
    answer: fallbackAnswer
  };
}

function generateFallbackAnswer(contextData, userQuestion) {
  const topEntityItem = contextData.selectedEntity || contextData.topPriorityItem || (contextData.overview?.topEntity ? { label: contextData.overview.topEntity, score: contextData.overview.actionPriorityScore, severity: contextData.overview.severity, reasons: ["High system urgency level"], recommendedActions: ["Conduct immediate review meetings"] } : null);

  const label = topEntityItem?.label || "Institutional System";
  const score = topEntityItem?.score || 50;
  const severity = topEntityItem?.severity || "moderate";
  const reasons = topEntityItem?.reasons || ["Institutional risk threshold warning"];
  const actions = topEntityItem?.recommendedActions || ["Schedule mentor/advisor reviews"];

  const summary = `System fallback recommendation active. The top priority threat vector under query is ${label} with an Action Priority Score urgency index of ${score}/100 (${severity}).`;
  
  const recommendedActions = actions.map((act) => ({
    action: act,
    owner: "HOD",
    timeline: "7 days",
    expectedImpact: "Reduce immediate threat metrics and student risk level"
  }));

  const simulationSuggestion = {
    scenario: "Increase attendance +10% and clear 2 backlogs in What-If Simulator.",
    expectedChange: "Projects drop of APS Urgency score into safe range (<40)"
  };

  return {
    summary,
    topRisk: {
      title: `Top Risk: ${label}`,
      severity,
      entity: label,
      score
    },
    whyItMatters: reasons,
    recommendedActions,
    simulationSuggestion,
    evidenceUsed: ["Action Priority Queue", "Student Risk Metrics"],
    confidence: 0.65,
    followUpQuestions: [
      `Why is ${label} marked as ${severity}?`,
      `What is the recommended intervention timeline for ${label}?`
    ]
  };
}
