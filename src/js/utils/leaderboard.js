/**
 * Leaderboard Module
 * Handles leaderboard tab switching and data loading for index.html
 */

// Subject names mapping
const SUBJECT_NAMES = {
    'all': 'الإجمالي - مجموع النقاط من جميع المواد',
    'physics2': 'فيزياء 2',
    'english': 'اللغة الإنجليزية',
    'it': 'تكنولوجيا المعلومات',
    'electronics': 'الإلكترونيات',
    'math1': 'رياضيات 1',
    'math0': 'رياضيات 0',
    'history': 'تاريخ الحوسبة',
    'law': 'قوانين الحاسب'
};

// Subject icon mapping
const SUBJECT_ICONS = {
    'all': 'fa-star',
    'physics2': 'fa-atom',
    'english': 'fa-language',
    'it': 'fa-laptop-code',
    'electronics': 'fa-microchip',
    'math1': 'fa-calculator',
    'math0': 'fa-square-root-alt',
    'history': 'fa-history',
    'law': 'fa-gavel'
};

/**
 * Format time in seconds to MM:SS
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
export function formatTime(seconds) {
    if (!seconds && seconds !== 0) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Switch leaderboard tab and load data
 * @param {string} subject - Subject ID or 'all' for aggregate
 */
export async function switchLeaderboardTab(subject) {
    // Update active tab
    document.querySelectorAll('.lb-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.subject === subject) {
            tab.classList.add('active');
        }
    });

    // Update title
    const titleEl = document.getElementById('currentSubjectTitle');
    if (titleEl) {
        const icon = SUBJECT_ICONS[subject] || 'fa-star';
        titleEl.innerHTML = `<i class="fas ${icon}"></i> ${SUBJECT_NAMES[subject] || subject}`;
    }

    // Load leaderboard data
    const tbody = document.getElementById('mainLeaderboardBody');
    const noRecords = document.getElementById('noRecordsMain');
    
    if (!tbody) return;
    
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:30px;"><i class="fas fa-spinner fa-spin"></i> جاري التحميل...</td></tr>';
    if (noRecords) noRecords.style.display = 'none';

    try {
        if (typeof dbLeaderboard === 'undefined' || !dbLeaderboard) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#ff6b6b;">خطأ في الاتصال بقاعدة البيانات</td></tr>';
            return;
        }

        let entries = [];

        if (subject === 'all') {
            // Aggregate scores from all subjects
            const subjects = ['physics2', 'math0', 'math1', 'english', 'history', 'it', 'law', 'electronics'];
            const userScores = {};

            for (const subj of subjects) {
                try {
                    const snapshot = await dbLeaderboard.collection(subj)
                        .orderBy('score', 'desc')
                        .limit(50)
                        .get();

                    snapshot.forEach(doc => {
                        const data = doc.data();
                        const name = data.name;
                        const score = parseInt(data.score) || 0;

                        if (!userScores[name]) {
                            userScores[name] = { score: 0, time: 0, date: null };
                        }
                        userScores[name].score += score;
                        userScores[name].time += parseInt(data.time) || 0;
                        if (!userScores[name].date && data.timestamp) {
                            userScores[name].date = data.timestamp.toDate ? data.timestamp.toDate() : new Date(data.timestamp);
                        }
                    });
                } catch (err) {
                    // Subject leaderboard fetch error - continue with others
                }
            }

            entries = Object.entries(userScores)
                .map(([name, data]) => ({ name, ...data }))
                .sort((a, b) => b.score - a.score)
                .slice(0, 10);
        } else {
            // Single subject
            const snapshot = await dbLeaderboard.collection(subject)
                .orderBy('score', 'desc')
                .orderBy('time', 'asc')
                .limit(10)
                .get();

            snapshot.forEach(doc => {
                const data = doc.data();
                entries.push({
                    name: data.name,
                    score: data.score,
                    time: data.time,
                    date: data.timestamp ? (data.timestamp.toDate ? data.timestamp.toDate() : new Date(data.timestamp)) : null
                });
            });
        }

        if (entries.length === 0) {
            tbody.innerHTML = '';
            if (noRecords) noRecords.style.display = 'block';
            return;
        }

        tbody.innerHTML = entries.map((entry, i) => {
            const rank = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i + 1);
            const time = formatTime(entry.time);
            const date = entry.date ? entry.date.toLocaleDateString('ar-EG') : '-';
            return `<tr>
                <td>${rank}</td>
                <td>${entry.name}</td>
                <td>${entry.score}</td>
                <td>${time}</td>
                <td>${date}</td>
            </tr>`;
        }).join('');

        if (noRecords) noRecords.style.display = 'none';

    } catch (error) {
        console.error('Error loading leaderboard:', error);
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#ff6b6b;">خطأ في تحميل البيانات</td></tr>';
    }
}

// Make function available globally
window.switchLeaderboardTab = switchLeaderboardTab;
