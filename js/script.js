

function generateUserId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = '';
    for (let i = 0; i < 8; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}

function initUserProfile() {
    let userProfile = JSON.parse(localStorage.getItem('userProfile'));

    if (!userProfile) {
        userProfile = {
            id: generateUserId(),
            name: '',
            totalChallenges: 0,
            bestScore: 0,
            totalCorrect: 0,
            visits: 1,
            theme: 'winter',
            createdAt: new Date().toISOString(),
            lastVisit: new Date().toISOString()
        };
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
    } else {

        userProfile.visits = (userProfile.visits || 0) + 1;
        userProfile.lastVisit = new Date().toISOString();
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
    }

    if (userProfile.theme === 'space') {
        document.body.classList.add('space-theme');
    } else if (userProfile.theme && userProfile.theme !== 'default') {
        document.body.classList.add(userProfile.theme + '-theme');
    }

    displayWelcomeGreeting(userProfile);

    return userProfile;
}

function displayWelcomeGreeting(userProfile) {
    const greetingEl = document.getElementById('welcomeGreeting');
    if (!greetingEl) return;

    const displayName = userProfile.nickname || userProfile.name;

    if (displayName) {
        const greetings = [
            `أهلاً يا ${displayName} 👋`,
            `مرحباً ${displayName} ✨`,
            `يا هلا ${displayName} 🌟`,
            `منور يا ${displayName} 💫`
        ];
        const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
        greetingEl.textContent = randomGreeting;
    }
}

function openUserProfile() {
    const userProfile = JSON.parse(localStorage.getItem('userProfile')) || initUserProfile();

    if (userProfile.name && userProfile.nickname) {
        document.getElementById('profileDisplayName').innerHTML = `${userProfile.name} <span style="color: #ffc107; font-size: 0.9rem;">(${userProfile.nickname})</span>`;
    } else {
        document.getElementById('profileDisplayName').textContent = userProfile.name || 'مستخدم جديد';
    }

    document.getElementById('profileUserId').textContent = userProfile.id;
    document.getElementById('profileNameInput').value = userProfile.name || '';
    document.getElementById('statTotalChallenges').textContent = userProfile.totalChallenges || 0;
    document.getElementById('statBestScore').textContent = userProfile.bestScore || 0;
    document.getElementById('statTotalCorrect').textContent = userProfile.totalCorrect || 0;
    document.getElementById('statVisits').textContent = userProfile.visits || 0;

    document.getElementById('userProfileModal').classList.add('active');
}

function closeUserProfile() {
    document.getElementById('userProfileModal').classList.remove('active');
}

async function generateNickname(name) {
    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer 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'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    {
                        role: 'system',
                        content: 'أنت مساعد ودود. مهمتك توليد لقب أو دلع واحد فقط لطيف وودود باللغة العربية للاسم المعطى. الرد يجب أن يكون اللقب فقط بدون أي كلام إضافي. مثال: إذا الاسم "محمد" يمكن أن يكون اللقب "حمودة 🌟" أو "ميدو ⭐"'
                    },
                    {
                        role: 'user',
                        content: `ولد لقب أو دلع لطيف للاسم: ${name}`
                    }
                ],
                max_tokens: 50,
                temperature: 0.9
            })
        });

        const data = await response.json();
        if (data.choices && data.choices[0]) {
            return data.choices[0].message.content.trim();
        }
        return null;
    } catch (error) {
        console.log('Error generating nickname:', error);
        return null;
    }
}

async function saveUserProfile() {
    const userProfile = JSON.parse(localStorage.getItem('userProfile')) || initUserProfile();
    const newName = document.getElementById('profileNameInput').value.trim();

    if (newName) {

        const saveBtn = document.querySelector('.profile-btn.save-btn');
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> حفظ ومزامنة...';
        saveBtn.disabled = true;

        const nickname = await generateNickname(newName);

        userProfile.name = newName;
        userProfile.nickname = nickname || '';
        localStorage.setItem('userProfile', JSON.stringify(userProfile));

        if (dbLeaderboard) {
            try {

                const profileToSync = { ...userProfile };
                delete profileToSync.theme; // لا نحفظ الثيم أونلاين

                await dbLeaderboard.collection('users').doc(userProfile.id).set(profileToSync, { merge: true });
                console.log('✅ تم مزامنة البروفايل مع Firebase');
            } catch (error) {
                console.error('فشل المزامنة:', error);
            }
        }

        if (nickname) {
            document.getElementById('profileDisplayName').innerHTML = `${newName} <span style="color: #ffc107; font-size: 0.9rem;">(${nickname})</span>`;
            alert(`✅ تم حفظ البيانات ومزامنتها!\n\n🏷️ لقبك: ${nickname}\n🆔 المعرف الخاص بك: ${userProfile.id}\n(احتفظ بهذا الكود لاسترجاع حسابك)`);
        } else {
            document.getElementById('profileDisplayName').textContent = newName;
            alert(`✅ تم حفظ البيانات بنجاح!\n🆔 المعرف الخاص بك: ${userProfile.id}`);
        }

        saveBtn.innerHTML = originalText;
        saveBtn.disabled = false;
    } else {
        alert('⚠️ من فضلك أدخل اسمك');
    }
}

async function restoreProfile() {
    const idInput = prompt("أدخل كود المعرف (User ID) الخاص بك لاسترجاع بياناتك:");
    if (!idInput) return;

    const userId = idInput.trim().toUpperCase();

    if (dbLeaderboard) {
        try {
            const doc = await dbLeaderboard.collection('users').doc(userId).get();
            if (doc.exists) {
                const data = doc.data();

                const currentLocal = JSON.parse(localStorage.getItem('userProfile')) || {};
                const mergedProfile = { ...data, theme: currentLocal.theme || 'default' };

                localStorage.setItem('userProfile', JSON.stringify(mergedProfile));

                alert(`✅ تم استرجاع البروفايل بنجاح!\nأهلاً بك مجدداً يا ${data.name}`);
                location.reload(); // إعادة تحميل لتطبيق الجدد
            } else {
                alert("❌ لم يتم العثور على بروفايل بهذا المعرف.");
            }
        } catch (error) {
            console.error(error);
            alert("حدث خطأ أثناء الاسترجاع. تأكد من الاتصال بالإنترنت.");
        }
    }
}

async function updateUserStats(score) {
    const userProfile = JSON.parse(localStorage.getItem('userProfile')) || initUserProfile();

    userProfile.totalChallenges = (userProfile.totalChallenges || 0) + 1;
    userProfile.totalCorrect = (userProfile.totalCorrect || 0) + score;

    if (score > (userProfile.bestScore || 0)) {
        userProfile.bestScore = score;
    }

    localStorage.setItem('userProfile', JSON.stringify(userProfile));

    if (dbLeaderboard) {
        try {
            const statsToSync = {
                totalChallenges: userProfile.totalChallenges,
                totalCorrect: userProfile.totalCorrect,
                bestScore: userProfile.bestScore,
                lastActive: new Date().toISOString()
            };
            await dbLeaderboard.collection('users').doc(userProfile.id).set(statsToSync, { merge: true });
        } catch (error) {
            console.error('Error syncing stats:', error);
        }
    }
}

function toggleSpaceTheme() {
    const userProfile = JSON.parse(localStorage.getItem('userProfile')) || initUserProfile();

    if (document.body.classList.contains('space-theme')) {
        document.body.classList.remove('space-theme');
        userProfile.theme = 'default';
    } else {
        document.body.classList.add('space-theme');
        userProfile.theme = 'space';
    }

    localStorage.setItem('userProfile', JSON.stringify(userProfile));
}

let scrollGoingDown = true;

function toggleScrollDirection() {
    const scrollRocket = document.getElementById('scrollRocket');

    if (scrollGoingDown) {

        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
        });
    } else {

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}

