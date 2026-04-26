/**
 * Page Entry - admin-dashboard.html
 * Owns admin dashboard runtime behavior extracted from inline scripts.
 */

const PAGE_ID = 'admin-dashboard';
const TAB_ORDER = ['suggestions', 'reports', 'joins'];

let adminDataCache = {
    suggestions: [],
    reports: [],
    joins: [],
};

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

function formatDate(dateValue) {
    const parsed = new Date(dateValue);
    if (Number.isNaN(parsed.getTime())) {
        return 'غير متاح';
    }

    return parsed.toLocaleDateString('ar-EG');
}

function setActiveAdminTab(tab) {
    const tabs = document.querySelectorAll('.admin-tab');
    tabs.forEach((button) => button.classList.remove('active'));

    const tabIndex = TAB_ORDER.indexOf(tab);
    if (tabIndex >= 0 && tabs[tabIndex]) {
        tabs[tabIndex].classList.add('active');
    }
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
    if (!user || typeof hasAdminClaim !== 'function') {
        return false;
    }

    return hasAdminClaim(user);
}

function loadStats() {
    const suggestions = adminDataCache.suggestions || [];
    const reports = adminDataCache.reports || [];
    const joins = adminDataCache.joins || [];

    const suggestCount = document.getElementById('suggestCount');
    const reportCount = document.getElementById('reportCount');
    const joinCount = document.getElementById('joinCount');

    if (suggestCount) {
        suggestCount.textContent = String(suggestions.length);
    }
    if (reportCount) {
        reportCount.textContent = String(reports.length);
    }
    if (joinCount) {
        joinCount.textContent = String(joins.length);
    }
}

function getLocalAdminData() {
    return {
        suggestions: JSON.parse(localStorage.getItem('suggestions') || '[]'),
        reports: JSON.parse(localStorage.getItem('reports') || '[]'),
        joins: JSON.parse(localStorage.getItem('joinSubmissions') || '[]'),
    };
}

function normalizeRemoteItem(item = {}) {
    return {
        type: item.type || '',
        name: item.name || '',
        text: item.text || '',
        subject: item.subject || '',
        question: item.question || '',
        error: item.error || '',
        level: item.level || '',
        email: item.email || '',
        phone: item.phone || '',
        contribution: item.contribution || '',
        submittedAt: item.submittedAt || new Date().toISOString(),
    };
}

async function loadAdminDataFromFirestore() {
    if (typeof dbAnalytics === 'undefined' || !dbAnalytics) {
        return null;
    }

    const snapshot = await dbAnalytics
        .collection('admin_submissions')
        .orderBy('submittedAt', 'desc')
        .limit(500)
        .get();

    if (!snapshot || snapshot.empty) {
        return {
            suggestions: [],
            reports: [],
            joins: [],
        };
    }

    const data = {
        suggestions: [],
        reports: [],
        joins: [],
    };

    snapshot.forEach((doc) => {
        const record = doc.data() || {};
        const normalized = normalizeRemoteItem(record);

        if (record.recordType === 'suggestion') {
            data.suggestions.push(normalized);
            return;
        }

        if (record.recordType === 'report') {
            data.reports.push(normalized);
            return;
        }

        if (record.recordType === 'join') {
            data.joins.push(normalized);
        }
    });

    return data;
}

async function refreshAdminDataCache() {
    try {
        const remoteData = await loadAdminDataFromFirestore();
        if (remoteData) {
            adminDataCache = remoteData;
            return;
        }
    } catch {
        // Firestore unavailable or query failed, local fallback remains active.
    }

    adminDataCache = getLocalAdminData();
}

function renderSuggestionsTab() {
    const data = [...(adminDataCache.suggestions || [])].reverse();
    if (!data.length) {
        return '<div class="admin-empty"><i class="fas fa-lightbulb"></i> لا يوجد اقتراحات بعد</div>';
    }

    let html = '';
    data.forEach((item) => {
        html += `<div class="admin-card">
                        <div class="admin-card-header">
                            <div>
                                <span class="admin-card-type">${escapeHtml(item.type || 'اقتراح')}</span>
                                <span style="color:rgba(255,255,255,0.5); font-size:0.85rem; margin-right:10px">
                                    ${escapeHtml(item.name || 'مجهول')}
                                </span>
                            </div>
                            <span class="admin-card-date">${formatDate(item.submittedAt)}</span>
                        </div>
                        <p class="admin-card-text">${escapeHtml(item.text)}</p>
                    </div>`;
    });

    return html;
}

