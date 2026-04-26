import {
    checkRateLimit,
    getClientIp,
    isOriginAllowed,
    normalizeBody,
    safeJson,
    validateContactPayload,
} from './_lib/security.js';

const FIELD_LABELS = {
    name: '👤 الاسم',
    email: '📧 الإيميل',
    phone: '📱 الهاتف',
    level: '🎓 المستوى',
    contribution: '💬 المساهمة',
    suggestType: '🏷️ نوع الاقتراح',
    text: '📝 التفاصيل',
    question: '❓ السؤال/الجزء الغلط',
    error: '❌ وصف الخطأ',
    message: '📝 الرسالة',
};

function getHeaderByFormType(formType) {
    if (formType === 'بلاغ') {
        return '🚨 بلاغ عن خطأ جديد';
    }

    if (formType === 'اقتراح') {
        return '💡 اقتراح فكرة جديد';
    }

    if (formType === 'انضمام') {
        return '🚀 طلب انضمام جديد';
    }

    return '📩 رسالة جديدة';
}

function buildTelegramMessage(payload) {
    const lines = [getHeaderByFormType(payload.formType), '─────────────'];

    for (const [key, value] of Object.entries(payload)) {
        if (key === 'formType' || !value) {
            continue;
        }

        const label = FIELD_LABELS[key] || `📌 ${key}`;
        lines.push(`${label}: ${value}`);
    }

    lines.push('─────────────');
    lines.push(`🕐 ${new Date().toLocaleString('ar-EG', { timeZone: 'Africa/Cairo' })}`);
    return lines.join('\n');
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
    const rateLimit = checkRateLimit(`contact:${clientIp}`, 25, 10 * 60 * 1000);
    if (!rateLimit.allowed) {
        return safeJson(res, 429, {
            error: 'Too many requests',
            retryAfterMs: rateLimit.retryAfterMs,
        });
    }

    const body = normalizeBody(req);
    const validated = validateContactPayload(body);
    if (!validated.valid) {
        return safeJson(res, 400, {
            error: 'Invalid payload',
            details: validated.errors,
        });
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
        return safeJson(res, 500, { error: 'Internal configuration error' });
    }

    try {
        const telegramUrl = `https://api.telegram.org/bot${token}/sendMessage`;
        const telegramPayload = {
            chat_id: chatId,
            text: buildTelegramMessage(validated.normalized),
        };

        const response = await fetch(telegramUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(telegramPayload),
        });

        if (!response.ok) {
            return safeJson(res, 502, { error: 'Failed to send to Telegram' });
        }

        return safeJson(res, 200, { success: true });
    } catch (error) {
        return safeJson(res, 500, { error: 'Internal server error' });
    }
}
