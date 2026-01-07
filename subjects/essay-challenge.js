/**
 * Essay Challenge Module - AI Grading with Image Upload (Refactored v2.0)
 * 
 * Features:
 * - State persistence with localStorage for crash recovery
 * - Lenient AI grading with encouraging feedback
 * - Improved timer logic with resume capability
 * - Enhanced error handling
 * 
 * Uses Google Gemini 1.5 Flash for grading handwritten answers
 */

// ============================================
// CONFIGURATION
// ============================================

const GEMINI_ESSAY_CONFIG = {
    apiKey: 'AIzaSyD-YBIQ4IODnWv9Yl7evcqy1aFr5fzxBlM',
    model: 'gemini-2.0-flash',
    get apiUrl() {
        return `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    }
};

const ESSAY_CHALLENGE_CONFIG = {
    TIMER: 15 * 60, // 15 minutes in seconds
    QUESTIONS_COUNT: 5,
    POINTS_PER_QUESTION: 5,
    TOTAL_POINTS: 25,
    STORAGE_KEY: 'essayChallengeSession'
};

// ============================================
// STATE MANAGEMENT
// ============================================

let essayChallengeState = {
    active: false,
    questions: [],
    allQuestions: [], // Store all available questions for reshuffling
    uploadedImages: [],
    timeLeft: ESSAY_CHALLENGE_CONFIG.TIMER,
    timerInterval: null,
    startTime: null,
    userName: '',
    subjectId: '',
    results: [],
    isGrading: false
};

// ============================================
// LOCAL STORAGE PERSISTENCE
// ============================================

/**
 * Save current session state to localStorage
 */
function saveSessionToStorage() {
    if (!essayChallengeState.active) return;

    const sessionData = {
        active: essayChallengeState.active,
        questions: essayChallengeState.questions,
        uploadedImages: essayChallengeState.uploadedImages.map(img =>
            img ? { base64: img.base64, mimeType: img.mimeType } : null
        ),
        startTime: essayChallengeState.startTime,
        userName: essayChallengeState.userName,
        subjectId: essayChallengeState.subjectId,
        timestamp: Date.now()
    };

    try {
        localStorage.setItem(ESSAY_CHALLENGE_CONFIG.STORAGE_KEY, JSON.stringify(sessionData));
    } catch (e) {
        console.warn('Could not save session to localStorage:', e);
    }
}

/**
 * Load session from localStorage if exists
 * @returns {Object|null} - Session data or null
 */
function loadSessionFromStorage() {
    try {
        const stored = localStorage.getItem(ESSAY_CHALLENGE_CONFIG.STORAGE_KEY);
        if (!stored) return null;

        const sessionData = JSON.parse(stored);

        // Check if session is still valid (within timer duration + 5 min buffer)
        const elapsed = (Date.now() - sessionData.timestamp) / 1000;
        if (elapsed > ESSAY_CHALLENGE_CONFIG.TIMER + 300) {
            clearSessionStorage();
            return null;
        }

        return sessionData;
    } catch (e) {
        console.warn('Could not load session from localStorage:', e);
        return null;
    }
}

/**
 * Clear session from localStorage
 */
function clearSessionStorage() {
    try {
        localStorage.removeItem(ESSAY_CHALLENGE_CONFIG.STORAGE_KEY);
    } catch (e) {
        console.warn('Could not clear session from localStorage:', e);
    }
}

/**
 * Check and resume session on page load
 */
function checkForExistingSession() {
    const session = loadSessionFromStorage();
    if (!session || !session.active) return false;

    // Calculate remaining time
    const elapsedSeconds = Math.floor((Date.now() - session.startTime) / 1000);
    const remainingTime = ESSAY_CHALLENGE_CONFIG.TIMER - elapsedSeconds;

    if (remainingTime <= 0) {
        clearSessionStorage();
        return false;
    }

    // Restore session
    essayChallengeState.active = true;
    essayChallengeState.questions = session.questions;
    essayChallengeState.uploadedImages = session.uploadedImages || [];
    essayChallengeState.startTime = session.startTime;
    essayChallengeState.userName = session.userName;
    essayChallengeState.subjectId = session.subjectId;
    essayChallengeState.timeLeft = remainingTime;
    essayChallengeState.results = [];

    return true;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Convert image file to Base64 string
 */
function convertImageToBase64(imageFile) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const base64String = e.target.result.split(',')[1];
            resolve(base64String);
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(imageFile);
    });
}

/**
 * Get MIME type from file
 */
function getMimeType(file) {
    return file.type || 'image/jpeg';
}

/**
 * Shuffle array randomly
 */
function shuffleEssayArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// ============================================
// AI GRADING (Lenient Teacher Persona)
// ============================================

/**
 * Grade a single essay answer using Gemini 1.5 Flash
 * with lenient, encouraging teacher persona
 */
async function gradeEssayWithGemini(base64Image, mimeType, questionText, modelAnswer) {
    const promptText = `أنت معلم متساهل ومشجع. مهمتك هي تصحيح إجابة الطالب المكتوبة بخط اليد.

🟢 *شخصيتك كمعلم:*
- أنت معلم لطيف يركز على الفهم وليس الكلمات المحفوظة
- تشجع الطالب دائماً حتى لو أخطأ
- تغفر الأخطاء الإملائية البسيطة
- تقدّر أي محاولة صحيحة

📋 *السؤال:*
"${questionText}"

✅ *الإجابة النموذجية:*
"${modelAnswer}"

📝 *قواعد التصحيح:*
1. ركّز على المعنى والمفهوم وليس التطابق الحرفي
2. إذا فهم الطالب الفكرة الأساسية، أعطه درجة كاملة أو شبه كاملة
3. تجاهل الأخطاء الإملائية البسيطة تماماً
4. إذا أضاف الطالب معلومات صحيحة إضافية، اعتبرها إيجابية
5. الكتابة بأسلوب عامي مقبولة إذا كان المعنى صحيحاً

⭐ *مقياس الدرجات:*
- 5: إجابة ممتازة - الطالب فاهم تماماً
- 4: إجابة جيدة جداً - فهم معظم النقاط
- 3: إجابة جيدة - فهم جزئي مقبول
- 2: إجابة ضعيفة - لكن يوجد محاولة
- 1: محاولة بسيطة
- 0: لا إجابة أو غير مقروءة

🔴 *مهم جداً:*
أرجع إجابتك كـ JSON فقط بدون أي تنسيق markdown:

{
  "score": رقم من 0 إلى 5,
  "feedback": "تعليق مشجع قصير بالعربية",
  "correction_details": {
    "what_was_wrong": "ما كان خاطئاً (أو 'لا شيء' إذا صحيح)",
    "ideal_answer": "ملخص مختصر للإجابة المثالية",
    "encouragement": "نصيحة مشجعة للطالب"
  }
}`;

    const requestBody = {
        contents: [{
            parts: [
                { text: promptText },
                {
                    inlineData: {
                        mimeType: mimeType,
                        data: base64Image
                    }
                }
            ]
        }],
        generationConfig: {
            temperature: 0.4,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024
        }
    };

    try {
        const response = await fetch(GEMINI_ESSAY_CONFIG.apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'فشل في الاتصال بـ Gemini API');
        }

        const data = await response.json();
        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!textResponse) {
            throw new Error('لم يتم استلام رد من الذكاء الاصطناعي');
        }

        // Parse JSON from response (handle potential markdown code blocks)
        let jsonString = textResponse.trim();
        if (jsonString.startsWith('```json')) {
            jsonString = jsonString.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (jsonString.startsWith('```')) {
            jsonString = jsonString.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }

        const result = JSON.parse(jsonString);

        // Build comprehensive feedback
        let fullFeedback = result.feedback || 'تم التصحيح';

        if (result.correction_details) {
            const details = result.correction_details;
            if (details.what_was_wrong && details.what_was_wrong !== 'لا شيء') {
                fullFeedback += `\n\n⚠️ ${details.what_was_wrong}`;
            }
            if (details.ideal_answer) {
                fullFeedback += `\n\n📖 الإجابة المثالية: ${details.ideal_answer}`;
            }
            if (details.encouragement) {
                fullFeedback += `\n\n💪 ${details.encouragement}`;
            }
        }

        return {
            score: Math.min(5, Math.max(0, result.score)),
            feedback: fullFeedback,
            correction_details: result.correction_details || null
        };
    } catch (error) {
        console.error('Grading error:', error);
        return {
            score: 0,
            feedback: `❌ خطأ في التصحيح: ${error.message}\n\nحاول مرة أخرى أو تأكد من وضوح الصورة.`,
            correction_details: null
        };
    }
}

