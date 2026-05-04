import {
  SUBJECTS_COLLECTION_CONFIG,
  DEFAULT_SUBJECTS,
} from "../config/subjects-config.js";
import { fetchWithCache } from "../utils/cache-manager.js";
import { db } from "../config/firebase.js";

const SUBJECTS_CACHE_KEY = "mansa_subjects_catalog_v1";

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toText(value, fallback = "") {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || fallback;
  }

  if (value === null || value === undefined) {
    return fallback;
  }

  return String(value);
}

function sanitizeColor(color, fallback = "#6366f1") {
  const value = toText(color, "").toLowerCase();
  if (/^#[0-9a-f]{6}$/.test(value) || /^#[0-9a-f]{3}$/.test(value)) {
    return value;
  }

  return fallback;
}

function normalizeSubject(rawSubject, defaultSubject, index) {
  const base = defaultSubject || {};

  return {
    id: toText(rawSubject?.id, base.id || `subject_${index + 1}`),
    nameAr: toText(rawSubject?.nameAr, base.nameAr || "مادة بدون اسم"),
    nameEn: toText(rawSubject?.nameEn, base.nameEn || ""),
    description: toText(
      rawSubject?.description,
      base.description || "لا يوجد وصف متاح حالياً لهذه المادة.",
    ),
    icon: toText(rawSubject?.icon, base.icon || "📚"),
    accentColor: sanitizeColor(
      rawSubject?.accentColor,
      base.accentColor || "#6366f1",
    ),
    difficulty: toText(rawSubject?.difficulty, base.difficulty || "متوسط"),
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

    return String(left.nameAr).localeCompare(String(left.nameAr), "ar");
  });
}

function getDefaultSubjects() {
  return DEFAULT_SUBJECTS.map((subject, index) =>
    normalizeSubject(subject, subject, index),
  );
}

function mergeSubjects(remoteSubjects) {
  const defaults = getDefaultSubjects();
  const defaultsById = new Map(
    defaults.map((subject) => [subject.id, subject]),
  );

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

async function fetchSubjectsFromFirebase() {
  if (!db) {
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
  if (!db) {
    return getDefaultSubjects();
  }

  try {
    const firebaseSubjects = await fetchWithCache(
      db,
      "mansa_subjects_catalog",
      "subjectsCatalog",
      fetchSubjectsFromFirebase
    );

    if (firebaseSubjects && firebaseSubjects.length > 0) {
      return mergeSubjects(firebaseSubjects);
    }
  } catch {
    // Fallback below
  }

  return getDefaultSubjects();
}

async function loadSubjectPageData(subjectId) {
  if (!subjectId || !db) {
    return null;
  }

  const { subjectPageCollection } = SUBJECTS_COLLECTION_CONFIG;

  try {
    const subjectDoc = await db
      .collection(subjectPageCollection)
      .doc(subjectId)
      .get();
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
      accentColor: sanitizeColor(data.accentColor, ""),
      difficulty: toText(data.difficulty),
    };
  } catch {
    return null;
  }
}

async function loadSingleSubject(subjectId) {
  if (!subjectId) {
    return null;
  }

  const defaults = getDefaultSubjects();
  const fallback = defaults.find((subject) => subject.id === subjectId) || null;

  if (!db) {
    return fallback;
  }

  const { catalogCollection } = SUBJECTS_COLLECTION_CONFIG;

  try {
    const doc = await db.collection(catalogCollection).doc(subjectId).get();
    if (!doc.exists) {
      return fallback;
    }

    const data = doc.data() || {};
    return normalizeSubject({ id: doc.id, ...data }, fallback, 0);
  } catch {
    return fallback;
  }
}

function getSubjectById(subjects, subjectId) {
  return subjects.find((subject) => subject.id === subjectId) || null;
}

export {
  loadSubjectsCatalog,
  loadSingleSubject,
  loadSubjectPageData,
  getSubjectById,
};
