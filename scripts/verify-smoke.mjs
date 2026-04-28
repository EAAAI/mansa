import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function exists(relativePath) {
    return fs.existsSync(path.join(root, relativePath));
}

function assert(condition, message, failures) {
    if (!condition) {
        failures.push(message);
    }
}

function read(relativePath) {
    return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

const failures = [];

const expectedPages = [
    'index.html',
    'subject.html',
    'admin-dashboard.html',
];

const expectedApis = [
    'api/contact.js',
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

if (failures.length > 0) {
    console.error('Smoke verification failed:');
    failures.forEach((failure) => console.error(`- ${failure}`));
    process.exit(1);
}

console.log('Smoke verification passed: pages, API routes, and seed schemas look valid.');
