// Register service worker for PWA support
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/static/sw.js')
        .then(async (registration) => {
            console.log('ServiceWorker registered successfully');
            updateOnlineStatus();

            // Request periodic sync permission and register if available
            try {
                if ('periodicSync' in registration) {
                    const status = await navigator.permissions.query({
                        name: 'periodic-background-sync',
                    });

                    if (status.state === 'granted') {
                        console.log('Periodic sync can be registered');
                        // The actual registration is handled in the service worker
                    } else {
                        console.log('Periodic sync cannot be used, falling back to regular sync');
                    }
                }
            } catch (error) {
                console.log('Periodic sync not supported, falling back to regular sync');
            }
        })
        .catch(error => console.error('ServiceWorker registration failed:', error));
}

// Handle online/offline status with enhanced UI feedback
function updateOnlineStatus() {
    const status = navigator.onLine ? 'online' : 'offline';
    console.log('Connection status:', status);

    // Update UI to show connection status
    document.querySelectorAll('.connection-status').forEach(el => {
        el.textContent = status.toUpperCase();
        el.className = `connection-status badge ${status === 'online' ? 'bg-success' : 'bg-warning'}`;
    });

    // Add offline indicator to cached content
    if (!navigator.onLine) {
        document.querySelectorAll('.cached-content').forEach(el => {
            const timestamp = el.getAttribute('data-cache-time');
            if (timestamp) {
                const cacheTime = new Date(timestamp);
                const timeAgo = formatTimeAgo(cacheTime);
                el.querySelector('.cache-indicator')?.textContent = `Cached ${timeAgo}`;
            }
        });
    }
}

// Format time ago for cache indicators
function formatTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

// Initialize IndexedDB
const dbName = 'soloClimbDB';
const dbVersion = 1;

class IndexedDBManager {
    static async initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(dbName, dbVersion);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create stores for different data types
                if (!db.objectStoreNames.contains('climbs')) {
                    db.createObjectStore('climbs', { keyPath: 'id', autoIncrement: true });
                }
                if (!db.objectStoreNames.contains('sessions')) {
                    db.createObjectStore('sessions', { keyPath: 'id', autoIncrement: true });
                }
                if (!db.objectStoreNames.contains('profile')) {
                    db.createObjectStore('profile', { keyPath: 'username' });
                }
            };
        });
    }

    static async storeData(storeName, data) {
        const db = await this.initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    static async getData(storeName, key) {
        const db = await this.initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(key);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
}

// Enhanced form submission with offline support and validation
window.initializeFormSubmission = function(form, successCallback, validateCallback) {
    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Client-side validation
        if (validateCallback && !validateCallback(new FormData(this))) {
            return;
        }

        const formData = new FormData(this);
        const csrfToken = document.querySelector('input[name="csrf_token"]').value;

        try {
            if (!navigator.onLine) {
                // Store form data in IndexedDB for later submission
                await IndexedDBManager.storeData('pending-forms', {
                    url: this.action,
                    method: 'POST',
                    data: Object.fromEntries(formData),
                    timestamp: new Date().toISOString()
                });

                showMessage('Form saved for later submission', 'info');

                // Register for background sync
                if ('serviceWorker' in navigator && 'SyncManager' in window) {
                    const sw = await navigator.serviceWorker.ready;
                    await sw.sync.register('sync-forms');
                }

                if (successCallback) {
                    successCallback({ offline: true });
                }
                return;
            }

            const response = await fetch(this.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-Token': csrfToken
                },
                credentials: 'same-origin'
            });

            if (!response.ok) {
                throw new Error('Form submission failed');
            }

            const isFromCache = response.headers.get('X-Data-Source') === 'cache';
            if (isFromCache) {
                showMessage('Using cached data', 'info');
            }

            // Store successful response in IndexedDB
            const responseData = await response.json();
            await IndexedDBManager.storeData('responses', {
                url: this.action,
                data: responseData,
                timestamp: new Date().toISOString()
            });

            if (successCallback) {
                successCallback(responseData);
            }
        } catch (error) {
            console.error('Form submission error:', error);
            handleOfflineError(error, this.action, formData);
        }
    });
};

// Enhanced offline error handling
async function handleOfflineError(error, actionUrl, formData) {
    if (!navigator.onLine) {
        try {
            // Store failed request for retry
            await IndexedDBManager.storeData('failed-requests', {
                url: actionUrl,
                data: Object.fromEntries(formData),
                timestamp: new Date().toISOString(),
                error: error.message
            });

            showMessage('Data saved for later submission', 'warning');

            // Register for background sync
            if ('serviceWorker' in navigator && 'SyncManager' in window) {
                const sw = await navigator.serviceWorker.ready;
                await sw.sync.register('sync-failed-requests');
            }
        } catch (storageError) {
            console.error('Failed to store offline data:', storageError);
            showMessage('Failed to save offline data', 'error');
        }
    } else {
        showMessage('Connection error. Please try again.', 'error');
    }
}

// UI messages using the consolidated message system
function showMessage(messageKey, type = 'info') {
    const message = document.createElement('div');
    message.className = `alert alert-${type} position-fixed bottom-0 end-0 m-3`;
    message.textContent = messageKey;
    document.body.appendChild(message);
    setTimeout(() => message.remove(), 3000);
}

// Global utility functions
window.formatDate = function(date) {
    return new Date(date).toLocaleDateString();
};

// Initialize UI components when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add connection status indicator to navbar
    const navbar = document.querySelector('.navbar-nav');
    if (navbar) {
        const statusIndicator = document.createElement('li');
        statusIndicator.className = 'nav-item ms-2';
        statusIndicator.innerHTML = '<span class="connection-status badge">ONLINE</span>';
        navbar.appendChild(statusIndicator);
    }

    // Initialize swipe navigation
    const content = document.querySelector('.container');
    if (content) {
        const hammer = new Hammer(content);
        hammer.on('swipeleft swiperight', function(e) {
            const navLinks = Array.from(document.querySelectorAll('.navbar-nav .nav-link'));
            const currentIndex = navLinks.findIndex(link => link.classList.contains('active'));

            if (currentIndex === -1) return;

            let nextIndex;
            if (e.type === 'swipeleft') {
                nextIndex = Math.min(currentIndex + 1, navLinks.length - 1);
            } else {
                nextIndex = Math.max(currentIndex - 1, 0);
            }

            if (nextIndex !== currentIndex) {
                navLinks[nextIndex].click();
            }
        });
    }

    // Initial online status check
    updateOnlineStatus();
    IndexedDBManager.initDB().catch(console.error);
});