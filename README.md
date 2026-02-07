# ليالي الامتحان (Layali Al-Imtihan)

> 📚 Educational platform for First Year Computer Science students - Faculty of Computers and Information

## Overview

An interactive Arabic educational platform featuring:
- 📝 **Question Banks** - Multiple choice and essay questions
- ⚡ **Challenge Mode** - Timed quizzes with leaderboards
- 🤖 **AI Assistant** - Powered by Groq/Gemini for tutoring
- 🏆 **Leaderboards** - Track and compare scores
- 📱 **Mobile Friendly** - Responsive design

## Subjects

- Physics
- Mathematics (Calculus)
- IT Fundamentals
- Electronics
- English
- Law
- History

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

## Technologies

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Firebase Firestore (leaderboards)
- **AI**: Groq API, Google Gemini API
- **Icons**: Font Awesome 6
- **Fonts**: Cairo (Arabic)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

© 2024 EAAAI - All rights reserved
