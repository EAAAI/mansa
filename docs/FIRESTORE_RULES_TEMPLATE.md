# Firestore Rules Template

Use this template as a baseline for protecting dynamic subject content.
The deployable rules file lives at [firestore.rules](../firestore.rules).

## Scope

Collections covered:
- `subjects`
- `subject_pages`
- `admin_submissions`
- `users`

## Rules

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isSignedIn() {
      return request.auth != null;
    }

    function isAdmin() {
      return isSignedIn() && request.auth.token.admin == true;
    }

    // Public read for subject catalog/pages
    match /subjects/{subjectId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /subject_pages/{subjectId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Public create for intake forms, admin-only read/write for dashboard review
    match /admin_submissions/{submissionId} {
      allow create: if true;
      allow read, update, delete: if isAdmin();
    }

    // User profile documents (adjust to your policy)
    match /users/{userId} {
      allow read: if true;
      allow create, update: if isSignedIn() && request.auth.uid == userId;
      allow delete: if isAdmin();
    }

    // Deny everything else by default
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Notes

1. Use custom claims (`admin == true`) for admin access control.
2. Set the claim server-side with the Firebase Admin SDK or a trusted provisioning script.
3. Test rules in Emulator before deploying to production.
4. If subject content should be private, change `allow read: if true` to `allow read: if isSignedIn()`.
5. Keep [firebase.json](../firebase.json) pointed at the current `firestore.rules` file.
