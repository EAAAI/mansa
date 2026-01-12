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

const SUBJECT_ID = 'it';
const SUBJECT_NAME = 'IT';
const CHALLENGE_TIME = 300;
const QUESTIONS_PER_CHALLENGE = 15;
const GROQ_API_KEY = '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';

// MCQ Questions - Bilingual Format (questionAr, questionEn, options, correct)
// Add your questions here in this format:
// { questionAr: "السؤال بالعربية", questionEn: "Question in English", options: ["Option 1", "Option 2", "Option 3", "Option 4"], correct: 0 }
const questions = [
    // Empty - Add questions here
];

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
function updateActiveNav() { const sections = ['hero', 'summaries', 'bank', 'challenge', 'essay-bank', 'essay-challenge', 'leaderboard', 'ask-ai']; const navLinks = document.querySelectorAll('.nav-link'); let current = 'hero'; sections.forEach(id => { const s = document.getElementById(id); if (s && s.getBoundingClientRect().top <= 150) current = id; }); navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + current)); }
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
            b.innerHTML = `<span class="option-letter">${l}</span><span>${q.options[j]}</span>`;
            b.onclick = () => selectOption(j);
            c.appendChild(b);
        }
    });
    document.getElementById('prevBtn').disabled = i === 0;
    document.getElementById('nextBtn').style.display = i === QUESTIONS_PER_CHALLENGE - 1 ? 'none' : 'flex';
    document.getElementById('submitBtn').style.display = i === QUESTIONS_PER_CHALLENGE - 1 ? 'flex' : 'none';
}