// ============================================
// FIREBASE INTEGRATION
// ============================================

/**
 * Fetch essay questions from Firestore
 */
async function fetchEssayQuestionsFromFirebase(db, subjectId) {
    if (!db) {
        console.log('⚠️ Firebase not available');
        return [];
    }

    try {
        const collectionName = `essay_questions_${subjectId}`;
        const snapshot = await db.collection(collectionName).get();

        if (snapshot.empty) {
            console.log(`ℹ️ No essay questions found in ${collectionName}`);
            return [];
        }

        const questions = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            questions.push({
                id: doc.id,
                questionAr: data.questionAr || data.question || '',
                questionEn: data.questionEn || '',
                answerAr: data.answerAr || data.correct_answer || data.model_answer || data.answer || '',
                answerEn: data.answerEn || '',
                type: data.type || 'essay'
            });
        });

        console.log(`✅ Loaded ${questions.length} essay questions for ${subjectId}`);
        return questions;
    } catch (error) {
        console.error('❌ Error loading essay questions:', error);
        return [];
    }
}

// ============================================
// CHALLENGE INITIALIZATION
// ============================================

/**
 * Initialize Essay Challenge
 */
function initEssayChallenge(subjectId, questions) {
    essayChallengeState.subjectId = subjectId;
    essayChallengeState.allQuestions = questions || [];

    // Check for existing session to resume
    const hasSession = checkForExistingSession();

    if (hasSession) {
        console.log('📂 Resuming existing essay challenge session');
        resumeEssayChallenge();
    } else if (questions && questions.length > 0) {
        essayChallengeState.questions = shuffleEssayArray(questions).slice(0, ESSAY_CHALLENGE_CONFIG.QUESTIONS_COUNT);
    }
}

