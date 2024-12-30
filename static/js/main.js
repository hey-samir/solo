
// Calculate points preview
function calculatePoints() {
    // Only calculate points if we're on the sends page
    const pointsPreview = document.getElementById('pointsPreview');
    if (!pointsPreview) return;

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
        points = gradePoints[fullGrade];
        if (!status) {
            points = points / 2;
        }
    }
    
    document.getElementById('pointsPreview').textContent = Math.round(points);
}

function updateTotalPoints() {
    const points = Array.from(document.querySelectorAll('.climb-points'))
        .map(td => parseInt(td.textContent))
        .reduce((sum, points) => sum + (isNaN(points) ? 0 : points), 0);

    const totalPointsElement = document.getElementById('totalPoints');
    if (totalPointsElement) {
        totalPointsElement.textContent = points;
    }
}

function sortTable(table, column, direction) {
    const rows = Array.from(table.querySelectorAll('tbody tr'));
    const multiplier = direction === 'asc' ? 1 : -1;

    rows.sort((a, b) => {
        const aValue = a.children[column].textContent.trim();
        const bValue = b.children[column].textContent.trim();
        return aValue.localeCompare(bValue, undefined, {numeric: true}) * multiplier;
    });

    const tbody = table.querySelector('tbody');
    tbody.append(...rows);
}

// Initialize all components when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize tries slider
    const triesInput = document.querySelector('input[name="tries"]');
    if (triesInput) {
        const triesSlider = new Slider(triesInput, {
            tooltip: false,
            max: 10
        });
        
        const counter = document.getElementById('triesCounter');
        triesSlider.on('slide', function(value) {
            counter.textContent = value;
        });
    }

    // Initialize total points
    updateTotalPoints();

    // Initialize point calculation listeners
    ['caliber_grade', 'caliber_letter'].forEach(name => {
        const element = document.querySelector(`select[name="${name}"]`);
        if (element) {
            element.addEventListener('change', calculatePoints);
        }
    });

    // Initialize status toggle listener
    const statusToggle = document.getElementById('statusToggle');
    if (statusToggle) {
        statusToggle.addEventListener('change', calculatePoints);
    }

    // Initialize rating listeners
    document.querySelectorAll('input[name="rating"]').forEach(input => {
        input.addEventListener('change', calculatePoints);
    });

    // Initialize table sorting
    document.querySelectorAll('.sortable').forEach(header => {
        header.addEventListener('click', function() {
            const table = this.closest('table');
            const column = Array.from(this.parentElement.children).indexOf(this);
            const currentDirection = this.classList.contains('sort-asc') ? 'desc' : 'asc';
            
            this.closest('tr').querySelectorAll('.sortable').forEach(th => {
                th.classList.remove('sort-asc', 'sort-desc');
            });
            
            this.classList.add(`sort-${currentDirection}`);
            sortTable(table, column, currentDirection);
        });
    });

    // Initial calculation
    calculatePoints();
});
