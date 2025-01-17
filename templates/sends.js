document.addEventListener('DOMContentLoaded', function() {
    // Initialize all required elements
    const triesSlider = document.getElementById('triesSlider');
    const triesCounter = document.getElementById('triesCounter');
    const ratingStars = document.querySelectorAll('.rating-star');
    const ratingInput = document.getElementById('ratingInput');
    const pointsEstimate = document.getElementById('pointsEstimate');
    const statusToggle = document.getElementById('statusToggle');
    const routeSelect = document.querySelector('select[name="route_id"]');

    // Color to hex mapping
    const colorToHex = {
        'White': '#FFFFFF',
        'Pink': '#FF69B4',
        'Blue': '#0000FF',
        'Black': '#000000',
        'Orange': '#FFA500',
        'Purple': '#800080',
        'Green': '#008000',
        'Red': '#FF0000',
        'Yellow': '#FFFF00',
        'Teal': '#008080'
    };

    // Initialize star rating system
    if (ratingStars.length > 0) {
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

    // Add color indicators to route options
    if (routeSelect) {
        const options = routeSelect.querySelectorAll('option');
        options.forEach(option => {
            if (option.value) {  // Skip the placeholder option
                const color = option.dataset.color;
                const hexColor = colorToHex[color] || '#FFFFFF';
                const grade = option.dataset.grade;
                
                // Create the option content with color dot
                option.innerHTML = `
                    <div class="d-flex align-items-center">
                        <span class="color-dot me-2" style="background-color: ${hexColor};"></span>
                        ${color} ${grade}
                    </div>
                `;
            }
        });
    }

    function getGradePoints(grade) {
        // Extract numeric grade and letter
        const match = grade.match(/(\d+)\.(\d+)([a-d])?/);
        if (!match) return 0;

        const numericGrade = parseInt(match[1]);
        const letterGrade = match[3];

        const basePoints = {
            5: 50, 6: 60, 7: 70, 8: 80, 9: 100, 10: 150,
            11: 200, 12: 300, 13: 400, 14: 500, 15: 600
        };

        const letterMultiplier = {
            'a': 1, 'b': 1.1, 'c': 1.2, 'd': 1.3
        };

        const base = basePoints[numericGrade] || 0;
        return Math.round(base * (letterMultiplier[letterGrade] || 1));
    }

    function updatePointsEstimate() {
        try {
            // Get current values
            const selectedRoute = routeSelect?.selectedOptions[0];
            const grade = selectedRoute?.dataset.grade;
            const stars = parseInt(ratingInput?.value || 3);
            const isSent = statusToggle?.checked || false;
            const tries = parseInt(triesSlider?.value || 1);

            // Only calculate points if a route is selected
            if (!selectedRoute || !selectedRoute.value) {
                if (pointsEstimate) pointsEstimate.textContent = 'Points: 0';
                return;
            }

            const basePoints = getGradePoints(grade);
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

    // Add event listeners
    if (routeSelect) {
        routeSelect.addEventListener('change', updatePointsEstimate);
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
