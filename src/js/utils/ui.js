// UI Module - Consolidated from themes.js, ui-utils.js, and script.js
// Handles: theme switching, scroll, mobile menu, notifications, navbar components

// ============================================
// NAVBAR COMPONENT SYSTEM
// ============================================

/**
 * Get main site navbar HTML (for index.html)
 * @returns {string} Navbar HTML
 */
function getMainNavbarHTML() {
    return `
    <div class="nav-container">
        <div class="logo">
            <i class="fas fa-moon"></i>
            <span>ليالي الامتحان</span>
        </div>
        <ul class="nav-links">
            <li><a href="#home" class="nav-link-main" data-section="home">الرئيسية</a></li>
            <li><a href="#subjects" class="nav-link-main" data-section="subjects">📚المواد</a></li>
            <li><a href="#challenge" class="nav-link-main" data-section="challenge">⚡ وضع التحدي</a></li>
            <li><a href="#ask-ai" class="nav-link-main" data-section="ask-ai">🤖 اسأل ذكي</a></li>
            <li><a href="#leaderboard" class="nav-link-main" data-section="leaderboard">🏆 المتصدرين</a></li>

            <li class="nav-icon-item">
                <a href="#" onclick="toggleThemeMenu(); return false;" class="nav-icon-link" title="تغيير الثيم" aria-label="تغيير الثيم">
                    <i class="fas fa-palette"></i>
                </a>
                <div class="theme-menu" id="themeMenu">
                    <div class="theme-menu-title">🎨 اختر الثيم</div>
                    <button class="theme-option active" onclick="setTheme('default')" data-theme="default">
                        <i class="fas fa-moon"></i> الوضع الليلي
                    </button>
                    <button class="theme-option" onclick="setTheme('space')" data-theme="space">
                        <i class="fas fa-rocket"></i> الفضائي 🚀
                    </button>
                    <button class="theme-option" onclick="setTheme('ocean')" data-theme="ocean">
                        <i class="fas fa-water"></i> المحيط 🌊
                    </button>
                    <button class="theme-option" onclick="setTheme('sunset')" data-theme="sunset">
                        <i class="fas fa-sun"></i> الغروب 🌅
                    </button>
                    <button class="theme-option" onclick="setTheme('pyramids')" data-theme="pyramids">
                        <i class="fas fa-mountain"></i> الأهرامات 🏛️
                    </button>
                    <button class="theme-option" onclick="setTheme('winter')" data-theme="winter">
                        <i class="fas fa-snowflake"></i> الشتاء ❄️
                    </button>
                </div>
            </li>
            <li class="nav-icon-item">
                <a href="#" onclick="openUserProfile(); return false;" class="nav-icon-link" title="حسابي" aria-label="حسابي">
                    <i class="fas fa-user"></i>
                </a>
            </li>
        </ul>
    </div>`;
}

/**
 * Inject navbar into page based on page type
 * Automatically detects if it's index.html or subject.html
 */
function injectMainNavbar() {
    const navbarContainer = document.getElementById('navbar-container');
    if (!navbarContainer) return;
    
    // Only inject for index.html (main site)
    if (navbarContainer.classList.contains('main-navbar')) {
        navbarContainer.innerHTML = getMainNavbarHTML();
        initNavbarActiveState();
    }
}

/**
 * Initialize active state for navbar links based on scroll position
 */
