// Subject Core Module
// Contains all shared logic for subject pages: challenge, question bank, leaderboard, essay
// This file is loaded ONCE instead of duplicating in every subject file

// Subject Configuration (set by subject-logic.js before this runs)
let SUBJECT_ID = '';
let SUBJECT_NAME = '';
const CHALLENGE_TIME = 300;
const QUESTIONS_PER_CHALLENGE = 15;
const ESSAY_TIME = 660;
const ESSAYS_PER_CHALLENGE = 5;
const QUESTIONS_PER_PAGE = 5;
const ESSAYS_PER_PAGE = 3;

// Question data (populated by individual subject data files)
let questions = [];
let essayQuestions = [];
let summaries = [];

// Set subject data (called by subject-logic.js after loading subject data)
function setSubjectData(id, name, mcqQuestions, essays, sums) {
    SUBJECT_ID = id;
    SUBJECT_NAME = name;
    questions = mcqQuestions || [];
    essayQuestions = essays || [];
    summaries = sums || [];
    
    // Initialize UI
    initSubjectPage();
}

// Challenge State
let challenge = {
    active: false,
    questions: [],
    currentIndex: 0,
    answers: [],
    score: 0,
    timeLeft: CHALLENGE_TIME,
    timerInterval: null,
    startTime: null,
    userName: ''
};

// Essay Challenge State
let essayChallenge = {
    active: false,
    questions: [],
    currentIndex: 0,
    answers: [],
    timeLeft: ESSAY_TIME,
    timerInterval: null,
    userName: ''
};

// Bank pagination
let currentBankPage = 1;
let currentEssayPage = 1;
let filteredQuestions = [];
let filteredEssay = [];

// ===================== HELPER FUNCTIONS =====================

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

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ===================== NAVIGATION =====================

function updateActiveNav() {
    const sections = ['hero', 'summaries', 'bank', 'challenge', 'essay-bank', 'essay-challenge', 'leaderboard', 'ask-ai'];
    const navLinks = document.querySelectorAll('.nav-link');

    let currentSection = 'hero';
    sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            const rect = section.getBoundingClientRect();
            if (rect.top <= 150) {
                currentSection = sectionId;
            }
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + currentSection) {
            link.classList.add('active');
        }
    });
}

// ===================== MCQ CHALLENGE =====================

function startChallenge() {
    const nameInput = document.getElementById('challengerName');
    const name = nameInput ? nameInput.value.trim() : '';

    if (!name) {
        alert('من فضلك أدخل اسمك أولاً!');
        if (nameInput) nameInput.focus();
        return;
    }

    if (questions.length < QUESTIONS_PER_CHALLENGE) {
        alert(`لا توجد أسئلة كافية. المتاح: ${questions.length}`);
        return;
    }

    challenge.userName = name;
    challenge.questions = shuffleArray([...questions]).slice(0, QUESTIONS_PER_CHALLENGE);
    challenge.currentIndex = 0;
    challenge.answers = new Array(QUESTIONS_PER_CHALLENGE).fill(null);
    challenge.score = 0;
    challenge.timeLeft = CHALLENGE_TIME;
    challenge.startTime = Date.now();
    challenge.active = true;

    document.getElementById('challengeIntro').style.display = 'none';
    document.getElementById('challengeContainer').style.display = 'block';
    document.getElementById('challengeResult').style.display = 'none';

    showQuestion(0);
    startTimer();
}

function showQuestion(index) {
    const q = challenge.questions[index];

    document.getElementById('questionBadge').textContent = `السؤال ${index + 1}`;
    document.getElementById('questionText').innerHTML = getQuestionText(q);
    document.getElementById('questionProgress').textContent = `${index + 1}/${QUESTIONS_PER_CHALLENGE}`;

    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';

    const letters = ['A', 'B', 'C', 'D'];
    const opts = getOptions(q);
    opts.forEach((option, i) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        if (challenge.answers[index] === i) {
            btn.classList.add('selected');
        }
        btn.innerHTML = `
            <span class="option-letter">${letters[i]}</span>
            <span class="option-text">${getOptionText(q, i)}</span>
        `;
        btn.onclick = () => selectOption(i);
        optionsContainer.appendChild(btn);
    });

    document.getElementById('prevBtn').disabled = index === 0;

    if (index === QUESTIONS_PER_CHALLENGE - 1) {
        document.getElementById('nextBtn').style.display = 'none';
        document.getElementById('submitBtn').style.display = 'flex';
    } else {
        document.getElementById('nextBtn').style.display = 'flex';
        document.getElementById('submitBtn').style.display = 'none';
    }
}

