// Register service worker for PWA support
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/static/sw.js')
        .then(() => {
            console.log('ServiceWorker registered successfully');
            // After registration, check connection status
            updateOnlineStatus();
        })
        .catch(error => console.error('ServiceWorker registration failed:', error));
}

// Handle online/offline status
function updateOnlineStatus() {
    const status = navigator.onLine ? 'online' : 'offline';
    console.log('Connection status:', status);
    if (!navigator.onLine) {
        // If offline, show the offline page
        window.location.href = '/offline.html';
    }
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

// Global utility functions
window.formatDate = function(date) {
    return new Date(date).toLocaleDateString();
};

// Global form utilities
window.initializeFormSubmission = function(form, successCallback) {
    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const csrfToken = document.querySelector('input[name="csrf_token"]').value;

        try {
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

            if (successCallback) {
                successCallback(response);
            }
        } catch (error) {
            console.error('Form submission error:', error);
            if (!navigator.onLine) {
                // If offline, queue the request for later
                if ('serviceWorker' in navigator && 'SyncManager' in window) {
                    try {
                        const sw = await navigator.serviceWorker.ready;
                        await sw.sync.register('sync-climbs');
                        alert('You are offline. Your changes will be saved and synced when you are back online.');
                    } catch (syncError) {
                        console.error('Failed to register sync:', syncError);
                        alert('Failed to queue offline changes. Please try again when online.');
                    }
                } else {
                    alert('Offline support is not available. Please try again when online.');
                }
            } else {
                alert('Failed to submit form. Please try again.');
            }
        }
    });
};

document.addEventListener('DOMContentLoaded', function() {
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
});