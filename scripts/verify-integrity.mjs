import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function read(relativePath) {
    const fullPath = path.join(root, relativePath);
    return fs.readFileSync(fullPath, 'utf8');
}

function exists(relativePath) {
    return fs.existsSync(path.join(root, relativePath));
}

function assert(check, message, failures) {
    if (!check) {
        failures.push(message);
    }
}

function fileContains(relativePath, needle, failures, label) {
    const content = read(relativePath);
    assert(content.includes(needle), `${label}: missing "${needle}" in ${relativePath}`, failures);
}

function fileNotContains(relativePath, pattern, failures, label) {
    const content = read(relativePath);
    assert(!pattern.test(content), `${label}: found forbidden pattern ${pattern} in ${relativePath}`, failures);
}

const failures = [];

const requiredFiles = [
    'api/_lib/security.js',
    'api/contact.js',
    'src/js/pages/index-page.js',
    'src/js/pages/admin-dashboard-page.js',
    'src/js/pages/subject-page.js',
    'src/js/features/subjects-catalog.js',
    'src/js/config/subjects-config.js',
    'src/js/config/firebase.js',
    'index.html',
    'admin-dashboard.html',
    'subject.html',
    'src/css/pages/index.css',
    'src/css/pages/admin-dashboard.css',
    'src/css/pages/subject.css',
    'docs/FIREBASE_SUBJECTS_SETUP.md',
    'docs/FIRESTORE_RULES_TEMPLATE.md',
    'docs/PREDEPLOY_CHECKLIST.md',
    'service-worker.js',
];

requiredFiles.forEach((relativePath) => {
    assert(exists(relativePath), `Missing required file: ${relativePath}`, failures);
});

fileContains('src/js/pages/index-page.js', 'loadSubjectsCatalog', failures, 'Dynamic subjects');
fileContains('src/js/pages/index-page.js', 'createSubjectUrl', failures, 'Dynamic subjects');
fileContains('service-worker.js', "'/subject.html'", failures, 'Offline cache');
fileContains('service-worker.js', "'/src/js/pages/subject-page.js'", failures, 'Offline cache');
fileContains('service-worker.js', "'/src/css/pages/subject.css'", failures, 'Offline cache');

fileNotContains(
    'src/js/config/firebase.js',
    /gsk_[A-Za-z0-9]{20,}/,
    failures,
    'Secret exposure',
);

if (failures.length > 0) {
    console.error('Verification failed:');
    failures.forEach((failure) => console.error(`- ${failure}`));
    process.exit(1);
}

console.log('Verification passed: security + dynamic-subject architecture checks are consistent.');
