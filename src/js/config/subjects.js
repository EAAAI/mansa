/**
 * Subjects Configuration
 * Centralized definitions for all subjects across the platform
 * 
 * HOW TO ADD A NEW SUBJECT:
 * 1. Add entry to SUBJECTS object below
 * 2. Create CSS file: src/css/subjects/[subjectId].css
 * 3. Create data file: src/data/[subjectId]-data.js
 * 4. Add subject card to index.html
 */

const SUBJECTS = {
    // Physics
    physics2: {
        id: 'physics2',
        title: 'فيزياء 2',
        subtitle: 'Modern Physics & Electricity',
        icon: 'fas fa-atom',
        color: '#667eea',
        gradient: 'linear-gradient(135deg, #667eea, #764ba2)',
        css: 'src/css/subjects/physics2.css',
        data: 'src/data/physics2-data.js',
        year: 1,
        college: 'general'
    },
    
    // IT
    it: {
        id: 'it',
        title: 'IT',
        subtitle: 'Information Technology',
        icon: 'fas fa-laptop-code',
        color: '#00d9ff',
        gradient: 'linear-gradient(135deg, #00d9ff, #667eea)',
        css: 'src/css/subjects/it.css',
        data: 'src/data/it-data.js',
        year: 1,
        college: 'general'
    },
    
    // Electronics
    electronics: {
        id: 'electronics',
        title: 'إلكترونيات',
        subtitle: 'Electronics & Circuits',
        icon: 'fas fa-microchip',
        color: '#ff6b6b',
        gradient: 'linear-gradient(135deg, #ff6b6b, #ffb347)',
        css: 'src/css/subjects/electronics.css',
        data: 'src/data/electronics-data.js',
        year: 1,
        college: 'engineering'
    },
    
    // Mathematics
    math0: {
        id: 'math0',
        title: 'رياضيات 0',
        subtitle: 'Calculus & Algebra',
        icon: 'fas fa-calculator',
        color: '#00d9ff',
        gradient: 'linear-gradient(135deg, #00d9ff, #00a8cc)',
        css: 'src/css/subjects/math0.css',
        data: 'src/data/math0-data.js',
        year: 0,
        college: 'general'
    },
    math1: {
        id: 'math1',
        title: 'رياضيات 1',
        subtitle: 'Advanced Calculus',
        icon: 'fas fa-square-root-alt',
        color: '#11998e',
        gradient: 'linear-gradient(135deg, #11998e, #38ef7d)',
        css: 'src/css/subjects/math1.css',
        data: 'src/data/math1-data.js',
        year: 1,
        college: 'general'
    },
    
    // History
    history: {
        id: 'history',
        title: 'تاريخ الحوسبة',
        subtitle: 'History of Computing',
        icon: 'fas fa-history',
        color: '#d4a574',
        gradient: 'linear-gradient(135deg, #d4a574, #8b5a2b)',
        css: 'src/css/subjects/history.css',
        data: 'src/data/history-data.js',
        year: 1,
        college: 'general'
    },
    
    // Law
    law: {
        id: 'law',
        title: 'قوانين الحاسب',
        subtitle: 'Computer Law & Ethics',
        icon: 'fas fa-gavel',
        color: '#1a1a2e',
        gradient: 'linear-gradient(135deg, #434343, #1a1a2e)',
        css: 'src/css/subjects/law.css',
        data: 'src/data/law-data.js',
        year: 1,
        college: 'law'
    },
    
    // English
    english: {
        id: 'english',
        title: 'اللغة الإنجليزية',
        subtitle: 'English for Computing',
        icon: 'fas fa-language',
        color: '#f093fb',
        gradient: 'linear-gradient(135deg, #f093fb, #f5576c)',
        css: 'src/css/subjects/english.css',
        data: 'src/data/english-data.js',
        year: 1,
        college: 'general'
    }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get subject by ID
 * @param {string} subjectId - The subject ID (e.g., 'physics2')
 * @returns {object|null} Subject config object or null
 */
function getSubject(subjectId) {
    return SUBJECTS[subjectId] || null;
}

/**
 * Get all subjects for a specific year
 * @param {number} year - Year number (0, 1, 2, etc.)
 * @returns {object[]} Array of subject configs
 */
function getSubjectsByYear(year) {
    return Object.values(SUBJECTS).filter(s => s.year === year);
}

/**
 * Get all subjects for a specific college
 * @param {string} college - College name (e.g., 'pharmacy', 'engineering')
 * @returns {object[]} Array of subject configs
 */
function getSubjectsByCollege(college) {
    return Object.values(SUBJECTS).filter(s => s.college === college);
}

/**
 * Get all subject IDs
 * @returns {string[]} Array of subject IDs
 */
function getAllSubjectIds() {
    return Object.keys(SUBJECTS);
}

/**
 * Check if subject exists
 * @param {string} subjectId - The subject ID
 * @returns {boolean} True if subject exists
 */
function subjectExists(subjectId) {
    return SUBJECTS.hasOwnProperty(subjectId);
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.SUBJECTS = SUBJECTS;
    window.getSubject = getSubject;
    window.getSubjectsByYear = getSubjectsByYear;
    window.getSubjectsByCollege = getSubjectsByCollege;
    window.getAllSubjectIds = getAllSubjectIds;
    window.subjectExists = subjectExists;
}
