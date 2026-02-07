/**
 * Themes Module
 * Handles theme management, switching, and persistence
 */

// Available themes
const THEMES = ['default', 'space', 'ocean', 'sunset', 'pyramids', 'winter'];

// Theme icon mappings
const THEME_ICONS = {
    'default': 'fa-moon',
    'space': 'fa-rocket',
    'ocean': 'fa-water',
    'sunset': 'fa-sun',
    'pyramids': 'fa-mountain',
    'winter': 'fa-snowflake'
};

// ============================================
// THEME FUNCTIONS
// ============================================

/**
 * Toggle space theme on/off
 */
export function toggleSpaceTheme() {
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

/**
 * Toggle theme menu visibility
 */
export function toggleThemeMenu() {
    const menu = document.getElementById('themeMenu');
    if (menu) menu.classList.toggle('active');
}

/**
 * Set a specific theme
 * @param {string} theme - Theme name (default, space, ocean, sunset, pyramids, winter)
 */
export function setTheme(theme) {
    const body = document.body;
    const userProfile = JSON.parse(localStorage.getItem('userProfile')) || {};

    // Remove all theme classes
    body.classList.remove('space-theme', 'ocean-theme', 'sunset-theme', 'pyramids-theme', 'winter-theme');

    // Add new theme class if not default
    if (theme !== 'default') {
        body.classList.add(theme + '-theme');
    }

    // Update active button in theme menu
    document.querySelectorAll('.theme-option').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.theme === theme) {
            btn.classList.add('active');
        }
    });

    // Save to localStorage
    userProfile.theme = theme;
    localStorage.setItem('userProfile', JSON.stringify(userProfile));

    // Close theme menu
    const themeMenu = document.getElementById('themeMenu');
    if (themeMenu) themeMenu.classList.remove('active');

    // Update toggle icon
    const toggle = document.querySelector('.theme-toggle i');
    if (toggle) {
        toggle.className = 'fas ' + (THEME_ICONS[theme] || 'fa-moon');
    }
}

/**
 * Load saved theme from localStorage
 */
export function loadSavedTheme() {
    const userProfile = JSON.parse(localStorage.getItem('userProfile'));
    if (userProfile?.theme && userProfile.theme !== 'default') {
        setTheme(userProfile.theme);
    }
}

/**
 * Cycle through available themes
 */
export function cycleTheme() {
    const userProfile = JSON.parse(localStorage.getItem('userProfile')) || {};
    const currentTheme = userProfile.theme || 'default';

    const currentIndex = THEMES.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % THEMES.length;
    const nextTheme = THEMES[nextIndex];

    setTheme(nextTheme);
}

/**
 * Initialize theme menu click-outside handler
 */
export function initThemeMenuHandler() {
    document.addEventListener('click', (e) => {
        const menu = document.getElementById('themeMenu');
        const toggle = document.querySelector('.nav-icon-link[title="تغيير الثيم"]');
        if (menu && toggle && !menu.contains(e.target) && !toggle.contains(e.target)) {
            menu.classList.remove('active');
        }
    });
}

// Make functions available globally for onclick handlers in HTML
window.toggleThemeMenu = toggleThemeMenu;
window.setTheme = setTheme;
window.toggleSpaceTheme = toggleSpaceTheme;
window.cycleTheme = cycleTheme;
