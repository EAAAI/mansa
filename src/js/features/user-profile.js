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

function renderProfileDisplayName(name, nickname) {
    const profileDisplayName = document.getElementById('profileDisplayName');
    if (!profileDisplayName) {
        return;
    }

    profileDisplayName.textContent = '';

    if (!name) {
        profileDisplayName.textContent = 'مستخدم جديد';
        return;
    }

    profileDisplayName.appendChild(document.createTextNode(name));

    if (nickname) {
        const nicknameSpan = document.createElement('span');
        nicknameSpan.style.color = '#ffc107';
        nicknameSpan.style.fontSize = '0.9rem';
        nicknameSpan.textContent = ` (${nickname})`;
        profileDisplayName.appendChild(nicknameSpan);
    }
}

function openUserProfile() {
    const userProfile = JSON.parse(localStorage.getItem('userProfile')) || initUserProfile();

    renderProfileDisplayName(userProfile.name, userProfile.nickname);

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

async function saveUserProfile() {
    const userProfile = JSON.parse(localStorage.getItem('userProfile')) || initUserProfile();
    const newName = document.getElementById('profileNameInput').value.trim();

    if (newName) {
        userProfile.name = newName;
        userProfile.nickname = '';
        localStorage.setItem('userProfile', JSON.stringify(userProfile));

        renderProfileDisplayName(newName, '');

        if (typeof dbLeaderboard !== 'undefined' && dbLeaderboard) {
            try {
                const profileToSync = { ...userProfile };
                delete profileToSync.theme;
                await dbLeaderboard.collection('users').doc(userProfile.id).set(profileToSync, { merge: true });
            } catch (error) {
                console.error('Profile sync error:', error);
            }
        }

        alert(`✅ تم حفظ البيانات بنجاح!\n🆔 المعرف الخاص بك: ${userProfile.id}`);
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
