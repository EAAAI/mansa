/**
 * Page Entry - index.html
 * Owns index page runtime behavior extracted from inline scripts.
 */

import { createSubjectUrl } from '../config/subjects-config.js';
import { loadSubjectsCatalog } from '../features/subjects-catalog.js';

const PAGE_ID = 'index';

async function persistAdminSubmission(recordType, payload) {
    if (typeof dbAnalytics === 'undefined' || !dbAnalytics) {
        return false;
    }

    await dbAnalytics.collection('admin_submissions').add({
        recordType,
        ...payload,
        submittedAt: new Date().toISOString(),
    });

    return true;
}

function renderSubjectsCatalog(subjects) {
    const grid = document.getElementById('subjectsGrid');
    const status = document.getElementById('subjectsStatus');

    if (!grid || !status) {
        return;
    }

    grid.innerHTML = '';

    if (!subjects.length) {
        status.textContent = 'لا توجد مواد متاحة حالياً.';
        return;
    }

    status.textContent = `تم تحميل ${subjects.length} مادة.`;

    subjects.forEach((subject) => {
        const card = document.createElement('a');
        card.className = 'subject-catalog-card';
        card.href = createSubjectUrl(subject.id);
        card.style.setProperty('--subject-accent', subject.accentColor || '#6366f1');

        const head = document.createElement('div');
        head.className = 'subject-catalog-card-head';

        const title = document.createElement('h3');
        title.className = 'subject-catalog-title';
        title.textContent = subject.nameAr;

        const icon = document.createElement('span');
        icon.className = 'subject-catalog-icon';
        icon.textContent = subject.icon || '📚';

        head.appendChild(title);
        head.appendChild(icon);

        const description = document.createElement('p');
        description.className = 'subject-catalog-description';
        description.textContent = subject.description;

        const meta = document.createElement('div');
        meta.className = 'subject-catalog-meta';

        const questions = document.createElement('span');
        questions.textContent = `${subject.questionCount || 0} سؤال`;

        const difficulty = document.createElement('span');
        difficulty.textContent = subject.difficulty || 'متوسط';

        meta.appendChild(questions);
        meta.appendChild(difficulty);

        card.appendChild(head);
        card.appendChild(description);
        card.appendChild(meta);
        grid.appendChild(card);
    });
}

async function initSubjectsCatalog() {
    const status = document.getElementById('subjectsStatus');
    if (!status) {
        return;
    }

    try {
        const subjects = await loadSubjectsCatalog();
        renderSubjectsCatalog(subjects);
    } catch {
        status.textContent = 'تعذر تحميل المواد الآن. سيتم استخدام الإعدادات الافتراضية لاحقاً.';
    }
}

function openSuggestPopup() {
    document.getElementById('suggestPopup')?.classList.add('active');
}

function closeSuggestPopup() {
    document.getElementById('suggestPopup')?.classList.remove('active');
}

function openJoinPopup() {
    document.getElementById('joinPopup')?.classList.add('active');
}

function closeJoinPopup() {
    document.getElementById('joinPopup')?.classList.remove('active');

    const form = document.getElementById('popupJoinForm');
    if (form) {
        form.style.display = 'flex';
        form.reset();
    }

    document.getElementById('popupJoinSuccess')?.classList.remove('show');
}

function switchPopupTab(tab, btn) {
    document.querySelectorAll('.popup-tab').forEach((tabEl) => tabEl.classList.remove('active'));
    if (btn) {
        btn.classList.add('active');
    }

    const suggestTab = document.getElementById('popupSuggestTab');
    const reportTab = document.getElementById('popupReportTab');

    if (suggestTab) {
        suggestTab.style.display = tab === 'suggest' ? 'block' : 'none';
    }
    if (reportTab) {
        reportTab.style.display = tab === 'report' ? 'block' : 'none';
    }
}

async function submitPopupSuggest() {
    const type = document.getElementById('popupSuggestType')?.value;
    const text = document.getElementById('popupSuggestText')?.value.trim();

    if (!type || !text) {
        alert('من فضلك اختر النوع واكتب الاقتراح');
        return;
    }

    const data = {
        formType: 'اقتراح',
        name: document.getElementById('popupSuggestName')?.value.trim() || 'مجهول',
        suggestType: type,
        text,
    };

    let savedToRemote = false;

    try {
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error('API failed');
        }

        try {
            savedToRemote = await persistAdminSubmission('suggestion', {
                type,
                name: data.name,
                text,
            });
        } catch {
            savedToRemote = false;
        }
    } catch (error) {
        savedToRemote = false;
    }

    if (!savedToRemote) {
        const all = JSON.parse(localStorage.getItem('suggestions') || '[]');
        all.push({
            type,
            name: data.name,
            text,
            submittedAt: new Date().toISOString(),
        });
        localStorage.setItem('suggestions', JSON.stringify(all));
    }

    const form = document.getElementById('popupSuggestForm');
    const success = document.getElementById('popupSuggestSuccess');
    if (form) {
        form.style.display = 'none';
    }
    if (success) {
        success.classList.add('show');
    }
}

function resetPopupSuggest() {
    const form = document.getElementById('popupSuggestForm');
    const success = document.getElementById('popupSuggestSuccess');

    if (form) {
        form.style.display = 'flex';
    }
    success?.classList.remove('show');

    const type = document.getElementById('popupSuggestType');
    const text = document.getElementById('popupSuggestText');
    if (type) {
        type.value = '';
    }
    if (text) {
        text.value = '';
    }
}

