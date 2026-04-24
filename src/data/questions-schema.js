/**
 * Questions Schema & Validator
 * كل الأسئلة في المشروع لازم تتبع الـ format ده
 */

// ============================================
// MCQ QUESTION FORMAT
// ============================================
/*
{
    id: 'physics2_001',           // subject_رقم
    questionAr: 'السؤال بالعربي',
    questionEn: 'Question in English',  // اختياري
    optionsAr: ['أ', 'ب', 'ج', 'د'],
    optionsEn: ['A', 'B', 'C', 'D'],   // اختياري
    correct: 0,                   // index الإجابة الصح (0-3)
    explanation: 'شرح الإجابة',   // اختياري
    year: '2024',                 // سنة الامتحان
    source: 'exam',               // 'exam' | 'textbook' | 'ai'
    difficulty: 'medium',         // 'easy' | 'medium' | 'hard'
    tags: ['waves', 'optics']     // اختياري
}
*/

// ============================================
// ESSAY QUESTION FORMAT
// ============================================
/*
{
    id: 'physics2_essay_001',
    questionAr: 'السؤال بالعربي',
    questionEn: 'Question in English',
    modelAnswer: 'الإجابة النموذجية',
    keyPoints: ['نقطة 1', 'نقطة 2'],   // النقاط الأساسية للإجابة
    year: '2024',
    source: 'exam',
    difficulty: 'medium'
}
*/

// ============================================
// VALIDATOR FUNCTION
// ============================================
function validateQuestion(q, type = 'mcq') {
    if (type === 'mcq') {
        if (!q.id) return { valid: false, error: 'missing id' };
        if (!q.questionAr && !q.questionEn) return { valid: false, error: 'missing question text' };
        if (!q.optionsAr && !q.options) return { valid: false, error: 'missing options' };
        if (q.correct === undefined) return { valid: false, error: 'missing correct answer' };
    }
    if (type === 'essay') {
        if (!q.id) return { valid: false, error: 'missing id' };
        if (!q.questionAr && !q.questionEn) return { valid: false, error: 'missing question text' };
    }
    return { valid: true };
}

function validateAllQuestions(questions, type = 'mcq') {
    const errors = [];
    questions.forEach((q, i) => {
        const result = validateQuestion(q, type);
        if (!result.valid) errors.push(`Question ${i}: ${result.error}`);
    });
    return errors;
}

// ============================================
// HELPER: تحويل الـ format القديم للجديد
// ============================================
function normalizeQuestion(q, subjectId, index) {
    return {
        id: q.id || `${subjectId}_${String(index + 1).padStart(3, '0')}`,
        questionAr: q.questionAr || q.question || '',
        questionEn: q.questionEn || '',
        optionsAr: q.optionsAr || q.options || [],
        optionsEn: q.optionsEn || [],
        correct: q.correct ?? 0,
        explanation: q.explanation || '',
        year: q.year || '',
        source: q.source || 'unknown',
        difficulty: q.difficulty || 'medium',
        tags: q.tags || []
    };
}

if (typeof window !== 'undefined') {
    window.validateQuestion = validateQuestion;
    window.validateAllQuestions = validateAllQuestions;
    window.normalizeQuestion = normalizeQuestion;
}
