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

// Sort table rows
function sortTable(table, column, direction = 'asc') {
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));

    // Sort the array of rows
    rows.sort((a, b) => {
        const aCol = a.children[column].textContent.trim();
        const bCol = b.children[column].textContent.trim();

        // Handle grade sorting (e.g., "5.10a" vs "5.9")
        if (column === 1) { // Grade column
            const aGrade = parseFloat(aCol.split('.')[1]);
            const bGrade = parseFloat(bCol.split('.')[1]);
            return direction === 'asc' ? aGrade - bGrade : bGrade - aGrade;
        }

        // Handle difficulty sorting (dots)
        if (column === 2) { // Difficulty column
            return direction === 'asc' 
                ? aCol.length - bCol.length 
                : bCol.length - aCol.length;
        }

        // Default string comparison
        return direction === 'asc' 
            ? aCol.localeCompare(bCol) 
            : bCol.localeCompare(aCol);
    });

    // Remove existing rows
    rows.forEach(row => tbody.removeChild(row));

    // Add sorted rows
    rows.forEach(row => tbody.appendChild(row));
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

    // Table sorting
    document.querySelectorAll('.sortable').forEach(header => {
        header.addEventListener('click', function() {
            const table = this.closest('table');
            const column = Array.from(this.parentElement.children).indexOf(this);

            // Toggle sort direction
            const currentDirection = this.dataset.direction || 'asc';
            const newDirection = currentDirection === 'asc' ? 'desc' : 'asc';

            // Update header state
            document.querySelectorAll('.sortable').forEach(h => {
                h.dataset.direction = '';
                h.classList.remove('sorted-asc', 'sorted-desc');
            });

            this.dataset.direction = newDirection;
            this.classList.add(`sorted-${newDirection}`);

            // Sort the table
            sortTable(table, column, newDirection);
        });
    });

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
                    let value = text.textContent;
                    if (input.name === 'username') {
                        value = value.replace('@', '');
                    }
                    input.classList.remove('d-none');
                    input.value = value;
                    text.style.display = 'none';
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
                const text = field.querySelector('.profile-text');
                if (input && text) {
                    input.classList.add('d-none');
                    text.style.display = 'block';
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