/**
 * Main Entry Point - index.html
 * Imports and initializes all modules for the main site
 */

// Import modules
import { injectMainNavbar } from './utils/navbar.js';
import { loadSavedTheme, initThemeMenuHandler } from './utils/themes.js';
import { 
    initScrollRocket, 
    initSmoothScroll, 
    initActiveSectionHighlight,
    initFileUploadHandler,
    injectNotificationStyles 
} from './utils/scroll.js';

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Inject navbar
    injectMainNavbar();
    
    // Load saved theme
    loadSavedTheme();
    
    // Initialize theme menu handler
    initThemeMenuHandler();
    
    // Initialize scroll behaviors
    initScrollRocket();
    initSmoothScroll();
    initActiveSectionHighlight();
    
    // Initialize file upload (for admin)
    initFileUploadHandler();
    
    // Inject notification styles
    injectNotificationStyles();
});

// ============================================
// GLOBAL ERROR BOUNDARY
// ============================================
window.addEventListener('error', (e) => {
    console.warn('ليالي الامتحان — caught error:', e.message);
    // منع الصفحة من الـ crash
    e.preventDefault();
});

window.addEventListener('unhandledrejection', (e) => {
    console.warn('ليالي الامتحان — unhandled promise:', e.reason);
    e.preventDefault();
});
