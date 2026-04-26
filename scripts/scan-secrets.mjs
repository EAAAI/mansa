import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const ignoredDirs = new Set(['.git', 'node_modules', '.next', 'dist', 'build']);
const ignoredExtensions = new Set([
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.webp',
    '.ico',
    '.pdf',
    '.zip',
    '.wasm',
    '.woff',
    '.woff2',
    '.ttf',
    '.eot',
]);

const secretPatterns = [
    /gsk_[A-Za-z0-9]{20,}/g,
    /sk-[A-Za-z0-9]{20,}/g,
    /Bearer\s+gsk_[A-Za-z0-9]{20,}/g,
    /xox[baprs]-[A-Za-z0-9-]{20,}/g,
    /ghp_[A-Za-z0-9]{20,}/g,
    /AIzaSyD-[A-Za-z0-9_-]{20,}/g,
    /AIzaSyAErOl-[A-Za-z0-9_-]{20,}/g,
];

const findings = [];

function shouldIgnoreFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return ignoredExtensions.has(ext);
}

function walk(dirPath) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        const relativePath = path.relative(root, fullPath).replaceAll('\\', '/');

        if (entry.isDirectory()) {
            if (ignoredDirs.has(entry.name)) {
                continue;
            }
            walk(fullPath);
            continue;
        }

        if (shouldIgnoreFile(fullPath)) {
            continue;
        }

        let content;
        try {
            content = fs.readFileSync(fullPath, 'utf8');
        } catch {
            continue;
        }

        for (const pattern of secretPatterns) {
            pattern.lastIndex = 0;
            const matched = pattern.exec(content);
            if (!matched) {
                continue;
            }

            findings.push({
                file: relativePath,
                pattern: pattern.toString(),
                sample: matched[0].slice(0, 12) + '...'
            });
        }
    }
}

walk(root);

if (findings.length > 0) {
    console.error('Potential secrets found:');
    findings.forEach((item) => {
        console.error(`- ${item.file} :: ${item.pattern} :: ${item.sample}`);
    });
    process.exit(1);
}

console.log('Secret scan passed: no high-risk token patterns detected.');
