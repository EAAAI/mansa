// ==========================================
// Configuration - Groq API
// ==========================================
const API_CONFIG = {
    apiKey: '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',
    apiUrl: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'llama-3.3-70b-versatile'
};

// ==========================================
// Firebase Configuration
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSyCFhUdOI9IqFCjBkg8zytanD5O1_67vCr4",
    authDomain: "manasa-ceaa2.firebaseapp.com",
    projectId: "manasa-ceaa2",
    storageBucket: "manasa-ceaa2.firebasestorage.app",
    messagingSenderId: "847284305108",
    appId: "1:847284305108:web:7a14698f76b3981c6acf41",
    measurementId: "G-CYX6QKJZSR"
};

// Initialize Firebase
let db;
try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    console.log('✅ Firebase initialized successfully');
} catch (error) {
    console.error('❌ Firebase initialization error:', error);
}

// ==========================================
// AI Chat Bot - ذكي
// ==========================================
let chatHistory = [];
let userName = '';
let isFirstMessage = true;
let pendingImage = null;

// فتح/إغلاق البوت
function toggleChatBot() {
    const container = document.getElementById('chatBotContainer');
    container.classList.toggle('active');
    
    // إرسال رسالة الترحيب عند أول فتح
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

// إضافة رسالة من البوت
function addBotMessage(message) {
    const chatMessages = document.getElementById('chatMessages');
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

// إضافة رسالة من المستخدم
function addUserMessage(message) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message user';
    messageDiv.textContent = message;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// إظهار مؤشر الكتابة
function showTypingIndicator() {
    const chatMessages = document.getElementById('chatMessages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = '<span></span><span></span><span></span>';
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// إخفاء مؤشر الكتابة
function hideTypingIndicator() {
    const typing = document.getElementById('typingIndicator');
    if (typing) typing.remove();
}

// إرسال رسالة
async function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // إضافة رسالة المستخدم
    addUserMessage(message);
    input.value = '';
    
    // حفظ الاسم لو لسه مقالوش
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
    
    // إضافة للتاريخ
    chatHistory.push({ role: 'user', content: message });
    
    // إظهار مؤشر الكتابة
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

// الحصول على رد من AI
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
        ...chatHistory.slice(-10), // آخر 10 رسائل فقط
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

// ==========================================
// Ask AI - اسأل الذكاء الاصطناعي
// ==========================================

async function askAI() {
    const questionInput = document.getElementById('askAiQuestion');
    const responseDiv = document.getElementById('askAiResponse');
    const responseContent = document.getElementById('askAiResponseContent');
    const askBtn = document.querySelector('.ask-ai-btn');
    
    const question = questionInput.value.trim();
    
    if (!question) {
        alert('من فضلك اكتب سؤالك أولاً!');
        questionInput.focus();
        return;
    }
    
    // إظهار حالة التحميل
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
        
        // تنسيق الإجابة
        const formattedAnswer = answer
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');
        
        responseContent.innerHTML = formattedAnswer;
        
    } catch (error) {
        console.error('Ask AI Error:', error);
        responseContent.innerHTML = '❌ حدث خطأ. تأكد من اتصالك بالإنترنت وحاول مرة أخرى.';
    }
    
    // إعادة الزر لحالته الطبيعية
    askBtn.disabled = false;
    askBtn.innerHTML = '<i class="fas fa-paper-plane"></i> اسأل ذكي';
}

// التعامل مع Enter في Ask AI
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

// التعامل مع Enter
function handleChatKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// التعامل مع رفع الصور
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
    
    // تحويل الصورة لـ base64
    const reader = new FileReader();
    reader.onload = async (e) => {
        const base64Image = e.target.result;
        
        // عرض الصورة في الشات
        addUserImageMessage(base64Image);
        
        // إظهار مؤشر الكتابة
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
    
    // إعادة تعيين الـ input
    event.target.value = '';
}

// إضافة صورة المستخدم للشات
function addUserImageMessage(imageSrc) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message user image-message';
    messageDiv.innerHTML = `
        <img src="${imageSrc}" alt="صورة المسألة" onclick="openImagePreview(this.src)">
        <span class="image-label">📷 صورة مسألة</span>
    `;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// تحليل الصورة بالـ AI
async function analyzeImageWithAI(imageData) {
    const base64Data = imageData.split(',')[1];
    const mimeType = imageData.split(';')[0].split(':')[1];
    
    try {
        const response = await fetch(API_CONFIG.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_CONFIG.apiKey}`
            },
            body: JSON.stringify({
                model: 'llama-3.2-11b-vision-preview',
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: `You are "ذكي" (Zaki), an AI assistant developed by EAAAI company.

Look at this image carefully. It contains a math problem, physics problem, or educational question.

Your task:
1. Extract and write the problem/question from the image
2. Solve it step by step
3. Write the final answer

${userName ? `Student name: ${userName}` : ''}

IMPORTANT: Answer in Arabic language. Explain in a simple and clear way. Use emojis moderately.
إجابتك يجب أن تكون بالعربية.`
                            },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: `data:${mimeType};base64,${base64Data}`
                                }
                            }
                        ]
                    }
                ],
                max_tokens: 2048,
                temperature: 0.3
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('API Error:', response.status, errorData);
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || 'عذراً، مش قادر أحلل الصورة. جرب تاني! 🔄';
    } catch (error) {
        console.error('Image analysis error:', error);
        throw error;
    }
}

// فتح الصورة بحجم كبير
function openImagePreview(src) {
    const overlay = document.createElement('div');
    overlay.className = 'image-preview-overlay';
    overlay.innerHTML = `
        <div class="image-preview-content">
            <img src="${src}" alt="معاينة">
            <button onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i> إغلاق
            </button>
        </div>
    `;
    overlay.onclick = (e) => {
        if (e.target === overlay) overlay.remove();
    };
    document.body.appendChild(overlay);
}

// ==========================================
// Quiz System - الامتحانات التفاعلية
// ==========================================

// بنك الأسئلة لكل مادة - أسئلة امتحانات السنوات السابقة
const questionsBank = {
    physics: [],
    physics2: [
        // ========== امتحان 2024 ==========
        {
            question: "In Young's double-slit experiment, constructive interference occurs when the path difference is...",
            options: ["mλ", "(m+1/2)λ", "1/2 mλ", "Zero"],
            correct: 0
        },
        {
            question: "In an interference pattern, the distance between two adjacent bright fringes is determined by...",
            options: ["The wavelength of light and the slit separation", "The screen's distance from the slits only", "The intensity of the light", "The angle of incidence"],
            correct: 0
        },
        {
            question: "Which concept did Einstein challenge with his Special Theory of Relativity?",
            options: ["Newtonian mechanics", "The laws of thermodynamics", "Quantum entanglement", "Electromagnetism"],
            correct: 0
        },
        {
            question: "In a rectifier circuit, what is the purpose of the smoothing capacitor?",
            options: ["To filter out the AC component and reduce ripple", "To amplify the signal", "To store data", "To generate light"],
            correct: 0
        },
        {
            question: "What is the primary function of a p-n junction diode in a rectifier circuit?",
            options: ["Convert AC voltage to DC voltage", "Amplify signals", "Generate light", "Store data"],
            correct: 0
        },
        {
            question: "What happens to a diode when it is reverse-biased?",
            options: ["No current flows (or extremely small leakage)", "Current flows freely", "Electrons are emitted", "Voltage decreases"],
            correct: 0
        },
        {
            question: "Which semiconductor material is commonly used to make diodes?",
            options: ["Silicon", "Aluminum", "Copper", "Gold"],
            correct: 0
        },
        {
            question: "In a half-wave rectifier circuit, how many diodes are used to convert AC to DC?",
            options: ["One", "Two", "Three", "Four"],
            correct: 0
        },
        {
            question: "What is the voltage drop across a germanium diode when it is forward-biased?",
            options: ["0.3 volts", "0 volts", "0.7 volts", "1 volt"],
            correct: 0
        },
        {
            question: "In reverse bias, the N region of a diode is connected to...",
            options: ["Positive voltage", "Negative voltage", "Ground", "No voltage"],
            correct: 0
        },
        {
            question: "Semiconductors are typically characterized by atoms with...",
            options: ["Four valence electrons", "Two valence electrons", "One valence electron", "Six valence electrons"],
            correct: 0
        },
        {
            question: "In time dilation, the moving clock observed from a stationary frame appears...",
            options: ["Slower", "Faster", "Unaffected", "Random"],
            correct: 0
        },
        {
            question: "Which of the following is NOT a source of a magnetic field?",
            options: ["Stationary Electric charge", "Permanent magnets", "Electric charge in motion", "Ferromagnetic materials"],
            correct: 0
        },
        {
            question: "The Biot-Savart law describes the magnetic field due to...",
            options: ["A current-carrying conductor", "A stationary charge", "A moving point charge", "A magnetic dipole"],
            correct: 0
        },
        {
            question: "In a magnetic field, the force on a charged particle is...",
            options: ["Perpendicular to both velocity and magnetic field", "Opposite to the magnetic field direction", "Zero if the particle is moving", "Along the direction of the magnetic field"],
            correct: 0
        },
        {
            question: "What happens to polarized light when it passes through a second polarizer oriented perpendicular to the first one?",
            options: ["The light is completely blocked", "The light becomes completely unpolarized", "The light becomes more colorful", "The light becomes brighter"],
            correct: 0
        },
        {
            question: "The magnetic force vector is _______ to the magnetic field.",
            options: ["Perpendicular", "Parallel", "Helical", "Intersect"],
            correct: 0
        },
        // ========== امتحان 2022-2023 ==========
        {
            question: "A semiconductor has generally ... valence electrons",
            options: ["4", "5", "2", "8"],
            correct: 0
        },
        {
            question: "When a pentavalent impurity is added to a pure semiconductor, it becomes...",
            options: ["n-type semiconductor", "an insulator", "an intrinsic semiconductor", "p-type semiconductor"],
            correct: 0
        },
        {
            question: "In double slit experiment we observe...",
            options: ["Both interference and diffraction fringes", "Diffraction fringes only", "Interference fringes only", "Polarized fringes"],
            correct: 0
        },
        {
            question: "A reverse biased pn junction has",
            options: ["almost no current", "very narrow depletion layer", "very low resistance", "large current flow"],
            correct: 0
        },
        {
            question: "Phenomenon proves that nature of light is transverse",
            options: ["Polarization", "Diffraction", "Scattering", "Interference"],
            correct: 0
        },
        {
            question: "In n-type materials, the minority carriers are",
            options: ["Holes", "Free electrons", "Protons", "Mesons"],
            correct: 0
        },
        {
            question: "The Electric force vector is _______ to the electric field.",
            options: ["Parallel", "Perpendicular", "Helical", "Intersect"],
            correct: 0
        },
        {
            question: "Appearance of color in thin films is due to...",
            options: ["Interference", "Diffraction", "Dispersion", "Polarization"],
            correct: 0
        },
        {
            question: "Light on passing through a Polaroid is.",
            options: ["plane polarized", "un-polarized", "circularly polarized", "elliptically polarized"],
            correct: 0
        },
        {
            question: "The condition for constructive interference of two coherent beams is that the path difference should be...",
            options: ["Integral multiple of λ", "Integral multiple of λ/2", "Odd integral multiple of λ/2", "None of above"],
            correct: 0
        },
        {
            question: "The blue colour of the sky is due to...",
            options: ["Scattering", "Diffraction", "Reflection", "Polarization"],
            correct: 0
        },
        {
            question: "Which one of the following cannot be polarized?",
            options: ["Ultrasonic waves", "Radio waves", "Ultraviolet rays", "X-rays"],
            correct: 0
        },
        // ========== امتحان 2021-2022 ==========
        {
            question: "In the depletion region of a pn junction, there is a shortage of",
            options: ["Holes and electrons", "Acceptor ions", "Donor ions", "None of the above"],
            correct: 0
        },
        {
            question: "If the initial velocity of the charged particle has a component parallel to the magnetic field B, the resulting trajectory will be...",
            options: ["A helical", "Parallel", "A perpendicular", "None of these"],
            correct: 0
        },
        {
            question: "In n-type materials, the majority carriers are",
            options: ["Free electrons", "Holes", "Protons", "Neutrons"],
            correct: 0
        },
        {
            question: "In Young's double slit experiment the fringe spacing is equal to...",
            options: ["Lλ/d", "λd/L", "d/Lλ", "L/λd"],
            correct: 0
        },
        // ========== امتحان 2018-2019 ==========
        {
            question: "Type-II of superconductors are usually...",
            options: ["Alloys", "Semiconductors", "Insulators", "Pure metals"],
            correct: 0
        },
        {
            question: "A distribution of electric charge at rest creates...",
            options: ["Electric field", "Magnetic field", "Both", "Neither"],
            correct: 0
        },
        {
            question: "Fringe width is inversely proportional to the...",
            options: ["Separation between the two slits", "Wavelength", "Distance to screen", "Intensity"],
            correct: 0
        },
        {
            question: "The width of depletion region of a diode",
            options: ["Increases under reverse bias", "Increases under forward bias", "Is independent of bias", "Decreases under reverse bias"],
            correct: 0
        },
        {
            question: "What is the voltage drop across a silicon diode when it is forward-biased?",
            options: ["0.7 volts", "0 volts", "0.3 volts", "1 volt"],
            correct: 0
        },
        {
            question: "In Full-wave rectification, if Vp = 48V, the average value Vavg is approximately...",
            options: ["30.6 V", "31.6 V", "42 V", "24 V"],
            correct: 0
        },
        {
            question: "In half wave rectification, if Vp = 80V, the average value is approximately...",
            options: ["25.5 V", "35.5 V", "50.9 V", "3.55 V"],
            correct: 0
        },
        {
            question: "The length contraction equation is L = L₀√(1 - v²/c²). This means moving objects appear...",
            options: ["Shorter in the direction of motion", "Longer in the direction of motion", "Unchanged", "Wider"],
            correct: 0
        },
        {
            question: "The magnetic force on a charged particle moving in a magnetic field is given by...",
            options: ["F = qv × B", "F = qE", "F = ma", "F = kq₁q₂/r²"],
            correct: 0
        },
        {
            question: "In a full-wave bridge rectifier, how many diodes are used?",
            options: ["Four", "One", "Two", "Three"],
            correct: 0
        },
        {
            question: "The time dilation equation Δt = Δt₀/√(1 - v²/c²) shows that time...",
            options: ["Runs slower for moving observers", "Runs faster for moving observers", "Is the same for all observers", "Stops completely"],
            correct: 0
        }
    ],
    math1: [],
    math0: [],
    it: [],
    electronics: []
};

// متغيرات الامتحان
let currentQuiz = {
    subject: 'physics',
    questions: [],
    currentIndex: 0,
    answers: [],
    timer: 0,
    timerInterval: null
};

// تهيئة الامتحان
function initQuiz(subject) {
    currentQuiz.subject = subject;
    
    // خلط الأسئلة واختيار 15 سؤال عشوائي
    const allQuestions = [...questionsBank[subject]];
    const shuffled = allQuestions.sort(() => Math.random() - 0.5);
    currentQuiz.questions = shuffled.slice(0, Math.min(15, shuffled.length));
    
    currentQuiz.currentIndex = 0;
    currentQuiz.answers = new Array(currentQuiz.questions.length).fill(null);
    
    // تحديث العنوان
    const subjectNames = {
        physics: 'فيزياء 1',
        physics2: 'فيزياء 2',
        math1: 'رياضة 1',
        math0: 'رياضة 0',
        it: 'IT',
        electronics: 'إلكترونيات'
    };
    
    document.getElementById('currentSubject').textContent = subjectNames[subject];
    document.getElementById('totalQ').textContent = currentQuiz.questions.length;
    
    // إخفاء النتيجة وإظهار الامتحان
    document.getElementById('quizResult').style.display = 'none';
    document.getElementById('quizContainer').style.display = 'block';
    
    // التحقق من وجود أسئلة
    if (currentQuiz.questions.length === 0) {
        document.getElementById('questionText').textContent = 'لا توجد أسئلة لهذه المادة حالياً';
        document.getElementById('quizOptions').innerHTML = '';
        document.getElementById('nextBtn').style.display = 'none';
        document.getElementById('submitQuiz').style.display = 'none';
        return;
    }
    
    // بدء المؤقت
    startTimer();
    
    // عرض السؤال الأول
    showQuestion(0);
}

// عرض سؤال
function showQuestion(index) {
    const question = currentQuiz.questions[index];
    document.getElementById('currentQ').textContent = index + 1;
    document.getElementById('questionText').textContent = question.question;
    
    const optionsContainer = document.getElementById('quizOptions');
    optionsContainer.innerHTML = '';
    
    const letters = ['أ', 'ب', 'ج', 'د'];
    
    question.options.forEach((option, i) => {
        const optionBtn = document.createElement('button');
        optionBtn.className = 'quiz-option';
        if (currentQuiz.answers[index] === i) {
            optionBtn.classList.add('selected');
        }
        optionBtn.innerHTML = `
            <span class="option-letter">${letters[i]}</span>
            <span>${option}</span>
        `;
        optionBtn.onclick = () => selectOption(i);
        optionsContainer.appendChild(optionBtn);
    });
    
    // تحديث الأزرار
    document.getElementById('prevBtn').disabled = index === 0;
    
    if (index === currentQuiz.questions.length - 1) {
        document.getElementById('nextBtn').style.display = 'none';
        document.getElementById('submitQuiz').style.display = 'inline-flex';
    } else {
        document.getElementById('nextBtn').style.display = 'inline-flex';
        document.getElementById('submitQuiz').style.display = 'none';
    }
}

// اختيار إجابة
function selectOption(optionIndex) {
    currentQuiz.answers[currentQuiz.currentIndex] = optionIndex;
    
    const options = document.querySelectorAll('.quiz-option');
    options.forEach((opt, i) => {
        opt.classList.remove('selected');
        if (i === optionIndex) {
            opt.classList.add('selected');
        }
    });
}

// السؤال التالي
function nextQuestion() {
    if (currentQuiz.currentIndex < currentQuiz.questions.length - 1) {
        currentQuiz.currentIndex++;
        showQuestion(currentQuiz.currentIndex);
    }
}

// السؤال السابق
function prevQuestion() {
    if (currentQuiz.currentIndex > 0) {
        currentQuiz.currentIndex--;
        showQuestion(currentQuiz.currentIndex);
    }
}

// المؤقت
function startTimer() {
    currentQuiz.timer = 0;
    if (currentQuiz.timerInterval) clearInterval(currentQuiz.timerInterval);
    
    currentQuiz.timerInterval = setInterval(() => {
        currentQuiz.timer++;
        const minutes = Math.floor(currentQuiz.timer / 60).toString().padStart(2, '0');
        const seconds = (currentQuiz.timer % 60).toString().padStart(2, '0');
        document.getElementById('timerDisplay').textContent = `${minutes}:${seconds}`;
    }, 1000);
}

// إنهاء الامتحان
function submitQuiz() {
    clearInterval(currentQuiz.timerInterval);
    
    let score = 0;
    currentQuiz.questions.forEach((q, i) => {
        if (currentQuiz.answers[i] === q.correct) {
            score++;
        }
    });
    
    const percentage = Math.round((score / currentQuiz.questions.length) * 100);
    
    // عرض النتيجة
    document.getElementById('quizContainer').style.display = 'none';
    document.getElementById('quizResult').style.display = 'block';
    
    document.getElementById('finalScore').textContent = score;
    document.getElementById('maxScore').textContent = currentQuiz.questions.length;
    document.getElementById('resultPercentage').textContent = percentage + '%';
    
    // رسالة النتيجة
    let message = '';
    const percentageEl = document.getElementById('resultPercentage');
    
    if (percentage >= 90) {
        message = 'ممتاز! أداء رائع 🌟';
        percentageEl.style.color = '#38ef7d';
    } else if (percentage >= 75) {
        message = 'جيد جداً! استمر 👏';
        percentageEl.style.color = '#00d9ff';
    } else if (percentage >= 60) {
        message = 'جيد، يمكنك التحسن 💪';
        percentageEl.style.color = '#ffc107';
    } else if (percentage >= 50) {
        message = 'مقبول، حاول مرة أخرى 📚';
        percentageEl.style.color = '#ff9800';
    } else {
        message = 'تحتاج للمزيد من المراجعة 📖';
        percentageEl.style.color = '#ff5252';
    }
    
    document.getElementById('resultMessage').textContent = message;
}

// متغير لحفظ اسم المستخدم في الامتحان
let quizUserName = '';
let selectedQuizSubject = 'physics2';

// تهيئة أزرار الامتحان
function initQuizButtons() {
    // أزرار اختيار المادة
    document.querySelectorAll('.quiz-subject-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.quiz-subject-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedQuizSubject = btn.dataset.quizSubject;
            
            // تحديث اسم المادة في شاشة البداية
            const subjectNames = {
                physics: 'فيزياء 1',
                physics2: 'فيزياء 2',
                math1: 'رياضة 1',
                math0: 'رياضة 0',
                it: 'IT',
                electronics: 'إلكترونيات'
            };
            const subjectNameEl = document.getElementById('selectedSubjectName');
            if (subjectNameEl) subjectNameEl.textContent = subjectNames[selectedQuizSubject];
            
            // إظهار شاشة البداية وإخفاء الامتحان
            const startScreen = document.getElementById('quizStartScreen');
            const container = document.getElementById('quizContainer');
            const result = document.getElementById('quizResult');
            if (startScreen) startScreen.style.display = 'block';
            if (container) container.style.display = 'none';
            if (result) result.style.display = 'none';
        });
    });
    
    // زر التالي (مع فحص وجوده)
    const nextBtn = document.getElementById('nextBtn');
    if (nextBtn) nextBtn.addEventListener('click', nextQuestion);
    
    // زر السابق (مع فحص وجوده)
    const prevBtn = document.getElementById('prevBtn');
    if (prevBtn) prevBtn.addEventListener('click', prevQuestion);
    
    // زر إنهاء الامتحان (مع فحص وجوده)
    const submitBtn = document.getElementById('submitQuiz');
    if (submitBtn) submitBtn.addEventListener('click', submitQuiz);
    
    // زر إعادة الامتحان (مع فحص وجوده)
    const retryBtn = document.getElementById('retryQuiz');
    if (retryBtn) {
        retryBtn.addEventListener('click', () => {
            const startScreen = document.getElementById('quizStartScreen');
            const container = document.getElementById('quizContainer');
            const result = document.getElementById('quizResult');
            if (startScreen) startScreen.style.display = 'block';
            if (result) result.style.display = 'none';
            if (container) container.style.display = 'none';
        });
    }
}

// بدء الامتحان مع الاسم
function startQuizWithName() {
    const nameInput = document.getElementById('quizUserName');
    quizUserName = nameInput.value.trim();
    
    if (!quizUserName) {
        alert('من فضلك أدخل اسمك للبدء!');
        nameInput.focus();
        return;
    }
    
    // إخفاء شاشة البداية وبدء الامتحان
    document.getElementById('quizStartScreen').style.display = 'none';
    initQuiz(selectedQuizSubject);
}

// ==========================================
// Bicycle Competitions Management
// ==========================================

// Store participants data
let participantsData = {
    1: [
        { name: 'أحمد محمد', score: 48 },
        { name: 'محمود علي', score: 45 },
        { name: 'خالد حسن', score: 42 },
        { name: 'عمر سعيد', score: 38 },
        { name: 'يوسف أحمد', score: 35 }
    ],
    2: [
        { name: 'سامي عبدالله', score: 78 },
        { name: 'فادي كريم', score: 75 },
        { name: 'ماجد حسين', score: 70 },
        { name: 'طارق نور', score: 65 },
        { name: 'هاني صالح', score: 60 }
    ],
    3: [
        { name: 'كريم الشامي', score: 98 },
        { name: 'باسم الخطيب', score: 95 },
        { name: 'وليد جمال', score: 92 },
        { name: 'رامي فؤاد', score: 88 },
        { name: 'نادر حكيم', score: 85 }
    ]
};

// Load from localStorage if available
function loadParticipants() {
    const saved = localStorage.getItem('bicycleParticipants');
    if (saved) {
        participantsData = JSON.parse(saved);
        updateAllLists();
    }
}

// Save to localStorage
function saveParticipants() {
    localStorage.setItem('bicycleParticipants', JSON.stringify(participantsData));
}

// Add participant to a level
function addParticipant(level) {
    const nameInput = document.getElementById(`name${level}`);
    const scoreInput = document.getElementById(`time${level}`);
    
    const name = nameInput.value.trim();
    const score = parseInt(scoreInput.value.trim());
    
    if (!name) {
        alert('الرجاء إدخال اسم المتسابق');
        return;
    }
    
    if (isNaN(score) || score < 0 || score > 100) {
        alert('الرجاء إدخال درجة صحيحة (من 0 إلى 100)');
        return;
    }

    // Add to data
    participantsData[level].push({ name, score });
    
    // Sort by score (highest first)
    participantsData[level].sort((a, b) => b.score - a.score);

    // Update UI
    updateParticipantsList(level);
    
    // Save to localStorage
    saveParticipants();
    
    // Clear inputs
    nameInput.value = '';
    scoreInput.value = '';
    
    // Show success message
    showNotification(`تم إضافة ${name} بنجاح!`);
}

// Update participants list in UI
function updateParticipantsList(level) {
    const list = document.getElementById(`level${level}Participants`);
    list.innerHTML = '';
    
    participantsData[level].forEach((participant, index) => {
        const li = document.createElement('li');
        
        let rankClass = '';
        if (index === 0) rankClass = 'gold';
        else if (index === 1) rankClass = 'silver';
        else if (index === 2) rankClass = 'bronze';
        
        li.innerHTML = `
            <span class="rank ${rankClass}">${index + 1}</span>
            ${participant.name}
            <span class="score">${participant.score}</span>
            <button class="delete-btn" onclick="deleteParticipant(${level}, ${index})" title="حذف">
                <i class="fas fa-times"></i>
            </button>
        `;
        list.appendChild(li);
    });
}

// Update all lists
function updateAllLists() {
    updateParticipantsList(1);
    updateParticipantsList(2);
    updateParticipantsList(3);
}

// Delete participant
function deleteParticipant(level, index) {
    const participant = participantsData[level][index];
    if (confirm(`هل تريد حذف ${participant.name}؟`)) {
        participantsData[level].splice(index, 1);
        updateParticipantsList(level);
        saveParticipants();
        showNotification('تم الحذف بنجاح');
    }
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(90deg, #11998e, #38ef7d);
        color: white;
        padding: 15px 30px;
        border-radius: 50px;
        font-weight: 600;
        z-index: 10000;
        animation: slideUp 0.5s ease;
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideDown 0.5s ease';
        setTimeout(() => notification.remove(), 500);
    }, 2000);
}

// Add CSS for delete button
const style = document.createElement('style');
style.textContent = `
    .delete-btn {
        background: rgba(255, 82, 82, 0.2);
        border: none;
        color: #ff5252;
        width: 25px;
        height: 25px;
        border-radius: 50%;
        cursor: pointer;
        margin-right: 10px;
        transition: all 0.3s;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .delete-btn:hover {
        background: #ff5252;
        color: white;
    }
    
    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(50px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }
    
    @keyframes slideDown {
        from {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        to {
            opacity: 0;
            transform: translateX(-50%) translateY(50px);
        }
    }
`;
document.head.appendChild(style);

// ==========================================
// Smooth Scrolling
// ==========================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ==========================================
// Navigation Active State
// ==========================================
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');
    
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (scrollY >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// ==========================================
// Initialize
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    loadParticipants();
    initBankTabs();
    initEssayTabs();
    initQuizButtons();
    initQuiz('physics2'); // بدء بامتحان فيزياء 2
});

// ==========================================
// Questions Bank - بنك الأسئلة
// ==========================================

// ==========================================
// الأسئلة المقالية - Essay Questions (عربي + English)
// ==========================================
const essayQuestionsData = {
    physics: [],
    physics2: [
        {
            title: "السؤال الأول: التعريفات | Q1: Definitions",
            marks: 6,
            description: "أول سؤال في الامتحان، سيُطلب منك تعريف واحد أو أكثر من القائمة التالية | The first question in the exam, you will be asked to define one or more of the following:",
            questions: [
                {
                    term: "مبدأ هيجنز | Huygens' Principle",
                    answer: `🔵 بالعربي:
كل النقاط الموجودة على صدر الموجة (Wave front) يمكن اعتبارها مصدراً لموجات ثانوية كروية تنتشر في جميع الاتجاهات بنفس سرعة الانتشار، والمماس لهذه الموجات ينشئ غلافاً يمثل الموجة الجديدة.

🔵 In English:
Every point on a wavefront can be considered as a source of secondary spherical wavelets that spread out in all directions with the same speed. The tangent to these wavelets forms an envelope representing the new wavefront.`
                },
                {
                    term: "الحيود | Diffraction",
                    answer: `🔵 بالعربي:
هو انتشار الموجات وانحناؤها عند مرورها عبر فتحة أو عائق أبعاده مقاربة للطول الموجي للموجة.

🔵 In English:
Diffraction is the spreading and bending of waves when they pass through an aperture or around an obstacle whose dimensions are comparable to the wavelength.`
                },
                {
                    term: "الاستقطاب | Polarization",
                    answer: `🔵 بالعربي:
هو خاصية لجميع الأمواج المستعرضة، ويعبر عن اتجاه خطوط المجال الكهربي (Electric Field) للموجة.

🔵 In English:
Polarization is a property of all transverse waves, describing the orientation of the electric field oscillations of the wave.`
                },
                {
                    term: "الجهد الحاجز | Barrier Potential",
                    answer: `🔵 بالعربي:
هو الجهد المتكون على جانبي الوصلة الثنائية (PN Junction) والذي يمنع انتقال المزيد من الإلكترونات والفجوات عبر الوصلة (قيمته 0.7V للسيليكون).

🔵 In English:
The barrier potential is the voltage formed across a PN junction that prevents further movement of electrons and holes across the junction (0.7V for Silicon).`
                },
                {
                    term: "فجوة الطاقة | Band Gap",
                    answer: `🔵 بالعربي:
هي فرق الطاقة بين حزمة التكافؤ (Valence band) وحزمة التوصيل (Conduction band).

🔵 In English:
The band gap is the energy difference between the valence band and the conduction band.`
                }
            ]
        },
        {
            title: "السؤال الثاني: حيود الشق المفرد | Q2: Single Slit Diffraction",
            marks: 6,
            description: "استنتاج رياضي - شرط الهدب المظلم | Mathematical derivation - Dark fringe condition",
            questions: [
                {
                    term: "الهدب المظلم الأول | First Dark Fringe",
                    answer: `🔵 بالعربي:
1. نقسم الشق (عرضه a) إلى منطقتين متساويتين (a/2).
2. لكي يحدث تداخل هدام بين شعاع من قمة المنطقة الأولى وشعاع من قمة المنطقة الثانية، يجب أن يكون فرق المسار λ/2.
3. من الرسم الهندسي: (a/2)sinθ = λ/2
4. القانون: a·sinθ = λ

🔵 In English:
1. Divide the slit (width a) into two equal zones (a/2).
2. For destructive interference between rays from the top of each zone, path difference must be λ/2.
3. From geometry: (a/2)sinθ = λ/2
4. Formula: a·sinθ = λ`
                },
                {
                    term: "الهدب المظلم الثاني | Second Dark Fringe",
                    answer: `🔵 بالعربي:
1. نقسم الشق إلى أربع مناطق متساوية (a/4).
2. يحدث الإلغاء بين كل منطقتين متجاورتين.
3. من الرسم الهندسي: (a/4)sinθ = λ/2
4. القانون: a·sinθ = 2λ

🔵 In English:
1. Divide the slit into four equal zones (a/4).
2. Cancellation occurs between adjacent zones.
3. From geometry: (a/4)sinθ = λ/2
4. Formula: a·sinθ = 2λ`
                }
            ]
        },
        {
            title: "السؤال الثالث: الاستقطاب | Q3: Polarization",
            marks: 6,
            description: "شرح نظري مع القوانين | Theoretical explanation with formulas",
            questions: [
                {
                    term: "الاستقطاب بالامتصاص | Polarization by Absorption",
                    answer: `🔵 بالعربي:
الشرح: نستخدم مادة (مثل التورمالين أو البولارويد) تمتص الاهتزازات الموازية لمحور البلورة وتسمح بنفاذ الاهتزازات العمودية عليها.
نستخدم شريحتين: الأولى (Polarizer) والثانية (Analyzer).
قانون مالوس: I = Imax × cos²θ

🔵 In English:
Explanation: A material (like tourmaline or Polaroid) absorbs vibrations parallel to its axis and transmits perpendicular vibrations.
Two sheets are used: Polarizer and Analyzer.
Malus's Law: I = Imax × cos²θ`
                },
                {
                    term: "الاستقطاب بالانعكاس | Polarization by Reflection",
                    answer: `🔵 بالعربي:
عندما يسقط ضوء غير مستقطب على سطح، عند زاوية بروستر (θp)، يكون الشعاع المنعكس مستقطباً كلياً.
الزاوية بين الشعاع المنعكس والمنكسر تكون 90°.
قانون بروستر: tan(θp) = n₂/n₁

🔵 In English:
When unpolarized light hits a surface at Brewster's angle (θp), the reflected ray is completely polarized.
The angle between reflected and refracted rays is 90°.
Brewster's Law: tan(θp) = n₂/n₁`
                }
            ]
        },
        {
            title: "السؤال الرابع: المجال المغناطيسي | Q4: Magnetic Fields",
            marks: 6,
            description: "استنتاج رياضي باستخدام قانون بيو-سافارت | Derivation using Biot-Savart Law",
            questions: [
                {
                    term: "سلك مستقيم طويل | Long Straight Wire",
                    answer: `🔵 بالعربي:
نطبق قانون بيو-سافارت، ونكامل بالنسبة للزاوية θ من −π/2 إلى +π/2.
النتيجة: B = μ₀I / (2πR)

🔵 In English:
Apply Biot-Savart Law and integrate with respect to angle θ from −π/2 to +π/2.
Result: B = μ₀I / (2πR)`
                },
                {
                    term: "سلك مقوس | Curved Wire Segment",
                    answer: `🔵 بالعربي:
المجال عند المركز. الأجزاء المستقيمة لا تولد مجالاً.
النتيجة: B = (μ₀I / 4πa) × θ (θ بالراديان)

🔵 In English:
Field at center. Straight parts produce no field.
Result: B = (μ₀I / 4πa) × θ (θ in radians)`
                },
                {
                    term: "على محور حلقة دائرية | Axis of Circular Loop",
                    answer: `🔵 بالعربي:
نحلل المجال ونأخذ المركبة الأفقية dBₓ.
النتيجة: Bₓ = μ₀Ia² / [2(a² + x²)^(3/2)]

🔵 In English:
Resolve the field and take horizontal component dBₓ.
Result: Bₓ = μ₀Ia² / [2(a² + x²)^(3/2)]`
                }
            ]
        },
        {
            title: "السؤال الخامس: الدايود والنسبية | Q5: Diodes & Relativity",
            marks: 6,
            description: "نماذج الدايود أو النسبية الخاصة | Diode models or Special Relativity",
            questions: [
                {
                    term: "النموذج المثالي | Ideal Model",
                    answer: `🔵 بالعربي:
• انحياز أمامي: مفتاح مغلق (VF = 0)
• انحياز عكسي: مفتاح مفتوح (I = 0)

🔵 In English:
• Forward bias: Closed switch (VF = 0)
• Reverse bias: Open switch (I = 0)`
                },
                {
                    term: "النموذج العملي | Practical Model",
                    answer: `🔵 بالعربي:
• انحياز أمامي: مفتاح مغلق + بطارية 0.7V
• القانون: IF = (Vbias − 0.7) / R

🔵 In English:
• Forward bias: Closed switch + 0.7V battery
• Formula: IF = (Vbias − 0.7) / R`
                },
                {
                    term: "النموذج الكامل | Complete Model",
                    answer: `🔵 بالعربي:
• يضيف مقاومة ديناميكية صغيرة (r'd) في الأمامي
• القانون: IF = (Vbias − 0.7) / (R + r'd)

🔵 In English:
• Adds small dynamic resistance (r'd) in forward
• Formula: IF = (Vbias − 0.7) / (R + r'd)`
                },
                {
                    term: "تمدد الزمن | Time Dilation",
                    answer: `🔵 بالعربي:
استنتاج العلاقة من رسم مثلث مسار الضوء وتطبيق فيثاغورث:
Δt = Δt₀ / √(1 − v²/c²)

🔵 In English:
Derive from light path triangle using Pythagorean theorem:
Δt = Δt₀ / √(1 − v²/c²)`
                },
                {
                    term: "انكماش الطول | Length Contraction",
                    answer: `🔵 بالعربي:
استنتاج العلاقة باستخدام معادلات الزمن والسرعة:
L = L₀ × √(1 − v²/c²)

🔵 In English:
Derive using time and velocity equations:
L = L₀ × √(1 − v²/c²)`
                }
            ]
        }
    ],
    math1: [],
    math0: [],
    it: [],
    'computing-history': [],
    'computer-laws': [],
    electronics: []
};

// بنك الأسئلة لكل مادة (للعرض مع الإجابات) - أسئلة امتحانات السنوات السابقة
const questionsBankData = {
    physics: [],
    physics2: [
        // ========== امتحان 2024 ==========
        {
            question: "In Young's double-slit experiment, constructive interference occurs when the path difference is...",
            options: ["mλ", "(m+1/2)λ", "1/2 mλ", "Zero"],
            correct: 0
        },
        {
            question: "In an interference pattern, the distance between two adjacent bright fringes is determined by...",
            options: ["The wavelength of light and the slit separation", "The screen's distance from the slits only", "The intensity of the light", "The angle of incidence"],
            correct: 0
        },
        {
            question: "Which concept did Einstein challenge with his Special Theory of Relativity?",
            options: ["Newtonian mechanics", "The laws of thermodynamics", "Quantum entanglement", "Electromagnetism"],
            correct: 0
        },
        {
            question: "In a rectifier circuit, what is the purpose of the smoothing capacitor?",
            options: ["To filter out the AC component and reduce ripple", "To amplify the signal", "To store data", "To generate light"],
            correct: 0
        },
        {
            question: "What is the primary function of a p-n junction diode in a rectifier circuit?",
            options: ["Convert AC voltage to DC voltage", "Amplify signals", "Generate light", "Store data"],
            correct: 0
        },
        {
            question: "What happens to a diode when it is reverse-biased?",
            options: ["No current flows (or extremely small leakage)", "Current flows freely", "Electrons are emitted", "Voltage decreases"],
            correct: 0
        },
        {
            question: "Which semiconductor material is commonly used to make diodes?",
            options: ["Silicon", "Aluminum", "Copper", "Gold"],
            correct: 0
        },
        {
            question: "In a half-wave rectifier circuit, how many diodes are used to convert AC to DC?",
            options: ["One", "Two", "Three", "Four"],
            correct: 0
        },
        {
            question: "What is the voltage drop across a germanium diode when it is forward-biased?",
            options: ["0.3 volts", "0 volts", "0.7 volts", "1 volt"],
            correct: 0
        },
        {
            question: "In reverse bias, the N region of a diode is connected to...",
            options: ["Positive voltage", "Negative voltage", "Ground", "No voltage"],
            correct: 0
        },
        {
            question: "Semiconductors are typically characterized by atoms with...",
            options: ["Four valence electrons", "Two valence electrons", "One valence electron", "Six valence electrons"],
            correct: 0
        },
        {
            question: "In time dilation, the moving clock observed from a stationary frame appears...",
            options: ["Slower", "Faster", "Unaffected", "Random"],
            correct: 0
        },
        {
            question: "Which of the following is NOT a source of a magnetic field?",
            options: ["Stationary Electric charge", "Permanent magnets", "Electric charge in motion", "Ferromagnetic materials"],
            correct: 0
        },
        {
            question: "The Biot-Savart law describes the magnetic field due to...",
            options: ["A current-carrying conductor", "A stationary charge", "A moving point charge", "A magnetic dipole"],
            correct: 0
        },
        {
            question: "In a magnetic field, the force on a charged particle is...",
            options: ["Perpendicular to both velocity and magnetic field", "Opposite to the magnetic field direction", "Zero if the particle is moving", "Along the direction of the magnetic field"],
            correct: 0
        },
        {
            question: "What happens to polarized light when it passes through a second polarizer oriented perpendicular to the first one?",
            options: ["The light is completely blocked", "The light becomes completely unpolarized", "The light becomes more colorful", "The light becomes brighter"],
            correct: 0
        },
        {
            question: "The magnetic force vector is _______ to the magnetic field.",
            options: ["Perpendicular", "Parallel", "Helical", "Intersect"],
            correct: 0
        },
        // ========== امتحان 2022-2023 ==========
        {
            question: "A semiconductor has generally ... valence electrons",
            options: ["4", "5", "2", "8"],
            correct: 0
        },
        {
            question: "When a pentavalent impurity is added to a pure semiconductor, it becomes...",
            options: ["n-type semiconductor", "an insulator", "an intrinsic semiconductor", "p-type semiconductor"],
            correct: 0
        },
        {
            question: "In double slit experiment we observe...",
            options: ["Both interference and diffraction fringes", "Diffraction fringes only", "Interference fringes only", "Polarized fringes"],
            correct: 0
        },
        {
            question: "A reverse biased pn junction has",
            options: ["almost no current", "very narrow depletion layer", "very low resistance", "large current flow"],
            correct: 0
        },
        {
            question: "Phenomenon proves that nature of light is transverse",
            options: ["Polarization", "Diffraction", "Scattering", "Interference"],
            correct: 0
        },
        {
            question: "In n-type materials, the minority carriers are",
            options: ["Holes", "Free electrons", "Protons", "Mesons"],
            correct: 0
        },
        {
            question: "The Electric force vector is _______ to the electric field.",
            options: ["Parallel", "Perpendicular", "Helical", "Intersect"],
            correct: 0
        },
        {
            question: "Appearance of color in thin films is due to...",
            options: ["Interference", "Diffraction", "Dispersion", "Polarization"],
            correct: 0
        },
        {
            question: "Light on passing through a Polaroid is.",
            options: ["plane polarized", "un-polarized", "circularly polarized", "elliptically polarized"],
            correct: 0
        },
        {
            question: "The condition for constructive interference of two coherent beams is that the path difference should be...",
            options: ["Integral multiple of λ", "Integral multiple of λ/2", "Odd integral multiple of λ/2", "None of above"],
            correct: 0
        },
        {
            question: "The blue colour of the sky is due to...",
            options: ["Scattering", "Diffraction", "Reflection", "Polarization"],
            correct: 0
        },
        {
            question: "Which one of the following cannot be polarized?",
            options: ["Ultrasonic waves", "Radio waves", "Ultraviolet rays", "X-rays"],
            correct: 0
        },
        // ========== امتحان 2021-2022 ==========
        {
            question: "In the depletion region of a pn junction, there is a shortage of",
            options: ["Holes and electrons", "Acceptor ions", "Donor ions", "None of the above"],
            correct: 0
        },
        {
            question: "If the initial velocity of the charged particle has a component parallel to the magnetic field B, the resulting trajectory will be...",
            options: ["A helical", "Parallel", "A perpendicular", "None of these"],
            correct: 0
        },
        {
            question: "In n-type materials, the majority carriers are",
            options: ["Free electrons", "Holes", "Protons", "Neutrons"],
            correct: 0
        },
        {
            question: "In Young's double slit experiment the fringe spacing is equal to...",
            options: ["Lλ/d", "λd/L", "d/Lλ", "L/λd"],
            correct: 0
        },
        // ========== امتحان 2018-2019 ==========
        {
            question: "Type-II of superconductors are usually...",
            options: ["Alloys", "Semiconductors", "Insulators", "Pure metals"],
            correct: 0
        },
        {
            question: "A distribution of electric charge at rest creates...",
            options: ["Electric field", "Magnetic field", "Both", "Neither"],
            correct: 0
        },
        {
            question: "Fringe width is inversely proportional to the...",
            options: ["Separation between the two slits", "Wavelength", "Distance to screen", "Intensity"],
            correct: 0
        },
        {
            question: "The width of depletion region of a diode",
            options: ["Increases under reverse bias", "Increases under forward bias", "Is independent of bias", "Decreases under reverse bias"],
            correct: 0
        },
        {
            question: "What is the voltage drop across a silicon diode when it is forward-biased?",
            options: ["0.7 volts", "0 volts", "0.3 volts", "1 volt"],
            correct: 0
        },
        {
            question: "In Full-wave rectification, if Vp = 48V, the average value Vavg is approximately...",
            options: ["30.6 V", "31.6 V", "42 V", "24 V"],
            correct: 0
        },
        {
            question: "In half wave rectification, if Vp = 80V, the average value is approximately...",
            options: ["25.5 V", "35.5 V", "50.9 V", "3.55 V"],
            correct: 0
        },
        {
            question: "The length contraction equation is L = L₀√(1 - v²/c²). This means moving objects appear...",
            options: ["Shorter in the direction of motion", "Longer in the direction of motion", "Unchanged", "Wider"],
            correct: 0
        },
        {
            question: "The magnetic force on a charged particle moving in a magnetic field is given by...",
            options: ["F = qv × B", "F = qE", "F = ma", "F = kq₁q₂/r²"],
            correct: 0
        },
        {
            question: "In a full-wave bridge rectifier, how many diodes are used?",
            options: ["Four", "One", "Two", "Three"],
            correct: 0
        },
        {
            question: "The time dilation equation Δt = Δt₀/√(1 - v²/c²) shows that time...",
            options: ["Runs slower for moving observers", "Runs faster for moving observers", "Is the same for all observers", "Stops completely"],
            correct: 0
        }
    ],
    math1: [],
    math0: [],
    it: [],
    'computing-history': [],
    'computer-laws': [],
    electronics: []
};

// عرض أسئلة بنك الأسئلة
function displayBankQuestions(subject) {
    const container = document.getElementById('questionsBankContainer');
    const questions = questionsBankData[subject] || [];
    
    if (questions.length === 0) {
        container.innerHTML = `
            <div class="no-questions">
                <i class="fas fa-inbox"></i>
                <h3>لا توجد أسئلة حالياً</h3>
                <p>سيتم إضافة الأسئلة قريباً</p>
            </div>
        `;
        return;
    }
    
    const letters = ['أ', 'ب', 'ج', 'د'];
    
    container.innerHTML = questions.map((q, index) => `
        <div class="bank-question-card">
            <div class="bank-question-header">
                <span class="question-number">${index + 1}</span>
                <button class="show-answer-btn" onclick="toggleAnswer(this, ${q.correct})">
                    <i class="fas fa-eye"></i> إظهار الإجابة
                </button>
            </div>
            <div class="bank-question-text">${q.question}</div>
            <div class="bank-options">
                ${q.options.map((opt, i) => `
                    <div class="bank-option" data-index="${i}">
                        <span class="option-letter">${letters[i]}</span>
                        <span>${opt}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

// إظهار/إخفاء الإجابة
function toggleAnswer(btn, correctIndex) {
    const card = btn.closest('.bank-question-card');
    const options = card.querySelectorAll('.bank-option');
    const isShowing = btn.classList.contains('showing');
    
    if (isShowing) {
        options.forEach(opt => opt.classList.remove('correct'));
        btn.innerHTML = '<i class="fas fa-eye"></i> إظهار الإجابة';
        btn.classList.remove('showing');
    } else {
        options[correctIndex].classList.add('correct');
        btn.innerHTML = '<i class="fas fa-eye-slash"></i> إخفاء الإجابة';
        btn.classList.add('showing');
    }
}

// تهيئة tabs بنك الأسئلة
function initBankTabs() {
    const tabs = document.querySelectorAll('[data-bank-subject]');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            displayBankQuestions(tab.dataset.bankSubject);
        });
    });
    
    // عرض فيزياء 2 افتراضياً
    displayBankQuestions('physics2');
}

