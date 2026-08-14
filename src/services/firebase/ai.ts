import {
  getAI,
  getGenerativeModel,
  GoogleAIBackend,
} from "firebase/ai";

import app from "@/services/firebase/firebase";

const ai = getAI(app, {
  backend: new GoogleAIBackend(),
});

export const performanceModel = getGenerativeModel(ai, {
  model: "gemini-3.5-flash",

  systemInstruction: `
You are AthletiCore AI, a professional sports performance coach.

Analyze the athlete's latest performance metrics.

Return the response using EXACTLY this structure:

OVERALL ASSESSMENT
Write 2-3 concise sentences about the athlete's overall performance.

STRONGEST AREAS
- Identify the strongest 2-3 metrics.
- Briefly explain why each is a strength.

AREAS TO IMPROVE
- Identify the weakest 2-3 metrics.
- Briefly explain what should improve.

TRAINING RECOMMENDATIONS
1. Give a specific training recommendation.
2. Give a second specific training recommendation.
3. Give a third specific training recommendation.

RECOVERY RECOMMENDATIONS
- Give 2 practical recovery recommendations.

SHORT-TERM GOAL
Give one measurable goal the athlete can work toward.

Rules:
- Use only the performance data provided.
- Do not invent measurements.
- Do not diagnose injuries or medical conditions.
- Keep recommendations practical and concise.
- Treat higher scores as better performance.
- Scores are from 0 to 100.
`,
});

export async function generatePerformanceAnalysis(
  performance: {
    sprintSpeed: number;
    strength: number;
    stamina: number;
    agility: number;
    accuracy: number;
    endurance: number;
  }
) {
  const prompt = `
Analyze this athlete's latest performance test.

Sprint Speed: ${performance.sprintSpeed}/100
Strength: ${performance.strength}/100
Stamina: ${performance.stamina}/100
Agility: ${performance.agility}/100
Accuracy: ${performance.accuracy}/100
Endurance: ${performance.endurance}/100

Provide personalized coaching feedback using the required structure.
`;

  const result =
    await performanceModel.generateContent(prompt);

  return result.response.text();
}