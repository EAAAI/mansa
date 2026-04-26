/**
 * Navbar Module
 * Handles dynamic navbar injection for main site and subject pages
 */

// ============================================
// MAIN NAVBAR (index.html)
// ============================================

/**
 * Get main site navbar HTML (for index.html)
 * @returns {string} Navbar HTML
 */
export function getMainNavbarHTML() {
    return `
    <div class="nav-container">
        <div class="logo">
            <i class="fas fa-moon"></i>
            <span>ليالي الامتحان</span>
        </div>
        <ul class="nav-links">
            <li><a href="#home" class="nav-link-main" data-section="home">الرئيسية</a></li>
            <li><a href="cv/index.html" class="nav-link-main">صانع الـ CV <span class="badge-new">جديد</span></a></li>
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
 * Inject main navbar into page
 */
export function injectMainNavbar() {
    const navbarContainer = document.getElementById('navbar-container');
    if (!navbarContainer) return;
    
    if (navbarContainer.classList.contains('main-navbar')) {
        navbarContainer.innerHTML = getMainNavbarHTML();
        initMainNavbarActiveState();
    }
}

/**
 * Initialize active state for main navbar links based on scroll position
 */
function initMainNavbarActiveState() {
    const navLinks = document.querySelectorAll('.nav-link-main');
    
    const currentHash = window.location.hash || '#home';
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === currentHash) {
            link.classList.add('active');
        }
    });
    
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

// ============================================
// SUBJECT NAVBAR (subject.html)
// ============================================

/**
 * Get subject page navbar HTML
 * @returns {string} Subject navbar HTML
 */
export function getSubjectNavbarHTML() {
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
            <a href="#leaderboard" class="nav-link" data-tooltip="المتصدرين">
                <i class="fas fa-trophy"></i>
                <span>المتصدرين</span>
            </a>
        </div>
    </div>`;
}

/**
 * Inject subject navbar into page
 */
export function injectSubjectNavbar() {
    const navbarContainer = document.getElementById('subject-navbar-container');
    if (!navbarContainer) return;
    
    navbarContainer.innerHTML = getSubjectNavbarHTML();
    initSubjectNavbarActiveState();
}

/**
 * Initialize active state for subject navbar links
 */
function initSubjectNavbarActiveState() {
    const navLinks = document.querySelectorAll('.subject-navbar .nav-link');
    
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

// ============================================
// MOBILE MENU
// ============================================

/**
 * Toggle mobile menu visibility
 */
export function toggleMobileMenu() {
    const nav = document.querySelector('.nav-links');
    const mobileBtn = document.querySelector('.mobile-menu-toggle');
    if (nav) nav.classList.toggle('active');
    if (mobileBtn) mobileBtn.classList.toggle('active');
}

// Make toggleMobileMenu available globally for onclick handlers
window.toggleMobileMenu = toggleMobileMenu;
