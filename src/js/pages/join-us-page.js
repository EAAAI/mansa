/**
 * Page Entry - join-us.html
 * Owns join page runtime behavior extracted from inline scripts.
 */

const PAGE_ID = 'join-us';

function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    const submissions = JSON.parse(localStorage.getItem('joinSubmissions') || '[]');
    submissions.push({
        ...data,
        submittedAt: new Date().toISOString(),
    });
    localStorage.setItem('joinSubmissions', JSON.stringify(submissions));

    const formSection = document.getElementById('formSection');
    const successMessage = document.getElementById('successMessage');
    if (formSection) {
        formSection.style.display = 'none';
    }
    successMessage?.classList.add('show');
}

function markActiveNavLink() {
    const current = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach((anchor) => {
        if (anchor.getAttribute('href') === current) {
            anchor.classList.add('active');
        }
    });
}

function exposeGlobalHandlers() {
    window.handleSubmit = handleSubmit;
}

function initJoinUsPageEntry() {
    document.documentElement.setAttribute('data-page-entry', PAGE_ID);
    exposeGlobalHandlers();
    markActiveNavLink();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initJoinUsPageEntry);
} else {
    initJoinUsPageEntry();
}

export { initJoinUsPageEntry, handleSubmit };
