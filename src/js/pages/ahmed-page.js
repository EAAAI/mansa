/**
 * Page Entry - ahmed.html
 * Owns profile page runtime behavior.
 */

const PAGE_ID = 'ahmed';

function applySavedTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.documentElement.classList.remove('dark');
    }
}

function initAhmedPageEntry() {
    document.documentElement.setAttribute('data-page-entry', PAGE_ID);
    applySavedTheme();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAhmedPageEntry);
} else {
    initAhmedPageEntry();
}

export { initAhmedPageEntry };
