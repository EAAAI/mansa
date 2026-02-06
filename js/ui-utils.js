// UI Utilities Module
// Handles scroll, mobile menu, notifications, smooth scrolling

let scrollGoingDown = true;

function toggleScrollDirection() {
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

function toggleMobileMenu() {
    const nav = document.querySelector('.nav-links');
    const mobileBtn = document.querySelector('.mobile-menu-toggle');
    if (nav) nav.classList.toggle('active');
    if (mobileBtn) mobileBtn.classList.toggle('active');
}

function showNotification(message) {
    const existing = document.querySelector('.notification-popup');
    if (existing) existing.remove();

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

// Smooth scrolling for anchor links
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

// Active section highlighting
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

// Notification styles (inject once)
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
