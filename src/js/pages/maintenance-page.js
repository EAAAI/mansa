/**
 * Page Entry - maintenance.html
 * Owns maintenance page runtime behavior extracted from inline scripts.
 */

const PAGE_ID = 'maintenance';
const PARTICLE_COUNT = 50;

function createParticleElement() {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.animationDelay = `${Math.random() * 15}s`;
    particle.style.animationDuration = `${10 + Math.random() * 10}s`;
    particle.style.width = `${2 + Math.random() * 4}px`;
    particle.style.height = `${2 + Math.random() * 4}px`;
    return particle;
}

function initParticles() {
    const container = document.getElementById('particlesContainer');
    if (!container) {
        return;
    }

    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
        container.appendChild(createParticleElement());
    }
}

function initAudioPlayback() {
    const audio = document.getElementById('constructionAudio');
    if (!audio) {
        return;
    }

    let audioStarted = false;
    audio.volume = 0.3;

    const markStarted = () => {
        audioStarted = true;
    };

    const markBlocked = () => {
        audioStarted = false;
    };

    const tryPlayAudio = () => {
        audio.play().then(markStarted).catch(markBlocked);
    };

    tryPlayAudio();

    document.addEventListener('click', () => {
        if (!audioStarted) {
            audio.play().then(markStarted).catch(markBlocked);
        }
    }, { once: false });
}

function initMaintenancePageEntry() {
    document.documentElement.setAttribute('data-page-entry', PAGE_ID);
    initParticles();
    initAudioPlayback();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMaintenancePageEntry);
} else {
    initMaintenancePageEntry();
}

export { initMaintenancePageEntry };
