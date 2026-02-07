# ليالي الامتحان - Developer Guide

> Complete guide for developers to understand, maintain, and extend the codebase.

---

## 📁 Project Structure

```
mansa/
├── index.html              # Main homepage
├── subject.html            # Subject page template (dynamic)
├── admin-dashboard.html    # Admin panel
├── join-us.html            # Join team page
├── maintenance.html        # Maintenance mode page
├── service-worker.js       # PWA caching
│
├── src/
│   ├── js/                 # JavaScript modules
│   │   ├── main.js         # Entry point (index.html)
│   │   ├── subject-main.js # Entry point (subject.html)
│   │   ├── config/         # Configuration files
│   │   ├── features/       # Feature modules
│   │   ├── utils/          # Utility modules
│   │   └── pages/          # Page-specific logic
│   │
│   ├── css/                # Stylesheets
│   │   ├── components/     # Shared component styles
│   │   ├── pages/          # Page-specific styles
│   │   ├── subjects/       # Subject-specific colors
│   │   ├── themes/         # Theme variants
│   │   └── features/       # Feature-specific styles
│   │
│   └── data/               # Subject data files
│
├── questions/              # Exam PDFs and images
├── assets/                 # Images, icons
└── docs/                   # Documentation
```

---

## 📜 JavaScript File Map

### Entry Points (ES6 Modules)
| File | Purpose |
|------|---------|
| `main.js` | Initializes index.html - imports navbar, themes, leaderboard, scroll |
| `subject-main.js` | Initializes subject.html - imports navbar, themes, scroll |

### Config (`src/js/config/`)
| File | Purpose |
|------|---------|
| `subjects.js` | **Single source of truth** for all subjects - names, icons, colors, paths |
| `firebase.js` | Firebase configuration for database connections |

### Features (`src/js/features/`)
| File | Purpose |
|------|---------|
| `challenge.js` | MCQ challenge mode - timer, scoring, leaderboard save |
| `essay.js` | Essay challenge mode - AI grading, image upload |
| `ai-chat.js` | AI chat assistant - Groq/Gemini API integration |
| `user-profile.js` | User profile management and local storage |

### Utils (`src/js/utils/`)
| File | Purpose |
|------|---------|
| `navbar.js` | Dynamic navbar injection (main + subject) |
| `themes.js` | Theme switching and persistence |
| `leaderboard.js` | Main page leaderboard tabs and data loading |
| `scroll.js` | Scroll behaviors, smooth scrolling, notifications |
| `error-handler.js` | Global error handling and retry logic |

### Pages (`src/js/pages/`)
| File | Purpose |
|------|---------|
| `subject.js` | Dynamic subject loader - reads URL param, loads subject data |

---

## 🎨 CSS File Map

### Components (`src/css/components/`)
| File | Purpose |
|------|---------|
| `shared.css` | Shared styles - cards, modals, buttons, forms |

### Pages (`src/css/pages/`)
| File | Purpose |
|------|---------|
| `home.css` | Index.html specific styles |

### Subjects (`src/css/subjects/`)
| File | Purpose |
|------|---------|
| `physics2.css` | Physics 2 color scheme |
| `math0.css` | Math 0 color scheme |
| `math1.css` | Math 1 color scheme |
| `english.css` | English color scheme |
| `it.css` | IT color scheme |
| `electronics.css` | Electronics color scheme |
| `history.css` | History color scheme |
| `law.css` | Law color scheme |

### Themes (`src/css/themes/`)
| File | Purpose |
|------|---------|
| `ramadan.css` | Ramadan decorations theme |

---

## ➕ How to Add a New Subject

### Step 1: Add to `subjects.js`
```javascript
// src/js/config/subjects.js
export const SUBJECTS = {
    // ... existing subjects
    
    newsubject: {
        id: 'newsubject',
        title: 'اسم المادة',
        subtitle: 'Subject Name',
        icon: 'fa-icon-name',
        color: '#HEX_COLOR',
        gradient: 'linear-gradient(135deg, #color1 0%, #color2 100%)',
        css: 'src/css/subjects/newsubject.css',
        data: 'src/data/newsubject-data.js',
        year: 1,  // 0, 1, 2, 3, 4
        college: 'cs'  // 'cs', 'is', 'ai', 'ds'
    }
};
```

### Step 2: Create CSS File
```css
/* src/css/subjects/newsubject.css */
:root {
    --subject-primary: #HEX_COLOR;
    --subject-secondary: #HEX_COLOR2;
    --subject-gradient: linear-gradient(135deg, #color1 0%, #color2 100%);
}
```

