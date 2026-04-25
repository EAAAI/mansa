/**
 * Page Entry - suggest.html
 * Owns suggest page runtime behavior extracted from inline scripts.
 */

const PAGE_ID = 'suggest';

function setTabState(tab) {
    const isSuggest = tab === 'suggest';

    document.querySelectorAll('.suggest-tab').forEach((button, index) => {
        const shouldBeActive = isSuggest ? index === 0 : index === 1;
        button.classList.toggle('active', shouldBeActive);
    });

    const suggestTab = document.getElementById('suggestTab');
    const reportTab = document.getElementById('reportTab');

    if (suggestTab) {
        suggestTab.style.display = isSuggest ? 'block' : 'none';
    }

    if (reportTab) {
        reportTab.style.display = isSuggest ? 'none' : 'block';
    }
}

function switchTabDirect(tab) {
    setTabState(tab);
}

function switchTab(tab) {
    setTabState(tab);
}

function submitSuggest() {
    const type = document.getElementById('suggestType')?.value;
    const text = document.getElementById('suggestText')?.value.trim();

    if (!type || !text) {
        alert('من فضلك اختر النوع واكتب الاقتراح');
        return;
    }

    const data = {
        name: document.getElementById('suggestName')?.value.trim() || 'مجهول',
        type,
        text,
        submittedAt: new Date().toISOString(),
    };

    const all = JSON.parse(localStorage.getItem('suggestions') || '[]');
    all.push(data);
    localStorage.setItem('suggestions', JSON.stringify(all));

    const formSection = document.getElementById('suggestFormSection');
    const success = document.getElementById('suggestSuccess');
    if (formSection) {
        formSection.style.display = 'none';
    }
    success?.classList.add('show');
}

function submitReport() {
    const subject = document.getElementById('reportSubject')?.value;
    const question = document.getElementById('reportQuestion')?.value.trim();
    const errorText = document.getElementById('reportError')?.value.trim();

    if (!subject || !question || !errorText) {
        alert('من فضلك املأ كل الحقول');
        return;
    }

    const data = {
        subject,
        question,
        error: errorText,
        submittedAt: new Date().toISOString(),
    };

    const all = JSON.parse(localStorage.getItem('reports') || '[]');
    all.push(data);
    localStorage.setItem('reports', JSON.stringify(all));

    const formSection = document.getElementById('reportFormSection');
    const success = document.getElementById('reportSuccess');
    if (formSection) {
        formSection.style.display = 'none';
    }
    success?.classList.add('show');
}

function resetForm(type) {
    if (type === 'suggest') {
        const formSection = document.getElementById('suggestFormSection');
        const success = document.getElementById('suggestSuccess');
        if (formSection) {
            formSection.style.display = 'flex';
        }
        success?.classList.remove('show');

        const suggestType = document.getElementById('suggestType');
        const suggestText = document.getElementById('suggestText');
        if (suggestType) {
            suggestType.value = '';
        }
        if (suggestText) {
            suggestText.value = '';
        }
        return;
    }

    const formSection = document.getElementById('reportFormSection');
    const success = document.getElementById('reportSuccess');
    if (formSection) {
        formSection.style.display = 'flex';
    }
    success?.classList.remove('show');

    const reportSubject = document.getElementById('reportSubject');
    const reportQuestion = document.getElementById('reportQuestion');
    const reportError = document.getElementById('reportError');
    if (reportSubject) {
        reportSubject.value = '';
    }
    if (reportQuestion) {
        reportQuestion.value = '';
    }
    if (reportError) {
        reportError.value = '';
    }
}

function applyQueryParams() {
    const params = new URLSearchParams(window.location.search);

    const tab = params.get('tab');
    if (tab === 'report') {
        switchTabDirect('report');
    }

    const subject = params.get('subject');
    if (subject) {
        const select = document.getElementById('reportSubject');
        if (select) {
            select.value = subject;
        }
    }

    const question = params.get('question');
    if (question) {
        const textarea = document.getElementById('reportQuestion');
        if (textarea) {
            textarea.value = decodeURIComponent(question);
        }
    }
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
    window.switchTab = switchTab;
    window.submitSuggest = submitSuggest;
    window.submitReport = submitReport;
    window.resetForm = resetForm;
}

function initSuggestPageEntry() {
    document.documentElement.setAttribute('data-page-entry', PAGE_ID);
    exposeGlobalHandlers();
    applyQueryParams();
    markActiveNavLink();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSuggestPageEntry);
} else {
    initSuggestPageEntry();
}

export {
    initSuggestPageEntry,
    switchTab,
    submitSuggest,
    submitReport,
    resetForm,
};
