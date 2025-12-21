// ==========================================
// Configuration - Groq API
// ==========================================
const API_CONFIG = {
    apiKey: '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',
    apiUrl: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'llama-3.3-70b-versatile'
};

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
    
    const response = await fetch(API_CONFIG.apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_CONFIG.apiKey}`
        },
        body: JSON.stringify({
            model: 'llama-3.2-90b-vision-preview',
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: `أنت "ذكي"، نموذج لغوي ذكي مطور من شركة EAAAI.
                            
حلل هذه الصورة واستخرج السؤال أو المسألة منها، ثم:
1. اكتب نص السؤال/المسألة
2. قدم الحل خطوة بخطوة
3. اكتب الإجابة النهائية

${userName ? `اسم الطالب: ${userName}` : ''}

اشرح بطريقة بسيطة وواضحة باللغة العربية. استخدم الإيموجي بشكل معتدل.`
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
            temperature: 0.5
        })
    });

    if (!response.ok) {
        throw new Error('API Error');
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'عذراً، مش قادر أحلل الصورة.';
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

// بنك الأسئلة لكل مادة
const questionsBank = {
    physics: [],
    physics2: [
        {
            question: "ما هي وحدة قياس القوة في النظام الدولي؟",
            options: ["نيوتن", "جول", "واط", "باسكال"],
            correct: 0
        },
        {
            question: "ما هو قانون نيوتن الثاني للحركة؟",
            options: ["F = ma", "F = mv", "F = m/a", "F = a/m"],
            correct: 0
        },
        {
            question: "ما هي وحدة قياس الشغل؟",
            options: ["جول", "نيوتن", "واط", "متر"],
            correct: 0
        },
        {
            question: "ما هو تسارع الجاذبية الأرضية تقريباً؟",
            options: ["9.8 م/ث²", "10.8 م/ث²", "8.9 م/ث²", "11 م/ث²"],
            correct: 0
        },
        {
            question: "أي مما يلي يعتبر كمية متجهة؟",
            options: ["السرعة", "الكتلة", "الزمن", "درجة الحرارة"],
            correct: 0
        },
        {
            question: "ما هي العلاقة بين الطاقة الحركية والسرعة؟",
            options: ["تتناسب طردياً مع مربع السرعة", "تتناسب طردياً مع السرعة", "تتناسب عكسياً مع السرعة", "لا توجد علاقة"],
            correct: 0
        },
        {
            question: "ما هي وحدة قياس القدرة الكهربائية؟",
            options: ["واط", "فولت", "أمبير", "أوم"],
            correct: 0
        },
        {
            question: "ما هو قانون أوم؟",
            options: ["V = IR", "V = I/R", "V = R/I", "I = VR"],
            correct: 0
        },
        {
            question: "ما هي وحدة قياس المقاومة الكهربائية؟",
            options: ["أوم", "فولت", "أمبير", "واط"],
            correct: 0
        },
        {
            question: "ما هو نوع الطاقة المخزنة في النابض المضغوط؟",
            options: ["طاقة وضع مرونية", "طاقة حركية", "طاقة حرارية", "طاقة كهربائية"],
            correct: 0
        },
        {
            question: "ما هي وحدة قياس الشحنة الكهربائية؟",
            options: ["كولوم", "أمبير", "فولت", "أوم"],
            correct: 0
        },
        {
            question: "ما هو قانون كولوم للقوة الكهربائية؟",
            options: ["F = k(q1q2)/r²", "F = k(q1+q2)/r", "F = k(q1q2)r²", "F = k(q1-q2)/r²"],
            correct: 0
        },
        {
            question: "ما هي وحدة قياس المجال الكهربائي؟",
            options: ["نيوتن/كولوم", "فولت", "أمبير", "جول"],
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
    currentQuiz.questions = [...questionsBank[subject]];
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

// تهيئة أزرار الامتحان
function initQuizButtons() {
    // أزرار اختيار المادة
    document.querySelectorAll('.quiz-subject-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.quiz-subject-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            initQuiz(btn.dataset.quizSubject);
        });
    });
    
    // زر التالي
    document.getElementById('nextBtn').addEventListener('click', nextQuestion);
    
    // زر السابق
    document.getElementById('prevBtn').addEventListener('click', prevQuestion);
    
    // زر إنهاء الامتحان
    document.getElementById('submitQuiz').addEventListener('click', submitQuiz);
    
    // زر إعادة الامتحان
    document.getElementById('retryQuiz').addEventListener('click', () => {
        initQuiz(currentQuiz.subject);
    });
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
// الأسئلة المقالية - Essay Questions
// ==========================================
const essayQuestionsData = {
    physics: [],
    physics2: [
        {
            title: "السؤال الأول: التعريفات (Definitions)",
            marks: 6,
            description: "أول سؤال في الامتحان، سيُطلب منك تعريف واحد أو أكثر من القائمة التالية:",
            questions: [
                {
                    term: "مبدأ هيجنز (Huygens' Principle)",
                    answer: "كل النقاط الموجودة على صدر الموجة (Wave front) يمكن اعتبارها مصدراً لموجات ثانوية كروية تنتشر في جميع الاتجاهات بنفس سرعة الانتشار، والمماس لهذه الموجات ينشئ غلافاً يمثل الموجة الجديدة."
                },
                {
                    term: "الحيود (Diffraction)",
                    answer: "هو انتشار الموجات وانحناؤها عند مرورها عبر فتحة أو عائق أبعاده مقاربة للطول الموجي للموجة."
                },
                {
                    term: "الاستقطاب (Polarization)",
                    answer: "هو خاصية لجميع الأمواج المستعرضة، ويعبر عن اتجاه خطوط المجال الكهربي (Electric Field) للموجة."
                },
                {
                    term: "الجهد الحاجز (Barrier Potential)",
                    answer: "هو الجهد المتكون على جانبي الوصلة الثنائية (PN Junction) والذي يمنع انتقال المزيد من الإلكترونات والفجوات عبر الوصلة (قيمته 0.7V للسيليكون)."
                },
                {
                    term: "فجوة الطاقة (Band Gap)",
                    answer: "هي فرق الطاقة بين حزمة التكافؤ (Valence band) وحزمة التوصيل (Conduction band)."
                }
            ]
        },
        {
            title: "السؤال الثاني: حيود الشق المفرد (Single Slit Diffraction)",
            marks: 6,
            description: "استنتاج رياضي - استنتاج شرط الهدب المظلم الأول والثاني",
            questions: [
                {
                    term: "الهدب المظلم الأول (First Dark Fringe)",
                    answer: `1. نقسم الشق (عرضه a) إلى منطقتين متساويتين (a/2).