function renderReportsTab() {
    const data = [...(adminDataCache.reports || [])].reverse();
    if (!data.length) {
        return '<div class="admin-empty"><i class="fas fa-flag"></i> لا يوجد بلاغات بعد</div>';
    }

    let html = '';
    data.forEach((item) => {
        html += `<div class="admin-card">
                        <div class="admin-card-header">
                            <span class="admin-card-type" style="background:rgba(255,107,107,0.1);color:#ff6b6b">
                                ${escapeHtml(item.subject || 'غير محدد')}
                            </span>
                            <span class="admin-card-date">${formatDate(item.submittedAt)}</span>
                        </div>
                        <p class="admin-card-text"><strong>السؤال:</strong> ${escapeHtml(item.question)}</p>
                        <p class="admin-card-text" style="margin-top:8px"><strong>الخطأ:</strong> ${escapeHtml(item.error)}</p>
                    </div>`;
    });

    return html;
}

function renderJoinsTab() {
    const data = [...(adminDataCache.joins || [])].reverse();
    if (!data.length) {
        return '<div class="admin-empty"><i class="fas fa-users"></i> لا يوجد طلبات بعد</div>';
    }

    let html = '';
    data.forEach((item) => {
        html += `<div class="admin-card">
                        <div class="admin-card-header">
                            <span class="admin-card-type" style="background:rgba(56,239,125,0.1);color:#38ef7d">
                                ${escapeHtml(item.level || 'غير محدد')}
                            </span>
                            <span class="admin-card-date">${formatDate(item.submittedAt)}</span>
                        </div>
                        <p class="admin-card-text"><strong>${escapeHtml(item.name)}</strong> — ${escapeHtml(item.email)} — ${escapeHtml(item.phone)}</p>
                        <p class="admin-card-text" style="margin-top:8px">${escapeHtml(item.contribution)}</p>
                    </div>`;
    });

    return html;
}

function showAdminTab(tab) {
    setActiveAdminTab(tab);

    const content = document.getElementById('adminTabContent');
    if (!content) {
        return;
    }

    if (tab === 'suggestions') {
        content.innerHTML = renderSuggestionsTab();
        return;
    }

    if (tab === 'reports') {
        content.innerHTML = renderReportsTab();
        return;
    }

    if (tab === 'joins') {
        content.innerHTML = renderJoinsTab();
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

    await refreshAdminDataCache();
    loadStats();
    showAdminTab('suggestions');
}

function setSeedStatus(message, level = 'info') {
    const status = document.getElementById('seedSubjectsStatus');
    if (!status) {
        return;
    }

    status.textContent = message;

    if (level === 'error') {
        status.style.color = '#ff8f8f';
        return;
    }

    if (level === 'success') {
        status.style.color = '#8effbf';
        return;
    }

    status.style.color = 'rgba(255,255,255,0.75)';
}

function setSeedButtonLoading(isLoading) {
    const button = document.getElementById('seedSubjectsBtn');
    if (!button) {
        return;
    }

    button.disabled = isLoading;
    button.innerHTML = isLoading
        ? '<i class="fas fa-spinner fa-spin"></i> Seeding...'
        : '<i class="fas fa-upload"></i> Seed Subjects Data';
}

async function fetchSeedJson(path) {
    const response = await fetch(path, { cache: 'no-store' });
    if (!response.ok) {
        throw new Error(`Failed to load ${path}`);
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
        throw new Error(`Invalid JSON structure in ${path}`);
    }

    return data;
}

async function upsertCollectionRows(collectionName, rows) {
    if (typeof db === 'undefined' || !db) {
        throw new Error('Firestore is not initialized.');
    }

    for (const row of rows) {
        if (!row || typeof row !== 'object') {
            continue;
        }

        const { id, ...docData } = row;
        if (!id) {
            continue;
        }

        await db.collection(collectionName).doc(id).set(docData, { merge: true });
    }
}

async function handleSeedSubjectData() {
    try {
        setSeedButtonLoading(true);
        setSeedStatus('Loading local seed files...');

        const [catalogRows, pageRows] = await Promise.all([
            fetchSeedJson('src/data/firebase-seed/subjects.catalog.json'),
            fetchSeedJson('src/data/firebase-seed/subject-pages.json'),
        ]);

        setSeedStatus('Writing documents to Firebase...');

        await upsertCollectionRows('subjects', catalogRows);
        await upsertCollectionRows('subject_pages', pageRows);

        setSeedStatus(
            `Seed complete: ${catalogRows.length} subjects and ${pageRows.length} subject pages.`,
            'success',
        );
    } catch (error) {
        setSeedStatus(`Seed failed: ${error.message}`, 'error');
    } finally {
        setSeedButtonLoading(false);
    }
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
    window.showAdminTab = showAdminTab;
    window.handleSeedSubjectData = handleSeedSubjectData;
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
    showAdminTab,
};
