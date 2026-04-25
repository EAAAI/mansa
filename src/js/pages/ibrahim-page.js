/**
 * Page Entry - ibrahim.html
 * Owns profile page runtime behavior.
 */

const PAGE_ID = 'ibrahim';

function applySavedTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.documentElement.classList.remove('dark');
    }
}

function initIbrahimPageEntry() {
    document.documentElement.setAttribute('data-page-entry', PAGE_ID);
    applySavedTheme();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initIbrahimPageEntry);
} else {
    initIbrahimPageEntry();
}

export { initIbrahimPageEntry };
