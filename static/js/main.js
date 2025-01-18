// Register service worker for PWA support
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/static/sw.js')
        .then(registration => {
            console.log('ServiceWorker registered successfully');
            updateOnlineStatus();
        })
        .catch(error => console.error('ServiceWorker registration failed:', error));
}

// Handle online/offline status
function updateOnlineStatus() {
    const status = navigator.onLine ? 'online' : 'offline';
    console.log('Connection status:', status);

    document.querySelectorAll('.connection-status').forEach(el => {
        el.textContent = status.toUpperCase();
        el.className = `connection-status badge ${status === 'online' ? 'bg-success' : 'bg-warning'}`;
    });
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

// Simple IndexedDB wrapper
class DBManager {
    static async openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('soloClimbDB', 1);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('pending-climbs')) {
                    db.createObjectStore('pending-climbs', { keyPath: 'id', autoIncrement: true });
                }
            };
        });
    }

    static async addPendingClimb(climbData) {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['pending-climbs'], 'readwrite');
            const store = transaction.objectStore('pending-climbs');
            const request = store.add(climbData);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
}

// Enhanced form submission with offline support
window.initializeFormSubmission = function(form, successCallback) {
    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const data = Object.fromEntries(formData);

        try {
            if (!navigator.onLine) {
                // Store climb data for later sync
                await DBManager.addPendingClimb(data);
                showMessage('Climb saved for later submission', 'info');

                // Request sync when back online
                if ('serviceWorker' in navigator && 'SyncManager' in window) {
                    const sw = await navigator.serviceWorker.ready;
                    await sw.sync.register('sync-climbs');
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
                    'X-CSRF-Token': document.querySelector('input[name="csrf_token"]').value
                }
            });

            if (!response.ok) {
                throw new Error('Form submission failed');
            }

            const responseData = await response.json();
            if (successCallback) {
                successCallback(responseData);
            }

            showMessage('Climb logged successfully', 'success');
        } catch (error) {
            console.error('Form submission error:', error);
            showMessage('Error submitting form', 'error');
        }
    });
};

// UI messages
function showMessage(message, type = 'info') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} position-fixed bottom-0 end-0 m-3`;
    alert.textContent = message;
    document.body.appendChild(alert);
    setTimeout(() => alert.remove(), 3000);
}

// Initialize UI on load
document.addEventListener('DOMContentLoaded', function() {
    // Add connection status indicator
    const navbar = document.querySelector('.navbar-nav');
    if (navbar) {
        const statusIndicator = document.createElement('li');
        statusIndicator.className = 'nav-item ms-2';
        statusIndicator.innerHTML = '<span class="connection-status badge">ONLINE</span>';
        navbar.appendChild(statusIndicator);
    }

    // Initial status check
    updateOnlineStatus();
});