function initNavbarActiveState() {
    const navLinks = document.querySelectorAll('.nav-link-main');
    
    // Set initial active state based on hash or default to home
    const currentHash = window.location.hash || '#home';
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === currentHash) {
            link.classList.add('active');
        }
    });
    
    // Update active state on scroll
    window.addEventListener('scroll', () => {
        const sections = document.querySelectorAll('section[id], .section[id]');
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

/**
 * Get subject page navbar HTML (for subject.html and future subject pages)
 * @returns {string} Subject navbar HTML
 */
function getSubjectNavbarHTML() {
    return `
    <div class="nav-container">
        <a href="index.html" class="nav-brand">
            <i class="fas fa-arrow-right"></i>
            <span>العودة للرئيسية</span>
        </a>
        <div class="nav-subject-title" id="nav-subject-title">
            <!-- Icon and Title will be injected by subject.js -->
        </div>
        <button class="mobile-menu-toggle" onclick="toggleMobileMenu()" aria-label="القائمة">
            <i class="fas fa-chevron-down"></i>
        </button>
        <div class="nav-links">
            <a href="#hero" class="nav-link active" data-tooltip="الرئيسية">
                <i class="fas fa-home"></i>
                <span>الرئيسية</span>
            </a>
            <a href="#summaries" class="nav-link" data-tooltip="الملخصات">
                <i class="fas fa-file-alt"></i>
                <span>الملخصات</span>
            </a>
            <a href="#bank" class="nav-link" data-tooltip="الأسئلة الاختيارية">
                <i class="fas fa-book-open"></i>
                <span>الاختياري</span>
            </a>
            <a href="#challenge" class="nav-link" data-tooltip="التحدي الاختياري">
                <i class="fas fa-bolt"></i>
                <span>تحدي الاختياري</span>
            </a>
            <a href="#essay-bank" class="nav-link" data-tooltip="الأسئلة المقالية">
                <i class="fas fa-pen-fancy"></i>
                <span>المقالي</span>
            </a>
            <a href="#essay-challenge" class="nav-link" data-tooltip="تحدي المقالي">
                <i class="fas fa-brain"></i>
                <span>تحدي المقالي</span>
            </a>
            <a href="#leaderboard" class="nav-link" data-tooltip="المتصدرين">
                <i class="fas fa-trophy"></i>
                <span>المتصدرين</span>
            </a>
            <a href="#ask-ai" class="nav-link" data-tooltip="اسأل الذكاء">
                <i class="fas fa-robot"></i>
                <span>اسأل الذكاء</span>
            </a>
        </div>
    </div>`;
}

/**
 * Inject subject navbar into page
 */
function injectSubjectNavbar() {
    const navbarContainer = document.getElementById('subject-navbar-container');
    if (!navbarContainer) return;
    
    navbarContainer.innerHTML = getSubjectNavbarHTML();
    initSubjectNavbarActiveState();
}

/**
 * Initialize active state for subject navbar links based on scroll position
 */
function initSubjectNavbarActiveState() {
    const navLinks = document.querySelectorAll('.subject-navbar .nav-link');
    
    // Update active state on scroll
    window.addEventListener('scroll', () => {
        const sections = document.querySelectorAll('section[id]');
        let current = 'hero';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 150;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// Auto-inject navbars on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    injectMainNavbar();
    injectSubjectNavbar();
});

// ============================================
// THEME MANAGEMENT
// ============================================

function toggleSpaceTheme() {
    const userProfile = JSON.parse(localStorage.getItem('userProfile')) || {};

    if (document.body.classList.contains('space-theme')) {
        document.body.classList.remove('space-theme');
        userProfile.theme = 'default';
    } else {
        document.body.classList.add('space-theme');
        userProfile.theme = 'space';
    }

    localStorage.setItem('userProfile', JSON.stringify(userProfile));
}

function toggleThemeMenu() {
    const menu = document.getElementById('themeMenu');
    if (menu) menu.classList.toggle('active');
}

function setTheme(theme) {
    const body = document.body;
    const userProfile = JSON.parse(localStorage.getItem('userProfile')) || {};

    body.classList.remove('space-theme', 'ocean-theme', 'sunset-theme', 'pyramids-theme', 'winter-theme');

    if (theme !== 'default') {
        body.classList.add(theme + '-theme');
    }

    document.querySelectorAll('.theme-option').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.theme === theme) {
            btn.classList.add('active');
        }
    });

    userProfile.theme = theme;
    localStorage.setItem('userProfile', JSON.stringify(userProfile));

    const themeMenu = document.getElementById('themeMenu');
    if (themeMenu) themeMenu.classList.remove('active');

    const toggle = document.querySelector('.theme-toggle i');
    if (toggle) {
        const icons = {
            'default': 'fa-moon',
            'space': 'fa-rocket',
            'ocean': 'fa-water',
            'sunset': 'fa-sun',
            'pyramids': 'fa-mountain',
            'winter': 'fa-snowflake'
        };
        toggle.className = 'fas ' + (icons[theme] || 'fa-moon');
    }
}

