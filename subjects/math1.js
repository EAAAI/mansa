// Firebase Configuration
const firebaseConfig = { apiKey: "AIzaSyCFhUdOI9IqFCjBkg8zytanD5O1_67vCr4", authDomain: "manasa-ceaa2.firebaseapp.com", projectId: "manasa-ceaa2", storageBucket: "manasa-ceaa2.firebasestorage.app", messagingSenderId: "847284305108", appId: "1:847284305108:web:7a14698f76b3981c6acf41" };
let db; try { firebase.initializeApp(firebaseConfig); db = firebase.firestore(); } catch (e) { }

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
                // Convert Firebase question format to our format
                const q = {
                    question: data.question,
                    options: data.options,
                    correct: data.correct,
                    imageUrl: data.imageUrl,
                    source: 'firebase',
                    id: doc.id
                };
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
            opt.querySelector('.option-icon').innerHTML = '<i class="fas fa-times></i>';
        }
    });

    const feedback = card.querySelector('.bank-feedback');
    feedback.style.display = 'block';

    // Build feedback HTML with explanation if available
    let feedbackHTML = isCorrect
        ? '<i class="fas fa-check-circle"></i> إجابة صحيحة! 🎉'
        : '<i class="fas fa-times-circle"></i> إجابة خاطئة.';

    if (question && question.explanation) {
        feedbackHTML += `<div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1);"><i class="fas fa-lightbulb" style="color: #ffd700;"></i> <strong>الشرح:</strong><br>${question.explanation}</div>`;
    } else if (question) {
        // Generate explanation automatically using Groq AI
        feedbackHTML += `<div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1);"><i class="fas fa-robot" style="color: #00d4ff;"></i> <strong>جاري توليد الشرح...</strong></div>`;

        // Generate explanation asynchronously
        generateExplanation(question, correctIndex).then(explanation => {
            const explanationDiv = feedback.querySelector('div:last-child');
            if (explanationDiv) {
                explanationDiv.innerHTML = `<i class="fas fa-lightbulb" style="color: #ffd700;"></i> <strong>الشرح (AI):</strong><br>${explanation}`;
            }
        }).catch(() => {
            const explanationDiv = feedback.querySelector('div:last-child');
            if (explanationDiv) {
                explanationDiv.innerHTML = `<i class="fas fa-info-circle"></i> <em>لم يتم إضافة شرح لهذا السؤال</em>`;
            }
        });
    }

    feedback.innerHTML = feedbackHTML;
    feedback.className = 'bank-feedback ' + (isCorrect ? 'correct' : 'wrong');
    card.querySelector('.show-answer-btn').style.display = 'none';
    card.querySelector('.answer-reveal').style.display = 'flex';
}

// Generate explanation using Groq AI
async function generateExplanation(question, correctIndex) {
    try {
        const questionText = question.question || '';
        const correctAnswer = question.options[correctIndex];

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY_EXPLANATION}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [{
                    role: 'system',
                    content: 'أنت معلم رياضيات. اشرح الإجابة الصحيحة بشكل مختصر وواضح بالعربية.'
                }, {
                    role: 'user',
                    content: `السؤال: ${questionText}\nالإجابة الصحيحة: ${correctAnswer}\n\nاشرح لماذا هذه الإجابة صحيحة بشكل مختصر (3-4 أسطر فقط).`
                }],
                temperature: 0.7,
                max_tokens: 200
            })
        });

        const data = await response.json();
        return data.choices?.[0]?.message?.content || 'لم يتم إضافة شرح لهذا السؤال';
    } catch (error) {
        throw error;
    }
}
function showBankAnswer(btn, correctIndex) {
    const card = btn.closest('.bank-question-card');

    // Get question data to access explanation
    const questionIndex = Array.from(card.parentElement.children).indexOf(card);
    const question = filteredQuestions[questionIndex];

    card.querySelectorAll('.bank-option-btn').forEach((opt, i) => {
        if (i === correctIndex) {
            opt.classList.add('correct');
            opt.querySelector('.option-icon').innerHTML = '<i class="fas fa-check"></i>';
        }
    });

    btn.style.display = 'none';
    card.querySelector('.answer-reveal').style.display = 'flex';

    // Show explanation if available or generate it
    const feedback = card.querySelector('.bank-feedback');
    if (question && question.explanation) {
        feedback.style.display = 'block';
        feedback.innerHTML = `<i class="fas fa-lightbulb" style="color: #ffd700;"></i> <strong>الشرح:</strong><br>${question.explanation}`;
        feedback.className = 'bank-feedback';
    } else if (question) {
        feedback.style.display = 'block';
        feedback.innerHTML = `<i class="fas fa-robot" style="color: #00d4ff;"></i> <strong>جاري توليد الشرح...</strong>`;
        feedback.className = 'bank-feedback';

        // Generate explanation asynchronously
        generateExplanation(question, correctIndex).then(explanation => {
            feedback.innerHTML = `<i class="fas fa-lightbulb" style="color: #ffd700;"></i> <strong>الشرح (AI):</strong><br>${explanation}`;
        }).catch(() => {
            feedback.innerHTML = `<i class="fas fa-info-circle"></i> <em>لم يتم إضافة شرح لهذا السؤال</em>`;
        });
    }
}
function filterQuestions() { currentBankPage = 1; renderQuestionsBank(); }

// Essay Challenge Functions
function startEssayChallenge() { const nameInput = document.getElementById('essayPlayerName'); const name = nameInput.value.trim() || document.getElementById('challengerName').value.trim(); if (!name) { alert('من فضلك أدخل اسمك!'); nameInput.focus(); return; } if (essayQuestions.length < ESSAYS_PER_CHALLENGE) { alert('لا توجد أسئلة مقالية كافية'); return; } essayChallenge.userName = name; essayChallenge.questions = shuffleArray([...essayQuestions]).slice(0, ESSAYS_PER_CHALLENGE); essayChallenge.currentIndex = 0; essayChallenge.answers = new Array(ESSAYS_PER_CHALLENGE).fill(''); essayChallenge.timeLeft = ESSAY_TIME; essayChallenge.active = true; document.getElementById('essayIntro').style.display = 'none'; document.getElementById('essayContainer').style.display = 'block'; document.getElementById('essayResult').style.display = 'none'; showEssayQuestion(0); startEssayTimer(); }
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
document.addEventListener('DOMContentLoaded', () => { const s = localStorage.getItem('userProfile'); if (s) { try { const p = JSON.parse(s); if (p.name) { document.getElementById('challengerName').value = p.name; const en = document.getElementById('essayPlayerName'); if (en) en.value = p.name; } } catch (e) { } } document.getElementById('totalQuestions').textContent = questions.length; const te = document.getElementById('totalEssay'); if (te) te.textContent = essayQuestions.length; loadLeaderboard(); renderQuestionsBank(); renderEssayBank(); });
