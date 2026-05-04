/**
 * Page Entry - admin-dashboard.html
 * Owns admin dashboard runtime behavior extracted from inline scripts.
 */

import { db, initAuth, signInWithGoogle, hasAdminClaim, adminSignOut, onAuthStateChanged } from '../config/firebase.js';
import { initAdminRoadmap } from '../features/admin-roadmap.js';
import { initAdminQuestions } from '../features/admin-questions.js';
import { initAdminSummaries } from '../features/admin-summaries.js';

const PAGE_ID = 'admin-dashboard';

let adminDataCache = {
    subjects: [],
};

// Currently active tab key — tracks state for tab bar rendering.
let activeTabKey = 'subjects';

const GOOGLE_BUTTON_HTML = `<svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg> تسجيل الدخول بـ Google`;

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function showLogin() {
    const login = document.getElementById('loginScreen');
    const dashboard = document.getElementById('dashboardScreen');
    if (login) {
        login.style.display = 'flex';
    }
    if (dashboard) {
        dashboard.style.display = 'none';
    }
}

async function isAdminUser(user) {
    if (!user) {
        return false;
    }

    return hasAdminClaim(user);
}

function loadStats() {
    const subjects = adminDataCache.subjects || [];
    const subjectCount = document.getElementById('subjectCount');
    if (subjectCount) subjectCount.textContent = String(subjects.length);
}

async function refreshSubjectsData() {
    adminDataCache.subjects = await loadSubjectsFromFirestore();
}

// ============================================
// SUBJECTS MANAGEMENT
// ============================================

async function loadSubjectsFromFirestore() {
    if (!db) return [];
    try {
        const snapshot = await db.collection('subjects').orderBy('order').get();
        const subjects = [];
        snapshot.forEach((doc) => subjects.push({ id: doc.id, ...doc.data() }));
        return subjects;
    } catch {
        try {
            const snapshot = await db.collection('subjects').get();
            const subjects = [];
            snapshot.forEach((doc) => subjects.push({ id: doc.id, ...doc.data() }));
            return subjects;
        } catch {
            return [];
        }
    }
}

