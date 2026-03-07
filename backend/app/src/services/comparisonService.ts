import { GoogleGenerativeAI } from "@google/generative-ai";
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
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not configured in environment variables");
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

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

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
