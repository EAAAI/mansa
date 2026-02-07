/**
 * Dynamic Subject Loader
 * This script handles loading the correct subject content based on URL parameter
 * 
 * REQUIRES: src/js/config/subjects.js must be loaded BEFORE this file
 */

// Current subject info (accessible globally)
let currentSubjectId = '';
let currentSubjectData = null;

// Run when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // 1. Extract Subject ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const subjectId = urlParams.get('id');

    // 2. Validate ID using centralized config
    if (!subjectId || !subjectExists(subjectId)) {
        window.location.href = 'index.html';
        return;
    }

    // 3. Get subject from centralized config
    currentSubjectId = subjectId;
    currentSubjectData = getSubject(subjectId);

    // 4. Load CSS first
    loadSubjectCSS(currentSubjectData.css);

    // 5. Update static content
    updatePageContent(subjectId, currentSubjectData);

    // 6. Load subject data file (which calls setSubjectData from subject-core.js)
    loadSubjectData(subjectId, currentSubjectData);
});

/**
 * Load subject-specific CSS
 * @param {string} cssPath - Path to CSS file
 */
function loadSubjectCSS(cssPath) {
    const cssLink = document.getElementById('subject-css');
    if (cssLink && cssPath) {
        cssLink.href = cssPath;
    }
}

/**
 * Update page content with subject information
 * @param {string} id - Subject ID
 * @param {object} data - Subject data object
 */
function updatePageContent(id, data) {
    // Page Title
    document.title = `${data.title} - ليالي الامتحان`;

    // Navbar Title
    const navTitle = document.getElementById('nav-subject-title');
    if (navTitle) {
        navTitle.innerHTML = `<i class="${data.icon}"></i> ${data.title}`;
    }

    // Hero Section
    const heroTitle = document.getElementById('hero-title');
    const heroSubtitle = document.getElementById('hero-subtitle');
    const heroBadge = document.getElementById('hero-badge');

    if (heroTitle) heroTitle.textContent = data.title;
    if (heroSubtitle) heroSubtitle.textContent = data.subtitle;
    if (heroBadge) heroBadge.innerHTML = `<i class="${data.icon}"></i>`;

    // Challenge Description
    const challengeDesc = document.getElementById('challenge-description');
    if (challengeDesc) {
        challengeDesc.textContent = `اختبر سرعتك ودقتك في أسئلة ${data.title}`;
    }

    // Leaderboard Subtitle
    const leaderboardSub = document.getElementById('leaderboard-subtitle');
    if (leaderboardSub) {
        leaderboardSub.textContent = `أفضل النتائج في تحدي ${data.title}`;
    }

    // AI Subtitle
    const aiSubtitle = document.getElementById('ai-subtitle');
    if (aiSubtitle) {
        aiSubtitle.textContent = `اسأل أي سؤال عن ${data.title} واحصل على إجابة فورية`;
    }

    // AI Welcome Message
    const aiWelcome = document.getElementById('ai-welcome');
    if (aiWelcome) {
        aiWelcome.textContent = `مرحباً! أنا مساعدك الذكي في ${data.title}. اسألني أي سؤال!`;
    }
}

/**
 * Load subject data file dynamically
 * @param {string} subjectId - Subject ID
 * @param {object} subjectInfo - Subject info object
 */
function loadSubjectData(subjectId, subjectInfo) {
    // Create script element for the data file
    const script = document.createElement('script');
    script.src = subjectInfo.data;
    script.async = false;
    
    script.onload = function() {
        // After data loads, initialize with subject-core.js
        // The data file should define: SUBJECT_MCQ_QUESTIONS, SUBJECT_ESSAY_QUESTIONS, SUBJECT_SUMMARIES
        if (typeof setSubjectData === 'function') {
            setSubjectData(
                subjectId,
                subjectInfo.title,
                typeof SUBJECT_MCQ_QUESTIONS !== 'undefined' ? SUBJECT_MCQ_QUESTIONS : [],
                typeof SUBJECT_ESSAY_QUESTIONS !== 'undefined' ? SUBJECT_ESSAY_QUESTIONS : [],
                typeof SUBJECT_SUMMARIES !== 'undefined' ? SUBJECT_SUMMARIES : []
            );
        }
        
        // Hide loader
        setTimeout(hideLoader, 100);
    };
    
    script.onerror = function() {
        // Even if data fails to load, initialize with empty data
        if (typeof setSubjectData === 'function') {
            setSubjectData(subjectId, subjectInfo.title, [], [], []);
        }
        hideLoader();
    };

    document.body.appendChild(script);
}

/**
 * Hide the main page loader
 */
function hideLoader() {
    const loader = document.getElementById('main-loader');
    if (loader) {
        loader.classList.add('hidden');
        setTimeout(() => {
            loader.style.display = 'none';
        }, 400);
    }
}