async function handleAddSubject(event) {
    event.preventDefault();
    const btn = document.getElementById('addSubjectBtn');
    const statusEl = document.getElementById('addSubjectStatus');

    const id = document.getElementById('newSubjectId').value.trim().toLowerCase().replace(/\s+/g, '_');
    const nameAr = document.getElementById('newSubjectNameAr').value.trim();
    const nameEn = document.getElementById('newSubjectNameEn').value.trim();
    const icon = document.getElementById('newSubjectIcon').value.trim() || '📚';
    const accentColor = document.getElementById('newSubjectColor').value || '#6366f1';
    const description = document.getElementById('newSubjectDesc').value.trim();
    const difficulty = document.getElementById('newSubjectDifficulty').value;
    const order = parseInt(document.getElementById('newSubjectOrder').value) || (adminDataCache.subjects.length + 1);

    if (!id || !nameAr) {
        statusEl.textContent = '⚠️ المعرف والاسم بالعربي مطلوبان';
        statusEl.style.color = '#ff8f8f';
        return;
    }

    if (!db) {
        statusEl.textContent = '❌ Firebase غير متصل';
        statusEl.style.color = '#ff8f8f';
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...';
    statusEl.textContent = '';

    try {
        await db.collection('subjects').doc(id).set({
            nameAr,
            nameEn,
            icon,
            accentColor,
            description,
            difficulty,
            order,
            isActive: true,
        });

        statusEl.textContent = `✅ تمت إضافة "${nameAr}" بنجاح!`;
        statusEl.style.color = '#8effbf';

        document.getElementById('addSubjectForm').reset();
        document.getElementById('newSubjectColor').value = '#6366f1';
        document.getElementById('colorPreview').style.background = '#6366f1';

        adminDataCache.subjects = await loadSubjectsFromFirestore();
        loadStats();
        renderSubjectsView();
    } catch (error) {
        statusEl.textContent = `❌ خطأ: ${error.message}`;
        statusEl.style.color = '#ff8f8f';
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-plus"></i> إضافة المادة';
    }
}

async function handleDeleteSubject(subjectId, subjectName) {
    if (!confirm(`هل أنت متأكد من حذف "${subjectName}"؟ هذه العملية لا يمكن التراجع عنها.`)) return;

    try {
        await db.collection('subjects').doc(subjectId).delete();
        adminDataCache.subjects = await loadSubjectsFromFirestore();
        loadStats();
        renderSubjectsView();
    } catch (error) {
        alert(`خطأ في الحذف: ${error.message}`);
    }
}

async function handleToggleSubject(subjectId, currentIsActive) {
    try {
        await db.collection('subjects').doc(subjectId).update({ isActive: !currentIsActive });
        adminDataCache.subjects = await loadSubjectsFromFirestore();
        renderSubjectsView();
    } catch (error) {
        alert(`خطأ: ${error.message}`);
    }
}

function renderSubjectsTab() {
    const subjects = adminDataCache.subjects || [];

    const addFormHtml = `
        <div class="subject-add-form">
            <h3><i class="fas fa-plus-circle"></i> إضافة مادة جديدة</h3>
            <form id="addSubjectForm" onsubmit="handleAddSubject(event)">
                <div class="subject-form-grid">
                    <div class="subject-form-field">
                        <label>المعرف (ID) <small>*</small></label>
                        <input id="newSubjectId" type="text" placeholder="physics2" required
                               pattern="[a-z0-9_-]+" title="حروف إنجليزية صغيرة وأرقام فقط">
                    </div>
                    <div class="subject-form-field">
                        <label>الاسم بالعربي <small>*</small></label>
                        <input id="newSubjectNameAr" type="text" placeholder="فيزياء 2" required>
                    </div>
                    <div class="subject-form-field">
                        <label>الاسم بالإنجليزي</label>
                        <input id="newSubjectNameEn" type="text" placeholder="Physics II">
                    </div>
                    <div class="subject-form-field">
                        <label>الأيقونة (Emoji)</label>
                        <input id="newSubjectIcon" type="text" placeholder="⚡" maxlength="4">
                    </div>
                    <div class="subject-form-field">
                        <label>لون المادة</label>
                        <div class="color-picker-row">
                            <input id="newSubjectColor" type="color" value="#6366f1"
                                   oninput="document.getElementById('colorPreview').style.background=this.value">
                            <div id="colorPreview" style="width:36px;height:36px;border-radius:8px;background:#6366f1;border:1px solid rgba(255,255,255,0.2)"></div>
                        </div>
                    </div>
                    <div class="subject-form-field">
                        <label>مستوى الصعوبة</label>
                        <select id="newSubjectDifficulty">
                            <option value="سهل">سهل</option>
                            <option value="متوسط" selected>متوسط</option>
                            <option value="صعب">صعب</option>
                        </select>
                    </div>
                    <div class="subject-form-field">
                        <label>الترتيب</label>
                        <input id="newSubjectOrder" type="number" min="1" placeholder="1">
                    </div>
                </div>
                <div class="subject-form-field" style="margin-top:12px">
                    <label>الوصف</label>
                    <textarea id="newSubjectDesc" placeholder="وصف قصير للمادة..." rows="2"></textarea>
                </div>
                <div style="display:flex;align-items:center;gap:12px;margin-top:14px;flex-wrap:wrap">
                    <button type="submit" id="addSubjectBtn" class="admin-tool-btn"
                            style="background:linear-gradient(135deg,rgba(56,239,125,0.3),rgba(17,153,142,0.4));border-color:rgba(56,239,125,0.4)">
                        <i class="fas fa-plus"></i> إضافة المادة
                    </button>
                    <span id="addSubjectStatus" style="font-size:0.88rem"></span>
                </div>
            </form>
        </div>
    `;

    if (!subjects.length) {
        return addFormHtml + '<div class="admin-empty"><i class="fas fa-book"></i> لا توجد مواد حتى الآن</div>';
    }

    const listHtml = subjects.map((subject) => {
        const isActive = subject.isActive !== false;
        const accentColor = subject.accentColor || '#6366f1';
        return `
            <div class="admin-card" style="border-color:${accentColor}44">
                <div class="admin-card-header">
                    <div style="display:flex;align-items:center;gap:10px">
                        <span style="font-size:1.8rem">${escapeHtml(subject.icon || '📚')}</span>
                        <div>
                            <strong style="color:${accentColor}">${escapeHtml(subject.nameAr || subject.id)}</strong>
                            ${subject.nameEn ? `<span style="color:rgba(255,255,255,0.4);font-size:0.82rem;margin-right:6px">${escapeHtml(subject.nameEn)}</span>` : ''}
                            <br>
                            <code style="font-size:0.78rem;color:rgba(255,255,255,0.4)">${escapeHtml(subject.id)}</code>
                        </div>
                    </div>
                    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
                        <span class="admin-card-type" style="background:${isActive ? 'rgba(56,239,125,0.12)' : 'rgba(255,107,107,0.12)'};color:${isActive ? '#38ef7d' : '#ff6b6b'}">
                            ${isActive ? 'نشط' : 'مخفي'}
                        </span>
                        <span class="admin-card-type">${escapeHtml(subject.difficulty || 'متوسط')}</span>
                        <button class="admin-tool-btn" style="padding:5px 10px;font-size:0.8rem"
                                onclick="handleToggleSubject('${escapeHtml(subject.id)}', ${isActive})">
                            <i class="fas fa-${isActive ? 'eye-slash' : 'eye'}"></i> ${isActive ? 'إخفاء' : 'تفعيل'}
                        </button>
                        <button class="admin-tool-btn"
                                style="padding:5px 10px;font-size:0.8rem;background:rgba(255,107,107,0.2);border-color:rgba(255,107,107,0.4)"
                                onclick="handleDeleteSubject('${escapeHtml(subject.id)}', '${escapeHtml(subject.nameAr || subject.id)}')">
                            <i class="fas fa-trash"></i> حذف
                        </button>
                    </div>
                </div>
                ${subject.description ? `<p class="admin-card-text" style="font-size:0.88rem;opacity:0.7">${escapeHtml(subject.description)}</p>` : ''}
            </div>
        `;
    }).join('');

    return addFormHtml + listHtml;
}


function renderSubjectsView() {
    const content = document.getElementById('adminTabContent');
    if (!content) return;
    content.innerHTML = renderSubjectsTab();
}

// ============================================
// TAB BAR
// ============================================

const TABS = [
    { key: 'subjects', label: '📚 المواد' },
    { key: 'roadmap',  label: '🗺️ خرائط المذاكرة' },
    { key: 'questions', label: '❓ الأسئلة' },
    { key: 'summaries', label: '📋 الملخصات' },
];

/**
 * Renders the tab button bar into #adminTabBar.
 * @param {string} activeKey  The currently active tab key.
 */
function renderTabBar(activeKey) {
    activeTabKey = activeKey;
    const bar = document.getElementById('adminTabBar');
    if (!bar) return;

    bar.innerHTML = TABS.map((tab) => `
        <button
            class="admin-tab-btn${tab.key === activeKey ? ' active' : ''}"
            onclick="switchAdminTab('${tab.key}')"
        >${tab.label}</button>
    `).join('');
}

/**
 * Switches the active tab: updates the tab bar and re-renders the content area.
 * Exposed on window for onclick use in JS-generated HTML.
 * @param {string} tabKey
 */
async function switchAdminTab(tabKey) {
    renderTabBar(tabKey);

    const content = document.getElementById('adminTabContent');
    if (!content) return;

    if (tabKey === 'subjects') {
        renderSubjectsView();
        return;
    }

    if (tabKey === 'roadmap') {
        content.innerHTML = '<p style="color:rgba(255,255,255,0.4);padding:20px;">جاري تحميل خرائط المذاكرة...</p>';
        await initAdminRoadmap(adminDataCache.subjects, db, content);
        return;
    }

    if (tabKey === 'questions') {
        content.innerHTML = '<p style="color:rgba(255,255,255,0.4);padding:20px;">جاري تحميل الأسئلة...</p>';
        await initAdminQuestions(adminDataCache.subjects, db, content);
        return;
    }

    if (tabKey === 'summaries') {
        content.innerHTML = '<p style="color:rgba(255,255,255,0.4);padding:20px;">جاري تحميل الملخصات...</p>';
        await initAdminSummaries(adminDataCache.subjects, db, content);
        return;
    }
}

async function showDashboard(user) {
    const login = document.getElementById('loginScreen');
    const dashboard = document.getElementById('dashboardScreen');
    const userInfo = document.getElementById('adminUserInfo');

    if (login) {
        login.style.display = 'none';
    }
    if (dashboard) {
        dashboard.style.display = 'block';
    }
    if (userInfo) {
        userInfo.textContent = user.email;
    }

    await refreshSubjectsData();
    loadStats();

    // Render tab bar then activate the default subjects tab.
    renderTabBar('subjects');
    renderSubjectsView();
}

async function handleGoogleLogin() {
    const button = document.querySelector('.google-login-btn');
    const errorDiv = document.getElementById('loginError');
    if (!button || !errorDiv) {
        return;
    }

    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التسجيل...';
    errorDiv.style.display = 'none';

    const result = await signInWithGoogle();
    if (!result.success) {
        errorDiv.textContent = result.error;
        errorDiv.style.display = 'block';
        button.disabled = false;
        button.innerHTML = GOOGLE_BUTTON_HTML;
    }
}

async function handleSignOut() {
    await adminSignOut();
    showLogin();
}

function initAuthFlow() {
    initAuth();
    onAuthStateChanged(async (user) => {
        if (await isAdminUser(user)) {
            showDashboard(user);
            return;
        }

        showLogin();
    });
}

function exposeGlobalHandlers() {
    window.handleGoogleLogin = handleGoogleLogin;
    window.handleSignOut = handleSignOut;
    window.handleAddSubject = handleAddSubject;
    window.handleDeleteSubject = handleDeleteSubject;
    window.handleToggleSubject = handleToggleSubject;
    window.switchAdminTab = switchAdminTab;
}

function initAdminDashboardPageEntry() {
    document.documentElement.setAttribute('data-page-entry', PAGE_ID);
    exposeGlobalHandlers();
    initAuthFlow();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdminDashboardPageEntry);
} else {
    initAdminDashboardPageEntry();
}

export {
    initAdminDashboardPageEntry,
    handleGoogleLogin,
    handleSignOut,
    renderSubjectsView,
    switchAdminTab,
};