/**
 * Resume an existing session after page reload
 */
function resumeEssayChallenge() {
    // Hide intro, show challenge
    const intro = document.getElementById('essayChallengeIntro');
    const active = document.getElementById('essayChallengeActive');
    const result = document.getElementById('essayChallengeResult');

    if (intro) intro.style.display = 'none';
    if (active) active.style.display = 'block';
    if (result) result.style.display = 'none';

    renderEssayQuestions();
    startEssayChallengeTimer();

    // Restore uploaded images previews
    essayChallengeState.uploadedImages.forEach((img, index) => {
        if (img && img.base64) {
            const preview = document.getElementById(`preview${index}`);
            const previewImg = document.getElementById(`previewImg${index}`);
            const uploadLabel = document.querySelector(`#uploadArea${index} .essay-upload-label`);

            if (previewImg && preview) {
                previewImg.src = `data:${img.mimeType};base64,${img.base64}`;
                preview.style.display = 'block';
                if (uploadLabel) uploadLabel.style.display = 'none';
            }
        }
    });
}

// ============================================
// CHALLENGE START
// ============================================

/**
 * Start the Essay Challenge
 */
function startEssayChallengeMode(event) {
    // Prevent any form submission
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    const nameInput = document.getElementById('essayChallengerName');
    const name = nameInput?.value.trim() || document.getElementById('challengerName')?.value.trim();

    if (!name) {
        alert('من فضلك أدخل اسمك أولاً!');
        nameInput?.focus();
        return false;
    }

    if (essayChallengeState.allQuestions.length < ESSAY_CHALLENGE_CONFIG.QUESTIONS_COUNT) {
        if (essayChallengeState.questions.length < ESSAY_CHALLENGE_CONFIG.QUESTIONS_COUNT) {
            alert(`لا توجد أسئلة مقالية كافية. المتوفر: ${essayChallengeState.questions.length || essayChallengeState.allQuestions.length}`);
            return false;
        }
    }

    // Initialize state
    essayChallengeState.userName = name;
    essayChallengeState.uploadedImages = new Array(ESSAY_CHALLENGE_CONFIG.QUESTIONS_COUNT).fill(null);
    essayChallengeState.results = [];
    essayChallengeState.timeLeft = ESSAY_CHALLENGE_CONFIG.TIMER;
    essayChallengeState.startTime = Date.now();
    essayChallengeState.active = true;
    essayChallengeState.isGrading = false;

    // Shuffle questions if not already set
    if (!essayChallengeState.questions || essayChallengeState.questions.length === 0) {
        essayChallengeState.questions = shuffleEssayArray(essayChallengeState.allQuestions).slice(0, ESSAY_CHALLENGE_CONFIG.QUESTIONS_COUNT);
    }

    // Hide intro, show challenge
    document.getElementById('essayChallengeIntro').style.display = 'none';
    document.getElementById('essayChallengeActive').style.display = 'block';
    document.getElementById('essayChallengeResult').style.display = 'none';

    renderEssayQuestions();
    startEssayChallengeTimer();
    saveSessionToStorage();

    return false;
}

