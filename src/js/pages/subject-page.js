import { loadSingleSubject, loadSubjectPageData } from '../features/subjects-catalog.js';

const PAGE_ID = 'subject';

function getRequestedSubjectId() {
    const params = new URLSearchParams(window.location.search);
    return (params.get('subject') || '').trim();
}

function setSubjectAccent(color) {
    const safeColor = /^#[0-9a-f]{3,6}$/i.test(String(color || '')) ? color : '#6366f1';
    document.documentElement.style.setProperty('--subject-accent', safeColor);
}

function setText(id, value, fallback = '') {
    const element = document.getElementById(id);
    if (!element) {
        return;
    }

    element.textContent = value || fallback;
}

function renderModules(modules) {
    const list = document.getElementById('subjectModulesList');
    if (!list) {
        return;
    }

    list.innerHTML = '';

    if (!modules.length) {
        const item = document.createElement('li');
        item.className = 'subject-list-empty';
        item.textContent = 'سيتم إضافة وحدات تعليمية مفصلة قريباً.';
        list.appendChild(item);
        return;
    }

    modules.forEach((moduleItem) => {
        const item = document.createElement('li');
        item.className = 'subject-list-item';

        const title = document.createElement('h3');
        title.textContent = moduleItem.title;

        const description = document.createElement('p');
        description.textContent = moduleItem.description || 'وصف غير متاح.';

        item.appendChild(title);
        item.appendChild(description);
        list.appendChild(item);
    });
}

function renderResources(resources) {
    const list = document.getElementById('subjectResourcesList');
    if (!list) {
        return;
    }

    list.innerHTML = '';

    if (!resources.length) {
        const item = document.createElement('li');
        item.className = 'subject-list-empty';
        item.textContent = 'لا توجد روابط إضافية حالياً.';
        list.appendChild(item);
        return;
    }

    resources.forEach((resource) => {
        const item = document.createElement('li');
        item.className = 'subject-resource-item';

        const link = document.createElement('a');
        const href = resource.href || '#';
        link.href = href;
        link.textContent = resource.title;

        if (/^https?:\/\//i.test(href)) {
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
        }

        item.appendChild(link);
        list.appendChild(item);
    });
}

function buildFallbackModules(subject) {
    return [
        {
            title: 'الوحدات التعليمية',
            description: 'سيتم إضافة الوحدات قريباً.',
        }
    ];
}

function renderAnnouncement(text) {
    const card = document.getElementById('subjectAnnouncement');
    const textNode = document.getElementById('subjectAnnouncementText');

    if (!card || !textNode) {
        return;
    }

    if (!text) {
        card.style.display = 'none';
        return;
    }

    textNode.textContent = text;
    card.style.display = 'block';
}

function renderNotFound() {
    setText('subjectBadge', 'تعذر تحديد المادة');
    setText('subjectTitle', 'المادة غير موجودة');
    setText('subjectSubtitle', 'تحقق من الرابط ثم أعد المحاولة.');
    setText('subjectDescription', 'يمكنك الرجوع للرئيسية واختيار المادة من القائمة.');

    renderModules([]);
    renderResources([]);
    renderAnnouncement('');
}

async function initSubjectPageEntry() {
    document.documentElement.setAttribute('data-page-entry', PAGE_ID);

    const subjectId = getRequestedSubjectId();
    if (!subjectId) {
        renderNotFound();
        return;
    }

    const subject = await loadSingleSubject(subjectId);

    if (!subject) {
        renderNotFound();
        return;
    }

    const pageData = await loadSubjectPageData(subject.id);

    const finalData = {
        ...subject,
        ...(pageData || {}),
    };

    setSubjectAccent(finalData.accentColor);

    const iconText = String(subject.icon || '📚');
    const titleText = finalData.nameAr || finalData.nameEn;

    setText('subjectBadge', `${iconText} ${titleText}`);
    setText('subjectTitle', titleText);
    setText('subjectSubtitle', finalData.headline || finalData.nameEn || 'Subject Overview');
    setText('subjectDescription', finalData.description || subject.description);

    setText('subjectStatDifficulty', finalData.difficulty || 'متوسط');

    renderModules(finalData.modules && finalData.modules.length ? finalData.modules : buildFallbackModules(finalData));
    renderResources(finalData.resources || []);
    renderAnnouncement(finalData.announcement || '');

    document.title = `${titleText} - ليالي الامتحان`;
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSubjectPageEntry);
} else {
    initSubjectPageEntry();
}

export {
    initSubjectPageEntry,
};
