// Main Script - Module Loader
// This is a lightweight entry point that loads all modular components
// All functionality has been split into separate modules for better maintainability

// Modules loaded via HTML:
// 1. js/firebase-config.js - Firebase & API configuration
// 2. js/user-profile.js - User profile management
// 3. js/themes.js - Theme switching
// 4. js/ai-chat.js - AI chatbot functionality
// 5. js/ui-utils.js - UI utilities (scroll, menu, notifications)

// File upload handler (small feature, kept here)
document.addEventListener('DOMContentLoaded', function() {
    const uploadForm = document.getElementById('uploadQuestionsForm');
    if (uploadForm) {
        uploadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const fileInput = document.getElementById('questionsFile');
            const status = document.getElementById('uploadStatus');
            if (!fileInput.files.length) {
                status.textContent = 'يرجى اختيار ملف.';
                status.style.color = 'red';
                return;
            }
            const file = fileInput.files[0];
            const reader = new FileReader();
            reader.onload = function(event) {
                try {
                    const questions = JSON.parse(event.target.result);
                    localStorage.setItem('uploadedQuestions', JSON.stringify(questions));
                    status.textContent = 'تم رفع الأسئلة بنجاح!';
                    status.style.color = 'green';
                } catch (err) {
                    status.textContent = 'ملف غير صالح!';
                    status.style.color = 'red';
                }
            };
            reader.readAsText(file);
        });
    }
});
