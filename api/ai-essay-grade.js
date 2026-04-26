import {
    checkRateLimit,
    getClientIp,
    isOriginAllowed,
    normalizeBody,
    safeJson,
    sanitizePlainText,
} from './_lib/security.js';

const DEFAULT_MODEL = 'gemini-2.0-flash';
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);

function parseAiJson(text) {
    const raw = String(text || '').trim();
    if (!raw) {
        return null;
    }

    let jsonString = raw;
    if (jsonString.startsWith('```json')) {
        jsonString = jsonString.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonString.startsWith('```')) {
        jsonString = jsonString.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    try {
        return JSON.parse(jsonString);
    } catch {
        return null;
    }
}

function normalizeGradeResult(parsed) {
    const score = Number(parsed?.score);
    const boundedScore = Number.isFinite(score) ? Math.max(0, Math.min(5, score)) : 0;

    return {
        score: boundedScore,
        feedback: sanitizePlainText(parsed?.feedback || 'تم التصحيح.'),
        correction_details: {
            what_was_wrong: sanitizePlainText(parsed?.correction_details?.what_was_wrong || ''),
            ideal_answer: sanitizePlainText(parsed?.correction_details?.ideal_answer || ''),
            encouragement: sanitizePlainText(parsed?.correction_details?.encouragement || ''),
        },
    };
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return safeJson(res, 405, { error: 'Method not allowed' });
    }

    const allowedOrigins = process.env.ALLOWED_ORIGINS || '';
    if (!isOriginAllowed(req, allowedOrigins)) {
        return safeJson(res, 403, { error: 'Origin not allowed' });
    }

    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(`essay:${clientIp}`, 12, 10 * 60 * 1000);
    if (!rateLimit.allowed) {
        return safeJson(res, 429, {
            error: 'Too many requests',
            retryAfterMs: rateLimit.retryAfterMs,
        });
    }

    const body = normalizeBody(req);
    const base64Image = sanitizePlainText(body.base64Image || '');
    const mimeType = sanitizePlainText(body.mimeType || '').toLowerCase();
    const questionText = sanitizePlainText(body.questionText || '');
    const modelAnswer = sanitizePlainText(body.modelAnswer || '');

    if (!base64Image || !ALLOWED_MIME_TYPES.has(mimeType)) {
        return safeJson(res, 400, { error: 'Invalid image payload' });
    }

    const maxBase64Length = Number(process.env.MAX_ESSAY_IMAGE_BASE64_LENGTH || 2800000);
    if (base64Image.length > maxBase64Length) {
        return safeJson(res, 413, { error: 'Image payload too large' });
    }

    if (!questionText) {
        return safeJson(res, 400, { error: 'Missing question text' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;

    if (!apiKey) {
        return safeJson(res, 500, { error: 'Server AI configuration is missing' });
    }

    const promptText = `أنت معلم متساهل ومشجع. مهمتك تصحيح إجابة طالب مكتوبة بخط اليد.\n\nالسؤال:\n${questionText}\n\nالإجابة النموذجية:\n${modelAnswer}\n\nأعد النتيجة كـ JSON فقط بالشكل التالي:\n{\n  "score": رقم من 0 إلى 5,\n  "feedback": "تعليق مشجع مختصر",\n  "correction_details": {\n    "what_was_wrong": "ما كان خاطئاً",\n    "ideal_answer": "ملخص الإجابة المثالية",\n    "encouragement": "نصيحة مشجعة"\n  }\n}`;

    try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            { text: promptText },
                            {
                                inlineData: {
                                    mimeType,
                                    data: base64Image,
                                },
                            },
                        ],
                    },
                ],
                generationConfig: {
                    temperature: 0.35,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                },
            }),
        });

        if (!response.ok) {
            return safeJson(res, 502, { error: 'AI provider failed' });
        }

        const data = await response.json();
        const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        const parsed = parseAiJson(responseText);

        if (!parsed) {
            return safeJson(res, 502, { error: 'Invalid AI response format' });
        }

        return safeJson(res, 200, {
            success: true,
            result: normalizeGradeResult(parsed),
        });
    } catch (error) {
        return safeJson(res, 500, { error: 'AI request failed' });
    }
}