// ============================================
// RENDER QUESTIONS
// ============================================

/**
 * Render all essay questions with image upload inputs
 */
function renderEssayQuestions() {
    const container = document.getElementById('essayChallengeQuestionsContainer');
    if (!container) return;

    container.innerHTML = '';

    essayChallengeState.questions.forEach((q, index) => {
        const questionCard = document.createElement('div');
        questionCard.className = 'essay-challenge-question-card';
        questionCard.id = `essayQ${index}`;

        const questionText = q.questionAr || q.questionEn || q.question || '';
        const questionTextEn = q.questionEn || '';

        questionCard.innerHTML = `
            <div class="essay-q-header">
                <span class="essay-q-number">
                    <i class="fas fa-question-circle"></i>
                    السؤال ${index + 1}
                </span>
                <span class="essay-q-points">
                    <i class="fas fa-star"></i>
                    ${ESSAY_CHALLENGE_CONFIG.POINTS_PER_QUESTION} درجات
                </span>
            </div>
            <div class="essay-q-text">
                ${questionText}
                ${questionTextEn ? `<p class="essay-q-text-en">${questionTextEn}</p>` : ''}
            </div>
            <div class="essay-upload-area" id="uploadArea${index}">
                <input type="file" id="essayImage${index}" accept="image/*" 
                       onchange="handleEssayImageUpload(event, ${index}, this)" style="display: none;">
                <label for="essayImage${index}" class="essay-upload-label">
                    <div class="upload-icon-wrapper">
                        <i class="fas fa-cloud-upload-alt"></i>
                    </div>
                    <span class="upload-text-main">اضغط لرفع صورة إجابتك</span>
                    <span class="upload-text-sub">إجابة مكتوبة بخط اليد</span>
                    <small class="upload-hint">PNG, JPG, JPEG - الحد الأقصى 10MB</small>
                </label>
                <div class="essay-image-preview" id="preview${index}" style="display: none;">
                    <img id="previewImg${index}" src="" alt="معاينة">
                    <button type="button" class="remove-image-btn" onclick="removeEssayImage(event, ${index})">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                    <div class="image-success-badge">
                        <i class="fas fa-check-circle"></i>
                        تم الرفع بنجاح
                    </div>
                </div>
            </div>
            <div class="essay-feedback-area" id="feedback${index}" style="display: none;">
                <div class="feedback-loading">
                    <div class="grading-spinner"></div>
                    <span>جاري التصحيح بالذكاء الاصطناعي...</span>
                </div>
            </div>
        `;

        container.appendChild(questionCard);
    });
}

