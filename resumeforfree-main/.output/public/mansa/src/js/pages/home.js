/**
 * Home Page Module
 * Handles index.html specific functionality
 */

// ============================================
// NOTIFICATIONS
// ============================================

/**
 * Load notification bar content from Firebase or localStorage
 */
export async function loadNotificationFromFirebase() {
    const bar = document.getElementById('notificationsBar');
    const textSpan = document.getElementById('notificationsText');

    if (!bar || !textSpan) return;

    try {
        // Try Firebase first
        if (typeof db !== 'undefined' && db) {
            const doc = await db.collection('settings').doc('notification').get();
            if (doc.exists && doc.data().text && doc.data().text.trim() !== '') {
                textSpan.textContent = doc.data().text;
                bar.style.display = 'block';
                return;
            }
        }

        // Fallback to localStorage
        const localNotification = localStorage.getItem('siteNotification');
        if (localNotification && localNotification.trim() !== '') {
            textSpan.textContent = localNotification;
            bar.style.display = 'block';
        } else {
            bar.style.display = 'none';
        }

    } catch (error) {
        console.log('خطأ في جلب التنبيه:', error);
        bar.style.display = 'none';
    }
}

// ============================================
// TOP SCORER ALERT
// ============================================

/**
 * Show top scorer alert banner
 * @param {string} name - Top scorer name
 * @param {number} score - Total score
 */
export function showTopScorerAlert(name, score) {
    const alertDiv = document.getElementById('topScorerAlert');
    const textSpan = document.getElementById('topScorerText');
    
    if (alertDiv && textSpan && name && score) {
        textSpan.innerHTML = `🏆 <b>${name}</b> هو الأعلى في الإجمالي برصيد <b>${score}</b> نقطة!`;
        alertDiv.style.display = 'block';
    }
}

/**
 * Load highest total score across all subjects
 */
export async function loadHighestTotalScore() {
    try {
        if (typeof dbLeaderboard === 'undefined' || !dbLeaderboard) {
            return;
        }

        const subjects = ['physics2', 'math0', 'math1', 'english', 'history', 'it', 'law', 'electronics'];
        const userScores = {};

        // Fetch top scores from each subject
        for (const subject of subjects) {
            try {
                const snapshot = await dbLeaderboard.collection(subject)
                    .orderBy('score', 'desc')
                    .orderBy('time', 'asc')
                    .limit(50)
                    .get();

                snapshot.forEach(doc => {
                    const data = doc.data();
                    const name = data.name;
                    const score = parseInt(data.score) || 0;

                    if (!userScores[name]) {
                        userScores[name] = 0;
                    }
                    userScores[name] += score;
                });
            } catch (err) {
                // Continue with other subjects
            }
        }

        // Find the user with highest total score
        let topScorer = null;
        let highestScore = 0;

        for (const [name, totalScore] of Object.entries(userScores)) {
            if (totalScore > highestScore) {
                highestScore = totalScore;
                topScorer = name;
            }
        }

        // Display the highest scorer
        if (topScorer && highestScore > 0) {
            showTopScorerAlert(topScorer, highestScore);
        }
    } catch (error) {
        console.log('Error loading highest total score:', error);
    }
}

// ============================================
// CHALLENGE MISTAKES
// ============================================

/**
 * Display challenge mistakes in the container
 * @param {Array} mistakes - Array of mistake objects
 */
export function showChallengeMistakes(mistakes) {
    const container = document.getElementById('challengeMistakesContainer');
    const list = document.getElementById('challengeMistakesList');
    
    if (!container || !list) return;
    
    if (mistakes && mistakes.length > 0) {
        list.innerHTML = '';
        mistakes.forEach((item, idx) => {
            const li = document.createElement('li');
            li.innerHTML = `<b>السؤال:</b> ${item.question}<br><span style="color:#ff6b6b"><b>إجابتك:</b> ${item.userAnswer || 'بدون إجابة'}</span><br><span style="color:#38ef7d"><b>الإجابة الصحيحة:</b> ${item.correctAnswer}</span>`;
            li.style.marginBottom = '12px';
            list.appendChild(li);
        });
        container.style.display = 'block';
    } else {
        container.style.display = 'none';
    }
}

// ============================================
// VIDEO MODAL
// ============================================

/**
 * Initialize video modal functionality
 */
export function initVideoModal() {
    const btn = document.getElementById('showStatsVideoBtn');
    const modal = document.getElementById('statsVideoModal');
    
    if (btn && modal) {
        btn.onclick = function(e) {
            e.preventDefault();
            modal.style.display = 'flex';
        };
        
        // Close on click outside video
        modal.onclick = function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        };
    }
}

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize all home page functions
 */
export function initHomePage() {
    // Load notification after short delay
    setTimeout(loadNotificationFromFirebase, 1000);
    
    // Load top scorer after Firebase init
    setTimeout(loadHighestTotalScore, 1500);
    
    // Initialize video modal
    initVideoModal();
}

// Make functions available globally for onclick handlers
window.showTopScorerAlert = showTopScorerAlert;
window.showChallengeMistakes = showChallengeMistakes;

// Auto-initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', initHomePage);
