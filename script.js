// ==========================================
// User Profile & Theme System - نظام المستخدم والثيم
// ==========================================

// توليد رقم مميز للمستخدم
function generateUserId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = '';
    for (let i = 0; i < 8; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}

// تهيئة بيانات المستخدم
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
            theme: 'default',
            createdAt: new Date().toISOString(),
            lastVisit: new Date().toISOString()
        };
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
    } else {
        // تحديث عدد الزيارات
        userProfile.visits = (userProfile.visits || 0) + 1;
        userProfile.lastVisit = new Date().toISOString();
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
    }

    // تطبيق الثيم المحفوظ
    if (userProfile.theme === 'space') {
        document.body.classList.add('space-theme');
    }

    // عرض رسالة الترحيب
    displayWelcomeGreeting(userProfile);

    return userProfile;
}

// عرض رسالة ترحيب
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

// فتح مودال البروفايل
function openUserProfile() {
    const userProfile = JSON.parse(localStorage.getItem('userProfile')) || initUserProfile();

    // عرض الاسم مع اللقب إن وجد
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

// إغلاق مودال البروفايل
function closeUserProfile() {
    document.getElementById('userProfileModal').classList.remove('active');
}

// توليد لقب/دلع بالذكاء الاصطناعي
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

// حفظ بيانات البروفايل
async function saveUserProfile() {
    const userProfile = JSON.parse(localStorage.getItem('userProfile')) || initUserProfile();
    const newName = document.getElementById('profileNameInput').value.trim();

    if (newName) {
        // عرض رسالة انتظار
        const saveBtn = document.querySelector('.profile-btn.save-btn');
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> حفظ ومزامنة...';
        saveBtn.disabled = true;

        // توليد لقب بالذكاء الاصطناعي
        const nickname = await generateNickname(newName);

        userProfile.name = newName;
        userProfile.nickname = nickname || '';
        localStorage.setItem('userProfile', JSON.stringify(userProfile));

        // مزامنة مع Firebase (بدون الثيم)
        if (dbLeaderboard) {
            try {
                // ننسخ البيانات ونشيل منها الثيم قبل الرفع
                const profileToSync = { ...userProfile };
                delete profileToSync.theme; // لا نحفظ الثيم أونلاين

                await dbLeaderboard.collection('users').doc(userProfile.id).set(profileToSync, { merge: true });
                console.log('✅ تم مزامنة البروفايل مع Firebase');
            } catch (error) {
                console.error('فشل المزامنة:', error);
            }
        }

        // عرض الاسم مع اللقب
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

// استرجاع بروفايل موجود
async function restoreProfile() {
    const idInput = prompt("أدخل كود المعرف (User ID) الخاص بك لاسترجاع بياناتك:");
    if (!idInput) return;

    const userId = idInput.trim().toUpperCase();

    if (dbLeaderboard) {
        try {
            const doc = await dbLeaderboard.collection('users').doc(userId).get();
            if (doc.exists) {
                const data = doc.data();
                // دمج البيانات المسترجعة مع البيانات المحلية (مع الحفاظ على الثيم المحلي)
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

// تحديث إحصائيات المستخدم بعد التحدي
async function updateUserStats(score) {
    const userProfile = JSON.parse(localStorage.getItem('userProfile')) || initUserProfile();

    userProfile.totalChallenges = (userProfile.totalChallenges || 0) + 1;
    userProfile.totalCorrect = (userProfile.totalCorrect || 0) + score;

    if (score > (userProfile.bestScore || 0)) {
        userProfile.bestScore = score;
    }

    localStorage.setItem('userProfile', JSON.stringify(userProfile));

    // مزامنة الإحصائيات مع Firebase
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

// تبديل الثيم الفضائي
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

// زر الصاروخ للتنقل
let scrollGoingDown = true;

function toggleScrollDirection() {
    const scrollRocket = document.getElementById('scrollRocket');

    if (scrollGoingDown) {
        // انزل لآخر الصفحة
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
        });
    } else {
        // اطلع لأول الصفحة
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}

// تحديث اتجاه الصاروخ بناءً على الموقع
window.addEventListener('scroll', () => {
    const scrollRocket = document.getElementById('scrollRocket');
    if (!scrollRocket) return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;

    if (scrollTop > scrollHeight / 2) {
        // لو في النص الأسفل، الصاروخ بيطلع
        scrollRocket.classList.remove('going-down');
        scrollGoingDown = false;
    } else {
        // لو في النص الأعلى، الصاروخ بينزل
        scrollRocket.classList.add('going-down');
        scrollGoingDown = true;
    }
});

// الحصول على اسم المستخدم المحفوظ
function getSavedUserName() {
    const userProfile = JSON.parse(localStorage.getItem('userProfile'));
    return userProfile?.name || '';
}

// فتح/إغلاق قائمة الثيمات
function toggleThemeMenu() {
    const menu = document.getElementById('themeMenu');
    menu.classList.toggle('active');
}

// إغلاق المنيو لو ضغط برا
document.addEventListener('click', (e) => {
    const menu = document.getElementById('themeMenu');
    const toggle = document.querySelector('.theme-toggle');
    if (menu && !menu.contains(e.target) && !toggle.contains(e.target)) {
        menu.classList.remove('active');
    }
});

// تعيين الثيم
function setTheme(theme) {
    const body = document.body;
    const userProfile = JSON.parse(localStorage.getItem('userProfile')) || {};

    // إزالة كل الثيمات
    body.classList.remove('space-theme', 'ocean-theme', 'sunset-theme', 'pyramids-theme', 'winter-theme');

    // إضافة الثيم الجديد
    if (theme !== 'default') {
        body.classList.add(theme + '-theme');
    }

    // تحديث الأزرار
    document.querySelectorAll('.theme-option').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.theme === theme) {
            btn.classList.add('active');
        }
    });

    // حفظ الثيم
    userProfile.theme = theme;
    localStorage.setItem('userProfile', JSON.stringify(userProfile));

    // إغلاق المنيو
    document.getElementById('themeMenu').classList.remove('active');

    // تحديث أيقونة الزر
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

// تحميل الثيم المحفوظ
function loadSavedTheme() {
    const userProfile = JSON.parse(localStorage.getItem('userProfile'));
    if (userProfile?.theme && userProfile.theme !== 'default') {
        setTheme(userProfile.theme);
    }
}

// تهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function () {
    initUserProfile();
});

// ==========================================
// رفع الأسئلة وتخزينها محليًا
// ==========================================
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
                    // حفظ في localStorage (أو يمكن استخدام IndexedDB)
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
// ==========================================
// Configuration - Groq API
// ==========================================
const API_CONFIG = {
    apiKey: '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',
    apiUrl: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'llama-3.3-70b-versatile'
};

// Gemini API for Vision (Images)
const GEMINI_CONFIG = {
    apiKey: 'AIzaSyAErOl-9MrM_A-HLRxvxFqx5b6WJWwi2Zs',
    apiUrl: 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent'
};

// ==========================================
// Firebase Configuration - Two Databases
// ==========================================

// Database 1: للـ Leaderboard والتحديات
const firebaseConfig1 = {
    apiKey: "AIzaSyCFhUdOI9IqFCjBkg8zytanD5O1_67vCr4",
    authDomain: "manasa-ceaa2.firebaseapp.com",
    projectId: "manasa-ceaa2",
    storageBucket: "manasa-ceaa2.firebasestorage.app",
    messagingSenderId: "847284305108",
    appId: "1:847284305108:web:7a14698f76b3981c6acf41",
    measurementId: "G-CYX6QKJZSR"
};

// Database 2: للـ Analytics وتتبع الزوار
const firebaseConfig2 = {
    apiKey: "AIzaSyAdIW3mf2yv9KWzEVTgb62Yquu8oHMWj7g",
    authDomain: "manasa-2.firebaseapp.com",
    projectId: "manasa-2",
    storageBucket: "manasa-2.firebasestorage.app",
    messagingSenderId: "713731774832",
    appId: "1:713731774832:web:bd33be9764c350b62997b5",
    measurementId: "G-LHVFYC2GQH"
};

// Initialize Both Firebase Apps
let db1, db2;
let dbLeaderboard, dbAnalytics;
try {
    // Primary app for Leaderboard
    const app1 = firebase.initializeApp(firebaseConfig1, 'leaderboard-app');
    db1 = firebase.firestore(app1);
    dbLeaderboard = db1;
    console.log('✅ Firebase Leaderboard DB initialized successfully');

    // Secondary app for Analytics
    const app2 = firebase.initializeApp(firebaseConfig2, 'analytics-app');
    db2 = firebase.firestore(app2);
    dbAnalytics = db2;
    console.log('✅ Firebase Analytics DB initialized successfully');
} catch (error) {
    console.error('❌ Firebase initialization error:', error);
}

// Backward compatibility - db points to leaderboard database
let db = dbLeaderboard;

// ==========================================
// Visitor Analytics Tracking - تتبع الزوار (Using Database 2)
// ==========================================
async function trackVisitor() {
    try {
        // Get visitor's location from IP (using HTTPS API)
        const geoResponse = await fetch('https://ipapi.co/json/');
        const geoData = await geoResponse.json();

        if (geoData.error) {
            console.log('Could not get location data');
            return;
        }

        const visitorData = {
            ip: geoData.ip,
            country: geoData.country_name,
            countryCode: geoData.country_code,
            city: geoData.city,
            page: window.location.pathname || '/',
            userAgent: navigator.userAgent,
            isMobile: /Mobile|Android|iPhone|iPad/i.test(navigator.userAgent),
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            date: new Date().toISOString().split('T')[0]
        };

        // Check if this is a unique visitor today
        const today = new Date().toISOString().split('T')[0];
        const visitorId = `${geoData.ip}_${today}`;

        // Save visit to Firebase Analytics Database (Database 2)
        if (dbAnalytics) {
            // Add to visits collection
            await dbAnalytics.collection('analytics_visits').add(visitorData);

            // Update daily stats
            const statsRef = dbAnalytics.collection('analytics_stats').doc(today);
            const statsDoc = await statsRef.get();

            if (statsDoc.exists) {
                await statsRef.update({
                    totalViews: firebase.firestore.FieldValue.increment(1),
                    lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
                });

                // Check if unique visitor
                const existingVisitor = await dbAnalytics.collection('analytics_visits')
                    .where('ip', '==', geoData.ip)
                    .where('date', '==', today)
                    .limit(2)
                    .get();

                if (existingVisitor.size <= 1) {
                    await statsRef.update({
                        uniqueVisitors: firebase.firestore.FieldValue.increment(1)
                    });
                }
            } else {
                await statsRef.set({
                    date: today,
                    totalViews: 1,
                    uniqueVisitors: 1,
                    lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
                });
            }

            console.log('✅ Visitor tracked successfully (Database 2)');
        }
    } catch (error) {
        console.log('Analytics tracking error:', error);
    }
}

// Track visitor when page loads
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(trackVisitor, 1000);
    // طلب الموقع الدقيق بعد 3 ثواني
    setTimeout(requestPreciseLocation, 3000);
});

// ==========================================
// طلب الموقع الدقيق من المستخدم (GPS)
// ==========================================
async function requestPreciseLocation() {
    // تحقق من دعم الـ Geolocation
    if (!navigator.geolocation) {
        console.log('المتصفح لا يدعم تحديد الموقع');
        return;
    }

    // طلب الموقع
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            // نجاح - المستخدم وافق
            const locationData = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                date: new Date().toISOString().split('T')[0],
                userAgent: navigator.userAgent,
                page: window.location.pathname || '/'
            };

            // حفظ في Firebase
            if (dbAnalytics) {
                try {
                    await dbAnalytics.collection('visitor_locations').add(locationData);
                    console.log('✅ تم حفظ الموقع الدقيق بنجاح');
                } catch (error) {
                    console.log('خطأ في حفظ الموقع:', error);
                }
            }
        },
        (error) => {
            // فشل أو رفض المستخدم
            console.log('لم يتم الحصول على الموقع:', error.message);
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 دقائق
        }
    );
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

