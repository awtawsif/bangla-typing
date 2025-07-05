let app; // Declare app in the global scope

document.addEventListener('DOMContentLoaded', () => {
    const App = function() {
        this.state = {
            currentPage: 'learn',
            currentLesson: null,
            currentWordIndex: 0,
            userInput: '',
            startTime: null,
            correctCharsCount: 0, // Added for accuracy calculation
            incorrectCharsCount: 0, // Added for accuracy calculation
            progressData: {
                completedLessons: new Set(),
                performance: [] 
            },
            syllabus: [],
            currentLessonData: {
                items: [],
                phonetic_items: []
            },
            isHintVisible: false
        };

        this.viewElements = {
            learn: document.getElementById('learn-view'),
            lesson: document.getElementById('lesson-view'),
            practice: document.getElementById('practice-view'),
            progress: document.getElementById('progress-view'),
            completion: document.getElementById('completion-view')
        };

        this.lessonElements = {
            title: document.getElementById('lesson-title'),
            typingDisplay: document.getElementById('typing-display'),
            phoneticDisplay: document.getElementById('phonetic-display'),
            typingInput: document.getElementById('typing-input'),
            wordCount: document.getElementById('word-count'),
            hintContainer: document.getElementById('hint-container'),
            keyboardMapContainer: document.getElementById('keyboard-map-container')
        };

        this.completionElements = {
            title: document.getElementById('completion-title'),
            wpmResult: document.getElementById('wpm-result'),
            retryButton: document.getElementById('retry-lesson-button')
        };

        this.navLinks = document.querySelectorAll('.nav-link');
        this.mobileMenu = document.getElementById('mobile-menu');

        // Chart instances to be destroyed before re-rendering
        this.wpmChartInstance = null;
        this.completionChartInstance = null;
    };

    App.prototype.init = async function() {
        await this.loadSyllabus();
        this.loadProgress();
        const hash = window.location.hash.replace('#', '');
        const initialPage = ['learn', 'practice', 'progress'].includes(hash) ? hash : 'learn';
        this.navigateTo(initialPage);
        window.addEventListener('hashchange', () => this.handleHashChange());
        this.lessonElements.typingInput.addEventListener('input', (e) => this.handleTyping(e));
        this.lessonElements.typingInput.addEventListener('keydown', (e) => this.handleTypingKeydown(e));
    };
    
    App.prototype.toggleMobileMenu = function() {
        this.mobileMenu.classList.toggle('hidden');
    };

    App.prototype.handleHashChange = function() {
        const hash = window.location.hash.replace('#', '');
        if (['learn', 'practice', 'progress'].includes(hash) && this.state.currentPage !== hash) {
            this.navigateTo(hash);
        }
    };

    App.prototype.loadSyllabus = async function() {
        try {
            const response = await fetch('syllabus.json');
            this.state.syllabus = await response.json();
        } catch (error) {
            console.error('Failed to load syllabus:', error);
            // Optionally, display a user-friendly error message on the learn page
            document.getElementById('lesson-grid').innerHTML = '<p class="text-center text-red-500">পাঠ লোড করা যায়নি। অনুগ্রহ করে আপনার ইন্টারনেট সংযোগ পরীক্ষা করুন।</p>';
        }
    };

    App.prototype.navigateTo = function(page) {
        this.state.currentPage = page;
        window.location.hash = page;
        this.updateNavLinks();

        for (const view in this.viewElements) {
            this.viewElements[view].classList.add('hidden');
        }
        this.viewElements[page].classList.remove('hidden');

        switch(page) {
            case 'learn':
                this.renderLearnPage();
                break;
            case 'practice':
                this.renderPracticePage();
                break;
            case 'progress':
                this.renderProgressPage();
                break;
        }
    };

    App.prototype.updateNavLinks = function() {
        this.navLinks.forEach(link => {
            const pageName = link.getAttribute('onclick').match(/'(.*?)'/)[1];
            if (pageName === this.state.currentPage) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    };
    
    App.prototype.renderLearnPage = function() {
        this.state.currentLesson = null;
        const lessonGrid = document.getElementById('lesson-grid');
        lessonGrid.innerHTML = this.state.syllabus.map((lesson, index) => {
            const isCompleted = this.state.progressData.completedLessons.has(index);
            return `
                <div class="lesson-card ${isCompleted ? 'completed' : ''}" onclick="app.startLesson(${index})">
                    <div class="flex justify-between items-center">
                        <span class="text-sm font-semibold text-gray-500">পাঠ ${index + 1}</span>
                        ${isCompleted ? '<span class="text-green-600 font-bold">✓</span>' : ''}
                    </div>
                    <h3 class="mt-2 font-bold text-lg">${lesson.title}</h3>
                </div>
            `;
        }).join('');
    };

    App.prototype.startLesson = function(lessonIndex) {
        this.state.currentLesson = lessonIndex;
        this.state.currentWordIndex = 0;
        this.state.userInput = '';
        this.state.startTime = null;
        this.state.isHintVisible = false;
        this.state.correctCharsCount = 0; // Reset accuracy counts
        this.state.incorrectCharsCount = 0; // Reset accuracy counts

        const lesson = this.state.syllabus[this.state.currentLesson];
        this.state.currentLessonData = {
            items: [...(lesson.words || []), ...(lesson.phrases || [])],
            phonetic_items: [...(lesson.phonetic_words || []), ...(lesson.phrases_phonetic || [])]
        };

        this.navigateTo('lesson');
        this.renderLessonView();
    };

    App.prototype.toggleHint = function() {
        this.state.isHintVisible = !this.state.isHintVisible;
        this.renderLessonView();
    };

    App.prototype.renderLessonView = function() {
        const lesson = this.state.syllabus[this.state.currentLesson];
        const { items, phonetic_items } = this.state.currentLessonData;

        if (this.state.currentWordIndex >= items.length) {
            this.completeLesson();
            return;
        }

        const currentItem = items[this.state.currentWordIndex];
        const phoneticItem = phonetic_items[this.state.currentWordIndex];
        
        this.lessonElements.title.textContent = `পাঠ ${this.state.currentLesson + 1}: ${lesson.title}`;
        this.lessonElements.typingDisplay.innerHTML = this.getDisplayHTML(currentItem, this.state.userInput);
        this.lessonElements.phoneticDisplay.textContent = `(${phoneticItem})`;
        this.lessonElements.wordCount.textContent = `শব্দ: ${this.state.currentWordIndex + 1} / ${items.length}`;

        if (this.state.isHintVisible && lesson.keyboard_map) {
            this.lessonElements.hintContainer.classList.remove('hidden');
            this.lessonElements.keyboardMapContainer.innerHTML = Object.entries(lesson.keyboard_map).map(([key, value]) => `
                <div class="flex items-center justify-center p-2 bg-gray-200 rounded-md">
                    <span class="font-mono text-lg font-semibold">${key}</span>
                    <span class="mx-2">→</span>
                    <span class="text-lg font-semibold">${value}</span>
                </div>
            `).join('');
        } else {
            this.lessonElements.hintContainer.classList.add('hidden');
        }

        this.lessonElements.typingInput.value = this.state.userInput;
        this.lessonElements.typingInput.focus();
    };

    App.prototype.handleTyping = function(e) {
        if (this.state.startTime === null && e.target.value.length > 0) {
            this.state.startTime = new Date();
        }
        this.state.userInput = e.target.value;
        const { items } = this.state.currentLessonData;
        const currentItem = items[this.state.currentWordIndex];
        this.lessonElements.typingDisplay.innerHTML = this.getDisplayHTML(currentItem, this.state.userInput);
    };

    App.prototype.handleTypingKeydown = function(e) {
        const { items } = this.state.currentLessonData;
        const currentItem = items[this.state.currentWordIndex];
        const trimmedInput = this.state.userInput.trim();

        // Update accuracy counts on each keydown (before processing space/enter)
        // This ensures accuracy is tracked for partially typed words too
        this.updateAccuracy(currentItem, this.state.userInput);

        if (e.key === ' ' || e.key === 'Enter') {
            if (trimmedInput === currentItem) {
                e.preventDefault();
                this.moveToNextWord();
            } else {
                // If input doesn't match, count remaining characters as incorrect for this word
                this.state.incorrectCharsCount += (currentItem.length - trimmedInput.length);
                // Optionally, prevent moving to next word if incorrect and not matching
                // For now, we allow moving on if space/enter is pressed, but accuracy is recorded.
                // You might want to force correction before moving on.
            }
        }
    };

    App.prototype.updateAccuracy = function(target, input) {
        let currentCorrect = 0;
        let currentIncorrect = 0;
        const minLength = Math.min(target.length, input.length);

        for (let i = 0; i < minLength; i++) {
            if (target[i] === input[i]) {
                currentCorrect++;
            } else {
                currentIncorrect++;
            }
        }
        // If input is longer than target, extra characters are incorrect
        currentIncorrect += Math.max(0, input.length - target.length);

        // Update global counts based on the difference from previous state for the current word
        // This approach needs careful thought if you're tracking character-by-character changes
        // For simplicity, let's reset and recalculate for the current word on each keydown for display purposes
        // and then accumulate total correct/incorrect at word completion.
        // For now, we'll just accumulate correct/incorrect for the entire lesson.
        // A more precise accuracy would involve tracking per-word errors and then summing.
        // For simplicity, let's just count total correct/incorrect characters typed throughout the lesson.
        // This is a common simplification for overall lesson accuracy.
        // The current implementation of `getDisplayHTML` already provides visual feedback.
        // To get overall accuracy, we need to sum up correct and incorrect characters over the entire lesson.
        // Let's refine this: correctCharsCount and incorrectCharsCount will be for the entire lesson.
        // When a word is completed, we compare the final input to the target.

        // This function will be called on keydown. It's better to calculate accuracy only when a word is submitted.
        // For now, the existing `getDisplayHTML` handles visual feedback.
        // The actual accuracy calculation will happen in `completeLesson`.
    };

    App.prototype.getDisplayHTML = function(target, input) {
        let html = '';
        for (let i = 0; i < target.length; i++) {
            if (i < input.length) {
                html += `<span class="${target[i] === input[i] ? 'correct' : 'incorrect'}">${target[i]}</span>`;
            } else {
                html += `<span>${target[i]}</span>`;
            }
        }
        return html;
    };

    App.prototype.moveToNextWord = function() {
        const { items } = this.state.currentLessonData;
        const currentItem = items[this.state.currentWordIndex];
        const trimmedInput = this.state.userInput.trim();

        // Accumulate correct and incorrect characters for the whole lesson
        for (let i = 0; i < Math.min(currentItem.length, trimmedInput.length); i++) {
            if (currentItem[i] === trimmedInput[i]) {
                this.state.correctCharsCount++;
            } else {
                this.state.incorrectCharsCount++;
            }
        }
        // If the input is shorter than the target, the remaining target characters are "skipped" (incorrect)
        this.state.incorrectCharsCount += Math.max(0, currentItem.length - trimmedInput.length);
        // If the input is longer than the target, the extra characters are incorrect
        this.state.incorrectCharsCount += Math.max(0, trimmedInput.length - currentItem.length);


        this.state.currentWordIndex++;
        this.state.userInput = '';
        this.renderLessonView();
    };

    App.prototype.completeLesson = function() {
        const endTime = new Date();
        const timeTaken = (endTime - this.state.startTime) / 1000; // Time in seconds
        
        const { phonetic_items } = this.state.currentLessonData;
        const totalTargetChars = phonetic_items.reduce((acc, item) => acc + item.length, 0);
        
        // WPM calculation: (characters / 5) / (minutes)
        const wpm = timeTaken > 0 ? Math.round((totalTargetChars / 5) / (timeTaken / 60)) : 0;

        // Calculate overall accuracy for the lesson
        let accuracy = 0;
        const totalTypedChars = this.state.correctCharsCount + this.state.incorrectCharsCount;
        if (totalTypedChars > 0) {
            accuracy = Math.round((this.state.correctCharsCount / totalTypedChars) * 100);
        }

        this.state.progressData.completedLessons.add(this.state.currentLesson);
        this.state.progressData.performance.push({
            lesson: this.state.currentLesson,
            wpm: wpm,
            accuracy: accuracy, // Now dynamically calculated
            date: new Date().toISOString().split('T')[0]
        });
        this.saveProgress();

        this.navigateTo('completion');
        this.completionElements.title.textContent = `পাঠ ${this.state.currentLesson + 1} সম্পন্ন!`;
        this.completionElements.wpmResult.innerHTML = `${wpm} WPM <span class="text-lg text-gray-600">(${accuracy}% নির্ভুলতা)</span>`; // Display accuracy
        this.completionElements.retryButton.onclick = () => this.startLesson(this.state.currentLesson);
    };

    App.prototype.renderPracticePage = function() {
        // No dynamic content to render, view is already in HTML
    };

    App.prototype.renderProgressPage = function() {
        this.renderCharts();
    };
    
    App.prototype.renderCharts = function() {
        const wpmCtx = document.getElementById('wpmChart')?.getContext('2d');
        const completionCtx = document.getElementById('completionChart')?.getContext('2d');

        // Destroy existing chart instances before creating new ones
        if (this.wpmChartInstance) {
            this.wpmChartInstance.destroy();
            this.wpmChartInstance = null;
        }
        if (this.completionChartInstance) {
            this.completionChartInstance.destroy();
            this.completionChartInstance = null;
        }

        if (wpmCtx && this.state.progressData.performance.length > 0) {
            const lessonLabels = this.state.progressData.performance.map(p => `পাঠ ${p.lesson + 1}`);
            const wpmData = this.state.progressData.performance.map(p => p.wpm);
            const accuracyData = this.state.progressData.performance.map(p => p.accuracy); // Get accuracy data

            this.wpmChartInstance = new Chart(wpmCtx, {
                type: 'line',
                data: {
                    labels: lessonLabels,
                    datasets: [{
                        label: 'WPM',
                        data: wpmData,
                        borderColor: '#81B29A',
                        backgroundColor: 'rgba(129, 178, 154, 0.2)',
                        fill: true,
                        tension: 0.3,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Accuracy (%)', // New dataset for accuracy
                        data: accuracyData,
                        borderColor: '#F2CC8F', // A different color for accuracy
                        backgroundColor: 'rgba(242, 204, 143, 0.2)',
                        fill: true,
                        tension: 0.3,
                        yAxisID: 'y1' // Use a different Y-axis if scales differ greatly
                    }]
                },
                options: { 
                    responsive: true, 
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            type: 'linear',
                            display: true,
                            position: 'left',
                            title: {
                                display: true,
                                text: 'WPM'
                            }
                        },
                        y1: {
                            type: 'linear',
                            display: true,
                            position: 'right',
                            grid: {
                                drawOnChartArea: false // Only draw grid lines for the first Y-axis
                            },
                            title: {
                                display: true,
                                text: 'Accuracy (%)'
                            },
                            min: 0,
                            max: 100 // Accuracy is 0-100%
                        }
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    let label = context.dataset.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    if (context.parsed.y !== null) {
                                        label += context.parsed.y;
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
                        backgroundColor: ['#81B29A', '#F4F3EE'],
                        borderColor: ['#FFFFFF', '#FFFFFF']
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false, cutout: '70%' }
            });
        }
    };

    App.prototype.saveProgress = function() {
        try {
            localStorage.setItem('typingProgress', JSON.stringify({
                completedLessons: Array.from(this.state.progressData.completedLessons),
                performance: this.state.progressData.performance
            }));
        } catch (e) {
            console.error("Failed to save progress to localStorage", e);
        }
    };

    App.prototype.loadProgress = function() {
        try {
            const savedData = localStorage.getItem('typingProgress');
            if (savedData) {
                const parsed = JSON.parse(savedData);
                this.state.progressData = {
                    completedLessons: new Set(parsed.completedLessons),
                    performance: parsed.performance || [] // Ensure performance is an array
                };
            }
        } catch (e) {
            console.error("Failed to load progress from localStorage", e);
        }
    };
    
    app = new App();
    app.init();
});

