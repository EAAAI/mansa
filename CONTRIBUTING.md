# Contributing to ليالي الامتحان

Thank you for your interest in contributing! 🎉

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Open `index.html` in a browser to test

## Development Guidelines

### Code Style
- Use 4 spaces for indentation
- Use camelCase for JavaScript variables/functions
- Use kebab-case for CSS classes
- Add comments for complex logic

### File Structure
- Place new JS features in `src/js/features/`
- Place utilities in `src/js/utils/`
- Subject-specific CSS goes in `src/css/subjects/`

### Adding Questions
1. Create/update JSON file in `src/data/`
2. Follow existing question format:
```json
{
  "question": "السؤال بالعربية",
  "questionEn": "Question in English",
  "options": ["A", "B", "C", "D"],
  "correct": 0
}
```

### Pull Request Process
1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Test thoroughly
4. Submit a PR with clear description

## Questions?

Open an issue on GitHub or contact the maintainers.