// ============================================
// IMAGE HANDLING
// ============================================

/**
 * Handle image upload for a question
 */
async function handleEssayImageUpload(event, index, input) {
    // Prevent form submission
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    const file = input.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
        alert('حجم الملف كبير جداً. الحد الأقصى 10MB');
        input.value = '';
        return;
    }

    try {
        const base64 = await convertImageToBase64(file);
        essayChallengeState.uploadedImages[index] = {
            file: file,
            base64: base64,
            mimeType: getMimeType(file)
        };

        // Show preview
        const preview = document.getElementById(`preview${index}`);
        const previewImg = document.getElementById(`previewImg${index}`);
        const uploadLabel = document.querySelector(`#uploadArea${index} .essay-upload-label`);

        previewImg.src = URL.createObjectURL(file);
        preview.style.display = 'block';
        if (uploadLabel) uploadLabel.style.display = 'none';

        // Save session
        saveSessionToStorage();

        console.log(`✅ Image uploaded for question ${index + 1}`);
    } catch (error) {
        console.error('Error uploading image:', error);
        alert('خطأ في رفع الصورة. حاول مرة أخرى.');
    }
}

/**
 * Remove uploaded image for a question
 */
function removeEssayImage(event, index) {
    // Prevent form submission
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    essayChallengeState.uploadedImages[index] = null;

    const preview = document.getElementById(`preview${index}`);
    const uploadLabel = document.querySelector(`#uploadArea${index} .essay-upload-label`);
    const input = document.getElementById(`essayImage${index}`);

    if (preview) preview.style.display = 'none';
    if (uploadLabel) uploadLabel.style.display = 'flex';
    if (input) input.value = '';

    // Save session
    saveSessionToStorage();
}

// ============================================
// TIMER
// ============================================

/**
 * Start the Essay Challenge timer
 */
function startEssayChallengeTimer() {
    // Clear any existing timer
    if (essayChallengeState.timerInterval) {
        clearInterval(essayChallengeState.timerInterval);
    }

    updateEssayChallengeTimerDisplay();

    essayChallengeState.timerInterval = setInterval(() => {
        if (!essayChallengeState.active) {
            clearInterval(essayChallengeState.timerInterval);
            return;
        }

        essayChallengeState.timeLeft--;
        updateEssayChallengeTimerDisplay();

        // Save to storage every 10 seconds
        if (essayChallengeState.timeLeft % 10 === 0) {
            saveSessionToStorage();
        }

        if (essayChallengeState.timeLeft <= 60) {
            document.getElementById('essayChallengeTimer')?.classList.add('warning');
        }

        if (essayChallengeState.timeLeft <= 0) {
            submitEssayChallenge();
        }
    }, 1000);
}

/**
 * Update timer display
 */
