// Dynamic Subject Loader
// This script handles loading the correct subject content based on URL parameter

const SUBJECT_DATA = {
    'physics2': {
        title: 'فيزياء 2',
        subtitle: 'Modern Physics & Electricity',
        icon: 'fas fa-atom',
        css: 'css/subjects/physics2.css',
        js: 'subjects/physics2.js'
    },
    'it': {
        title: 'IT',
        subtitle: 'Information Technology',
        icon: 'fas fa-laptop-code',
        css: 'css/subjects/it.css',
        js: 'subjects/it.js'
    },
    'electronics': {
        title: 'إلكترونيات',
        subtitle: 'Electronics & Circuits',
        icon: 'fas fa-microchip',
        css: 'css/subjects/electronics.css',
        js: 'subjects/electronics.js'
    },
    'math0': {
        title: 'رياضيات 0',
        subtitle: 'Calculus & Algebra',
        icon: 'fas fa-calculator',
        css: 'css/subjects/math0.css',
        js: 'subjects/math0.js'
    },
    'math1': {
        title: 'رياضيات 1',
        subtitle: 'Advanced Calculus',
        icon: 'fas fa-square-root-alt',
        css: 'css/subjects/math1.css',
        js: 'subjects/math1.js'
    },
    'history': {
        title: 'تاريخ الحوسبة',
        subtitle: 'History of Computing',
        icon: 'fas fa-history',
        css: 'css/subjects/history.css',
        js: 'subjects/history.js'
    },
    'law': {
        title: 'قوانين الحاسب',
        subtitle: 'Computer Law & Ethics',
        icon: 'fas fa-gavel',
        css: 'css/subjects/law.css',
        js: 'subjects/law.js'
    },
    'english': {
        title: 'اللغة الإنجليزية',
        subtitle: 'English for Computing',
        icon: 'fas fa-language',
        css: 'css/subjects/english.css',
        js: 'subjects/english.js'
    }
};

// Run when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // 1. Extract Subject ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const subjectId = urlParams.get('id');

    // 2. Validate ID
    if (!subjectId || !SUBJECT_DATA[subjectId]) {
        console.error('Invalid or missing subject ID, redirecting...');
        window.location.href = 'index.html';
        return;
    }

    // 3. Get subject data
    const data = SUBJECT_DATA[subjectId];

    // 4. Load CSS first
    loadSubjectCSS(data.css);

    // 5. Update static content
    updatePageContent(subjectId, data);

    // 6. Load subject JS (which contains questions, summaries, etc.)
    loadSubjectJS(data.js);
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

function loadSubjectJS(jsPath) {
    if (!jsPath) {
        hideLoader();
        return;
    }

    // Create script element
    const script = document.createElement('script');
    script.src = jsPath;
    script.async = false; // Ensure it runs in order
    
    script.onload = function() {

        // Hide loader after JS loaded and executed
        setTimeout(hideLoader, 100);
    };
    
    script.onerror = function() {

        hideLoader();
    };

    // Append to body (after essay-challenge.js)
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