// عرض الأسئلة المقالية
function displayEssayQuestions(subject) {
    const container = document.getElementById('essayQuestionsContainer');
    if (!container) return;
    const essays = essayQuestionsData[subject] || [];
    
    if (essays.length === 0) {
        container.innerHTML = `
            <div class="no-questions">
                <i class="fas fa-inbox"></i>
                <h3>لا توجد أسئلة مقالية حالياً</h3>
                <p>سيتم إضافة الأسئلة قريباً</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = essays.map((essay, essayIndex) => `
        <div class="essay-section-card">
            <div class="essay-header">
                <h3>${essay.title}</h3>
                <span class="essay-marks"><i class="fas fa-star"></i> ${essay.marks} درجات</span>
            </div>
            <p class="essay-description">${essay.description}</p>
            <div class="essay-questions">
                ${essay.questions.map((q, qIndex) => `
                    <div class="essay-question-card">
                        <div class="essay-term">
                            <i class="fas fa-bookmark"></i>
                            <span>${q.term}</span>
                            <button class="show-essay-answer-btn" onclick="toggleEssayAnswer(this)">
                                <i class="fas fa-eye"></i> إظهار الإجابة
                            </button>
                        </div>
                        <div class="essay-answer" style="display: none;">
                            <div class="answer-content">${q.answer.replace(/\n/g, '<br>')}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

// إظهار/إخفاء إجابة السؤال المقالي
function toggleEssayAnswer(btn) {
    const card = btn.closest('.essay-question-card');
    const answer = card.querySelector('.essay-answer');
    const isShowing = btn.classList.contains('showing');
    
    if (isShowing) {
        answer.style.display = 'none';
        btn.innerHTML = '<i class="fas fa-eye"></i> إظهار الإجابة';
        btn.classList.remove('showing');
    } else {
        answer.style.display = 'block';
        btn.innerHTML = '<i class="fas fa-eye-slash"></i> إخفاء الإجابة';
        btn.classList.add('showing');
    }
}

// تهيئة tabs الأسئلة المقالية
function initEssayTabs() {
    const tabs = document.querySelectorAll('[data-essay-subject]');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            displayEssayQuestions(tab.dataset.essaySubject);
        });
    });
    
    // عرض فيزياء 2 افتراضياً
    displayEssayQuestions('physics2');
}

// ==========================================
// Challenge Mode - وضع التحدي
// ==========================================

let challengeQuestions = [];
let currentChallengeIndex = 0;
let challengeAnswers = {};
let challengeTimerInterval = null;
let challengeTimeRemaining = 300; // 5 دقائق بالثواني
let challengeStartTime = null;
let challengerName = '';

// قائمة الكلمات الممنوعة (الشتائم والألفاظ غير اللائقة)
const bannedWords = [
    // شتائم عربية
    'كس', 'طيز', 'زب', 'شرموط', 'عرص', 'متناك', 'منيك', 'لبوه', 'قحب', 'عاهر',
    'خول', 'ابن الكلب', 'ابن الحرام', 'ابن العرص', 'ابن الشرموطه', 'كسم',
    'احا', 'ينعل', 'يلعن', 'زانيه', 'زاني', 'فاجر', 'فاجره', 'وسخ', 'وسخه',
    'حمار', 'غبي', 'احمق', 'معفن', 'قذر', 'نجس', 'حقير', 'تافه', 'واطي',
    'كلب', 'خنزير', 'حيوان', 'بهيم', 'ديوث', 'قواد',
    // شتائم إنجليزية
    'fuck', 'shit', 'bitch', 'ass', 'dick', 'pussy', 'bastard', 'whore',
    'slut', 'cunt', 'cock', 'damn', 'hell', 'nigger', 'fag', 'gay',
    'stupid', 'idiot', 'dumb', 'retard', 'loser', 'sucker', 'motherfucker',
    // أسماء غير لائقة
    'ابليس', 'شيطان', 'satan', 'devil', 'demon'
];

// فلترة الاسم من الشتائم
function filterName(name) {
    if (!name) return '';
    
    let filteredName = name.trim();
    const lowerName = filteredName.toLowerCase();
    
    // التحقق من الكلمات الممنوعة
    for (const word of bannedWords) {
        const regex = new RegExp(word, 'gi');
        if (regex.test(lowerName) || regex.test(filteredName)) {
            return null; // الاسم يحتوي على كلمة ممنوعة
        }
    }
    
    // التحقق من الأسماء القصيرة جداً أو الطويلة جداً
    if (filteredName.length < 2 || filteredName.length > 30) {
        return null;
    }
    
    // التحقق من الرموز الغريبة والأرقام فقط
    const onlyNumbers = /^[0-9]+$/;
    const onlySymbols = /^[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/;
    if (onlyNumbers.test(filteredName) || onlySymbols.test(filteredName)) {
        return null;
    }
    
    return filteredName;
}

// بدء التحدي
function startChallenge() {
    const nameInput = document.getElementById('challengerName');
    const rawName = nameInput.value.trim();
    
    if (!rawName) {
        alert('من فضلك أدخل اسمك للبدء!');
        nameInput.focus();
        return;
    }
    
    // فلترة الاسم
    challengerName = filterName(rawName);
    
    if (!challengerName) {
        alert('⚠️ الاسم غير مقبول!\n\nيرجى استخدام اسم لائق بدون ألفاظ غير مناسبة.');
        nameInput.value = '';
        nameInput.focus();
        return;
    }
    
    // تهيئة التحدي
    challengeQuestions = getRandomQuestions(15);
    currentChallengeIndex = 0;
    challengeAnswers = {};
    challengeTimeRemaining = 300;
    challengeStartTime = Date.now();
    
    // إخفاء المقدمة وإظهار التحدي
    document.getElementById('challengeIntro').style.display = 'none';
    document.getElementById('challengeContainer').style.display = 'block';
    document.getElementById('challengeResult').style.display = 'none';
    
    // بدء المؤقت
    startChallengeTimer();
    
    // عرض أول سؤال
    showChallengeQuestion();
    updateChallengeNav();
}

// الحصول على أسئلة عشوائية
function getRandomQuestions(count) {
    const allQuestions = [...questionsBank.physics2];
    const shuffled = allQuestions.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
}

// بدء المؤقت
function startChallengeTimer() {
    const timerDisplay = document.getElementById('timerDisplay');
    const timerDiv = document.getElementById('challengeTimer');
    
    challengeTimerInterval = setInterval(() => {
        challengeTimeRemaining--;
        
        const minutes = Math.floor(challengeTimeRemaining / 60);
        const seconds = challengeTimeRemaining % 60;
        timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        // تحذير عند بقاء دقيقة واحدة
        if (challengeTimeRemaining <= 60) {
            timerDiv.classList.add('warning');
        }
        
        // انتهاء الوقت
        if (challengeTimeRemaining <= 0) {
            clearInterval(challengeTimerInterval);
            submitChallenge();
        }
    }, 1000);
}

// عرض سؤال التحدي الحالي
function showChallengeQuestion() {
    const question = challengeQuestions[currentChallengeIndex];
    const questionDiv = document.getElementById('challengeQuestion');
    const optionsDiv = document.getElementById('challengeOptions');
    const progressSpan = document.getElementById('challengeProgress');
    
    // تحديث التقدم
    progressSpan.textContent = `${currentChallengeIndex + 1}/15`;
    
    // عرض السؤال
    questionDiv.innerHTML = `<span class="question-number">س${currentChallengeIndex + 1}:</span> ${question.question}`;
    
    // عرض الخيارات
    const letters = ['أ', 'ب', 'ج', 'د'];
    optionsDiv.innerHTML = question.options.map((option, i) => `
        <div class="challenge-option ${challengeAnswers[currentChallengeIndex] === i ? 'selected' : ''}" 
             onclick="selectChallengeOption(${i})">
            <span class="option-letter">${letters[i]}</span>
            <span class="option-text">${option}</span>
        </div>
    `).join('');
    
    updateChallengeNav();
}

// اختيار إجابة
function selectChallengeOption(optionIndex) {
    challengeAnswers[currentChallengeIndex] = optionIndex;
    
    // تحديث النتيجة المباشرة
    updateChallengeScore();
    
    // إعادة عرض الخيارات
    showChallengeQuestion();
    
    // الانتقال التلقائي للسؤال التالي بعد 500ms
    if (currentChallengeIndex < challengeQuestions.length - 1) {
        setTimeout(() => {
            nextChallengeQuestion();
        }, 500);
    }
}

// تحديث النتيجة
function updateChallengeScore() {
    let score = 0;
    Object.keys(challengeAnswers).forEach(index => {
        if (challengeQuestions[index].correct === challengeAnswers[index]) {
            score++;
        }
    });
    document.getElementById('challengeScore').textContent = score;
}

// السؤال التالي
function nextChallengeQuestion() {
    if (currentChallengeIndex < challengeQuestions.length - 1) {
        currentChallengeIndex++;
        showChallengeQuestion();
    }
}

// السؤال السابق
function prevChallengeQuestion() {
    if (currentChallengeIndex > 0) {
        currentChallengeIndex--;
        showChallengeQuestion();
    }
}

// تحديث أزرار التنقل
function updateChallengeNav() {
    const prevBtn = document.getElementById('prevChallengeBtn');
    const nextBtn = document.getElementById('nextChallengeBtn');
    const submitBtn = document.getElementById('submitChallengeBtn');
    
    prevBtn.disabled = currentChallengeIndex === 0;
    
    if (currentChallengeIndex === challengeQuestions.length - 1) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'inline-flex';
    } else {
        nextBtn.style.display = 'inline-flex';
        submitBtn.style.display = 'none';
    }
}

// إنهاء التحدي
function submitChallenge() {
    clearInterval(challengeTimerInterval);
    
    // حساب النتيجة
    let correctCount = 0;
    Object.keys(challengeAnswers).forEach(index => {
        if (challengeQuestions[index].correct === challengeAnswers[index]) {
            correctCount++;
        }
    });
    
    // حساب الوقت المستغرق
    const timeTaken = 300 - challengeTimeRemaining;
    const minutes = Math.floor(timeTaken / 60);
    const seconds = timeTaken % 60;
    const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    // حفظ في قاعدة البيانات
    saveToLeaderboard({
        name: challengerName,
        score: correctCount,
        total: 15,
        time: timeString,
        timeSeconds: timeTaken,
        date: new Date().toLocaleDateString('ar-EG')
    });
    
    // عرض النتيجة
    showChallengeResult(correctCount, timeString);
}

// عرض نتيجة التحدي
function showChallengeResult(score, time) {
    document.getElementById('challengeContainer').style.display = 'none';
    document.getElementById('challengeResult').style.display = 'block';
    
    const resultIcon = document.getElementById('resultIcon');
    const resultTitle = document.getElementById('resultTitle');
    
    // تحديد الرمز والعنوان حسب النتيجة
    if (score >= 13) {
        resultIcon.textContent = '🏆';
        resultTitle.textContent = 'ممتاز! أنت بطل!';
    } else if (score >= 10) {
        resultIcon.textContent = '🌟';
        resultTitle.textContent = 'أحسنت! نتيجة رائعة!';
    } else if (score >= 7) {
        resultIcon.textContent = '👍';
        resultTitle.textContent = 'جيد! استمر في التحسن!';
    } else {
        resultIcon.textContent = '💪';
        resultTitle.textContent = 'حاول مرة أخرى!';
    }
    
    document.getElementById('finalScore').textContent = `${score}/15`;
    document.getElementById('finalTime').textContent = time;
    document.getElementById('correctAnswers').textContent = `${score}/15`;
    
    // تحديث لوحة المتصدرين
    displayLeaderboard();
}

// إعادة التحدي
function restartChallenge() {
    document.getElementById('challengeResult').style.display = 'none';
    document.getElementById('challengeIntro').style.display = 'block';
    document.getElementById('challengerName').value = '';
    
    // إعادة تعيين المؤقت
    document.getElementById('timerDisplay').textContent = '05:00';
    document.getElementById('challengeTimer').classList.remove('warning');
}

// حفظ في قاعدة البيانات (Firebase Firestore)
async function saveToLeaderboard(entry) {
    // حفظ في localStorage أولاً كاحتياط
    let localLeaderboard = JSON.parse(localStorage.getItem('challengeLeaderboard')) || [];
    localLeaderboard.push({...entry});
    localLeaderboard.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.timeSeconds - b.timeSeconds;
    });
    localLeaderboard = localLeaderboard.slice(0, 50);
    localStorage.setItem('challengeLeaderboard', JSON.stringify(localLeaderboard));
    
    // محاولة الحفظ في Firebase
    if (!db) {
        console.error('❌ Firebase غير متصل، تم الحفظ محلياً فقط');
        updateLeaderboardUI(localLeaderboard);
        return;
    }
    
    try {
        // إضافة timestamp للترتيب
        entry.timestamp = firebase.firestore.FieldValue.serverTimestamp();
        
        // حفظ في Firebase
        const docRef = await db.collection('leaderboard').add(entry);
        
        console.log('✅ تم حفظ النتيجة في Firebase:', docRef.id);
        
    } catch (error) {
        console.error('❌ خطأ في حفظ النتيجة:', error);
        // البيانات محفوظة محلياً بالفعل
        updateLeaderboardUI(localLeaderboard);
    }
}

// عرض لوحة المتصدرين من Firebase
async function displayLeaderboard() {
    if (!db) {
        const leaderboard = JSON.parse(localStorage.getItem('challengeLeaderboard')) || [];
        updateLeaderboardUI(leaderboard);
        return;
    }
    
    try {
        // جلب البيانات من Firebase بدون ترتيب (لتجنب الحاجة لـ index)
        const snapshot = await db.collection('leaderboard')
            .limit(100)
            .get();
        
        let leaderboard = [];
        snapshot.forEach(doc => {
            leaderboard.push(doc.data());
        });
        
        // ترتيب في JavaScript: الأعلى نتيجة أولاً، ثم الأسرع وقتاً
        leaderboard.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return a.timeSeconds - b.timeSeconds;
        });
        
        // أخذ أفضل 50 فقط
        leaderboard = leaderboard.slice(0, 50);
        
        // تحديث لوحة المتصدرين في قسم التحدي
        updateLeaderboardUI(leaderboard);
        
    } catch (error) {
        console.error('❌ خطأ في جلب البيانات:', error);
        
        // استخدام localStorage كاحتياط
        const leaderboard = JSON.parse(localStorage.getItem('challengeLeaderboard')) || [];
        updateLeaderboardUI(leaderboard);
    }
}

// تحديث واجهة لوحة المتصدرين
function updateLeaderboardUI(leaderboard) {
    // تحديث لوحة المتصدرين في قسم التحدي
    const tbody = document.getElementById('leaderboardBody');
    const noRecords = document.getElementById('noRecords');
    
    if (tbody) {
        if (leaderboard.length === 0) {
            tbody.innerHTML = '';
            if (noRecords) noRecords.style.display = 'block';
        } else {
            if (noRecords) noRecords.style.display = 'none';
            tbody.innerHTML = leaderboard.map((entry, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>${entry.name}</td>
                    <td>${entry.score}/${entry.total}</td>
                    <td>${entry.time}</td>
                    <td>${entry.date}</td>
                </tr>
            `).join('');
        }
    }
    
    // تحديث لوحة المتصدرين الرئيسية
    const mainTbody = document.getElementById('mainLeaderboardBody');
    const noRecordsMain = document.getElementById('noRecordsMain');
    
    if (mainTbody) {
        if (leaderboard.length === 0) {
            mainTbody.innerHTML = '';
            if (noRecordsMain) noRecordsMain.style.display = 'block';
        } else {
            if (noRecordsMain) noRecordsMain.style.display = 'none';
            mainTbody.innerHTML = leaderboard.map((entry, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>${entry.name}</td>
                    <td>${entry.score}/${entry.total}</td>
                    <td>${entry.time}</td>
                    <td>${entry.date}</td>
                </tr>
            `).join('');
        }
    }
}

// الاستماع للتحديثات في الوقت الحقيقي
function listenToLeaderboard() {
    if (!db) {
        console.error('❌ Firebase غير متصل');
        // استخدام localStorage كاحتياط
        const leaderboard = JSON.parse(localStorage.getItem('challengeLeaderboard')) || [];
        updateLeaderboardUI(leaderboard);
        return;
    }
    
    console.log('🔄 جاري الاتصال بـ Firebase...');
    
    // جلب البيانات بدون ترتيب (لتجنب الحاجة لـ index)
    db.collection('leaderboard')
        .limit(100)
        .onSnapshot((snapshot) => {
            console.log('✅ تم جلب البيانات:', snapshot.size, 'سجل');
            let leaderboard = [];
            snapshot.forEach(doc => {
                leaderboard.push(doc.data());
            });
            // ترتيب في JavaScript: الأعلى نتيجة أولاً، ثم الأسرع وقتاً
            leaderboard.sort((a, b) => {
                if (b.score !== a.score) return b.score - a.score;
                return a.timeSeconds - b.timeSeconds;
            });
            // أخذ أفضل 50 فقط
            leaderboard = leaderboard.slice(0, 50);
            updateLeaderboardUI(leaderboard);
        }, (error) => {
            console.error('❌ خطأ في الاستماع للتحديثات:', error);
            // استخدام localStorage كاحتياط
            const leaderboard = JSON.parse(localStorage.getItem('challengeLeaderboard')) || [];
            updateLeaderboardUI(leaderboard);
        });
}

// تهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    // بدء الاستماع للتحديثات الفورية
    listenToLeaderboard();
});
