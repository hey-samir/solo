/**
 * Points calculation system for climbing routes
 * 
 * Database-driven points system:
 * - Points and tried_points are stored directly in the database
 * - Base points range from 100 to 390 (10x the original system)
 * - Tried points are typically 50% of send points
 */

function calculatePoints(grade, stars, isSent, tries) {
    return isSent ? parseInt(grade.dataset.points) : parseInt(grade.dataset.triedPoints);
}

// Update points for climb cells
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.climb-points').forEach(cell => {
        try {
            const grade = cell;  // We use the cell itself since it has the data attributes
            const status = cell.dataset.status === 'true';
            const points = calculatePoints(grade, null, status, null);
            cell.textContent = points;
        } catch (error) {
            console.error('Error calculating points:', error);
            cell.textContent = '0';
        }
    });
});