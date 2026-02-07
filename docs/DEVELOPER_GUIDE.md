# ليالي الامتحان - Developer Guide

## Quick Reference

### File Locations
| What | Where |
|------|-------|
| New page navbar | `src/js/utils/ui.js` → `getMainNavbarHTML()` or `getSubjectNavbarHTML()` |
| New subject CSS | `src/css/subjects/[subject].css` |
| New theme | `src/css/themes/themes.css` + update ui.js |
| New feature JS | `src/js/features/[feature].js` |
| Firebase config | `src/js/config/firebase.js` |
| Error handling | `src/js/utils/error-handler.js` |

---

## Adding New Pages

### New Main Page (like index.html)
```html
<!-- Add to your new page -->
<nav id="navbar-container" class="navbar main-navbar"></nav>
<script src="src/js/utils/ui.js"></script>
```

### New Subject Page
```html
<!-- Add to your new subject page -->
<nav id="subject-navbar-container" class="subject-navbar"></nav>
<script src="src/js/utils/ui.js"></script>
```

---

## Adding New Subjects

1. **Create CSS**: `src/css/subjects/[subject].css` (copy existing subject CSS)
2. **Add questions**: `src/data/[subject]/questions.json`
3. **Create page**: Copy `subject.html` → `[subject].html`
4. **Update index.html**: Add subject card with correct link

---

## Adding New Features

### Pattern to Follow:
```javascript
// src/js/features/new-feature.js

// 1. Configuration at top
const FEATURE_CONFIG = {
    API_URL: '...',
    MAX_RETRIES: 3
};

// 2. Main functions
async function featureMainFunction() {
    try {
        // Use retryAsync for API calls
        const result = await retryAsync(() => fetch(url), 3, 1000);
        showSuccess('Success message');
    } catch (error) {
        console.error('Feature error:', error);
        showError('User-friendly error message');
    }
}

// 3. Export or attach to window
window.featureMainFunction = featureMainFunction;
```

---

## Current Systems Overview

### ✅ Working Well
- **Dynamic navbars**: Centralized in ui.js
- **Error handling**: showError/showSuccess utilities
- **Theme system**: Multiple themes via CSS classes
- **User profile**: localStorage persistence
- **Leaderboard**: Firebase Firestore integration

### ⚠️ Needs Work for Future

| System | Current State | For Future Scaling |
|--------|--------------|---------------------|
| **Authentication** | Anonymous (name only) | Will need Firebase Auth |
| **User data** | localStorage | Will need user accounts DB |
| **Questions** | JSON files | Consider Firebase or API |
| **Multiple years/colleges** | Not implemented | Create folder structure |

---

## Recommended Folder Structure for Future

```
src/
├── js/
│   ├── config/
│   │   ├── firebase.js       ← Firebase config
│   │   └── subjects.js       ← [CREATE] Subject definitions
│   ├── features/
│   │   ├── ai-chat.js
│   │   ├── challenge.js
│   │   ├── essay.js
│   │   ├── user-profile.js
│   │   └── auth.js           ← [FUTURE] Authentication
│   ├── utils/
│   │   ├── ui.js             ← Navbars, themes, UI helpers
│   │   └── error-handler.js  ← Error handling
│   └── pages/
│       └── subject.js        ← Subject page logic
│
├── data/                      ← [CREATE] for question data
│   ├── physics/
│   │   ├── questions.json
│   │   └── essays.json
│   ├── chemistry/
│   └── ...
│
└── pages/                     ← [FUTURE] for multi-year structure
    ├── year1/
    │   ├── physics.html
    │   └── chemistry.html
    └── year2/
```

---

## What to Create Before Scaling

### 1. Subject Configuration File (Recommended)
Create `src/js/config/subjects.js`:
```javascript
const SUBJECTS = {
    physics: {
        id: 'physics',
        name: 'الفيزياء',
        nameEn: 'Physics',
        icon: 'fa-atom',
        color: '#667eea',
        year: 1,
        college: 'pharmacy'
    },
    // Add more subjects...
};
```

### 2. Year/College Structure (When Needed)
When adding multiple years:
- Create folder per year: `pages/year1/`, `pages/year2/`
- Update navbar to include year selector
- Update subject config with year property

### 3. User Authentication (When Needed)
- Add Firebase Authentication
- Create `src/js/features/auth.js`
- Update user-profile.js to sync with Firebase user

---

## Best Practices Checklist

### Before Adding Features
- [ ] Check if similar pattern exists in codebase
- [ ] Use error-handler.js utilities (showError, showSuccess, retryAsync)
- [ ] Follow existing naming conventions

### Before Editing Navbar
- [ ] Edit in ui.js, not in HTML files
- [ ] Test on both index.html and subject.html
- [ ] Test mobile menu

### Before Adding New Pages
- [ ] Use dynamic navbar system
- [ ] Include all required CSS/JS files
- [ ] Test theme switching works

---

## Common Mistakes to Avoid

| ❌ Don't | ✅ Do |
|----------|-------|
| Copy navbar HTML into new pages | Use navbar placeholder |
| Use console.log in production | Use console.error for errors only |
| Hardcode API keys | Use config files |
| Silent error handling | Show user-friendly messages |
| Skip mobile testing | Test responsive design |

---

## Quick Commands

```bash
# Start local server (if Node.js installed)
npx serve

# Git workflow
git add -A
git commit -m "description"
git push
```
