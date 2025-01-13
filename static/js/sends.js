document.addEventListener('DOMContentLoaded', function() {
    // Initialize all required elements
    const triesSlider = document.getElementById('triesSlider');
    const triesCounter = document.getElementById('triesCounter');
    const ratingContainer = document.querySelector('.rating');
    const ratingStars = document.querySelectorAll('.rating-star');
    const ratingInput = document.getElementById('ratingInput');
    const pointsEstimate = document.getElementById('pointsEstimate');
    const statusToggle = document.getElementById('statusToggle');
    const gradeSelect = document.querySelector('select[name="grade"]');
    const secondaryGradeSelect = document.querySelector('select[name="secondary_grade"]');
    const colorInputs = document.querySelectorAll('input[name="color"]');

    // Initialize star rating system
    if (ratingContainer && ratingStars.length > 0) {
        // Set initial rating
        const initialRating = parseInt(ratingInput.value) || 3;
        updateStars(initialRating);

        // Add click handlers to stars
        ratingStars.forEach((star, index) => {
            star.addEventListener('click', () => {
                const rating = index + 1;
                updateStars(rating);
                ratingInput.value = rating;
                updatePointsEstimate();
            });

            // Add hover effects
            star.addEventListener('mouseenter', () => {
                updateStars(index + 1, true);
            });

            star.addEventListener('mouseleave', () => {
                updateStars(parseInt(ratingInput.value) || 3);
            });
        });
    }

    // Function to update star appearance
    function updateStars(rating, isHover = false) {
        ratingStars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }

    // Initialize bootstrap slider
    if (triesSlider) {
        const slider = new Slider(triesSlider, {
            min: 1,
            max: 10,
            value: 1,
            step: 1,
            tooltip: 'hide'
        });

        slider.on('slide', function(value) {
            if (triesCounter) triesCounter.textContent = value;
            updatePointsEstimate();
        });

        // Ensure the initial value is set
        if (triesCounter) triesCounter.textContent = slider.getValue();
    }

    function getGradePoints(grade, subGrade) {
        const basePoints = {
            '5': 50, '6': 60, '7': 70, '8': 80, '9': 100, '10': 150,
            '11': 200, '12': 300, '13': 400, '14': 500, '15': 600
        };
        const subGradeMultiplier = {
            'a': 1, 'b': 1.1, 'c': 1.2, 'd': 1.3
        };

        return Math.round((basePoints[grade] || 0) * (subGradeMultiplier[subGrade] || 1));
    }

    function updatePointsEstimate() {
        try {
            // Get current values
            const selectedColor = document.querySelector('input[name="color"]:checked');
            const grade = gradeSelect?.value || '';
            const subGrade = secondaryGradeSelect?.value || '';
            const stars = parseInt(ratingInput?.value || 3);
            const isSent = statusToggle?.checked || false;
            const tries = parseInt(triesSlider?.value || 1);

            // Only calculate points if both color and grade are selected
            if (!selectedColor || !grade) {
                if (pointsEstimate) pointsEstimate.textContent = 'Points: 0';
                return;
            }

            const basePoints = getGradePoints(grade, subGrade);
            const starMultiplier = Math.max(0.1, stars / 3);
            const statusMultiplier = isSent ? 1 : 0.5;
            const triesMultiplier = Math.max(0.1, 1 / Math.sqrt(tries));

            const points = Math.round(basePoints * starMultiplier * statusMultiplier * triesMultiplier);

            if (pointsEstimate) {
                pointsEstimate.textContent = `Points: ${points}`;
            }
        } catch (error) {
            console.error('Error calculating points:', error);
            if (pointsEstimate) pointsEstimate.textContent = 'Points: 0';
        }
    }

    // Add event listeners for all form inputs
    colorInputs.forEach(input => {
        input.addEventListener('change', updatePointsEstimate);
    });

    if (gradeSelect) {
        gradeSelect.addEventListener('change', updatePointsEstimate);
    }

    if (secondaryGradeSelect) {
        secondaryGradeSelect.addEventListener('change', updatePointsEstimate);
    }

    if (statusToggle) {
        const statusButton = document.querySelector('button[type="submit"]');
        const statusLabel = document.getElementById('statusLabel');

        const updateStatusButton = () => {
            if (statusButton) {
                statusButton.textContent = statusToggle.checked ? 'Send' : 'Log';
            }
        };

        const updateLabelVisibility = () => {
            if (statusLabel) {
                statusLabel.textContent = statusToggle.checked ? 'Sent' : 'Attempted';
            }
        };

        // Set initial states
        updateStatusButton();
        updateLabelVisibility();

        // Update on change
        statusToggle.addEventListener('change', function() {
            updatePointsEstimate();
            updateStatusButton();
            updateLabelVisibility();
        });
    }

    // Initial points calculation
    updatePointsEstimate();
});