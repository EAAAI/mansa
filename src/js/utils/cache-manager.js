/**
 * cache-manager.js
 * Centralized caching utility relying on a Firestore version document.
 */

const VERSIONS_DOC_PATH = 'system/versions';
const SESSION_CACHE_KEY = 'mansa_server_versions';
const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Fetches the system versions document.
 * Caches it in sessionStorage with a 30-minute TTL.
 */
export async function fetchSystemVersions(db) {
    const sessionCached = sessionStorage.getItem(SESSION_CACHE_KEY);
    if (sessionCached) {
        try {
            const parsed = JSON.parse(sessionCached);
            // 1. "Stale Tab" Fix: Check if within 30-minute TTL
            if (parsed.timestamp && (Date.now() - parsed.timestamp < SESSION_TTL_MS)) {
                return parsed.versions;
            }
        } catch (e) { /* ignore */ }
    }

    try {
        const doc = await db.doc(VERSIONS_DOC_PATH).get();
        const versions = doc.exists ? doc.data() : {};
        
        sessionStorage.setItem(SESSION_CACHE_KEY, JSON.stringify({
            versions,
            timestamp: Date.now()
        }));
        
        return versions;
    } catch (err) {
        console.error("Failed to fetch system versions", err);
        // 2. Offline Fallback Fix: Return null to explicitly indicate network failure
        return null; 
    }
}

/**
 * The core wrapper. Returns cached data if versions match, otherwise executes the fetcher.
 */
export async function fetchWithCache(db, cacheKey, versionKey, fetcherFn) {
    const versions = await fetchSystemVersions(db);
    
    const localData = localStorage.getItem(cacheKey);
    const localVersion = parseInt(localStorage.getItem(cacheKey + '_version') || '0', 10);

    // 2. Offline Fallback Fix: If versions fetch failed, fallback to local cache aggressively
    if (versions === null) {
        if (localData) {
            try { return JSON.parse(localData); } catch (e) {}
        }
        return fetcherFn();
    }

    const serverVersion = versions[versionKey] || 0;

    // If we have local data and the versions match exactly, use Cache!
    if (localData && localVersion === serverVersion && serverVersion !== 0) {
        try { return JSON.parse(localData); } catch (e) {}
    }

    // Cache miss or outdated -> Fetch fresh data
    const freshData = await fetcherFn();

    // Only cache if we got actual data
    if (freshData !== null && typeof freshData !== 'undefined') {
        try {
            localStorage.setItem(cacheKey, JSON.stringify(freshData));
            localStorage.setItem(cacheKey + '_version', serverVersion.toString());
        } catch (e) {
            // 3. LocalStorage Quota Exceedance Fix: Silently catch 5MB limit errors
            console.warn("LocalStorage quota exceeded, skipping cache save.");
        }
    }

    return freshData;
}

/**
 * Used by Admin files to bump the timestamp and force all users to fetch fresh data.
 */
export async function updateCacheVersion(db, versionKey) {
    try {
        await db.doc(VERSIONS_DOC_PATH).set({
            [versionKey]: Date.now()
        }, { merge: true });
        
        // Clear admin's session cache so they immediately see their own updates
        sessionStorage.removeItem(SESSION_CACHE_KEY);
    } catch (err) {
        console.error("Failed to update cache version", err);
    }
}
