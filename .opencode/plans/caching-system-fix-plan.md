# Caching System Fix Plan

## Executive Summary

The caching system in "ليالي الامتحان" has a solid foundation but contains **5 issues** ranging from critical to minor. This plan provides a comprehensive fix for all identified problems.

**Date:** May 2026  
**Status:** Pending Implementation

---

## Current Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CACHING FLOW                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Firestore: system/versions     ◄──── updateCacheVersion()          │
│       │                                (called by admin CRUD)        │
│       │ {                                                            │
│       │   "subjectsCatalog": 1715000000000,  ◄── MISSING!           │
│       │   "roadmap_physics": 1715000000001,                         │
│       │   "questions_physics": 1715000000002,                       │
│       │   "summaries_physics": 1715000000003                        │
│       │ }                                                            │
│       ▼                                                              │
│  sessionStorage: mansa_server_versions  (30-min TTL)                │
│       │                                                              │
│       ▼                                                              │
│  fetchWithCache() compares serverVersion vs localVersion            │
│       │                                                              │
│       ▼                                                              │
│  localStorage: mansa_subjects_catalog      + _version suffix        │
│                mansa_roadmap_{subjectId}   + _version suffix        │
│                mansa_questions_{subjectId} + _version suffix        │
│                mansa_summaries_{subjectId} + _version suffix        │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Issues Identified

| # | Issue | Severity | Location | Impact |
|---|-------|----------|----------|--------|
| 1 | Subjects cache never invalidated | 🔴 Critical | `admin-dashboard-page.js` | Users see stale subjects for 30+ min after admin changes |
| 2 | `serverVersion === 0` breaks caching | 🟠 High | `cache-manager.js:63` | Cache never used until first admin edit occurs |
| 3 | `updateCacheVersion` fails silently | 🟡 Medium | `cache-manager.js:87-97` | Admin thinks update worked, but cache not invalidated |
| 4 | Unused constant `SUBJECTS_CACHE_KEY` | 🟢 Low | `subjects-catalog.js:8` | Dead code, causes confusion |
| 5 | No cache clearing utility | 🟢 Low | `cache-manager.js` | No way to force-refresh all caches (debugging) |

---

## Detailed Fix Plan

---

### Fix #1: Add Cache Invalidation to Subject CRUD [CRITICAL]

**File:** `src/js/pages/admin-dashboard-page.js`

**Problem:**  
When admin adds, deletes, or toggles subjects, the `updateCacheVersion()` function is never called. This means:
- Admin adds a new subject
- Firestore is updated
- But `system/versions.subjectsCatalog` is never bumped
- Users' cached data remains stale for up to 30 minutes (sessionStorage TTL)

**Comparison with other admin features:**
- `admin-roadmap.js` → ✅ calls `updateCacheVersion(_db, 'roadmap_' + _selectedSubjectId)`
- `admin-questions.js` → ✅ calls `updateCacheVersion(_db, 'questions_' + _selectedSubjectId)`
- `admin-summaries.js` → ✅ calls `updateCacheVersion(_db, 'summaries_' + _selectedSubjectId)`
- `admin-dashboard-page.js` (subjects) → ❌ **NEVER calls updateCacheVersion**

#### Step 1.1: Add Import

**Location:** Line 6 (after existing imports)

```js
// BEFORE:
import { db, initAuth, signInWithGoogle, hasAdminClaim, adminSignOut, onAuthStateChanged } from '../config/firebase.js';
import { initAdminRoadmap } from '../features/admin-roadmap.js';

// AFTER:
import { db, initAuth, signInWithGoogle, hasAdminClaim, adminSignOut, onAuthStateChanged } from '../config/firebase.js';
import { updateCacheVersion } from '../utils/cache-manager.js';
import { initAdminRoadmap } from '../features/admin-roadmap.js';
```

#### Step 1.2: Update `handleAddSubject()`

**Location:** Inside try block, after line 128 (after Firestore write succeeds)

```js
// BEFORE (lines 118-131):
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

// AFTER:
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

    await updateCacheVersion(db, 'subjectsCatalog');
    statusEl.textContent = `✅ تمت إضافة "${nameAr}" بنجاح!`;
```

#### Step 1.3: Update `handleDeleteSubject()`

**Location:** Inside try block, after line 153 (after Firestore delete succeeds)

```js
// BEFORE (lines 149-160):
async function handleDeleteSubject(subjectId, subjectName) {
    if (!confirm(`هل أنت متأكد من حذف "${subjectName}"؟ هذه العملية لا يمكن التراجع عنها.`)) return;

    try {
        await db.collection('subjects').doc(subjectId).delete();
        adminDataCache.subjects = await loadSubjectsFromFirestore();
        loadStats();
        renderSubjectsView();
    } catch (error) {

// AFTER:
async function handleDeleteSubject(subjectId, subjectName) {
    if (!confirm(`هل أنت متأكد من حذف "${subjectName}"؟ هذه العملية لا يمكن التراجع عنها.`)) return;

    try {
        await db.collection('subjects').doc(subjectId).delete();
        await updateCacheVersion(db, 'subjectsCatalog');
        adminDataCache.subjects = await loadSubjectsFromFirestore();
        loadStats();
        renderSubjectsView();
    } catch (error) {
```

