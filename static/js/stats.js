document.addEventListener('DOMContentLoaded', function() {
    // Setup Chart.js defaults for dark theme
    Chart.defaults.color = '#ffffff';
    Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';

    // Initialize charts if their containers exist
    initGradeProgressionChart();
    initSessionFrequencyChart();
    initSuccessRateChart();
    initGradeDistributionChart();

    // Handle time range changes
    document.querySelectorAll('input[name="timeRange"]').forEach(radio => {
        radio.addEventListener('change', function() {
            updateAllCharts(this.value);
        });
    });
});

function initGradeProgressionChart() {
    const ctx = document.getElementById('gradeProgressionChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: [], // Will be populated with dates
            datasets: [{
                label: 'Highest Grade',
                data: [], // Will be populated with grades
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

function initSessionFrequencyChart() {
    const ctx = document.getElementById('sessionFrequencyChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [], // Will be populated with days/weeks
            datasets: [{
                label: 'Sessions',
                data: [], // Will be populated with session counts
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

function initSuccessRateChart() {
    const ctx = document.getElementById('successRateChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [], // Will be populated with grades
            datasets: [{
                label: 'Success Rate',
                data: [], // Will be populated with success rates
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

function initGradeDistributionChart() {
    const ctx = document.getElementById('gradeDistributionChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [], // Will be populated with grades
            datasets: [{
                label: 'Attempts',
                data: [], // Will be populated with attempt counts
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

function updateAllCharts(timeRange) {
    // Fetch new data based on time range
    fetch(`/api/stats?timeRange=${timeRange}`)
        .then(response => response.json())
        .then(data => {
            updateChartData('gradeProgressionChart', data.progression);
            updateChartData('sessionFrequencyChart', data.frequency);
            updateChartData('successRateChart', data.successRate);
            updateChartData('gradeDistributionChart', data.distribution);
        })
        .catch(error => console.error('Error updating charts:', error));
}

function updateChartData(chartId, newData) {
    const chart = Chart.getChart(chartId);
    if (!chart) return;

    chart.data.labels = newData.labels;
    chart.data.datasets[0].data = newData.data;
    chart.update();
}
