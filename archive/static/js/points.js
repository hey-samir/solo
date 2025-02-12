/**
 * Points calculation system for climbing routes
 * 
 * Database-driven points system:
 * - Points and tried_points are stored directly in the database
 * - Base points range from 100 to 390 (10x the original system)
 * - Tried points are typically 50% of send points
 * 
 * The only dynamic multiplier is the star rating:
 * - Star multiplier = stars/3 (minimum 0.1)
 * - 5 stars = 1.67x multiplier
 * - 3 stars = 1.0x multiplier
 * - 1 star = 0.33x multiplier
 */

function calculatePoints(grade, stars, isSent, tries) {
    const basePoints = isSent ? parseInt(grade.dataset.points) : parseInt(grade.dataset.triedPoints);
    const starMultiplier = Math.max(0.1, stars / 3);

    return Math.round(basePoints * starMultiplier);
}

// Update points for climb cells
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