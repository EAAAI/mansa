export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { name, email, message, type } = req.body;
        
        // جلب البيانات من البيئة
        const token = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;

        if (!token || !chatId) {
            console.error('Missing Env Vars');
            return res.status(500).json({ error: 'Internal configuration error' });
        }

        const text = `🚀 رسالة جديدة من: ${name}\n📧 الإيميل: ${email}\n📂 النوع: ${type || 'غير محدد'}\n📝 الرسالة: ${message}`;

        const telegramUrl = `https://api.telegram.org/bot${token}/sendMessage`;
        
        const response = await fetch(telegramUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: text,
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
