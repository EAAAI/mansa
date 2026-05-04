/**
 * Feature: Roadmap Progress (V0.2 — localStorage only)
 *
 * Exposes a Firestore-compatible interface (`loadProgress` / `saveProgress`)
 * so that upgrading to Firestore-backed storage in V0.3 requires changes
 * only inside this single file — zero impact on roadmap-viewer.js or above.
 *
 * localStorage key format: mansa_roadmap_progress_{subjectId}
 * Value shape:
 *   { [blockId]: { completedAt: ISO-8601 string } }
 */

const KEY_PREFIX = 'mansa_roadmap_progress_';

/**
 * Returns the localStorage key for a given subject.
 * @param {string} subjectId
 * @returns {string}
 */
function getStorageKey(subjectId) {
    return `${KEY_PREFIX}${subjectId}`;
}

/**
 * Loads the completion progress for a subject from localStorage.
 *
 * @param {string} subjectId
 * @returns {Map<string, { completedAt: string }>}
 *   A Map from blockId to progress data.
 *   Returns an empty Map on any parse/storage error.
 */
function loadProgress(subjectId) {
    if (!subjectId) return new Map();

    try {
        const raw = localStorage.getItem(getStorageKey(subjectId));
        if (!raw) return new Map();

        const parsed = JSON.parse(raw);
        if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
            return new Map();
        }

        return new Map(Object.entries(parsed));
    } catch {
        // JSON parse error or localStorage access denied.
        return new Map();
    }
}

/**
 * Saves the completion of a single block to localStorage.
 * Merges with any existing progress for the subject — does not overwrite
 * previously completed blocks.
 *
 * @param {string} subjectId
 * @param {string} blockId
 */
function saveProgress(subjectId, blockId) {
    if (!subjectId || !blockId) return;

    try {
        const key = getStorageKey(subjectId);
        const raw = localStorage.getItem(key);
        const existing = raw ? JSON.parse(raw) : {};

        existing[blockId] = { completedAt: new Date().toISOString() };

        localStorage.setItem(key, JSON.stringify(existing));
    } catch {
        // Ignore storage quota errors or access denied.
        // Progress is best-effort in V0.2 — a failed save does not crash the UI.
    }
}

export { loadProgress, saveProgress };