// تحليل الصورة بالـ AI (باستخدام Google Gemini)
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
    electronics: [],
    english: [
        // ========== Section 1: Reading Comprehension (Q1-30) ==========
        // Unit 1: The Ice Hotel (Q1-10)
        { question: "Where is the Ice Hotel located?", options: ["Quebec, Canada", "Alaska, USA", "Norway", "Switzerland"], correct: 0 },
        { question: "Why can you only check into the Ice Hotel during winter?", options: ["Because it is made entirely of ice and snow", "Because it is too expensive in summer", "Because the owners go on vacation", "Because there are no flights in summer"], correct: 0 },
        { question: "What is NOT made of ice in the Ice Hotel?", options: ["Winter coats", "Furniture", "Drinking glasses", "Art in the gallery"], correct: 0 },
        { question: "What temperature is it inside the Ice Hotel?", options: ["-2 to -5°C", "20-25°C", "0-5°C", "-10 to -15°C"], correct: 0 },
        { question: "What helps guests sleep warmly in the cold rooms?", options: ["Special sleeping bags and fur blankets", "Electric heaters", "Hot water bottles", "Thick pajamas"], correct: 0 },
        { question: "What does the idiom 'be into' mean as used in the reading?", options: ["To enjoy doing something", "To be inside something", "To be interested in learning", "To be part of a group"], correct: 0 },
        { question: "What does the word 'unique' mean in the context of the Ice Hotel?", options: ["One of a kind", "Very cold", "Expensive", "Temporary"], correct: 0 },
        { question: "True or False: The Ice Hotel has a church where people can get married.", options: ["True", "False"], correct: 0 },
        { question: "What facilities does the Ice Hotel have?", options: ["Movie theater, art gallery, and church", "Only bedrooms", "Bedrooms and a restaurant", "Bedrooms, restaurant, and swimming pool"], correct: 0 },
        { question: "What material are the drinking glasses made of at the Ice Hotel?", options: ["Ice", "Glass", "Plastic", "Crystal"], correct: 0 },
        // Unit 2: Food Firsts (Q11-20)
        { question: "According to the passage, where did curry really come from?", options: ["England", "India", "Persia", "Thailand"], correct: 0 },
        { question: "When was the word 'curry' first found in an English cookbook?", options: ["1377", "1600", "1891", "500"], correct: 0 },
        { question: "Where was pizza probably first made?", options: ["Persia (Iran)", "Italy", "United States", "Greece"], correct: 0 },
        { question: "When were Persians eating round, flat bread with cheese?", options: ["500s", "1300s", "1800s", "1900s"], correct: 0 },
        { question: "Who created the first hamburger?", options: ["A German named Otto Kuasw", "An American chef", "English sailors", "Persian cooks"], correct: 0 },
        { question: "Who introduced hamburgers to Americans?", options: ["German sailors", "Italian immigrants", "English colonists", "Persian traders"], correct: 0 },
        { question: "What does the idiom 'find out' mean in the passage?", options: ["To learn or discover", "To search for something", "To understand completely", "To ask about something"], correct: 0 },
        { question: "What does 'catch on' mean in the context of pizza?", options: ["To become popular", "To be caught by someone", "To be understood", "To be made quickly"], correct: 0 },
        { question: "True or False: Wealthy English people were eating dishes with curry in the 1377.", options: ["True", "False"], correct: 0 },
        { question: "Which city in Italy is famous for pizza?", options: ["Naples", "Rome", "Milan", "Venice"], correct: 0 },
        // Unit 3: Hurricane Who? (Q21-30)
        { question: "What are tropical cyclones called in Asia?", options: ["Typhoons", "Hurricanes", "Cyclones", "Storms"], correct: 0 },
        { question: "What is the minimum wind speed for these storms?", options: ["60 kph", "30 kph", "100 kph", "120 kph"], correct: 0 },
        { question: "Which organization decides hurricane names?", options: ["World Meteorological Organization (WMO)", "United Nations", "National Weather Service", "Tropical Prediction Center"], correct: 0 },
        { question: "Which letters are NOT used to start hurricane names?", options: ["Q, U, X, Y, Z", "A, E, I, O, U", "X, Y, Z", "Q, V, X"], correct: 0 },
        { question: "What type of names do Asian countries use for typhoons?", options: ["Names of flowers, animals, trees", "Only male names", "Only female names", "Names of cities"], correct: 0 },
        { question: "What does the idiom 'keep an eye out for' mean?", options: ["To watch for trouble or danger", "To look carefully", "To watch something interesting", "To protect something"], correct: 0 },
        { question: "What does 'meteorologist' mean?", options: ["A scientist who studies weather", "A storm chaser", "A weather reporter", "A disaster manager"], correct: 0 },
        { question: "True or False: Hurricanes always have female names.", options: ["False", "True"], correct: 0 },
        { question: "Where is the Tropical Prediction Center located?", options: ["Miami, Florida", "Washington D.C.", "New York City", "Los Angeles, California"], correct: 0 },
        { question: "How often are the lists of hurricane names recycled?", options: ["Every 6 years", "Every year", "Every 10 years", "Never"], correct: 0 },
        // ========== Section 2: Idioms & Expressions (Q31-50) ==========
        { question: "What does the idiom 'A-1' mean?", options: ["Excellent, superior", "First in order", "Average quality", "Quickly done"], correct: 0 },
        { question: "'ABC' in 'the ABC of cooking' means:", options: ["Fundamentals, basics", "Simple recipes", "Advanced techniques", "Alphabetical order"], correct: 0 },
        { question: "True or False: 'Above board' means something is done openly and honestly.", options: ["True", "False"], correct: 0 },
        { question: "'About-face' means to:", options: ["Turn in the opposite direction", "Face a problem", "Confront someone", "Accept a challenge"], correct: 0 },
        { question: "'About to' means:", options: ["Prepared, ready", "Near something", "Approximately", "Planning to"], correct: 0 },
        { question: "'Above all' means:", options: ["Especially, mainly", "Higher than everything", "More important", "First priority"], correct: 0 },
        { question: "True or False: 'According to Hoyle' means done incorrectly.", options: ["False", "True"], correct: 0 },
        { question: "'According to Hoyle' means:", options: ["Correct, proper", "According to rules", "Traditional way", "Officially approved"], correct: 0 },
        { question: "'After one's own heart' means:", options: ["With similar interests", "Loving someone", "Kind-hearted", "Close friend"], correct: 0 },
        { question: "'Against the grain' means:", options: ["Annoying, irritating", "Opposite direction", "Difficult to do", "Unnatural"], correct: 0 },
        { question: "'All along' means:", options: ["From the beginning", "All together", "For a long time", "Continuously"], correct: 0 },
        { question: "What does the idiom 'dig in' mean?", options: ["To begin eating with excitement", "To start digging", "To search for something", "To prepare food"], correct: 0 },
        { question: "What does 'play a role in' mean?", options: ["To have some part in", "To act in a play", "To be important", "To help someone"], correct: 0 },
        { question: "What does 'get rid of' mean?", options: ["To throw away; to put out of use", "To hide something", "To clean something", "To organize something"], correct: 0 },
        { question: "What does 'shut down' mean?", options: ["To stop", "To close a door", "To turn off lights", "To go to sleep"], correct: 0 },
        { question: "What does 'keep up with' mean?", options: ["To continue getting useful information", "To hold something", "To stay awake", "To remember something"], correct: 0 },
        { question: "What does 'check in' mean?", options: ["To go to the hotel's front desk and get the room key", "To look inside", "To examine something", "To arrive at a place"], correct: 0 },
        { question: "What does 'made of' mean?", options: ["Built or constructed from", "Created by", "Designed for", "To become something"], correct: 0 },
        { question: "What does 'be into' mean?", options: ["To enjoy doing", "To be inside something", "To be interested in learning", "To be part of a group"], correct: 0 },
        { question: "What does 'catch on' mean?", options: ["To become popular", "To catch something", "To understand something", "To hold onto something"], correct: 0 },
        // ========== Section 3: Writing & Structure (Q51-80) ==========
        { question: "What are the three parts of a paragraph?", options: ["Topic sentence, supporting sentences, concluding sentence", "Introduction, body, conclusion", "Thesis, examples, summary", "Beginning, middle, end"], correct: 0 },
        { question: "What is the purpose of a topic sentence?", options: ["To state the main idea of the paragraph", "To introduce the topic", "To provide examples", "To conclude the paragraph"], correct: 0 },
        { question: "What does 'unity' mean in paragraph writing?", options: ["The paragraph discusses one main idea only", "All sentences are the same length", "The paragraph has good vocabulary", "All sentences are connected"], correct: 0 },
        { question: "True or False: Coherence means that sentences should hold together logically.", options: ["True", "False"], correct: 0 },
        { question: "What are the three parts of an essay?", options: ["Introduction, body, conclusion", "Topic, development, ending", "Beginning, middle, end", "Thesis, arguments, summary"], correct: 0 },
        { question: "What is the purpose of an introduction in an essay?", options: ["To present the thesis statement", "To provide detailed examples", "To summarize the main points", "To ask questions"], correct: 0 },
        { question: "What is the purpose of the body paragraphs in an essay?", options: ["To develop and support the thesis", "To introduce new topics", "To conclude the essay", "To ask questions"], correct: 0 },
        { question: "What is the purpose of the conclusion in an essay?", options: ["To summarize the main points and restate the thesis", "To introduce new ideas", "To provide more examples", "To ask the reader questions"], correct: 0 },
        { question: "Which of these is a good topic sentence?", options: ["Dogs make excellent pets for three main reasons.", "Many people like dogs.", "I have a dog named Max.", "Dogs are animals."], correct: 0 },
        { question: "What is a thesis statement?", options: ["The main idea of an essay", "The first sentence of a paragraph", "A question at the end of an essay", "The title of an essay"], correct: 0 },
        { question: "Which sentence is a good supporting sentence for 'Exercise has many health benefits.'?", options: ["Regular exercise can reduce the risk of heart disease.", "Some people don't like to exercise.", "I exercise every morning.", "Exercise is good."], correct: 0 },
        { question: "What is a good concluding sentence for a paragraph about the benefits of reading?", options: ["For these reasons, reading is a valuable activity for people of all ages.", "Reading is when you look at words.", "Some people prefer watching movies.", "I like to read mystery novels."], correct: 0 },
        { question: "What should you avoid in a paragraph to maintain unity?", options: ["Irrelevant sentences", "Long sentences", "Short sentences", "Complex vocabulary"], correct: 0 },
        { question: "Which transition word shows contrast?", options: ["However", "First", "Additionally", "For example"], correct: 0 },
        { question: "Which transition word adds information?", options: ["Furthermore", "Therefore", "Nevertheless", "In conclusion"], correct: 0 },
        { question: "Which transition word shows cause and effect?", options: ["As a result", "On the other hand", "For instance", "Similarly"], correct: 0 },
        { question: "Which transition word shows time order?", options: ["Meanwhile", "Consequently", "Likewise", "Specifically"], correct: 0 },
        { question: "Which sentence has a grammatical error?", options: ["They was happy to see their friends.", "The students are studying for the exam.", "She goes to school every day.", "I have two brothers and one sister."], correct: 0 },
        { question: "Which sentence is punctuated correctly?", options: ["I like apples, oranges, and bananas.", "I like apples oranges and bananas.", "I like apples, oranges and bananas.", "I like apples oranges, and bananas."], correct: 0 },
        { question: "Which sentence has correct subject-verb agreement?", options: ["The team is playing well.", "The team are playing well.", "The team were playing well.", "The team am playing well."], correct: 0 },
        { question: "Which sentence is in the passive voice?", options: ["The mouse was chased by the cat.", "The cat chased the mouse.", "The cat is chasing the mouse.", "The cat will chase the mouse."], correct: 0 },
        { question: "Which sentence is in the active voice?", options: ["The teacher graded the papers.", "The papers were graded by the teacher.", "The papers have been graded.", "The papers will be graded."], correct: 0 },
        { question: "Which sentence uses correct capitalization?", options: ["I went to Paris last summer.", "i went to paris last summer.", "I went to paris last Summer.", "i went to Paris last summer."], correct: 0 },
        { question: "Which sentence has correct comma usage?", options: ["Although it was raining, we went for a walk.", "Although it was raining we went for a walk.", "Although, it was raining we went for a walk.", "Although it was raining we went, for a walk."], correct: 0 },
        { question: "Which sentence has correct apostrophe usage?", options: ["The dog's bowl is empty.", "The dogs bowl is empty.", "The dogs' bowl is empty.", "The dogs's bowl is empty."], correct: 0 },
        { question: "Which sentence uses correct verb tense?", options: ["Yesterday, I went to the store.", "Yesterday, I go to the store.", "Yesterday, I will go to the store.", "Yesterday, I going to the store."], correct: 0 },
        { question: "Which sentence has correct pronoun usage?", options: ["My friend and I went to the movies.", "Me and my friend went to the movies.", "I and my friend went to the movies.", "My friend and me went to the movies."], correct: 0 },
        { question: "Which sentence is a compound sentence?", options: ["The dog barked, and the cat ran away.", "The dog barked.", "The barking dog scared the cat.", "Because the dog barked, the cat ran away."], correct: 0 },
        { question: "Which sentence is a complex sentence?", options: ["Although I like pizza, I prefer pasta.", "I like pizza and pasta.", "I like pizza; I also like pasta.", "I like pizza, but I prefer pasta."], correct: 0 },
        { question: "Which sentence has correct parallel structure?", options: ["I like swimming, running, and biking.", "I like swimming, to run, and biking.", "I like to swim, running, and to bike.", "I like swimming, run, and biking."], correct: 0 },
        // ========== Section 4: TOEFL Structure Skills (Q81-100) ==========
        { question: "Which sentence is correct?", options: ["The students are studying for the exam.", "The students is studying for the exam.", "The students am studying for the exam.", "The students was studying for the exam."], correct: 0 },
        { question: "Identify the error: 'Each of the boys have their own book.'", options: ["have", "Each of", "the boys", "their own book"], correct: 0 },
        { question: "Which is the correct connector? 'I want to go to the movies, ______ I don't have enough money.'", options: ["but", "and", "so", "or"], correct: 0 },
        { question: "True or False: In the sentence 'The book on the table is mine,' 'on the table' is the subject.", options: ["False", "True"], correct: 0 },
        { question: "Which sentence has correct subject-verb agreement?", options: ["The group of students is going on a trip.", "The group of students are going on a trip.", "The groups of students is going on a trip.", "The group of students were going on a trip."], correct: 0 },
        { question: "Identify the error: 'The data shows that smoking is harmful to health.'", options: ["shows", "that", "smoking", "harmful"], correct: 0 },
        { question: "Which sentence has the correct word order?", options: ["I have never seen such a beautiful sunset.", "Never I have seen such a beautiful sunset.", "I never have seen such a beautiful sunset.", "I have seen never such a beautiful sunset."], correct: 0 },
        { question: "Identify the error: 'If I was you, I would study harder.'", options: ["was", "you", "would", "study"], correct: 0 },
        { question: "Which sentence uses the correct preposition?", options: ["I'm good at math.", "I'm good in math.", "I'm good with math.", "I'm good on math."], correct: 0 },
        { question: "Identify the error: 'She don't like coffee.'", options: ["don't", "like", "coffee"], correct: 0 },
        { question: "Which sentence is correct?", options: ["He speaks English well.", "He speaks English good.", "He speaks English goodly.", "He speaks English best."], correct: 0 },
        { question: "Identify the error: 'Between you and I, this is a bad idea.'", options: ["I", "this", "is", "bad idea"], correct: 0 },
        { question: "Which sentence uses the correct comparative form?", options: ["This book is more interesting than that one.", "This book is interestinger than that one.", "This book is interesting than that one.", "This book is more interesting as that one."], correct: 0 },
        { question: "Identify the error: 'I look forward to meet you.'", options: ["meet", "you"], correct: 0 },
        { question: "Which sentence has the correct article usage?", options: ["He is a doctor.", "He is doctor.", "He is the doctor.", "He is an doctor."], correct: 0 },
        { question: "Identify the error: 'The childrens are playing in the park.'", options: ["childrens", "are", "playing", "in the park"], correct: 0 },
        { question: "Which sentence uses the correct tense?", options: ["I have lived here since 2010.", "I live here since 2010.", "I am living here since 2010.", "I was living here since 2010."], correct: 0 },
        { question: "Identify the error: 'She asked me where do I live.'", options: ["do I live", "asked", "me", "where"], correct: 0 },
        { question: "Which sentence has correct parallel structure?", options: ["She likes reading, swimming, and hiking.", "She likes reading, to swim, and hiking.", "She likes to read, swimming, and to hike.", "She likes reading, swim, and hiking."], correct: 0 },
        { question: "Identify the error: 'The reason is because I was tired.'", options: ["because", "I was", "tired"], correct: 0 },
        // ========== Section 5: Additional Questions (Q101-148) ==========
        { question: "The man owns three hotels. He is very ______.", options: ["wealthy", "comfortable", "tired", "unique"], correct: 0 },
        { question: "People think snakes are dangerous, ______ most snakes are not.", options: ["Surprisingly", "Unusually", "Finally", "First"], correct: 0 },
        { question: "He knows ______ all of his relatives' birthdays, except for his aunt and uncle's.", options: ["nearly", "in reality", "before", "behind"], correct: 0 },
        { question: "______ my mother, washing clothes by hand is better than using a washing machine.", options: ["According to", "Before", "After", "In reality"], correct: 0 },
        { question: "This soup does not ______ right. Did you forget to put in onions?", options: ["taste", "cook", "make", "create"], correct: 0 },
        { question: "I do not have enough ______ to make this dish.", options: ["spices", "fur", "hamburgers", "stories"], correct: 0 },
        { question: "We ______ how the magician did the amazing trick.", options: ["found out", "created", "introduced", "thought"], correct: 0 },
        { question: "The teacher decides her students' grades ______ their test scores and homework.", options: ["according to", "creating", "deciding", "naming"], correct: 0 },
        { question: "He often uses the Internet to get ______.", options: ["information", "danger", "taste", "people"], correct: 0 },
        { question: "My house is very small. Surprisingly it does not ______ a bathroom.", options: ["include", "keep up", "catch on", "list"], correct: 0 },
        { question: "We named our dog George. Then we found out she was a ______ dog!", options: ["female", "possible", "easy", "freezing"], correct: 0 },
        { question: "______ countries like Singapore are hot all the time.", options: ["Tropical", "Fantastic", "Male", "International"], correct: 0 },
        { question: "This street is very busy. You should ______ for cars when you walk across it.", options: ["watch out", "keep up with", "find out", "check in"], correct: 0 },
        { question: "Hurricanes usually ______ in summer.", options: ["occur", "go around", "make", "detect"], correct: 0 },
        { question: "What is the main idea of the reading about the Ice Hotel?", options: ["What makes the Ice Hotel special", "How the Ice Hotel is built", "Why the Ice Hotel is made of Ice", "The services of the Ice Hotel"], correct: 0 },
        { question: "What can you do in the Ice Hotel?", options: ["All of the above", "Watch a movie", "Get married", "Eat an interesting meal"], correct: 0 },
        { question: "Why is sleeping NOT a problem at the Ice Hotel?", options: ["The sleeping bags are warm", "The rooms are warm", "The temperature is -2°C", "The furniture is warm"], correct: 0 },
        { question: "In which part of the Ice Hotel would you probably find the ice plates?", options: ["The restaurant", "The church", "The rooms", "The art gallery"], correct: 0 },
        { question: "What do you think happens to the Ice Hotel in the spring?", options: ["It melts", "It freezes", "It stays open", "It moves"], correct: 0 },
        { question: "What is the main idea of the reading about butterflies in the stomach?", options: ["The cause of butterflies in the stomach", "A new kind of medicine called cortisol", "An illness that nervous people get", "The stress that actors have"], correct: 0 },
        { question: "According to the reading, what is NOT true about cortisol?", options: ["It is found in many kinds of food", "In small amounts, it benefits the body", "It can shut down the stomach", "It is produced by the body"], correct: 0 },
        { question: "What helps a body respond well to exercise?", options: ["Cortisol", "Butterflies", "Stomach acid", "Stress"], correct: 0 },
        { question: "According to the passage, what makes some people feel sick?", options: ["When the stomach shuts down", "When situations return to normal", "When the stomach works too fast", "When there is too little cortisol"], correct: 0 },
        { question: "Which may help a person get over butterflies in the stomach?", options: ["Doing the thing that makes him or her nervous", "Not talking while the butterflies are there", "Shutting down his or her stomach for some time", "Taking a small amount of cortisol"], correct: 0 },
        { question: "What is the main idea of the reading about hurricanes?", options: ["How tropical cyclones are named", "Why tropical cyclones are named", "What tropical cyclones can do", "Who watches for tropical cyclones"], correct: 0 },
        { question: "In which direction do tropical cyclones go around in the northern part of the planet?", options: ["The opposite direction of a clock", "Down", "The same direction as a clock", "Up"], correct: 0 },
        { question: "The fifth hurricane of 2015 might have the name ______.", options: ["Eric", "Diana", "Darren", "Connie"], correct: 0 },
        { question: "Which name would a hurricane NOT have?", options: ["Yanni", "Rita", "Veronica", "William"], correct: 0 },
        { question: "Why should tropical cyclones have names?", options: ["The names help people", "It sounds interesting", "The names are a code for the WMO", "It is traditional"], correct: 0 },
        { question: "What is the main idea of the 'Food Firsts' reading?", options: ["Some facts about foods are surprising", "Curry was created in England", "There are many foods that help your body", "People created fast food long ago"], correct: 0 },
        { question: "Which is probably true about British curry dishes in the 1400s?", options: ["The spices cost a lot", "The dishes did not have meat", "People ate curry on special days", "British sailors first made curry"], correct: 0 },
        { question: "What did people in Naples learn from Persians?", options: ["How to make flat bread", "How to make pizza", "How to cook cheese", "How to use spices from Iran"], correct: 0 },
        { question: "Who introduced hamburgers to America?", options: ["German sailors", "Persians", "Otto Klasov", "Italians"], correct: 0 },
        { question: "Which food was probably made first?", options: ["Cheesy Persian bread", "Hamburgers", "Italian pizza", "English curry"], correct: 0 },
        { question: "He ______ J.K. Rowling. He has every book she has written.", options: ["is into", "hates", "checks in", "experiences"], correct: 0 },
        { question: "It's so cold outside that the water has turned to ______.", options: ["ice", "freezing", "cold", "temperature"], correct: 0 },
        { question: "Picasso painted ______ pictures.", options: ["unique", "designer", "cozy", "warm"], correct: 0 },
        { question: "Many people enjoy the ______ in that restaurant.", options: ["atmosphere", "ice", "world", "drinking glasses"], correct: 0 },
        { question: "I really like The Matrix. It is a ______ movie.", options: ["fantastic", "drinking", "freezing", "warm"], correct: 0 },
        { question: "That house is ______ wood.", options: ["made of", "built by", "looked like", "gotten to"], correct: 0 },
        { question: "In very cold countries, people sometimes wear ______ coats.", options: ["fur", "experience", "inside", "sleeping bag"], correct: 0 },
        { question: "I gave her some flowers. She was ______.", options: ["surprised", "surprising", "surprisingly"], correct: 0 },
        { question: "'It is so cold today.' 'Yes, it's ______!'", options: ["freezing", "frozen", "freeze"], correct: 0 },
        { question: "It is ______ for me to go dancing. Actually, I don't dance well.", options: ["unusual", "usual", "usually"], correct: 0 },
        { question: "What does cortisol do in the body during stressful situations?", options: ["It prepares the body to respond", "It makes people hungry", "It helps people sleep", "It improves memory"], correct: 0 },
        { question: "How does the body return to normal after a stressful situation?", options: ["By stopping cortisol production", "By producing more cortisol", "By eating food", "By going to sleep"], correct: 0 },
        { question: "What is the main purpose of naming hurricanes?", options: ["To make communication about them easier", "To honor famous meteorologists", "To scare people", "To follow ancient traditions"], correct: 0 },
        { question: "When were hamburgers first introduced to America?", options: ["1895", "1891", "1900", "1910"], correct: 0 }
    ]
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
        electronics: 'إلكترونيات',
        english: 'لغة إنجليزية'
    };

    const currentSubjectEl = document.getElementById('currentSubject');
    const totalQEl = document.getElementById('totalQ');
    if (currentSubjectEl) currentSubjectEl.textContent = subjectNames[subject];
    if (totalQEl) totalQEl.textContent = currentQuiz.questions.length;

    // إخفاء النتيجة وإظهار الامتحان
    const quizResult = document.getElementById('quizResult');
    const quizContainer = document.getElementById('quizContainer');
    if (quizResult) quizResult.style.display = 'none';
    if (quizContainer) quizContainer.style.display = 'block';

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

