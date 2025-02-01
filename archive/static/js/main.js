// Register service worker for PWA support
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/static/sw.js')
        .then(registration => {
            console.log('ServiceWorker registered successfully');
            //updateOnlineStatus();

            // Set initial sync time if not set
            if (!localStorage.getItem('lastSyncTime')) {
                localStorage.setItem('lastSyncTime', new Date().toISOString());
            }
        })
        .catch(error => console.error('ServiceWorker registration failed:', error));
}

// Handle sync when back online
window.addEventListener('online', () => {
    triggerSync();
});


// Trigger sync when back online
async function triggerSync() {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
        const registration = await navigator.serviceWorker.ready;
        try {
            await registration.sync.register('sync-climbs');
            localStorage.setItem('lastSyncTime', new Date().toISOString());
            showMessage('Syncing your data...', 'info');
        } catch (error) {
            console.error('Sync registration failed:', error);
        }
    }
}



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

    static async getPendingClimbsCount() {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['pending-climbs'], 'readonly');
            const store = transaction.objectStore('pending-climbs');
            const countRequest = store.count();

            countRequest.onsuccess = () => resolve(countRequest.result);
            countRequest.onerror = () => reject(countRequest.error);
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

                // Update pending count in UI if element exists
                const pendingCount = await DBManager.getPendingClimbsCount();
                const syncStatus = document.getElementById('sync-status');
                if (syncStatus) {
                    syncStatus.textContent = `${pendingCount} items pending sync`;
                }

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

            localStorage.setItem('lastSyncTime', new Date().toISOString());
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
    // Add connection status indicator - REMOVED
    //const navbar = document.querySelector('.navbar-nav');
    //if (navbar) {
    //    const statusIndicator = document.createElement('li');
    //    statusIndicator.className = 'nav-item ms-2';
    //    statusIndicator.innerHTML = '<span class="connection-status badge">ONLINE</span>';
    //    navbar.appendChild(statusIndicator);
    //}

    // Handle navigation when offline
    if (!navigator.onLine) {
        document.addEventListener('click', function(e) {
            // Only handle links within our app
            if (e.target.tagName === 'A' && e.target.href.startsWith(window.location.origin)) {
                e.preventDefault();
                // Let the service worker handle the navigation
                window.location.href = e.target.href;
            }
        });
    }

    // Initial status check - REMOVED
    //updateOnlineStatus();
});