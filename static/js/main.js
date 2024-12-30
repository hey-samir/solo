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

            case 0: // Color column - sort by color dot background color
                const aColor = a.querySelector('.color-dot').style.backgroundColor;
                const bColor = b.querySelector('.color-dot').style.backgroundColor;
                comparison = aColor.localeCompare(bColor);
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
    // Initialize attempts slider
    var attemptsSlider = new Slider('input[name="attempts"]', {
        tooltip: 'always',
        tooltip_position: 'bottom',
        max: 10,
        formatter: function(value) {
            return value;
        }
    });
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

// Calculate points preview
function calculatePoints() {
    const gradePoints = {
        '5.0': 10, '5.1': 20, '5.2': 30, '5.3': 40, '5.4': 50,
        '5.5': 60, '5.6': 70, '5.7': 80, '5.8': 100, '5.9': 150,
        '5.10a': 200, '5.10b': 250, '5.10c': 300, '5.10d': 350,
        '5.11a': 400, '5.11b': 500, '5.11c': 600, '5.11d': 700,
        '5.12a': 800, '5.12b': 900, '5.12c': 1000, '5.12d': 1100,
        '5.13a': 1250, '5.13b': 1400, '5.13c': 1550, '5.13d': 1700,
        '5.14a': 2000, '5.14b': 2500, '5.14c': 3000, '5.14d': 3500,
        '5.15a': 4000, '5.15b': 5000, '5.15c': 6000, '5.15d': 7500
    };

    const gradeElement = document.querySelector('select[name="caliber_grade"]');
    const letterElement = document.querySelector('select[name="caliber_letter"]');
    const statusElement = document.getElementById('statusToggle');
    const ratingElements = document.querySelectorAll('input[name="rating"]');
    
    if (!gradeElement || !letterElement || !statusElement) return;
    
    const grade = gradeElement.value;
    const letter = letterElement.value;
    const rating = Array.from(ratingElements).find(el => el.checked)?.value || 3;
    const status = statusElement.checked;
    
    const fullGrade = grade ? `5.${grade}${letter}` : null;
    let points = 0;
    
    if (fullGrade && gradePoints[fullGrade]) {
        points = gradePoints[fullGrade] * (rating / 5);
        if (!status) {
            points = points / 2;
        }
    }
    
    document.getElementById('pointsPreview').textContent = Math.round(points);
}

// Add event listeners for point calculation
document.addEventListener('DOMContentLoaded', function() {
    // Initialize attempts slider
    var attemptsSlider = new Slider('input[name="attempts"]', {
        tooltip: 'always',
        tooltip_position: 'bottom',
        max: 10,
        formatter: function(value) {
            return value;
        }
    });
    ['caliber_grade', 'caliber_letter'].forEach(name => {
        document.querySelector(`select[name="${name}"]`)?.addEventListener('change', calculatePoints);
    });
    
    document.querySelectorAll('.rating-input').forEach(input => {
        input.addEventListener('change', calculatePoints);
    });
    
    document.getElementById('statusToggle')?.addEventListener('change', calculatePoints);
    
    // Initial calculation
    calculatePoints();
});

// Auto-expand textarea
document.addEventListener('DOMContentLoaded', function() {
    // Initialize attempts slider
    var attemptsSlider = new Slider('input[name="attempts"]', {
        tooltip: 'always',
        tooltip_position: 'bottom',
        max: 10,
        formatter: function(value) {
            return value;
        }
    });
    const textarea = document.querySelector('textarea[name="notes"]');
    if (textarea) {
        function adjustHeight() {
            textarea.style.height = '38px';
            textarea.style.height = (textarea.scrollHeight) + 'px';
        }
        textarea.addEventListener('input', adjustHeight);
        // Initial adjustment in case there's existing content
        adjustHeight();
    }
});