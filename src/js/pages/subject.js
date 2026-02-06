// Dynamic Subject Loader
// This script handles loading the correct subject content based on URL parameter

const SUBJECT_DATA = {
    'physics2': {
        title: 'فيزياء 2',
        subtitle: 'Modern Physics & Electricity',
        icon: 'fas fa-atom',
        css: 'src/css/subjects/physics2.css',
        data: 'src/data/physics2-data.js'
    },
    'it': {
        title: 'IT',
        subtitle: 'Information Technology',
        icon: 'fas fa-laptop-code',
        css: 'src/css/subjects/it.css',
        data: 'src/data/it-data.js'
    },
    'electronics': {
        title: 'إلكترونيات',
        subtitle: 'Electronics & Circuits',
        icon: 'fas fa-microchip',
        css: 'src/css/subjects/electronics.css',
        data: 'src/data/electronics-data.js'
    },
    'math0': {
        title: 'رياضيات 0',
        subtitle: 'Calculus & Algebra',
        icon: 'fas fa-calculator',
        css: 'src/css/subjects/math0.css',
        data: 'src/data/math0-data.js'
    },
    'math1': {
        title: 'رياضيات 1',
        subtitle: 'Advanced Calculus',
        icon: 'fas fa-square-root-alt',
        css: 'src/css/subjects/math1.css',
        data: 'src/data/math1-data.js'
    },
    'history': {
        title: 'تاريخ الحوسبة',
        subtitle: 'History of Computing',
        icon: 'fas fa-history',
        css: 'src/css/subjects/history.css',
        data: 'src/data/history-data.js'
    },
    'law': {
        title: 'قوانين الحاسب',
        subtitle: 'Computer Law & Ethics',
        icon: 'fas fa-gavel',
        css: 'src/css/subjects/law.css',
        data: 'src/data/law-data.js'
    },
    'english': {
        title: 'اللغة الإنجليزية',
        subtitle: 'English for Computing',
        icon: 'fas fa-language',
        css: 'src/css/subjects/english.css',
        data: 'src/data/english-data.js'
    }
};

// Current subject info (accessible globally)
let currentSubjectId = '';
let currentSubjectData = null;

// Run when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // 1. Extract Subject ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const subjectId = urlParams.get('id');

    // 2. Validate ID
    if (!subjectId || !SUBJECT_DATA[subjectId]) {
        window.location.href = 'index.html';
        return;
    }

    // 3. Store current subject
    currentSubjectId = subjectId;
    currentSubjectData = SUBJECT_DATA[subjectId];

    // 4. Load CSS first
    loadSubjectCSS(currentSubjectData.css);

    // 5. Update static content
    updatePageContent(subjectId, currentSubjectData);

    // 6. Load subject data file (which calls setSubjectData from subject-core.js)
    loadSubjectData(subjectId, currentSubjectData);
});

function loadSubjectCSS(cssPath) {
    const cssLink = document.getElementById('subject-css');
    if (cssLink && cssPath) {
        cssLink.href = cssPath;
    }
}

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

function hideLoader() {
    const loader = document.getElementById('main-loader');
    if (loader) {
        loader.classList.add('hidden');
        setTimeout(() => {
            loader.style.display = 'none';
        }, 400);
    }
}
