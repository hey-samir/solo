
Chart.defaults.color = '#ffffff';
Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';
Chart.register(ChartDataLabels);

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
            updateClimbsPerSessionChart(data.climbsPerSession);
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
                backgroundColor: data.labels.map(label => {
                    const gradeColors = {
                        '5.0': '#E9D8FD', '5.1': '#D6BCFA', '5.2': '#C084FC', '5.3': '#A855F7',
                        '5.4': '#9333EA', '5.5': '#7E22CE', '5.6': '#6B21A8', '5.7': '#581C87',
                        '5.8': '#4C1D95', '5.9': '#3B0764', '5.10a': '#350567', '5.10b': '#2F035E',
                        '5.10c': '#290356', '5.10d': '#23034E', '5.11a': '#1D0345', '5.11b': '#18033C',
                        '5.11c': '#130333', '5.11d': '#0E032B', '5.12a': '#090222', '5.12b': '#08021D',
                        '5.12c': '#07021A', '5.12d': '#060216', '5.13a': '#050213', '5.13b': '#040210',
                        '5.13c': '#03020D', '5.13d': '#02020A', '5.14a': '#010207', '5.14b': '#010106',
                        '5.14c': '#010105', '5.14d': '#010104', '5.15a': '#010103', '5.15b': '#010102',
                        '5.15c': '#010101', '5.15d': '#000000'
                    };
                    return gradeColors[label] || '#7442d6';
                }),
                borderColor: '#7442d6',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: false
                },
                legend: {
                    position: 'right'
                },
                datalabels: {
                    color: '#ffffff',
                    formatter: (value, ctx) => {
                        return value > 0 ? value : '';
                    },
                    font: {
                        weight: 'bold'
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
                    stack: 'combined'
                },
                {
                    label: 'Attempts',
                    data: data.attempts,
                    backgroundColor: '#6c757d',
                    stack: 'combined'
                },
                {
                    label: 'Total Climbs',
                    data: data.sends.map((send, i) => send + data.attempts[i]),
                    type: 'line',
                    borderColor: '#ffffff',
                    tension: 0.4,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: false
                },
                datalabels: {
                    color: '#ffffff',
                    anchor: 'end',
                    align: 'top',
                    formatter: (value, ctx) => {
                        return value > 0 ? value : '';
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    suggestedMax: 10,
                    ticks: {
                        display: false
                    },
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
            plugins: {
                title: {
                    display: false
                },
                datalabels: {
                    color: '#ffffff',
                    anchor: 'end',
                    align: 'top',
                    formatter: (value) => {
                        return value > 0 ? Math.round(value * 100) + '%' : '';
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    suggestedMax: 1,
                    ticks: {
                        display: false,
                        stepSize: 0.2
                    },
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

function updateClimbsPerSessionChart(data) {
    const ctx = document.getElementById('climbsPerSessionCanvas');
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
                label: 'Climbs per Session',
                data: data.data,
                borderColor: '#7442d6',
                backgroundColor: 'rgba(116, 66, 214, 0.2)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: false
                },
                datalabels: {
                    color: '#ffffff',
                    anchor: 'end',
                    align: 'top',
                    formatter: (value) => value > 0 ? value : ''
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
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