window.addEventListener('scroll', () => {
    const scrollRocket = document.getElementById('scrollRocket');
    if (!scrollRocket) return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;

    if (scrollTop > scrollHeight / 2) {

        scrollRocket.classList.remove('going-down');
        scrollGoingDown = false;
    } else {

        scrollRocket.classList.add('going-down');
        scrollGoingDown = true;
    }
});

function getSavedUserName() {
    const userProfile = JSON.parse(localStorage.getItem('userProfile'));
    return userProfile?.name || '';
}

function toggleThemeMenu() {
    const menu = document.getElementById('themeMenu');
    menu.classList.toggle('active');
}

document.addEventListener('click', (e) => {
    const menu = document.getElementById('themeMenu');
    const toggle = document.querySelector('.theme-toggle');
    if (menu && !menu.contains(e.target) && !toggle.contains(e.target)) {
        menu.classList.remove('active');
    }
});

function setTheme(theme) {
    const body = document.body;
    const userProfile = JSON.parse(localStorage.getItem('userProfile')) || {};

    body.classList.remove('space-theme', 'ocean-theme', 'sunset-theme', 'pyramids-theme', 'winter-theme');

    if (theme !== 'default') {
        body.classList.add(theme + '-theme');
    }

    document.querySelectorAll('.theme-option').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.theme === theme) {
            btn.classList.add('active');
        }
    });

    userProfile.theme = theme;
    localStorage.setItem('userProfile', JSON.stringify(userProfile));

    document.getElementById('themeMenu').classList.remove('active');

    const toggle = document.querySelector('.theme-toggle i');
    const icons = {
        'default': 'fa-moon',
        'space': 'fa-rocket',
        'ocean': 'fa-water',
        'sunset': 'fa-sun',
        'pyramids': 'fa-mountain',
        'winter': 'fa-snowflake'
    };
    toggle.className = 'fas ' + (icons[theme] || 'fa-moon');
}

function loadSavedTheme() {
    const userProfile = JSON.parse(localStorage.getItem('userProfile'));
    if (userProfile?.theme && userProfile.theme !== 'default') {
        setTheme(userProfile.theme);
    }
}

// Cycle through themes when clicking theme icon
function cycleTheme() {
    const themes = ['default', 'space', 'ocean', 'sunset', 'pyramids', 'winter'];
    const userProfile = JSON.parse(localStorage.getItem('userProfile')) || {};
    const currentTheme = userProfile.theme || 'default';

    // Find current theme index and get next theme
    const currentIndex = themes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex];

    // Apply the next theme
    setTheme(nextTheme);
}


document.addEventListener('DOMContentLoaded', function () {
    initUserProfile();
});

document.addEventListener('DOMContentLoaded', function () {
    const uploadForm = document.getElementById('uploadQuestionsForm');
    if (uploadForm) {
        uploadForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const fileInput = document.getElementById('questionsFile');
            const status = document.getElementById('uploadStatus');
            if (!fileInput.files.length) {
                status.textContent = 'يرجى اختيار ملف.';
                status.style.color = 'red';
                return;
            }
            const file = fileInput.files[0];
            const reader = new FileReader();
            reader.onload = function (event) {
                try {
                    const questions = JSON.parse(event.target.result);

                    localStorage.setItem('uploadedQuestions', JSON.stringify(questions));
                    status.textContent = 'تم رفع الأسئلة بنجاح!';
                    status.style.color = 'green';
                } catch (err) {
                    status.textContent = 'ملف غير صالح!';
                    status.style.color = 'red';
                }
            };
            reader.readAsText(file);
        });
    }
});

const API_CONFIG = {
    apiKey: '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',
    apiUrl: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'llama-3.3-70b-versatile'
};

const GEMINI_CONFIG = {
    apiKey: 'AIzaSyAErOl-9MrM_A-HLRxvxFqx5b6WJWwi2Zs',
    apiUrl: 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent'
};

const firebaseConfig1 = {
    apiKey: "AIzaSyCFhUdOI9IqFCjBkg8zytanD5O1_67vCr4",
    authDomain: "manasa-ceaa2.firebaseapp.com",
    projectId: "manasa-ceaa2",
    storageBucket: "manasa-ceaa2.firebasestorage.app",
    messagingSenderId: "847284305108",
    appId: "1:847284305108:web:7a14698f76b3981c6acf41",
    measurementId: "G-CYX6QKJZSR"
};

const firebaseConfig2 = {
    apiKey: "AIzaSyAdIW3mf2yv9KWzEVTgb62Yquu8oHMWj7g",
    authDomain: "manasa-2.firebaseapp.com",
    projectId: "manasa-2",
    storageBucket: "manasa-2.firebasestorage.app",
    messagingSenderId: "713731774832",
    appId: "1:713731774832:web:bd33be9764c350b62997b5",
    measurementId: "G-LHVFYC2GQH"
};

let db1, db2;
let dbLeaderboard, dbAnalytics;
try {

    const app1 = firebase.initializeApp(firebaseConfig1, 'leaderboard-app');
    db1 = firebase.firestore(app1);
    dbLeaderboard = db1;
    console.log('✅ Firebase Leaderboard DB initialized successfully');

    const app2 = firebase.initializeApp(firebaseConfig2, 'analytics-app');
    db2 = firebase.firestore(app2);
    dbAnalytics = db2;
    console.log('✅ Firebase Analytics DB initialized successfully');
} catch (error) {
    console.error('❌ Firebase initialization error:', error);
}

let db = dbLeaderboard;

// ==========================================
// Visitor Analytics Tracking - تتبع الزوار (Using Database 2)
// ==========================================


let chatHistory = [];
let userName = '';
let isFirstMessage = true;
let pendingImage = null;

function toggleChatBot() {
    const container = document.getElementById('chatBotContainer');
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
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message user';
    messageDiv.textContent = message;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTypingIndicator() {
    const chatMessages = document.getElementById('chatMessages');
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
        console.error('Ask AI Error:', error);
        responseContent.innerHTML = '❌ حدث خطأ. تأكد من اتصالك بالإنترنت وحاول مرة أخرى.';
    }

    askBtn.disabled = false;
    askBtn.innerHTML = '<i class="fas fa-paper-plane"></i> اسأل ذكي';
}

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
            const errorData = await response.json().catch(() => ({}));
            console.error('Gemini API Error:', response.status, errorData);
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        return text || 'عذراً، مش قادر أحلل الصورة. جرب تاني! 🔄';
    } catch (error) {
        console.error('Image analysis error:', error);
        throw error;
    }
}

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

const questionsBank = {
    physics: [],
    physics2: [],
    math1: [],
    math0: [],
    it: [],
    electronics: [],
    english: []
};


let currentQuiz = {
    subject: 'physics',
    questions: [],
    currentIndex: 0,
    answers: [],
    timer: 0,
    timerInterval: null
};

