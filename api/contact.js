export default async function handler(req, res) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { name, email, phone, level, contribution, type, formType } = req.body;

    // Validate required fields
    if (!formType) {
        return res.status(400).json({ error: 'Missing formType' });
    }

    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!BOT_TOKEN || !CHAT_ID) {
        console.error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    let message = '';

    if (formType === 'join') {
        message = `🚀 *طلب انضمام جديد*\n\n`
            + `👤 *الاسم:* ${name || 'غير محدد'}\n`
            + `📧 *الإيميل:* ${email || 'غير محدد'}\n`
            + `📱 *الهاتف:* ${phone || 'غير محدد'}\n`
            + `🎓 *المستوى:* ${level || 'غير محدد'}\n`
            + `💬 *المساهمة:* ${contribution || 'غير محدد'}`;
    } else if (formType === 'suggest') {
        message = `💡 *اقتراح جديد*\n\n`
            + `👤 *الاسم:* ${name || 'مجهول'}\n`
            + `🏷️ *النوع:* ${type || 'غير محدد'}\n`
            + `💬 *التفاصيل:* ${req.body.text || 'غير محدد'}`;
    } else if (formType === 'report') {
        message = `⚠️ *بلاغ عن خطأ*\n\n`
            + `❓ *السؤال:* ${req.body.question || 'غير محدد'}\n`
            + `❌ *الخطأ:* ${req.body.error || 'غير محدد'}`;
    } else {
        // Generic contact
        message = `📩 *رسالة جديدة*\n\n`
            + `👤 *الاسم:* ${name || 'غير محدد'}\n`
            + `📧 *الإيميل:* ${email || 'غير محدد'}\n`
            + `💬 *الرسالة:* ${req.body.message || 'غير محدد'}`;
    }

    try {
        const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
        const response = await fetch(telegramUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message,
                parse_mode: 'Markdown',
            }),
        });

        const data = await response.json();

        if (!data.ok) {
            console.error('Telegram API error:', data);
            return res.status(500).json({ error: 'Failed to send message' });
        }

        return res.status(200).json({ success: true, message: 'تم الإرسال بنجاح!' });
    } catch (error) {
        console.error('Error sending to Telegram:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
