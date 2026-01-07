// Firebase Configuration
const firebaseConfig = { apiKey: "AIzaSyCFhUdOI9IqFCjBkg8zytanD5O1_67vCr4", authDomain: "manasa-ceaa2.firebaseapp.com", projectId: "manasa-ceaa2", storageBucket: "manasa-ceaa2.firebasestorage.app", messagingSenderId: "847284305108", appId: "1:847284305108:web:7a14698f76b3981c6acf41" };
let db; try { firebase.initializeApp(firebaseConfig); db = firebase.firestore(); } catch (e) { }

// Mobile Menu Toggle
function toggleMobileMenu() { const navLinks = document.querySelector('.nav-links'); const toggleBtn = document.querySelector('.mobile-menu-toggle i'); navLinks.classList.toggle('active'); toggleBtn.classList.toggle('fa-chevron-down'); toggleBtn.classList.toggle('fa-chevron-up'); }

// Theme System
function setTheme(theme) { const body = document.body; const userProfile = JSON.parse(localStorage.getItem('userProfile')) || {}; body.classList.remove('space-theme', 'ocean-theme', 'sunset-theme', 'pyramids-theme', 'winter-theme'); if (theme !== 'default') { body.classList.add(theme + '-theme'); } userProfile.theme = theme; localStorage.setItem('userProfile', JSON.stringify(userProfile)); const toggle = document.querySelector('.theme-toggle i'); const icons = { 'default': 'fa-moon', 'space': 'fa-rocket', 'ocean': 'fa-water', 'sunset': 'fa-sun', 'pyramids': 'fa-mountain', 'winter': 'fa-snowflake' }; if (toggle) toggle.className = 'fas ' + (icons[theme] || 'fa-moon'); }
function cycleTheme() { const themes = ['default', 'space', 'ocean', 'sunset', 'pyramids', 'winter']; const userProfile = JSON.parse(localStorage.getItem('userProfile')) || {}; const currentTheme = userProfile.theme || 'default'; const currentIndex = themes.indexOf(currentTheme); setTheme(themes[(currentIndex + 1) % themes.length]); }
function loadSavedTheme() { const userProfile = JSON.parse(localStorage.getItem('userProfile')); if (userProfile?.theme && userProfile.theme !== 'default') { setTheme(userProfile.theme); } }
document.addEventListener('DOMContentLoaded', loadSavedTheme);

const SUBJECT_ID = 'math1';
const SUBJECT_NAME = 'رياضيات 1';
const CHALLENGE_TIME = 1500;
const QUESTIONS_PER_CHALLENGE = 5;
const GROQ_API_KEY_CHAT = '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'; // للشات بوت
const GROQ_API_KEY_EXPLANATION = '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'; // للشرح التلقائي

// MCQ Questions - Bilingual Format (questionAr, questionEn, options, correct)
// Add your questions here in this format:
// { questionAr: "السؤال بالعربية", questionEn: "Question in English", options: ["Option 1", "Option 2", "Option 3", "Option 4"], correct: 0 }
const hardcodedQuestions = [
    // Empty - Add questions here
];

// Combined questions array (will include Firebase questions)
let questions = [...hardcodedQuestions];

// Load questions from Firebase and merge with hardcoded ones
async function loadQuestionsFromFirebase() {
    if (!db) {
        console.log('⚠️ Firebase not available for math1, using hardcoded questions only');
        return;
    }

    try {
        console.log('🔄 Loading questions from Firebase for math1...');
        const snapshot = await db.collection(`questions_${SUBJECT_ID}`).get();

        if (!snapshot.empty) {
            const firebaseQuestions = [];
            snapshot.forEach(doc => {
                const data = doc.data();

                // CRITICAL: Include explanation field from Firebase
                const q = {
                    question: data.question,
                    options: data.options,
                    correct: data.correct,
                    imageUrl: data.imageUrl,
                    explanation: data.explanation || data.questionExplanation || '', // Support both field names
                    source: 'firebase',
                    id: doc.id
                };

                // Debug log to verify explanation is loaded
                if (q.explanation) {
                    console.log(`✅ Question ${doc.id} has explanation:`, q.explanation.substring(0, 50) + '...');
                } else {
                    console.log(`⚠️ Question ${doc.id} has NO explanation`);
                }

                firebaseQuestions.push(q);
            });

            // Merge Firebase questions with hardcoded questions
            questions = [...hardcodedQuestions, ...firebaseQuestions];
            console.log(`✅ Loaded ${firebaseQuestions.length} questions from Firebase for math1`);
            console.log(`📊 Total questions available: ${questions.length}`);

            // Update total questions count if element exists
            const totalQuestionsEl = document.getElementById('totalQuestions');
            if (totalQuestionsEl) {
                totalQuestionsEl.textContent = questions.length;
            }

            // Re-render question bank
            if (typeof renderQuestionsBank === 'function') {
                renderQuestionsBank();
            }
        } else {
            console.log('ℹ️ No Firebase questions found for math1, using hardcoded questions only');
        }
    } catch (error) {
        console.error('❌ Error loading questions from Firebase for math1:', error);
    }
}

// Load Firebase questions when page loads
if (db) {
    loadQuestionsFromFirebase();
}

// Essay Questions (Bilingual)
const essayQuestions = [
    // Empty - Add essay questions here
    // Format: { questionAr: "...", questionEn: "...", answerAr: "...", answerEn: "..." }
];

// Challenge State
let challenge = { active: false, questions: [], currentIndex: 0, answers: [], score: 0, timeLeft: CHALLENGE_TIME, timerInterval: null, userName: '' };
let essayChallenge = { active: false, questions: [], currentIndex: 0, answers: [], timeLeft: 660, timerInterval: null, userName: '' };
const ESSAY_TIME = 660;
const ESSAYS_PER_CHALLENGE = 5;
const QUESTIONS_PER_PAGE = 5;
const ESSAYS_PER_PAGE = 3;
let currentBankPage = 1;
let currentEssayPage = 1;
let filteredQuestions = [];
let filteredEssay = [];

// Helper to get question text (supports both old and new format)
function getQuestionText(q) {
    if (q.questionAr && q.questionEn) {
        return `<div class="bilingual-mcq"><p class="q-en"><span class="lang-label">🇬🇧</span> ${q.questionEn}</p><p class="q-ar"><span class="lang-label">🇸🇦</span> ${q.questionAr}</p></div>`;
    }
    return q.question || q.questionEn || q.questionAr || '';
}

