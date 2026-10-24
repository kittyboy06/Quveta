import { GoogleGenerativeAI } from "@google/generative-ai";
import { EventPlan, EventPlanSchema } from "../domain/plan.schema";
import { generateDeterministicPlan } from "../fallback/deterministic.planner";
import { SeedEvent } from "@/shared/db/seed-data";

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";

export async function generateEventPlanWithAI(event: SeedEvent): Promise<{ plan: EventPlan; provider: "gemini" | "deterministic_fallback" }> {
  if (!apiKey || apiKey.trim() === "") {
    return {
      plan: generateDeterministicPlan(event),
      provider: "deterministic_fallback",
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const prompt = `
You are the Quveta Senior AI Event Planning Engine.
Generate an actionable, personalized, structured event plan matching the JSON schema below.

Event Details:
- Title: ${event.title}
- Type: ${event.event_type}
- Date: ${event.event_date}
- Location: ${event.location}
- Expected Guest Count: ${event.guest_count}
- Target Budget: ₹${(event.target_budget / 100).toLocaleString("en-IN")}
- Theme: ${event.preferences.theme || "None specified"}
- Must Haves (Protected Priorities): ${event.preferences.mustHaves?.join(", ") || "Standard"}
- Dietary Constraints: ${event.preferences.dietary?.join(", ") || "None"}
- Accessibility Needs: ${event.preferences.accessibility?.join(", ") || "Standard"}

CRITICAL RULES:
1. Output valid JSON matching the exact schema:
{
  "summary": string,
  "assumptions": string[],
  "milestones": [ { "title": string, "daysBeforeEvent": number, "category": string, "description": string } ],
  "proposedCategories": [ { "name": string, "priority": "MUST_HAVE"|"HIGH"|"FLEXIBLE"|"LOW", "allocationRatio": number, "explanation": string } ],
  "proposedTasks": [ { "title": string, "category": string, "priority": "CRITICAL"|"HIGH"|"MEDIUM"|"LOW", "estimatedDays": number, "daysBeforeEvent": number, "prerequisiteTitles": string[] } ],
  "riskAnalysis": [ { "risk": string, "severity": "HIGH"|"MEDIUM"|"LOW", "mitigation": string } ],
  "missingInformation": string[]
}
2. Never invent confirmed vendor prices or guarantees. Clearly state assumptions.
3. Respect all must-haves and accessibility constraints.
`;

    const response = await model.generateContent(prompt);
    const text = response.response.text();
    const parsedJson = JSON.parse(text);
    const validated = EventPlanSchema.parse(parsedJson);

    return {
      plan: validated,
      provider: "gemini",
    };
  } catch (error) {
    console.warn("Gemini API call failed or quota exceeded. Activating Deterministic Fallback Engine:", error);
    return {
      plan: generateDeterministicPlan(event),
      provider: "deterministic_fallback",
    };
  }
}
