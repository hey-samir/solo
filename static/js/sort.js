
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
// Points calculation system
function getGradePoints(grade) {
    if (!grade) return 0;
    const [_, mainGrade, subGrade] = grade.match(/5\.(\d+)([a-d])?/) || [null, '0', ''];
    
    const basePoints = {
        '5': 50, '6': 60, '7': 70, '8': 80, '9': 100, '10': 150,
        '11': 200, '12': 300, '13': 400, '14': 500, '15': 600
    };
    
    const subGradeMultiplier = {
        'a': 1, 'b': 1.1, 'c': 1.2, 'd': 1.3
    };

    return Math.round((basePoints[mainGrade] || 0) * (subGradeMultiplier[subGrade] || 1));
}

// Calculate points for a climb
function calculatePoints(grade, stars, isSent, tries) {
    const basePoints = getGradePoints(grade);
    const starMultiplier = Math.max(0.1, stars / 3);
    const statusMultiplier = isSent ? 1 : 0.5;
    const triesMultiplier = Math.max(0.1, 1 / Math.sqrt(tries));

    return Math.round(basePoints * starMultiplier * statusMultiplier * triesMultiplier);
}

// Update all point cells
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.climb-points').forEach(cell => {
        const grade = cell.dataset.grade;
        const rating = parseInt(cell.dataset.rating);
        const status = JSON.parse(cell.dataset.status);
        const tries = parseInt(cell.dataset.tries);
        
        const points = calculatePoints(grade, rating, status, tries);
        cell.textContent = points;
    });
});
