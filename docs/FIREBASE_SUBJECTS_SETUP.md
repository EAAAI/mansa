# Firebase Subjects Setup

This guide seeds dynamic subject data required by:
- `index.html` subjects catalog
- `subject.html?subject=<id>` detail page

## Collections

1. `subjects`
- Document ID: subject id (for example: `physics2`, `math0`)
- Fields:
  - `nameAr` (string)
  - `nameEn` (string)
  - `description` (string)
  - `icon` (string)
  - `accentColor` (hex color)
  - `questionCount` (number)
  - `essayCount` (number)
  - `difficulty` (string)
  - `order` (number)
  - `isActive` (boolean)

2. `subject_pages`
- Document ID: same subject id
- Fields:
  - `headline` (string)
  - `description` (string)
  - `announcement` (string)
  - `accentColor` (hex color)
  - `difficulty` (string)
  - `questionCount` (number)
  - `essayCount` (number)
  - `modules` (array of `{ title, description }`)
  - `resources` (array of `{ title, href }`)

## Seed Files

- `src/data/firebase-seed/subjects.catalog.json`
- `src/data/firebase-seed/subject-pages.json`

## Quick Seed (Browser Console)

1. Run local app (`npm start` or `npm run start:py`).
2. Open `index.html` in browser.
3. Open DevTools Console.
4. Paste and run the script below.

```javascript
(async function seedSubjects() {
  if (typeof db === 'undefined' || !db) {
    throw new Error('Firestore instance `db` is not available on this page.');
  }

  const [catalogRes, pagesRes] = await Promise.all([
    fetch('src/data/firebase-seed/subjects.catalog.json'),
    fetch('src/data/firebase-seed/subject-pages.json')
  ]);

  const [catalog, pages] = await Promise.all([catalogRes.json(), pagesRes.json()]);

  const writeCollection = async (collectionName, rows) => {
    for (const row of rows) {
      const { id, ...data } = row;
      if (!id) continue;
      await db.collection(collectionName).doc(id).set(data, { merge: true });
    }
  };

  await writeCollection('subjects', catalog);
  await writeCollection('subject_pages', pages);

  console.log('Subject seed completed successfully.');
})();
```

## Verification

1. `index.html`: subject cards are visible and clickable.
2. open `subject.html?subject=physics2`: hero data and modules are loaded.
3. Disable network briefly: fallback/default catalog still renders.

## Notes

- The app merges remote data with defaults, so missing docs will not break rendering.
- Keep document IDs stable because routing depends on subject ID in URL.

## Admin Access

- The admin dashboard now expects a Firebase Auth custom claim named `admin` with the value `true`.
- Email allowlists are no longer used by the client runtime.
- Assign the claim server-side with the Firebase Admin SDK or an equivalent trusted provisioning flow.

---

## Roadmap Blocks (V0.2)

The Roadmap feature introduces a per-subject, ordered sequence of learning blocks.
Each block is one of three types: `video`, `pdf`, or `text`.

### Collection: `roadmap_blocks`

Document ID: **Auto-generated** Firestore ID (do not set manually).

| Field | Type | Required | Notes |
|---|---|---|---|
| `subjectId` | string | ✅ | Must match a document ID in the `subjects` collection |
| `type` | string | ✅ | One of: `"video"`, `"pdf"`, `"text"` |
| `title` | string | ✅ | Display heading shown on the block card |
| `order` | number | ✅ | 1-based sort index; must be unique per `subjectId` |
| `isActive` | boolean | | `false` hides the block from students; defaults to `true` |
| `youtubeUrl` | string | if video | Full YouTube URL or `youtu.be` short link |
| `pdfUrl` | string | if pdf | Publicly accessible direct PDF URL |
| `content` | string | if text | HTML/markdown string; sanitized client-side via DOMPurify |

### Querying

The app always queries roadmap blocks as:

```javascript
db.collection('roadmap_blocks')
  .where('subjectId', '==', subjectId)
  .orderBy('order')
  .get()
```

### Required Composite Index

This query requires a composite index on `(subjectId ASC, order ASC)`.

The index is defined in `firestore.indexes.json` at the project root and is automatically
deployed with:

```bash
firebase deploy --only firestore
```

> **Note:** If the index is not yet deployed, `fetchRoadmapBlocks` falls back to an
> unordered `.get()` and sorts client-side. This is a safety net only — deploy the
> index before going to production.

### Progress Storage (V0.2)

Student progress is stored in **`localStorage` only** in V0.2. No Firestore collection
is used for progress. The key format is:

```
mansa_roadmap_progress_{subjectId}
```

Value structure:

```json
{
  "blockId_abc123": { "completedAt": "2026-05-04T15:00:00.000Z" },
  "blockId_def456": { "completedAt": "2026-05-04T15:05:00.000Z" }
}
```

> Firestore-backed progress sync (cross-device) is planned for V0.3 when user
> accounts are introduced. The `roadmap-progress.js` module exposes a
> Firestore-compatible interface so the swap requires changes in only one file.
