// Filter climbs based on status
function filterClimbs(status) {
    const items = document.querySelectorAll('.climb-item');
    items.forEach(item => {
        if (status === 'all' || item.dataset.status === status) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// Rating button behavior
document.addEventListener('DOMContentLoaded', function() {
    const ratingInputs = document.querySelectorAll('input[name="rating"]');
    const ratingLabels = document.querySelectorAll('.rating-btn');

    ratingInputs.forEach(input => {
        input.addEventListener('change', function() {
            const selectedValue = parseInt(this.value);
            ratingLabels.forEach((label, index) => {
                if (index < selectedValue) {
                    label.classList.add('active');
                } else {
                    label.classList.remove('active');
                }
            });
        });
    });
});

// Form validation
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('climbForm');
    if (form) {
        form.addEventListener('submit', function(event) {
            const difficultyInput = form.querySelector('input[name="difficulty"]');
            const difficultyPattern = /^5\.(1[0-5]|[1-9])[abcd]?$/;

            if (!difficultyPattern.test(difficultyInput.value)) {
                event.preventDefault();
                alert('Please enter a valid difficulty format (e.g., 5.10a)');
            }
        });
    }

    // Profile edit functionality
    const editToggle = document.querySelector('.edit-toggle');
    const cancelEdit = document.querySelector('.cancel-edit');
    const editModeButtons = document.querySelector('.edit-mode-buttons');
    const saveModeButtons = document.querySelector('.save-mode-buttons');
    const editableFields = document.querySelectorAll('[data-editable]');

    if (editToggle) {
        editToggle.addEventListener('click', function() {
            editableFields.forEach(field => field.classList.add('editing'));
            editModeButtons.classList.add('d-none');
            saveModeButtons.classList.remove('d-none');
        });
    }

    if (cancelEdit) {
        cancelEdit.addEventListener('click', function() {
            editableFields.forEach(field => {
                field.classList.remove('editing');
                const input = field.querySelector('input');
                if (input) {
                    input.value = input.defaultValue;
                }
            });
            editModeButtons.classList.remove('d-none');
            saveModeButtons.classList.add('d-none');
        });
    }

    // Photo upload handling
    const photoUpload = document.getElementById('photo-upload');
    const photoForm = document.getElementById('photo-form');

    if (photoUpload) {
        photoUpload.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const file = this.files[0];
                if (file.type.match('image.*')) {
                    photoForm.submit();
                } else {
                    alert('Please select an image file');
                }
            }
        });
    }
});

// Enable offline support using service workers
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/static/js/sw.js').then(registration => {
            console.log('ServiceWorker registration successful');
        }).catch(err => {
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}