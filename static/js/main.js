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

// Compare grades for sorting
function compareGrades(a, b) {
    // Extract numeric part and letter modifier
    const aMatch = a.match(/(\d+)([a-d])?/);
    const bMatch = b.match(/(\d+)([a-d])?/);

    if (!aMatch || !bMatch) return 0;

    const aNum = parseInt(aMatch[1]);
    const bNum = parseInt(bMatch[1]);

    if (aNum !== bNum) return aNum - bNum;

    // If numbers are equal, compare letters
    const aLetter = aMatch[2] || 'z';  // Use 'z' if no letter
    const bLetter = bMatch[2] || 'z';

    return aLetter.localeCompare(bLetter);
}

// Sort table rows
function sortTable(table, column, direction = 'asc') {
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));

    // Sort the array of rows
    rows.sort((a, b) => {
        let comparison = 0;
        const aData = a.children[column];
        const bData = b.children[column];

        switch(column) {
            case 1: // Grade column
                const aGrade = a.dataset.grade;
                const bGrade = b.dataset.grade;
                comparison = compareGrades(aGrade, bGrade);
                break;

            case 2: // Difficulty column
                const aDiff = parseInt(a.dataset.difficulty);
                const bDiff = parseInt(b.dataset.difficulty);
                comparison = aDiff - bDiff;
                break;

            case 3: // Status column
                // Sort "Sent" above "Tried"
                comparison = (bData.textContent === "Sent") - (aData.textContent === "Sent");
                break;

            case 4: // Points column
                const aPoints = parseInt(a.dataset.points);
                const bPoints = parseInt(b.dataset.points);
                comparison = aPoints - bPoints;
                break;

            default: // Color or default case
                comparison = aData.textContent.trim().localeCompare(bData.textContent.trim());
        }

        return direction === 'asc' ? comparison : -comparison;
    });

    // Remove existing rows
    rows.forEach(row => tbody.removeChild(row));

    // Add sorted rows
    rows.forEach(row => tbody.appendChild(row));

    // Update total points after sorting
    updateTotalPoints();
}

// Update total points
function updateTotalPoints() {
    const points = Array.from(document.querySelectorAll('.climb-points'))
        .map(td => parseInt(td.textContent))
        .reduce((sum, points) => sum + points, 0);

    const totalPointsElement = document.getElementById('totalPoints');
    if (totalPointsElement) {
        totalPointsElement.textContent = points;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize total points
    updateTotalPoints();

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

            // Remove active sort from all headers in the same table
            table.querySelectorAll('.sortable').forEach(h => {
                h.classList.remove('sort-asc', 'sort-desc');
            });

            // Toggle sort direction
            const currentDirection = this.dataset.direction || 'asc';
            const newDirection = currentDirection === 'asc' ? 'desc' : 'asc';

            // Update header state
            this.dataset.direction = newDirection;
            this.classList.add(`sort-${newDirection}`);

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
// Auto-expand textarea
document.addEventListener('DOMContentLoaded', function() {
    const textarea = document.querySelector('textarea[name="notes"]');
    if (textarea) {
        textarea.addEventListener('input', function() {
            this.style.height = '38px';
            this.style.height = (this.scrollHeight) + 'px';
        });
    }
});
