// Register service worker for PWA support
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/static/sw.js')
        .then(() => console.log('ServiceWorker registered'));
}

// Global utility functions
window.formatDate = function(date) {
    return new Date(date).toLocaleDateString();
};

// Global form utilities
window.initializeFormSubmission = function(form, successCallback) {
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const csrfToken = document.querySelector('input[name="csrf_token"]').value;

        fetch(this.action, {
            method: 'POST',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-Token': csrfToken
            },
            credentials: 'same-origin'
        })
        .then(response => {
            if (!response.ok) throw new Error('Form submission failed');
            if (successCallback) successCallback(response);
        })
        .catch(error => {
            console.error('Form submission error:', error);
            alert('Failed to submit form. Please try again.');
        });
    });
};

document.addEventListener('DOMContentLoaded', function() {
    // Initialize any global UI elements or event listeners here
});