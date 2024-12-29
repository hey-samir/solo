Chart.defaults.color = '#ffffff';
Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';

document.addEventListener('DOMContentLoaded', function() {
    // Wait for Bootstrap tab events
    const tabElements = document.querySelectorAll('button[data-bs-toggle="tab"]');
    tabElements.forEach(tab => {
        tab.addEventListener('shown.bs.tab', function (event) {
            updateCharts();
        });
    });
    
    // Initial chart load
    updateCharts();
});

function updateCharts() {
    // Fetch data for all charts
    fetch('/api/stats')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            updateAscentsByDifficultyChart(data.ascentsByDifficulty);
            updateSendsByDateChart(data.sendsByDate);
            updateMetricsOverTimeChart(data.metricsOverTime);
        })
        .catch(error => console.error('Error updating charts:', error));
}

function updateAscentsByDifficultyChart(data) {
    const ctx = document.getElementById('difficultyCanvas');
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
                label: 'Number of Ascents',
                data: data.data,
                backgroundColor: '#410f70',
                borderColor: '#410f70',
                borderWidth: 1
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
                        text: 'Number of Ascents'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Difficulty Grade'
                    }
                }
            }
        }
    });
}

function updateSendsByDateChart(data) {
    const ctx = document.getElementById('sendsCanvas');
    if (!ctx) return;

    let chart = Chart.getChart(ctx);
    if (chart) {
        chart.destroy();
    }

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [
                {
                    label: 'Sends',
                    data: data.sends,
                    backgroundColor: '#410f70',
                    borderColor: '#410f70',
                    borderWidth: 1
                },
                {
                    label: 'Attempts',
                    data: data.attempts,
                    backgroundColor: '#6c757d',
                    borderColor: '#6c757d',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Climbs'
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

function updateMetricsOverTimeChart(data) {
    const ctx = document.getElementById('metricsCanvas');
    if (!ctx) return;

    let chart = Chart.getChart(ctx);
    if (chart) {
        chart.destroy();
    }

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: data.metrics.map(metric => ({
                label: metric.name,
                data: metric.data,
                borderColor: metric.color,
                tension: 0.4,
                fill: false
            }))
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Value'
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