2. لكي يحدث تداخل هدام (إلغاء) بين شعاع من قمة المنطقة الأولى وشعاع من قمة المنطقة الثانية، يجب أن يكون فرق المسار λ/2.
3. من الرسم الهندسي: (a/2)sinθ = λ/2
4. القانون: a·sinθ = λ`
                },
                {
                    term: "الهدب المظلم الثاني (Second Dark Fringe)",
                    answer: `1. نقسم الشق إلى أربع مناطق متساوية (a/4).
2. يحدث الإلغاء بين كل منطقتين متجاورتين.
3. من الرسم الهندسي: (a/4)sinθ = λ/2
4. القانون: a·sinθ = 2λ`
                }
            ]
        },
        {
            title: "السؤال الثالث: الاستقطاب (Polarization)",
            marks: 6,
            description: "شرح نظري مع القوانين - غالباً عن أحد النوعين التاليين:",
            questions: [
                {
                    term: "الاستقطاب بالامتصاص (Polarization by Absorption)",
                    answer: `الشرح: نستخدم مادة (مثل التورمالين أو البولارويد) تمتص الاهتزازات الموازية لمحور البلورة وتسمح بنفاذ الاهتزازات العمودية عليها (محور النفاذ).

نستخدم شريحتين: الأولى (Polarizer) والثانية (Analyzer).

