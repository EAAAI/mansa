# PowerShell script to add theme toggle and profile icons to remaining subject pages

$templateIcons = @"
                <a href="#" onclick="toggleThemeMenu(); return false;" class="nav-link nav-icon-link" title="تغيير الثيم">
                    <i class="fas fa-palette"></i>
                </a>
                <a href="#" onclick="openUserProfile(); return false;" class="nav-link nav-icon-link" title="حسابي">
                    <i class="fas fa-user"></i>
                </a>
"@

$themeMenuHTML = @"

    <!-- Theme Menu -->
    <div class="theme-menu" id="themeMenu">
        <div class="theme-menu-title">🎨 اختر الثيم</div>
        <button class="theme-option active" onclick="setTheme('default')" data-theme="default">
            <i class="fas fa-moon"></i> الوضع الليلي
        </button>
        <button class="theme-option" onclick="setTheme('space')" data-theme="space">
            <i class="fas fa-rocket"></i> الفضائي 🚀
        </button>
        <button class="theme-option" onclick="setTheme('ocean')" data-theme="ocean">
            <i class="fas fa-water"></i> المحيط 🌊
        </button>
        <button class="theme-option" onclick="setTheme('sunset')" data-theme="sunset">
            <i class="fas fa-sun"></i> الغروب 🌅
        </button>
        <button class="theme-option" onclick="setTheme('pyramids')" data-theme="pyramids">
            <i class="fas fa-mountain"></i> الأهرامات 🏛️
        </button>
        <button class="theme-option" onclick="setTheme('winter')" data-theme="winter">
            <i class="fas fa-snowflake"></i> الشتاء ❄️
        </button>
    </div>

    <!-- User Profile Modal -->
    <div class="user-profile-modal" id="userProfileModal">
        <div class="profile-content">
            <div class="profile-header">
                <div class="profile-avatar">
                    <i class="fas fa-user-graduate"></i>
                </div>
                <h2 id="profileDisplayName">مستخدم جديد</h2>
                <div class="profile-id">ID: <span id="profileUserId">-</span></div>
            </div>

            <div class="profile-form">
                <input type="text" id="profileNameInput" placeholder="أدخل اسمك هنا..." maxlength="30">
            </div>

            <div class="profile-stats">
                <div class="stat-item">
                    <div class="stat-value" id="statTotalChallenges">0</div>
                    <div class="stat-label">تحديات</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value" id="statBestScore">0</div>
                    <div class="stat-label">أفضل نتيجة</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value" id="statTotalCorrect">0</div>
                    <div class="stat-label">إجابات صحيحة</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value" id="statVisits">0</div>
                    <div class="stat-label">زيارات</div>
                </div>
            </div>

            <div class="profile-buttons">
                <button class="profile-btn save-btn" onclick="saveUserProfile()">
                    <i class="fas fa-save"></i> حفظ ومزامنة
                </button>
                <button class="profile-btn restore-btn" onclick="restoreProfile()">
                    <i class="fas fa-download"></i> استرجاع
                </button>
                <button class="profile-btn close-btn" onclick="closeUserProfile()">
                    <i class="fas fa-times"></i> إغلاق
                </button>
            </div>
        </div>
    </div>
"@

$files = @("english.html", "history.html", "it.html", "law.html", "math0.html", "electronics.html")
$basePath = "c:\Users\ib200\OneDrive\المستندات\GitHub\mansa\subjects"

foreach ($file in $files) {
    $filePath = Join-Path $basePath $file
    if (Test-Path $filePath) {
        $content = Get-Content $filePath -Raw -Encoding UTF8
        
        # Add icons to navbar (before </div></div></nav>)
        $content = $content -replace '(\s+<a href="#ask-ai"[^>]+>.*?</a>\s+)(</div>\s+</div>\s+</nav>)', "`$1$templateIcons`$2"
        
        # Add theme menu and profile modal after </nav>
        $content = $content -replace '(</nav>)(\s+<section)', "`$1$themeMenuHTML`$2"
        
        Set-Content -Path $filePath -Value $content -Encoding UTF8 -NoNewline
        Write-Host "Updated $file successfully"
    } else {
        Write-Host "File not found: $file"
    }
}

Write-Host "All files updated!"
