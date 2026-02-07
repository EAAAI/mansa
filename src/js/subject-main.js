/**
 * Subject Entry Point - subject.html
 * Imports and initializes modules for subject pages
 */

// Import modules
import { injectSubjectNavbar } from './utils/navbar.js';
import { loadSavedTheme, initThemeMenuHandler } from './utils/themes.js';
import { 
    initScrollRocket, 
    initSmoothScroll, 
    injectNotificationStyles 
} from './utils/scroll.js';

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Inject subject navbar
    injectSubjectNavbar();
    
    // Load saved theme
    loadSavedTheme();
    
    // Initialize theme menu handler
    initThemeMenuHandler();
    
    // Initialize scroll behaviors
    initScrollRocket();
    initSmoothScroll();
    
    // Inject notification styles
    injectNotificationStyles();
});
