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
    const aMatch = a.match(/5\.(\d+)([a-d])?/);
    const bMatch = b.match(/5\.(\d+)([a-d])?/);

    if (!aMatch || !bMatch) return 0;

    const aNum = parseInt(aMatch[1]);
    const bNum = parseInt(bMatch[1]);

    // Compare numbers first
    if (aNum !== bNum) return aNum - bNum;

    // If numbers are equal, compare letters (a < b < c < d)
    const aLetter = aMatch[2] || '';  // Empty string if no letter
    const bLetter = bMatch[2] || '';

    return aLetter.localeCompare(bLetter);
}

// Sort table rows
function sortTable(table, column, direction = 'asc') {
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));

    // Sort the array of rows
    rows.sort((a, b) => {
        let comparison = 0;
        const aData = a.children[column].textContent.trim();
        const bData = b.children[column].textContent.trim();

        switch(column) {
            case 1: // Grade column
                comparison = compareGrades(aData, bData);
                break;

            case 2: // Difficulty column (dots)
                const aDots = aData.length;
                const bDots = bData.length;
                comparison = aDots - bDots;
                break;

            case 3: // Status column
                // Sort "Sent" above "Tried"
                comparison = (bData === "Sent") - (aData === "Sent");
                break;

            case 4: // Points column
                const aPoints = parseInt(aData);
                const bPoints = parseInt(bData);
                comparison = aPoints - bPoints;
                break;

            case 0: // Color column - custom sorting order
                const colorOrder = ['White', 'Pink', 'Bright Blue', 'Black', 'Orange', 'Purple', 'Green', 'Red', 'Yellow', 'Teal'];
                const aIndex = colorOrder.indexOf(aData);
                const bIndex = colorOrder.indexOf(bData);
                comparison = aIndex - bIndex;
                break;
            default:
                comparison = aData.localeCompare(bData);
        }

        return direction === 'asc' ? comparison : -comparison;
    });

    // Remove existing rows
    rows.forEach(row => tbody.removeChild(row));

    // Add sorted rows
    rows.forEach(row => tbody.appendChild(row));

    // Update total points after sorting
    updateTotalPoints();

    // Update sort indicators
    const headers = table.querySelectorAll('th.sortable');
    headers.forEach((header, index) => {
        // Remove sort classes from all headers except the current one
        if (index !== column) {
            header.classList.remove('sort-asc', 'sort-desc');
        }
    });

    // Update the current header's sort direction
    const currentHeader = headers[column];
    currentHeader.classList.remove('sort-asc', 'sort-desc');
    currentHeader.classList.add(`sort-${direction}`);
}

// Update total points
function updateTotalPoints() {
    const points = Array.from(document.querySelectorAll('.climb-points'))
        .map(td => parseInt(td.textContent))
        .reduce((sum, points) => sum + (isNaN(points) ? 0 : points), 0);

    const totalPointsElement = document.getElementById('totalPoints');
    if (totalPointsElement) {
        totalPointsElement.textContent = points;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize total points
    updateTotalPoints();

    // Table sorting
    document.querySelectorAll('.sortable').forEach(header => {
        header.addEventListener('click', function() {
            const table = this.closest('table');
            const column = Array.from(this.parentElement.children).indexOf(this);

            // Determine sort direction
            let currentDirection = 'asc';
            if (this.classList.contains('sort-asc')) {
                currentDirection = 'desc';
            } else if (this.classList.contains('sort-desc')) {
                currentDirection = 'asc';
            }

            // Sort the table
            sortTable(table, column, currentDirection);
        });
    });
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
// This function definition is removed since we already have a more complete sortTable function above