function initQuiz(subject) {
    currentQuiz.subject = subject;

    const allQuestions = [...questionsBank[subject]];
    const shuffled = allQuestions.sort(() => Math.random() - 0.5);
    currentQuiz.questions = shuffled.slice(0, Math.min(15, shuffled.length));

    currentQuiz.currentIndex = 0;
    currentQuiz.answers = new Array(currentQuiz.questions.length).fill(null);

    const subjectNames = {
        physics: 'فيزياء 1',
        physics2: 'فيزياء 2',
        math1: 'رياضة 1',
        math0: 'رياضة 0',
        it: 'IT',
        electronics: 'إلكترونيات',
        english: 'لغة إنجليزية'
    };

    const currentSubjectEl = document.getElementById('currentSubject');
    const totalQEl = document.getElementById('totalQ');
    if (currentSubjectEl) currentSubjectEl.textContent = subjectNames[subject];
    if (totalQEl) totalQEl.textContent = currentQuiz.questions.length;

    const quizResult = document.getElementById('quizResult');
    const quizContainer = document.getElementById('quizContainer');
    if (quizResult) quizResult.style.display = 'none';
    if (quizContainer) quizContainer.style.display = 'block';

    if (currentQuiz.questions.length === 0) {
        document.getElementById('questionText').textContent = 'لا توجد أسئلة لهذه المادة حالياً';
        document.getElementById('quizOptions').innerHTML = '';
        document.getElementById('nextBtn').style.display = 'none';
        document.getElementById('submitQuiz').style.display = 'none';
        return;
    }

    startTimer();

    showQuestion(0);
}

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

    document.getElementById('prevBtn').disabled = index === 0;

    if (index === currentQuiz.questions.length - 1) {
        document.getElementById('nextBtn').style.display = 'none';
        document.getElementById('submitQuiz').style.display = 'inline-flex';
    } else {
        document.getElementById('nextBtn').style.display = 'inline-flex';
        document.getElementById('submitQuiz').style.display = 'none';
    }
}

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

function nextQuestion() {
    if (currentQuiz.currentIndex < currentQuiz.questions.length - 1) {
        currentQuiz.currentIndex++;
        showQuestion(currentQuiz.currentIndex);
    }
}

function prevQuestion() {
    if (currentQuiz.currentIndex > 0) {
        currentQuiz.currentIndex--;
        showQuestion(currentQuiz.currentIndex);
    }
}

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

function submitQuiz() {
    clearInterval(currentQuiz.timerInterval);

    let score = 0;
    currentQuiz.questions.forEach((q, i) => {
        if (currentQuiz.answers[i] === q.correct) {
            score++;
        }
    });

    const percentage = Math.round((score / currentQuiz.questions.length) * 100);

    document.getElementById('quizContainer').style.display = 'none';
    document.getElementById('quizResult').style.display = 'block';

    document.getElementById('finalScore').textContent = score;
    document.getElementById('maxScore').textContent = currentQuiz.questions.length;
    document.getElementById('resultPercentage').textContent = percentage + '%';

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

let quizUserName = '';
let selectedQuizSubject = 'physics2';

function initQuizButtons() {

    document.querySelectorAll('.quiz-subject-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.quiz-subject-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedQuizSubject = btn.dataset.quizSubject;

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

            const startScreen = document.getElementById('quizStartScreen');
            const container = document.getElementById('quizContainer');
            const result = document.getElementById('quizResult');
            if (startScreen) startScreen.style.display = 'block';
            if (container) container.style.display = 'none';
            if (result) result.style.display = 'none';
        });
    });

    const nextBtn = document.getElementById('nextBtn');
    if (nextBtn) nextBtn.addEventListener('click', nextQuestion);

    const prevBtn = document.getElementById('prevBtn');
    if (prevBtn) prevBtn.addEventListener('click', prevQuestion);

    const submitBtn = document.getElementById('submitQuiz');
    if (submitBtn) submitBtn.addEventListener('click', submitQuiz);

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

function startQuizWithName() {
    const nameInput = document.getElementById('quizUserName');
    quizUserName = nameInput.value.trim();

    if (!quizUserName) {
        alert('من فضلك أدخل اسمك للبدء!');
        nameInput.focus();
        return;
    }

    document.getElementById('quizStartScreen').style.display = 'none';
    initQuiz(selectedQuizSubject);
}

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

function loadParticipants() {
    const saved = localStorage.getItem('bicycleParticipants');
    if (saved) {
        participantsData = JSON.parse(saved);
        updateAllLists();
    }
}

function saveParticipants() {
    localStorage.setItem('bicycleParticipants', JSON.stringify(participantsData));
}

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

    participantsData[level].push({ name, score });

    participantsData[level].sort((a, b) => b.score - a.score);

    updateParticipantsList(level);

    saveParticipants();

    nameInput.value = '';
    scoreInput.value = '';

    showNotification(`تم إضافة ${name} بنجاح!`);
}

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

function updateAllLists() {
    updateParticipantsList(1);
    updateParticipantsList(2);
    updateParticipantsList(3);
}

function deleteParticipant(level, index) {
    const participant = participantsData[level][index];
    if (confirm(`هل تريد حذف ${participant.name}؟`)) {
        participantsData[level].splice(index, 1);
        updateParticipantsList(level);
        saveParticipants();
        showNotification('تم الحذف بنجاح');
    }
}

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

document.addEventListener('DOMContentLoaded', () => {
    loadParticipants();
    initBankTabs();
    initEssayTabs();
    initQuizButtons();
    initQuiz('physics2'); // بدء بامتحان فيزياء 2
});

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

