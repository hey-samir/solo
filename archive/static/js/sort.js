document.addEventListener('DOMContentLoaded', function() {
    const tables = document.querySelectorAll('.table');
    
    tables.forEach(table => {
        const headers = table.querySelectorAll('th.sortable');
        headers.forEach(header => {
            header.addEventListener('click', function() {
                const sortKey = this.getAttribute('data-sort');
                const tbody = table.querySelector('tbody');
                const rows = Array.from(tbody.querySelectorAll('tr'));
                
                // Toggle sort direction
                const isAsc = !this.classList.contains('sort-asc');
                
                // Remove sort classes from all headers
                headers.forEach(h => {
                    h.classList.remove('sort-asc', 'sort-desc');
                });
                
                // Add appropriate sort class
                this.classList.add(isAsc ? 'sort-asc' : 'sort-desc');
                
                // Sort rows
                rows.sort((a, b) => {
                    let aVal = a.querySelector(`td:nth-child(${Array.from(headers).indexOf(header) + 1})`).textContent;
                    let bVal = b.querySelector(`td:nth-child(${Array.from(headers).indexOf(header) + 1})`).textContent;
                    
                    if (sortKey === 'grade' || sortKey === 'tries' || sortKey === 'points') {
                        aVal = parseFloat(aVal) || 0;
                        bVal = parseFloat(bVal) || 0;
                    }
                    
                    if (aVal < bVal) return isAsc ? -1 : 1;
                    if (aVal > bVal) return isAsc ? 1 : -1;
                    return 0;
                });
                
                // Reinsert rows in new order
                rows.forEach(row => tbody.appendChild(row));
            });
        });
    });
});
/**
 * Average Grade Calculation Methodology:
 * 1. Convert each grade to points using the Australian grading system
 * 2. Sum all points
 * 3. Divide by number of routes to get average points
 * 4. Round to nearest point value in table
 * 5. Convert point value back to grade
 * 
 * Example:
 * Given: 5.4 (130pts), 5.10a (190pts), 5.13a (310pts)
 * Sum = 630 points
 * Average = 630 ÷ 3 = 210 points
 * Closest grade = 5.11c/d (220 points)
 */

function getGradePoints(grade) {
    if (!grade) return 0;
    const [_, mainGrade, subGrade] = grade.match(/5\.(\d+)([a-d])?/) || [null, '0', ''];

    const basePoints = {
        '1': 100, '2': 110, '3': 120, '4': 130, '5': 140,  // Australian grades 10-14 * 10
        '6': 150, '7': 160, '8': 170, '9': 180, '10': 190, // Australian grades 15-19 * 10
        '11': 220, '12': 270, '13': 310, '14': 350, '15': 390 // Australian grades 22-39 * 10
    };

    const subGradeMultiplier = {
        'a': 1, 'b': 1.1, 'c': 1.2, 'd': 1.3
    };

    return Math.round((basePoints[mainGrade] || 0) * (subGradeMultiplier[subGrade] || 1));
}

// Calculate points for a climb - matching backend calculation
function calculatePoints(grade, stars, isSent, tries) {
    const basePoints = getGradePoints(grade);
    const starMultiplier = Math.max(0.1, stars / 3);
    const statusMultiplier = isSent ? 1 : 0.5;  // Half points for attempts
    const triesMultiplier = Math.max(0.1, 1 / Math.sqrt(tries));

    return Math.round(basePoints * starMultiplier * statusMultiplier * triesMultiplier);
}

// Update all point cells
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.climb-points').forEach(cell => {
        try {
            const grade = cell.dataset.grade;
            const rating = parseInt(cell.dataset.rating) || 3;
            const status = cell.dataset.status === 'true';
            const tries = parseInt(cell.dataset.tries) || 1;

            const points = calculatePoints(grade, rating, status, tries);
            cell.textContent = points;
        } catch (error) {
            console.error('Error calculating points:', error);
            cell.textContent = '0';
        }
    });
});