function selectOption(optionIndex) {
    challenge.answers[challenge.currentIndex] = optionIndex;
    document.querySelectorAll('.option-btn').forEach((btn, i) => {
        btn.classList.toggle('selected', i === optionIndex);
    });
}

function nextQuestion() {
    if (challenge.currentIndex < QUESTIONS_PER_CHALLENGE - 1) {
        challenge.currentIndex++;
        showQuestion(challenge.currentIndex);
    }
}

function prevQuestion() {
    if (challenge.currentIndex > 0) {
        challenge.currentIndex--;
        showQuestion(challenge.currentIndex);
    }
}

function startTimer() {
    updateTimerDisplay();
    challenge.timerInterval = setInterval(() => {
        challenge.timeLeft--;
        updateTimerDisplay();
        if (challenge.timeLeft <= 60) {
            document.getElementById('timer').classList.add('warning');
        }
        if (challenge.timeLeft <= 0) {
            submitChallenge();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const timerDisplay = document.getElementById('timerDisplay');
    if (timerDisplay) {
        timerDisplay.textContent = formatTime(challenge.timeLeft);
    }
}

function submitChallenge() {
    clearInterval(challenge.timerInterval);
    challenge.active = false;

    let score = 0;
    challenge.questions.forEach((q, i) => {
        if (challenge.answers[i] === q.correct) {
            score++;
        }
    });

    challenge.score = score;
    const timeTaken = CHALLENGE_TIME - challenge.timeLeft;
    const percentage = Math.round((score / QUESTIONS_PER_CHALLENGE) * 100);

    document.getElementById('challengeContainer').style.display = 'none';
    document.getElementById('challengeResult').style.display = 'block';

    document.getElementById('finalScore').textContent = `${score}/${QUESTIONS_PER_CHALLENGE}`;
    document.getElementById('finalTime').textContent = formatTime(timeTaken);
    document.getElementById('percentage').textContent = `${percentage}%`;

    let icon, title;
    if (percentage >= 90) { icon = '🏆'; title = 'ممتاز! أنت نجم!'; }
    else if (percentage >= 70) { icon = '🌟'; title = 'أحسنت!'; }
    else if (percentage >= 50) { icon = '💪'; title = 'جيد، استمر!'; }
    else { icon = '📚'; title = 'تحتاج مراجعة أكثر'; }

    document.getElementById('resultIcon').textContent = icon;
    document.getElementById('resultTitle').textContent = title;
    
    const currentScoreEl = document.getElementById('currentScore');
    if (currentScoreEl) currentScoreEl.textContent = score;

    saveToLeaderboard(score, timeTaken);
}

function restartChallenge() {
    document.getElementById('challengeResult').style.display = 'none';
    document.getElementById('challengeIntro').style.display = 'block';
    document.getElementById('timer').classList.remove('warning');
    const currentScoreEl = document.getElementById('currentScore');
    if (currentScoreEl) currentScoreEl.textContent = '0';
}

// ===================== LEADERBOARD =====================

async function saveToLeaderboard(score, time) {
    if (typeof dbLeaderboard === 'undefined' || !dbLeaderboard) return;
    
    try {
        await dbLeaderboard.collection(`leaderboard_${SUBJECT_ID}`).add({
            name: challenge.userName,
            score: score,
            time: time,
            date: new Date().toISOString(),
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        loadLeaderboard();
    } catch (error) {
        // Save failed silently
    }
}

async function loadLeaderboard() {
    const noRecords = document.getElementById('noRecords');
    const tbody = document.getElementById('leaderboardBody');
    
    if (typeof dbLeaderboard === 'undefined' || !dbLeaderboard) {
        if (noRecords) noRecords.style.display = 'block';
        return;
    }

    try {
        const snapshot = await dbLeaderboard.collection(`leaderboard_${SUBJECT_ID}`)
            .orderBy('score', 'desc')
            .orderBy('time', 'asc')
            .limit(20)
            .get();

        if (!tbody) return;
        tbody.innerHTML = '';

        if (snapshot.empty) {
            if (noRecords) noRecords.style.display = 'block';
            return;
        }

        if (noRecords) noRecords.style.display = 'none';
        const totalPlayers = document.getElementById('totalPlayers');
        if (totalPlayers) totalPlayers.textContent = snapshot.size;

        snapshot.docs.forEach((doc, index) => {
            const data = doc.data();
            const tr = document.createElement('tr');

            let rankDisplay = index + 1;
            if (index === 0) rankDisplay = '🥇';
            else if (index === 1) rankDisplay = '🥈';
            else if (index === 2) rankDisplay = '🥉';

            const date = data.date ? new Date(data.date).toLocaleDateString('ar-EG') : '-';

            tr.innerHTML = `
                <td>${rankDisplay}</td>
                <td>${data.name}</td>
                <td>${data.score}/${QUESTIONS_PER_CHALLENGE}</td>
                <td>${formatTime(data.time)}</td>
                <td>${date}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        if (noRecords) noRecords.style.display = 'block';
    }
}

// ===================== QUESTION BANK =====================

function renderQuestionsBank(showAll = false) {
    const container = document.getElementById('questionsList');
    if (!container) return;
    
    container.innerHTML = '';

    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

    filteredQuestions = questions;
    if (searchTerm) {
        filteredQuestions = questions.filter(q =>
            getQuestionTextPlain(q).toLowerCase().includes(searchTerm) ||
            (q.optionsEn && q.optionsEn.some(o => o.toLowerCase().includes(searchTerm))) ||
            (q.optionsAr && q.optionsAr.some(o => o.toLowerCase().includes(searchTerm))) ||
            (q.options && q.options.some(o => o.toLowerCase().includes(searchTerm)))
        );
        currentBankPage = 1;
    }

    const displayedCount = document.getElementById('displayedCount');
    if (displayedCount) displayedCount.textContent = filteredQuestions.length;

    if (filteredQuestions.length === 0) {
        container.innerHTML = '<p class="no-records">لا توجد نتائج مطابقة</p>';
        return;
    }

    const letters = ['A', 'B', 'C', 'D'];
    const questionsToShow = showAll ? filteredQuestions : filteredQuestions.slice(0, currentBankPage * QUESTIONS_PER_PAGE);

    questionsToShow.forEach((q, index) => {
        const card = document.createElement('div');
        card.className = 'bank-question-card';
        card.dataset.correct = q.correct;
        card.dataset.answered = 'false';

        let optionsHTML = '';
        const opts = getOptions(q);
        opts.forEach((opt, i) => {
            optionsHTML += `
                <button class="bank-option-btn" data-index="${i}" onclick="selectBankOption(this, ${q.correct})">
                    <span class="option-letter">${letters[i]}</span>
                    <span class="option-text">${getOptionText(q, i)}</span>
                    <span class="option-icon"></span>
                </button>
            `;
        });

        card.innerHTML = `
            <div class="bank-question-header">
                <h4>${index + 1}.</h4>${getQuestionText(q)}
            </div>
            <div class="bank-options">
                ${optionsHTML}
            </div>
            <div class="bank-actions">
                <button class="show-answer-btn" onclick="showBankAnswer(this, ${q.correct})">
                    <i class="fas fa-eye"></i> Show Answer
                </button>
                <div class="answer-reveal" style="display: none;">
                    <i class="fas fa-check-circle"></i>
                    <span>Correct: ${getCorrectAnswerText(q)}</span>
                </div>
            </div>
            <div class="bank-feedback" style="display: none;"></div>
        `;
        container.appendChild(card);
    });

    const remaining = filteredQuestions.length - questionsToShow.length;
    if (remaining > 0 && !showAll) {
        const showMoreBtn = document.createElement('button');
        showMoreBtn.className = 'show-more-btn';
        showMoreBtn.innerHTML = `<i class="fas fa-chevron-down"></i> عرض المزيد (${remaining} سؤال متبقي)`;
        showMoreBtn.onclick = () => {
            currentBankPage++;
            renderQuestionsBank();
        };
        container.appendChild(showMoreBtn);
    }
}

function selectBankOption(btn, correctIndex) {
    const card = btn.closest('.bank-question-card');
    if (card.dataset.answered === 'true') return;

    const selectedIndex = parseInt(btn.dataset.index);
    const isCorrect = selectedIndex === correctIndex;

    card.dataset.answered = 'true';

    const allOptions = card.querySelectorAll('.bank-option-btn');
    allOptions.forEach((opt, i) => {
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

    if (isCorrect) {
        feedback.innerHTML = '<i class="fas fa-check-circle"></i> إجابة صحيحة! أحسنت 🎉';
        feedback.className = 'bank-feedback correct';
    } else {
        feedback.innerHTML = '<i class="fas fa-times-circle"></i> إجابة خاطئة. الإجابة الصحيحة موضحة باللون الأخضر';
        feedback.className = 'bank-feedback wrong';
    }

    card.querySelector('.show-answer-btn').style.display = 'none';
    card.querySelector('.answer-reveal').style.display = 'flex';
}

function showBankAnswer(btn, correctIndex) {
    const card = btn.closest('.bank-question-card');

    const allOptions = card.querySelectorAll('.bank-option-btn');
    allOptions.forEach((opt, i) => {
        if (i === correctIndex) {
            opt.classList.add('correct');
            opt.querySelector('.option-icon').innerHTML = '<i class="fas fa-check"></i>';
        }
    });

    btn.style.display = 'none';
    card.querySelector('.answer-reveal').style.display = 'flex';
}

function filterQuestions() {
    renderQuestionsBank();
}

// ===================== ESSAY BANK =====================

function renderEssayBank() {
    const container = document.getElementById('essayList');
    if (!container) return;
    
    container.innerHTML = '';

    const searchInput = document.getElementById('essaySearchInput');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

    filteredEssay = essayQuestions;
    if (searchTerm) {
        filteredEssay = essayQuestions.filter(q =>
            (q.questionEn && q.questionEn.toLowerCase().includes(searchTerm)) ||
            (q.questionAr && q.questionAr.toLowerCase().includes(searchTerm))
        );
        currentEssayPage = 1;
    }

    const displayedEssay = document.getElementById('displayedEssayCount');
    if (displayedEssay) displayedEssay.textContent = filteredEssay.length;

    if (filteredEssay.length === 0) {
        container.innerHTML = '<p class="no-records">لا توجد أسئلة مقالية متاحة</p>';
        return;
    }

    const essaysToShow = filteredEssay.slice(0, currentEssayPage * ESSAYS_PER_PAGE);

    essaysToShow.forEach((q, index) => {
        const card = document.createElement('div');
        card.className = 'essay-question-card';

        card.innerHTML = `
            <div class="essay-question-header">
                <h4>${index + 1}.</h4>
                <div class="bilingual-essay">
                    <p class="q-en"><span class="lang-label">🇬🇧</span> ${q.questionEn || ''}</p>
                    <p class="q-ar"><span class="lang-label">🇸🇦</span> ${q.questionAr || ''}</p>
                </div>
            </div>
            <div class="essay-answer-section">
                <button class="toggle-answer-btn" onclick="toggleEssayAnswer(this)">
                    <i class="fas fa-eye"></i> عرض الإجابة النموذجية
                </button>
                <div class="essay-answer" style="display: none;">
                    <h5>الإجابة النموذجية:</h5>
                    <div class="bilingual-answer">
                        <p class="a-en"><span class="lang-label">🇬🇧</span> ${q.answerEn || ''}</p>
                        <p class="a-ar"><span class="lang-label">🇸🇦</span> ${q.answerAr || ''}</p>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });

    const remaining = filteredEssay.length - essaysToShow.length;
    if (remaining > 0) {
        const showMoreBtn = document.createElement('button');
        showMoreBtn.className = 'show-more-btn';
        showMoreBtn.innerHTML = `<i class="fas fa-chevron-down"></i> عرض المزيد (${remaining} سؤال متبقي)`;
        showMoreBtn.onclick = () => {
            currentEssayPage++;
            renderEssayBank();
        };
        container.appendChild(showMoreBtn);
    }
}

function toggleEssayAnswer(btn) {
    const answerSection = btn.nextElementSibling;
    if (answerSection.style.display === 'none') {
        answerSection.style.display = 'block';
        btn.innerHTML = '<i class="fas fa-eye-slash"></i> إخفاء الإجابة';
    } else {
        answerSection.style.display = 'none';
        btn.innerHTML = '<i class="fas fa-eye"></i> عرض الإجابة النموذجية';
    }
}

function filterEssayQuestions() {
    renderEssayBank();
}

// ===================== ASK AI =====================

async function askSubjectAI() {
    const input = document.getElementById('aiInput');
    if (!input) return;
    
    const question = input.value.trim();
    if (!question) return;

    const messagesContainer = document.getElementById('aiMessages');
    if (!messagesContainer) return;

    // Add user message
    const userMessage = document.createElement('div');
    userMessage.className = 'ai-message user';
    userMessage.innerHTML = `
        <div class="message-avatar"><i class="fas fa-user"></i></div>
        <div class="message-content"><p>${question}</p></div>
    `;
    messagesContainer.appendChild(userMessage);

    input.value = '';
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Add loading message
    const loadingMessage = document.createElement('div');
    loadingMessage.className = 'ai-message bot';
    loadingMessage.id = 'loadingMessage';
    loadingMessage.innerHTML = `
        <div class="message-avatar"><i class="fas fa-robot"></i></div>
        <div class="message-content"><p>جاري التفكير...</p></div>
    `;
    messagesContainer.appendChild(loadingMessage);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    try {
        const response = await fetch(`${GEMINI_CONFIG.apiUrl}?key=${GEMINI_CONFIG.apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `أنت مساعد تعليمي متخصص في ${SUBJECT_NAME}. أجب على السؤال التالي بشكل واضح ومفصل:\n\n${question}`
                    }]
                }]
            })
        });

        const data = await response.json();
        const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'عذراً، لم أتمكن من الإجابة.';

        loadingMessage.remove();

        const botMessage = document.createElement('div');
        botMessage.className = 'ai-message bot';
        botMessage.innerHTML = `
            <div class="message-avatar"><i class="fas fa-robot"></i></div>
            <div class="message-content"><p>${aiResponse.replace(/\n/g, '<br>')}</p></div>
        `;
        messagesContainer.appendChild(botMessage);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

    } catch (error) {
        loadingMessage.remove();

        const errorMessage = document.createElement('div');
        errorMessage.className = 'ai-message bot';
        errorMessage.innerHTML = `
            <div class="message-avatar"><i class="fas fa-robot"></i></div>
            <div class="message-content"><p>عذراً، حدث خطأ. تأكد من اتصالك بالإنترنت.</p></div>
        `;
        messagesContainer.appendChild(errorMessage);
    }
}

// ===================== INITIALIZATION =====================

function initSubjectPage() {
    // Update counts
    const totalQuestions = document.getElementById('totalQuestions');
    if (totalQuestions) totalQuestions.textContent = questions.length;
    
    const totalEssay = document.getElementById('totalEssayQuestions');
    if (totalEssay) totalEssay.textContent = essayQuestions.length;

    // Render banks
    renderQuestionsBank();
    renderEssayBank();
    
    // Load leaderboard
    loadLeaderboard();

    // Setup scroll listener
    window.addEventListener('scroll', updateActiveNav);

    // Setup smooth scroll
    document.querySelectorAll('.nav-link, .btn[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const nav = document.querySelector('.subject-navbar');
                    const navHeight = nav ? nav.offsetHeight : 0;
                    const targetPosition = target.offsetTop - navHeight;
                    window.scrollTo({ top: targetPosition, behavior: 'smooth' });
                }
            }
        });
    });

    // Setup AI input enter key
    const aiInput = document.getElementById('aiInput');
    if (aiInput) {
        aiInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                askSubjectAI();
            }
        });
    }
}
