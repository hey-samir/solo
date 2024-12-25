// Filter climbs based on status
function filterClimbs(status) {
    const items = document.querySelectorAll('.climb-item');
    if (!items || items.length === 0) return;

    items.forEach(item => {
        if (!item || !item.dataset) return;
        if (status === 'all' || item.dataset.status === status) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    // Rating button behavior
    const ratingInputs = document.querySelectorAll('input[name="rating"]');
    const ratingLabels = document.querySelectorAll('.rating-btn');

    if (ratingInputs && ratingLabels) {
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
    }

    // Profile edit functionality
    const editToggle = document.querySelector('.edit-toggle');
    const cancelEdit = document.querySelector('.cancel-edit');
    const editModeButtons = document.querySelector('.edit-mode-buttons');
    const saveModeButtons = document.querySelector('.save-mode-buttons');
    const editableFields = document.querySelectorAll('[data-editable]');

    if (editToggle) {
        editToggle.addEventListener('click', function() {
            editableFields.forEach(field => {
                field.classList.add('editing');
                const input = field.querySelector('input');
                const text = field.querySelector('.profile-text');
                if (input && text) {
                    // Store current text value in input
                    input.value = text.textContent.replace('@', '');
                }
            });
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
                    input.value = input.defaultValue; // Reset to original value
                }
            });
            editModeButtons.classList.remove('d-none');
            saveModeButtons.classList.add('d-none');
        });
    }

    // Photo upload handling
    const photoUpload = document.getElementById('photo-upload');
    const photoForm = document.getElementById('photo-form');
    const csrfToken = document.querySelector('input[name="csrf_token"]')?.value;

    if (photoUpload && photoForm && csrfToken) {
        photoUpload.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const file = this.files[0];
                if (file.type.match('image.*')) {
                    // Ensure form has current CSRF token
                    const formToken = photoForm.querySelector('input[name="csrf_token"]');
                    if (formToken) {
                        formToken.value = csrfToken;
                    }
                    photoForm.submit();
                } else {
                    alert('Please select an image file');
                }
            }
        });
    }

    // Form validation
    const form = document.getElementById('climbForm');
    if (form) {
        form.addEventListener('submit', function(event) {
            const difficultyInput = form.querySelector('input[name="difficulty"]');
            if (!difficultyInput) return;

            const difficultyPattern = /^5\.(1[0-5]|[1-9])[abcd]?$/;
            if (!difficultyPattern.test(difficultyInput.value)) {
                event.preventDefault();
                alert('Please enter a valid difficulty format (e.g., 5.10a)');
            }
        });
    }
});