function getQuestionTextPlain(q) {
    if (q.questionAr && q.questionEn) return `${q.questionEn} / ${q.questionAr}`;
    return q.question || q.questionEn || q.questionAr || '';
}

// Helper for bilingual options (English main, Arabic below)
function getOptionText(q, index) {
    if (q.optionsEn && q.optionsAr) {
        return `<span class="opt-en">${q.optionsEn[index]}</span><span class="opt-ar">${q.optionsAr[index]}</span>`;
    }
    return q.options ? q.options[index] : '';
}

function getOptions(q) {
    return q.optionsEn || q.options || [];
}

function getCorrectAnswerText(q) {
    if (q.optionsEn && q.optionsAr) {
        return `${q.optionsEn[q.correct]} (${q.optionsAr[q.correct]})`;
    }
    return q.options ? q.options[q.correct] : '';
}

// Navigation
function updateActiveNav() { const sections = ['hero', 'challenge', 'bank', 'essay', 'leaderboard', 'ask-ai']; const navLinks = document.querySelectorAll('.nav-link'); let current = 'hero'; sections.forEach(id => { const s = document.getElementById(id); if (s && s.getBoundingClientRect().top <= 150) current = id; }); navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + current)); }
document.querySelectorAll('.nav-link, .btn[href^="#"]').forEach(l => { l.addEventListener('click', function (e) { const h = this.getAttribute('href'); if (h.startsWith('#')) { e.preventDefault(); const t = document.querySelector(h); if (t) { const nav = document.querySelector('.subject-navbar').offsetHeight; window.scrollTo({ top: t.offsetTop - nav, behavior: 'smooth' }); } } }); });
window.addEventListener('scroll', updateActiveNav);

// Challenge Functions
function shuffleArray(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; }

function startChallenge() {
    const n = document.getElementById('challengerName'), name = n.value.trim();
    if (!name) { alert('من فضلك أدخل اسمك!'); n.focus(); return; }
    if (questions.length < QUESTIONS_PER_CHALLENGE) { alert('لا توجد أسئلة كافية في البنك'); return; }
    challenge.userName = name;
    challenge.questions = shuffleArray([...questions]).slice(0, QUESTIONS_PER_CHALLENGE);
    challenge.currentIndex = 0;
    challenge.answers = new Array(QUESTIONS_PER_CHALLENGE).fill(null);
    challenge.score = 0;
    challenge.timeLeft = CHALLENGE_TIME;
    challenge.active = true;
    document.getElementById('challengeIntro').style.display = 'none';
    document.getElementById('challengeContainer').style.display = 'block';
    showQuestion(0);
    startTimer();
}

function showQuestion(i) {
    const q = challenge.questions[i];
    document.getElementById('questionBadge').textContent = `السؤال ${i + 1}`;
    document.getElementById('questionText').innerHTML = getQuestionText(q);
    document.getElementById('questionProgress').textContent = `${i + 1}/${QUESTIONS_PER_CHALLENGE}`;
    const c = document.getElementById('optionsContainer');
    c.innerHTML = '';
    ['أ', 'ب', 'ج', 'د'].forEach((l, j) => {
        if (j < q.options.length) {
            const b = document.createElement('button');
            b.className = 'option-btn' + (challenge.answers[i] === j ? ' selected' : '');
            // Wrap option text with LRM markers and force LTR
            b.innerHTML = `<span class="option-letter">${l}</span><span class="option-text" dir="ltr" style="unicode-bidi: bidi-override !important;">&lrm;${q.options[j]}&lrm;</span>`;
            b.onclick = () => selectOption(j);
            c.appendChild(b);
        }
    });
    document.getElementById('prevBtn').disabled = i === 0;
    document.getElementById('nextBtn').style.display = i === QUESTIONS_PER_CHALLENGE - 1 ? 'none' : 'flex';
    document.getElementById('submitBtn').style.display = i === QUESTIONS_PER_CHALLENGE - 1 ? 'flex' : 'none';

    // Render math in question and options
    setTimeout(() => {
        if (typeof renderMathInElement !== 'undefined') {
            const questionText = document.getElementById('questionText');
            const optionsContainer = document.getElementById('optionsContainer');
            if (questionText) renderMathInContent(questionText);
            if (optionsContainer) renderMathInContent(optionsContainer);
        }
    }, 50);
}

