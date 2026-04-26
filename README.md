# ليالي الامتحان (Layali Al-Imtihan)

> 📚 Educational platform for First Year Computer Science students - Faculty of Computers and Information

## Overview

An interactive Arabic educational platform featuring:
- 📝 **Question Banks** - Multiple choice and essay questions
- ⚡ **Challenge Mode** - Timed quizzes with leaderboards
- 🤖 **AI Assistant** - Powered by secure backend AI proxy (Groq/Gemini)
- 🏆 **Leaderboards** - Track and compare scores
- 📱 **Mobile Friendly** - Responsive design
- 📚 **Dynamic Subjects** - Firebase-driven subjects catalog and detail pages


## Project Structure

```
src/
├── js/
│   ├── config/       # Firebase & API configuration
│   ├── features/     # Core features (AI chat, challenges, essays)
│   ├── pages/        # Page-specific logic
│   └── utils/        # Utilities (error handling, UI helpers)
├── css/
│   ├── components/   # Shared styles
│   ├── features/     # Feature-specific styles
│   ├── pages/        # Page layouts
│   ├── subjects/     # Subject theme colors
│   └── themes/       # Seasonal themes (Ramadan)
└── data/             # Question data files (JSON)
```

## Getting Started

1. Clone the repository
2. Open `index.html` in a browser
3. No build step required - pure HTML/CSS/JS

## Development

See [docs/DEVELOPER_GUIDE.md](docs/DEVELOPER_GUIDE.md) for:
- Adding new subjects
- Creating questions
- Theming guidelines

Quick local commands:
- `npm start`
- `npm run start:py`
- `npm run verify`
- `npm run verify:smoke`
- `npm run verify:secrets`
- `npm run verify:ci`

Firebase dynamic subject bootstrap:
- [docs/FIREBASE_SUBJECTS_SETUP.md](docs/FIREBASE_SUBJECTS_SETUP.md)

Operations and release docs:
- [docs/FIRESTORE_RULES_TEMPLATE.md](docs/FIRESTORE_RULES_TEMPLATE.md)
- [docs/PREDEPLOY_CHECKLIST.md](docs/PREDEPLOY_CHECKLIST.md)
- [docs/CONTINUOUS_EXECUTION_LOG.md](docs/CONTINUOUS_EXECUTION_LOG.md)

## Technologies

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Firebase Firestore + serverless API routes under `api/`
- **AI**: Groq API, Google Gemini API (server-side via environment variables)
- **Icons**: Font Awesome 6
- **Fonts**: Cairo (Arabic)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

© 2024 EAAAI - All rights reserved
