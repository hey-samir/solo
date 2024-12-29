
Chart.defaults.color = '#ffffff';
Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';

document.addEventListener('DOMContentLoaded', function() {
    const tabElements = document.querySelectorAll('button[data-bs-toggle="tab"]');
    tabElements.forEach(tab => {
        tab.addEventListener('shown.bs.tab', function (event) {
            updateCharts();
        });
    });
    updateCharts();
});

function updateCharts() {
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
        type: 'doughnut',
        data: {
            labels: data.labels,
            datasets: [{
                data: data.data,
                backgroundColor: Array(data.labels.length).fill('#7442d6'),
                borderColor: '#7442d6',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
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

    const maxValue = Math.max(...data.sends, ...data.attempts);
    const suggestedMax = maxValue + Math.ceil(maxValue * 0.2);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [
                {
                    label: 'Sends',
                    data: data.sends,
                    backgroundColor: '#7442d6',
                    borderColor: '#7442d6',
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
                    suggestedMax: suggestedMax,
                    grid: {
                        display: false
                    }
                },
                x: {
                    grid: {
                        display: false
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

    const maxValue = Math.max(...data.metrics[0].data);
    const suggestedMax = maxValue + Math.ceil(maxValue * 0.2);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Success Rate',
                data: data.metrics[0].data,
                borderColor: '#7442d6',
                backgroundColor: 'rgba(116, 66, 214, 0.2)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    suggestedMax: suggestedMax,
                    grid: {
                        display: false
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}