function loadSavedTheme() {
    const userProfile = JSON.parse(localStorage.getItem('userProfile'));
    if (userProfile?.theme && userProfile.theme !== 'default') {
        setTheme(userProfile.theme);
    }
}

function cycleTheme() {
    const themes = ['default', 'space', 'ocean', 'sunset', 'pyramids', 'winter'];
    const userProfile = JSON.parse(localStorage.getItem('userProfile')) || {};
    const currentTheme = userProfile.theme || 'default';

    const currentIndex = themes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex];

    setTheme(nextTheme);
}

// ============================================
// SCROLL & NAVIGATION
// ============================================

let scrollGoingDown = true;

function toggleScrollDirection() {
    if (scrollGoingDown) {
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
        });
    } else {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}

function toggleMobileMenu() {
    const nav = document.querySelector('.nav-links');
    const mobileBtn = document.querySelector('.mobile-menu-toggle');
    if (nav) nav.classList.toggle('active');
    if (mobileBtn) mobileBtn.classList.toggle('active');
}

// ============================================
// NOTIFICATIONS
// ============================================

function showNotification(message) {
    const existing = document.querySelector('.notification-popup');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = 'notification-popup';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        </div>
    `;
    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ============================================
// LEADERBOARD TABS
// ============================================

const SUBJECT_NAMES = {
    'all': 'الإجمالي - مجموع النقاط من جميع المواد',
    'physics2': 'فيزياء 2',
    'english': 'اللغة الإنجليزية',
    'it': 'تكنولوجيا المعلومات',
    'electronics': 'الإلكترونيات',
    'math1': 'رياضيات 1',
    'math0': 'رياضيات 0',
    'history': 'تاريخ الحوسبة',
    'law': 'قوانين الحاسب'
};

async function switchLeaderboardTab(subject) {
    // Update active tab
    document.querySelectorAll('.lb-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.subject === subject) {
            tab.classList.add('active');
        }
    });

    // Update title
    const titleEl = document.getElementById('currentSubjectTitle');
    if (titleEl) {
        const icon = subject === 'all' ? 'fa-star' : 
                     subject === 'physics2' ? 'fa-atom' :
                     subject === 'english' ? 'fa-language' :
                     subject === 'it' ? 'fa-laptop-code' :
                     subject === 'electronics' ? 'fa-microchip' :
                     subject === 'math1' ? 'fa-calculator' :
                     subject === 'math0' ? 'fa-square-root-alt' :
                     subject === 'history' ? 'fa-history' :
                     subject === 'law' ? 'fa-gavel' : 'fa-star';
        titleEl.innerHTML = `<i class="fas ${icon}"></i> ${SUBJECT_NAMES[subject] || subject}`;
    }

    // Load leaderboard data
    const tbody = document.getElementById('mainLeaderboardBody');
    const noRecords = document.getElementById('noRecordsMain');
    
    if (!tbody) return;
    
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:30px;"><i class="fas fa-spinner fa-spin"></i> جاري التحميل...</td></tr>';
    if (noRecords) noRecords.style.display = 'none';

    try {
        if (typeof dbLeaderboard === 'undefined' || !dbLeaderboard) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#ff6b6b;">خطأ في الاتصال بقاعدة البيانات</td></tr>';
            return;
        }

        let entries = [];

        if (subject === 'all') {
            // Aggregate scores from all subjects
            const subjects = ['physics2', 'math0', 'math1', 'english', 'history', 'it', 'law', 'electronics'];
            const userScores = {};

            for (const subj of subjects) {
                try {
                    const snapshot = await dbLeaderboard.collection(subj)
                        .orderBy('score', 'desc')
                        .limit(50)
                        .get();

                    snapshot.forEach(doc => {
                        const data = doc.data();
                        const name = data.name;
                        const score = parseInt(data.score) || 0;

                        if (!userScores[name]) {
                            userScores[name] = { score: 0, time: 0, date: null };
                        }
                        userScores[name].score += score;
                        userScores[name].time += parseInt(data.time) || 0;
                        if (!userScores[name].date && data.timestamp) {
                            userScores[name].date = data.timestamp.toDate ? data.timestamp.toDate() : new Date(data.timestamp);
                        }
                    });
                } catch (err) {
                    // Subject leaderboard fetch error - continue with others
                }
            }

            entries = Object.entries(userScores)
                .map(([name, data]) => ({ name, ...data }))
                .sort((a, b) => b.score - a.score)
                .slice(0, 10);
        } else {
            // Single subject
            const snapshot = await dbLeaderboard.collection(subject)
                .orderBy('score', 'desc')
                .orderBy('time', 'asc')
                .limit(10)
                .get();

            snapshot.forEach(doc => {
                const data = doc.data();
                entries.push({
                    name: data.name,
                    score: data.score,
                    time: data.time,
                    date: data.timestamp ? (data.timestamp.toDate ? data.timestamp.toDate() : new Date(data.timestamp)) : null
                });
            });
        }

        if (entries.length === 0) {
            tbody.innerHTML = '';
            if (noRecords) noRecords.style.display = 'block';
            return;
        }

        tbody.innerHTML = entries.map((entry, i) => {
            const rank = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i + 1);
            const time = formatTime(entry.time);
            const date = entry.date ? entry.date.toLocaleDateString('ar-EG') : '-';
            return `<tr>
                <td>${rank}</td>
                <td>${entry.name}</td>
                <td>${entry.score}</td>
                <td>${time}</td>
                <td>${date}</td>
            </tr>`;
        }).join('');

        if (noRecords) noRecords.style.display = 'none';

    } catch (error) {
        console.error('Error loading leaderboard:', error);
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#ff6b6b;">خطأ في تحميل البيانات</td></tr>';
    }
}

function formatTime(seconds) {
    if (!seconds && seconds !== 0) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Load saved theme
    loadSavedTheme();
    
    // Theme menu click-outside handler
    document.addEventListener('click', (e) => {
        const menu = document.getElementById('themeMenu');
        const toggle = document.querySelector('.theme-toggle');
        if (menu && toggle && !menu.contains(e.target) && !toggle.contains(e.target)) {
            menu.classList.remove('active');
        }
    });
    
    // Scroll rocket direction
    window.addEventListener('scroll', () => {
        const scrollRocket = document.getElementById('scrollRocket');
        if (!scrollRocket) return;

        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;

        if (scrollTop > scrollHeight / 2) {
            scrollRocket.classList.remove('going-down');
            scrollGoingDown = false;
        } else {
            scrollRocket.classList.add('going-down');
            scrollGoingDown = true;
        }
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Active section highlighting
    window.addEventListener('scroll', () => {
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('.nav-links a');

        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.scrollY >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });
    
    // File upload handler
    const uploadForm = document.getElementById('uploadQuestionsForm');
    if (uploadForm) {
        uploadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const fileInput = document.getElementById('questionsFile');
            const status = document.getElementById('uploadStatus');
            if (!fileInput.files.length) {
                status.textContent = 'يرجى اختيار ملف.';
                status.style.color = 'red';
                return;
            }
            const file = fileInput.files[0];
            const reader = new FileReader();
            reader.onload = function(event) {
                try {
                    const questions = JSON.parse(event.target.result);
                    localStorage.setItem('uploadedQuestions', JSON.stringify(questions));
                    status.textContent = 'تم رفع الأسئلة بنجاح!';
                    status.style.color = 'green';
                } catch (err) {
                    status.textContent = 'ملف غير صالح!';
                    status.style.color = 'red';
                }
            };
            reader.readAsText(file);
        });
    }
});

// ============================================
// INJECT NOTIFICATION STYLES
// ============================================

const notificationStyle = document.createElement('style');
notificationStyle.textContent = `
    .notification-popup {
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #38ef7d 0%, #11998e 100%);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(56, 239, 125, 0.3);
        z-index: 10000;
        transform: translateX(120%);
        transition: transform 0.3s ease;
    }
    .notification-popup.show {
        transform: translateX(0);
    }
    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    .notification-content i {
        font-size: 1.2rem;
    }
`;
document.head.appendChild(notificationStyle);