async function submitPopupReport() {
    const question = document.getElementById('popupReportQuestion')?.value.trim();
    const errorText = document.getElementById('popupReportError')?.value.trim();

    if (!question || !errorText) {
        alert('من فضلك املأ كل الحقول');
        return;
    }

    const data = {
        formType: 'بلاغ',
        question,
        error: errorText,
    };

    let savedToRemote = false;

    try {
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error('API failed');
        }

        try {
            savedToRemote = await persistAdminSubmission('report', {
                subject: 'بلاغ',
                question,
                error: errorText,
            });
        } catch {
            savedToRemote = false;
        }
    } catch (error) {
        savedToRemote = false;
    }

    if (!savedToRemote) {
        const all = JSON.parse(localStorage.getItem('reports') || '[]');
        all.push({
            subject: 'بلاغ',
            question,
            error: errorText,
            submittedAt: new Date().toISOString(),
        });
        localStorage.setItem('reports', JSON.stringify(all));
    }

    const form = document.getElementById('popupReportForm');
    const success = document.getElementById('popupReportSuccess');
    if (form) {
        form.style.display = 'none';
    }
    if (success) {
        success.classList.add('show');
    }
}

function resetPopupReport() {
    const form = document.getElementById('popupReportForm');
    const success = document.getElementById('popupReportSuccess');

    if (form) {
        form.style.display = 'flex';
    }
    success?.classList.remove('show');

    const question = document.getElementById('popupReportQuestion');
    const errorText = document.getElementById('popupReportError');
    if (question) {
        question.value = '';
    }
    if (errorText) {
        errorText.value = '';
    }
}

async function submitPopupJoin(event) {
    event.preventDefault();

    const data = {
        formType: 'انضمام',
        name: document.getElementById('popupJoinName')?.value,
        email: document.getElementById('popupJoinEmail')?.value,
        phone: document.getElementById('popupJoinPhone')?.value,
        level: document.getElementById('popupJoinLevel')?.value,
        contribution: document.getElementById('popupJoinContrib')?.value,
    };

    let savedToRemote = false;

    try {
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error('API failed');
        }

        try {
            savedToRemote = await persistAdminSubmission('join', {
                name: data.name || '',
                email: data.email || '',
                phone: data.phone || '',
                level: data.level || '',
                contribution: data.contribution || '',
            });
        } catch {
            savedToRemote = false;
        }
    } catch (error) {
        savedToRemote = false;
    }

    if (!savedToRemote) {
        const submissions = JSON.parse(localStorage.getItem('joinSubmissions') || '[]');
        submissions.push({
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            level: data.level || '',
            contribution: data.contribution || '',
            submittedAt: new Date().toISOString(),
        });
        localStorage.setItem('joinSubmissions', JSON.stringify(submissions));
    }

    const form = document.getElementById('popupJoinForm');
    const success = document.getElementById('popupJoinSuccess');
    if (form) {
        form.style.display = 'none';
    }
    if (success) {
        success.classList.add('show');
    }
}

function toggleTheme() {
    const html = document.documentElement;
    const button = document.getElementById('navThemeBtn');

    if (html.classList.contains('dark')) {
        html.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        if (button) {
            button.textContent = '🌙';
        }
    } else {
        html.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        if (button) {
            button.textContent = '☀️';
        }
    }
}

function applySavedTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.documentElement.classList.remove('dark');
        const button = document.getElementById('navThemeBtn');
        if (button) {
            button.textContent = '🌙';
        }
    }
}

function initOverlayCloseHandlers() {
    const suggestPopup = document.getElementById('suggestPopup');
    if (suggestPopup) {
        suggestPopup.addEventListener('click', (event) => {
            if (event.target === suggestPopup) {
                closeSuggestPopup();
            }
        });
    }

    const joinPopup = document.getElementById('joinPopup');
    if (joinPopup) {
        joinPopup.addEventListener('click', (event) => {
            if (event.target === joinPopup) {
                closeJoinPopup();
            }
        });
    }
}

function initEscapeShortcut() {
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeSuggestPopup();
            closeJoinPopup();
        }
    });
}

function exposeGlobalHandlers() {
    window.openSuggestPopup = openSuggestPopup;
    window.closeSuggestPopup = closeSuggestPopup;
    window.openJoinPopup = openJoinPopup;
    window.closeJoinPopup = closeJoinPopup;
    window.switchPopupTab = switchPopupTab;
    window.submitPopupSuggest = submitPopupSuggest;
    window.resetPopupSuggest = resetPopupSuggest;
    window.submitPopupReport = submitPopupReport;
    window.resetPopupReport = resetPopupReport;
    window.submitPopupJoin = submitPopupJoin;
    window.toggleTheme = toggleTheme;
}

function initIndexPageEntry() {
    document.documentElement.setAttribute('data-page-entry', PAGE_ID);
    exposeGlobalHandlers();
    initOverlayCloseHandlers();
    initEscapeShortcut();
    applySavedTheme();
    initSubjectsCatalog();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initIndexPageEntry);
} else {
    initIndexPageEntry();
}

export {
    initIndexPageEntry,
    openSuggestPopup,
    closeSuggestPopup,
    openJoinPopup,
    closeJoinPopup,
    switchPopupTab,
    submitPopupSuggest,
    resetPopupSuggest,
    submitPopupReport,
    resetPopupReport,
    submitPopupJoin,
    toggleTheme,
};
