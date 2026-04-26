const SUBJECTS_COLLECTION_CONFIG = Object.freeze({
    catalogCollection: 'subjects',
    subjectPageCollection: 'subject_pages',
    orderField: 'order',
});

const DEFAULT_SUBJECTS = Object.freeze([]);

function createSubjectUrl(subjectId) {
    return `subject.html?subject=${encodeURIComponent(subjectId)}`;
}

export {
    SUBJECTS_COLLECTION_CONFIG,
    DEFAULT_SUBJECTS,
    createSubjectUrl,
};
