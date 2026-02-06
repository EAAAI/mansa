// UI Module - Consolidated from themes.js, ui-utils.js, and script.js
// Handles: theme switching, scroll, mobile menu, notifications, and file upload

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