const questionsBankData = {
    physics: [],
    physics2: [

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

let bankQuestionsShown = 10;
let currentBankSubject = 'physics2';

function displayBankQuestions(subject, reset = true) {
    const container = document.getElementById('questionsBankContainer');
    let questions = questionsBankData[subject] || [];

    if (questions.length === 0 && questionsBank[subject]) {
        questions = questionsBank[subject];
    }

    if (reset) {
        bankQuestionsShown = 10;
        currentBankSubject = subject;
    }

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

    const shuffledQuestions = questions.map(q => {
        const optionsWithIndex = q.options.map((opt, idx) => ({
            text: opt,
            isCorrect: idx === q.correct
        }));
        const shuffledOptions = optionsWithIndex.sort(() => Math.random() - 0.5);
        const newCorrectIndex = shuffledOptions.findIndex(opt => opt.isCorrect);
        return {
            question: q.question,
            options: shuffledOptions.map(opt => opt.text),
            correct: newCorrectIndex
        };
    });

    const letters = ['أ', 'ب', 'ج', 'د'];
    let html = shuffledQuestions.slice(0, bankQuestionsShown).map((q, index) => `
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

    if (bankQuestionsShown < questions.length) {
        html += `<div style="text-align:center;margin:1.5rem 0;">
            <button class="btn btn-secondary" onclick="showMoreBankQuestions()">عرض المزيد</button>
        </div>`;
    }
    container.innerHTML = html;
}

function showMoreBankQuestions() {
    const questions = questionsBankData[currentBankSubject] || [];
    bankQuestionsShown += 10;
    if (bankQuestionsShown > questions.length) bankQuestionsShown = questions.length;
    displayBankQuestions(currentBankSubject, false);
}

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

function initBankTabs() {
    const tabs = document.querySelectorAll('[data-bank-subject]');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            displayBankQuestions(tab.dataset.bankSubject);
        });
    });

    displayBankQuestions('physics2');
}

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

function initEssayTabs() {
    const tabs = document.querySelectorAll('[data-essay-subject]');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            displayEssayQuestions(tab.dataset.essaySubject);
        });
    });

    displayEssayQuestions('physics2');
}

let challengeQuestions = [];
let currentChallengeIndex = 0;
let challengeAnswers = {};
let challengeTimerInterval = null;
let challengeTimeRemaining = 300; // 5 دقائق بالثواني
let challengeStartTime = null;
let challengerName = '';

const bannedWords = [

    'كس', 'طيز', 'زب', 'شرموط', 'عرص', 'متناك', 'منيك', 'لبوه', 'قحب', 'عاهر',
    'خول', 'ابن الكلب', 'ابن الحرام', 'ابن العرص', 'ابن الشرموطه', 'كسم',
    'احا', 'ينعل', 'يلعن', 'زانيه', 'زاني', 'فاجر', 'فاجره', 'وسخ', 'وسخه',
    'حمار', 'غبي', 'احمق', 'معفن', 'قذر', 'نجس', 'حقير', 'تافه', 'واطي',
    'كلب', 'خنزير', 'حيوان', 'بهيم', 'ديوث', 'قواد',

    'fuck', 'shit', 'bitch', 'ass', 'dick', 'pussy', 'bastard', 'whore',
    'slut', 'cunt', 'cock', 'damn', 'hell', 'nigger', 'fag', 'gay',
    'stupid', 'idiot', 'dumb', 'retard', 'loser', 'sucker', 'motherfucker',

    'ابليس', 'شيطان', 'satan', 'devil', 'demon'
];

function filterName(name) {
    if (!name) return '';

    let filteredName = name.trim();
    const lowerName = filteredName.toLowerCase();

    for (const word of bannedWords) {
        const regex = new RegExp(word, 'gi');
        if (regex.test(lowerName) || regex.test(filteredName)) {
            return null; // الاسم يحتوي على كلمة ممنوعة
        }
    }

    if (filteredName.length < 2 || filteredName.length > 30) {
        return null;
    }

    const onlyNumbers = /^[0-9]+$/;
    const onlySymbols = /^[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/;
    if (onlyNumbers.test(filteredName) || onlySymbols.test(filteredName)) {
        return null;
    }

    const validName = /^[\u0600-\u06FFa-zA-Z ]+$/;
    if (!validName.test(filteredName)) {
        return null;
    }

    if (/(.)\1{2,}/.test(filteredName)) {
        return null;
    }

    return filteredName;
}

function startChallenge() {
    const nameInput = document.getElementById('challengerName');
    const rawName = nameInput.value.trim();

    if (!rawName) {
        alert('من فضلك أدخل اسمك للبدء!');
        nameInput.focus();
        return;
    }

    challengerName = filterName(rawName);

    if (!challengerName) {
        alert('⚠️ الاسم غير مقبول!\n\nيرجى استخدام اسم لائق بدون ألفاظ غير مناسبة.');
        nameInput.value = '';
        nameInput.focus();
        return;
    }

    // Auto-save name to user profile
    const userProfile = JSON.parse(localStorage.getItem('userProfile')) || initUserProfile();
    if (!userProfile.name || userProfile.name !== challengerName) {
        userProfile.name = challengerName;
        localStorage.setItem('userProfile', JSON.stringify(userProfile));

        // Update profile input if exists
        const profileNameInput = document.getElementById('profileNameInput');
        if (profileNameInput) {
            profileNameInput.value = challengerName;
        }
    }

    const selectedSubject = document.getElementById('challengeSubject')?.value || 'physics2';

    challengeQuestions = getRandomQuestions(15, selectedSubject);
    currentChallengeIndex = 0;
    challengeAnswers = {};
    challengeTimeRemaining = 300;
    challengeStartTime = Date.now();

    if (challengeTimerInterval) {
        clearInterval(challengeTimerInterval);
        challengeTimerInterval = null;
    }

    document.getElementById('timerDisplay').textContent = '05:00';
    document.getElementById('challengeTimer').classList.remove('warning');

    document.getElementById('challengeIntro').style.display = 'none';
    document.getElementById('challengeContainer').style.display = 'block';
    document.getElementById('challengeResult').style.display = 'none';

    startChallengeTimer();

    showChallengeQuestion();
    updateChallengeNav();
}

function getRandomQuestions(count, subject = 'physics2') {
    const allQuestions = [...(questionsBank[subject] || questionsBank.physics2)];
    const shuffled = allQuestions.sort(() => Math.random() - 0.5);
    const selectedQuestions = shuffled.slice(0, Math.min(count, shuffled.length));

    return selectedQuestions.map(q => {

        const optionsWithIndex = q.options.map((opt, idx) => ({
            text: opt,
            isCorrect: idx === q.correct
        }));

        const shuffledOptions = optionsWithIndex.sort(() => Math.random() - 0.5);

        const newCorrectIndex = shuffledOptions.findIndex(opt => opt.isCorrect);

        return {
            question: q.question,
            options: shuffledOptions.map(opt => opt.text),
            correct: newCorrectIndex
        };
    });
}

function startChallengeTimer() {
    const timerDisplay = document.getElementById('timerDisplay');
    const timerDiv = document.getElementById('challengeTimer');

    challengeTimerInterval = setInterval(() => {
        challengeTimeRemaining--;

        const minutes = Math.floor(challengeTimeRemaining / 60);
        const seconds = challengeTimeRemaining % 60;
        timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        if (challengeTimeRemaining <= 60) {
            timerDiv.classList.add('warning');
        }

        if (challengeTimeRemaining <= 0) {
            clearInterval(challengeTimerInterval);
            submitChallenge();
        }
    }, 1000);
}

function showChallengeQuestion() {
    const question = challengeQuestions[currentChallengeIndex];
    const questionDiv = document.getElementById('challengeQuestion');
    const optionsDiv = document.getElementById('challengeOptions');
    const progressSpan = document.getElementById('challengeProgress');

    progressSpan.textContent = `${currentChallengeIndex + 1}/15`;

    questionDiv.innerHTML = `<span class="question-number">س${currentChallengeIndex + 1}:</span> ${question.question}`;

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

function selectChallengeOption(optionIndex) {

    challengeAnswers[currentChallengeIndex] = optionIndex;

    const options = document.querySelectorAll('.challenge-option');
    options.forEach((opt, i) => {
        opt.classList.remove('selected');
        if (i === optionIndex) {
            opt.classList.add('selected');
        }
    });
}

function updateChallengeScore() {
    let score = 0;
    Object.keys(challengeAnswers).forEach(index => {
        if (challengeQuestions[index] && challengeQuestions[index].correct === challengeAnswers[index]) {
            score++;
        }
    });
    return score;
}

function nextChallengeQuestion() {
    if (currentChallengeIndex < challengeQuestions.length - 1) {
        currentChallengeIndex++;
        showChallengeQuestion();
    }
}

function prevChallengeQuestion() {
    if (currentChallengeIndex > 0) {
        currentChallengeIndex--;
        showChallengeQuestion();
    }
}

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

function submitChallenge() {
    clearInterval(challengeTimerInterval);

    let correctCount = 0;
    Object.keys(challengeAnswers).forEach(index => {
        if (challengeQuestions[index].correct === challengeAnswers[index]) {
            correctCount++;
        }
    });

    const timeTaken = 300 - challengeTimeRemaining;
    const minutes = Math.floor(timeTaken / 60);
    const seconds = timeTaken % 60;
    const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    // Get user profile for ID
    const userProfile = JSON.parse(localStorage.getItem('userProfile')) || initUserProfile();

    // Format date as DD/MM/YYYY
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;

    const selectedSubject = document.getElementById('challengeSubject')?.value || 'physics2';
    saveToLeaderboard({
        userId: userProfile.id,
        name: challengerName,
        score: correctCount,
        total: 15,
        time: timeString,
        timeSeconds: timeTaken,
        subject: selectedSubject,
        date: formattedDate
    });

    showChallengeResult(correctCount, timeString);
}

function showChallengeResult(score, time) {
    document.getElementById('challengeContainer').style.display = 'none';
    document.getElementById('challengeResult').style.display = 'block';

    const resultIcon = document.getElementById('resultIcon');
    const resultTitle = document.getElementById('resultTitle');

    // Calculate percentage
    const percentage = Math.round((score / 15) * 100);

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

    document.getElementById('finalScore').textContent = `${score}/15 (${percentage}%)`;
    document.getElementById('finalTime').textContent = time;
    document.getElementById('correctAnswers').textContent = `${score}/15`;

    displayLeaderboard();
}

function restartChallenge() {
    document.getElementById('challengeResult').style.display = 'none';
    document.getElementById('challengeIntro').style.display = 'block';
    document.getElementById('challengerName').value = '';

    document.getElementById('timerDisplay').textContent = '05:00';
    document.getElementById('challengeTimer').classList.remove('warning');
}

async function saveToLeaderboard(entry) {

    if (entry.score >= 14 && entry.timeSeconds < 60) {
        console.warn('🚫 تم اكتشاف نتيجة مشبوهة - غش محتمل');
        alert('⚠️ تم اكتشاف نشاط مشبوه!\n\nلا يمكن حفظ نتيجتك.\n\nإذا كنت تعتقد أن هذا خطأ، يرجى إعادة المحاولة بشكل طبيعي.');

        if (db) {
            try {
                const collectionName = `leaderboard_${entry.subject}`;
                const suspiciousResults = await db.collection(collectionName)
                    .where('name', '==', entry.name)
                    .where('score', '>=', 14)
                    .get();

                suspiciousResults.forEach(async (doc) => {
                    const data = doc.data();
                    if (data.timeSeconds < 60) {
                        await db.collection(collectionName).doc(doc.id).delete();
                        console.log('🗑️ تم حذف نتيجة مشبوهة:', doc.id);
                    }
                });
            } catch (error) {
                console.error('خطأ في حذف النتائج المشبوهة:', error);
            }
        }

        return; // لا تحفظ النتيجة
    }

    let localLeaderboard = JSON.parse(localStorage.getItem('challengeLeaderboard')) || [];
    localLeaderboard.push({ ...entry });
    localLeaderboard.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.timeSeconds - b.timeSeconds;
    });
    localLeaderboard = localLeaderboard.slice(0, 50);
    localStorage.setItem('challengeLeaderboard', JSON.stringify(localLeaderboard));

    if (!db) {
        console.error('❌ Firebase غير متصل، تم الحفظ محلياً فقط');
        updateLeaderboardUI(localLeaderboard);
        return;
    }

    try {
        const collectionName = `leaderboard_${entry.subject}`;
        entry.timestamp = firebase.firestore.FieldValue.serverTimestamp();

        const docRef = await db.collection(collectionName).add(entry);

        console.log(`✅ تم حفظ النتيجة في Firebase: ${collectionName}/${docRef.id}`);

    } catch (error) {
        console.error('❌ خطأ في حفظ النتيجة:', error);

        updateLeaderboardUI(localLeaderboard);
    }
}

async function displayLeaderboard(subject = 'physics2') {
    if (!db) {
        const leaderboard = JSON.parse(localStorage.getItem('challengeLeaderboard')) || [];
        updateLeaderboardUI(leaderboard);
        return;
    }

    try {
        const collectionName = `leaderboard_${subject}`;
        const snapshot = await db.collection(collectionName)
            .limit(100)
            .get();

        let leaderboard = [];
        snapshot.forEach(doc => {
            leaderboard.push(doc.data());
        });

        leaderboard.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return a.timeSeconds - b.timeSeconds;
        });

        leaderboard = leaderboard.slice(0, 50);

        updateLeaderboardUI(leaderboard);

    } catch (error) {
        console.error('❌ خطأ في جلب البيانات:', error);

        const leaderboard = JSON.parse(localStorage.getItem('challengeLeaderboard')) || [];
        updateLeaderboardUI(leaderboard);
    }
}

function updateLeaderboardUI(leaderboard) {

    const tbody = document.getElementById('leaderboardBody');
    const noRecords = document.getElementById('noRecords');

    if (tbody) {
        if (leaderboard.length === 0) {
            tbody.innerHTML = '';
            if (noRecords) noRecords.style.display = 'block';
        } else {
            if (noRecords) noRecords.style.display = 'none';
            tbody.innerHTML = leaderboard.map((entry, index) => {
                let rowClass = '';
                if (index === 0) rowClass = 'top-leader';

                return `
                                <tr class="${rowClass}">
                                        <td>${index + 1}</td>
                                        <td class="name-cell">${entry.name}</td>
                                        <td>${entry.score}/${entry.total}</td>
                                        <td>${entry.time}</td>
                                        <td>${entry.date}</td>
                                </tr>
                                `;
            }).join('');
        }
    }

    const mainTbody = document.getElementById('mainLeaderboardBody');
    const noRecordsMain = document.getElementById('noRecordsMain');

    if (mainTbody) {
        if (leaderboard.length === 0) {
            mainTbody.innerHTML = '';
            if (noRecordsMain) noRecordsMain.style.display = 'block';
        } else {
            if (noRecordsMain) noRecordsMain.style.display = 'none';
            mainTbody.innerHTML = leaderboard.map((entry, index) => {
                let rowClass = '';
                if (index === 0) rowClass = 'top-leader';

                return `
                                <tr class="${rowClass}">
                                        <td>${index + 1}</td>
                                        <td class="name-cell">${entry.name}</td>
                                        <td>${entry.score}/${entry.total}</td>
                                        <td>${entry.time}</td>
                                        <td>${entry.date}</td>
                                </tr>
                                `;
            }).join('');
        }
    }
}

function listenToLeaderboard(subject = 'physics2') {
    if (!db) {
        console.error('❌ Firebase غير متصل');

        const leaderboard = JSON.parse(localStorage.getItem('challengeLeaderboard')) || [];
        updateLeaderboardUI(leaderboard);
        return;
    }

    console.log('🔄 جاري الاتصال بـ Firebase...');

    const collectionName = `leaderboard_${subject}`;
    db.collection(collectionName)
        .limit(100)
        .onSnapshot((snapshot) => {
            console.log('✅ تم جلب البيانات:', snapshot.size, 'سجل');
            let leaderboard = [];
            snapshot.forEach(doc => {
                leaderboard.push(doc.data());
            });

            leaderboard.sort((a, b) => {
                if (b.score !== a.score) return b.score - a.score;
                return a.timeSeconds - b.timeSeconds;
            });

            leaderboard = leaderboard.slice(0, 50);
            updateLeaderboardUI(leaderboard);
        }, (error) => {
            console.error('❌ خطأ في الاستماع للتحديثات:', error);

            const leaderboard = JSON.parse(localStorage.getItem('challengeLeaderboard')) || [];
            updateLeaderboardUI(leaderboard);
        });
}

async function cleanSuspiciousResults() {
    if (!db) return;

    try {
        console.log('🧹 جاري البحث عن نتائج مشبوهة...');

        const subjects = ['physics2', 'english', 'it', 'electronics', 'math1', 'math0', 'history', 'law'];
        let totalDeleted = 0;

        for (const subject of subjects) {
            const collectionName = `leaderboard_${subject}`;
            try {
                const snapshot = await db.collection(collectionName).get();

                for (const doc of snapshot.docs) {
                    const data = doc.data();

                    if (data.score >= 14 && data.timeSeconds < 60) {
                        await db.collection(collectionName).doc(doc.id).delete();
                        console.log(`🗑️ تم حذف نتيجة مشبوهة من ${subject}:`, data.name, '- النتيجة:', data.score, '- الوقت:', data.timeSeconds, 'ثانية');
                        totalDeleted++;
                    }
                }
            } catch (error) {
                console.log(`⚠️ لا توجد بيانات في ${collectionName}`);
            }
        }

        if (totalDeleted > 0) {
            console.log(`✅ تم حذف ${totalDeleted} نتيجة مشبوهة`);
        } else {
            console.log('✅ لا توجد نتائج مشبوهة');
        }
    } catch (error) {
        console.error('خطأ في تنظيف النتائج المشبوهة:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {

    setTimeout(cleanSuspiciousResults, 2000);

    listenToLeaderboard();
});

let currentSelectedSubject = 'physics2';

function openSubjectChallenge(subject) {
    currentSelectedSubject = subject;

    const subjectSelect = document.getElementById('challengeSubject');
    if (subjectSelect) {
        subjectSelect.value = subject;
    }

    document.getElementById('challenge').scrollIntoView({ behavior: 'smooth' });
}

function openSubjectBank(subject) {
    currentSelectedSubject = subject;

    document.getElementById('exams').scrollIntoView({ behavior: 'smooth' });

    setTimeout(() => {
        const bankTabs = document.querySelectorAll('[data-bank-subject]');
        bankTabs.forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.bankSubject === subject) {
                tab.classList.add('active');
            }
        });

        displayBankQuestions(subject);
    }, 500);
}

function openSubjectLeaderboard(subject) {
    currentSelectedSubject = subject;

    document.getElementById('leaderboard').scrollIntoView({ behavior: 'smooth' });

    setTimeout(() => {
        displaySubjectLeaderboard(subject);
    }, 500);
}

async function displaySubjectLeaderboard(subject) {
    if (!db) {
        console.log('Firebase not available');
        return;
    }

    const subjectNames = {
        physics: 'فيزياء 1',
        physics2: 'فيزياء 2',
        math1: 'رياضة 1',
        math0: 'رياضة 0',
        it: 'IT',
        electronics: 'إلكترونيات',
        english: 'لغة إنجليزية'
    };

    try {

        const snapshot = await db.collection('leaderboard')
            .where('subject', '==', subject)
            .orderBy('score', 'desc')
            .limit(50)
            .get();

        let leaderboard = [];
        snapshot.forEach(doc => {
            leaderboard.push(doc.data());
        });

        leaderboard.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return a.timeSeconds - b.timeSeconds;
        });

        const leaderboardSection = document.getElementById('leaderboard');
        const titleElement = leaderboardSection?.querySelector('.section-title');
        if (titleElement) {
            titleElement.innerHTML = `<i class="fas fa-trophy"></i> متصدرين ${subjectNames[subject] || subject}`;
        }

        updateLeaderboardUI(leaderboard);

    } catch (error) {
        console.log('Error fetching subject leaderboard:', error);

        displayLeaderboard();
    }
}

function openSubjectBank(subject) {

    modalChallengeSubject = subject;

    const subjectNames = {
        physics: 'فيزياء 1',
        physics2: 'فيزياء 2',
        english: 'اللغة الإنجليزية',
        it: 'IT',
        electronics: 'إلكترونيات',
        math1: 'رياضة 1',
        math0: 'رياضة 0',
        'computing-history': 'تاريخ الحوسبة',
        'computer-laws': 'قوانين الحوسبة'
    };

    document.getElementById('modalSubjectTitle').innerHTML = `
        <i class="fas fa-book-open"></i>
        بنك أسئلة ${subjectNames[subject] || subject}
    `;

    resetModalChallenge();

    loadModalQuestions(subject);

    document.getElementById('subjectChallengeModal').classList.add('active');
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
        switchModalTab('questions');
    }, 100);
}

let modalChallengeSubject = 'physics2';
let modalChallengeQuestions = [];
let modalCurrentIndex = 0;
let modalAnswers = {};
let modalTimerInterval = null;
let modalTimeRemaining = 300;
let modalChallengerName = '';

const subjectNames = {
    physics: 'فيزياء 1',
    physics2: 'فيزياء 2',
    math1: 'رياضة 1',
    math0: 'رياضة 0',
    it: 'IT',
    electronics: 'إلكترونيات',
    english: 'لغة إنجليزية'
};

function openSubjectChallenge(subject) {
    modalChallengeSubject = subject;

    document.getElementById('modalSubjectTitle').innerHTML = `
        <i class="fas fa-bolt"></i>
        تحدي ${subjectNames[subject] || subject}
    `;

    resetModalChallenge();

    loadModalLeaderboard(subject);

    document.getElementById('subjectChallengeModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeSubjectModal() {

    if (modalTimerInterval) {
        clearInterval(modalTimerInterval);
        modalTimerInterval = null;
    }

    document.getElementById('subjectChallengeModal').classList.remove('active');
    document.body.style.overflow = 'auto';
}

function switchModalTab(tab) {
    const tabs = document.querySelectorAll('.modal-tab');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(t => t.classList.remove('active'));
    contents.forEach(c => c.classList.remove('active'));

    if (tab === 'challenge') {
        tabs[0].classList.add('active');
        document.getElementById('challengeTabContent').classList.add('active');
    } else if (tab === 'questions') {
        tabs[1].classList.add('active');
        document.getElementById('questionsTabContent').classList.add('active');
        loadModalQuestions(modalChallengeSubject);
    } else {
        tabs[2].classList.add('active');
        document.getElementById('leaderboardTabContent').classList.add('active');
        loadModalLeaderboard(modalChallengeSubject);
    }
}

function loadModalQuestions(subject) {
    const container = document.getElementById('modalQuestionsContainer');
    if (!container) return;

    container.innerHTML = '<div style="text-align: center; padding: 20px;"><i class="fas fa-spinner fa-spin"></i> جاري التحميل...</div>';

    const subjectQuestions = window[subject + 'Questions'] || [];

    if (subjectQuestions.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: rgba(255,255,255,0.6);">
                <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 15px; display: block;"></i>
                <p>لا توجد أسئلة متاحة لهذه المادة حالياً</p>
            </div>
        `;
        return;
    }

    let html = '<div class="questions-list" style="max-height: 400px; overflow-y: auto;">';
    subjectQuestions.forEach((q, i) => {
        html += `
            <div class="question-item" style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 10px; margin-bottom: 10px; border-right: 3px solid #38ef7d;">
                <div style="color: #38ef7d; font-weight: bold; margin-bottom: 8px;">س${i + 1}: ${q.question}</div>
                <div style="color: rgba(255,255,255,0.7); font-size: 0.9rem;">
                    ${q.options.map((opt, j) => `<div style="padding: 5px 0;">${['أ', 'ب', 'ج', 'د'][j]}. ${opt}</div>`).join('')}
                </div>
                <div style="color: #ffc107; margin-top: 8px; font-size: 0.85rem;">
                    <i class="fas fa-check-circle"></i> الإجابة: ${['أ', 'ب', 'ج', 'د'][q.correct]}
                </div>
            </div>
        `;
    });
    html += '</div>';
    html += `<div style="text-align: center; margin-top: 15px; color: rgba(255,255,255,0.5);">إجمالي الأسئلة: ${subjectQuestions.length}</div>`;

    container.innerHTML = html;
}

function resetModalChallenge() {
    document.getElementById('modalChallengeIntro').style.display = 'block';
    document.getElementById('modalChallengeContainer').style.display = 'none';
    document.getElementById('modalChallengeResult').style.display = 'none';
    document.getElementById('modalChallengerName').value = '';
    document.getElementById('modalTimerDisplay').textContent = '05:00';

    modalAnswers = {};
    modalCurrentIndex = 0;
    modalTimeRemaining = 300;

    if (modalTimerInterval) {
        clearInterval(modalTimerInterval);
        modalTimerInterval = null;
    }
}

function startModalChallenge() {
    const nameInput = document.getElementById('modalChallengerName');
    const rawName = nameInput.value.trim();

    if (!rawName) {
        alert('من فضلك أدخل اسمك للبدء!');
        nameInput.focus();
        return;
    }

    modalChallengerName = filterName(rawName);

    if (!modalChallengerName) {
        alert('⚠️ الاسم غير مقبول!\n\nيرجى استخدام اسم لائق.');
        nameInput.value = '';
        nameInput.focus();
        return;
    }

    // Auto-save name to user profile
    const userProfile = JSON.parse(localStorage.getItem('userProfile')) || initUserProfile();
    if (!userProfile.name || userProfile.name !== modalChallengerName) {
        userProfile.name = modalChallengerName;
        localStorage.setItem('userProfile', JSON.stringify(userProfile));

        // Update profile input if exists
        const profileNameInput = document.getElementById('profileNameInput');
        if (profileNameInput) {
            profileNameInput.value = modalChallengerName;
        }
    }

    modalChallengeQuestions = getRandomQuestions(15, modalChallengeSubject);
    modalCurrentIndex = 0;
    modalAnswers = {};
    modalTimeRemaining = 300;

    document.getElementById('modalChallengeIntro').style.display = 'none';
    document.getElementById('modalChallengeContainer').style.display = 'block';

    startModalTimer();

    showModalQuestion();
}

function startModalTimer() {
    const timerDisplay = document.getElementById('modalTimerDisplay');
    const timerDiv = document.getElementById('modalChallengeTimer');

    modalTimerInterval = setInterval(() => {
        modalTimeRemaining--;

        const minutes = Math.floor(modalTimeRemaining / 60);
        const seconds = modalTimeRemaining % 60;
        timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        if (modalTimeRemaining <= 60) {
            timerDiv.style.color = '#f5576c';
        }

        if (modalTimeRemaining <= 0) {
            clearInterval(modalTimerInterval);
            submitModalChallenge();
        }
    }, 1000);
}

function showModalQuestion() {
    const question = modalChallengeQuestions[modalCurrentIndex];

    document.getElementById('modalChallengeProgress').textContent = `${modalCurrentIndex + 1}/15`;
    document.getElementById('modalChallengeQuestion').innerHTML = `<span style="color: #38ef7d;">س${modalCurrentIndex + 1}:</span> ${question.question}`;

    const letters = ['أ', 'ب', 'ج', 'د'];
    document.getElementById('modalChallengeOptions').innerHTML = question.options.map((option, i) => `
        <div class="challenge-option ${modalAnswers[modalCurrentIndex] === i ? 'selected' : ''}" 
             onclick="selectModalOption(${i})"
             style="padding: 15px; background: ${modalAnswers[modalCurrentIndex] === i ? 'rgba(56, 239, 125, 0.2)' : 'rgba(255,255,255,0.05)'}; 
                    border: 1px solid ${modalAnswers[modalCurrentIndex] === i ? 'rgba(56, 239, 125, 0.5)' : 'rgba(255,255,255,0.1)'}; 
                    border-radius: 10px; margin-bottom: 10px; cursor: pointer; color: white; transition: all 0.3s ease;">
            <span style="display: inline-block; width: 25px; height: 25px; background: rgba(56, 239, 125, 0.2); 
                         border-radius: 50%; text-align: center; line-height: 25px; margin-left: 10px;">${letters[i]}</span>
            ${option}
        </div>
    `).join('');

    updateModalNav();
}

function selectModalOption(optionIndex) {
    modalAnswers[modalCurrentIndex] = optionIndex;

    const options = document.querySelectorAll('#modalChallengeOptions .challenge-option');
    options.forEach((opt, i) => {
        if (i === optionIndex) {
            opt.style.background = 'rgba(56, 239, 125, 0.2)';
            opt.style.borderColor = 'rgba(56, 239, 125, 0.5)';
        } else {
            opt.style.background = 'rgba(255,255,255,0.05)';
            opt.style.borderColor = 'rgba(255,255,255,0.1)';
        }
    });
}

function updateModalNav() {
    document.getElementById('modalPrevBtn').disabled = modalCurrentIndex === 0;

    if (modalCurrentIndex === modalChallengeQuestions.length - 1) {
        document.getElementById('modalNextBtn').style.display = 'none';
        document.getElementById('modalSubmitBtn').style.display = 'inline-flex';
    } else {
        document.getElementById('modalNextBtn').style.display = 'inline-flex';
        document.getElementById('modalSubmitBtn').style.display = 'none';
    }
}

function modalNextQuestion() {
    if (modalCurrentIndex < modalChallengeQuestions.length - 1) {
        modalCurrentIndex++;
        showModalQuestion();
    }
}

function modalPrevQuestion() {
    if (modalCurrentIndex > 0) {
        modalCurrentIndex--;
        showModalQuestion();
    }
}

function submitModalChallenge() {
    clearInterval(modalTimerInterval);

    let correctCount = 0;
    Object.keys(modalAnswers).forEach(index => {
        if (modalChallengeQuestions[index].correct === modalAnswers[index]) {
            correctCount++;
        }
    });

    const timeTaken = 300 - modalTimeRemaining;
    const minutes = Math.floor(timeTaken / 60);
    const seconds = timeTaken % 60;
    const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    // Get user profile for ID
    const userProfile = JSON.parse(localStorage.getItem('userProfile')) || initUserProfile();

    // Format date as DD/MM/YYYY
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;

    saveToLeaderboard({
        userId: userProfile.id,
        name: modalChallengerName,
        score: correctCount,
        total: 15,
        time: timeString,
        timeSeconds: timeTaken,
        subject: modalChallengeSubject,
        date: formattedDate
    });

    updateUserStats(correctCount);

    showModalResult(correctCount, timeString);
}

function showModalResult(score, time) {
    document.getElementById('modalChallengeContainer').style.display = 'none';
    document.getElementById('modalChallengeResult').style.display = 'block';

    // Calculate percentage
    const percentage = Math.round((score / 15) * 100);

    if (score >= 13) {
        document.getElementById('modalResultIcon').textContent = '🏆';
        document.getElementById('modalResultTitle').textContent = 'ممتاز! أنت بطل!';
    } else if (score >= 10) {
        document.getElementById('modalResultIcon').textContent = '🌟';
        document.getElementById('modalResultTitle').textContent = 'أحسنت! نتيجة رائعة!';
    } else if (score >= 7) {
        document.getElementById('modalResultIcon').textContent = '👍';
        document.getElementById('modalResultTitle').textContent = 'جيد! استمر في التحسن!';
    } else {
        document.getElementById('modalResultIcon').textContent = '💪';
        document.getElementById('modalResultTitle').textContent = 'حاول مرة أخرى!';
    }

    document.getElementById('modalFinalScore').textContent = `${score}/15 (${percentage}%)`;
    document.getElementById('modalFinalTime').textContent = time;

    loadModalLeaderboard(modalChallengeSubject);
}

function restartModalChallenge() {
    resetModalChallenge();
}

// Helper function to format time as mm:ss
function formatTime(seconds) {
    if (!seconds) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Helper function to format date as DD-MM-YYYY
function formatDate(dateString) {
    if (!dateString || dateString === '-') return '-';
    try {
        const date = new Date(dateString);
        // Check if date is valid
        if (isNaN(date.getTime())) return '-';

        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    } catch (e) {
        console.error('Error formatting date:', dateString, e);
        return '-';
    }
}

function renderMainLeaderboard(data, subject = 'all') {
    const container = document.getElementById('modalLeaderboardList');

    container.innerHTML = `
        <div style="text-align: center; padding: 40px; color: rgba(255,255,255,0.5);">
            <i class="fas fa-spinner fa-spin fa-2x"></i>
            <p style="margin-top: 15px;">جاري تحميل المتصدرين...</p>
        </div>
    `;
}

async function loadModalLeaderboard(subject) {
    const container = document.getElementById('modalLeaderboardList');

    container.innerHTML = `
        <div style="text-align: center; padding: 40px; color: rgba(255,255,255,0.5);">
            <i class="fas fa-spinner fa-spin fa-2x"></i>
            <p style="margin-top: 15px;">جاري تحميل المتصدرين...</p>
        </div>
    `;

    if (!db) {
        container.innerHTML = '<div style="text-align: center; padding: 40px; color: rgba(255,255,255,0.5);">لا توجد بيانات</div>';
        return;
    }

    try {
        const collectionName = `leaderboard_${subject}`;
        const snapshot = await db.collection(collectionName)
            .orderBy('score', 'desc')
            .limit(20)
            .get();

        let leaderboard = [];
        snapshot.forEach(doc => {
            leaderboard.push(doc.data());
        });

        leaderboard.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return a.timeSeconds - b.timeSeconds;
        });

        if (leaderboard.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: rgba(255,255,255,0.5);">
                    <i class="fas fa-trophy fa-3x" style="margin-bottom: 15px; opacity: 0.3;"></i>
                    <p>لا يوجد متصدرين بعد</p>
                    <p style="font-size: 0.9rem;">كن أول من يتحدى!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = leaderboard.map((entry, index) => {
            let rankClass = 'normal';
            if (index === 0) rankClass = 'gold';
            else if (index === 1) rankClass = 'silver';
            else if (index === 2) rankClass = 'bronze';

            return `
                <div class="modal-leaderboard-item">
                    <div class="rank ${rankClass}">${index + 1}</div>
                    <div class="info">
                        <div class="name">${entry.name}</div>
                        <div class="time"><i class="fas fa-clock"></i> ${entry.time}</div>
                    </div>
                    <div class="score">${entry.score}/15</div>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.log('Error loading modal leaderboard:', error);
        container.innerHTML = '<div style="text-align: center; padding: 40px; color: rgba(255,255,255,0.5);">خطأ في تحميل البيانات</div>';
    }
}

// ============================================
// UNIFIED LEADERBOARD TABS
// ============================================

const leaderboardSubjectInfo = {
    'all': { name: 'الإجمالي', icon: 'fa-star', desc: 'مجموع النقاط من جميع المواد' },
    'physics2': { name: 'فيزياء 2', icon: 'fa-atom', desc: 'Physics 2' },
    'english': { name: 'لغة إنجليزية', icon: 'fa-language', desc: 'English' },
    'it': { name: 'IT', icon: 'fa-laptop-code', desc: 'Information Technology' },
    'electronics': { name: 'إلكترونيات', icon: 'fa-microchip', desc: 'Electronics' },
    'math1': { name: 'رياضة 1', icon: 'fa-calculator', desc: 'Mathematics 1' },
    'math0': { name: 'رياضة 0', icon: 'fa-square-root-alt', desc: 'Mathematics 0' },
    'history': { name: 'تاريخ الحوسبة', icon: 'fa-history', desc: 'Computing History' },
    'law': { name: 'قوانين الحاسب', icon: 'fa-gavel', desc: 'Computer Law' }
};

let currentLeaderboardSubject = 'all';

function switchLeaderboardTab(subject) {
    currentLeaderboardSubject = subject;

    // Update active tab
    document.querySelectorAll('.lb-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.subject === subject) {
            tab.classList.add('active');
        }
    });

    // Update title
    const titleEl = document.getElementById('currentSubjectTitle');
    if (titleEl && leaderboardSubjectInfo[subject]) {
        const info = leaderboardSubjectInfo[subject];
        titleEl.innerHTML = `<i class="fas ${info.icon}"></i> ${info.name} - ${info.desc}`;
    }

    // Load leaderboard data
    loadUnifiedLeaderboard(subject);
}

async function loadUnifiedLeaderboard(subject) {
    console.log('Loading leaderboard for:', subject);

    const tbody = document.getElementById('mainLeaderboardBody');
    const noRecords = document.getElementById('noRecordsMain');

    if (!tbody) {
        console.error('mainLeaderboardBody element not found');
        return;
    }

    // Check if Firebase is available
    if (!dbLeaderboard) {
        console.error('dbLeaderboard is not initialized');
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px; color: #ffc107;">⚠️ قاعدة البيانات غير متصلة</td></tr>';
        return;
    }

    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px;"><i class="fas fa-spinner fa-spin"></i> جاري التحميل...</td></tr>';
    if (noRecords) noRecords.style.display = 'none';

    try {
        let entries = [];
        
        // List of all subjects
        const allSubjects = ['physics2', 'english', 'it', 'electronics', 'math1', 'math0', 'history', 'law'];

        if (subject === 'all') {
            // Load from ALL per-subject collections and aggregate by user
            const userTotals = {};
            
            for (const subj of allSubjects) {
                try {
                    const snapshot = await dbLeaderboard.collection(`leaderboard_${subj}`).get();
                    snapshot.forEach(doc => {
                        const data = doc.data();
                        const userId = data.userId || data.name || 'مجهول';
                        const userName = data.name || 'مجهول';

                        if (!userTotals[userId]) {
                            userTotals[userId] = {
                                userId: userId,
                                name: userName,
                                totalScore: 0,
                                attempts: 0,
                                lastDate: ''
                            };
                        }
                        userTotals[userId].totalScore += (data.score || 0);
                        userTotals[userId].attempts += 1;
                        if (!userTotals[userId].lastDate || data.date > userTotals[userId].lastDate) {
                            userTotals[userId].lastDate = data.date || '';
                        }
                    });
                } catch (err) {
                    console.log(`No data for ${subj}:`, err.message);
                }
            }

            entries = Object.values(userTotals)
                .sort((a, b) => b.totalScore - a.totalScore)
                .slice(0, 50)
                .map(u => ({
                    name: u.name,
                    score: u.totalScore,
                    time: u.attempts === 1 ? 'تحدي واحد' : `${u.attempts} تحديات`,
                    date: u.lastDate
                }));
        } else {
            // Load from the specific subject collection
            const collectionName = `leaderboard_${subject}`;
            const snapshot = await dbLeaderboard.collection(collectionName)
                .orderBy('score', 'desc')
                .limit(50)
                .get();

            snapshot.forEach(doc => {
                const data = doc.data();
                entries.push({
                    name: data.name || 'مجهول',
                    score: data.score || 0,
                    time: formatTime(data.time || data.timeSeconds || 0),
                    timeSeconds: data.time || data.timeSeconds || 0,
                    date: data.date || '',
                    total: 15
                });
            });

            // Sort by score then by time
            entries.sort((a, b) => {
                if (b.score !== a.score) return b.score - a.score;
                return (a.timeSeconds || 999999) - (b.timeSeconds || 999999);
            });
        }

        if (entries.length === 0) {
            tbody.innerHTML = '';
            if (noRecords) noRecords.style.display = 'block';
            return;
        }

        if (noRecords) noRecords.style.display = 'none';

        tbody.innerHTML = entries.map((entry, index) => {
            let rankDisplay = index + 1;
            let rankClass = '';
            if (index === 0) { rankDisplay = '🥇'; rankClass = 'gold'; }
            else if (index === 1) { rankDisplay = '🥈'; rankClass = 'silver'; }
            else if (index === 2) { rankDisplay = '🥉'; rankClass = 'bronze'; }

            // Calculate percentage for individual subjects (not for 'all')
            let scoreValue = entry.score || 0;
            if (subject !== 'all' && entry.total) {
                const percentage = Math.round((entry.score / entry.total) * 100);
                scoreValue = `${entry.score}/${entry.total} (${percentage}%)`;
            }

            // Show challenge count for 'all', time for individual subjects
            let timeValue = entry.time || '-';
            if (subject !== 'all' && !entry.time) {
                timeValue = '00:00';
            }

            // Format time and date with LTR wrappers
            const timeFormatted = `<span dir="ltr" style="direction: ltr !important;">${timeValue}</span>`;
            const dateFormatted = `<span dir="ltr" style="direction: ltr !important;">${entry.date ? formatDate(entry.date) : '-'}</span>`;
            const scoreFormatted = `<span dir="ltr" style="direction: ltr !important;">${scoreValue}</span>`;


            return `
                <tr class="${rankClass}">
                    <td>${rankDisplay}</td>
                    <td>${entry.name || entry.userName || 'مجهول'}</td>
                    <td>${scoreFormatted}</td>
                    <td>${timeFormatted}</td>
                    <td>${dateFormatted}</td>
                </tr>
            `;
        }).join('');

    } catch (error) {
        console.error('Error loading unified leaderboard:', error);
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px; color: #ff6b6b;">خطأ في تحميل البيانات</td></tr>';
    }
}

// Load default leaderboard on page load
document.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById('leaderboardTabs')) {
        loadUnifiedLeaderboard('all');
    }
});
