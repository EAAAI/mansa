const fs = require('fs');

// Read the law.js file
const filePath = './subjects/law.js';
let content = fs.readFileSync(filePath, 'utf8');

// Extract the questions array
const questionsMatch = content.match(/const questions = \[([\s\S]*?)\];/);
if (!questionsMatch) {
    console.log('Could not find questions array');
    process.exit(1);
}

// Parse questions manually
const questionsStr = questionsMatch[1];

// Function to shuffle array with seed for reproducibility
function shuffleWithNewCorrect(options, correctIndex) {
    const correctAnswer = options[correctIndex];
    const shuffled = [...options];

    // Fisher-Yates shuffle
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Find new correct index
    const newCorrectIndex = shuffled.indexOf(correctAnswer);

    return { options: shuffled, correct: newCorrectIndex };
}

// Find and replace each question's options and correct
let modifiedContent = content;
const questionRegex = /options:\s*\[(.*?)\],\s*\n\s*correct:\s*(\d+)/gs;

let match;
let replacements = [];

while ((match = questionRegex.exec(content)) !== null) {
    const fullMatch = match[0];
    const optionsStr = match[1];
    const correctIndex = parseInt(match[2]);

    // Parse options (handle quoted strings)
    const options = [];
    const optionMatches = optionsStr.matchAll(/"([^"\\]*(?:\\.[^"\\]*)*)"/g);
    for (const m of optionMatches) {
        options.push(m[1]);
    }

    if (options.length === 4) {
        const { options: shuffledOptions, correct: newCorrect } = shuffleWithNewCorrect(options, correctIndex);
        const newOptionsStr = shuffledOptions.map(o => `"${o}"`).join(', ');
        const newMatch = `options: [${newOptionsStr}],\n        correct: ${newCorrect}`;
        replacements.push({ original: fullMatch, replacement: newMatch });
    }
}

// Apply replacements
for (const r of replacements) {
    modifiedContent = modifiedContent.replace(r.original, r.replacement);
}

// Write back
fs.writeFileSync(filePath, modifiedContent, 'utf8');
console.log(`Shuffled options for ${replacements.length} questions!`);
