/**
 * Scroll Module
 * Handles scroll behaviors, notifications, and smooth scrolling
 */

// Scroll state
let scrollGoingDown = true;

// ============================================
// SCROLL FUNCTIONS
// ============================================

/**
 * Toggle scroll direction (scroll to top or bottom)
 */
export function toggleScrollDirection() {
    if (scrollGoingDown) {
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
        });
    } else {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}

/**
 * Initialize scroll rocket direction updater
 */
export function initScrollRocket() {
    window.addEventListener('scroll', () => {
        const scrollRocket = document.getElementById('scrollRocket');
        if (!scrollRocket) return;

        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;

        if (scrollTop > scrollHeight / 2) {
            scrollRocket.classList.remove('going-down');
            scrollGoingDown = false;
        } else {
            scrollRocket.classList.add('going-down');
            scrollGoingDown = true;
        }
    });
}

/**
 * Initialize smooth scrolling for anchor links
 */
export function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/**
 * Initialize active section highlighting on scroll
 */
export function initActiveSectionHighlight() {
    window.addEventListener('scroll', () => {
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('.nav-links a');

        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.scrollY >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });
}

// ============================================
// NOTIFICATIONS
// ============================================

/**
 * Show a notification message
 * @param {string} message - Message to display
 */
export function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification-popup';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/**
 * Initialize file upload handler (for admin)
 */
export function initFileUploadHandler() {
    const uploadForm = document.getElementById('uploadQuestionsForm');
    if (!uploadForm) return;
    
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

/**
 * Inject notification CSS styles
 */
export function injectNotificationStyles() {
    const notificationStyle = document.createElement('style');
    notificationStyle.textContent = `
        .notification-popup {
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #38ef7d 0%, #11998e 100%);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(56, 239, 125, 0.3);
            z-index: 10000;
            transform: translateX(120%);
            transition: transform 0.3s ease;
        }
        .notification-popup.show {
            transform: translateX(0);
        }
        .notification-content {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .notification-content i {
            font-size: 1.2rem;
        }
    `;
    document.head.appendChild(notificationStyle);
}

// Make functions available globally
window.toggleScrollDirection = toggleScrollDirection;
window.showNotification = showNotification;
