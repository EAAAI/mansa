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
