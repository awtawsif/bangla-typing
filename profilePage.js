// profilePage.js
export function renderProfilePage() {
    this.renderCharts();
    document.getElementById('profile-keyboard-layout-select').value = this.state.userPreferences.keyboardLayout;
    document.getElementById('profile-dark-mode-select').value = this.state.userPreferences.theme;
    document.getElementById('profile-show-phonetic-hint').value = this.state.userPreferences.showPhoneticHint.toString();
    document.getElementById('profile-show-word-count').value = this.state.userPreferences.showWordCount.toString();
    document.getElementById('profile-show-keyboard-hint').value = this.state.userPreferences.showKeyboardHint.toString();
}

export function renderCharts() {
    const wpmCtx = document.getElementById('wpmChart')?.getContext('2d');
    const completionCtx = document.getElementById('completionChart')?.getContext('2d');

    if (this.wpmChartInstance) {
        this.wpmChartInstance.destroy();
        this.wpmChartInstance = null;
    }
    if (this.completionChartInstance) {
        this.completionChartInstance.destroy();
        this.completionChartInstance = null;
    }

    const chartTextColor = (this.state.userPreferences.theme === 'dark' || (this.state.userPreferences.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) ? '#e2e8f0' : '#000';
    const chartGridColor = (this.state.userPreferences.theme === 'dark' || (this.state.userPreferences.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
    const chartLineColorWPM = (this.state.userPreferences.theme === 'dark' || (this.state.userPreferences.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) ? '#81B29A' : '#81B29A';
    const chartLineFillWPM = (this.state.userPreferences.theme === 'dark' || (this.state.userPreferences.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) ? 'rgba(129, 178, 154, 0.3)' : 'rgba(129, 178, 154, 0.2)';
    const chartLineColorAccuracy = (this.state.userPreferences.theme === 'dark' || (this.state.userPreferences.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) ? '#F2CC8F' : '#F2CC8F';
    const chartLineFillAccuracy = (this.state.userPreferences.theme === 'dark' || (this.state.userPreferences.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) ? 'rgba(242, 204, 143, 0.3)' : 'rgba(242, 204, 143, 0.2)';
    const chartDoughnutCompleted = (this.state.userPreferences.theme === 'dark' || (this.state.userPreferences.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) ? '#81B29A' : '#81B29A';
    const chartDoughnutRemaining = (this.state.userPreferences.theme === 'dark' || (this.state.userPreferences.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) ? '#4a5568' : '#F4F3EE';
    const chartDoughnutBorder = (this.state.userPreferences.theme === 'dark' || (this.state.userPreferences.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) ? '#1a202c' : '#FFFFFF';

    if (wpmCtx && this.state.progressData.performance.length > 0) {
        const lessonLabels = this.state.progressData.performance.map(p => `পাঠ ${this.convertToBengaliNumber(p.lesson + 1)}`);
        const wpmData = this.state.progressData.performance.map(p => p.wpm);
        const accuracyData = this.state.progressData.performance.map(p => p.accuracy);

        this.wpmChartInstance = new Chart(wpmCtx, {
            type: 'line',
            data: {
                labels: lessonLabels,
                datasets: [{
                    label: 'WPM',
                    data: wpmData,
                    borderColor: chartLineColorWPM,
                    backgroundColor: chartLineFillWPM,
                    fill: true,
                    tension: 0.3,
                    yAxisID: 'y'
                },
                {
                    label: 'Accuracy (%)',
                    data: accuracyData,
                    borderColor: chartLineColorAccuracy,
                    backgroundColor: chartLineFillAccuracy,
                    fill: true,
                    tension: 0.3,
                    yAxisID: 'y1'
                }]
            },
            options: { 
                responsive: true, 
                maintainAspectRatio: false,
                scales: {
                    x: {
                        ticks: {
                            color: chartTextColor
                        },
                        grid: {
                            color: chartGridColor
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'WPM',
                            color: chartTextColor
                        },
                        ticks: {
                            callback: (value) => this.convertToBengaliNumber(value),
                            color: chartTextColor
                        },
                        grid: {
                            color: chartGridColor
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        beginAtZero: true,
                        grid: {
                            drawOnChartArea: false
                        },
                        title: {
                            display: true,
                            text: 'Accuracy (%)',
                            color: chartTextColor
                        },
                        min: 0,
                        max: 100,
                        ticks: {
                            callback: (value) => this.convertToBengaliNumber(value),
                            color: chartTextColor
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: chartTextColor
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += this.convertToBengaliNumber(context.parsed.y);
                                    if (context.dataset.label === 'Accuracy (%)') {
                                        label += '%';
                                    }
                                }
                                return label;
                            }
                        }
                    }
                }
            }
        });
    }

    if (completionCtx) {
        const completedCount = this.state.progressData.completedLessons.size;
        const totalLessons = this.state.syllabus.length;
        this.completionChartInstance = new Chart(completionCtx, {
            type: 'doughnut',
            data: {
                labels: ['সম্পন্ন', 'বাকি'],
                datasets: [{
                    data: [completedCount, totalLessons - completedCount],
                    backgroundColor: [chartDoughnutCompleted, chartDoughnutRemaining],
                    borderColor: chartDoughnutBorder
                }]
            },
            options: { 
            responsive: true, 
            maintainAspectRatio: false, 
            cutout: '70%',
            plugins: {
                legend: {
                labels: {
                    font: {
                    family: 'Hind Siliguri',
                    size: 14,
                    weight: 'normal'
                    },
                    color: chartTextColor
                }
                },
                tooltip: {
                bodyFont: {
                    family: 'Hind Siliguri',
                    size: 14
                },
                callbacks: {
                    label: (context) => {
                    let label = context.label || '';
                    if (label) {
                        label += ': ';
                    }
                    if (context.parsed !== null) {
                        label += this.convertToBengaliNumber(context.parsed);
                    }
                    return label;
                    }
                }
                }
            }
            }
        });
    }
}

export function renderPracticePage() {
    // Current practice page has no dynamic rendering logic in original script
}