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
            totalKeystrokes: 0,
            mistakeCount: 0,
            progressData: {
                completedLessons: new Set(),
                performance: [],
                unlockedLevels: new Set([0]) // Start with Level 1 unlocked (index 0)
            },
            syllabus: [],
            currentLessonData: {
                items: [],
                phonetic_items: []
            },
            isHintVisible: false,
            // Define lesson levels
            lessonLevels: [
                { title: "মৌলিক অক্ষর", lessons: [0, 1, 2, 3, 4, 5] }, // Level 1: Lessons 1-6
                { title: "টপ রো ও বিশেষ স্বরবর্ণ", lessons: [6, 7, 8, 9, 10, 11, 12, 13, 14] }, // Level 2: Lessons 7-15
                { title: "বিশেষ চিহ্ন ও সংখ্যা", lessons: [15, 16, 17, 18, 19, 20] }, // Level 3: Lessons 16-21
                { title: "যুক্তাক্ষর - ক থেকে ন", lessons: [21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39] }, // Level 4: Lessons 22-42
                { title: "যুক্তাক্ষর - প থেকে হ", lessons: [40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50] }, // Level 5: Lessons 43-51
                { title: "ব্যবহারিক অনুশীলন", lessons: [51, 52, 53, 54, 55, 56] }  // Level 6: Lessons 52-57
            ]
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

        // Event delegation for lesson cards
        document.getElementById('levels-container').addEventListener('click', (e) => {
            const lessonCard = e.target.closest('.lesson-card');
            if (lessonCard) {
                const lessonIndex = parseInt(lessonCard.dataset.lessonIndex);
                const isLocked = lessonCard.classList.contains('locked');
                if (!isLocked) {
                    lessonCard.classList.add('clicked');
                    setTimeout(() => {
                        lessonCard.classList.remove('clicked');
                    }, 200);
                    this.startLesson(lessonIndex);
                } else {
                    console.log("Lesson is locked!"); // Or show a visual cue to the user
                }
            }
        });
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
            document.getElementById('levels-container').innerHTML = '<p class="text-center text-red-500">পাঠ লোড করা যায়নি। অনুগ্রহ করে আপনার ইন্টারনেট সংযোগ পরীক্ষা করুন।</p>';
        }
    };

    App.prototype.navigateTo = function(page) {
        const currentPageElement = this.viewElements[this.state.currentPage];
        const nextPageElement = this.viewElements[page];

        if (currentPageElement && nextPageElement && currentPageElement !== nextPageElement) {
            currentPageElement.classList.add('fade-out');
            currentPageElement.classList.remove('fade-in');

            setTimeout(() => {
                currentPageElement.classList.add('hidden');
                currentPageElement.classList.remove('fade-out');

                this.state.currentPage = page;
                window.location.hash = page;
                this.updateNavLinks();

                nextPageElement.classList.remove('hidden');
                nextPageElement.classList.add('fade-in');

                this.executePageSpecificActions(page);
            }, 300); // Duration of fade-out animation
        } else {
            this.state.currentPage = page;
            window.location.hash = page;
            this.updateNavLinks();

            for (const view in this.viewElements) {
                this.viewElements[view].classList.add('hidden');
                this.viewElements[view].classList.remove('fade-in', 'fade-out');
            }
            this.viewElements[page].classList.remove('hidden');
            this.viewElements[page].classList.add('fade-in');
            this.executePageSpecificActions(page);
        }
    };

    App.prototype.executePageSpecificActions = function(page) {
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
            case 'lesson':
                this.renderLessonView();
                break;
            case 'completion':
                // Completion view content is set in completeLesson
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
        const levelsContainer = document.getElementById('levels-container');
        levelsContainer.innerHTML = ''; // Clear previous content

        this.state.lessonLevels.forEach((level, levelIndex) => {
            const levelDiv = document.createElement('div');
            levelDiv.className = `level-section mb-8 p-6 rounded-xl shadow-lg transition-all duration-300 ${this.state.progressData.unlockedLevels.has(levelIndex) ? 'bg-white' : 'bg-gray-100 opacity-70 cursor-not-allowed'}`;
            levelDiv.dataset.levelIndex = levelIndex;

            const levelTitleDiv = document.createElement('h3');
            levelTitleDiv.className = 'level-title text-2xl font-bold mb-4 flex items-center';
            levelTitleDiv.innerHTML = `স্তর ${this.convertToBengaliNumber(levelIndex + 1)}: ${level.title} <span class="level-status ml-4 text-sm font-semibold"></span>`;

            const levelStatusSpan = levelTitleDiv.querySelector('.level-status');
            if (this.state.progressData.unlockedLevels.has(levelIndex)) {
                levelStatusSpan.textContent = '(আনলক করা)';
                levelStatusSpan.classList.add('text-green-600');
            } else {
                levelStatusSpan.textContent = '(লক করা)';
                levelStatusSpan.classList.add('text-red-500');
            }

            const lessonGrid = document.createElement('div');
            lessonGrid.className = 'lesson-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6';

            level.lessons.forEach(lessonIndex => {
                const lesson = this.state.syllabus[lessonIndex];
                const isCompleted = this.state.progressData.completedLessons.has(lessonIndex);
                const isLocked = !this.state.progressData.unlockedLevels.has(levelIndex);

                const lessonCard = document.createElement('div');
                lessonCard.className = `lesson-card ${isCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''}`;
                lessonCard.dataset.lessonIndex = lessonIndex;
                
                let lockIcon = '';
                if (isLocked) {
                    lockIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400 absolute top-3 right-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>`;
                }


                lessonCard.innerHTML = `
                    <div class="flex justify-between items-center">
                        <span class="text-sm font-semibold text-gray-500">পাঠ ${this.convertToBengaliNumber(lessonIndex + 1)}</span>
                        ${isCompleted ? '<span class="text-green-600 font-bold">✓</span>' : ''}
                        ${lockIcon}
                    </div>
                    <h3 class="mt-2 font-bold text-lg">${lesson.title}</h3>
                `;
                lessonGrid.appendChild(lessonCard);
            });
            
            levelDiv.appendChild(levelTitleDiv);
            levelDiv.appendChild(lessonGrid);
            levelsContainer.appendChild(levelDiv);
        });
    };

    App.prototype.startLesson = function(lessonIndex) {
        // Check if the lesson is unlocked
        const levelIndex = this.state.lessonLevels.findIndex(level => level.lessons.includes(lessonIndex));
        if (!this.state.progressData.unlockedLevels.has(levelIndex)) {
            // This should ideally be prevented by the UI, but as a safeguard:
            console.warn(`Lesson ${lessonIndex + 1} is locked. Unlock previous levels first.`);
            return;
        }

        this.state.currentLesson = lessonIndex;
        this.state.currentWordIndex = 0;
        this.state.userInput = '';
        this.state.startTime = null;
        this.state.isHintVisible = true; // Show hint by default when starting a lesson
        this.state.correctCharsCount = 0; // Reset accuracy counts
        this.state.incorrectCharsCount = 0; // Reset accuracy counts
        this.state.totalKeystrokes = 0;
        this.state.mistakeCount = 0;

        const lesson = this.state.syllabus[this.state.currentLesson];
        this.state.currentLessonData = {
            items: [...(lesson.characters || []), ...(lesson.words || []), ...(lesson.phrases || [])],
            phonetic_items: [...(lesson.phonetic_char || []), ...(lesson.phonetic_words || []), ...(lesson.phrases_phonetic || [])]
        };

        this.navigateTo('lesson');
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
        
        this.lessonElements.title.textContent = `পাঠ ${this.convertToBengaliNumber(this.state.currentLesson + 1)}: ${lesson.title}`;
        this.lessonElements.typingDisplay.innerHTML = this.getDisplayHTML(currentItem, this.state.userInput);
        this.lessonElements.typingDisplay.classList.remove('text-change-animation');
        void this.lessonElements.typingDisplay.offsetWidth; // Trigger reflow
        this.lessonElements.typingDisplay.classList.add('text-change-animation');
        this.lessonElements.phoneticDisplay.textContent = `(${phoneticItem})`;
        this.lessonElements.wordCount.textContent = `শব্দ: ${this.convertToBengaliNumber(this.state.currentWordIndex + 1)} / ${this.convertToBengaliNumber(items.length)}`;

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

        const { items } = this.state.currentLessonData;
        const currentItem = items[this.state.currentWordIndex];

        this.state.userInput = e.target.value;
        this.lessonElements.typingDisplay.innerHTML = this.getDisplayHTML(currentItem, this.state.userInput);

        // Increment total keystrokes for every character typed
        this.state.totalKeystrokes++;

        // Shake animation for incorrect input
        const currentInputLength = this.state.userInput.length;
        if (currentInputLength > 0 && currentInputLength <= currentItem.length) {
            if (this.state.userInput[currentInputLength - 1] !== currentItem[currentInputLength - 1]) {
                this.state.mistakeCount++; // Increment mistake count
                this.lessonElements.typingInput.classList.add('shake-animation');
                this.lessonElements.typingInput.addEventListener('animationend', () => {
                    this.lessonElements.typingInput.classList.remove('shake-animation');
                }, { once: true });
            }
        }
    };

    App.prototype.handleTypingKeydown = function(e) {
        const { items } = this.state.currentLessonData;
        const currentItem = items[this.state.currentWordIndex];

        // Logic for moving to the next word/phrase
        if (e.key === 'Enter' || (e.key === ' ' && this.state.userInput === currentItem)) {
            e.preventDefault(); // Prevent default behavior for space/enter
            if (this.state.userInput === currentItem) {
                this.moveToNextWord();
            } else {
                // If input doesn't match, prevent moving and shake
                this.lessonElements.typingInput.classList.add('shake-animation');
                this.lessonElements.typingInput.addEventListener('animationend', () => {
                    this.lessonElements.typingInput.classList.remove('shake-animation');
                }, { once: true });
            }
        }
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
        if (this.state.totalKeystrokes > 0) {
            accuracy = Math.round(100 - (this.state.mistakeCount / this.state.totalKeystrokes) * 100);
        }
        const correctChars = this.state.totalKeystrokes - this.state.mistakeCount;

        this.state.progressData.completedLessons.add(this.state.currentLesson);
        this.state.progressData.performance.push({
            lesson: this.state.currentLesson,
            wpm: wpm,
            accuracy: accuracy, // Now dynamically calculated
            date: new Date().toISOString().split('T')[0]
        });

        // Check for level unlock
        this.checkForLevelUnlock();

        this.saveProgress();

        this.navigateTo('completion');
        this.completionElements.title.textContent = `পাঠ ${this.convertToBengaliNumber(this.state.currentLesson + 1)} সম্পন্ন!`;
        this.completionElements.wpmResult.innerHTML = `${this.convertToBengaliNumber(wpm)} WPM <span class="text-lg text-gray-600">(${this.convertToBengaliNumber(accuracy)}% নির্ভুলতা)</span><br><span class="text-base text-gray-700">মোট অক্ষর: ${this.convertToBengaliNumber(this.state.totalKeystrokes)}, সঠিক: ${this.convertToBengaliNumber(correctChars)}, ভুল: ${this.convertToBengaliNumber(this.state.mistakeCount)}</span>`; // Display accuracy and character counts
        this.completionElements.retryButton.onclick = () => this.startLesson(this.state.currentLesson);
    };

    App.prototype.checkForLevelUnlock = function() {
        // Find the level the current lesson belongs to
        const currentLevelIndex = this.state.lessonLevels.findIndex(level => 
            level.lessons.includes(this.state.currentLesson)
        );

        if (currentLevelIndex !== -1) {
            const currentLevelLessons = this.state.lessonLevels[currentLevelIndex].lessons;
            const allLessonsInCurrentLevelCompleted = currentLevelLessons.every(lessonIndex => 
                this.state.progressData.completedLessons.has(lessonIndex)
            );

            if (allLessonsInCurrentLevelCompleted) {
                const nextLevelIndex = currentLevelIndex + 1;
                if (nextLevelIndex < this.state.lessonLevels.length) {
                    if (!this.state.progressData.unlockedLevels.has(nextLevelIndex)) {
                        this.state.progressData.unlockedLevels.add(nextLevelIndex);
                        console.log(`Level ${nextLevelIndex + 1} unlocked!`);
                        // Optionally, show a notification to the user
                    }
                }
            }
        }
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
            const lessonLabels = this.state.progressData.performance.map(p => `পাঠ ${this.convertToBengaliNumber(p.lesson + 1)}`);
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
                            },
                            ticks: {
                                callback: (value) => this.convertToBengaliNumber(value)
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
                            max: 100, // Accuracy is 0-100%
                            ticks: {
                                callback: (value) => this.convertToBengaliNumber(value)
                            }
                        }
                    },
                    plugins: {
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
                        backgroundColor: ['#81B29A', '#F4F3EE'],
                        borderColor: ['#FFFFFF', '#FFFFFF']
                    }]
                },
                options: { 
                    responsive: true, 
                    maintainAspectRatio: false, 
                    cutout: '70%',
                    plugins: {
                        tooltip: {
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
    };

    App.prototype.saveProgress = function() {
        try {
            localStorage.setItem('typingProgress', JSON.stringify({
                completedLessons: Array.from(this.state.progressData.completedLessons),
                performance: this.state.progressData.performance,
                unlockedLevels: Array.from(this.state.progressData.unlockedLevels) // Save unlocked levels
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
                    completedLessons: new Set(parsed.completedLessons || []),
                    performance: parsed.performance || [],
                    unlockedLevels: new Set(parsed.unlockedLevels || [0]) // Load or default to Level 1 unlocked
                };
            }
        } catch (e) {
            console.error("Failed to load progress from localStorage", e);
        }
    };

    App.prototype.convertToBengaliNumber = function(number) {
        const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        const bengaliNumbers = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
        return String(number).split('').map(digit => {
            const index = englishNumbers.indexOf(digit);
            return index !== -1 ? bengaliNumbers[index] : digit;
        }).join('');
    };
    
    app = new App();
    app.init();
});


// Utility for phonetic conversion (example, needs proper implementation)
function convertToPhonetic(banglaText) {
    // This is a placeholder. A real implementation would involve a comprehensive
    // mapping of Bengali characters and conjuncts to their phonetic English equivalents.
    // For demonstration, we'll just return the input text.
    return banglaText;
}