#### Step 1.4: Update `handleToggleSubject()`

**Location:** Inside try block, after line 164 (after Firestore update succeeds)

```js
// BEFORE (lines 162-170):
async function handleToggleSubject(subjectId, currentIsActive) {
    try {
        await db.collection('subjects').doc(subjectId).update({ isActive: !currentIsActive });
        adminDataCache.subjects = await loadSubjectsFromFirestore();
        renderSubjectsView();
    } catch (error) {
        alert(`خطأ: ${error.message}`);
    }
}

// AFTER:
async function handleToggleSubject(subjectId, currentIsActive) {
    try {
        await db.collection('subjects').doc(subjectId).update({ isActive: !currentIsActive });
        await updateCacheVersion(db, 'subjectsCatalog');
        adminDataCache.subjects = await loadSubjectsFromFirestore();
        renderSubjectsView();
    } catch (error) {
        alert(`خطأ: ${error.message}`);
    }
}
```

---

### Fix #2: Handle `serverVersion === 0` Edge Case [HIGH]

**File:** `src/js/utils/cache-manager.js`

**Problem:**  
Line 63 has condition `serverVersion !== 0` which prevents caching when the version key doesn't exist in Firestore yet.

```js
// CURRENT CODE (lines 60-65):
const serverVersion = versions[versionKey] || 0;

// If we have local data and the versions match exactly, use Cache!
if (localData && localVersion === serverVersion && serverVersion !== 0) {
    try { return JSON.parse(localData); } catch (e) {}
}
```

**Why this is a problem:**
1. User visits site for first time
2. `system/versions` document might not have `subjectsCatalog` key yet
3. `serverVersion` becomes `0`
4. Cache check fails due to `&& serverVersion !== 0`
5. Data is fetched from Firestore and saved to localStorage with `version = 0`
6. User visits again → same thing happens, cache is never used!
7. This continues until an admin makes a change (which sets version to `Date.now()`)

**Solution:**  
Remove the `&& serverVersion !== 0` check.

**Location:** Line 63

```js
// BEFORE:
if (localData && localVersion === serverVersion && serverVersion !== 0) {
    try { return JSON.parse(localData); } catch (e) {}
}

// AFTER:
if (localData && localVersion === serverVersion) {
    try { return JSON.parse(localData); } catch (e) {}
}
```

**Why this is safe:**
- When both `serverVersion` and `localVersion` are `0`, cache should be valid
- Once admin makes ANY change, `updateCacheVersion()` sets version to `Date.now()` (e.g., `1715000000000`)
- `localVersion (0)` ≠ `serverVersion (1715000000000)` → cache invalidated correctly
- Subsequent saves store `localVersion = 1715000000000` → cache works normally

---

### Fix #3: Add Error Handling to `updateCacheVersion` [MEDIUM]

**File:** `src/js/utils/cache-manager.js`

**Problem:**  
The function catches errors but doesn't notify the caller. Admin thinks the update succeeded, but cache invalidation silently failed.

```js
// CURRENT CODE (lines 87-98):
export async function updateCacheVersion(db, versionKey) {
    try {
        await db.doc(VERSIONS_DOC_PATH).set({
            [versionKey]: Date.now()
        }, { merge: true });
        
        // Clear admin's session cache so they immediately see their own updates
        sessionStorage.removeItem(SESSION_CACHE_KEY);
    } catch (err) {
        console.error("Failed to update cache version", err);
        // Returns undefined - caller has no idea it failed!
    }
}
```

**Solution:**  
Return a boolean indicating success/failure.

**Location:** Replace lines 87-98

```js
// AFTER:
/**
 * Used by Admin files to bump the timestamp and force all users to fetch fresh data.
 * @param {object} db - Firestore database instance
 * @param {string} versionKey - The cache key to invalidate (e.g., 'subjectsCatalog')
 * @returns {Promise<boolean>} - true if successful, false if failed
 */
export async function updateCacheVersion(db, versionKey) {
    try {
        await db.doc(VERSIONS_DOC_PATH).set({
            [versionKey]: Date.now()
        }, { merge: true });
        
        // Clear admin's session cache so they immediately see their own updates
        sessionStorage.removeItem(SESSION_CACHE_KEY);
        return true;
    } catch (err) {
        console.error("Failed to update cache version", err);
        return false;
    }
}
```

**Note:** This change is backward-compatible. Existing callers that don't check the return value will continue working. Callers can optionally check the result to show a warning.

---

### Fix #4: Remove Unused Constant [LOW]

**File:** `src/js/features/subjects-catalog.js`

**Problem:**  
Line 8 defines a constant that is never used anywhere in the codebase.

