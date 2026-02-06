// Theme Module
// Handles theme switching, saving, and loading

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

document.addEventListener('click', (e) => {
    const menu = document.getElementById('themeMenu');
    const toggle = document.querySelector('.theme-toggle');
    if (menu && toggle && !menu.contains(e.target) && !toggle.contains(e.target)) {
        menu.classList.remove('active');
    }
});

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

// Load saved theme on DOM ready
document.addEventListener('DOMContentLoaded', loadSavedTheme);
