let app; // Declare app in the global scope

document.addEventListener('DOMContentLoaded', () => {
    const App = function() {
        this.state = {
            currentPage: 'learn',
            currentLesson: null,
            currentWordIndex: 0,
            userInput: '',
            startTime: null,
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
        if (e.key === ' ' || e.key === 'Enter') {
            const { items } = this.state.currentLessonData;
            const currentItem = items[this.state.currentWordIndex];
            const trimmedInput = this.state.userInput.trim();
            if (trimmedInput === currentItem) {
                e.preventDefault();
                this.moveToNextWord();
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
        const timeTaken = (endTime - this.state.startTime) / 1000;
        
        const { phonetic_items } = this.state.currentLessonData;
        const totalChars = phonetic_items.reduce((acc, item) => acc + item.length, 0);
        const wpm = timeTaken > 0 ? Math.round((totalChars / 5) / (timeTaken / 60)) : 0;

        this.state.progressData.completedLessons.add(this.state.currentLesson);
        this.state.progressData.performance.push({
            lesson: this.state.currentLesson,
            wpm: wpm,
            accuracy: 100, // Simplified accuracy
            date: new Date().toISOString().split('T')[0]
        });
        this.saveProgress();

        this.navigateTo('completion');
        this.completionElements.title.textContent = `পাঠ ${this.state.currentLesson + 1} সম্পন্ন!`;
        this.completionElements.wpmResult.textContent = `${wpm} WPM`;
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

        if (wpmCtx && this.state.progressData.performance.length > 0) {
            const lessonLabels = this.state.progressData.performance.map(p => `পাঠ ${p.lesson + 1}`);
            const wpmData = this.state.progressData.performance.map(p => p.wpm);
            new Chart(wpmCtx, {
                type: 'line',
                data: {
                    labels: lessonLabels,
                    datasets: [{
                        label: 'WPM',
                        data: wpmData,
                        borderColor: '#81B29A',
                        backgroundColor: 'rgba(129, 178, 154, 0.2)',
                        fill: true,
                        tension: 0.3
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }

        if (completionCtx) {
            const completedCount = this.state.progressData.completedLessons.size;
            const totalLessons = this.state.syllabus.length;
            new Chart(completionCtx, {
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
                    performance: parsed.performance
                };
            }
        } catch (e) {
            console.error("Failed to load progress from localStorage", e);
        }
    };
    
    app = new App();
    app.init();
});
