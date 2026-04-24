import re

with open('/home/eba/Documents/mansa/admin-dashboard.html', 'r', encoding='utf-8') as f:
    content = f.read()

new_body = """<body>

<!-- ========== LOGIN SCREEN ========== -->
<div id="loginScreen" class="admin-login-screen">
    <div class="admin-login-card">
        <div class="admin-login-icon">
            <i class="fas fa-shield-alt"></i>
        </div>
        <h1>لوحة التحكم</h1>
        <p>ليالي الامتحان — Admin Only</p>
        <div class="admin-login-divider"></div>
        <button class="google-login-btn" onclick="handleGoogleLogin()">
            <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            تسجيل الدخول بـ Google
        </button>
        <p class="admin-login-note">
            <i class="fas fa-lock"></i>
            مخصص للمسؤولين فقط
        </p>
        <div id="loginError" class="login-error" style="display:none"></div>
    </div>
</div>

<!-- ========== DASHBOARD SCREEN ========== -->
<div id="dashboardScreen" style="display:none">

    <!-- Navbar -->
    <nav class="admin-navbar">
        <div class="admin-nav-container">
            <div class="admin-logo">
                <i class="fas fa-shield-alt"></i>
                <span>لوحة التحكم</span>
            </div>
            <div class="admin-user-info" id="adminUserInfo"></div>
            <button class="admin-signout-btn" onclick="handleSignOut()">
                <i class="fas fa-sign-out-alt"></i> خروج
            </button>
        </div>
    </nav>

    <div class="admin-dashboard">

        <!-- Stats Row -->
        <div class="admin-stats-row">
            <div class="admin-stat-card">
                <i class="fas fa-lightbulb"></i>
                <div>
                    <span id="suggestCount">0</span>
                    <p>اقتراح</p>
                </div>
            </div>
            <div class="admin-stat-card">
                <i class="fas fa-flag" style="color:#ff6b6b"></i>
                <div>
                    <span id="reportCount">0</span>
                    <p>بلاغ خطأ</p>
                </div>
            </div>
            <div class="admin-stat-card">
                <i class="fas fa-users" style="color:#38ef7d"></i>
                <div>
                    <span id="joinCount">0</span>
                    <p>طلب انضمام</p>
                </div>
            </div>
        </div>

        <!-- Tabs -->
        <div class="admin-tabs">
            <button class="admin-tab active" onclick="showAdminTab('suggestions')">
                <i class="fas fa-lightbulb"></i> الاقتراحات
            </button>
            <button class="admin-tab" onclick="showAdminTab('reports')">
                <i class="fas fa-flag"></i> البلاغات
            </button>
            <button class="admin-tab" onclick="showAdminTab('joins')">
                <i class="fas fa-users"></i> طلبات الانضمام
            </button>
        </div>

        <!-- Content -->
        <div id="adminTabContent" class="admin-tab-content"></div>

    </div>
</div>

<style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
        min-height: 100vh;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
        font-family: 'Cairo', sans-serif;
        color: white;
    }

    /* LOGIN */
    .admin-login-screen {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
    }
    .admin-login-card {
        background: rgba(255,255,255,0.05);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(0,217,255,0.2);
        border-radius: 30px;
        padding: 50px 40px;
        max-width: 420px;
        width: 100%;
        text-align: center;
        box-shadow: 0 25px 80px rgba(0,0,0,0.4);
    }
    .admin-login-icon {
        width: 90px;
        height: 90px;
        background: linear-gradient(135deg, #00d9ff, #0099cc);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 25px;
        font-size: 2.2rem;
        color: white;
        box-shadow: 0 15px 40px rgba(0,217,255,0.4);
    }
    .admin-login-card h1 {
        font-size: 2rem;
        background: linear-gradient(90deg, #00d9ff, #667eea);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin-bottom: 8px;
    }
    .admin-login-card > p {
        color: rgba(255,255,255,0.5);
        margin-bottom: 30px;
    }
    .admin-login-divider {
        height: 1px;
        background: rgba(255,255,255,0.1);
        margin-bottom: 30px;
    }
    .google-login-btn {
        width: 100%;
        padding: 16px;
        background: white;
        border: none;
        border-radius: 14px;
        color: #333;
        font-family: 'Cairo', sans-serif;
        font-size: 1.05rem;
        font-weight: 700;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        transition: all 0.3s;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
    }
    .google-login-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    }
    .admin-login-note {
        color: rgba(255,255,255,0.3);
        font-size: 0.82rem;
        margin-top: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
    }
    .login-error {
        margin-top: 15px;
        padding: 12px;
        background: rgba(255,107,107,0.15);
        border: 1px solid rgba(255,107,107,0.3);
        border-radius: 10px;
        color: #ff6b6b;
        font-size: 0.9rem;
    }

    /* NAVBAR */
    .admin-navbar {
        background: rgba(0,0,0,0.3);
        backdrop-filter: blur(20px);
        border-bottom: 1px solid rgba(0,217,255,0.15);
        padding: 15px 30px;
        position: sticky;
        top: 0;
        z-index: 100;
    }
    .admin-nav-container {
        display: flex;
        align-items: center;
        gap: 20px;
        max-width: 1100px;
        margin: 0 auto;
    }
    .admin-logo {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 1.1rem;
        font-weight: 700;
        color: #00d9ff;
        flex: 1;
    }
    .admin-user-info {
        color: rgba(255,255,255,0.6);
        font-size: 0.9rem;
    }
    .admin-signout-btn {
        padding: 8px 20px;
        background: rgba(255,107,107,0.15);
        border: 1px solid rgba(255,107,107,0.3);
        border-radius: 10px;
        color: #ff6b6b;
        font-family: 'Cairo', sans-serif;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.3s;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .admin-signout-btn:hover { background: rgba(255,107,107,0.25); }

    /* DASHBOARD */
    .admin-dashboard {
        max-width: 1100px;
        margin: 0 auto;
        padding: 30px 20px;
    }
    .admin-stats-row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 20px;
        margin-bottom: 30px;
    }
    .admin-stat-card {
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(0,217,255,0.15);
        border-radius: 20px;
        padding: 25px;
        display: flex;
        align-items: center;
        gap: 15px;
    }
    .admin-stat-card i {
        font-size: 2rem;
        color: #00d9ff;
    }
    .admin-stat-card span {
        font-size: 2rem;
        font-weight: 700;
        display: block;
    }
    .admin-stat-card p {
        color: rgba(255,255,255,0.5);
        font-size: 0.85rem;
    }
    .admin-tabs {
        display: flex;
        gap: 10px;
        margin-bottom: 20px;
        flex-wrap: wrap;
    }
    .admin-tab {
        padding: 10px 22px;
        border-radius: 12px;
        border: 1px solid rgba(0,217,255,0.2);
        background: rgba(255,255,255,0.04);
        color: rgba(255,255,255,0.6);
        font-family: 'Cairo', sans-serif;
        font-size: 0.95rem;
        cursor: pointer;
        transition: all 0.3s;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .admin-tab.active {
        background: linear-gradient(135deg, #00d9ff, #0099cc);
        color: white;
        border-color: transparent;
    }
    .admin-tab-content { min-height: 300px; }
    .admin-card {
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 16px;
        padding: 20px 25px;
        margin-bottom: 15px;
    }
    .admin-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        flex-wrap: wrap;
        gap: 10px;
    }
    .admin-card-type {
        background: rgba(0,217,255,0.1);
        color: #00d9ff;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 0.8rem;
    }
    .admin-card-date {
        color: rgba(255,255,255,0.35);
        font-size: 0.8rem;
    }
    .admin-card-text {
        color: rgba(255,255,255,0.8);
        line-height: 1.7;
        font-size: 0.95rem;
    }
    .admin-empty {
        text-align: center;
        padding: 60px 20px;
        color: rgba(255,255,255,0.3);
        font-size: 1.1rem;
    }
    .admin-empty i { font-size: 3rem; display: block; margin-bottom: 15px; }
</style>

<script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-auth-compat.js"></script>
<script src="src/js/config/firebase.js"></script>

<script>
    // ============================================
    // AUTH FLOW
    // ============================================
    document.addEventListener('DOMContentLoaded', () => {
        initAuth();
        onAuthStateChanged((user) => {
            if (user && AUTH_CONFIG.allowedAdmins.includes(user.email)) {
                showDashboard(user);
            } else {
                showLogin();
            }
        });
    });

    async function handleGoogleLogin() {
        const btn = document.querySelector('.google-login-btn');
        const errorDiv = document.getElementById('loginError');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التسجيل...';
        errorDiv.style.display = 'none';

        const result = await signInWithGoogle();
        if (!result.success) {
            errorDiv.textContent = result.error;
            errorDiv.style.display = 'block';
            btn.disabled = false;
            btn.innerHTML = \`<svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg> تسجيل الدخول بـ Google\`;
        }
    }

    async function handleSignOut() {
        await adminSignOut();
        showLogin();
    }

    function showLogin() {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('dashboardScreen').style.display = 'none';
    }

    function showDashboard(user) {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('dashboardScreen').style.display = 'block';
        document.getElementById('adminUserInfo').textContent = user.email;
        loadStats();
        showAdminTab('suggestions');
    }

    // ============================================
    // DASHBOARD DATA
    // ============================================
    function loadStats() {
        const suggestions = JSON.parse(localStorage.getItem('suggestions') || '[]');
        const reports = JSON.parse(localStorage.getItem('reports') || '[]');
        const joins = JSON.parse(localStorage.getItem('joinSubmissions') || '[]');
        document.getElementById('suggestCount').textContent = suggestions.length;
        document.getElementById('reportCount').textContent = reports.length;
        document.getElementById('joinCount').textContent = joins.length;
    }

    function showAdminTab(tab) {
        document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
        event.currentTarget.classList.add('active');

        const content = document.getElementById('adminTabContent');
        let data = [];
        let html = '';

        if (tab === 'suggestions') {
            data = JSON.parse(localStorage.getItem('suggestions') || '[]').reverse();
            if (!data.length) {
                html = \`<div class="admin-empty"><i class="fas fa-lightbulb"></i> لا يوجد اقتراحات بعد</div>\`;
            } else {
                data.forEach(item => {
                    html += \`<div class="admin-card">
                        <div class="admin-card-header">
                            <div>
                                <span class="admin-card-type">\${item.type || 'اقتراح'}</span>
                                <span style="color:rgba(255,255,255,0.5); font-size:0.85rem; margin-right:10px">
                                    \${item.name || 'مجهول'}
                                </span>
                            </div>
                            <span class="admin-card-date">\${new Date(item.submittedAt).toLocaleDateString('ar-EG')}</span>
                        </div>
                        <p class="admin-card-text">\${item.text}</p>
                    </div>\`;
                });
            }
        }

        else if (tab === 'reports') {
            data = JSON.parse(localStorage.getItem('reports') || '[]').reverse();
            if (!data.length) {
                html = \`<div class="admin-empty"><i class="fas fa-flag"></i> لا يوجد بلاغات بعد</div>\`;
            } else {
                data.forEach(item => {
                    html += \`<div class="admin-card">
                        <div class="admin-card-header">
                            <span class="admin-card-type" style="background:rgba(255,107,107,0.1);color:#ff6b6b">
                                \${item.subject || 'غير محدد'}
                            </span>
                            <span class="admin-card-date">\${new Date(item.submittedAt).toLocaleDateString('ar-EG')}</span>
                        </div>
                        <p class="admin-card-text"><strong>السؤال:</strong> \${item.question}</p>
                        <p class="admin-card-text" style="margin-top:8px"><strong>الخطأ:</strong> \${item.error}</p>
                    </div>\`;
                });
            }
        }

        else if (tab === 'joins') {
            data = JSON.parse(localStorage.getItem('joinSubmissions') || '[]').reverse();
            if (!data.length) {
                html = \`<div class="admin-empty"><i class="fas fa-users"></i> لا يوجد طلبات بعد</div>\`;
            } else {
                data.forEach(item => {
                    html += \`<div class="admin-card">
                        <div class="admin-card-header">
                            <span class="admin-card-type" style="background:rgba(56,239,125,0.1);color:#38ef7d">
                                \${item.level || 'غير محدد'}
                            </span>
                            <span class="admin-card-date">\${new Date(item.submittedAt).toLocaleDateString('ar-EG')}</span>
                        </div>
                        <p class="admin-card-text"><strong>\${item.name}</strong> — \${item.email} — \${item.phone}</p>
                        <p class="admin-card-text" style="margin-top:8px">\${item.contribution}</p>
                    </div>\`;
                });
            }
        }

        content.innerHTML = html;
    }
</script>

</body>"""

new_content = re.sub(r'<body>.*?</body>', new_body, content, flags=re.DOTALL)

with open('/home/eba/Documents/mansa/admin-dashboard.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Replaced body in admin-dashboard.html")