function selectOption(j) { challenge.answers[challenge.currentIndex] = j; document.querySelectorAll('.option-btn').forEach((b, k) => b.classList.toggle('selected', k === j)); }
function nextQuestion() { if (challenge.currentIndex < QUESTIONS_PER_CHALLENGE - 1) showQuestion(++challenge.currentIndex); }
function prevQuestion() { if (challenge.currentIndex > 0) showQuestion(--challenge.currentIndex); }
function startTimer() { updateTimerDisplay(); challenge.timerInterval = setInterval(() => { challenge.timeLeft--; updateTimerDisplay(); if (challenge.timeLeft <= 60) document.getElementById('timer').classList.add('warning'); if (challenge.timeLeft <= 0) submitChallenge(); }, 1000); }
function updateTimerDisplay() { const m = Math.floor(challenge.timeLeft / 60), s = challenge.timeLeft % 60; document.getElementById('timerDisplay').textContent = `${m}:${s.toString().padStart(2, '0')}`; }
function submitChallenge() { clearInterval(challenge.timerInterval); let score = 0; challenge.questions.forEach((q, i) => { if (challenge.answers[i] === q.correct) score++; }); challenge.score = score; const time = CHALLENGE_TIME - challenge.timeLeft, pct = Math.round((score / QUESTIONS_PER_CHALLENGE) * 100); document.getElementById('challengeContainer').style.display = 'none'; document.getElementById('challengeResult').style.display = 'block'; document.getElementById('finalScore').textContent = `${score}/${QUESTIONS_PER_CHALLENGE}`; document.getElementById('finalTime').textContent = formatTime(time); document.getElementById('percentage').textContent = `${pct}%`; let icon, title; if (pct >= 90) { icon = '🏆'; title = 'ممتاز!'; } else if (pct >= 70) { icon = '🌟'; title = 'أحسنت!'; } else if (pct >= 50) { icon = '💪'; title = 'جيد!'; } else { icon = '📚'; title = 'حاول مرة أخرى'; } document.getElementById('resultIcon').textContent = icon; document.getElementById('resultTitle').textContent = title; saveToLeaderboard(score, time); }
function formatTime(s) { return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`; }

// Format date to DD-MM-YYYY
function formatDate(dateString) {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    } catch (e) {
        return '-';
    }
}

function restartChallenge() { document.getElementById('challengeResult').style.display = 'none'; document.getElementById('challengeIntro').style.display = 'block'; document.getElementById('timer').classList.remove('warning'); }

// Firebase - Save to Leaderboard with validation and feedback
async function saveToLeaderboard(score, time) {
    if (!db) {
        console.error('❌ Firebase not initialized');
        showNotification('خطأ: قاعدة البيانات غير متصلة', 'error');
        return;
    }

    try {
        // Get user profile for userId
        let userProfile = JSON.parse(localStorage.getItem('userProfile'));
        if (!userProfile || !userProfile.id) {
            // Initialize user profile if not exists
            userProfile = {
                id: generateTempUserId(),
                name: challenge.userName || 'مجهول',
                createdAt: new Date().toISOString()
            };
            localStorage.setItem('userProfile', JSON.stringify(userProfile));
        }

        // Validate and clean data
        const cleanScore = parseInt(score);
        const cleanTime = parseInt(time);
        const cleanName = (challenge.userName || userProfile.name || 'مجهول').trim();

        if (isNaN(cleanScore) || isNaN(cleanTime)) {
            throw new Error('Invalid score or time data');
        }

        // UNIFIED DATABASE: Save to global 'leaderboard' collection
        const docRef = await db.collection('leaderboard').add({
            userId: userProfile.id,      // ✅ User tracking
            userName: cleanName,
            score: cleanScore,
            timeSeconds: cleanTime,      // ✅ Renamed from 'time'
            subject: SUBJECT_ID,
            subjectName: SUBJECT_NAME,
            date: new Date().toISOString(),
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        console.log('✅ Score saved to unified leaderboard:', docRef.id);
        console.log('📊 User:', userProfile.id, '| Subject:', SUBJECT_ID, '|', SUBJECT_NAME);
        showNotification('تم إضافة نتيجتك إلى لوحة الشرف! 🏆', 'success');

        // Reload leaderboard to show new score
        await loadLeaderboard();

    } catch (error) {
        console.error('❌ Error saving to leaderboard:', error);
        showNotification('حدث خطأ أثناء حفظ النتيجة', 'error');
    }
}

// Helper function to generate temporary userId
function generateTempUserId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = 'USER_';
    for (let i = 0; i < 8; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}

// Show notification helper
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'linear-gradient(135deg, #38ef7d, #11998e)' : 'linear-gradient(135deg, #ff6b6b, #ee5a6f)'};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        display: flex;
        align-items: center;
        gap: 10px;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
async function loadLeaderboard() {
    if (!db) {
        document.getElementById('noRecords').style.display = 'block';
        return;
    }

    try {
        console.log('🔄 Loading leaderboard for subject:', SUBJECT_ID);

        let snap;

        // Try query with timeSeconds ordering (requires composite index)
        try {
            snap = await db.collection('leaderboard')
                .where('subject', '==', SUBJECT_ID)
                .orderBy('score', 'desc')
                .orderBy('timeSeconds', 'asc')
                .limit(20)
                .get();
        } catch (indexError) {
            // Fallback 1: Query without timeSeconds ordering (no composite index needed)
            console.log('⚠️ Index not ready, using fallback query');
            try {
                snap = await db.collection('leaderboard')
                    .where('subject', '==', SUBJECT_ID)
                    .orderBy('score', 'desc')
                    .limit(20)
                    .get();
            } catch (unifiedError) {
                // Fallback 2: Try old collection format
                console.log('⚠️ Unified collection failed, trying old collection: leaderboard_' + SUBJECT_ID);
                snap = await db.collection(`leaderboard_${SUBJECT_ID}`)
                    .orderBy('score', 'desc')
                    .limit(20)
                    .get();
            }
        }

        const tb = document.getElementById('leaderboardBody');
        tb.innerHTML = '';

        if (snap.empty) {
            document.getElementById('noRecords').style.display = 'block';
            console.log('⚠️ No leaderboard records found for', SUBJECT_ID);
            return;
        }

        document.getElementById('noRecords').style.display = 'none';
        document.getElementById('totalPlayers').textContent = snap.size;

        console.log(`✅ Loaded ${snap.size} leaderboard entries for ${SUBJECT_ID}`);

        snap.docs.forEach((d, i) => {
            const data = d.data();
            const tr = document.createElement('tr');
            let r = i + 1;
            if (i === 0) r = '🥇';
            else if (i === 1) r = '🥈';
            else if (i === 2) r = '🥉';

            // Format time with LTR wrapper - support both old 'time' and new 'timeSeconds'
            const timeValue = data.timeSeconds || data.time || 0;
            const timeFormatted = `<span dir="ltr" style="direction: ltr !important;">${formatTime(timeValue)}</span>`;
            const scoreFormatted = `<span dir="ltr" style="direction: ltr !important;">${data.score}/${QUESTIONS_PER_CHALLENGE}</span>`;
            const dateFormatted = `<span dir="ltr" style="direction: ltr !important;">${formatDate(data.date)}</span>`;

            // Use userName if available, fallback to name
            const displayName = data.userName || data.name || 'مجهول';

            tr.innerHTML = `<td>${r}</td><td class="player-name">${displayName}</td><td>${scoreFormatted}</td><td>${timeFormatted}</td><td>${dateFormatted}</td>`;
            tb.appendChild(tr);
        });

        // Render math in leaderboard names
        setTimeout(() => {
            if (typeof renderMathInElement !== 'undefined') {
                const leaderboardBody = document.getElementById('leaderboardBody');
                if (leaderboardBody) {
                    renderMathInElement(leaderboardBody, {
                        delimiters: [
                            { left: '$$', right: '$$', display: false },
                            { left: '$', right: '$', display: false }
                        ],
                        throwOnError: false
                    });
                }
            }
        }, 100);
    } catch (e) {
        console.error('❌ Error loading leaderboard:', e);
        document.getElementById('noRecords').style.display = 'block';
    }
}

// Interactive Questions Bank - Supports Bilingual
function renderQuestionsBank(showAll = false) {
    const container = document.getElementById('questionsList');
    container.innerHTML = '';
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    filteredQuestions = questions;
    if (searchTerm) {
        filteredQuestions = questions.filter(q =>
            getQuestionTextPlain(q).toLowerCase().includes(searchTerm) ||
            q.options.some(o => o.toLowerCase().includes(searchTerm))
        );
        currentBankPage = 1;
    }
    document.getElementById('displayedCount').textContent = filteredQuestions.length;
    if (!filteredQuestions.length) { container.innerHTML = '<p class="no-records">لا توجد أسئلة حالياً</p>'; return; }
    const letters = ['أ', 'ب', 'ج', 'د'];
    const questionsToShow = showAll ? filteredQuestions : filteredQuestions.slice(0, currentBankPage * QUESTIONS_PER_PAGE);
    questionsToShow.forEach((q, index) => {
        const card = document.createElement('div');
        card.className = 'bank-question-card';
        card.dataset.correct = q.correct;
        card.dataset.answered = 'false';
        let optionsHTML = '';
        q.options.forEach((opt, i) => {
            // Wrap each option with LRM markers and LTR span
            optionsHTML += `<button class="bank-option-btn" data-index="${i}" onclick="selectBankOption(this, ${q.correct})"><span class="option-letter">${letters[i]}</span><span class="option-text" dir="ltr" style="unicode-bidi: bidi-override !important;">&lrm;${opt}&lrm;</span><span class="option-icon"></span></button>`;
        });
        const questionTextHTML = `<div class="bank-question-text" dir="ltr" style="direction: ltr !important; text-align: left !important; unicode-bidi: plaintext !important;">${getQuestionText(q)}</div>`;
        card.innerHTML = `<div class="bank-question-header"><h4>${index + 1}.</h4></div>${questionTextHTML}<div class="bank-options">${optionsHTML}</div><div class="bank-actions"><button class="show-answer-btn" onclick="showBankAnswer(this, ${q.correct})"><i class="fas fa-eye"></i> إظهار الإجابة</button><div class="answer-reveal" style="display: none;"><i class="fas fa-check-circle"></i><span>الإجابة الصحيحة: ${q.options[q.correct]}</span></div></div><div class="bank-feedback" style="display: none;"></div>`;
        container.appendChild(card);
    });
    const remaining = filteredQuestions.length - questionsToShow.length;
    if (remaining > 0 && !showAll) {
        const btn = document.createElement('button');
        btn.className = 'show-more-btn';
        btn.innerHTML = `<i class="fas fa-chevron-down"></i> عرض المزيد (${remaining} سؤال متبقي)`;
        btn.onclick = () => { currentBankPage++; renderQuestionsBank(); };
        container.appendChild(btn);
    }

    // Render math in all questions
    setTimeout(() => {
        if (typeof renderMathInElement !== 'undefined') {
            renderMathInElement(container, {
                delimiters: [
                    { left: '$$', right: '$$', display: true },
                    { left: '\\[', right: '\\]', display: true },
                    { left: '$', right: '$', display: false },
                    { left: '\\(', right: '\\)', display: false }
                ],
                throwOnError: false
            });
        }
    }, 50);
}
function selectBankOption(btn, correctIndex) {
    const card = btn.closest('.bank-question-card');
    if (card.dataset.answered === 'true') return;

    const selectedIndex = parseInt(btn.dataset.index);
    const isCorrect = selectedIndex === correctIndex;
    card.dataset.answered = 'true';

    // Get question data to access explanation
    const questionIndex = Array.from(card.parentElement.children).indexOf(card);
    const question = filteredQuestions[questionIndex];

    card.querySelectorAll('.bank-option-btn').forEach((opt, i) => {
        opt.disabled = true;
        if (i === correctIndex) {
            opt.classList.add('correct');
            opt.querySelector('.option-icon').innerHTML = '<i class="fas fa-check"></i>';
        } else if (i === selectedIndex && !isCorrect) {
            opt.classList.add('wrong');
            opt.querySelector('.option-icon').innerHTML = '<i class="fas fa-times"></i>';
        }
    });

    const feedback = card.querySelector('.bank-feedback');
    feedback.style.display = 'block';

    // Build feedback HTML with explanation if available (admin-provided only)
    let feedbackHTML = isCorrect
        ? '<i class="fas fa-check-circle"></i> إجابة صحيحة! 🎉'
        : '<i class="fas fa-times-circle"></i> إجابة خاطئة.';

    feedback.innerHTML = feedbackHTML;
    feedback.className = 'bank-feedback ' + (isCorrect ? 'correct' : 'wrong');

    // Add explanation section if available
    if (question && question.explanation) {
        console.log('✅ Explanation found after answering! Length:', question.explanation.length);

        const explanationDiv = document.createElement('div');
        explanationDiv.className = 'explanation-section';
        explanationDiv.style.display = 'none';
        explanationDiv.innerHTML = `
            <h4><i class="fas fa-lightbulb"></i> الشرح التفصيلي</h4>
            <div class="explanation-content">${question.explanation}</div>
        `;

        const showExplanationBtn = document.createElement('button');
        showExplanationBtn.className = 'show-explanation-btn';
        showExplanationBtn.innerHTML = '<i class="fas fa-book-open"></i> عرض الشرح';
        showExplanationBtn.onclick = function () {
            console.log('🔘 Show explanation button clicked');
            if (explanationDiv.style.display === 'none') {
                explanationDiv.style.display = 'block';
                this.innerHTML = '<i class="fas fa-eye-slash"></i> إخفاء الشرح';
                console.log('📖 Showing explanation...');
                // Render math in explanation
                setTimeout(() => {
                    if (typeof renderMathInElement !== 'undefined') {
                        console.log('🔢 Rendering math in explanation...');
                        renderMathInElement(explanationDiv, {
                            delimiters: [
                                { left: '$$', right: '$$', display: true },
                                { left: '$', right: '$', display: false }
                            ],
                            throwOnError: false
                        });
                        console.log('✅ Math rendered');
                    }
                }, 50);
            } else {
                explanationDiv.style.display = 'none';
                this.innerHTML = '<i class="fas fa-book-open"></i> عرض الشرح';
                console.log('📕 Hiding explanation');
            }
        };

        feedback.appendChild(showExplanationBtn);
        feedback.appendChild(explanationDiv);
        console.log('✅ Explanation button and div added to feedback');
    } else {
        console.warn('⚠️ No explanation available for this question');
    }

    card.querySelector('.show-answer-btn').style.display = 'none';
    card.querySelector('.answer-reveal').style.display = 'flex';
}

// Generate explanation using Groq AI - REMOVED (now using admin explanations only)
function showBankAnswer(btn, correctIndex) {
    const card = btn.closest('.bank-question-card');

    // Get question data to access explanation
    const questionIndex = Array.from(card.parentElement.children).indexOf(card);
    const question = filteredQuestions[questionIndex];

    // DEBUG: Log question data
    console.log('🔍 showBankAnswer called for question:', questionIndex);
    console.log('📊 Question object:', question);
    console.log('📝 Explanation field:', question?.explanation);

    // Highlight correct answer
    card.querySelectorAll('.bank-option-btn').forEach((opt, i) => {
        if (i === correctIndex) {
            opt.classList.add('correct');
            opt.querySelector('.option-icon').innerHTML = '<i class="fas fa-check"></i>';
        }
    });

    btn.style.display = 'none';
    card.querySelector('.answer-reveal').style.display = 'flex';

    // Show explanation automatically if available
    const feedback = card.querySelector('.bank-feedback');

    if (question && question.explanation) {
        console.log('✅ Explanation found! Creating explanation div...');
        feedback.style.display = 'block';

        const explanationDiv = document.createElement('div');
        explanationDiv.className = 'explanation-section';
        explanationDiv.style.display = 'block'; // Show immediately
        explanationDiv.style.animation = 'slideDown 0.4s ease';
        explanationDiv.innerHTML = `
            <h4><i class="fas fa-lightbulb"></i> الشرح التفصيلي</h4>
            <div class="explanation-content">${question.explanation}</div>
        `;

        feedback.innerHTML = '';
        feedback.appendChild(explanationDiv);
        feedback.className = 'bank-feedback';

        console.log('✅ Explanation div added to DOM');

        // Render math in explanation immediately
        setTimeout(() => {
            if (typeof renderMathInElement !== 'undefined') {
                console.log('🔢 Rendering math in explanation...');
                renderMathInElement(explanationDiv, {
                    delimiters: [
                        { left: '$$', right: '$$', display: true },
                        { left: '$', right: '$', display: false }
                    ],
                    throwOnError: false
                });
                console.log('✅ Math rendering complete');
            } else {
                console.error('❌ renderMathInElement is not defined!');
            }
        }, 50);
    } else {
        console.warn('⚠️ No explanation found for this question');
        console.log('Question object:', question);
    }
}
// Translation function using Groq API
async function translateExplanation(questionIndex, isBank = false) {
    const contentId = isBank ? `explanation-bank-${questionIndex}` : `explanation-${questionIndex}`;
    const btnId = isBank ? `translate-btn-bank-${questionIndex}` : `translate-btn-${questionIndex}`;

    const contentDiv = document.getElementById(contentId);
    const btn = document.getElementById(btnId);

    if (!contentDiv || !btn) return;

    // Store original content
    if (!contentDiv.dataset.original) {
        contentDiv.dataset.original = contentDiv.innerHTML;
    }

    // Toggle between original and translated
    if (contentDiv.dataset.translated) {
        contentDiv.innerHTML = contentDiv.dataset.original;
        delete contentDiv.dataset.translated;
        btn.innerHTML = '<i class="fas fa-language"></i> ترجم للعربية';
        return;
    }

    // Show loading
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الترجمة...';

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY_EXPLANATION}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    {
                        role: 'system',
                        content: 'أنت مترجم محترف متخصص في ترجمة الشروح الرياضية من الإنجليزية إلى العربية. قم بترجمة النص بدقة مع الحفاظ على المعادلات الرياضية كما هي (بين علامات $ أو $$). لا تترجم المعادلات أو الرموز الرياضية. ارجع فقط الترجمة بدون أي إضافات.'
                    },
                    {
                        role: 'user',
                        content: contentDiv.textContent
                    }
                ],
                max_tokens: 1024,
                temperature: 0.3
            })
        });

        if (!response.ok) {
            throw new Error('Translation API error');
        }

        const data = await response.json();
        const translation = data.choices[0]?.message?.content || 'فشلت الترجمة';

        // Store translated content
        contentDiv.dataset.translated = 'true';
        contentDiv.innerHTML = translation;

        // Re-render math
        setTimeout(() => {
            if (typeof renderMathInElement !== 'undefined') {
                renderMathInElement(contentDiv, {
                    delimiters: [
                        { left: '$$', right: '$$', display: true },
                        { left: '$', right: '$', display: false }
                    ],
                    throwOnError: false
                });
            }
        }, 50);

        btn.innerHTML = '<i class="fas fa-undo"></i> عرض الأصلي';

    } catch (error) {
        console.error('Translation error:', error);
        alert('حدث خطأ في الترجمة');
    }

    btn.disabled = false;
}

function filterQuestions() { currentBankPage = 1; renderQuestionsBank(); }

// Old Essay Challenge Functions (Text-based - kept for backwards compatibility)
function startOldEssayChallenge() { const nameInput = document.getElementById('essayPlayerName'); const name = nameInput.value.trim() || document.getElementById('challengerName').value.trim(); if (!name) { alert('من فضلك أدخل اسمك!'); nameInput.focus(); return; } if (essayQuestions.length < ESSAYS_PER_CHALLENGE) { alert('لا توجد أسئلة مقالية كافية'); return; } essayChallenge.userName = name; essayChallenge.questions = shuffleArray([...essayQuestions]).slice(0, ESSAYS_PER_CHALLENGE); essayChallenge.currentIndex = 0; essayChallenge.answers = new Array(ESSAYS_PER_CHALLENGE).fill(''); essayChallenge.timeLeft = ESSAY_TIME; essayChallenge.active = true; document.getElementById('essayIntro').style.display = 'none'; document.getElementById('essayContainer').style.display = 'block'; document.getElementById('essayResult').style.display = 'none'; showEssayQuestion(0); startEssayTimer(); }
function showEssayQuestion(index) { const q = essayChallenge.questions[index]; document.getElementById('essayQuestionBadge').textContent = `السؤال ${index + 1}`; document.getElementById('essayQuestionText').innerHTML = `<div class="bilingual-question"><p class="q-ar"><span class="lang-label">🇸🇦</span> ${q.questionAr}</p><p class="q-en"><span class="lang-label">🇬🇧</span> ${q.questionEn}</p></div>`; document.getElementById('essayProgress').textContent = `${index + 1}/${ESSAYS_PER_CHALLENGE}`; document.getElementById('essayAnswer').value = essayChallenge.answers[index] || ''; document.getElementById('essayPrevBtn').disabled = index === 0; document.getElementById('essayNextBtn').style.display = index === ESSAYS_PER_CHALLENGE - 1 ? 'none' : 'flex'; document.getElementById('essaySubmitBtn').style.display = index === ESSAYS_PER_CHALLENGE - 1 ? 'flex' : 'none'; }
function saveCurrentEssayAnswer() { essayChallenge.answers[essayChallenge.currentIndex] = document.getElementById('essayAnswer').value.trim(); }
function nextEssayQuestion() { saveCurrentEssayAnswer(); if (essayChallenge.currentIndex < ESSAYS_PER_CHALLENGE - 1) { essayChallenge.currentIndex++; showEssayQuestion(essayChallenge.currentIndex); } }
function prevEssayQuestion() { saveCurrentEssayAnswer(); if (essayChallenge.currentIndex > 0) { essayChallenge.currentIndex--; showEssayQuestion(essayChallenge.currentIndex); } }
function startEssayTimer() { updateEssayTimerDisplay(); essayChallenge.timerInterval = setInterval(() => { essayChallenge.timeLeft--; updateEssayTimerDisplay(); if (essayChallenge.timeLeft <= 60) document.getElementById('essayTimer').classList.add('warning'); if (essayChallenge.timeLeft <= 0) submitEssayChallenge(); }, 1000); }
function updateEssayTimerDisplay() { const m = Math.floor(essayChallenge.timeLeft / 60), s = essayChallenge.timeLeft % 60; document.getElementById('essayTimerDisplay').textContent = `${m}:${s.toString().padStart(2, '0')}`; }
async function submitEssayChallenge() { saveCurrentEssayAnswer(); clearInterval(essayChallenge.timerInterval); essayChallenge.active = false; document.getElementById('essayContainer').style.display = 'none'; document.getElementById('essayResult').style.display = 'block'; document.getElementById('gradingStatus').style.display = 'flex'; document.getElementById('essayScores').style.display = 'none'; const scoresContainer = document.getElementById('essayScores'); scoresContainer.innerHTML = ''; for (let i = 0; i < essayChallenge.questions.length; i++) { const q = essayChallenge.questions[i]; const answer = essayChallenge.answers[i]; let feedback = '', score = 0; if (!answer || answer.trim().length < 10) { feedback = 'لم يتم الإجابة أو قصيرة'; score = 0; } else { try { const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: `أنت مصحح امتحانات. قيّم الإجابة من 10.\n\nالسؤال: ${q.questionAr}\nالإجابة النموذجية: ${q.answerAr}\nإجابة الطالب: ${answer}\n\nالدرجة: X/10\nالتعليق: ...` }] }] }) }); const data = await response.json(); const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || ''; const scoreMatch = aiResponse.match(/الدرجة:\s*(\d+)/); score = scoreMatch ? parseInt(scoreMatch[1]) : 5; feedback = aiResponse.replace(/الدرجة:\s*\d+\/10\s*/g, '').trim() || 'تم التقييم'; } catch (e) { feedback = 'تعذر التصحيح'; score = 5; } } const card = document.createElement('div'); card.className = 'essay-score-card'; card.innerHTML = `<h4>السؤال ${i + 1}</h4><p class="question">${q.questionAr}</p><p class="question-en">${q.questionEn}</p><p class="answer">${answer || 'لم يتم الإجابة'}</p><div class="feedback">${feedback}</div><span class="score-badge">${score}/10</span>`; scoresContainer.appendChild(card); } document.getElementById('gradingStatus').style.display = 'none'; document.getElementById('essayScores').style.display = 'flex'; }
function restartEssayChallenge() { document.getElementById('essayResult').style.display = 'none'; document.getElementById('essayIntro').style.display = 'block'; document.getElementById('essayTimer').classList.remove('warning'); }

// Essay Bank
function renderEssayBank(showAll = false) { const container = document.getElementById('essayQuestionsList'); if (!container) return; container.innerHTML = ''; const searchTerm = document.getElementById('essaySearchInput')?.value?.toLowerCase() || ''; filteredEssay = essayQuestions; if (searchTerm) { filteredEssay = essayQuestions.filter(q => q.questionAr.toLowerCase().includes(searchTerm) || q.questionEn.toLowerCase().includes(searchTerm) || q.answerAr.toLowerCase().includes(searchTerm) || q.answerEn.toLowerCase().includes(searchTerm)); currentEssayPage = 1; } if (!filteredEssay.length) { container.innerHTML = '<p class="no-records">لا توجد أسئلة مقالية حالياً</p>'; return; } const essaysToShow = showAll ? filteredEssay : filteredEssay.slice(0, currentEssayPage * ESSAYS_PER_PAGE); essaysToShow.forEach((q, index) => { const item = document.createElement('div'); item.className = 'essay-question-item'; item.innerHTML = `<h4>${index + 1}. <span class="lang-label">🇸🇦</span> ${q.questionAr}</h4><p class="question-en"><span class="lang-label">🇬🇧</span> ${q.questionEn}</p><div class="model-answer"><div class="answer-section"><strong><span class="lang-label">🇸🇦</span> الإجابة بالعربي:</strong><p>${q.answerAr}</p></div><div class="answer-section"><strong><span class="lang-label">🇬🇧</span> Answer in English:</strong><p>${q.answerEn}</p></div></div>`; item.onclick = () => item.classList.toggle('expanded'); container.appendChild(item); }); const remaining = filteredEssay.length - essaysToShow.length; if (remaining > 0 && !showAll) { const btn = document.createElement('button'); btn.className = 'show-more-btn'; btn.innerHTML = `<i class="fas fa-chevron-down"></i> عرض المزيد (${remaining} سؤال متبقي)`; btn.onclick = (e) => { e.stopPropagation(); currentEssayPage++; renderEssayBank(); }; container.appendChild(btn); } }
function filterEssayQuestions() { currentEssayPage = 1; renderEssayBank(); }

// AI Chat using Groq
async function askAI() {
    const i = document.getElementById('aiInput'), q = i.value.trim();
    if (!q) return;
    const m = document.getElementById('aiMessages');
    m.innerHTML += `<div class="ai-message user"><div class="message-avatar"><i class="fas fa-user"></i></div><div class="message-content"><p>${q}</p></div></div>`;
    i.value = '';
    m.scrollTop = m.scrollHeight;
    const ld = document.createElement('div');
    ld.id = 'loading';
    ld.className = 'ai-message bot';
    ld.innerHTML = '<div class="message-avatar"><i class="fas fa-robot"></i></div><div class="message-content"><p>جاري التفكير...</p></div>';
    m.appendChild(ld);
    m.scrollTop = m.scrollHeight;
    try {
        const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY_CHAT}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [{
                    role: 'system',
                    content: `أنت مساعد تعليمي متخصص في الرياضيات. أجب بالعربية بشكل واضح ومفصل.`
                }, {
                    role: 'user',
                    content: q
                }],
                temperature: 0.7,
                max_tokens: 1024
            })
        });
        const d = await r.json();
        const ans = d.choices?.[0]?.message?.content || 'عذراً، حاول مرة أخرى.';
        ld.remove();
        m.innerHTML += `<div class="ai-message bot"><div class="message-avatar"><i class="fas fa-robot"></i></div><div class="message-content"><p>${ans.replace(/\n/g, '<br>')}</p></div></div>`;
        m.scrollTop = m.scrollHeight;
    } catch (e) {
        ld.remove();
        m.innerHTML += `<div class="ai-message bot"><div class="message-avatar"><i class="fas fa-robot"></i></div><div class="message-content"><p>عذراً، حدث خطأ.</p></div></div>`;
    }
}
document.getElementById('aiInput')?.addEventListener('keypress', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); askAI(); } });

// Essay Bank with Firebase Integration
let essayBankQuestions = [];
let essayBankLoaded = false;
let filteredEssayBank = [];

// Load essay questions from Firebase
async function loadEssayBankFromFirebase() {
    if (essayBankLoaded) return;

    const container = document.getElementById('essayQuestionsList');
    if (!container) return;

    try {
        container.innerHTML = '<div class="loading-message"><i class="fas fa-spinner fa-spin"></i> جاري تحميل الأسئلة...</div>';

        if (!db) {
            container.innerHTML = '<div class="no-questions-message"><i class="fas fa-exclamation-circle"></i><h3>لا توجد أسئلة مقالية حالياً</h3><p>سيتم إضافة الأسئلة قريباً</p></div>';
            return;
        }

        const snapshot = await db.collection(`essay_questions_${SUBJECT_ID}`).get();

        if (snapshot.empty) {
            container.innerHTML = '<div class="no-questions-message"><i class="fas fa-book-open"></i><h3>لا توجد أسئلة مقالية حالياً</h3><p>سيتم إضافة الأسئلة من لوحة الإدارة</p></div>';
            document.getElementById('essayDisplayedCount').textContent = '0';
            essayBankLoaded = true;
            return;
        }

        essayBankQuestions = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            essayBankQuestions.push({
                id: doc.id,
                question: data.question || '',
                answer: data.answer || '',
                ...data
            });
        });

        essayBankLoaded = true;
        renderEssayBankQuestions();

    } catch (error) {
        console.error('Error loading essay questions:', error);
        container.innerHTML = '<div class="no-questions-message"><i class="fas fa-exclamation-triangle"></i><h3>حدث خطأ في التحميل</h3><p>يرجى المحاولة مرة أخرى</p></div>';
    }
}

// Render essay bank questions
function renderEssayBankQuestions() {
    const container = document.getElementById('essayQuestionsList');
    if (!container) return;

    const searchTerm = document.getElementById('essaySearchInput')?.value?.toLowerCase() || '';

    filteredEssayBank = essayBankQuestions;
    if (searchTerm) {
        filteredEssayBank = essayBankQuestions.filter(q =>
            q.question.toLowerCase().includes(searchTerm) ||
            (q.answer && q.answer.toLowerCase().includes(searchTerm))
        );
    }

    document.getElementById('essayDisplayedCount').textContent = filteredEssayBank.length;

    if (filteredEssayBank.length === 0) {
        container.innerHTML = '<div class="no-questions-message"><i class="fas fa-search"></i><h3>لا توجد نتائج</h3><p>جرب كلمات بحث أخرى</p></div>';
        return;
    }

    container.innerHTML = '';
    filteredEssayBank.forEach((q, index) => {
        const card = document.createElement('div');
        card.className = 'essay-question-card';
        card.innerHTML = `
            <div class="question-number">سؤال ${index + 1}</div>
            <div class="question-text">${q.question}</div>
            ${q.answer ? `
                <div class="question-answer collapsed" id="essay-answer-${index}">
                    <strong>الإجابة النموذجية:</strong>
                    <p>${q.answer}</p>
                </div>
                <button class="toggle-answer-btn" onclick="toggleEssayAnswer(${index})">
                    <i class="fas fa-eye"></i> عرض الإجابة
                </button>
            ` : ''}
        `;
        container.appendChild(card);
    });
}

// Toggle essay answer visibility
function toggleEssayAnswer(index) {
    const answerDiv = document.getElementById(`essay-answer-${index}`);
    const button = answerDiv.nextElementSibling;

    if (answerDiv.classList.contains('collapsed')) {
        answerDiv.classList.remove('collapsed');
        answerDiv.classList.add('expanded');
        button.innerHTML = '<i class="fas fa-eye-slash"></i> إخفاء الإجابة';
        button.classList.add('active');
    } else {
        answerDiv.classList.add('collapsed');
        answerDiv.classList.remove('expanded');
        button.innerHTML = '<i class="fas fa-eye"></i> عرض الإجابة';
        button.classList.remove('active');
    }
}

// Filter essay bank questions
function filterEssayQuestions() {
    renderEssayBankQuestions();
}

// Lazy loading with Intersection Observer
const essayBankSection = document.getElementById('essay-bank');
if (essayBankSection) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !essayBankLoaded) {
                loadEssayBankFromFirebase();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    observer.observe(essayBankSection);
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    const s = localStorage.getItem('userProfile'); if (s) { try { const p = JSON.parse(s); if (p.name) { document.getElementById('challengerName').value = p.name; const en = document.getElementById('essayPlayerName'); if (en) en.value = p.name; } } catch (e) { } } document.getElementById('totalQuestions').textContent = questions.length; const te = document.getElementById('totalEssay'); if (te) te.textContent = essayQuestions.length; loadLeaderboard(); renderQuestionsBank(); renderEssayBank();

    // Initialize KaTeX Auto-Rendering
    initializeKaTeX();
});

// KaTeX Initialization and Configuration
function initializeKaTeX() {
    // Wait for KaTeX to load
    if (typeof renderMathInElement === 'undefined') {
        setTimeout(initializeKaTeX, 100);
        return;
    }

    // Configure KaTeX options for Natural Display
    const katexOptions = {
        delimiters: [
            { left: '$$', right: '$$', display: true },      // Display mode (centered, large)
            { left: '\\[', right: '\\]', display: true },    // Display mode alternative
            { left: '$', right: '$', display: false },       // Inline mode
            { left: '\\(', right: '\\)', display: false }    // Inline mode alternative
        ],
        throwOnError: false,
        errorColor: '#ff6b6b',
        displayMode: true,  // Default to display mode
        output: 'html',
        trust: true,
        strict: false,
        macros: {
            "\\RR": "\\mathbb{R}",
            "\\NN": "\\mathbb{N}",
            "\\ZZ": "\\mathbb{Z}",
            "\\QQ": "\\mathbb{Q}",
            "\\CC": "\\mathbb{C}"
        }
    };

    // Render math in the entire document
    renderMathInElement(document.body, katexOptions);

    console.log('✅ KaTeX initialized with Natural Display mode');
}

// Re-render math after dynamic content updates
function renderMathInContent(element) {
    if (typeof renderMathInElement === 'undefined') return;

    const katexOptions = {
        delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '\\[', right: '\\]', display: true },
            { left: '$', right: '$', display: false },
            { left: '\\(', right: '\\)', display: false }
        ],
        throwOnError: false,
        errorColor: '#ff6b6b',
        displayMode: true
    };

    renderMathInElement(element, katexOptions);
}

// Override renderQuestionsBank to include math rendering
const originalRenderQuestionsBank = renderQuestionsBank;
renderQuestionsBank = function (showAll = false) {
    originalRenderQuestionsBank(showAll);
    setTimeout(() => {
        const container = document.getElementById('questionsList');
        if (container) renderMathInContent(container);
    }, 100);
};

// Override renderEssayBankQuestions to include math rendering
const originalRenderEssayBankQuestions = renderEssayBankQuestions;
renderEssayBankQuestions = function () {
    originalRenderEssayBankQuestions();
    setTimeout(() => {
        const container = document.getElementById('essayQuestionsList');
        if (container) renderMathInContent(container);
    }, 100);
};

// Render math in challenge questions
const originalShowQuestion = showQuestion;
showQuestion = function (i) {
    originalShowQuestion(i);
    setTimeout(() => {
        const questionText = document.getElementById('questionText');
        const optionsContainer = document.getElementById('optionsContainer');
        if (questionText) renderMathInContent(questionText);
        if (optionsContainer) renderMathInContent(optionsContainer);
    }, 50);
};

// =============================================
// SUMMARIES SECTION
// =============================================

// Load summaries from Firebase
async function loadSummaries() {
    const container = document.getElementById('summariesList');
    if (!container) return;

    try {
        container.innerHTML = '<div class="loading-message"><i class="fas fa-spinner fa-spin"></i> جاري تحميل الملخصات...</div>';

        if (!db) {
            container.innerHTML = `
                <div class="no-summaries-message">
                    <i class="fas fa-file-alt"></i>
                    <h3>لا توجد ملخصات حالياً</h3>
                    <p>سيتم إضافة ملخصات قريباً</p>
                </div>
            `;
            return;
        }

        const snapshot = await db.collection(`summaries_${SUBJECT_ID}`).orderBy('order', 'asc').get();

        if (snapshot.empty) {
            container.innerHTML = `
                <div class="no-summaries-message">
                    <i class="fas fa-file-alt"></i>
                    <h3>لا توجد ملخصات حالياً</h3>
                    <p>سيتم إضافة ملخصات من لوحة الإدارة</p>
                </div>
            `;
            return;
        }

        container.innerHTML = '';
        snapshot.forEach(doc => {
            const data = doc.data();
            const card = createSummaryCard(data, doc.id);
            container.appendChild(card);
        });

    } catch (error) {
        console.error('Error loading summaries:', error);
        container.innerHTML = `
            <div class="no-summaries-message">
                <i class="fas fa-exclamation-circle"></i>
                <h3>خطأ في تحميل الملخصات</h3>
                <p>حاول تحديث الصفحة</p>
            </div>
        `;
    }
}

// Create summary card element
function createSummaryCard(summary, docId) {
    const card = document.createElement('div');
    card.className = 'summary-card';

    let actionButton = '';
    if (summary.pdfUrl) {
        actionButton = `<a href="${summary.pdfUrl}" target="_blank" class="summary-btn"><i class="fas fa-download"></i> تحميل PDF</a>`;
    } else if (summary.externalUrl) {
        actionButton = `<a href="${summary.externalUrl}" target="_blank" class="summary-btn external-link"><i class="fas fa-external-link-alt"></i> فتح الرابط</a>`;
    } else if (summary.content) {
        actionButton = `<button class="summary-btn" onclick="viewSummaryContent('${docId}')"><i class="fas fa-eye"></i> عرض المحتوى</button>`;
    }

    card.innerHTML = `
        ${summary.imageUrl ? `<div class="summary-image"><img src="${summary.imageUrl}" alt="${summary.title}" loading="lazy"></div>` : ''}
        <div class="summary-content">
            <h3>${summary.title || 'ملخص'}</h3>
            ${summary.description ? `<p>${summary.description}</p>` : ''}
            <div class="summary-meta">
                ${summary.author ? `<span><i class="fas fa-user"></i> ${summary.author}</span>` : ''}
            </div>
            ${actionButton}
        </div>
    `;

    return card;
}

// View summary content in modal (optional feature)
function viewSummaryContent(docId) {
    // This can be expanded to show content in a modal
    console.log('View summary:', docId);
}

// Load summaries on page load
document.addEventListener('DOMContentLoaded', async () => {
    loadSummaries();
    // Initialize Essay Challenge with Firebase questions
    await loadEssayChallengeQuestions();
});

// Load Essay Challenge Questions from Firebase
async function loadEssayChallengeQuestions() {
    if (!db) {
        if (essayQuestions.length > 0 && typeof initEssayChallenge === 'function') {
            initEssayChallenge(SUBJECT_ID, essayQuestions);
        }
        return;
    }
    try {
        const snapshot = await db.collection(`essay_questions_${SUBJECT_ID}`).get();
        if (snapshot.empty) {
            if (essayQuestions.length > 0 && typeof initEssayChallenge === 'function') {
                initEssayChallenge(SUBJECT_ID, essayQuestions);
            }
            return;
        }
        const firebaseEssays = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            firebaseEssays.push({
                id: doc.id,
                questionAr: data.question || data.questionAr || '',
                questionEn: data.questionEn || data.question || '',
                answerAr: data.answer || data.answerAr || '',
                answerEn: data.answerEn || data.answer || '',
                source: 'firebase'
            });
        });
        essayQuestions.push(...firebaseEssays);
        const countEl = document.getElementById('essayDisplayedCount');
        if (countEl) countEl.textContent = essayQuestions.length;
        if (typeof initEssayChallenge === 'function') {
            initEssayChallenge(SUBJECT_ID, essayQuestions);
        }
        console.log(`✅ Loaded ${firebaseEssays.length} essay questions for ${SUBJECT_ID}`);
    } catch (error) {
        console.error('Error loading essay questions:', error);
        if (essayQuestions.length > 0 && typeof initEssayChallenge === 'function') {
            initEssayChallenge(SUBJECT_ID, essayQuestions);
        }
    }
}
