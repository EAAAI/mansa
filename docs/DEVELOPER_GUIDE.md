# 📁 Mansa Developer Guide

## Project Structure Overview

```
mansa/
├── 📄 HTML Pages (root)
├── 📁 src/              ← All source code
│   ├── css/             ← Stylesheets
│   ├── js/              ← JavaScript
│   └── data/            ← Subject question data
├── 📁 assets/           ← Images, audio, fonts
├── 📁 tools/            ← Dev-only scripts
└── 📁 docs/             ← Documentation
```

---

## 📄 Root HTML Pages

| File | Purpose |
|------|---------|
| `index.html` | Homepage with subjects, AI chat, leaderboard |
| `subject.html` | Template for all subject pages (uses URL params) |
| `admin-dashboard.html` | Admin panel for managing content |
| `join-us.html` | Recruitment/join page |
| `maintenance.html` | Maintenance mode page |
| `migrate-leaderboard.html` | Migration utility |
| `service-worker.js` | PWA caching (must stay at root) |

---

## 📁 src/css/ - Stylesheets

### `css/base/` - Foundation (empty, for future)
Use for: CSS reset, variables, typography

### `css/components/`
| File | Contains |
|------|----------|
| `shared.css` | Themes (space, ocean, etc.), modals, cards, buttons |

**When adding a new component:**
1. Add styles to `shared.css`, OR
2. Create new file like `navbar.css` if it's large

### `css/features/`
| File | Contains |
|------|----------|
| `essay.css` | Essay grading + essay bank styles |
| `katex.css` | Math equation rendering |

**When adding a new feature:**
1. Create `src/css/features/[feature-name].css`
2. Link in HTML: `<link rel="stylesheet" href="src/css/features/[feature-name].css">`

### `css/themes/`
| File | Contains |
|------|----------|
| `ramadan.css` | Seasonal Ramadan decorations |

**When adding a new theme:**
1. Create `src/css/themes/[theme-name].css`
2. Theme gets applied via JS class: `body.classList.add('[theme]-theme')`

### `css/pages/`
| File | Contains |
|------|----------|
| `home.css` | Homepage-specific styles |

### `css/subjects/`
| File | Contains |
|------|----------|
| `physics2.css` | **BASE** - Full subject page styles |
| `it.css`, `math0.css`, etc. | Color overrides only |

**When adding a new subject:**
1. Copy any override file (e.g., `it.css`)
2. Rename to `[subject].css`
3. Change the color values

---

## 📁 src/js/ - JavaScript

### `js/config/`
| File | Contains |
|------|----------|
| `firebase.js` | Firebase init, API keys, Gemini/Groq config |

⚠️ **Do NOT add more files here** - keep config centralized

### `js/utils/`
| File | Contains |
|------|----------|
| `ui.js` | Themes, scroll, mobile menu, notifications |

**When adding utility functions:**
Add to `ui.js` or create new file like `storage.js` for localStorage helpers

### `js/features/`
| File | Contains |
|------|----------|
| `challenge.js` | Quiz mode, question bank, leaderboard |
| `essay.js` | AI essay grading with image upload |
| `ai-chat.js` | AI chatbot functionality |
| `user-profile.js` | User management, stats, nickname |

**When adding a new feature:**
1. Create `src/js/features/[feature-name].js`
2. Add to HTML: `<script src="src/js/features/[feature-name].js"></script>`
3. Load order matters! Dependencies first

### `js/pages/`
| File | Contains |
|------|----------|
| `subject.js` | Subject page loader (reads URL param, loads CSS/data) |

**When adding a new page type:**
Create `src/js/pages/[page-name].js`

---

## 📁 src/data/ - Subject Data

| File | Contains |
|------|----------|
| `physics2-data.js` | Questions, essays, summaries for Physics 2 |
| `it-data.js` | Questions for IT subject |
| ... | One file per subject |

**When adding a new subject:**
1. Create `src/data/[subject]-data.js`
2. Define: `SUBJECT_MCQ_QUESTIONS`, `SUBJECT_ESSAY_QUESTIONS`, `SUBJECT_SUMMARIES`
3. Add entry in `src/js/pages/subject.js` SUBJECT_DATA object
4. Create CSS override in `src/css/subjects/[subject].css`

---

## 📁 Other Folders

| Folder | Purpose |
|--------|---------|
| `assets/` | Images, audio files, fonts |
| `tools/` | CLI scripts for data processing (not for web) |
| `docs/` | Documentation |
| `questions/` | JSON question banks |

---

## 🆕 Adding New Things - Quick Reference

### New Feature
1. CSS: `src/css/features/[name].css`
2. JS: `src/js/features/[name].js`
3. Link both in HTML

### New Subject
1. Data: `src/data/[subject]-data.js`
2. CSS: `src/css/subjects/[subject].css` (copy + change colors)
3. Config: Add to `SUBJECT_DATA` in `subject.js`

### New Theme
1. CSS: `src/css/themes/[theme].css`
2. JS: Update `setTheme()` in `ui.js`
3. Add theme option in HTML

### New Utility Function
Add to `src/js/utils/ui.js` or create new utils file

### New Page
1. Create `[page].html` at root
2. Link CSS/JS from `src/`
3. Optional: Create `src/js/pages/[page].js`

---

## 📝 Script Load Order

```html
<!-- Config first -->
<script src="src/js/config/firebase.js"></script>

<!-- Utils next -->
<script src="src/js/utils/ui.js"></script>

<!-- Features after -->
<script src="src/js/features/user-profile.js"></script>
<script src="src/js/features/ai-chat.js"></script>
<script src="src/js/features/challenge.js"></script>

<!-- Page-specific last -->
<script src="src/js/pages/subject.js"></script>
```