// عرض أسئلة بنك الأسئلة مع زر عرض المزيد
let bankQuestionsShown = 10;
let currentBankSubject = 'physics2';

function displayBankQuestions(subject, reset = true) {
    const container = document.getElementById('questionsBankContainer');
    let questions = questionsBankData[subject] || [];

    // استخدم questionsBank للمواد اللي مش موجودة في questionsBankData
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

    // خلط الاختيارات لكل سؤال
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
    // زر عرض المزيد
    if (bankQuestionsShown < questions.length) {
        html += `<div style="text-align:center;margin:1.5rem 0;">
            <button class="btn btn-secondary" onclick="showMoreBankQuestions()">عرض المزيد</button>
        </div>`;
    }
    container.innerHTML = html;
}

// زر عرض المزيد
function showMoreBankQuestions() {
    const questions = questionsBankData[currentBankSubject] || [];
    bankQuestionsShown += 10;
    if (bankQuestionsShown > questions.length) bankQuestionsShown = questions.length;
    displayBankQuestions(currentBankSubject, false);
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

    // رفض الأسماء التي كلها أرقام أو كلها رموز
    const onlyNumbers = /^[0-9]+$/;
    const onlySymbols = /^[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/;
    if (onlyNumbers.test(filteredName) || onlySymbols.test(filteredName)) {
        return null;
    }

    // رفض الأسماء التي تحتوي على أرقام أو رموز أو حروف مكررة بشكل غير طبيعي
    // يسمح فقط بحروف عربية أو إنجليزية ومسافة
    const validName = /^[\u0600-\u06FFa-zA-Z ]+$/;
    if (!validName.test(filteredName)) {
        return null;
    }

    // رفض الأسماء التي فيها أكثر من 3 حروف متكررة متتالية (مثل aaa أو ممممم)
    if (/(.)\1{2,}/.test(filteredName)) {
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

    // الحصول على المادة المختارة
    const selectedSubject = document.getElementById('challengeSubject')?.value || 'physics2';

    // تهيئة التحدي
    challengeQuestions = getRandomQuestions(15, selectedSubject);
    currentChallengeIndex = 0;
    challengeAnswers = {};
    challengeTimeRemaining = 300;
    challengeStartTime = Date.now();

    // إيقاف المؤقت السابق إن وجد
    if (challengeTimerInterval) {
        clearInterval(challengeTimerInterval);
        challengeTimerInterval = null;
    }

    // إعادة تعيين عرض المؤقت
    document.getElementById('timerDisplay').textContent = '05:00';
    document.getElementById('challengeTimer').classList.remove('warning');

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

// الحصول على أسئلة عشوائية مع خلط الاختيارات
function getRandomQuestions(count, subject = 'physics2') {
    const allQuestions = [...(questionsBank[subject] || questionsBank.physics2)];
    const shuffled = allQuestions.sort(() => Math.random() - 0.5);
    const selectedQuestions = shuffled.slice(0, Math.min(count, shuffled.length));

    // خلط الاختيارات لكل سؤال مع تحديث الإجابة الصحيحة
    return selectedQuestions.map(q => {
        // إنشاء مصفوفة الاختيارات مع الفهرس الأصلي
        const optionsWithIndex = q.options.map((opt, idx) => ({
            text: opt,
            isCorrect: idx === q.correct
        }));

        // خلط الاختيارات
        const shuffledOptions = optionsWithIndex.sort(() => Math.random() - 0.5);

        // إيجاد الفهرس الجديد للإجابة الصحيحة
        const newCorrectIndex = shuffledOptions.findIndex(opt => opt.isCorrect);

        return {
            question: q.question,
            options: shuffledOptions.map(opt => opt.text),
            correct: newCorrectIndex
        };
    });
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
    // حفظ الإجابة
    challengeAnswers[currentChallengeIndex] = optionIndex;

    // تحديث الاختيارات بصرياً
    const options = document.querySelectorAll('.challenge-option');
    options.forEach((opt, i) => {
        opt.classList.remove('selected');
        if (i === optionIndex) {
            opt.classList.add('selected');
        }
    });
}

// تحديث النتيجة (داخلياً فقط)
function updateChallengeScore() {
    let score = 0;
    Object.keys(challengeAnswers).forEach(index => {
        if (challengeQuestions[index] && challengeQuestions[index].correct === challengeAnswers[index]) {
            score++;
        }
    });
    return score;
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
    const selectedSubject = document.getElementById('challengeSubject')?.value || 'physics2';
    saveToLeaderboard({
        name: challengerName,
        score: correctCount,
        total: 15,
        time: timeString,
        timeSeconds: timeTaken,
        subject: selectedSubject,
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
    // 🚫 كشف الغش: رفض النتائج المثالية في وقت قصير جداً
    // إذا حصل على 14 أو 15 في أقل من 60 ثانية، فهذا مشبوه
    if (entry.score >= 14 && entry.timeSeconds < 60) {
        console.warn('🚫 تم اكتشاف نتيجة مشبوهة - غش محتمل');
        alert('⚠️ تم اكتشاف نشاط مشبوه!\n\nلا يمكن حفظ نتيجتك.\n\nإذا كنت تعتقد أن هذا خطأ، يرجى إعادة المحاولة بشكل طبيعي.');

        // حذف النتيجة من Firebase إذا كانت موجودة
        if (db) {
            try {
                // البحث عن نتائج مشبوهة وحذفها
                const suspiciousResults = await db.collection('leaderboard_v2')
                    .where('name', '==', entry.name)
                    .where('score', '>=', 14)
                    .get();

                suspiciousResults.forEach(async (doc) => {
                    const data = doc.data();
                    if (data.timeSeconds < 60) {
                        await db.collection('leaderboard_v2').doc(doc.id).delete();
                        console.log('🗑️ تم حذف نتيجة مشبوهة:', doc.id);
                    }
                });
            } catch (error) {
                console.error('خطأ في حذف النتائج المشبوهة:', error);
            }
        }

        return; // لا تحفظ النتيجة
    }

    // حفظ في localStorage أولاً كاحتياط
    let localLeaderboard = JSON.parse(localStorage.getItem('challengeLeaderboard')) || [];
    localLeaderboard.push({ ...entry });
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
        const docRef = await db.collection('leaderboard_v2').add(entry);

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
        const snapshot = await db.collection('leaderboard_v2')
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
            tbody.innerHTML = leaderboard.map((entry, index) => {
                let rowClass = '';
                // تمييز ابراهيم بأي شكل (عربي أو إنجليزي)
                const nameNorm = entry.name.trim().toLowerCase().replace(/\s+/g, '');
                if (nameNorm === 'ibrahimmohamed' || nameNorm === 'ibrahimmohamad' || nameNorm === 'ابراهيم' || nameNorm === 'ابراهيممحمد' || nameNorm === 'ابراهيممحمود') {
                    rowClass = 'ibrahim-leader';
                } else if (index === 0) rowClass = 'top-leader';
                let nameCell = entry.name;
                if (nameNorm === 'ibrahimmohamed' || nameNorm === 'ibrahimmohamad' || nameNorm === 'ابراهيم' || nameNorm === 'ابراهيممحمد' || nameNorm === 'ابراهيممحمود') {
                    nameCell = `${entry.name} <span class='ibrahim-crown' title='Legendary'><i class=\"fas fa-crown\"></i></span>`;
                }
                return `
                                <tr class="${rowClass}">
                                        <td>${index + 1}</td>
                                        <td class="name-cell">${nameCell}</td>
                                        <td>${entry.score}/${entry.total}</td>
                                        <td>${entry.time}</td>
                                        <td>${entry.date}</td>
                                </tr>
                                `;
            }).join('');
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
            mainTbody.innerHTML = leaderboard.map((entry, index) => {
                let rowClass = '';
                // تمييز ابراهيم بأي شكل (عربي أو إنجليزي)
                const nameNorm = entry.name.trim().toLowerCase().replace(/\s+/g, '');
                if (nameNorm === 'ibrahimmohamed' || nameNorm === 'ibrahimmohamad' || nameNorm === 'ابراهيم' || nameNorm === 'ابراهيممحمد' || nameNorm === 'ابراهيممحمود') {
                    rowClass = 'ibrahim-leader';
                } else if (index === 0) rowClass = 'top-leader';
                let nameCell = entry.name;
                if (nameNorm === 'ibrahimmohamed' || nameNorm === 'ibrahimmohamad' || nameNorm === 'ابراهيم' || nameNorm === 'ابراهيممحمد' || nameNorm === 'ابراهيممحمود') {
                    nameCell = `${entry.name} <span class='ibrahim-crown' title='Legendary'><i class=\"fas fa-crown\"></i></span>`;
                }
                return `
                                <tr class="${rowClass}">
                                        <td>${index + 1}</td>
                                        <td class="name-cell">${nameCell}</td>
                                        <td>${entry.score}/${entry.total}</td>
                                        <td>${entry.time}</td>
                                        <td>${entry.date}</td>
                                </tr>
                                `;
            }).join('');
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
    db.collection('leaderboard_v2')
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

// 🧹 تنظيف النتائج المشبوهة من قاعدة البيانات
async function cleanSuspiciousResults() {
    if (!db) return;

    try {
        console.log('🧹 جاري البحث عن نتائج مشبوهة...');

        // جلب جميع النتائج
        const snapshot = await db.collection('leaderboard_v2').get();

        let deletedCount = 0;
        for (const doc of snapshot.docs) {
            const data = doc.data();
            // حذف النتائج المشبوهة: 14 أو 15 في أقل من 60 ثانية
            if (data.score >= 14 && data.timeSeconds < 60) {
                await db.collection('leaderboard_v2').doc(doc.id).delete();
                console.log('🗑️ تم حذف نتيجة مشبوهة:', data.name, '- النتيجة:', data.score, '- الوقت:', data.timeSeconds, 'ثانية');
                deletedCount++;
            }
        }

        if (deletedCount > 0) {
            console.log(`✅ تم حذف ${deletedCount} نتيجة مشبوهة`);
        } else {
            console.log('✅ لا توجد نتائج مشبوهة');
        }
    } catch (error) {
        console.error('خطأ في تنظيف النتائج المشبوهة:', error);
    }
}

// تهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    // تنظيف النتائج المشبوهة أولاً
    setTimeout(cleanSuspiciousResults, 2000);

    // بدء الاستماع للتحديثات الفورية
    listenToLeaderboard();
});

// ==========================================
// Subject Cards Functions - وظائف بطاقات المواد
// ==========================================

// المادة المختارة حالياً
let currentSelectedSubject = 'physics2';

// فتح التحدي لمادة معينة
function openSubjectChallenge(subject) {
    currentSelectedSubject = subject;

    // تعيين المادة في القائمة المنسدلة
    const subjectSelect = document.getElementById('challengeSubject');
    if (subjectSelect) {
        subjectSelect.value = subject;
    }

    // التمرير إلى قسم التحدي
    document.getElementById('challenge').scrollIntoView({ behavior: 'smooth' });
}

// فتح بنك الأسئلة لمادة معينة
function openSubjectBank(subject) {
    currentSelectedSubject = subject;

    // التمرير إلى قسم بنك الأسئلة
    document.getElementById('exams').scrollIntoView({ behavior: 'smooth' });

    // بعد التمرير، اختيار التاب المناسب
    setTimeout(() => {
        const bankTabs = document.querySelectorAll('[data-bank-subject]');
        bankTabs.forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.bankSubject === subject) {
                tab.classList.add('active');
            }
        });
        // عرض أسئلة المادة
        displayBankQuestions(subject);
    }, 500);
}

// فتح المتصدرين لمادة معينة
function openSubjectLeaderboard(subject) {
    currentSelectedSubject = subject;

    // التمرير إلى قسم المتصدرين
    document.getElementById('leaderboard').scrollIntoView({ behavior: 'smooth' });

    // عرض متصدرين المادة المحددة
    setTimeout(() => {
        displaySubjectLeaderboard(subject);
    }, 500);
}

// عرض متصدرين مادة معينة
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
        // جلب النتائج للمادة المحددة
        const snapshot = await db.collection('leaderboard')
            .where('subject', '==', subject)
            .orderBy('score', 'desc')
            .limit(50)
            .get();

        let leaderboard = [];
        snapshot.forEach(doc => {
            leaderboard.push(doc.data());
        });

        // ترتيب في JavaScript
        leaderboard.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return a.timeSeconds - b.timeSeconds;
        });

        // تحديث العنوان
        const leaderboardSection = document.getElementById('leaderboard');
        const titleElement = leaderboardSection?.querySelector('.section-title');
        if (titleElement) {
            titleElement.innerHTML = `<i class="fas fa-trophy"></i> متصدرين ${subjectNames[subject] || subject}`;
        }

        updateLeaderboardUI(leaderboard);

    } catch (error) {
        console.log('Error fetching subject leaderboard:', error);
        // جلب كل النتائج بدون فلتر المادة
        displayLeaderboard();
    }
}

