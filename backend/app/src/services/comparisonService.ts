import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import Society from "../models/Society";

interface ComparisonResult {
    requestName: string;
    overallSimilarityScore: number;
    summary: string;
    overlappingSocieties: Array<{
        societyName: string;
        similarityScore: number;
        overlappingObjectives: string[];
        overlappingActivities: string[]; 
        uniqueAspects: string[];
    }>;
    recommendation: string;
    uniqueValueProposition: string;
}

/**
 * Strips PII from form_data before sending to the LLM.
 * Only keeps society-related objectives, activities, and descriptions.
 */
function sanitizeFormDataForLLM(formData: any): Record<string, unknown> {
    if (!formData) return {};

    return {
        title: formData.title || "",
        review_comment: formData.history?.review_comment || "",
        activities: (formData.history?.activities || []).map((a: any) => ({
            title: a.title || "",
            review: a.review || "",
        })),
        challenges: formData.history?.challenges || "",
        feedback: formData.history?.feedback || "",
        official_documents: formData.history?.official_documents || "",
        // Renewal form fields
        functions: formData.functions || "",
        calendar_events_description: formData.calendar_events?.description || "",
        calendar_events: formData.calendar_events?.events || [],
    };
}

/**
 * Strips PII from existing societies before sending to the LLM.
 */
function sanitizeSocietyForLLM(society: any): Record<string, unknown> {
    return {
        name: society.name,
        description: society.description,
        category: society.category,
        content_sections: (society.content_sections || []).map((s: any) => ({
            title: s.title,
            content: s.content,
        })),
        why_join_us: society.why_join_us || [],
        faqs: (society.faqs || []).map((f: any) => ({
            question: f.question,
            answer: f.answer,
        })),
    };
}

export async function compareSocietyWithExisting(
    requestFormData: any,
    requestSocietyName: string,
    requestDescription?: string
): Promise<ComparisonResult> {
    const groqKey = process.env.GROQ_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    if (!groqKey && !geminiKey) {
        throw new Error("No LLM API key configured. Set GROQ_API_KEY or GEMINI_API_KEY in environment variables.");
    }

    // Fetch all active societies
    const existingSocieties = await Society.find({
        status: "ACTIVE",
    }).select("name description category content_sections why_join_us faqs");

    if (existingSocieties.length === 0) {
        return {
            requestName: requestSocietyName,
            overallSimilarityScore: 0,
            summary: "No existing active societies found for comparison.",
            overlappingSocieties: [],
            recommendation: "This would be the first society on the platform. Approve if the proposal meets quality standards.",
            uniqueValueProposition: "As the first society, it brings entirely new value to the platform.",
        };
    }

    const sanitizedRequest = sanitizeFormDataForLLM(requestFormData);
    const sanitizedSocieties = existingSocieties.map(sanitizeSocietyForLLM);

    const prompt = `You are an academic institution's society review analyst. Compare a NEW society registration request with EXISTING societies and identify overlaps in objectives, activities, and focus areas.

NEW SOCIETY REQUEST:
- Name: ${requestSocietyName}
- Description: ${requestDescription || "Not provided"}
- Form Details: ${JSON.stringify(sanitizedRequest)}

EXISTING SOCIETIES:
${JSON.stringify(sanitizedSocieties)}

Analyze and return a JSON response (no markdown, no code fences, just raw JSON) with this exact structure:
{
  "overallSimilarityScore": <number 0-100 representing how much the new society overlaps with existing ones>,
  "summary": "<2-3 sentence overview of the comparison findings>",
  "overlappingSocieties": [
    {
      "societyName": "<name of existing society>",
      "similarityScore": <number 0-100>,
      "overlappingObjectives": ["<objective 1>", "<objective 2>"],
      "overlappingActivities": ["<activity 1>", "<activity 2>"],
      "uniqueAspects": ["<what makes the new request different from this society>"]
    }
  ],
  "recommendation": "<your recommendation: APPROVE, REVIEW_CAREFULLY, or LIKELY_DUPLICATE with reasoning>",
  "uniqueValueProposition": "<what unique value the new society would bring that existing ones don't cover>"
}

Rules:
- Only include societies with similarityScore > 10 in overlappingSocieties
- Be objective and fair in your analysis
- Focus on actual functional overlap, not superficial name similarity
- If the new society has a genuinely unique focus, acknowledge that clearly
- Keep all text concise and professional`;

    let text: string | undefined;
    let lastError: any;

    // --- Try Groq first (free tier: 14,400 req/day, 30 req/min) ---
    if (groqKey) {
        const groqModels = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"];
        const groq = new Groq({ apiKey: groqKey });

        for (const model of groqModels) {
            for (let attempt = 0; attempt < 2; attempt++) {
                try {
                    const completion = await groq.chat.completions.create({
                        model,
                        messages: [{ role: "user", content: prompt }],
                        temperature: 0.3,
                    });
                    text = completion.choices[0]?.message?.content ?? undefined;
                    break;
                } catch (err: any) {
                    lastError = err;
                    const isRateLimit = err.status === 429 || err.error?.code === "rate_limit_exceeded";
                    if (isRateLimit && attempt === 0) {
                        await new Promise((r) => setTimeout(r, 5000));
                        continue;
                    }
                    break;
                }
            }
            if (text) break;
        }
    }

    // --- Fall back to Gemini if Groq failed or key not set ---
    if (!text && geminiKey) {
        const geminiModels = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"];
        const genAI = new GoogleGenerativeAI(geminiKey);

        for (const modelName of geminiModels) {
            for (let attempt = 0; attempt < 2; attempt++) {
                try {
                    const model = genAI.getGenerativeModel({ model: modelName });
                    const result = await model.generateContent(prompt);
                    text = result.response.text();
                    break;
                } catch (err: any) {
                    lastError = err;
                    const isRateLimit = err.status === 429 || err.message?.includes("429");
                    if (isRateLimit && attempt === 0) {
                        await new Promise((r) => setTimeout(r, 5000));
                        continue;
                    }
                    break;
                }
            }
            if (text) break;
        }
    }

    if (!text) {
        const isQuotaExhausted = lastError?.status === 429;
        if (isQuotaExhausted) {
            throw new Error("GEMINI_RATE_LIMITED");
        }
        throw lastError || new Error("All LLM providers failed to generate a response");
    }

    // Parse the JSON response, handling potential markdown code fences
    let cleanedText = text.trim();
    if (cleanedText.startsWith("```")) {
        cleanedText = cleanedText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    let parsed: any;
    try {
        parsed = JSON.parse(cleanedText);
    } catch {
        throw new Error("Failed to parse LLM comparison response");
    }

    return {
        requestName: requestSocietyName,
        overallSimilarityScore: parsed.overallSimilarityScore ?? 0,
        summary: parsed.summary ?? "Comparison completed.",
        overlappingSocieties: Array.isArray(parsed.overlappingSocieties)
            ? parsed.overlappingSocieties
            : [],
        recommendation: parsed.recommendation ?? "REVIEW_CAREFULLY",
        uniqueValueProposition: parsed.uniqueValueProposition ?? "",
    };
}
