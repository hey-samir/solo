Chart.defaults.color = '#b2b2b2';
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
            // Format dates for charts only
            if (data.sendsByDate) {
                data.sendsByDate.labels = data.sendsByDate.labels.map(date => {
                    const d = new Date(date);
                    return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`;
                });
            }
            if (data.metricsOverTime) {
                data.metricsOverTime.labels = data.metricsOverTime.labels.map(date => {
                    const d = new Date(date);
                    return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`;
                });
            }
            updateAscentsByDifficultyChart(data.ascentsByDifficulty);
            updateSendsByDateChart(data.sendsByDate);
            updateMetricsOverTimeChart(data.metricsOverTime);
            updateClimbsPerSessionChart(data.climbsPerSession);
            updateSendRateByColorChart(data.sendRateByColor);
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
    if (!ctx || !data || !data.sends || !data.attempts) return;

    let chart = Chart.getChart(ctx);
    if (chart) {
        chart.destroy();
    }

    // Format dates as mm/dd
    const formattedLabels = data.labels.map(date => {
        const d = new Date(date);
        return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`;
    });

    const totalData = data.sends.map((send, i) => send + data.attempts[i]);
    const maxValue = Math.max(...totalData);
    const suggestedMax = maxValue + Math.ceil(maxValue * 0.2);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: formattedLabels,
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
                    anchor: 'center',
                    align: 'center',
                    formatter: (value, ctx) => {
                        if (value > 0) return value;
                        return '';
                    },
                    font: {
                        weight: 'normal'
                    }
                },
                tooltip: {
                    enabled: false
                },
                afterDraw: (chart) => {
                    const ctx = chart.ctx;
                    const datasets = chart.data.datasets;
                    
                    chart.data.labels.forEach((label, i) => {
                        const total = datasets[0].data[i] + datasets[1].data[i];
                        if (total > 0) {
                            const meta = chart.getDatasetMeta(1);
                            const x = meta.data[i].x;
                            const y = meta.data[i].y;
                            ctx.save();
                            ctx.fillStyle = '#ffffff';
                            ctx.font = 'bold 12px Arial';
                            ctx.textAlign = 'center';
                            ctx.fillText(total, x, y - 15);
                            ctx.restore();
                        }
                    });
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    suggestedMax: suggestedMax,
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

    // Filter out any null data points and their corresponding labels
    const filteredData = data.metrics[0].data.map((value, index) => ({
        value: value,
        label: data.labels[index]
    })).filter(item => item.value !== null);

    const maxValue = Math.max(...filteredData.map(item => item.value));
    const suggestedMax = maxValue + Math.ceil(maxValue * 0.2);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: filteredData.map(item => item.label),
            datasets: [{
                data: filteredData.map(item => item.value),
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
                legend: {
                    display: false
                },
                datalabels: {
                    color: '#ffffff',
                    anchor: 'end',
                    align: 'top',
                    formatter: (value) => {
                        return value > 0 ? Math.round(value) + '%' : '';
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 120,
                    ticks: {
                        display: false,
                        stepSize: 20
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

function updateSendRateByColorChart(data) {
    const ctx = document.getElementById('colorCanvas');
    if (!ctx || !data || !data.data) return;

    let chart = Chart.getChart(ctx);
    if (chart) {
        chart.destroy();
    }

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
                data: data.data,
                backgroundColor: '#7442d6',
                borderColor: '#7442d6',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                datalabels: {
                    color: '#ffffff',
                    anchor: 'end',
                    align: 'top',
                    formatter: (value) => value > 0 ? value.toFixed(1) + '%' : ''
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: (value) => value + '%'
                    }
                }
            }
        }
    });
}

function updateClimbsPerSessionChart(data) {
    const ctx = document.getElementById('climbsPerSessionCanvas');
    if (!ctx || !data || !data.data) return;

    let chart = Chart.getChart(ctx);
    if (chart) {
        chart.destroy();
    }

    const maxValue = Math.max(...data.data);
    const chartMax = maxValue + Math.ceil(maxValue * 0.25);

    const formattedLabels = data.labels.map(date => {
        const d = new Date(date);
        return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`;
    });
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: formattedLabels,
            datasets: [{
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
                legend: {
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
                    max: chartMax,
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