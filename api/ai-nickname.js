import {
    checkRateLimit,
    getClientIp,
    isOriginAllowed,
    normalizeBody,
    safeJson,
    sanitizePlainText,
} from './_lib/security.js';

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

function fallbackNickname(name) {
    const cleanName = sanitizePlainText(name);
    if (!cleanName) {
        return 'صديقنا ⭐';
    }

    const parts = cleanName.split(' ');
    const firstName = parts[0] || cleanName;
    return `${firstName} ✨`;
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
    const rateLimit = checkRateLimit(`nickname:${clientIp}`, 20, 10 * 60 * 1000);
    if (!rateLimit.allowed) {
        return safeJson(res, 429, {
            error: 'Too many requests',
            retryAfterMs: rateLimit.retryAfterMs,
        });
    }

    const body = normalizeBody(req);
    const name = sanitizePlainText(body.name || '');

    if (name.length < 2 || name.length > 80) {
        return safeJson(res, 400, { error: 'Invalid name length' });
    }

    const apiKey = process.env.GROQ_API_KEY;
    const model = process.env.GROQ_MODEL || DEFAULT_MODEL;

    if (!apiKey) {
        return safeJson(res, 500, { error: 'Server AI configuration is missing' });
    }

    try {
        const response = await fetch(GROQ_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model,
                messages: [
                    {
                        role: 'system',
                        content:
                            'أنت مساعد ودود. مهمتك توليد لقب عربي لطيف واحد فقط. ارجع اللقب فقط بدون شرح.',
                    },
                    {
                        role: 'user',
                        content: `ولد لقب لطيف للاسم: ${name}`,
                    },
                ],
                max_tokens: 30,
                temperature: 0.8,
            }),
        });

        if (!response.ok) {
            return safeJson(res, 502, {
                error: 'AI provider failed',
                nickname: fallbackNickname(name),
            });
        }

        const data = await response.json();
        const nickname = sanitizePlainText(
            data?.choices?.[0]?.message?.content || fallbackNickname(name),
        );

        return safeJson(res, 200, {
            success: true,
            nickname: nickname || fallbackNickname(name),
        });
    } catch (error) {
        return safeJson(res, 500, {
            error: 'AI request failed',
            nickname: fallbackNickname(name),
        });
    }
}