function updateEssayChallengeTimerDisplay() {
    const minutes = Math.floor(essayChallengeState.timeLeft / 60);
    const seconds = essayChallengeState.timeLeft % 60;
    const timerElement = document.getElementById('essayChallengeTimerText');
    if (timerElement) {
        timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}

// ============================================
// SUBMISSION & GRADING
// ============================================

/**
 * Submit Essay Challenge for AI grading
 */
async function submitEssayChallenge(event) {
    // Prevent form submission
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    if (!essayChallengeState.active || essayChallengeState.isGrading) return false;

    essayChallengeState.isGrading = true;
    clearInterval(essayChallengeState.timerInterval);
    essayChallengeState.active = false;

    // Clear storage since we're submitting
    clearSessionStorage();

    const submitBtn = document.getElementById('essaySubmitBtn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<div class="btn-loading"><div class="btn-spinner"></div><span>جاري التصحيح...</span></div>';
    }

    // Show grading overlay
    showGradingOverlay();

    const timeTaken = ESSAY_CHALLENGE_CONFIG.TIMER - essayChallengeState.timeLeft;
    let totalScore = 0;
    let answeredCount = 0;

    // Grade each question
    for (let i = 0; i < essayChallengeState.questions.length; i++) {
        const feedbackArea = document.getElementById(`feedback${i}`);
        if (feedbackArea) {
            feedbackArea.style.display = 'block';
        }

        const imageData = essayChallengeState.uploadedImages[i];
        const question = essayChallengeState.questions[i];

        let result;
        if (imageData && imageData.base64) {
            answeredCount++;
            updateGradingProgress(i + 1, essayChallengeState.questions.length);

            const questionText = question.questionAr || question.questionEn || '';
            const modelAnswer = question.answerAr || question.answerEn || '';

            result = await gradeEssayWithGemini(
                imageData.base64,
                imageData.mimeType,
                questionText,
                modelAnswer
            );
        } else {
            result = {
                score: 0,
                feedback: '📷 لم يتم رفع صورة الإجابة\n\n💡 تأكد من رفع صورة واضحة لإجابتك في المرة القادمة.',
                correction_details: null
            };
        }

        essayChallengeState.results.push(result);
        totalScore += result.score;

        // Update feedback display
        if (feedbackArea) {
            const scoreClass = result.score >= 4 ? 'excellent' :
                result.score >= 3 ? 'good' :
                    result.score >= 2 ? 'partial' : 'needs-work';

            feedbackArea.innerHTML = `
                <div class="essay-result-badge ${scoreClass}">
                    <div class="score-circle">
                        <span class="score-value">${result.score}</span>
                        <span class="score-max">/${ESSAY_CHALLENGE_CONFIG.POINTS_PER_QUESTION}</span>
                    </div>
                    <div class="score-label">${getScoreLabel(result.score)}</div>
                </div>
                <div class="essay-feedback-content">
                    ${result.feedback.split('\n').map(line => `<p>${line}</p>`).join('')}
                </div>
            `;
        }
    }

    // Hide grading overlay
    hideGradingOverlay();

    // Show final result
    showEssayChallengeResult(totalScore, timeTaken, answeredCount);
    essayChallengeState.isGrading = false;

    return false;
}

/**
 * Get score label based on score
 */
function getScoreLabel(score) {
    if (score >= 5) return 'ممتاز!';
    if (score >= 4) return 'جيد جداً';
    if (score >= 3) return 'جيد';
    if (score >= 2) return 'مقبول';
    if (score >= 1) return 'ضعيف';
    return 'لم تجب';
}

/**
 * Show grading overlay
 */
function showGradingOverlay() {
    let overlay = document.getElementById('gradingOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'gradingOverlay';
        overlay.className = 'grading-overlay';
        overlay.innerHTML = `
            <div class="grading-modal">
                <div class="grading-animation">
                    <div class="grading-brain">
                        <i class="fas fa-brain"></i>
                    </div>
                    <div class="grading-waves">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
                <h3>جاري التصحيح بالذكاء الاصطناعي</h3>
                <p id="gradingProgressText">تحليل الإجابة 1 من ${ESSAY_CHALLENGE_CONFIG.QUESTIONS_COUNT}</p>
                <div class="grading-progress-bar">
                    <div class="grading-progress-fill" id="gradingProgressFill"></div>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
    }
    overlay.style.display = 'flex';
}

/**
 * Update grading progress
 */
function updateGradingProgress(current, total) {
    const progressText = document.getElementById('gradingProgressText');
    const progressFill = document.getElementById('gradingProgressFill');

    if (progressText) {
        progressText.textContent = `تحليل الإجابة ${current} من ${total}`;
    }
    if (progressFill) {
        progressFill.style.width = `${(current / total) * 100}%`;
    }
}

/**
 * Hide grading overlay
 */
function hideGradingOverlay() {
    const overlay = document.getElementById('gradingOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

// ============================================
// RESULTS
// ============================================

/**
 * Show final result
 */
function showEssayChallengeResult(totalScore, timeTaken, answeredCount) {
    document.getElementById('essayChallengeActive').style.display = 'none';
    document.getElementById('essayChallengeResult').style.display = 'block';

    const percentage = Math.round((totalScore / ESSAY_CHALLENGE_CONFIG.TOTAL_POINTS) * 100);
    const minutes = Math.floor(timeTaken / 60);
    const seconds = timeTaken % 60;

    document.getElementById('essayFinalScore').textContent = `${totalScore}/${ESSAY_CHALLENGE_CONFIG.TOTAL_POINTS}`;
    document.getElementById('essayFinalTime').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('essayAnsweredCount').textContent = `${answeredCount}/${ESSAY_CHALLENGE_CONFIG.QUESTIONS_COUNT}`;

    let icon, title, subtitle;
    if (percentage >= 80) {
        icon = '🏆';
        title = 'ممتاز! أنت نجم!';
        subtitle = 'أداء رائع، استمر على هذا المستوى!';
    } else if (percentage >= 60) {
        icon = '🌟';
        title = 'أحسنت!';
        subtitle = 'أداء جيد جداً، يمكنك التحسن أكثر!';
    } else if (percentage >= 40) {
        icon = '💪';
        title = 'جيد، استمر!';
        subtitle = 'أنت على الطريق الصحيح!';
    } else {
        icon = '📚';
        title = 'تحتاج مراجعة أكثر';
        subtitle = 'لا تستسلم، المراجعة هي مفتاح النجاح!';
    }

    document.getElementById('essayResultIcon').textContent = icon;
    document.getElementById('essayResultTitle').textContent = title;

    const subtitleEl = document.getElementById('essayResultSubtitle');
    if (subtitleEl) subtitleEl.textContent = subtitle;
}

// ============================================
// RESTART
// ============================================

/**
 * Restart Essay Challenge
 */
function restartEssayChallenge(event) {
    // Prevent form submission
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    // Clear any running timer
    if (essayChallengeState.timerInterval) {
        clearInterval(essayChallengeState.timerInterval);
    }

    // Clear storage
    clearSessionStorage();

    // Reset state
    essayChallengeState.uploadedImages = [];
    essayChallengeState.results = [];
    essayChallengeState.timeLeft = ESSAY_CHALLENGE_CONFIG.TIMER;
    essayChallengeState.active = false;
    essayChallengeState.isGrading = false;
    essayChallengeState.startTime = null;

    // Reshuffle questions
    if (essayChallengeState.allQuestions.length >= ESSAY_CHALLENGE_CONFIG.QUESTIONS_COUNT) {
        essayChallengeState.questions = shuffleEssayArray(essayChallengeState.allQuestions).slice(0, ESSAY_CHALLENGE_CONFIG.QUESTIONS_COUNT);
    }

    // Reset UI
    document.getElementById('essayChallengeIntro').style.display = 'block';
    document.getElementById('essayChallengeActive').style.display = 'none';
    document.getElementById('essayChallengeResult').style.display = 'none';
    document.getElementById('essayChallengeTimer')?.classList.remove('warning');

    const submitBtn = document.getElementById('essaySubmitBtn');
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> إنهاء التحدي وتصحيح الإجابات';
    }

    return false;
}

// ============================================
// GLOBAL EXPORTS
// ============================================

window.startEssayChallengeMode = startEssayChallengeMode;
window.submitEssayChallenge = submitEssayChallenge;
window.restartEssayChallenge = restartEssayChallenge;
window.handleEssayImageUpload = handleEssayImageUpload;
window.removeEssayImage = removeEssayImage;
window.initEssayChallenge = initEssayChallenge;
window.fetchEssayQuestionsFromFirebase = fetchEssayQuestionsFromFirebase;
window.essayChallengeState = essayChallengeState;
window.ESSAY_CHALLENGE_CONFIG = ESSAY_CHALLENGE_CONFIG;
