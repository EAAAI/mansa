export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const body = req.body;
        const token = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;

        if (!token || !chatId) {
            console.error('Missing Env Vars');
            return res.status(500).json({ error: 'Internal configuration error' });
        }

        // تحديد العنوان حسب نوع الفورم
        const formType = body.formType || 'رسالة';
        let header = '📩 رسالة جديدة';

        if (formType === 'بلاغ') header = '🚨 بلاغ عن خطأ جديد';
        else if (formType === 'اقتراح') header = '💡 اقتراح فكرة جديد';
        else if (formType === 'انضمام') header = '🚀 طلب انضمام جديد';

        // تسمية المفاتيح بالعربي
        const labels = {
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

        // بناء الرسالة من كل البيانات
        let lines = [`*${header}*`, '─────────────'];

        for (const [key, value] of Object.entries(body)) {
            if (key === 'formType') continue; // نتخطى الـ formType
            if (!value) continue; // نتخطى القيم الفارغة

            const label = labels[key] || `📌 ${key}`;
            lines.push(`${label}: ${value}`);
        }

        lines.push('─────────────');
        lines.push(`🕐 ${new Date().toLocaleString('ar-EG', { timeZone: 'Africa/Cairo' })}`);

        const text = lines.join('\n');

        const telegramUrl = `https://api.telegram.org/bot${token}/sendMessage`;
        const response = await fetch(telegramUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: text,
                parse_mode: 'Markdown',
            }),
        });

        if (response.ok) {
            return res.status(200).json({ success: true });
        } else {
            const errorData = await response.json();
            console.error('Telegram API Error:', errorData);
            return res.status(500).json({ error: 'Failed to send to Telegram' });
        }
    } catch (error) {
        console.error('Server Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
