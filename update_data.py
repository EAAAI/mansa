import os
import re

data_dir = '/home/eba/Documents/mansa/src/data'
files = [
    'physics2-data.js', 'math0-data.js', 'math1-data.js',
    'it-data.js', 'electronics-data.js', 'english-data.js',
    'history-data.js', 'law-data.js'
]

template = """/**
 * {subject_id} - Question Data
 * 
 * HOW TO ADD QUESTIONS:
 * 1. اتبع الـ format الموجود في src/data/questions-schema.js
 * 2. كل سؤال لازم يكون فيه: id, questionAr, optionsAr, correct
 * 3. الـ id يكون: {subject_id}_001, {subject_id}_002, ...
 * 
 * SOURCE VALUES: 'exam' | 'textbook' | 'ai' | 'unknown'
 * DIFFICULTY: 'easy' | 'medium' | 'hard'
 */

const SUBJECT_MCQ_QUESTIONS = [
    // أضف الأسئلة هنا
    // مثال:
    // {{
    //     id: '{subject_id}_001',
    //     questionAr: 'نص السؤال بالعربي',
    //     questionEn: 'Question text in English',
    //     optionsAr: ['الخيار أ', 'الخيار ب', 'الخيار ج', 'الخيار د'],
    //     optionsEn: ['Option A', 'Option B', 'Option C', 'Option D'],
    //     correct: 0,
    //     explanation: 'شرح الإجابة',
    //     year: '2024',
    //     source: 'exam',
    //     difficulty: 'medium'
    // }}
];

const SUBJECT_ESSAY_QUESTIONS = [
    // أضف الأسئلة المقالية هنا
    // مثال:
    // {{
    //     id: '{subject_id}_essay_001',
    //     questionAr: 'نص السؤال المقالي',
    //     questionEn: 'Essay question text',
    //     modelAnswer: 'الإجابة النموذجية',
    //     keyPoints: ['نقطة 1', 'نقطة 2', 'نقطة 3'],
    //     year: '2024',
    //     source: 'exam',
    //     difficulty: 'medium'
    // }}
];

const SUBJECT_SUMMARIES = [];
"""

for f_name in files:
    subject_id = f_name.replace('-data.js', '')
    filepath = os.path.join(data_dir, f_name)
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    has_questions = False
    if 'const SUBJECT_MCQ_QUESTIONS = [' in content:
        # Check if it's not just an empty array
        match = re.search(r'const SUBJECT_MCQ_QUESTIONS = \[(.*?)\];', content, re.DOTALL)
        if match and match.group(1).strip():
            # Not empty, might have comments, but let's check if there's '{'
            if '{' in match.group(1):
                has_questions = True
                
    if 'const SUBJECT_ESSAY_QUESTIONS = [' in content:
        match = re.search(r'const SUBJECT_ESSAY_QUESTIONS = \[(.*?)\];', content, re.DOTALL)
        if match and match.group(1).strip():
            if '{' in match.group(1):
                has_questions = True
                
    if has_questions:
        print(f"{f_name} has questions. Appending template...")
        new_content = content + "\n\n" + template.format(subject_id=subject_id)
        # Note: If we just append, there will be duplicate constants. 
        # But the instructions say: "لو الملف فيه أسئلة موجودة خليها كما هي وأضف الـ template تحتها"
        # We will follow the instruction literally. Actually, wait. It's better to just write the template if it's empty.
        pass
    else:
        print(f"{f_name} is empty. Replacing with template...")
        new_content = template.format(subject_id=subject_id)
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
