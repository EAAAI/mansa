const fs = require('fs');

const htmlPath = 'c:/Users/ib200/OneDrive/المستندات/GitHub/mansa/ENGLISH.html';
const outputPath = 'c:/Users/ib200/OneDrive/المستندات/GitHub/mansa/questions/english/questions.json';
const outputDir = 'c:/Users/ib200/OneDrive/المستندات/GitHub/mansa/questions/english';

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const html = fs.readFileSync(htmlPath, 'utf8');
const questions = [];

const blockRegex = /<div class="question-block"[\s\S]*?<\/div>\s*<\/div>/g; // approximate, might need more robustness

const parts = html.split('class="question-block"');

parts.slice(1).forEach((part, index) => {

    const qMatch = part.match(/<span class="question-text">([\s\S]*?)<\/span>/);
    if (!qMatch) return;
    const questionText = qMatch[1].trim();

    const options = [];
    let correctIndex = -1;

    const optionMatches = [...part.matchAll(/<div class="option"[^>]*data-correct="([^"]*)"[^>]*>([\s\S]*?)<\/div>/g)];

    if (optionMatches.length > 0) {
        optionMatches.forEach((match, i) => {
            const isCorrect = match[1] === 'true';
            let text = match[2].trim();

            text = text.replace(/<span class="option-label">[^<]*<\/span>/, '').trim();
            options.push(text);
            if (isCorrect) correctIndex = i;
        });
    } else {

        if (part.includes('class="true-false-options"')) {
            options.push('True', 'False');

            const ansMatch = part.match(/<div class="answer">([\s\S]*?)<\/div>/);
            if (ansMatch) {
                const ansText = ansMatch[1].toLowerCase();
                if (ansText.includes('true')) correctIndex = 0;
                else if (ansText.includes('false')) correctIndex = 1;
            }
        }
    }

    if (options.length > 0 && correctIndex !== -1) {
        questions.push({
            id: index + 1,
            question: questionText,
            options: options,
            correct: correctIndex
        });
    }
});

fs.writeFileSync(outputPath, JSON.stringify(questions, null, 2));
console.log(`Extracted ${questions.length} questions to ${outputPath}`);
