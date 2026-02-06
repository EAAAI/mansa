// AI Chat Module
// Handles the chatbot, AI responses, image analysis

let chatHistory = [];
let userName = '';
let isFirstMessage = true;

function toggleChatBot() {
    const container = document.getElementById('chatBotContainer');
    if (!container) return;
    
    container.classList.toggle('active');

    if (container.classList.contains('active') && isFirstMessage) {
        setTimeout(() => {
            addBotMessage(`أهلاً وسهلاً بك! 👋

أنا **ذكي**، نموذج لغوي ذكي مطور من شركة **EAAAI**.
🌐 <a href="https://ibrahim88887.github.io/EAAAI/" target="_blank" style="color: #38ef7d;">زور موقعنا</a>

🎓 **إحنا هنا عشان نساعد طلاب أولى حاسبات!**

أقدر أساعدك في:
• شرح الأسئلة والمفاهيم الصعبة
• حل المسائل الرياضية والفيزيائية 📐
• **رفع صور المسائل وحلها** 📷
• الإجابة على أي استفسار دراسي

ممكن أعرف اسمك الكريم؟ 😊`);
            isFirstMessage = false;
        }, 500);
    }
}

function addBotMessage(message) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message bot';
    messageDiv.innerHTML = `
        <div class="message-header">
            <i class="fas fa-robot"></i>
            <span>ذكي</span>
        </div>
        <div class="message-text">${message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>')}</div>
    `;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addUserMessage(message) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message user';
    messageDiv.textContent = message;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTypingIndicator() {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = '<span></span><span></span><span></span>';
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideTypingIndicator() {
    const typing = document.getElementById('typingIndicator');
    if (typing) typing.remove();
}

async function sendMessage() {
    const input = document.getElementById('chatInput');
    if (!input) return;
    
    const message = input.value.trim();
    if (!message) return;

    addUserMessage(message);
    input.value = '';

    if (!userName && chatHistory.length === 0) {
        userName = message;
        chatHistory.push({ role: 'user', content: message });

        setTimeout(() => {
            addBotMessage(`أهلاً يا ${userName}! 🎉

نورتني والله! أنا سعيد إني أقدر أساعدك في رحلتك في أولى حاسبات.

اسألني أي سؤال في الفيزياء أو الرياضيات أو أي مادة تانية، وأنا هشرحلك بالتفصيل.

💡 **نصيحة:** تقدر ترفع صورة لأي مسألة وأنا هحلها! اضغط على 📷

🌐 لو عايز تعرف أكتر عن شركة EAAAI: <a href="https://ibrahim88887.github.io/EAAAI/" target="_blank" style="color: #38ef7d;">زور موقعنا</a>

إيه اللي محتاج مساعدة فيه؟ 📚`);
            chatHistory.push({
                role: 'assistant',
                content: `أهلاً يا ${userName}! نورتني والله! أنا سعيد جداً إني أقدر أساعدك. اسألني أي سؤال وأنا هشرحلك بالتفصيل.`
            });
        }, 800);
        return;
    }

    chatHistory.push({ role: 'user', content: message });
    showTypingIndicator();

    try {
        const response = await getAIResponse(message);
        hideTypingIndicator();
        addBotMessage(response);
        chatHistory.push({ role: 'assistant', content: response });
    } catch (error) {
        hideTypingIndicator();
        addBotMessage('عذراً، حصل خطأ. ممكن تحاول تاني؟ 🙏');
    }
}

async function getAIResponse(userMessage) {
    const systemPrompt = `أنت "ذكي"، نموذج لغوي ذكي مطور من شركة EAAAI.
موقع الشركة: https://ibrahim88887.github.io/EAAAI/

أنت مخصص لمساعدة طلاب أولى حاسبات (السنة الأولى بكلية الحاسبات والمعلومات).

شخصيتك:
- ودود ومرح ومتحمس للمساعدة
- تتكلم بالعربي الفصيح مع لمسة مصرية خفيفة
- تستخدم الإيموجي بشكل معتدل
- تشرح بطريقة بسيطة وواضحة

مهامك:
1. شرح الأسئلة والمفاهيم العلمية (فيزياء، رياضيات، إلكترونيات، IT)
2. حل المسائل خطوة بخطوة
3. تبسيط المفاهيم الصعبة
4. تشجيع الطالب ومساعدته

${userName ? `اسم الطالب الذي تتحدث معه: ${userName}` : ''}

قواعد مهمة:
- لو سألك حد "مين عملك" أو "مين طورك"، قول إنك "ذكي" نموذج لغوي مطور من شركة EAAAI وإنك مخصص لمساعدة طلاب أولى حاسبات، واديله رابط الموقع: https://ibrahim88887.github.io/EAAAI/
- خلي إجاباتك مختصرة ومفيدة
- استخدم الأمثلة لتوضيح المفاهيم
- شجع الطالب دائماً`;

    const messages = [
        { role: 'system', content: systemPrompt },
        ...chatHistory.slice(-10),
    ];

    const response = await fetch(API_CONFIG.apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_CONFIG.apiKey}`
        },
        body: JSON.stringify({
            model: API_CONFIG.model,
            messages: messages,
            max_tokens: 1024,
            temperature: 0.7
        })
    });

    if (!response.ok) {
        throw new Error('API Error');
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'عذراً، مش قادر أرد دلوقتي.';
}

async function askAI() {
    const questionInput = document.getElementById('askAiQuestion');
    const responseDiv = document.getElementById('askAiResponse');
    const responseContent = document.getElementById('askAiResponseContent');
    const askBtn = document.querySelector('.ask-ai-btn');

    if (!questionInput || !responseDiv || !responseContent || !askBtn) return;

    const question = questionInput.value.trim();

    if (!question) {
        alert('من فضلك اكتب سؤالك أولاً!');
        questionInput.focus();
        return;
    }

    askBtn.disabled = true;
    askBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التفكير...';
    responseDiv.style.display = 'block';
    responseContent.innerHTML = '<div class="ask-ai-loading"><i class="fas fa-spinner"></i> ذكي بيفكر في إجابتك...</div>';

    try {
        const systemPrompt = `أنت "ذكي"، نموذج لغوي ذكي مطور من شركة EAAAI.
أنت مخصص لمساعدة طلاب أولى حاسبات في الأسئلة المقالية والعلمية.

أنت خبير في:
- فيزياء (موجات، ضوء، مغناطيسية، نسبية، أشباه موصلات)
- رياضيات
- إلكترونيات
- IT
- تاريخ الحوسبة
- قوانين الحاسبات

طريقة الإجابة:
1. اشرح بالعربي والإنجليزي معاً
2. استخدم 🔵 بالعربي: و 🔵 In English:
3. اكتب القوانين والمعادلات بوضوح
4. استخدم أمثلة عند الحاجة
5. خلي الإجابة منظمة ومرتبة
6. استخدم الإيموجي بشكل معتدل`;

        const response = await fetch(API_CONFIG.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_CONFIG.apiKey}`
            },
            body: JSON.stringify({
                model: API_CONFIG.model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: question }
                ],
                max_tokens: 2048,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error('API Error');
        }

        const data = await response.json();
        const answer = data.choices[0]?.message?.content || 'عذراً، مش قادر أرد دلوقتي.';

        const formattedAnswer = answer
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');

        responseContent.innerHTML = formattedAnswer;

    } catch (error) {
        responseContent.innerHTML = '❌ حدث خطأ. تأكد من اتصالك بالإنترنت وحاول مرة أخرى.';
    }

    askBtn.disabled = false;
    askBtn.innerHTML = '<i class="fas fa-paper-plane"></i> اسأل ذكي';
}

function handleChatKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

function handleChatImage(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        addBotMessage('⚠️ من فضلك ارفع صورة فقط!');
        return;
    }

    if (file.size > 10 * 1024 * 1024) {
        addBotMessage('⚠️ حجم الصورة كبير جداً! الحد الأقصى 10MB');
        return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
        const base64Image = e.target.result;
        addUserImageMessage(base64Image);
        showTypingIndicator();

        try {
            const response = await analyzeImageWithAI(base64Image);
            hideTypingIndicator();
            addBotMessage(response);
        } catch (error) {
            hideTypingIndicator();
            addBotMessage('عذراً، مش قادر أحلل الصورة دلوقتي. ممكن تحاول تاني؟ 🙏');
        }
    };
    reader.readAsDataURL(file);
    event.target.value = '';
}

function addUserImageMessage(imageSrc) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message user image-message';
    messageDiv.innerHTML = `
        <img src="${imageSrc}" alt="صورة المسألة" onclick="openImagePreview(this.src)">
        <span class="image-label">📷 صورة مسألة</span>
    `;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function analyzeImageWithAI(imageData) {
    const base64Data = imageData.split(',')[1];
    const mimeType = imageData.split(';')[0].split(':')[1];

    try {
        const response = await fetch(`${GEMINI_CONFIG.apiUrl}?key=${GEMINI_CONFIG.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        {
                            text: `أنت "ذكي"، نموذج ذكاء اصطناعي مطور من شركة EAAAI.

انظر لهذه الصورة بعناية. تحتوي على سؤال أو مسألة تعليمية.

المطلوب:
1. استخرج واكتب نص السؤال/المسألة من الصورة
2. قدم الحل خطوة بخطوة
3. اكتب الإجابة النهائية

${userName ? `اسم الطالب: ${userName}` : ''}

اشرح بطريقة بسيطة وواضحة باللغة العربية. استخدم الإيموجي بشكل معتدل.`
                        },
                        {
                            inline_data: {
                                mime_type: mimeType,
                                data: base64Data
                            }
                        }
                    ]
                }],
                generationConfig: {
                    temperature: 0.3,
                    maxOutputTokens: 2048
                }
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        return text || 'عذراً، مش قادر أحلل الصورة. جرب تاني! 🔄';
    } catch (error) {
        throw error;
    }
}

function openImagePreview(src) {
    const overlay = document.createElement('div');
    overlay.className = 'image-preview-overlay';
    overlay.innerHTML = `
        <div class="image-preview-content">
            <img src="${src}" alt="معاينة">
            <button class="close-preview" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    overlay.onclick = (e) => {
        if (e.target === overlay) overlay.remove();
    };
    document.body.appendChild(overlay);
}

// Setup keyboard shortcuts
document.addEventListener('DOMContentLoaded', () => {
    const askAiTextarea = document.getElementById('askAiQuestion');
    if (askAiTextarea) {
        askAiTextarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                e.preventDefault();
                askAI();
            }
        });
    }
});