قانون مالوس (Malus's Law): شدة الضوء النافذ تعتمد على الزاوية θ بين المحورين:
I = Imax × cos²θ`
                },
                {
                    term: "الاستقطاب بالانعكاس (Polarization by Reflection)",
                    answer: `الشرح: عندما يسقط ضوء غير مستقطب على سطح، ينعكس جزء منه. عند زاوية سقوط معينة تسمى زاوية بروستر (θp)، يكون الشعاع المنعكس مستقطباً كلياً.

في هذه الحالة، الزاوية بين الشعاع المنعكس والمنكسر تكون 90°.

قانون بروستر: tan(θp) = n₂/n₁`
                }
            ]
        },
        {
            title: "السؤال الرابع: إثباتات المغناطيسية (Magnetic Fields)",
            marks: 6,
            description: "استنتاج رياضي - سيطلب منك إثبات واحد من الثلاثة (الأول هو الأكثر شيوعاً):",
            questions: [
                {
                    term: "سلك مستقيم طويل (Long Straight Wire)",
                    answer: `نطبق قانون بيو-سافارت، ونكامل بالنسبة للزاوية θ من −π/2 إلى +π/2.

النتيجة النهائية: B = μ₀I / (2πR)`
                },
                {
                    term: "سلك مقوس (Curved Wire Segment)",
                    answer: `المجال عند المركز. الأجزاء المستقيمة لا تولد مجالاً. الجزء المنحني يولد مجالاً بتكامل طول القوس s = aθ.

النتيجة النهائية: B = (μ₀I / 4πa) × θ (حيث θ بالراديان)`
                },
                {
                    term: "على محور حلقة دائرية (Axis of Circular Loop)",
                    answer: `نحلل المجال ونأخذ المركبة الأفقية dBₓ.

النتيجة النهائية: Bₓ = μ₀Ia² / [2(a² + x²)^(3/2)]`
                }
            ]
        },
        {
            title: "السؤال الخامس: نماذج الدايود والنسبية",
            marks: 6,
            description: "الاحتمال الأكبر هو نماذج الدايود، يليها النسبية:",
            questions: [
                {
                    term: "النموذج المثالي (Ideal Model)",
                    answer: `• انحياز أمامي: مفتاح مغلق (VF = 0)
• انحياز عكسي: مفتاح مفتوح (I = 0)`
                },
                {
                    term: "النموذج العملي (Practical Model)",
                    answer: `• انحياز أمامي: مفتاح مغلق + بطارية 0.7V
• القانون: IF = (Vbias − 0.7) / R`
                },
                {
                    term: "النموذج الكامل (Complete Model)",
                    answer: `• يضيف مقاومة ديناميكية صغيرة (r'd) في الأمامي ومقاومة كبيرة في العكسي.
• القانون: IF = (Vbias − 0.7) / (R + r'd)`
                },
                {
                    term: "تمدد الزمن (Time Dilation)",
                    answer: `استنتاج العلاقة من خلال رسم مثلث مسار الضوء وتطبيق فيثاغورث:

Δt = Δt₀ / √(1 − v²/c²)`
                },
                {
                    term: "انكماش الطول (Length Contraction)",
                    answer: `استنتاج العلاقة باستخدام معادلات الزمن والسرعة:

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

// بنك الأسئلة لكل مادة (للعرض مع الإجابات)
const questionsBankData = {
    physics: [],
    physics2: [
        {
            question: "ما هي وحدة قياس القوة في النظام الدولي؟",
            options: ["نيوتن", "جول", "واط", "باسكال"],
            correct: 0
        },
        {
            question: "ما هو قانون نيوتن الثاني للحركة؟",
            options: ["F = ma", "F = mv", "F = m/a", "F = a/m"],
            correct: 0
        },
        {
            question: "ما هي وحدة قياس الشغل؟",
            options: ["جول", "نيوتن", "واط", "متر"],
            correct: 0
        },
        {
            question: "ما هو تسارع الجاذبية الأرضية تقريباً؟",
            options: ["9.8 م/ث²", "10.8 م/ث²", "8.9 م/ث²", "11 م/ث²"],
            correct: 0
        },
        {
            question: "أي مما يلي يعتبر كمية متجهة؟",
            options: ["السرعة", "الكتلة", "الزمن", "درجة الحرارة"],
            correct: 0
        },
        {
            question: "ما هي العلاقة بين الطاقة الحركية والسرعة؟",
            options: ["تتناسب طردياً مع مربع السرعة", "تتناسب طردياً مع السرعة", "تتناسب عكسياً مع السرعة", "لا توجد علاقة"],
            correct: 0
        },
        {
            question: "ما هي وحدة قياس القدرة الكهربائية؟",
            options: ["واط", "فولت", "أمبير", "أوم"],
            correct: 0
        },
        {
            question: "ما هو قانون أوم؟",
            options: ["V = IR", "V = I/R", "V = R/I", "I = VR"],
            correct: 0
        },
        {
            question: "ما هي وحدة قياس المقاومة الكهربائية؟",
            options: ["أوم", "فولت", "أمبير", "واط"],
            correct: 0
        },
        {
            question: "ما هو نوع الطاقة المخزنة في النابض المضغوط؟",
            options: ["طاقة وضع مرونية", "طاقة حركية", "طاقة حرارية", "طاقة كهربائية"],
            correct: 0
        },
        {
            question: "ما هي وحدة قياس الشحنة الكهربائية؟",
            options: ["كولوم", "أمبير", "فولت", "أوم"],
            correct: 0
        },
        {
            question: "ما هو قانون كولوم للقوة الكهربائية؟",
            options: ["F = k(q1q2)/r²", "F = k(q1+q2)/r", "F = k(q1q2)r²", "F = k(q1-q2)/r²"],
            correct: 0
        },
        {
            question: "ما هي وحدة قياس المجال الكهربائي؟",
            options: ["نيوتن/كولوم", "فولت", "أمبير", "جول"],
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

