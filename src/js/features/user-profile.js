// User Profile Module
// Handles user authentication, profile management, nickname generation, and stats

function generateUserId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function initUserProfile() {
    let userProfile = JSON.parse(localStorage.getItem('userProfile'));
    if (!userProfile) {
        userProfile = {
            id: generateUserId(),
            name: '',
            totalChallenges: 0,
            bestScore: 0,
            totalCorrect: 0,
            visits: 1,
            theme: 'winter',
            createdAt: new Date().toISOString(),
            lastVisit: new Date().toISOString()
        };
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
    } else {
        userProfile.visits = (userProfile.visits || 0) + 1;
        userProfile.lastVisit = new Date().toISOString();
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
    }

    if (userProfile.theme === 'space') {
        document.body.classList.add('space-theme');
    } else if (userProfile.theme && userProfile.theme !== 'default') {
        document.body.classList.add(userProfile.theme + '-theme');
    }

    displayWelcomeGreeting(userProfile);
    return userProfile;
}

function displayWelcomeGreeting(userProfile) {
    const greetingEl = document.getElementById('welcomeGreeting');
    if (!greetingEl) return;

    const displayName = userProfile.nickname || userProfile.name;

    if (displayName) {
        const greetings = [
            `أهلاً يا ${displayName} 👋`,
            `مرحباً ${displayName} ✨`,
            `يا هلا ${displayName} 🌟`,
            `منور يا ${displayName} 💫`
        ];
        const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
        greetingEl.textContent = randomGreeting;
    }
}

function openUserProfile() {
    const userProfile = JSON.parse(localStorage.getItem('userProfile')) || initUserProfile();

    if (userProfile.name && userProfile.nickname) {
        document.getElementById('profileDisplayName').innerHTML = `${userProfile.name} <span style="color: #ffc107; font-size: 0.9rem;">(${userProfile.nickname})</span>`;
    } else {
        document.getElementById('profileDisplayName').textContent = userProfile.name || 'مستخدم جديد';
    }

    document.getElementById('profileUserId').textContent = userProfile.id;
    document.getElementById('profileNameInput').value = userProfile.name || '';
    document.getElementById('statTotalChallenges').textContent = userProfile.totalChallenges || 0;
    document.getElementById('statBestScore').textContent = userProfile.bestScore || 0;
    document.getElementById('statTotalCorrect').textContent = userProfile.totalCorrect || 0;
    document.getElementById('statVisits').textContent = userProfile.visits || 0;

    document.getElementById('userProfileModal').classList.add('active');
}

function closeUserProfile() {
    document.getElementById('userProfileModal').classList.remove('active');
}

async function generateNickname(name) {
    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer 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'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    {
                        role: 'system',
                        content: 'أنت مساعد ودود. مهمتك توليد لقب أو دلع واحد فقط لطيف وودود باللغة العربية للاسم المعطى. الرد يجب أن يكون اللقب فقط بدون أي كلام إضافي. مثال: إذا الاسم "محمد" يمكن أن يكون اللقب "حمودة 🌟" أو "ميدو ⭐"'
                    },
                    {
                        role: 'user',
                        content: `ولد لقب أو دلع لطيف للاسم: ${name}`
                    }
                ],
                max_tokens: 50,
                temperature: 0.9
            })
        });

        const data = await response.json();
        if (data.choices && data.choices[0]) {
            return data.choices[0].message.content.trim();
        }
        return null;
    } catch (error) {
        return null;
    }
}

async function saveUserProfile() {
    const userProfile = JSON.parse(localStorage.getItem('userProfile')) || initUserProfile();
    const newName = document.getElementById('profileNameInput').value.trim();

    if (newName) {
        const saveBtn = document.querySelector('.profile-btn.save-btn');
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> حفظ ومزامنة...';
        saveBtn.disabled = true;

        const nickname = await generateNickname(newName);

        userProfile.name = newName;
        userProfile.nickname = nickname || '';
        localStorage.setItem('userProfile', JSON.stringify(userProfile));

        if (typeof dbLeaderboard !== 'undefined' && dbLeaderboard) {
            try {
                const profileToSync = { ...userProfile };
                delete profileToSync.theme;
                await dbLeaderboard.collection('users').doc(userProfile.id).set(profileToSync, { merge: true });
            } catch (error) {
                console.error('Profile sync error:', error);
                // Continue - local save already succeeded
            }
        }

        if (nickname) {
            document.getElementById('profileDisplayName').innerHTML = `${newName} <span style="color: #ffc107; font-size: 0.9rem;">(${nickname})</span>`;
            alert(`✅ تم حفظ البيانات ومزامنتها!\n\n🏷️ لقبك: ${nickname}\n🆔 المعرف الخاص بك: ${userProfile.id}\n(احتفظ بهذا الكود لاسترجاع حسابك)`);
        } else {
            document.getElementById('profileDisplayName').textContent = newName;
            alert(`✅ تم حفظ البيانات بنجاح!\n🆔 المعرف الخاص بك: ${userProfile.id}`);
        }

        saveBtn.innerHTML = originalText;
        saveBtn.disabled = false;
    } else {
        alert('⚠️ من فضلك أدخل اسمك');
    }
}

async function restoreProfile() {
    const idInput = prompt("أدخل كود المعرف (User ID) الخاص بك لاسترجاع بياناتك:");
    if (!idInput) return;

    const userId = idInput.trim().toUpperCase();

    if (typeof dbLeaderboard !== 'undefined' && dbLeaderboard) {
        try {
            const doc = await dbLeaderboard.collection('users').doc(userId).get();
            if (doc.exists) {
                const data = doc.data();
                const currentLocal = JSON.parse(localStorage.getItem('userProfile')) || {};
                const mergedProfile = { ...data, theme: currentLocal.theme || 'default' };
                localStorage.setItem('userProfile', JSON.stringify(mergedProfile));
                alert(`✅ تم استرجاع البروفايل بنجاح!\nأهلاً بك مجدداً يا ${data.name}`);
                location.reload();
            } else {
                alert("❌ لم يتم العثور على بروفايل بهذا المعرف.");
            }
        } catch (error) {
            alert("حدث خطأ أثناء الاسترجاع. تأكد من الاتصال بالإنترنت.");
        }
    }
}

async function updateUserStats(score) {
    const userProfile = JSON.parse(localStorage.getItem('userProfile')) || initUserProfile();

    userProfile.totalChallenges = (userProfile.totalChallenges || 0) + 1;
    userProfile.totalCorrect = (userProfile.totalCorrect || 0) + score;

    if (score > (userProfile.bestScore || 0)) {
        userProfile.bestScore = score;
    }

    localStorage.setItem('userProfile', JSON.stringify(userProfile));

    if (typeof dbLeaderboard !== 'undefined' && dbLeaderboard) {
        try {
            const statsToSync = {
                totalChallenges: userProfile.totalChallenges,
                totalCorrect: userProfile.totalCorrect,
                bestScore: userProfile.bestScore,
                lastActive: new Date().toISOString()
            };
            await dbLeaderboard.collection('users').doc(userProfile.id).set(statsToSync, { merge: true });
        } catch (error) {
            console.error('Stats sync error:', error);
            // Continue - local save already succeeded
        }
    }
}

function getSavedUserName() {
    const userProfile = JSON.parse(localStorage.getItem('userProfile'));
    return userProfile?.name || '';
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
    initUserProfile();
});