### Step 3: Create Data File
```javascript
// src/data/newsubject-data.js
const SUBJECT_MCQ_QUESTIONS = [];
const SUBJECT_ESSAY_QUESTIONS = [];
const SUBJECT_SUMMARIES = [];
```

### Step 4: Add to Service Worker Cache (Optional)
```javascript
// service-worker.js - add to urlsToCache
'/src/css/subjects/newsubject.css',
'/src/data/newsubject-data.js',
```

### Step 5: Test
Visit: `subject.html?id=newsubject`

---

## 📅 How to Add a New Year

### Step 1: Update `subjects.js`
Add `year` property to each subject:
```javascript
physics2: {
    // ...existing config
    year: 2,  // Second year
}
```

### Step 2: Filter by Year
```javascript
import { getSubjectsByYear } from './config/subjects.js';

// Get all second year subjects
const year2Subjects = getSubjectsByYear(2);
```

### Step 3: Update UI (index.html)
Add year tabs/filters in the subjects section to filter by year.

---

## 🏛️ How to Add a New College

### Step 1: Update `subjects.js`
Add `college` property:
```javascript
physics2: {
    // ...existing config
    college: 'cs',  // Computer Science
}
```

### Step 2: Filter by College
```javascript
import { getSubjectsByCollege } from './config/subjects.js';

// Get all CS subjects
const csSubjects = getSubjectsByCollege('cs');
```

---

## ✨ How to Add a New Feature

### Step 1: Create Feature Module
```javascript
// src/js/features/new-feature.js

/**
 * New Feature Module
 * Description of what it does
 */

export function initNewFeature() {
    // Implementation
}

export function doSomething() {
    // Implementation
}

// Make available globally if needed for onclick
window.doSomething = doSomething;
```

### Step 2: Import in Entry Point
```javascript
// src/js/main.js or subject-main.js
import { initNewFeature } from './features/new-feature.js';

document.addEventListener('DOMContentLoaded', () => {
    initNewFeature();
});
```

### Step 3: Add HTML Section
Add the feature section to `index.html` or `subject.html`.

### Step 4: Add CSS (if needed)
```css
/* src/css/features/new-feature.css */
.new-feature {
    /* styles */
}
```

---

## 🎨 How to Add a New Theme

### Step 1: Add Theme Class in `themes.js`
```javascript
// src/js/utils/themes.js
const THEMES = ['default', 'space', 'ocean', 'sunset', 'pyramids', 'winter', 'newtheme'];
```

### Step 2: Add CSS Variables
```css
/* src/css/components/shared.css */
body.newtheme-theme {
    --bg-primary: #color;
    --bg-secondary: #color;
    --text-primary: #color;
    /* ... other variables */
}
```

### Step 3: Add to Theme Menu (navbar.js)
```html
<button class="theme-option" onclick="setTheme('newtheme')" data-theme="newtheme">
    <i class="fas fa-icon"></i> اسم الثيم
</button>
```

---

## 🗺️ Future Roadmap

### Phase 1: User System
- [ ] Firebase Authentication integration
- [ ] User profiles with progress tracking
- [ ] Saved scores across devices

### Phase 2: Content Management
- [ ] Admin panel for adding questions
- [ ] Firebase Firestore for questions database
- [ ] Rich text editor for essays

### Phase 3: Analytics
- [ ] Firebase Analytics integration
- [ ] Usage tracking dashboard
- [ ] Popular questions insights

### Phase 4: Advanced Features
- [ ] Offline mode (PWA enhancements)
- [ ] Push notifications for new content
- [ ] Social sharing of scores

### Phase 5: Mobile App
- [ ] React Native or Flutter wrapper
- [ ] Native push notifications
- [ ] App store deployment

---

## 🔧 Development Commands

```bash
# Start local server (Python)
python -m http.server 8000

# Start local server (Node)
npx serve .

# Git workflow
git add -A
git commit -m "Description"
git push origin main
```

---

## 📝 Code Style Guidelines

1. **Variables**: Use `const` and `let`, never `var`
2. **Functions**: Use descriptive names, add JSDoc comments
3. **Modules**: One responsibility per file
4. **Comments**: Use `// ====` section headers
5. **Arabic**: Keep UI text in Arabic, code in English

---

## 🐛 Debugging Tips

1. **Console errors**: Check browser DevTools console
2. **Module loading**: Ensure `type="module"` in script tags
3. **Firebase**: Check Firebase console for database rules
4. **Caching**: Clear service worker cache if changes don't appear

```javascript
// Clear service worker cache
caches.keys().then(names => names.forEach(name => caches.delete(name)));
```

---

## 📞 Need Help?

- Check existing code patterns in similar files
- Review `subjects.js` for configuration structure
- Test changes locally before pushing
