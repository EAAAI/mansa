import { loadSingleSubject, loadSubjectPageData } from '../features/subjects-catalog.js';
import { initRoadmapViewer } from '../features/roadmap-viewer.js';
import { initQuestionsViewer } from '../features/questions-viewer.js';
import { initSummariesViewer } from '../features/summaries-viewer.js';
import { db } from '../config/firebase.js';

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

    renderAnnouncement(finalData.announcement || '');

    document.title = `${titleText} - ليالي الامتحان`;

    // Feature Viewers (Tabs)
    const [hasRoadmap, hasQuestions, hasSummaries] = await Promise.all([
        initRoadmapViewer(subjectId, db),
        initQuestionsViewer(subjectId, db),
        initSummariesViewer(subjectId, db)
    ]);

    const tabsNav = document.getElementById('subjectTabsNav');
    if (tabsNav) {
        const tabs = {
            roadmap: { hasContent: hasRoadmap, btnId: 'tab-roadmap', sectionId: 'roadmapSection' },
            questions: { hasContent: hasQuestions, btnId: 'tab-questions', sectionId: 'questionsSection' },
            summaries: { hasContent: hasSummaries, btnId: 'tab-summaries', sectionId: 'summariesSection' }
        };

        let activeTabSet = false;

        Object.values(tabs).forEach(tab => {
            const btn = document.getElementById(tab.btnId);
            const section = document.getElementById(tab.sectionId);
            
            if (section) section.classList.add('subject-tab-content');

            if (tab.hasContent && btn) {
                tabsNav.style.display = 'flex';
                btn.style.display = '';
                
                btn.addEventListener('click', () => {
                    Object.values(tabs).forEach(t => {
                        document.getElementById(t.btnId)?.classList.remove('active');
                        document.getElementById(t.sectionId)?.classList.remove('active');
                    });
                    btn.classList.add('active');
                    if (section) section.classList.add('active');
                });

                if (!activeTabSet) {
                    btn.classList.add('active');
                    if (section) section.classList.add('active');
                    activeTabSet = true;
                }
            }
        });
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSubjectPageEntry);
} else {
    initSubjectPageEntry();
}

export {
    initSubjectPageEntry,
};
