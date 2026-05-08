// ============================================
// ERROR HANDLER UTILITY MODULE
// Provides global error handling, user feedback, and retry logic
// ============================================

// Track if handlers are already initialized
let handlersInitialized = false;

// ============================================
// GLOBAL ERROR HANDLERS
// ============================================

function initGlobalErrorHandlers() {
    if (handlersInitialized) return;
    handlersInitialized = true;

    // Catch unhandled errors - log only, don't show popup for general errors
    window.onerror = function(message, source, lineno, colno, error) {
        // Just log to console, don't show popup for general JS errors
        // This avoids false positives from minor script issues
        console.error('Global Error:', { message, source, lineno, colno, error });
        return true; // Prevent default browser error handling
    };

    // Catch unhandled promise rejections
    window.onunhandledrejection = function(event) {
        console.error('Unhandled Promise Rejection:', event.reason);
        
        // Only show popup for network/API errors that actually affect the user
        const errorMsg = event.reason?.message || '';
        if (errorMsg.includes('Failed to fetch') || 
            errorMsg.includes('NetworkError') ||
            errorMsg.includes('net::ERR')) {
            showError('خطأ في الاتصال بالإنترنت. تحقق من اتصالك.');
        }
        event.preventDefault();
    };

    console.log('✅ Global error handlers initialized');
}

// ============================================
// USER FEEDBACK FUNCTIONS
// ============================================

/**
 * Show error message to user
 * @param {string} message - Error message to display
 * @param {number} duration - How long to show (ms), default 5000
 */
function showError(message, duration = 5000) {
    // Remove existing error popups
    document.querySelectorAll('.error-popup').forEach(el => el.remove());

    const popup = document.createElement('div');
    popup.className = 'error-popup';
    popup.innerHTML = `
        <div class="error-content">
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
            <button class="error-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
        </div>
    `;
    document.body.appendChild(popup);

    // Animate in
    requestAnimationFrame(() => popup.classList.add('show'));

    // Auto remove
    setTimeout(() => {
        popup.classList.remove('show');
        setTimeout(() => popup.remove(), 300);
    }, duration);
}

/**
 * Show success message to user
 * @param {string} message - Success message to display
 */
function showSuccess(message) {
    // Use existing showNotification if available, otherwise create
    if (typeof showNotification === 'function') {
        showNotification(message);
    } else {
        const popup = document.createElement('div');
        popup.className = 'success-popup';
        popup.innerHTML = `
            <div class="success-content">
                <i class="fas fa-check-circle"></i>
                <span>${message}</span>
            </div>
        `;
        document.body.appendChild(popup);
        requestAnimationFrame(() => popup.classList.add('show'));
        setTimeout(() => {
            popup.classList.remove('show');
            setTimeout(() => popup.remove(), 300);
        }, 3000);
    }
}

/**
 * Show loading spinner in an element
 * @param {HTMLElement|string} target - Element or selector
 * @param {string} message - Loading message
 */
function showLoading(target, message = 'جاري التحميل...') {
    const element = typeof target === 'string' ? document.querySelector(target) : target;
    if (!element) return;

    element.dataset.originalContent = element.innerHTML;
    element.innerHTML = `
        <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
            <span>${message}</span>
        </div>
    `;
    element.classList.add('is-loading');
}

/**
 * Hide loading spinner and restore content
 * @param {HTMLElement|string} target - Element or selector
 */
function hideLoading(target) {
    const element = typeof target === 'string' ? document.querySelector(target) : target;
    if (!element) return;

    if (element.dataset.originalContent) {
        element.innerHTML = element.dataset.originalContent;
        delete element.dataset.originalContent;
    }
    element.classList.remove('is-loading');
}

/**
 * Set button to loading state
 * @param {HTMLElement} button - Button element
 * @param {boolean} loading - Whether loading or not
 */
function setButtonLoading(button, loading) {
    if (!button) return;
    
    if (loading) {
        button.dataset.originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        button.disabled = true;
        button.classList.add('is-loading');
    } else {
        if (button.dataset.originalText) {
            button.innerHTML = button.dataset.originalText;
            delete button.dataset.originalText;
        }
        button.disabled = false;
        button.classList.remove('is-loading');
    }
}

// ============================================
// RETRY LOGIC
// ============================================

/**
 * Retry an async function with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {number} maxRetries - Maximum retry attempts
 * @param {number} baseDelay - Initial delay in ms
 * @returns {Promise} - Result of the function
 */
async function retryAsync(fn, maxRetries = 3, baseDelay = 1000) {
    let lastError;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            console.warn(`Attempt ${attempt + 1}/${maxRetries} failed:`, error.message);
            
            if (attempt < maxRetries - 1) {
                const delay = baseDelay * Math.pow(2, attempt);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    
    throw lastError;
}

/**
 * Safe wrapper for async functions with error handling
 * @param {Function} fn - Async function to wrap
 * @param {string} errorMessage - Message to show on error
 * @returns {Promise} - Result or null on error
 */
async function safeAsync(fn, errorMessage = 'حدث خطأ. حاول مرة أخرى.') {
    try {
        return await fn();
    } catch (error) {
        console.error('safeAsync error:', error);
        showError(errorMessage);
        return null;
    }
}

// ============================================
// NETWORK UTILITIES
// ============================================

/**
 * Check if user is online
 * @returns {boolean}
 */
function isOnline() {
    return navigator.onLine;
}

/**
 * Safe fetch with timeout and error handling
 * @param {string} url - URL to fetch
 * @param {object} options - Fetch options
 * @param {number} timeout - Timeout in ms
 * @returns {Promise<Response>}
 */
async function safeFetch(url, options = {}, timeout = 30000) {
    if (!isOnline()) {
        throw new Error('لا يوجد اتصال بالإنترنت');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response;
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('انتهت مهلة الطلب. حاول مرة أخرى.');
        }
        throw error;
    } finally {
        clearTimeout(timeoutId);
    }
}

// ============================================
// INJECT STYLES
// ============================================

const errorStyles = document.createElement('style');
errorStyles.textContent = `
    .error-popup, .success-popup {
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%) translateY(-100px);
        z-index: 99999;
        transition: transform 0.3s ease;
        max-width: 90%;
    }
    .error-popup.show, .success-popup.show {
        transform: translateX(-50%) translateY(0);
    }
    .error-content {
        background: linear-gradient(135deg, #ff6b6b, #ee5a5a);
        color: white;
        padding: 15px 25px;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(255, 107, 107, 0.4);
        display: flex;
        align-items: center;
        gap: 12px;
        font-family: 'Cairo', sans-serif;
    }
    .error-content i {
        font-size: 1.3rem;
    }
    .error-close {
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        margin-right: -10px;
        opacity: 0.8;
    }
    .error-close:hover {
        opacity: 1;
    }
    .success-content {
        background: linear-gradient(135deg, #38ef7d, #11998e);
        color: white;
        padding: 15px 25px;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(56, 239, 125, 0.3);
        display: flex;
        align-items: center;
        gap: 12px;
        font-family: 'Cairo', sans-serif;
    }
    .loading-spinner {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        padding: 20px;
        color: rgba(255,255,255,0.7);
    }
    .loading-spinner i {
        font-size: 1.5rem;
    }
    .is-loading {
        pointer-events: none;
        opacity: 0.7;
    }
`;
document.head.appendChild(errorStyles);

// Initialize on load
document.addEventListener('DOMContentLoaded', initGlobalErrorHandlers);

// Also try to init immediately if DOM already loaded
if (document.readyState !== 'loading') {
    initGlobalErrorHandlers();
}
