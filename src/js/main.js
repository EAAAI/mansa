/**
 * Main Entry Point - index.html
 * Imports and initializes all modules for the main site
 */

// Import modules
import { injectMainNavbar } from './utils/navbar.js';
import { loadSavedTheme, initThemeMenuHandler } from './utils/themes.js';
import { switchLeaderboardTab } from './utils/leaderboard.js';
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
    
    // Load default leaderboard tab if element exists
    if (document.getElementById('mainLeaderboardBody')) {
        switchLeaderboardTab('all');
    }
});

// Export for global access if needed
window.switchLeaderboardTab = switchLeaderboardTab;