```js
// LINE 8 (UNUSED):
const SUBJECTS_CACHE_KEY = "mansa_subjects_catalog_v1";

// LINE 141 (ACTUAL USAGE):
const firebaseSubjects = await fetchWithCache(
    db,
    "mansa_subjects_catalog",  // Different value!
    "subjectsCatalog",
    fetchSubjectsFromFirebase
);
```

**Solution:**  
Delete line 8.

**Location:** Line 8

```js
// DELETE THIS ENTIRE LINE:
const SUBJECTS_CACHE_KEY = "mansa_subjects_catalog_v1";
```

---

### Fix #5: Add Cache Clearing Utility [LOW - OPTIONAL]

**File:** `src/js/utils/cache-manager.js`

**Problem:**  
There's no way to force-clear all caches for debugging or troubleshooting. If a user reports stale data issues, they have to manually clear browser storage.

**Solution:**  
Add a new exported function for clearing all mansa-related caches.

**Location:** Add at end of file (after line 98)

```js
/**
 * Clears all mansa-related caches from localStorage and sessionStorage.
 * Useful for debugging or forcing a complete refresh.
 * Can be called from browser console: 
 *   import('/src/js/utils/cache-manager.js').then(m => m.clearAllCaches())
 * 
 * @returns {number} Number of localStorage keys removed
 */
export function clearAllCaches() {
    // Clear sessionStorage version cache
    sessionStorage.removeItem(SESSION_CACHE_KEY);
    
    // Clear all mansa_ prefixed localStorage keys
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('mansa_')) {
            keysToRemove.push(key);
        }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    console.log(`[CacheManager] Cleared ${keysToRemove.length} cache entries:`, keysToRemove);
    return keysToRemove.length;
}
```

---

## Files to Modify Summary

| File | Changes | Lines Affected |
|------|---------|----------------|
| `src/js/pages/admin-dashboard-page.js` | Add import + 3 `updateCacheVersion` calls | ~6, ~129, ~154, ~165 |
| `src/js/utils/cache-manager.js` | Fix version check + add return boolean + add clear utility | ~63, ~87-98, new function |
| `src/js/features/subjects-catalog.js` | Remove unused constant | ~8 |

**Total: 3 files, ~15 lines changed, ~20 lines added**

---

## Implementation Order

1. **Fix #1** - Critical bug, should be done first
2. **Fix #2** - High priority, simple one-line change
3. **Fix #3** - Medium priority, improves reliability
4. **Fix #4** - Low priority, code cleanup
5. **Fix #5** - Optional, nice-to-have utility

---

## Testing Plan

### Manual Testing Checklist

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 1 | **Subject Add - Cache Invalidation** | 1. Open site in Browser A (user)<br>2. Open admin in Browser B<br>3. Admin adds new subject<br>4. User refreshes Browser A | New subject appears immediately |
| 2 | **Subject Delete - Cache Invalidation** | 1. Open site in Browser A (user)<br>2. Open admin in Browser B<br>3. Admin deletes a subject<br>4. User refreshes Browser A | Deleted subject is gone |
| 3 | **Subject Toggle - Cache Invalidation** | 1. Open site in Browser A (user)<br>2. Open admin in Browser B<br>3. Admin hides a subject<br>4. User refreshes Browser A | Hidden subject no longer shows |
| 4 | **First Visit Caching** | 1. Clear all browser data<br>2. Visit site<br>3. Check localStorage | `mansa_subjects_catalog` and `mansa_subjects_catalog_version` exist |
| 5 | **Cache Hit on Reload** | 1. Visit site (data loads)<br>2. Open Network tab<br>3. Refresh page | No Firestore calls for subjects (cache hit) |
| 6 | **Offline Mode** | 1. Visit site (data loads)<br>2. Go offline (DevTools)<br>3. Refresh page | Cached data still displays correctly |
| 7 | **Cache Clear Utility** | 1. Open console<br>2. Run `clearAllCaches()`<br>3. Check localStorage | All `mansa_*` keys removed |
| 8 | **Version 0 Edge Case** | 1. Delete `system/versions` doc in Firestore<br>2. Clear localStorage<br>3. Visit site twice | Second visit uses cache (no Firestore call) |

### Automated Testing (Future)

Consider adding unit tests for:
- `fetchWithCache()` with various version scenarios
- `updateCacheVersion()` success and failure paths
- `clearAllCaches()` key removal

---

## Rollback Plan

If issues are discovered after deployment:

1. **Revert commits** - All changes are isolated to 3 files
2. **Clear Firestore versions** - Delete `system/versions` document to reset
3. **Instruct users** - Ask affected users to clear browser storage

---

## Future Improvements (Out of Scope)

These are not part of this fix but could be considered later:

1. **Configurable TTL** - Make 30-minute sessionStorage TTL configurable
2. **Cache size limits** - Implement LRU eviction if localStorage fills up
3. **Real-time invalidation** - Use Firestore listeners for instant cache invalidation
4. **Service Worker caching** - Add offline-first PWA support with service worker
5. **Admin cache dashboard** - Show cache status in admin panel

---

## Approval

- [ ] Plan reviewed by developer
- [ ] Ready for implementation

---

*Generated by OpenCode - May 2026*
