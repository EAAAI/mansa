/**
 * Feature: Questions Viewer (Student facing)
 * Renders MCQ and short-answer questions for a specific subject.
 */

import { QUESTIONS_COLLECTION } from "../config/subjects-config.js";
import { fetchWithCache } from "../utils/cache-manager.js";

function esc(v) {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function fetchQuestions(subjectId, db) {
  if (!db || !subjectId) return [];

  return fetchWithCache(
    db,
    `mansa_questions_${subjectId}`,
    `questions_${subjectId}`,
    async () => {
      let snapshot;
      try {
        snapshot = await db
          .collection(QUESTIONS_COLLECTION)
          .where("subjectId", "==", subjectId)
          .orderBy("order")
          .get();
      } catch {
        // Fallback if index isn't ready
        try {
          snapshot = await db
            .collection(QUESTIONS_COLLECTION)
            .where("subjectId", "==", subjectId)
            .get();
        } catch {
          return [];
        }
      }

      if (!snapshot || snapshot.empty) return [];

      const questions = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.isActive !== false) {
          questions.push({ id: doc.id, ...data });
        }
      });

      questions.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
      return questions;
    }
  );
}

// Global handler for MCQ option clicks
window.qvHandleMcqClick = function (btn, correctOption, explanationId) {
  // If already answered (disabled), do nothing
  if (btn.disabled) return;

  const container = btn.closest(".question-options");
  const buttons = container.querySelectorAll(".question-option-btn");
  const selectedOption = btn.dataset.option;

  // Disable all buttons in this question
  buttons.forEach((b) => (b.disabled = true));

  if (selectedOption === correctOption) {
    // Correct
    btn.classList.add("correct");
  } else {
    // Wrong
    btn.classList.add("wrong");
    // Highlight the correct one
    buttons.forEach((b) => {
      if (b.dataset.option === correctOption) {
        b.classList.add("correct");
      }
    });
  }

  // Show explanation if it exists
  const expEl = document.getElementById(explanationId);
  if (expEl) expEl.style.display = "block";
};

function renderMcqQuestion(q, index) {
  const qIndex = index + 1;
  const options = q.options || [];
  const correctOption = esc(q.answer || "");
  const expId = `q_exp_${q.id}`;

  let optionsHtml = "";
  options.forEach((opt) => {
    const escapedOpt = esc(opt);
    optionsHtml += `<button type="button" class="question-option-btn" data-option="${escapedOpt}" onclick="qvHandleMcqClick(this, '${correctOption}', '${expId}')">${escapedOpt}</button>`;
  });

  const expHtml = q.explanation
    ? `<div id="${expId}" class="question-explanation" style="display:none;"><strong>💡 توضيح:</strong> ${esc(q.explanation)}</div>`
    : "";

  return `
        <div class="question-card">
            <h3 class="question-text"><span style="color:var(--subject-accent); margin-left:8px;">س${qIndex}.</span> ${esc(q.question)}</h3>
            <div class="question-options">
                ${optionsHtml}
            </div>
            ${expHtml}
        </div>
    `;
}

// Global handler for short-answer reveal
window.qvToggleShortAnswer = function (btn, answerId) {
  const answerEl = document.getElementById(answerId);
  if (!answerEl) return;

  if (answerEl.style.display === "none") {
    answerEl.style.display = "block";
    btn.textContent = "إخفاء الإجابة";
  } else {
    answerEl.style.display = "none";
    btn.textContent = "إظهار الإجابة";
  }
};

function renderShortQuestion(q, index) {
  const qIndex = index + 1;
  const ansId = `q_ans_${q.id}`;
  const answerContent = esc(q.answer || "");
  const expHtml = q.explanation
    ? `<div class="question-explanation" style="margin-top:10px;"><strong>💡 توضيح:</strong> ${esc(q.explanation)}</div>`
    : "";

  return `
        <div class="question-card">
            <h3 class="question-text"><span style="color:var(--subject-accent); margin-left:8px;">س${qIndex}.</span> ${esc(q.question)}</h3>
            <button type="button" class="question-reveal-btn" onclick="qvToggleShortAnswer(this, '${ansId}')">إظهار الإجابة</button>
            <div id="${ansId}" class="question-answer-block" style="display:none; margin-top:1rem; padding-top:1rem; border-top:1px solid rgba(255,255,255,0.1);">
                <div class="question-answer-text" style="color:#f8fafc; font-weight:600;">${answerContent}</div>
                ${expHtml}
            </div>
        </div>
    `;
}

async function initQuestionsViewer(subjectId, db) {
  const section = document.getElementById("questionsSection");
  const listContainer = document.getElementById("questionsList");

  if (!section || !listContainer) return false;

  const questions = await fetchQuestions(subjectId, db);

  if (!questions || questions.length === 0) {
    return false;
  }

  let html = "";
  questions.forEach((q, index) => {
    if (q.type === "mcq") {
      html += renderMcqQuestion(q, index);
    } else if (q.type === "short") {
      html += renderShortQuestion(q, index);
    }
  });

  listContainer.innerHTML = html;
  return true;
}

export { initQuestionsViewer };
