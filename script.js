// ==========================================
// Configuration - Groq API
// ==========================================
const API_CONFIG = {
    apiKey: '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',
    apiUrl: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'llama-3.3-70b-versatile'
};

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

// ==========================================// Handle file selection
function handleFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('الرجاء اختيار ملف صورة فقط!');
        return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
        alert('حجم الصورة يجب أن يكون أقل من 10MB');
        return;
    }

    selectedImage = file;
    
    // Convert to base64
    const reader = new FileReader();
    reader.onload = (e) => {
        base64Image = e.target.result;
        imagePreview.src = base64Image;
        previewContainer.style.display = 'block';
        aiResponse.style.display = 'none';
    };
    reader.readAsDataURL(file);
}

// Analyze button click
analyzeBtn.addEventListener('click', async () => {
    if (!base64Image) {
        alert('الرجاء اختيار صورة أولاً');
        return;
    }

    // Show loading
    aiResponse.style.display = 'block';
    loading.style.display = 'block';
    responseContent.style.display = 'none';

    try {
        const result = await analyzeImage(base64Image);
        responseContent.textContent = result;
        responseContent.style.display = 'block';
    } catch (error) {
        responseContent.textContent = 'حدث خطأ أثناء تحليل الصورة: ' + error.message;
        responseContent.style.display = 'block';
    } finally {
        loading.style.display = 'none';
    }
});

// Function to analyze image with AI
async function analyzeImage(imageData) {
    try {
        // استخراج base64 بدون البادئة
        const base64Data = imageData.split(',')[1];
        const mimeType = imageData.split(';')[0].split(':')[1];

        const response = await fetch(API_CONFIG.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_CONFIG.apiKey}`
            },
            body: JSON.stringify({
                model: API_CONFIG.model,
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: 'أنت مساعد تعليمي ذكي. حلل هذه الصورة واستخرج السؤال أو المسألة منها، ثم قدم الحل والإجابة بشكل مفصل وواضح باللغة العربية. إذا كانت مسألة رياضية، اشرح خطوات الحل.'
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
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || 'لم يتم الحصول على رد';
    } catch (error) {
        throw error;
    }
}

// ==========================================
// Essay Questions - AI Correction
// ==========================================
const correctBtn = document.getElementById('correctBtn');
const essayQuestion = document.getElementById('essayQuestion');
const modelAnswer = document.getElementById('modelAnswer');
const studentAnswer = document.getElementById('studentAnswer');
const maxScore = document.getElementById('maxScore');
const correctionResult = document.getElementById('correctionResult');
const correctionLoading = document.getElementById('correctionLoading');
const scoreDisplay = document.getElementById('scoreDisplay');
const strengthPoints = document.getElementById('strengthPoints');
const weaknessPoints = document.getElementById('weaknessPoints');
const recommendations = document.getElementById('recommendations');

correctBtn.addEventListener('click', async () => {
    const question = essayQuestion.value.trim();
    const model = modelAnswer.value.trim();
    const student = studentAnswer.value.trim();
    const max = parseInt(maxScore.value) || 10;

    if (!question) {
        alert('الرجاء إدخال السؤال');
        return;
    }

    if (!student) {
        alert('الرجاء إدخال إجابة الطالب');
        return;
    }

    // Show loading
    correctionResult.style.display = 'block';
    correctionLoading.style.display = 'block';
    document.querySelector('.result-header').style.display = 'none';
    document.querySelector('.result-details').style.display = 'none';

    try {
        const result = await correctEssay(question, model, student, max);
        displayCorrectionResult(result, max);
    } catch (error) {
        alert('حدث خطأ أثناء التصحيح: ' + error.message);
        correctionResult.style.display = 'none';
    } finally {
        correctionLoading.style.display = 'none';
    }
});

async function correctEssay(question, modelAnswer, studentAnswer, maxScore) {
    const prompt = `أنت مصحح امتحانات محترف. قم بتصحيح إجابة الطالب التالية:

السؤال: ${question}

${modelAnswer ? `الإجابة النموذجية: ${modelAnswer}` : ''}

إجابة الطالب: ${studentAnswer}

الدرجة الكاملة: ${maxScore}

قم بالرد بصيغة JSON فقط (بدون أي نص إضافي) كالتالي:
{
    "score": [الدرجة التي يستحقها الطالب من ${maxScore}],
    "strengths": "[نقاط القوة في الإجابة]",
    "weaknesses": "[نقاط الضعف في الإجابة]",
    "recommendations": "[ملاحظات وتوصيات للتحسين]"
}`;

    try {
        const response = await fetch(API_CONFIG.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_CONFIG.apiKey}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 1024,
                temperature: 0.3
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content || '';
        
        // Parse JSON from response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        } else {
            throw new Error('لم يتم الحصول على رد صحيح');
        }
    } catch (error) {
        throw error;
    }
}

function displayCorrectionResult(result, max) {
    document.querySelector('.result-header').style.display = 'flex';
    document.querySelector('.result-details').style.display = 'flex';
    
    // Update score
    const scoreValue = document.querySelector('.score-value');
    const scoreMax = document.querySelector('.score-max');
    scoreValue.textContent = result.score;
    scoreMax.textContent = `/${max}`;
    
    // Update score color based on percentage
    const percentage = (result.score / max) * 100;
    const scoreDisplayEl = document.querySelector('.score-display');
    if (percentage >= 80) {
        scoreDisplayEl.style.background = 'linear-gradient(135deg, #11998e, #38ef7d)';
    } else if (percentage >= 60) {
        scoreDisplayEl.style.background = 'linear-gradient(135deg, #f7971e, #ffd200)';
    } else if (percentage >= 40) {
        scoreDisplayEl.style.background = 'linear-gradient(135deg, #ff8008, #ffc837)';
    } else {
        scoreDisplayEl.style.background = 'linear-gradient(135deg, #cb2d3e, #ef473a)';
    }
    
    // Update details
    strengthPoints.textContent = result.strengths || 'لا توجد';
    weaknessPoints.textContent = result.weaknesses || 'لا توجد';
    recommendations.textContent = result.recommendations || 'لا توجد';
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
    initQuizButtons();
    initQuiz('physics2'); // بدء بامتحان فيزياء 2
});

// ==========================================
// Questions Bank - بنك الأسئلة
// ==========================================

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

