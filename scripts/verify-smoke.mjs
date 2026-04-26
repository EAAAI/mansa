import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function exists(relativePath) {
    return fs.existsSync(path.join(root, relativePath));
}

function read(relativePath) {
    return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function assert(condition, message, failures) {
    if (!condition) {
        failures.push(message);
    }
}

function parseJsonArray(file, failures) {
    assert(exists(file), `Missing seed file: ${file}`, failures);
    if (!exists(file)) {
        return null;
    }

    let data;
    try {
        data = JSON.parse(read(file));
    } catch {
        failures.push(`Invalid JSON: ${file}`);
        return null;
    }

    assert(Array.isArray(data), `Seed file must contain an array: ${file}`, failures);
    return Array.isArray(data) ? data : null;
}

function validateRequiredFields(row, requiredFields, file, index, failures) {
    requiredFields.forEach((field) => {
        assert(
            row && row[field] !== undefined && row[field] !== null && row[field] !== '',
            `Missing ${field} in ${file} row ${index + 1}`,
            failures,
        );
    });
}

function validateUniqueIds(rows, file, failures) {
    const ids = new Set();

    rows.forEach((row) => {
        if (!row || !row.id) {
            return;
        }

        assert(!ids.has(row.id), `Duplicate id in ${file}: ${row.id}`, failures);
        ids.add(row.id);
    });
}

const failures = [];

const expectedPages = [
    'index.html',
    'subject.html',
    'admin-dashboard.html',
    'suggest.html',
    'join-us.html',
    'maintenance.html',
];

const expectedApis = [
    'api/contact.js',
    'api/ai-nickname.js',
    'api/ai-essay-grade.js',
];

function validateApiRoute(relativePath, failures) {
    assert(exists(relativePath), `Missing expected API route: ${relativePath}`, failures);
    if (!exists(relativePath)) {
        return;
    }

    const content = read(relativePath);
    assert(
        /export\s+default\s+async\s+function\s+handler/.test(content),
        `API route missing default async handler: ${relativePath}`,
        failures,
    );
}

expectedPages.forEach((relativePath) => {
    assert(exists(relativePath), `Missing expected page: ${relativePath}`, failures);
});

expectedApis.forEach((relativePath) => validateApiRoute(relativePath, failures));

function validateSeedCatalog() {
    const file = 'src/data/firebase-seed/subjects.catalog.json';
    const data = parseJsonArray(file, failures);
    if (!data) {
        return;
    }

    const required = ['id', 'nameAr', 'description', 'icon', 'order', 'isActive'];

    data.forEach((row, index) => {
        validateRequiredFields(row, required, file, index, failures);
    });

    validateUniqueIds(data, file, failures);
}

function validateSeedPages() {
    const file = 'src/data/firebase-seed/subject-pages.json';
    const data = parseJsonArray(file, failures);
    if (!data) {
        return;
    }

    const required = ['id', 'headline', 'description'];

    data.forEach((row, index) => {
        validateRequiredFields(row, required, file, index, failures);

        if (row && row.modules !== undefined) {
            assert(Array.isArray(row.modules), `modules must be an array in ${file} row ${index + 1}`, failures);
        }

        if (row && row.resources !== undefined) {
            assert(Array.isArray(row.resources), `resources must be an array in ${file} row ${index + 1}`, failures);
        }
    });

    validateUniqueIds(data, file, failures);
}

validateSeedCatalog();
validateSeedPages();

if (failures.length > 0) {
    console.error('Smoke verification failed:');
    failures.forEach((failure) => console.error(`- ${failure}`));
    process.exit(1);
}

console.log('Smoke verification passed: pages, API routes, and seed schemas look valid.');
