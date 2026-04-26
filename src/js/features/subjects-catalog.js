import { DEFAULT_SUBJECTS, SUBJECTS_COLLECTION_CONFIG } from '../config/subjects-config.js';

const SUBJECTS_CACHE_KEY = 'mansa_subjects_catalog_v1';

function toNumber(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function toText(value, fallback = '') {
    if (typeof value === 'string') {
        const trimmed = value.trim();
        return trimmed || fallback;
    }

    if (value === null || value === undefined) {
        return fallback;
    }

    return String(value);
}

function sanitizeColor(color, fallback = '#6366f1') {
    const value = toText(color, '').toLowerCase();
    if (/^#[0-9a-f]{6}$/.test(value) || /^#[0-9a-f]{3}$/.test(value)) {
        return value;
    }

    return fallback;
}

function normalizeSubject(rawSubject, defaultSubject, index) {
    const base = defaultSubject || {};

    return {
        id: toText(rawSubject?.id, base.id || `subject_${index + 1}`),
        nameAr: toText(rawSubject?.nameAr, base.nameAr || 'مادة بدون اسم'),
        nameEn: toText(rawSubject?.nameEn, base.nameEn || ''),
        description: toText(
            rawSubject?.description,
            base.description || 'لا يوجد وصف متاح حالياً لهذه المادة.',
        ),
        icon: toText(rawSubject?.icon, base.icon || '📚'),
        accentColor: sanitizeColor(rawSubject?.accentColor, base.accentColor || '#6366f1'),
        questionCount: toNumber(rawSubject?.questionCount, base.questionCount || 0),
        essayCount: toNumber(rawSubject?.essayCount, base.essayCount || 0),
        difficulty: toText(rawSubject?.difficulty, base.difficulty || 'متوسط'),
        order: toNumber(rawSubject?.order, base.order || index + 1),
        isActive: rawSubject?.isActive !== false,
    };
}

function sortSubjects(subjects) {
    return [...subjects].sort((left, right) => {
        const orderDiff = toNumber(left.order, 0) - toNumber(right.order, 0);
        if (orderDiff !== 0) {
            return orderDiff;
        }

        return String(left.nameAr).localeCompare(String(right.nameAr), 'ar');
    });
}

function getDefaultSubjects() {
    return DEFAULT_SUBJECTS.map((subject, index) => normalizeSubject(subject, subject, index));
}

function mergeSubjects(remoteSubjects) {
    const defaults = getDefaultSubjects();
    const defaultsById = new Map(defaults.map((subject) => [subject.id, subject]));

    const merged = remoteSubjects.map((subject, index) => {
        const fallback = defaultsById.get(subject.id);
        return normalizeSubject(subject, fallback, index);
    });

    const remoteIds = new Set(merged.map((subject) => subject.id));
    defaults.forEach((subject) => {
        if (!remoteIds.has(subject.id)) {
            merged.push(subject);
        }
    });

    return sortSubjects(merged).filter((subject) => subject.isActive !== false);
}

function cacheSubjects(subjects) {
    try {
        localStorage.setItem(
            SUBJECTS_CACHE_KEY,
            JSON.stringify({
                subjects,
                savedAt: Date.now(),
            }),
        );
    } catch {
        // Ignore storage failures to keep runtime resilient.
    }
}

function readCachedSubjects() {
    try {
        const stored = localStorage.getItem(SUBJECTS_CACHE_KEY);
        if (!stored) {
            return null;
        }

        const parsed = JSON.parse(stored);
        if (!Array.isArray(parsed.subjects)) {
            return null;
        }

        return parsed.subjects;
    } catch {
        return null;
    }
}

async function fetchSubjectsFromFirebase() {
    if (typeof db === 'undefined' || !db) {
        return null;
    }

    const { catalogCollection, orderField } = SUBJECTS_COLLECTION_CONFIG;

    let snapshot;
    try {
        snapshot = await db.collection(catalogCollection).orderBy(orderField).get();
    } catch {
        snapshot = await db.collection(catalogCollection).get();
    }

    if (!snapshot || snapshot.empty) {
        return [];
    }

    const subjects = [];
    snapshot.forEach((doc, index) => {
        const data = doc.data() || {};
        subjects.push(
            normalizeSubject(
                {
                    id: doc.id,
                    ...data,
                },
                null,
                index,
            ),
        );
    });

    return sortSubjects(subjects).filter((subject) => subject.isActive !== false);
}

async function loadSubjectsCatalog() {
    try {
        const firebaseSubjects = await fetchSubjectsFromFirebase();
        if (firebaseSubjects && firebaseSubjects.length > 0) {
            const mergedSubjects = mergeSubjects(firebaseSubjects);
            cacheSubjects(mergedSubjects);
            return mergedSubjects;
        }
    } catch {
        // Fallback to cache/defaults.
    }

    const cached = readCachedSubjects();
    if (cached && cached.length > 0) {
        return mergeSubjects(cached);
    }

    return getDefaultSubjects();
}

async function loadSubjectPageData(subjectId) {
    if (!subjectId || typeof db === 'undefined' || !db) {
        return null;
    }

    const { subjectPageCollection } = SUBJECTS_COLLECTION_CONFIG;

    try {
        const subjectDoc = await db.collection(subjectPageCollection).doc(subjectId).get();
        if (!subjectDoc.exists) {
            return null;
        }

        const data = subjectDoc.data() || {};

        const modules = Array.isArray(data.modules)
            ? data.modules
                .map((item) => ({
                    title: toText(item?.title),
                    description: toText(item?.description),
                }))
                .filter((item) => item.title)
            : [];

        const resources = Array.isArray(data.resources)
            ? data.resources
                .map((item) => ({
                    title: toText(item?.title),
                    href: toText(item?.href),
                }))
                .filter((item) => item.title)
            : [];

        return {
            headline: toText(data.headline),
            description: toText(data.description),
            announcement: toText(data.announcement),
            modules,
            resources,
            accentColor: sanitizeColor(data.accentColor, ''),
            difficulty: toText(data.difficulty),
            questionCount: toNumber(data.questionCount, 0),
            essayCount: toNumber(data.essayCount, 0),
        };
    } catch {
        return null;
    }
}

function getSubjectById(subjects, subjectId) {
    return subjects.find((subject) => subject.id === subjectId) || null;
}

export {
    loadSubjectsCatalog,
    loadSubjectPageData,
    getSubjectById,
};
