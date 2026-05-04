const SUBJECTS_COLLECTION_CONFIG = Object.freeze({
    catalogCollection: 'subjects',
    subjectPageCollection: 'subject_pages',
    orderField: 'order',
});

// Roadmap feature collection
const ROADMAP_BLOCKS_COLLECTION = 'roadmap_blocks';

// Questions and Summaries collections
const QUESTIONS_COLLECTION = 'subject_questions';
const SUMMARIES_COLLECTION = 'subject_summaries';

// ---------------------------------------------------------------------------
// Cloudinary — free image hosting for roadmap image blocks.
// 1. Create a free account at https://cloudinary.com
// 2. Settings → Upload → Add upload preset → set Signing Mode = "Unsigned"
// 3. Replace the two placeholder strings below with your actual values.
// ---------------------------------------------------------------------------
const CLOUDINARY_CLOUD_NAME    = 'di6hdfq9k';
const CLOUDINARY_UPLOAD_PRESET = 'roadmap_unsigned';

const DEFAULT_SUBJECTS = Object.freeze([]);

function createSubjectUrl(subjectId) {
    return `subject.html?subject=${encodeURIComponent(subjectId)}`;
}

export {
    SUBJECTS_COLLECTION_CONFIG,
    ROADMAP_BLOCKS_COLLECTION,
    QUESTIONS_COLLECTION,
    SUMMARIES_COLLECTION,
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_UPLOAD_PRESET,
    DEFAULT_SUBJECTS,
    createSubjectUrl,
};
