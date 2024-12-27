Chart.defaults.color = '#ffffff';
Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';

document.addEventListener('DOMContentLoaded', function() {
    // Fetch initial data with 'week' as default
    updateAllCharts('week');

    // Handle time range changes
    document.querySelectorAll('input[name="timeRange"]').forEach(radio => {
        radio.addEventListener('change', function() {
            updateAllCharts(this.value);
        });
    });
});

function updateAllCharts(timeRange) {
    // Add loading state
    console.log('Updating charts for time range:', timeRange);

    // Fetch new data based on time range
    fetch(`/api/stats?timeRange=${timeRange}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Received data:', data);
            updateGradeProgressionChart(data.progression);
            updateSessionFrequencyChart(data.frequency);
            updateSuccessRateChart(data.successRate);
            updateGradeDistributionChart(data.distribution);
        })
        .catch(error => console.error('Error updating charts:', error));
}

function updateGradeProgressionChart(data) {
    const ctx = document.getElementById('gradeProgressionChart');
    if (!ctx) return;

    let chart = Chart.getChart(ctx);
    if (chart) {
        chart.destroy();
    }

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Highest Grade',
                data: data.data,
                borderColor: '#410f70',
                tension: 0.4,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Grade'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    }
                }
            }
        }
    });
}

function updateSessionFrequencyChart(data) {
    const ctx = document.getElementById('sessionFrequencyChart');
    if (!ctx) return;

    let chart = Chart.getChart(ctx);
    if (chart) {
        chart.destroy();
    }

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Sessions',
                data: data.data,
                backgroundColor: '#410f70',
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Sessions'
                    }
                }
            }
        }
    });
}

function updateSuccessRateChart(data) {
    const ctx = document.getElementById('successRateChart');
    if (!ctx) return;

    let chart = Chart.getChart(ctx);
    if (chart) {
        chart.destroy();
    }

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Success Rate',
                data: data.data,
                backgroundColor: '#410f70',
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Success Rate (%)'
                    }
                }
            }
        }
    });
}

function updateGradeDistributionChart(data) {
    const ctx = document.getElementById('gradeDistributionChart');
    if (!ctx) return;

    let chart = Chart.getChart(ctx);
    if (chart) {
        chart.destroy();
    }

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Attempts',
                data: data.data,
                backgroundColor: '#410f70',
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Attempts'
                    }
                }
            }
        }
    });
}