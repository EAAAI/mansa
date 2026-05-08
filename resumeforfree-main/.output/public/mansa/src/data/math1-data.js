/**
 * math1 - Question Data
 * 
 * HOW TO ADD QUESTIONS:
 * 1. اتبع الـ format الموجود في src/data/questions-schema.js
 * 2. كل سؤال لازم يكون فيه: id, questionAr, optionsAr, correct
 * 3. الـ id يكون: math1_001, math1_002, ...
 * 
 * SOURCE VALUES: 'exam' | 'textbook' | 'ai' | 'unknown'
 * DIFFICULTY: 'easy' | 'medium' | 'hard'
 */

const SUBJECT_MCQ_QUESTIONS = [
    // أضف الأسئلة هنا
    // مثال:
    // {
    //     id: 'math1_001',
    //     questionAr: 'نص السؤال بالعربي',
    //     questionEn: 'Question text in English',
    //     optionsAr: ['الخيار أ', 'الخيار ب', 'الخيار ج', 'الخيار د'],
    //     optionsEn: ['Option A', 'Option B', 'Option C', 'Option D'],
    //     correct: 0,
    //     explanation: 'شرح الإجابة',
    //     year: '2024',
    //     source: 'exam',
    //     difficulty: 'medium'
    // }
];

const SUBJECT_ESSAY_QUESTIONS = [
    // أضف الأسئلة المقالية هنا
    // مثال:
    // {
    //     id: 'math1_essay_001',
    //     questionAr: 'نص السؤال المقالي',
    //     questionEn: 'Essay question text',
    //     modelAnswer: 'الإجابة النموذجية',
    //     keyPoints: ['نقطة 1', 'نقطة 2', 'نقطة 3'],
    //     year: '2024',
    //     source: 'exam',
    //     difficulty: 'medium'
    // }
];

const SUBJECT_SUMMARIES = [];
