const RATE_LIMIT_STORE_KEY = '__mansaRateLimitStore';

function getRateLimitStore() {
    if (!globalThis[RATE_LIMIT_STORE_KEY]) {
        globalThis[RATE_LIMIT_STORE_KEY] = new Map();
    }
    return globalThis[RATE_LIMIT_STORE_KEY];
}

function nowMs() {
    return Date.now();
}

function cleanupRateLimitStore(store) {
    const now = nowMs();
    for (const [key, value] of store.entries()) {
        if (value.resetAt <= now) {
            store.delete(key);
        }
    }
}

export function getClientIp(req) {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string' && forwarded.length > 0) {
        return forwarded.split(',')[0].trim();
    }

    const realIp = req.headers['x-real-ip'];
    if (typeof realIp === 'string' && realIp.length > 0) {
        return realIp.trim();
    }

    return 'unknown';
}

export function isOriginAllowed(req, allowedOriginsCsv) {
    if (!allowedOriginsCsv) {
        return true;
    }

    const origin = req.headers.origin;
    if (!origin) {
        return false;
    }

    const allowedOrigins = allowedOriginsCsv
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

    return allowedOrigins.includes(origin);
}

export function checkRateLimit(key, limit, windowMs) {
    const store = getRateLimitStore();
    cleanupRateLimitStore(store);

    const now = nowMs();
    const entry = store.get(key);

    if (!entry || entry.resetAt <= now) {
        store.set(key, { count: 1, resetAt: now + windowMs });
        return {
            allowed: true,
            remaining: limit - 1,
            retryAfterMs: windowMs,
        };
    }

    if (entry.count >= limit) {
        return {
            allowed: false,
            remaining: 0,
            retryAfterMs: entry.resetAt - now,
        };
    }

    entry.count += 1;
    store.set(key, entry);

    return {
        allowed: true,
        remaining: Math.max(0, limit - entry.count),
        retryAfterMs: entry.resetAt - now,
    };
}

export function normalizeBody(req) {
    if (!req.body) {
        return {};
    }

    if (typeof req.body === 'string') {
        try {
            return JSON.parse(req.body);
        } catch {
            return {};
        }
    }

    if (typeof req.body === 'object') {
        return req.body;
    }

    return {};
}

export function sanitizePlainText(value) {
    if (typeof value !== 'string') {
        return '';
    }

    return value
        .replace(/[\u0000-\u001F\u007F]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function validateStringField(value, maxLength, minLength = 0) {
    if (typeof value !== 'string') {
        return false;
    }

    const trimmed = sanitizePlainText(value);
    return trimmed.length >= minLength && trimmed.length <= maxLength;
}

export function validateContactPayload(payload) {
    const allowedFormTypes = new Set(['رسالة', 'بلاغ', 'اقتراح', 'انضمام']);

    const result = {
        valid: true,
        errors: [],
        normalized: {},
    };

    const formType = sanitizePlainText(payload.formType || 'رسالة');
    result.normalized.formType = allowedFormTypes.has(formType) ? formType : 'رسالة';

    const fields = {
        name: { max: 80 },
        email: { max: 120 },
        phone: { max: 40 },
        level: { max: 80 },
        contribution: { max: 1500 },
        suggestType: { max: 80 },
        text: { max: 2000 },
        question: { max: 2000 },
        error: { max: 2000 },
        message: { max: 2000 },
    };

    for (const [key, config] of Object.entries(fields)) {
        const rawValue = payload[key];
        if (rawValue === undefined || rawValue === null || rawValue === '') {
            continue;
        }

        if (!validateStringField(String(rawValue), config.max)) {
            result.valid = false;
            result.errors.push(`Invalid field: ${key}`);
            continue;
        }

        result.normalized[key] = sanitizePlainText(String(rawValue));
    }

    const hasContent =
        result.normalized.message ||
        result.normalized.text ||
        result.normalized.error ||
        result.normalized.contribution;

    if (!hasContent) {
        result.valid = false;
        result.errors.push('Missing required message content');
    }

    return result;
}

export function setCommonApiHeaders(res) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Cache-Control', 'no-store');
}

export function parseDataUri(dataUri) {
    if (typeof dataUri !== 'string') {
        return null;
    }

    const matches = dataUri.match(/^data:([a-zA-Z0-9/+.-]+);base64,(.+)$/);
    if (!matches) {
        return null;
    }

    return {
        mimeType: matches[1],
        base64: matches[2],
    };
}

export function safeJson(res, status, payload) {
    setCommonApiHeaders(res);
    return res.status(status).json(payload);
}