function selectOption(j) { challenge.answers[challenge.currentIndex] = j; document.querySelectorAll('.option-btn').forEach((b, k) => b.classList.toggle('selected', k === j)); }
function nextQuestion() { if (challenge.currentIndex < QUESTIONS_PER_CHALLENGE - 1) showQuestion(++challenge.currentIndex); }
function prevQuestion() { if (challenge.currentIndex > 0) showQuestion(--challenge.currentIndex); }
function startTimer() { updateTimerDisplay(); challenge.timerInterval = setInterval(() => { challenge.timeLeft--; updateTimerDisplay(); if (challenge.timeLeft <= 60) document.getElementById('timer').classList.add('warning'); if (challenge.timeLeft <= 0) submitChallenge(); }, 1000); }
function updateTimerDisplay() { const m = Math.floor(challenge.timeLeft / 60), s = challenge.timeLeft % 60; document.getElementById('timerDisplay').textContent = `${m}:${s.toString().padStart(2, '0')}`; }
function submitChallenge() { clearInterval(challenge.timerInterval); let score = 0; challenge.questions.forEach((q, i) => { if (challenge.answers[i] === q.correct) score++; }); challenge.score = score; const time = CHALLENGE_TIME - challenge.timeLeft, pct = Math.round((score / QUESTIONS_PER_CHALLENGE) * 100); document.getElementById('challengeContainer').style.display = 'none'; document.getElementById('challengeResult').style.display = 'block'; document.getElementById('finalScore').textContent = `${score}/${QUESTIONS_PER_CHALLENGE}`; document.getElementById('finalTime').textContent = formatTime(time); document.getElementById('percentage').textContent = `${pct}%`; let icon, title; if (pct >= 90) { icon = '🏆'; title = 'ممتاز!'; } else if (pct >= 70) { icon = '🌟'; title = 'أحسنت!'; } else if (pct >= 50) { icon = '💪'; title = 'جيد!'; } else { icon = '📚'; title = 'حاول مرة أخرى'; } document.getElementById('resultIcon').textContent = icon; document.getElementById('resultTitle').textContent = title; saveToLeaderboard(score, time); }
function formatTime(s) { return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`; }
function restartChallenge() { document.getElementById('challengeResult').style.display = 'none'; document.getElementById('challengeIntro').style.display = 'block'; document.getElementById('timer').classList.remove('warning'); }

// Firebase
async function saveToLeaderboard(score, time) { if (!db) return; try { await db.collection(`leaderboard_${SUBJECT_ID}`).add({ name: challenge.userName, score, time, date: new Date().toISOString(), timestamp: firebase.firestore.FieldValue.serverTimestamp() }); loadLeaderboard(); } catch (e) { } }
async function loadLeaderboard() { if (!db) { document.getElementById('noRecords').style.display = 'block'; return; } try { const snap = await db.collection(`leaderboard_${SUBJECT_ID}`).orderBy('score', 'desc').orderBy('time', 'asc').limit(20).get(); const tb = document.getElementById('leaderboardBody'); tb.innerHTML = ''; if (snap.empty) { document.getElementById('noRecords').style.display = 'block'; return; } document.getElementById('noRecords').style.display = 'none'; document.getElementById('totalPlayers').textContent = snap.size; snap.docs.forEach((d, i) => { const data = d.data(); const tr = document.createElement('tr'); let r = i + 1; if (i === 0) r = '🥇'; else if (i === 1) r = '🥈'; else if (i === 2) r = '🥉'; tr.innerHTML = `<td>${r}</td><td>${data.name}</td><td>${data.score}/${QUESTIONS_PER_CHALLENGE}</td><td>${formatTime(data.time)}</td><td>${data.date ? new Date(data.date).toLocaleDateString('ar-EG') : '-'}</td>`; tb.appendChild(tr); }); } catch (e) { document.getElementById('noRecords').style.display = 'block'; } }

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
        q.options.forEach((opt, i) => { optionsHTML += `<button class="bank-option-btn" data-index="${i}" onclick="selectBankOption(this, ${q.correct})"><span class="option-letter">${letters[i]}</span><span class="option-text">${opt}</span><span class="option-icon"></span></button>`; });
        card.innerHTML = `<div class="bank-question-header"><h4>${index + 1}.</h4>${getQuestionText(q)}</div><div class="bank-options">${optionsHTML}</div><div class="bank-actions"><button class="show-answer-btn" onclick="showBankAnswer(this, ${q.correct})"><i class="fas fa-eye"></i> إظهار الإجابة</button><div class="answer-reveal" style="display: none;"><i class="fas fa-check-circle"></i><span>الإجابة الصحيحة: ${q.options[q.correct]}</span></div></div><div class="bank-feedback" style="display: none;"></div>`;
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
}
function selectBankOption(btn, correctIndex) { const card = btn.closest('.bank-question-card'); if (card.dataset.answered === 'true') return; const selectedIndex = parseInt(btn.dataset.index); const isCorrect = selectedIndex === correctIndex; card.dataset.answered = 'true'; card.querySelectorAll('.bank-option-btn').forEach((opt, i) => { opt.disabled = true; if (i === correctIndex) { opt.classList.add('correct'); opt.querySelector('.option-icon').innerHTML = '<i class="fas fa-check"></i>'; } else if (i === selectedIndex && !isCorrect) { opt.classList.add('wrong'); opt.querySelector('.option-icon').innerHTML = '<i class="fas fa-times"></i>'; } }); const feedback = card.querySelector('.bank-feedback'); feedback.style.display = 'block'; feedback.innerHTML = isCorrect ? '<i class="fas fa-check-circle"></i> إجابة صحيحة! 🎉' : '<i class="fas fa-times-circle"></i> إجابة خاطئة.'; feedback.className = 'bank-feedback ' + (isCorrect ? 'correct' : 'wrong'); card.querySelector('.show-answer-btn').style.display = 'none'; card.querySelector('.answer-reveal').style.display = 'flex'; }
function showBankAnswer(btn, correctIndex) { const card = btn.closest('.bank-question-card'); card.querySelectorAll('.bank-option-btn').forEach((opt, i) => { if (i === correctIndex) { opt.classList.add('correct'); opt.querySelector('.option-icon').innerHTML = '<i class="fas fa-check"></i>'; } }); btn.style.display = 'none'; card.querySelector('.answer-reveal').style.display = 'flex'; }
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

// AI
async function askAI() { const i = document.getElementById('aiInput'), q = i.value.trim(); if (!q) return; const m = document.getElementById('aiMessages'); m.innerHTML += `<div class="ai-message user"><div class="message-avatar"><i class="fas fa-user"></i></div><div class="message-content"><p>${q}</p></div></div>`; i.value = ''; m.scrollTop = m.scrollHeight; const ld = document.createElement('div'); ld.id = 'loading'; ld.className = 'ai-message bot'; ld.innerHTML = '<div class="message-avatar"><i class="fas fa-robot"></i></div><div class="message-content"><p>جاري التفكير...</p></div>'; m.appendChild(ld); m.scrollTop = m.scrollHeight; try { const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: `أنت مساعد تعليمي متخصص في تكنولوجيا المعلومات IT. أجب بالعربية:\n\n${q}` }] }] }) }); const d = await r.json(); const ans = d.candidates?.[0]?.content?.parts?.[0]?.text || 'عذراً، حاول مرة أخرى.'; ld.remove(); m.innerHTML += `<div class="ai-message bot"><div class="message-avatar"><i class="fas fa-robot"></i></div><div class="message-content"><p>${ans.replace(/\n/g, '<br>')}</p></div></div>`; m.scrollTop = m.scrollHeight; } catch (e) { ld.remove(); m.innerHTML += `<div class="ai-message bot"><div class="message-avatar"><i class="fas fa-robot"></i></div><div class="message-content"><p>عذراً، حدث خطأ.</p></div></div>`; } }
document.getElementById('aiInput')?.addEventListener('keypress', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); askAI(); } });

// Init
document.addEventListener('DOMContentLoaded', async () => {
    const s = localStorage.getItem('userProfile');
    if (s) {
        try {
            const p = JSON.parse(s);
            if (p.name) {
                document.getElementById('challengerName').value = p.name;
                const en = document.getElementById('essayPlayerName');
                if (en) en.value = p.name;
                const ecn = document.getElementById('essayChallengerName');
                if (ecn) ecn.value = p.name;
            }
        } catch (e) { }
    }
    document.getElementById('totalQuestions').textContent = questions.length;
    const te = document.getElementById('totalEssay');
    if (te) te.textContent = essayQuestions.length;
    loadLeaderboard();
    renderQuestionsBank();
    renderEssayBank();
    loadSummaries();

    // Initialize Essay Challenge with Firebase questions
    await loadEssayChallengeQuestions();
});

// Load Essay Challenge Questions from Firebase
async function loadEssayChallengeQuestions() {
    if (!db) {
        // Use hardcoded questions if available
        if (essayQuestions.length > 0 && typeof initEssayChallenge === 'function') {
            initEssayChallenge(SUBJECT_ID, essayQuestions);
        }
        return;
    }

    try {
        const snapshot = await db.collection(`essay_questions_${SUBJECT_ID}`).get();

        if (snapshot.empty) {
            // Use hardcoded questions
            if (essayQuestions.length > 0 && typeof initEssayChallenge === 'function') {
                initEssayChallenge(SUBJECT_ID, essayQuestions);
            }
            return;
        }

        // Load Firebase questions
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

        // Merge with hardcoded questions
        essayQuestions.push(...firebaseEssays);

        // Update count display
        const countEl = document.getElementById('essayDisplayedCount');
        if (countEl) countEl.textContent = essayQuestions.length;

        // Initialize Essay Challenge
        if (typeof initEssayChallenge === 'function') {
            initEssayChallenge(SUBJECT_ID, essayQuestions);
        }

        console.log(`✅ Loaded ${firebaseEssays.length} essay questions for ${SUBJECT_ID}`);

    } catch (error) {
        console.error('Error loading essay questions:', error);
        // Fallback to hardcoded
        if (essayQuestions.length > 0 && typeof initEssayChallenge === 'function') {
            initEssayChallenge(SUBJECT_ID, essayQuestions);
        }
    }
}

// =============================================
// SUMMARIES SECTION
// =============================================
const IT_PART_1_CONTENT = `
<div class="interactive-summary" dir="rtl">
    <div class="summary-intro" style="margin-bottom: 30px; padding: 20px; background: rgba(255,255,255,0.05); border-radius: 10px;">
        <p style="font-size: 1.2em; line-height: 1.8;">دلوقتي انا هذكر كل الهاردوير اللي اتذكر في المنهج و الانواع و الذاكره و بعدين هندخل على الشرح بتسلسل عشان نفهم كل حاجه شغاله ازاي و وظيفتها ايه</p>
    </div>

    <div class="summary-section">
        <h3 class="section-toggle" style="color: #4facfe; margin: 30px 0 20px; border-bottom: 2px solid #4facfe; padding-bottom: 10px;">
            1. وحدة المعالجة المركزية واللوحة الأم (The Core)
            <i class="fas fa-chevron-down" style="font-size: 0.8em;"></i>
        </h3>
        
        <div class="section-content collapsed">
            <div class="term-group">
                <h4 style="margin: 20px 0 10px;">وحدة المعالجة المركزية (CPU)</h4>
                <p>تتكون من شقين أساسيين:</p>
                <ul style="list-style: none; padding-right: 20px;">
                    <li style="margin-bottom: 15px;">
                        <span class="interactive-term">وحدة التحكم (CU)</span> 
                        <span class="term-expansion">"الدماغ المدير" الذي يجلب التعليمات، يحللها، ويوجه تدفق البيانات بين أجزاء الحاسوب.</span>
                    </li>
                    <li style="margin-bottom: 15px;">
                        <span class="interactive-term">وحدة الحساب والمنطق (ALU)</span> 
                        <span class="term-expansion">"المنفذ" الذي يقوم بالعمليات الرياضية (+، -، *، /) والعمليات المنطقية (AND, OR, NOT).</span>
                    </li>
                </ul>
            </div>

            <div class="term-group">
                <h4 style="margin: 20px 0 10px;">
                    <span class="interactive-term">اللوحة الأم (Motherboard)</span>
                    <span class="term-expansion">هي اللوحة التي تحتضن جميع المكونات وتسمح لها بالتواصل عبر النواقل (Buses).</span>
                </h4>
            </div>

            <div class="term-group">
                <h4 style="margin: 20px 0 10px;">المنافذ (Ports) وشقوق التوسعة</h4>
                <ul style="list-style: none; padding-right: 20px;">
                    <li style="margin-bottom: 10px;"><span class="interactive-term">Serial Ports (COM1 & COM2)</span> <span class="term-expansion">تنقل البيانات بت تلو الآخر (تسلسلي). كانت تُستخدم قديماً للفأرة.</span></li>
                    <li style="margin-bottom: 10px;"><span class="interactive-term">Parallel Ports (LPT1 & LPT2)</span> <span class="term-expansion">تنقل عدة بتات (8 بت) في وقت واحد. كانت مخصصة للطابعات.</span></li>
                    <li style="margin-bottom: 10px;"><span class="interactive-term">PS/2 Ports</span> <span class="term-expansion">منافذ دائرية؛ البنفسجي للوحة المفاتيح والأخضر للفأرة.</span></li>
                    <li style="margin-bottom: 10px;"><span class="interactive-term">USB (Universal Serial Bus)</span> <span class="term-expansion">المنفذ العالمي الحديث؛ سريع، يدعم نقل البيانات والطاقة، ويدعم "التوصيل والتشغيل" (Plug and Play).</span></li>
                    <li style="margin-bottom: 10px;"><span class="interactive-term">Expansion Slots</span> <span class="term-expansion">فتحات تسمح بإضافة وظائف جديدة للجهاز عبر "كروت" (مثل كارت الشاشة أو كارت الشبكة).</span></li>
                </ul>
            </div>
        </div>
    </div>

    <div class="summary-section">
        <h3 class="section-toggle" style="color: #4facfe; margin: 40px 0 20px; border-bottom: 2px solid #4facfe; padding-bottom: 10px;">
            2. هرمية الذاكرة (Memory Hierarchy)
            <i class="fas fa-chevron-down" style="font-size: 0.8em;"></i>
        </h3>
        
        <div class="section-content collapsed">
            <p>تترتب الذاكرة من الأسرع والأصغر (داخل المعالج) إلى الأبطأ والأكبر (خارج المعالج):</p>
            
            <div class="term-group">
                <h4 style="margin: 20px 0 10px;">أولاً: المسجلات (Registers)</h4>
                <p>وهي أسرع أنواع الذاكرة، وتنقسم حسب وظيفتها:</p>
                <ul style="list-style: none; padding-right: 20px;">
                    <li style="margin-bottom: 10px;"><strong>1. واجهة الذاكرة:</strong>
                        <ul>
                            <li><span class="interactive-term">MAR</span> <span class="term-expansion">يحمل "عنوان" الخلية المطلوب الوصول إليها.</span></li>
                            <li><span class="interactive-term">MDR</span> <span class="term-expansion">يحمل "البيانات" الفعالية المتبادلة مع الذاكرة.</span></li>
                        </ul>
                    </li>
                    <li style="margin-bottom: 10px;"><strong>2. وحدة التحكم:</strong>
                        <ul>
                            <li><span class="interactive-term">PC</span> <span class="term-expansion">يحمل عنوان التعليمة "التالية".</span></li>
                            <li><span class="interactive-term">IR</span> <span class="term-expansion">يحمل التعليمة "الحالية" التي يتم تنفيذها.</span></li>
                        </ul>
                    </li>
                    <li style="margin-bottom: 10px;"><strong>3. وحدة المعالجة:</strong>
                        <ul>
                            <li><span class="interactive-term">TEMP</span> <span class="term-expansion">مسجل مؤقت لنتائج الـ ALU الوسيطة.</span></li>
                        </ul>
                    </li>
                    <li style="margin-bottom: 10px;"><strong>4. واجهة الإدخال/الإخراج (I/O):</strong>
                        <ul>
                            <li><span class="interactive-term">لوحة المفاتيح</span> <span class="term-expansion">KBDR للبيانات، KBSR للحالة.</span></li>
                            <li><span class="interactive-term">الشاشة</span> <span class="term-expansion">DDR للبيانات، DSR للحالة.</span></li>
                        </ul>
                    </li>
                </ul>
            </div>

            <div class="term-group">
                <h4 style="margin: 20px 0 10px;">
                    <span class="interactive-term">ثانياً: الذاكرة المخبئية (Cache)</span>
                    <span class="term-expansion">ذاكرة وسيطة سريعة جداً تقع بين المعالج والرام لتخزين البيانات المتكررة.</span>
                </h4>
            </div>

            <div class="term-group">
                <h4 style="margin: 20px 0 10px;">ثالثاً: الذاكرة العشوائية (RAM)</h4>
                <ul style="list-style: none; padding-right: 20px;">
                    <li style="margin-bottom: 10px;"><span class="interactive-term">SRAM (Static)</span> <span class="term-expansion">سريعة جداً، غالية، لا تحتاج لتنشيط (Refresh)؛ تستخدم في الـ Cache.</span></li>
                    <li style="margin-bottom: 10px;"><span class="interactive-term">DRAM (Dynamic)</span> <span class="term-expansion">أبطأ قليلاً، أرخص، تحتاج لتنشيط مستمر؛ هي الـ RAM الأساسية.</span></li>
                    <li style="margin-bottom: 10px;"><span class="interactive-term">DDR RAM</span> <span class="term-expansion">تقنية تضاعف سرعة نقل البيانات في كل دورة ساعة.</span></li>
                </ul>
            </div>

            <div class="term-group">
                <h4 style="margin: 20px 0 10px;">رابعاً: الذاكرة الدائمة (ROM)</h4>
                <ul style="list-style: none; padding-right: 20px;">
                    <li style="margin-bottom: 10px;"><span class="interactive-term">PROM</span> <span class="term-expansion">تبرمج مرة واحدة فقط من قبل المستخدم.</span></li>
                    <li style="margin-bottom: 10px;"><span class="interactive-term">EPROM</span> <span class="term-expansion">يمكن مسحها وإعادة برمجتها باستخدام الأشعة فوق البنفسجية (UV).</span></li>
                </ul>
            </div>
        </div>
    </div>

    <div class="summary-section">
        <h3 class="section-toggle" style="color: #4facfe; margin: 40px 0 20px; border-bottom: 2px solid #4facfe; padding-bottom: 10px;">
            3. وحدات التخزين الثانوية (Secondary Storage)
            <i class="fas fa-chevron-down" style="font-size: 0.8em;"></i>
        </h3>
        
        <div class="section-content collapsed">
            <p>تستخدم للتخزين الدائم طويل الأمد لأنها لا تفقد بياناتها بانقطاع الكهرباء:</p>
            
            <div class="term-group">
                <h4 style="margin: 20px 0 10px;">
                    <span class="interactive-term">القرص الصلب (Hard Disk)</span>
                    <span class="term-expansion">
                        • يعتمد على تقنية المغناطيسية (أقراص تدور ورأس قراءة/كتابة).<br>
                        • يتميز بسعة تخزينية ضخمة وسعر منخفض مقارنة بالرام، لكنه أبطأ بكثير.
                    </span>
                </h4>
            </div>

            <div class="term-group">
                <h4 style="margin: 20px 0 10px;">
                    <span class="interactive-term">الشريط المغناطيسي (Magnetic Tape)</span>
                    <span class="term-expansion">
                        • أقدم وسائل التخزين؛ يعتمد على الوصول التسلسلي (Sequential Access) للبيانات (يجب أن تمر على كل البيانات لتصل لما تريد).<br>
                        • يستخدم حالياً فقط لعمل "نسخ احتياطية" (Backups) ضخمة للأرشيف لرخص ثمنه الشديد.
                    </span>
                </h4>
            </div>
        </div>
    </div>

    <div class="summary-section">
        <h3 class="section-toggle" style="color: #4facfe; margin: 40px 0 20px; border-bottom: 2px solid #4facfe; padding-bottom: 10px;">
            4. تعريف سرعة الساعة (Clock Speed)
            <i class="fas fa-chevron-down" style="font-size: 0.8em;"></i>
        </h3>
        
        <div class="section-content collapsed">
            <p>هي التردد الذي يعمل به المعالج، وهي التي تحدد عدد العمليات أو النبضات التي يمكن للمعالج تنفيذها في الثانية الواحدة.</p>
            
            <div class="term-group">
                <h4 style="margin: 20px 0 10px;">
                    <span class="interactive-term">الوظيفة التقنية (Synchronizer)</span>
                    <span class="term-expansion">
                        تعمل الساعة كمنسق؛ حيث تضمن أن جميع أجزاء المعالج (الـ CU والـ ALU والمسجلات) تعمل في تناغم تام. مع كل "نبضة" (Tick)، تنتقل البيانات من مسجل إلى آخر أو يتم تنفيذ جزء من التعليمة.
                    </span>
                </h4>
            </div>

            <div class="term-group">
                <h4 style="margin: 20px 0 10px;">وحدات القياس:</h4>
                <ul style="list-style: none; padding-right: 20px;">
                    <li style="margin-bottom: 10px;">
                        <span class="interactive-term">Hertz (Hz)</span>
                        <span class="term-expansion">نبضة واحدة في الثانية.</span>
                    </li>
                    <li style="margin-bottom: 10px;">
                        <span class="interactive-term">Megahertz (MHz)</span>
                        <span class="term-expansion">مليون نبضة في الثانية.</span>
                    </li>
                     <li style="margin-bottom: 10px;">
                        <span class="interactive-term">Gigahertz (GHz)</span>
                        <span class="term-expansion">مليار نبضة في الثانية (وهو المعيار في المعالجات الحديثة).</span>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</div>
    </div>
</div>
`;

const IT_PART_2_CONTENT = `
<div class="interactive-summary" dir="rtl">
    <div class="summary-intro" style="margin-bottom: 30px; padding: 20px; background: rgba(255,255,255,0.05); border-radius: 10px;">
        <p style="font-size: 1.2em; line-height: 1.8;">في هذا الجزء سنتعرف على كيفية بدء تشغيل الحاسوب وتسلسل العمليات المنطقية.</p>
    </div>

    <div class="summary-section">
        <h3 class="section-toggle" style="color: #4facfe; margin: 30px 0 20px; border-bottom: 2px solid #4facfe; padding-bottom: 10px;">
            1. نقطة البداية وحركة المسجلات
            <i class="fas fa-chevron-down" style="font-size: 0.8em;"></i>
        </h3>
        
        <div class="section-content collapsed">
            <div class="term-group">
                <h4 style="margin: 20px 0 10px;">نقطة البداية (The Reset Vector)</h4>
                <p style="line-height: 1.8;">
                    عند وصول الكهرباء، لا تبحث <span class="interactive-term">الـ CU</span><span class="term-expansion">هي جزء من المعالج يعمل كـ "مدير عمليات"؛ وظيفتها جلب التعليمات من الذاكرة وفهمها، ثم إصدار أوامر لبقية الأجزاء لتنفيذها.</span> بشكل عشوائي، بل يتم ضبط مسجل <span class="interactive-term">الـ PC</span><span class="term-expansion">مسجل يحمل عنوان التعليمة "التالية" المراد تنفيذها.</span> تلقائياً على عنوان ثابت ومحدد في الذاكرة (يُسمى Reset Vector). هذا العنوان يشير إلى مكان برنامج <span class="interactive-term">الـ Bootstrap</span><span class="term-expansion">هو أول برنامج صغير يتم تنفيذه فور تشغيل الحاسوب. مهمته الأساسية التأكد من سلامة العتاد (Hardware) ثم البحث عن نظام التشغيل ونقله إلى الرام.</span> داخل <span class="interactive-term">الـ ROM</span><span class="term-expansion">هي ذاكرة "دائمة" لا تمسح بياناتها حتى لو انقطعت الكهرباء. تُستخدم لتخزين البرامج الأساسية مثل تعليمات التشغيل الأولى.</span>.
                </p>
            </div>

            <div class="term-group">
                <h4 style="margin: 20px 0 10px;">حركة المسجلات</h4>
                <p style="line-height: 1.8;">
                    <span class="interactive-term">الـ CU</span><span class="term-expansion">هي جزء من المعالج يعمل كـ "مدير عمليات"؛ وظيفتها جلب التعليمات من الذاكرة وفهمها، ثم إصدار أوامر لبقية الأجزاء لتنفيذها.</span> تأخذ هذا العنوان من <span class="interactive-term">الـ PC</span><span class="term-expansion">مسجل يحمل عنوان التعليمة "التالية" المراد تنفيذها.</span> وتضعه في <span class="interactive-term">الـ MAR</span><span class="term-expansion">هي المكان اللي بيتخزن فيه ال Address او العنوان بتاع التعليمه او البيانات اللي موجوده في الذاكره عشان ال cu تشتغل منها. يعني ال cu لما بتعوز توصل لمكان في الذاكره بتبص في ال MAR عشان توصل لعنوانها و بعدين تعمل fetch</span>، ثم تطلق إشارة "قراءة" (Read) للـ <span class="interactive-term">ROM</span><span class="term-expansion">هي ذاكرة "دائمة" لا تمسح بياناتها حتى لو انقطعت الكهرباء.</span>. تعود التعليمة لتوضع في <span class="interactive-term">الـ MDR</span><span class="term-expansion">هي المكان اللي بيتخزن فيه البينات اللي جايه من الذاكره قبل ما المعالج يبدأ يشتغل عليها او يحطها في ال IR. يعني البيانات بتيجي من الذاكره تتحط في ال MDR لحد ما المعالج يأمر انها تتحط في ال IR</span> ومنها إلى <span class="interactive-term">الـ IR</span><span class="term-expansion">مسجل يحمل التعليمة "الحالية" التي يتم فك تشفيرها وتنفيذها الآن.</span> ليتم فك تشفيرها وتنفيذها.
                </p>
            </div>

            <div class="term-group">
                <h4 style="margin: 20px 0 10px;">الخطوة 2: تحميل نظام التشغيل</h4>
                <p style="line-height: 1.8;">
                    بمجرد تحميل نظام التشغيل، يقوم برنامج <span class="interactive-term">الـ Bootstrap</span><span class="term-expansion">هو أول برنامج صغير يتم تنفيذه فور تشغيل الحاسوب. مهمته الأساسية التأكد من سلامة العتاد (Hardware) ثم البحث عن نظام التشغيل ونقله إلى الرام.</span> بوضع القيمة 0000 (أو عنوان أول تعليمة في البرنامج) داخل مسجل <span class="interactive-term">الـ PC</span><span class="term-expansion">مسجل يحمل عنوان التعليمة "التالية" المراد تنفيذها.</span>. هذا الرقم يمثل "نقطة انطلاق" المعالج داخل <span class="interactive-term">الذاكرة العشوائية (RAM)</span><span class="term-expansion">ذاكرة الوصول العشوائي، وهي ذاكرة مؤقتة تستخدم لتخزين البيانات والبرامج أثناء التشغيل.</span>.
                </p>
            </div>
        </div>
    </div>

    <div class="summary-section">
        <h3 class="section-toggle" style="color: #4facfe; margin: 40px 0 20px; border-bottom: 2px solid #4facfe; padding-bottom: 10px;">
            2. عملية الـ Fetch (The Fetch Operation)
            <i class="fas fa-chevron-down" style="font-size: 0.8em;"></i>
        </h3>
        
        <div class="section-content collapsed">
            <div class="term-group">
                <h4 style="margin: 20px 0 10px;">الخطوة 3: مرحلة الجلب (Fetch)</h4>
                <p style="line-height: 1.8;">
                    تبدأ مرحلة الجلب؛ حيث تأمر <span class="interactive-term">الـ CU</span><span class="term-expansion">هي جزء من المعالج يعمل كـ "مدير عمليات"؛ وظيفتها جلب التعليمات من الذاكرة وفهمها، ثم إصدار أوامر لبقية الأجزاء لتنفيذها.</span> بنقل محتوى <span class="interactive-term">الـ PC</span><span class="term-expansion">مسجل يحمل عنوان التعليمة "التالية" المراد تنفيذها.</span> إلى مسجل <span class="interactive-term">الـ MAR</span><span class="term-expansion">هي المكان اللي بيتخزن فيه ال Address او العنوان بتاع التعليمه او البيانات اللي موجوده في الذاكره عشان ال cu تشتغل منها. يعني ال cu لما بتعوز توصل لمكان في الذاكره بتبص في ال MAR عشان توصل لعنوانها و بعدين تعمل fetch</span>. ومن هناك، يخرج العنوان عبر <span class="interactive-term">ناقل العناوين (Address Bus)</span><span class="term-expansion">هو مجموعة من الأسلاك التي تنقل "عنوان" المكان المراد الوصول إليه فقط. وهو أحادي الاتجاه (Unidirectional) لأن المعالج هو الوحيد الذي يطلب العناوين.</span> - وهو طريق ذو اتجاه واحد من المعالج للذاكرة - ليصل إلى <span class="interactive-term">مشفر العناوين (Address Decoder)</span><span class="term-expansion">هو دائرة منطقية داخل وحدة الذاكرة؛ وظيفتها أخذ العنوان الثنائي (Binary Address) وفك شفرته لتحديد "خلية واحدة" فقط من بين ملايين الخلايا لفتحها.</span>، والذي يقوم بفتح الخلية المحددة (مثلاً الخلية 0000) استعداداً لقراءة ما بداخلها. في هذه اللحظة، تزيد <span class="interactive-term">الـ CU</span><span class="term-expansion">هي جزء من المعالج يعمل كـ "مدير عمليات".</span> قيمة <span class="interactive-term">الـ PC</span><span class="term-expansion">مسجل يحمل عنوان التعليمة "التالية" المراد تنفيذها.</span> تلقائياً ليشير للتعليمة التالية.
                </p>
            </div>

            <div class="term-group">
                <h4 style="margin: 20px 0 10px;">الخطوة 4: إتمام الجلب</h4>
                <p style="line-height: 1.8;">
                    بعد تحديد العنوان، ترسل <span class="interactive-term">الـ CU</span><span class="term-expansion">هي جزء من المعالج يعمل كـ "مدير عمليات".</span> إشارة "قراءة". تنتقل البيانات (التعليمة) من الذاكرة عبر <span class="interactive-term">ناقل البيانات (Data Bus)</span><span class="term-expansion">ناقل ثنائي الاتجاه ينقل البيانات والتعليمات بين المعالج والذاكرة.</span> وتستقر في مسجل <span class="interactive-term">الـ MDR</span><span class="term-expansion">هي المكان اللي بيتخزن فيه البينات اللي جايه من الذاكره قبل ما المعالج يبدأ يشتغل عليها او يحطها في ال IR. يعني البيانات بتيجي من الذاكره تتحط في ال MDR لحد ما المعالج يأمر انها تتحط في ال IR</span>. فور استقرارها، تعطي <span class="interactive-term">الـ CU</span><span class="term-expansion">هي جزء من المعالج يعمل كـ "مدير عمليات".</span> أمراً بنقلها إلى مسجل <span class="interactive-term">الـ IR (مسجل التعليمة)</span><span class="term-expansion">مسجل يحمل التعليمة "الحالية" التي يتم فك تشفيرها وتنفيذها الآن.</span> لتكون تحت يد المعالج مباشرة.
                </p>
            </div>
        </div>
    </div>

    <div class="summary-section">
        <h3 class="section-toggle" style="color: #4facfe; margin: 40px 0 20px; border-bottom: 2px solid #4facfe; padding-bottom: 10px;">
            3. عملية الـ Decode (The Decode Operation)
            <i class="fas fa-chevron-down" style="font-size: 0.8em;"></i>
        </h3>
        
        <div class="section-content collapsed">
            <div class="term-group">
                <h4 style="margin: 20px 0 10px;">الحدث: بدء التحليل</h4>
                <p style="line-height: 1.8;">
                    بعد استقرار التعليمة في مسجل <span class="interactive-term">الـ IR</span><span class="term-expansion">هو مسجل داخلي في الـ CPU، وظيفته الوحيدة هي الاحتفاظ بالتعليمة الحالية "تحت يد" وحدة التحكم حتى يتم الانتهاء من تنفيذها.</span>، تبدأ مرحلة التحليل الفعلي.
                </p>
            </div>

            <div class="term-group">
                <h4 style="margin: 20px 0 10px;">الشرح التقني: كيف يفهم المعالج؟</h4>
                <p style="line-height: 1.8;">
                    يقوم <span class="interactive-term">مُشفر التعليمات (Instruction Decoder)</span><span class="term-expansion">دائرة منطقية معقدة تأخذ الـ Opcode وتخرج "نبضة كهربائية" على سلك واحد لتفعيل الدائرة المطلوبة (مثل دائرة الجمع).</span> بفرز البتات الأولى من التعليمة ليتعرف على <span class="interactive-term">الـ Opcode (رمز العملية)</span><span class="term-expansion">هو الرقم الثنائي الذي يمثل "الأمر" البرمجي. هو "الفعل" (ماذا نفعل؟).</span> بناءً على قواعد <span class="interactive-term">الـ ISA</span><span class="term-expansion">Instruction Set Architecture: هي "كتالوج" المعالج الذي يحدد الأوامر التي يفهمها (مثل ADD, MOV) وكيف يتم تمثيلها بالأصفار والواحدات.</span> الخاصة بالمعالج. بمجرد تحديد العملية، يقوم المُشفر بتفعيل <span class="interactive-term">خطوط التحكم (Control Lines)</span><span class="term-expansion">هي "النبضات الكهربائية" التي تفتح وتغلق البوابات المنطقية للمسجلات والـ ALU للتحكم في تدفق البيانات. تخيلها كمفاتيح الإضاءة.</span> المناسبة التي ترسل إشارات لبقية أجزاء الـ CPU (مثل <span class="interactive-term">الـ ALU</span> أو الذاكرة).
                </p>
                <p style="line-height: 1.8; margin-top: 15px;">
                     في الوقت نفسه، يتم تحليل البتات المتبقية (<span class="interactive-term">الـ Operands</span><span class="term-expansion">هي "المفعول به" (على ماذا نطبق الفعل؟). قد تكون بيانات مباشرة، أو عناوين في الذاكرة، أو أسماء مسجلات.</span>) لمعرفة ما إذا كانت تمثل بيانات مباشرة أو "عناوين" تحتاج <span class="interactive-term">الـ CU</span> لجلبها في الخطوة التالية. تنتهي هذه المرحلة وقد "فهم" المعالج تماماً ما هو المطلوب منه والمسارات الكهربائية التي يجب فتحها للتنفيذ.
                </p>
            </div>

            <div class="term-group">
                <h4 style="margin: 20px 0 10px;">ماذا يحدث في العمق؟ (إضافات تقنية)</h4>
                <ul style="list-style: none; padding-right: 15px;">
                    <li style="margin-bottom: 10px; position: relative;">
                        <strong style="color: #4facfe;">حساب العناوين (Effective Address Calculation):</strong><br>
                        إذا كان الـ Operand هو "عنوان" في الذاكرة، فإن الـ Decode لا تكتفي بفصله، بل تقوم الـ CU بحسابه (مثلاً جمع العنوان الأساسي + الإزاحة) تمهيداً لجلب البيانات.
                    </li>
                    <li style="margin-bottom: 10px; position: relative;">
                        <strong style="color: #4facfe;">وحدة التوقيت والتسلسل (Sequencer):</strong><br>
                        المُشفر ليس مجرد خريطة، بل هو مرتبط بـ <span class="interactive-term">ساعة النظام (Clock)</span><span class="term-expansion">وحدة تحدد سرعة المعالج وتضمن تزامن العمليات.</span>. هو لا يرسل إشارات التحكم "مرة واحدة"، بل يرسلها "بتسلسل زمني" محدد (مثلاً: افتح بوابة الـ MAR أولاً، ثم انتظر نبضة، ثم أرسل إشارة الـ Read).
                    </li>
                </ul>
            </div>
        </div>
    </div>

    <div class="summary-section">
        <h3 class="section-toggle" style="color: #4facfe; margin: 40px 0 20px; border-bottom: 2px solid #4facfe; padding-bottom: 10px;">
            4. عملية الـ Execute & Store
            <i class="fas fa-chevron-down" style="font-size: 0.8em;"></i>
        </h3>
        
        <div class="section-content collapsed">
            <div class="term-group">
                <h4 style="margin: 20px 0 10px;">الحدث: التنفيذ الفعلي (Steps 7 & 8)</h4>
                <p style="line-height: 1.8;">
                    هي المرحلة التي يتحول فيها التصميم المنطقي إلى فعل كهربائي حقيقي ("ساعة الصفر"). بناءً على إشارات التحكم، يتم توصيل مخارج المسجلات بمداخل <span class="interactive-term">وحدة الـ ALU</span><span class="term-expansion">هي المصنع الحقيقي داخل المعالج تتكون من دوائر إلكترونية معقدة.</span>. تقوم الـ ALU بتنفيذ العملية المطلوبة (مثل الجمع). وبمجرد حدوث <span class="interactive-term">نبضة الساعة (Clock Pulse)</span><span class="term-expansion">"صافرة المايسترو" أو "ضربة الطبل" التي توحد حركة المجدفين. هي النبضة التي تسمح بانتقال البيانات من مكان لآخر بشكل متزامن وبدون فوضى.</span>، ينتقل الناتج من مخرج الـ ALU ليستقر في مكان التخزين المطلوب (غالباً <span class="interactive-term">المركم Accumulator</span><span class="term-expansion">هو مسجل ذو أهمية خاصة (يعتبر "بيت الطاقة")؛ وظيفته تخزين ناتج العملية الحسابية الحالية.</span> أو الذاكرة).
                </p>
                <p style="line-height: 1.8; margin-top: 15px;">
                    خلال هذه العملية، تقوم الـ ALU أيضاً بتحديث <span class="interactive-term">أعلام الحالة (Status Flags)</span><span class="term-expansion">مسجل خاص يسمى Status Register يرفع "أعلاماً" لتخبر المعالج بحالة النتيجة (هل هي صفر؟ هل هناك فائض Carry؟ هل حدث خطأ؟) لاتخاذ قرارات لاحقة.</span>. تعتمد سرعة هذه العملية كلياً على <span class="interactive-term">تردد الساعة (Clock Speed)</span><span class="term-expansion">"سرعة نبضات القلب". كلما زاد التردد (GHz)، زادت سرعة فتح وإغلاق البوابات وإنهاء المهام في وقت أقل.</span>.
                </p>
            </div>

            <div class="term-group">
                <h4 style="margin: 20px 0 10px;">الخطوة 9: تخزين النتيجة (Store Result)</h4>
                <p style="line-height: 1.8;">
                    <strong style="color: #4facfe;">الحدث:</strong> هي الخطوة الأخيرة في دورة حياة التعليمة، حيث يتم حفظ "ثمرة" المجهود الحسابي.<br><br>
                    <strong style="color: #4facfe;">الشرح التقني:</strong> يقوم المعالج بنقل الناتج من مخرج <span class="interactive-term">الـ ALU</span> أو <span class="interactive-term">المركم (Accumulator)</span> إلى وجهته النهائية (<span class="interactive-term">الوجهة - Destination</span><span class="term-expansion">تخيلها كأنها "صندوق البريد" الذي ستضع فيه الرسالة. قد تكون مسجلاً (سريع جداً) أو الذاكرة RAM (لحفظها طويلاً).</span>). إذا كانت الوجهة مسجلاً داخلياً، يتم النقل في نبضة ساعة واحدة. أما إذا كانت الوجهة هي <span class="interactive-term">الذاكرة (RAM)</span>، تقوم الـ CU بوضع العنوان في الـ MAR والبيانات في الـ MDR، ثم تطلق <span class="interactive-term">إشارة الكتابة (WRITE Signal)</span><span class="term-expansion">تخيلها كأنها "ختم الموافقة" أو زر "Save". الذاكرة لا تقبل أي بيانات تدخلها إلا إذا استقبلت هذه النبضة لفتح "بوابة" الخلية.</span> عبر ناقل التحكم. بمجرد تأكيد الحفظ، تنهي الـ CU العملية وتستعد لبدء دورة "جلب" (<span class="interactive-term">Next Fetch</span>) جديدة للتعليمة التي يشير إليها الـ PC حالياً.
                </p>
            </div>

            <div class="term-group">
                <h4 style="margin: 20px 0 10px;">كواليس التخزين (Technical Extras)</h4>
                <ul style="list-style: none; padding-right: 15px;">
                     <li style="margin-bottom: 15px; position: relative;">
                        <strong style="color: #4facfe;">ناقل البيانات (Data Bus):</strong><br>
                        عند التخزين في الذاكرة (Memory Store)، تنتقل البيانات من الـ MDR عبر الناقل. يجب أن تضمن الـ CU أن هذا الناقل "خالٍ" من أي بيانات أخرى قبل الإرسال.
                    </li>
                    <li style="margin-bottom: 15px; position: relative;">
                        <strong style="color: #4facfe;">مسجل الحالة (Status Register):</strong><br>
                        قبل إنهاء المرحلة، يتم التأكد من أن جميع "الأعلام" (Flags) قد حُدثت لتعبر عن النتيجة النهائية (مثلاً: إذا كان الناتج سالباً، يتم تفعيل علم السالب).
                    </li>
                    <li style="margin-bottom: 15px; position: relative;">
                        <strong style="color: #4facfe;">الفرق بين الـ Load والـ Store:</strong><br>
                        <span style="color: #ddd;">Load:</span> هو جلب بيانات من الذاكرة إلى المعالج (قراءة).<br>
                        <span style="color: #ddd;">Store:</span> هو إرسال بيانات من المعالج إلى الذاكرة (كتابة).
                    </li>
                </ul>
            </div>
        </div>
    </div>
</div>
`;

const IT_ASSEMBLY_CONTENT = `
<div class="interactive-summary" dir="rtl">
    <div class="summary-intro" style="margin-bottom: 30px; padding: 20px; background: rgba(255,255,255,0.05); border-radius: 10px;">
        <p style="font-size: 1.2em; line-height: 1.8;">هي الجسر الأخير بين تفكير البشر (اللغات عالية المستوى مثل C++ و Java) وبين لغة الآلة الصماء (0 و 1).</p>
    </div>

    <div class="summary-section">
        <h3 class="section-toggle" style="color: #4facfe; margin: 30px 0 20px; border-bottom: 2px solid #4facfe; padding-bottom: 10px;">
            1. ما هي لغة التجميع (The Definition)
            <i class="fas fa-chevron-down" style="font-size: 0.8em;"></i>
        </h3>
        
        <div class="section-content collapsed">
            <div class="term-group">
                <p style="line-height: 1.8;">
                    هي <span class="interactive-term">لغة برمجة منخفضة المستوى (Low-level)</span><span class="term-expansion">هي تعبير نصي بشري للغة الآلة. بدلاً من أن تكتب للمعالج 0110 ليجمع، تكتب له كلمة ADD.</span>، تعتمد على <span class="interactive-term">الرموز السيمولوجية (Symbolic Code)</span><span class="term-expansion">تحويل العمليات المعقدة (أرقام صماء) إلى رموز مفهومة (أسماء مستعارة). بدلاً من حفظ 1010 يعني "اجمع"، نستخدم الرمز ADD.</span>.
                </p>
                <p style="line-height: 1.8; margin-top: 15px;">
                    <strong style="color: #4facfe;">الارتباط بالمعمارية:</strong> لغة التجميع ليست موحدة؛ كل نوع من المعالجات (مثل Intel x86 أو ARM) له لغة تجميع خاصة به تسمى <span class="interactive-term">الـ ISA</span><span class="term-expansion">Instruction Set Architecture: هي "طاقم تعليمات" المعالج الذي يحدد الأوامر التي يفهمها وكيف يتم تمثيلها.</span>. لذا فهي <span class="interactive-term">غير قابلة للنقل (Non-portable)</span><span class="term-expansion">على عكس بايثون، الكود المكتوب لمعالج Intel لن يعمل على هاتف (ARM). هي مرتبطة بـ "فيزياء" المعالج.</span>.
                </p>
            </div>
        </div>
    </div>

    <div class="summary-section">
        <h3 class="section-toggle" style="color: #4facfe; margin: 40px 0 20px; border-bottom: 2px solid #4facfe; padding-bottom: 10px;">
            2. المترجم (The Assembler)
            <i class="fas fa-chevron-down" style="font-size: 0.8em;"></i>
        </h3>
        
        <div class="section-content collapsed">
            <div class="term-group">
                <p style="line-height: 1.8;">
                    المعالج لا يزال لا يفهم كلمة ADD. هنا يأتي دور برنامج يسمى <span class="interactive-term">الـ Assembler</span><span class="term-expansion">برنامج "مترجم" يأخذ كود التجميع (مثل ADD, MOV) ويحوله إلى كود الآلة (0s & 1s). من أمثلته الواقعية NASM و MASM.</span>.
                </p>
                <p style="line-height: 1.8; margin-top: 15px;">
                    <strong style="color: #4facfe;">وظيفته:</strong> يأخذ كود التجميع الذي كتبته ويقوم بتحويله إلى <span class="interactive-term">Object Code</span><span class="term-expansion">هو الكود الناتج (أصفار وواحدات) الذي يفهمه المعالج مباشرة، ليوضع في الذاكرة ويبدأ الـ PC بالإشارة إليه.</span>.
                </p>
            </div>
        </div>
    </div>

    <div class="summary-section">
        <h3 class="section-toggle" style="color: #4facfe; margin: 40px 0 20px; border-bottom: 2px solid #4facfe; padding-bottom: 10px;">
            3. مصطلحات ومفاهيم جوهرية
            <i class="fas fa-chevron-down" style="font-size: 0.8em;"></i>
        </h3>
        
        <div class="section-content collapsed">
            <ul style="list-style: none; padding-right: 15px; margin-top: 15px;">
                <li style="margin-bottom: 15px; position: relative;">
                    <strong style="color: #4facfe;">لغة الآلة (Machine Language):</strong><br>
                    تخيلها كأنها "لغة الكهرباء" (مفتاح مفتوح 0، مغلق 1). هي اللغة الوحيدة التي يفهمها المعالج مباشرة، لكنها <span class="interactive-term">غامضة (Obscure)</span><span class="term-expansion">سلاسل طويلة من الأصفار والواحدات يصعب جداً على البشر فهمها أو تتبعها.</span> ومعقدة.
                </li>
                <li style="margin-bottom: 15px; position: relative;">
                    <strong style="color: #4facfe;">خصوصية المعمارية (Architecture Specific):</strong><br>
                    لغة التجميع ليست "مقاساً واحداً يناسب الجميع"؛ هي مصممة خصيصاً لعائلة معينة من المعالجات (مثل كود Intel لا يعمل على ARM).
                </li>
                <li style="margin-bottom: 15px; position: relative;">
                    <strong style="color: #4facfe;">قابلية النقل (Portability):</strong><br>
                    اللغات عالية المستوى مثل Java هي "محمولة" (Portable) وتعمل على أي جهاز ("شاحن عالمي"). أما الأسمبلي فهي <span class="interactive-term">غير محمولة</span> وتعتمد على التصميم الداخلي للجهاز بشكل كلي.
                </li>
            </ul>
        </div>
    </div>

    <div class="summary-section">
        <h3 class="section-toggle" style="color: #4facfe; margin: 40px 0 20px; border-bottom: 2px solid #4facfe; padding-bottom: 10px;">
            4. مستويات لغات البرمجة (The Hierarchy)
            <i class="fas fa-chevron-down" style="font-size: 0.8em;"></i>
        </h3>
        
        <div class="section-content collapsed">
            <div class="term-group">
                <p style="line-height: 1.8;">
                    يعمل الحاسوب كـ <span class="interactive-term">Multilevel Machine</span><span class="term-expansion">نظام متعدد الطبقات (مثل مبنى متعدد الطوابق). في الأسفل يوجد العتاد، فوقه نظام التشغيل، وفوقه التطبيقات. كل طبقة "تخفي" تعقيدات ما تحتها (Abstraction).</span>. بناءً على ذلك، تصنف اللغات إلى:
                </p>
                <ul style="list-style: none; padding-right: 15px; margin-top: 15px;">
                    <li style="margin-bottom: 10px;">
                        <strong style="color: #4facfe;">الجيل الأول (1GL - Machine):</strong> لغة الآلة الصرفة (أصفار وواحدات).
                    </li>
                    <li style="margin-bottom: 10px;">
                        <strong style="color: #4facfe;">الجيل الثاني (2GL - Assembly):</strong> تستخدم <span class="interactive-term">الرموز (Mnemonics)</span><span class="term-expansion">"شفرات مختصرة" أو أسماء مستعارة للأوامر (مثل ADD بدلاً من الأرقام). تسهل القراءة والكتابة.</span> لتمثيل الأوامر.
                    </li>
                    <li style="margin-bottom: 10px;">
                        <strong style="color: #4facfe;">الجيل الثالث (3GL - High-Level):</strong> لغات إجرائية (<span class="interactive-term">Procedural</span><span class="term-expansion">تكتب فيها "كيف" تفعل الشيء (Step-by-step). مثل C++ و Java.</span>) تشبه لغة البشر.
                    </li>
                    <li style="margin-bottom: 10px;">
                        <strong style="color: #4facfe;">الجيل الرابع (4GL):</strong> لغات غير إجرائية (<span class="interactive-term">Non-procedural</span><span class="term-expansion">تخبر الجهاز "ماذا" تريد وهو يقرر "كيف". مثل SQL لقواعد البيانات.</span>) تركز على النتائج.
                    </li>
                </ul>
            </div>
        </div>
    </div>

    <div class="summary-section">
        <h3 class="section-toggle" style="color: #4facfe; margin: 40px 0 20px; border-bottom: 2px solid #4facfe; padding-bottom: 10px;">
            5. لماذا نتعلم Assembly؟ (Advantages)
            <i class="fas fa-chevron-down" style="font-size: 0.8em;"></i>
        </h3>
        
        <div class="section-content collapsed">
            <div class="term-group">
                <p style="line-height: 1.8;">
                    لغة الأسمبلي ليست مجرد لغة برمجة، بل هي "عدسة" تكشف كيف يتفاعل نظام التشغيل مع العتاد. أهم مميزاتها:
                </p>
                <ul style="list-style: none; padding-right: 15px; margin-top: 15px;">
                    <li style="margin-bottom: 15px; position: relative;">
                        <strong style="color: #4facfe;">السرعة والتحكم الكامل:</strong><br>
                        توفر سرعة تنفيذ فائقة واستهلاكاً أقل للذاكرة. هي الخيار الأول للمهام <span class="interactive-term">الحرجة زمنياً (Time-critical jobs)</span><span class="term-expansion">مهام يجب أن تنفذ في أجزاء من الثانية دون أي تأخير (مثل نظام المكابح أو الإيرباج في السيارة). الأسمبلي مثالية هنا لأنها سريعة جداً.</span> وللتعامل المباشر مع العتاد (<span class="interactive-term">Hardware-specific</span>).
                    </li>
                    <li style="margin-bottom: 15px; position: relative;">
                        <strong style="color: #4facfe;">عنونة الذاكرة بذكاء:</strong><br>
                        وفرت ميزة <span class="interactive-term">العناوين الرمزية (Symbolic Labels)</span><span class="term-expansion">بدلاً من كتابة "اذهب للعنوان 1024"، تكتب "اذهب لمكان Loop1". المترجم هو من يحسب العنوان الفعلي، مما يحرر المبرمج من الحساب اليدوي المعقد.</span>، حيث حررتنا من الحساب اليدوي للعناوين.
                    </li>
                </ul>
            </div>
        </div>
    </div>
</div>
`;

const IT_DATA_CONTENT = `
<div class="interactive-summary" dir="rtl">
    <div class="summary-intro" style="margin-bottom: 30px; padding: 20px; background: rgba(255,255,255,0.05); border-radius: 10px;">
        <p style="font-size: 1.2em; line-height: 1.8;">هذا النص هو "القاموس" الفعلي لكيفية تخزين البيانات داخل الذاكرة. هو يوضح لماذا نختار أحجاماً معينة لكل نوع من البيانات.</p>
    </div>

    <div class="summary-section">
        <h3 class="section-toggle" style="color: #4facfe; margin: 30px 0 20px; border-bottom: 2px solid #4facfe; padding-bottom: 10px;">
            أولاً: الوحدة والتركيب (Bits & Bytes)
            <i class="fas fa-chevron-down" style="font-size: 0.8em;"></i>
        </h3>
        
        <div class="section-content collapsed">
            <div class="term-group">
                <h4 style="margin: 20px 0 10px;">1. البت (Bit):</h4>
                <p style="line-height: 1.8;">
                    هو أصغر وحدة ذاكرة، ويعمل كـ <span class="interactive-term">مفتاح (Switch)</span><span class="term-expansion">إما "0" (إيقاف/لا) أو "1" (تشغيل/نعم).</span>.<br><br>
                    <strong style="color: #4facfe;">قاعدة القوة (2 أس n):</strong> بما أن كل بت له حالتان، فإن عدد الاحتمالات التي يمكن تمثيلها في عدد n من البتات هو 2 أس n.<br>
                    <span style="font-size: 0.9em; color: #aaa;">مثال: 3 بت تعطينا 2 أس 3 = 8 احتمالات مختلفة.</span>
                </p>

                <h4 style="margin: 20px 0 10px;">2. البايت (Byte):</h4>
                <p style="line-height: 1.8;">
                    يتكون من <span class="interactive-term">8 بت</span>.<br>
                    <strong style="color: #4facfe;">الأهمية التقنية:</strong> هو أصغر كمية من الذاكرة يمكن للمعالج (CPU) التعامل معها في عملية واحدة (Addressable Unit).<br><br>
                    <strong>التحويل:</strong><br>
                    من بايت إلى بت ← نضرب في 8.<br>
                    من بت إلى بايت ← نقسم على 8.
                </p>
            </div>
        </div>
    </div>

    <div class="summary-section">
        <h3 class="section-toggle" style="color: #4facfe; margin: 40px 0 20px; border-bottom: 2px solid #4facfe; padding-bottom: 10px;">
            ثانياً: أنواع البيانات وحجمها في الذاكرة
            <i class="fas fa-chevron-down" style="font-size: 0.8em;"></i>
        </h3>
        
        <div class="section-content collapsed">
            <p style="margin-bottom: 15px;">هذا الجدول يلخص كيف تستهلك البيانات مساحة في الـ RAM بناءً على نوعها:</p>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 0.9em;">
                    <thead>
                        <tr style="background: rgba(79, 172, 254, 0.2); color: #4facfe;">
                            <th style="padding: 10px; border: 1px solid rgba(255,255,255,0.1);">الحجم</th>
                            <th style="padding: 10px; border: 1px solid rgba(255,255,255,0.1);">عدد البتات</th>
                            <th style="padding: 10px; border: 1px solid rgba(255,255,255,0.1);">نوع البيانات (Data Type)</th>
                            <th style="padding: 10px; border: 1px solid rgba(255,255,255,0.1);">ماذا تخزن؟</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding: 10px; border: 1px solid rgba(255,255,255,0.1);">1 Byte</td>
                            <td style="padding: 10px; border: 1px solid rgba(255,255,255,0.1);">8 bits</td>
                            <td style="padding: 10px; border: 1px solid rgba(255,255,255,0.1);">Text (Character) / Byte / Yes-No</td>
                            <td style="padding: 10px; border: 1px solid rgba(255,255,255,0.1);">حرف واحد (ASCII)، رقم من 0 إلى 255، أو حالة منطقية.</td>
                        </tr>
                        <tr style="background: rgba(255,255,255,0.02);">
                            <td style="padding: 10px; border: 1px solid rgba(255,255,255,0.1);">2 Bytes</td>
                            <td style="padding: 10px; border: 1px solid rgba(255,255,255,0.1);">16 bits</td>
                            <td style="padding: 10px; border: 1px solid rgba(255,255,255,0.1);">Integer (Short)</td>
                            <td style="padding: 10px; border: 1px solid rgba(255,255,255,0.1);">أرقام صحيحة بين ±32,000، أو حروف لغات آسيوية (Unicode).</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border: 1px solid rgba(255,255,255,0.1);">4 Bytes</td>
                            <td style="padding: 10px; border: 1px solid rgba(255,255,255,0.1);">32 bits</td>
                            <td style="padding: 10px; border: 1px solid rgba(255,255,255,0.1);">Long Integer / Single Precision</td>
                            <td style="padding: 10px; border: 1px solid rgba(255,255,255,0.1);">أرقام صحيحة ضخمة (±2 مليار)، أو أرقام بفاصلة عشرية بدقة 6 خانات.</td>
                        </tr>
                        <tr style="background: rgba(255,255,255,0.02);">
                            <td style="padding: 10px; border: 1px solid rgba(255,255,255,0.1);">8 Bytes</td>
                            <td style="padding: 10px; border: 1px solid rgba(255,255,255,0.1);">64 bits</td>
                            <td style="padding: 10px; border: 1px solid rgba(255,255,255,0.1);">Double Precision / Currency / Date</td>
                            <td style="padding: 10px; border: 1px solid rgba(255,255,255,0.1);">أرقام كسرية دقيقة جداً (15 خانة)، العملات، أو التواريخ والوقت.</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <div class="summary-section">
        <h3 class="section-toggle" style="color: #4facfe; margin: 40px 0 20px; border-bottom: 2px solid #4facfe; padding-bottom: 10px;">
            ثالثاً: تمثيل النصوص (Standards & Relations)
            <i class="fas fa-chevron-down" style="font-size: 0.8em;"></i>
        </h3>
        
        <div class="section-content collapsed">
            <div class="term-group">
                <h4 style="margin: 20px 0 10px;">أولاً: الوحدة الأساسية (Character)</h4>
                <p style="line-height: 1.8;">
                    الوحدة الأساسية في الملفات النصية هي <span class="interactive-term">الحرف (Character)</span><span class="term-expansion">سواء كان حرفاً أبجدياً، رقماً، علامة ترقيم، أو حتى مسافة (Space).</span>.<br>
                    <strong>حجم الملف النصي:</strong> يُحسب ببساطة عبر ضرب (عدد الحروف) في (حجم الحرف الواحد).
                </p>

                <h4 style="margin: 20px 0 10px;">ثانياً: علاقة "مجموعة الحروف" بحجم الذاكرة</h4>
                <div style="background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <strong style="color: #4facfe;">القاعدة الذهبية:</strong> "كلما زاد حجم <span class="interactive-term">مجموعة الحروف (Character Set)</span>، زادت الحاجة لمساحة ذاكرة أكبر لكل حرف."
                </div>
                <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 0.9em;">
                    <thead>
                        <tr style="background: rgba(79, 172, 254, 0.2); color: #4facfe;">
                            <th style="padding: 10px; border: 1px solid rgba(255,255,255,0.1);">المعيار (Standard)</th>
                            <th style="padding: 10px; border: 1px solid rgba(255,255,255,0.1);">مكان الاستخدام</th>
                            <th style="padding: 10px; border: 1px solid rgba(255,255,255,0.1);">ملاحظات</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding: 10px; border: 1px solid rgba(255,255,255,0.1); font-weight: bold;">ASCII</td>
                            <td style="padding: 10px; border: 1px solid rgba(255,255,255,0.1);">في أغلب أنظمة الحاسوب الحالية</td>
                            <td style="padding: 10px; border: 1px solid rgba(255,255,255,0.1);">هو المعيار الأكثر شيوعاً عالمياً (للإنجليزية).</td>
                        </tr>
                        <tr style="background: rgba(255,255,255,0.02);">
                            <td style="padding: 10px; border: 1px solid rgba(255,255,255,0.1); font-weight: bold;">EBCDIC</td>
                            <td style="padding: 10px; border: 1px solid rgba(255,255,255,0.1);">أجهزة الـ <span class="interactive-term">Mainframe</span> القديمة</td>
                            <td style="padding: 10px; border: 1px solid rgba(255,255,255,0.1);">نظام صممته شركة IBM للأجهزة الضخمة والقديمة.</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <div class="summary-section">
        <h3 class="section-toggle" style="color: #4facfe; margin: 40px 0 20px; border-bottom: 2px solid #4facfe; padding-bottom: 10px;">
            رابعاً: حساب حجم الملفات النصية (Estimation)
            <i class="fas fa-chevron-down" style="font-size: 0.8em;"></i>
        </h3>
        
        <div class="section-content collapsed">
            <div class="term-group">
                <p style="line-height: 1.8;">
                    بما أن الوحدة الأساسية هي <span class="interactive-term">الحرف (Character)</span>، يمكننا تقدير الحجم الإجمالي لملف نصي ضخم (مثل كتاب) باستخدام معادلة بسيطة.
                </p>

                <h4 style="margin: 20px 0 10px;">1. معادلة حساب عدد الحروف:</h4>
                <div style="background: rgba(79, 172, 254, 0.1); padding: 15px; border-radius: 8px; margin: 10px 0; text-align: center; direction: ltr; font-family: monospace;">
                    Total Characters = (Chars / Line) × (Lines / Page) × (Pages / Book)
                </div>
                <ul style="list-style: none; padding-right: 15px; margin-top: 10px;">
                    <li style="margin-bottom: 5px;"><strong>Characters/Line:</strong> متوسط الحروف في السطر الواحد.</li>
                    <li style="margin-bottom: 5px;"><strong>Lines/Page:</strong> عدد الأسطر في الصفحة.</li>
                    <li style="margin-bottom: 5px;"><strong>Pages/Book:</strong> عدد الصفحات في الكتاب.</li>
                </ul>

                <h4 style="margin: 20px 0 10px;">2. الربط بين الحساب والحجم (ASCII Rule):</h4>
                <p style="line-height: 1.8;">
                    بناءً على قواعد <span class="interactive-term">ASCII</span>، فإن <strong>كل حرف يمثل 1 Byte</strong>.<br>
                    لذا، بمجرد حصولك على "إجمالي عدد الحروف"، يكون هو نفسه "إجمالي حجم الملف بالبايت".
                </p>

                <div style="background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 8px; margin-top: 20px;">
                    <h4 style="margin: 0 0 10px 0; color: #4facfe;">مثال توضيحي:</h4>
                    <p style="line-height: 1.8; margin: 0;">
                        كتاب يحتوي على:<br>
                        - 100 حرف في السطر.<br>
                        - 30 سطراً في الصفحة.<br>
                        - 200 صفحة.<br><br>
                        <strong>الحساب:</strong> 100 × 30 × 200 = <strong>600,000 حرف</strong>.<br>
                        <strong>الحجم في الذاكرة:</strong> 600,000 Bytes (أي حوالي 585 KB تقريباً).
                    </p>
                </div>
            </div>
        </div>
    </div>

    <div class="summary-section">
        <h3 class="section-toggle" style="color: #4facfe; margin: 40px 0 20px; border-bottom: 2px solid #4facfe; padding-bottom: 10px;">
            خامساً: تمثيل الصور (Images & Colors)
            <i class="fas fa-chevron-down" style="font-size: 0.8em;"></i>
        </h3>
        
        <div class="section-content collapsed">
            <div class="term-group">
                <h4 style="margin: 20px 0 10px;">1. الوحدة والشكل (Pixels & Raster):</h4>
                <p style="line-height: 1.8;">
                    تنسيق الـ <span class="interactive-term">Bitmap / Raster</span><span class="term-expansion">هو الطريقة التي يرى بها الحاسوب الصور؛ وهي عبارة عن مصفوفة مستطيلة من النقاط.</span>.<br>
                    الوحدة الأساسية هي <span class="interactive-term">الكسل (Pixel)</span><span class="term-expansion">هو أصغر وحدة بناء في الصورة على الشاشة.</span>.
                </p>
                
                <div style="background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <strong style="color: #4facfe;">الفرق بين Pixel و Dot:</strong><br>
                    - <span class="interactive-term">Pixel</span>: يُستخدم عند الحديث عن الشاشات (Working Resolution).<br>
                    - <span class="interactive-term">Dot</span>: يُستخدم عند الحديث عن الطابعات والماسحات الضوئية (DPI).
                </div>

                <h4 style="margin: 20px 0 10px;">2. عمق الألوان (Bit Depth):</h4>
                <p style="line-height: 1.8;">
                    هو الجزء الأهم رياضياً؛ حجم الصورة في الذاكرة يعتمد على <strong>كم بت نخصص لكل بكسل</strong> لتمثيل لونه:
                </p>
                <ul style="list-style: none; padding-right: 15px; margin-top: 10px;">
                    <li style="margin-bottom: 10px;">
                        <strong>أبيض وأسود (Line Art):</strong> يحتاج <span class="interactive-term">1 bit/pixel</span> (إما 0 للأسود أو 1 للأبيض).
                    </li>
                    <li style="margin-bottom: 10px;">
                        <strong>تدرج رمادي (Grayscale):</strong> يحتاج <span class="interactive-term">8 bits/pixel</span> (لأن 2 أس 8 = 256 درجة رمادية).
                    </li>
                    <li style="margin-bottom: 10px;">
                        <strong>ألوان أساسية (Authoring Color):</strong> تحتاج <span class="interactive-term">8 bits/pixel</span> (256 لون).
                    </li>
                    <li style="margin-bottom: 10px;">
                        <strong>ألوان عالية (True Color):</strong> تحتاج <span class="interactive-term">24 bits (3 Bytes)</span> أو أكثر (تصل لملايين الألوان).
                    </li>
                </ul>

                <h4 style="margin: 20px 0 10px;">3. كيف يتم تمثيل اللون رقمياً؟ (RGB):</h4>
                <p style="line-height: 1.8;">
                    الألوان لا تُخزن كـ "أسماء"، بل كأرقام تعبر عن السطوع (<span class="interactive-term">Brightness</span>).<br>
                    في نظام <span class="interactive-term">RGB</span>، يتم تمثيل كل بكسل بـ 3 أرقام:
                </p>
                <div style="display: flex; gap: 10px; margin-top: 10px;">
                    <span style="color: #ff6b6b; font-weight: bold;">Red (R)</span>
                    <span style="color: #51cf66; font-weight: bold;">Green (G)</span>
                    <span style="color: #339af0; font-weight: bold;">Blue (B)</span>
                </div>
                <p style="font-size: 0.9em; margin-top: 5px; color: #aaa;">مزيج هذه الأرقام الثلاثة هو ما يعطيك اللون النهائي الذي تراه على الشاشة.</p>

                <h4 style="margin: 20px 0 10px;">4. الخلاصة الحسابية (Calculation):</h4>
                <div style="background: rgba(79, 172, 254, 0.1); padding: 15px; border-radius: 8px; margin: 10px 0; text-align: center; direction: ltr; font-family: monospace;">
                    Image Size (bits) = Width × Height × Bit Depth
                </div>
                <div style="background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 8px; margin-top: 15px;">
                    <strong style="color: #4facfe;">مثال سريع:</strong> صورة أبعادها 100×100 بكسل، بنظام 256 لون (8 بت).<br>
                    <strong>الحساب:</strong> 100 × 100 × 8 = <strong>80,000 بت</strong>.<br>
                    <strong>بالبايت:</strong> 80,000 ÷ 8 = <strong>10,000 Bytes</strong> (حوالي 10 KB).
                </div>
            </div>
        </div>
    </div>

    <div class="summary-section">
        <h3 class="section-toggle" style="color: #4facfe; margin: 40px 0 20px; border-bottom: 2px solid #4facfe; padding-bottom: 10px;">
            سادساً: تمثيل الصوت (Audio Representation)
            <i class="fas fa-chevron-down" style="font-size: 0.8em;"></i>
        </h3>
        
        <div class="section-content collapsed">
            <div class="term-group">
                <h4 style="margin: 20px 0 10px;">1. ما هي العينة (Sample)؟</h4>
                <p style="line-height: 1.8;">
                    تخيل أن الصوت في الحقيقة عبارة عن "موجة" مستمرة (مثل موج البحر). الحاسوب لا يستطيع تخزين هذه الموجة كما هي، لذا يقوم بعملية تسمى "أخذ العينات":
                </p>
                <ul style="list-style: none; padding-right: 15px; margin-top: 10px;">
                    <li style="margin-bottom: 10px;">
                        <strong style="color: #4facfe;">العينة (Sample):</strong> هي عبارة عن "لقطة" أو "صورة" لارتفاع الموجة الصوتية في لحظة زمنية معينة. يتم تحويل هذا الارتفاع إلى رقم ثنائي (<span class="interactive-term">Binary</span>).
                    </li>
                    <li style="margin-bottom: 10px;">
                        <strong style="color: #4facfe;">معدل العينة (Sampling Rate):</strong> هو عدد اللقطات التي نأخذها في الثانية الواحدة. فمثلاً جودة الـ CD تأخذ <span class="interactive-term">44,100 لقطة</span> في كل ثانية واحدة من الصوت!
                    </li>
                </ul>

                <h4 style="margin: 20px 0 10px;">2. جودة الـ CD (المعيار العالمي):</h4>
                <div style="background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <strong style="color: #4facfe;">لماذا الرقم 44,100 تحديداً؟</strong><br>
                    - أذن الإنسان تسمع حتى تردد <strong>20,000 Hz</strong>.<br>
                    - هندسياً، لكي نحول الصوت لرقمي بدقة، نحتاج لعينتين لكل هيرتز (20,000 × 2 = 40,000).<br>
                    - لذا تم الاستقرار على <strong>44,100 عينة في الثانية</strong>، وكل عينة تُخزن في <strong>16 بت (2 بايت)</strong> لضمان نقاء الصوت.
                </div>

                <h4 style="margin: 20px 0 10px;">3. طريقة الحساب (سريعاً):</h4>
                <p style="margin-bottom: 10px;">لحساب حجم ملف صوتي "خام" (Uncompressed)، نمر بخطوتين:</p>
                
                <div style="background: rgba(79, 172, 254, 0.1); padding: 15px; border-radius: 8px; margin: 10px 0; text-align: center; direction: ltr; font-family: monospace;">
                    <div>Step 1: Total Samples = Sample Rate × Time (sec)</div>
                    <div style="margin-top: 10px;">Step 2: File Size (bits) = Total Samples × Bits per Sample</div>
                </div>

                <div style="background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 8px; margin-top: 15px;">
                    <strong style="color: #4facfe;">مثال سريع:</strong> تسجيل مدته 10 ثوانٍ بجودة CD (16 بت).<br>
                    1. إجمالي العينات = 44,100 × 10 = <strong>441,000 عينة</strong>.<br>
                    2. الحجم = 441,000 × 16 بت = <strong>7,056,000 بت</strong>.<br>
                    <span style="color: #aaa; font-size: 0.9em;">(لتحويله لميجابايت، نقسم على 8 ثم على 1024 مرتين).</span>
                </div>

                <h4 style="margin: 20px 0 10px;">4. ملاحظة عن الضغط (Compression):</h4>
                <p style="line-height: 1.8;">
                    الملفات المحسوبة بالأعلى تكون ضخمة جداً.<br>
                    تقنيات مثل <span class="interactive-term">MP3</span> تقوم بحذف الترددات التي لا تسمعها أذن الإنسان بوضوح، مما يقلل الحجم بشكل هائل مع الحفاظ على جودة مقبولة.
                </p>
            </div>
        </div>
    </div>

    <div class="summary-section">
        <h3 class="section-toggle" style="color: #4facfe; margin: 40px 0 20px; border-bottom: 2px solid #4facfe; padding-bottom: 10px;">
            سابعاً: تمثيل الفيديو (Video Representation)
            <i class="fas fa-chevron-down" style="font-size: 0.8em;"></i>
        </h3>
        
        <div class="section-content collapsed">
            <div class="term-group">
                <h4 style="margin: 20px 0 10px;">1. ما هو الإطار (Frame)؟</h4>
                <ul style="list-style: none; padding-right: 15px; margin-top: 10px;">
                    <li style="margin-bottom: 10px;">
                        <strong style="color: #4facfe;">الحقيقة التقنية:</strong> الفيديو ليس إلا "صورة ثابتة" (<span class="interactive-term">Frame</span>) مكررة. هو عبارة عن سلسلة من الصور تُعرض وراء بعضها بسرعة لخداع الدماغ.
                    </li>
                </ul>

                <h4 style="margin: 20px 0 10px;">2. معدل الإطارات (Frame Rate - FPS):</h4>
                <p style="margin-bottom: 10px;">لكي تبدو الحركة طبيعية، نحتاج لعرض عدد محدد من الصور في الثانية:</p>
                <div style="background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 8px; margin: 15px 0;">
                    - <strong>10 fps:</strong> حركة "مقطعة" وجودة منخفضة.<br>
                    - <strong>24 fps:</strong> المعيار السينمائي (Realistic Animation).<br>
                    - <strong>30 fps:</strong> المعيار الشائع رقمياً (YouTube).
                </div>

                <h4 style="margin: 20px 0 10px;">3. طريقة الحساب (Video Size):</h4>
                <div style="background: rgba(79, 172, 254, 0.1); padding: 15px; border-radius: 8px; margin: 10px 0; text-align: center; direction: ltr; font-family: monospace;">
                    <div>Step 1: Frame Size = (Width × Height) × Bytes per Pixel</div>
                    <div style="margin-top: 10px;">Step 2: Total Video Size = Frame Size × FPS × Time (sec)</div>
                </div>
                <p style="font-size: 0.9em; margin-top: 5px; color: #aaa;">مثال: 1 ميجابايت (للإطار) × 30 إطار = 30 ميجابايت في الثانية الواحدة! (لذا الضغط إجباري).</p>
            </div>
        </div>
    </div>

    <div class="summary-section">
        <h3 class="section-toggle" style="color: #4facfe; margin: 40px 0 20px; border-bottom: 2px solid #4facfe; padding-bottom: 10px;">
            ثامناً: المعادلة العامة والضغط (General Formula & Compression)
            <i class="fas fa-chevron-down" style="font-size: 0.8em;"></i>
        </h3>
        
        <div class="section-content collapsed">
            <div class="term-group">
                <h4 style="margin: 20px 0 10px;">1. المعادلة العامة لحجم الملف:</h4>
                <p style="margin-bottom: 10px;">أي ملف رقمي (نص، صورة، صوت) يحسب بهذه القاعدة الذهبية:</p>
                <div style="background: rgba(79, 172, 254, 0.1); padding: 15px; border-radius: 8px; margin: 10px 0; text-align: center; direction: ltr; font-family: monospace;">
                    File Size = Unit Size × Number of Units
                </div>
                <ul style="list-style: none; padding-right: 15px; margin-top: 10px; font-size: 0.9em;">
                    <li>- <strong>نص:</strong> حجم الحرف × عدد الحروف</li>
                    <li>- <strong>صورة:</strong> حجم البكسل × عدد البكسلات</li>
                    <li>- <strong>صوت/فيديو:</strong> معدل العينات/الإطارات × الزمن</li>
                </ul>

                <h4 style="margin: 20px 0 10px;">2. عملية الضغط (Compression):</h4>
                <p style="line-height: 1.8;">هي عملية تقليل حجم الملف مع الحفاظ على المكونات الأساسية.</p>
                
                <strong style="color: #4facfe; display: block; margin-top: 15px;">نسبة الضغط (Compression Ratio):</strong>
                <div style="background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 8px; margin: 10px 0; text-align: center; direction: ltr;">
                    Ratio = Original Size / Compressed Size
                </div>
                <p style="font-size: 0.9em; margin-top: 5px;">مثال: ملف 10MB أصبح 2MB. النسبة هي 5:1 (أي صغرناه 5 مرات).</p>
            </div>
        </div>
    </div>
</div>
`;

const interactiveContent = {
    'part1': IT_PART_1_CONTENT,
    'part2': IT_PART_2_CONTENT,
    'assembly': IT_ASSEMBLY_CONTENT,
    'data': IT_DATA_CONTENT
};

async function loadSummaries() {
    const container = document.getElementById('summariesList');
    if (!container) return;
    
    // Manual Summaries
    const manualSummaries = [
        {
            title: 'IT الجزء الاول',
            description: 'الهاردوير و انواع الذاكره الموجوده في المنهج',
            author: 'IT Team',
            imageUrl: '', 
            isInteractive: true,
            contentKey: 'part1'
        },
        {
            title: 'IT الجزء الثاني',
            description: 'التسلسل المنطقي و Fetch decode excute',
            author: 'IT Team',
            imageUrl: '', 
            isInteractive: true,
            contentKey: 'part2'
        },
        {
            title: 'لغة Assembly',
            description: 'شرح لغة التجميع وكيف يفهمها المعالج',
            author: 'IT Team',
            imageUrl: '', 
            isInteractive: true,
            contentKey: 'assembly'
        },
        {
            title: 'البيانات (صور، فيديو، صوت)',
            description: 'كيفية تمثيل الوسائط المتعددة داخل الحاسوب',
            author: 'IT Team',
            imageUrl: '', 
            isInteractive: true,
            contentKey: 'data'
        }
    ];

    try {
        container.innerHTML = '<div class="loading-message"><i class="fas fa-spinner fa-spin"></i> جاري تحميل الملخصات...</div>';
        
        let firebaseSummaries = [];
        if (db) {
            try {
                const snapshot = await db.collection(`summaries_${SUBJECT_ID}`).orderBy('order', 'asc').get();
                if (!snapshot.empty) {
                    firebaseSummaries = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
                }
            } catch (error) { console.error('Firebase Error:', error); }
        }

        container.innerHTML = '';
        
        // Render All Summaries
        [...manualSummaries, ...firebaseSummaries].forEach(summary => {
            container.appendChild(createSummaryCard(summary));
        });

        if (container.children.length === 0) {
            container.innerHTML = '<div class="no-summaries-message"><i class="fas fa-file-alt"></i><h3>لا توجد ملخصات حالياً</h3></div>';
        }

    } catch (error) { 
        console.error('Error loading summaries:', error); 
        container.innerHTML = '<div class="no-summaries-message">خطأ في التحميل</div>'; 
    }
}

function createSummaryCard(summary, docId) {
    const card = document.createElement('div');
    card.className = 'summary-card';
    let actionButton = '';
    
    if (summary.isInteractive) {
        // use a closure-like call or safe string
        actionButton = `<button class="summary-btn interactive-btn" onclick="openInteractiveSummary('${summary.title}', interactiveContent['${summary.contentKey}'])"><i class="fas fa-book-reader"></i> قراءة الملخص</button>`;
    } else if (summary.pdfUrl) {
        actionButton = `<a href="${summary.pdfUrl}" target="_blank" class="summary-btn"><i class="fas fa-download"></i> تحميل PDF</a>`;
    } else if (summary.externalUrl) {
        actionButton = `<a href="${summary.externalUrl}" target="_blank" class="summary-btn external-link"><i class="fas fa-external-link-alt"></i> فتح الرابط</a>`;
    }

    card.innerHTML = `${summary.imageUrl ? `<div class="summary-image"><img src="${summary.imageUrl}" alt="${summary.title}" loading="lazy"></div>` : ''}<div class="summary-content"><h3>${summary.title || 'ملخص'}</h3>${summary.description ? `<p>${summary.description}</p>` : ''}<div class="summary-meta">${summary.author ? `<span><i class="fas fa-user"></i> ${summary.author}</span>` : ''}</div>${actionButton}</div>`;
    return card;
}

// =============================================
// INTERACTIVE SUMMARY VIEWER
// =============================================
function openInteractiveSummary(title, contentHtml) {
    const modal = document.getElementById('summaryModal');
    const titleEl = document.getElementById('summaryTitle');
    const bodyEl = document.getElementById('summaryBody');
    
    if (modal && titleEl && bodyEl) {
        titleEl.textContent = title;
        bodyEl.innerHTML = contentHtml;
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeSummaryModal() {
    const modal = document.getElementById('summaryModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        // Reset fullscreen
        const content = modal.querySelector('.summary-modal-content');
        const zoomBtn = modal.querySelector('.zoom-btn i');
        if (content && content.classList.contains('fullscreen')) {
            content.classList.remove('fullscreen');
            if (zoomBtn) {
                zoomBtn.classList.add('fa-expand');
                zoomBtn.classList.remove('fa-compress');
            }
        }
    }
}

function toggleSummaryFullscreen() {
    const modalContent = document.querySelector('.summary-modal-content');
    const zoomBtn = document.querySelector('.zoom-btn i');
    if (modalContent && zoomBtn) {
        modalContent.classList.toggle('fullscreen');
        if (modalContent.classList.contains('fullscreen')) {
            zoomBtn.classList.remove('fa-expand');
            zoomBtn.classList.add('fa-compress');
        } else {
            zoomBtn.classList.remove('fa-compress');
            zoomBtn.classList.add('fa-expand');
        }
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('summaryModal');
    if (event.target == modal) {
        closeSummaryModal();
    }
}

// ESC key to exit fullscreen or close
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const modal = document.getElementById('summaryModal');
        if (modal && modal.style.display === 'block') {
            const content = modal.querySelector('.summary-modal-content');
            if (content && content.classList.contains('fullscreen')) {
                toggleSummaryFullscreen();
            } else {
                closeSummaryModal();
            }
        }
    }
});

// Toggle Inline Explanation
document.addEventListener('click', function(e) {
    const term = e.target.closest('.interactive-term');
    if (term) {
        const expansion = term.nextElementSibling;
        if (expansion && expansion.classList.contains('term-expansion')) {
            expansion.classList.toggle('show');
            term.classList.toggle('active');
        }
    }
});

// Toggle Main Sections
document.addEventListener('click', function(e) {
    const toggle = e.target.closest('.section-toggle');
    if (toggle) {
        toggle.classList.toggle('active');
        const content = toggle.nextElementSibling;
        if (content && content.classList.contains('section-content')) {
            content.classList.toggle('collapsed');
        }
    }
});