// فتح بنك الأسئلة للمادة في المودال
function openSubjectBank(subject) {
    // فتح المودال مع تاب الأسئلة
    modalChallengeSubject = subject;

    // تحديث عنوان المودال
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

    // إعادة تعيين الحالة
    resetModalChallenge();

    // تحميل الأسئلة
    loadModalQuestions(subject);

    // عرض المودال
    document.getElementById('subjectChallengeModal').classList.add('active');
    document.body.style.overflow = 'hidden';

    // تفعيل تاب الأسئلة
    setTimeout(() => {
        switchModalTab('questions');
    }, 100);
}

// ==========================================
// Modal Challenge System - نظام تحدي المودال
// ==========================================

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

// فتح المودال للتحدي
function openSubjectChallenge(subject) {
    modalChallengeSubject = subject;

    // تحديث عنوان المودال
    document.getElementById('modalSubjectTitle').innerHTML = `
        <i class="fas fa-bolt"></i>
        تحدي ${subjectNames[subject] || subject}
    `;

    // إعادة تعيين الحالة
    resetModalChallenge();

    // تحميل المتصدرين
    loadModalLeaderboard(subject);

    // عرض المودال
    document.getElementById('subjectChallengeModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

// إغلاق المودال
function closeSubjectModal() {
    // إيقاف المؤقت
    if (modalTimerInterval) {
        clearInterval(modalTimerInterval);
        modalTimerInterval = null;
    }

    document.getElementById('subjectChallengeModal').classList.remove('active');
    document.body.style.overflow = 'auto';
}

// تبديل التابات
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

// تحميل أسئلة المادة في المودال
function loadModalQuestions(subject) {
    const container = document.getElementById('modalQuestionsContainer');
    if (!container) return;

    container.innerHTML = '<div style="text-align: center; padding: 20px;"><i class="fas fa-spinner fa-spin"></i> جاري التحميل...</div>';

    // جلب الأسئلة من المتغيرات المحلية
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

// إعادة تعيين التحدي
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

// بدء التحدي في المودال
function startModalChallenge() {
    const nameInput = document.getElementById('modalChallengerName');
    const rawName = nameInput.value.trim();

    if (!rawName) {
        alert('من فضلك أدخل اسمك للبدء!');
        nameInput.focus();
        return;
    }

    // فلترة الاسم
    modalChallengerName = filterName(rawName);

    if (!modalChallengerName) {
        alert('⚠️ الاسم غير مقبول!\n\nيرجى استخدام اسم لائق.');
        nameInput.value = '';
        nameInput.focus();
        return;
    }

    // تهيئة الأسئلة
    modalChallengeQuestions = getRandomQuestions(15, modalChallengeSubject);
    modalCurrentIndex = 0;
    modalAnswers = {};
    modalTimeRemaining = 300;

    // إخفاء المقدمة وإظهار التحدي
    document.getElementById('modalChallengeIntro').style.display = 'none';
    document.getElementById('modalChallengeContainer').style.display = 'block';

    // بدء المؤقت
    startModalTimer();

    // عرض أول سؤال
    showModalQuestion();
}

// بدء المؤقت
function startModalTimer() {
    const timerDisplay = document.getElementById('modalTimerDisplay');
    const timerDiv = document.getElementById('modalChallengeTimer');

    modalTimerInterval = setInterval(() => {
        modalTimeRemaining--;

        const minutes = Math.floor(modalTimeRemaining / 60);
        const seconds = modalTimeRemaining % 60;
        timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        // تحذير عند بقاء دقيقة واحدة
        if (modalTimeRemaining <= 60) {
            timerDiv.style.color = '#f5576c';
        }

        // انتهاء الوقت
        if (modalTimeRemaining <= 0) {
            clearInterval(modalTimerInterval);
            submitModalChallenge();
        }
    }, 1000);
}

// عرض سؤال
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

// اختيار إجابة
function selectModalOption(optionIndex) {
    modalAnswers[modalCurrentIndex] = optionIndex;

    // تحديث الاختيارات بصرياً
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

// تحديث أزرار التنقل
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

// السؤال التالي
function modalNextQuestion() {
    if (modalCurrentIndex < modalChallengeQuestions.length - 1) {
        modalCurrentIndex++;
        showModalQuestion();
    }
}

// السؤال السابق
function modalPrevQuestion() {
    if (modalCurrentIndex > 0) {
        modalCurrentIndex--;
        showModalQuestion();
    }
}

// إنهاء التحدي
function submitModalChallenge() {
    clearInterval(modalTimerInterval);

    // حساب النتيجة
    let correctCount = 0;
    Object.keys(modalAnswers).forEach(index => {
        if (modalChallengeQuestions[index].correct === modalAnswers[index]) {
            correctCount++;
        }
    });

    // حساب الوقت المستغرق
    const timeTaken = 300 - modalTimeRemaining;
    const minutes = Math.floor(timeTaken / 60);
    const seconds = timeTaken % 60;
    const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    // حفظ في قاعدة البيانات
    saveToLeaderboard({
        name: modalChallengerName,
        score: correctCount,
        total: 15,
        time: timeString,
        timeSeconds: timeTaken,
        subject: modalChallengeSubject,
        date: new Date().toLocaleDateString('ar-EG')
    });

    // تحديث إحصائيات المستخدم
    updateUserStats(correctCount);

    // عرض النتيجة
    showModalResult(correctCount, timeString);
}

// عرض النتيجة
function showModalResult(score, time) {
    document.getElementById('modalChallengeContainer').style.display = 'none';
    document.getElementById('modalChallengeResult').style.display = 'block';

    // تحديد الرمز والعنوان
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

    document.getElementById('modalFinalScore').textContent = `${score}/15`;
    document.getElementById('modalFinalTime').textContent = time;

    // تحديث المتصدرين
    loadModalLeaderboard(modalChallengeSubject);
}

// إعادة التحدي
function restartModalChallenge() {
    resetModalChallenge();
}

// تحميل المتصدرين للمودال
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
        const snapshot = await db.collection('leaderboard')
            .where('subject', '==', subject)
            .orderBy('score', 'desc')
            .limit(20)
            .get();

        let leaderboard = [];
        snapshot.forEach(doc => {
            leaderboard.push(doc.data());
        });

        // ترتيب
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
