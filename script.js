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
        this.mainContent = document.getElementById('main-content');
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
        this.mainContent.addEventListener('input', (e) => {
            if (e.target.id === 'typing-input') {
                this.handleTyping(e);
            }
        });
        // Listen for keydown for space/enter to move to next word/phrase
        this.mainContent.addEventListener('keydown', (e) => {
            if (e.target.id === 'typing-input') {
                this.handleTypingKeydown(e);
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
        }
    };

    App.prototype.navigateTo = function(page) {
        this.state.currentPage = page;
        window.location.hash = page;
        this.updateNavLinks();
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
            default:
                this.renderLearnPage();
        }
    };

    App.prototype.updateNavLinks = function() {
        document.querySelectorAll('.nav-link').forEach(link => {
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

        let lessonGridHTML = this.state.syllabus.map((lesson, index) => {
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

        this.mainContent.innerHTML = `
            <div class="text-center mb-8">
                <h2 class="text-3xl font-bold mb-2">আপনার পাঠ শুরু করুন</h2>
                <p class="text-gray-600">যেকোনো একটি পাঠে ক্লিক করে আপনার টাইপিং অনুশীলন শুরু করুন।</p>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                ${lessonGridHTML}
            </div>
        `;
    };

    App.prototype.startLesson = function(lessonIndex) {
        this.state.currentLesson = lessonIndex;
        this.state.currentWordIndex = 0;
        this.state.userInput = '';
        this.state.startTime = null;
        this.state.isHintVisible = true;

        const lesson = this.state.syllabus[this.state.currentLesson];
        this.state.currentLessonData = {
            items: [...(lesson.words || []), ...(lesson.phrases || [])],
            phonetic_items: [...(lesson.phonetic_words || []), ...(lesson.phrases_phonetic || [])]
        };

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
        const displayHTML = this.getDisplayHTML(currentItem, this.state.userInput);

        const keyboardMapHTML = this.state.isHintVisible && lesson.keyboard_map ? 
            Object.entries(lesson.keyboard_map).map(([key, value]) => `
                <div class="flex items-center justify-center p-2 bg-gray-200 rounded-md">
                    <span class="font-mono text-lg font-semibold">${key}</span>
                    <span class="mx-2">→</span>
                    <span class="text-lg font-semibold">${value}</span>
                </div>
            `).join('') : '';

        this.mainContent.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div class="md:col-span-2">
                    <div class="flex justify-between items-center mb-2">
                        <button onclick="app.navigateTo('learn')" class="btn-accent py-2 px-4 rounded-lg flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
                            সব পাঠ
                        </button>
                        <h2 class="text-2xl font-bold text-center flex-1">পাঠ ${this.state.currentLesson + 1}: ${lesson.title}</h2>
                        <button onclick="app.toggleHint()" class="btn-accent py-2 px-4 rounded-lg">Hint</button>
                    </div>
                    <div class="bg-secondary p-6 rounded-xl shadow-inner flex flex-col gap-2">
                        <p class="text-center text-gray-600 mb-2">নিচের লেখাটির জন্য টাইপ করুন:</p>
                        <div id="typing-display" class="typing-display text-center mb-2">${displayHTML}</div>
                        <p class="text-center text-gray-500 mb-4">(${phoneticItem})</p>
                        <textarea id="typing-input" class="w-full p-4 border-2 border-gray-300 rounded-lg text-2xl focus:border-accent focus:ring-accent" rows="3" autofocus></textarea>
                        <div class="text-center mt-4 text-gray-500">শব্দ: ${this.state.currentWordIndex + 1} / ${items.length}</div>
                    </div>
                </div>
                <div id="hint-container" class="${this.state.isHintVisible ? '' : 'hidden'} md:col-span-1 bg-white p-6 rounded-xl shadow-md">
                    <h3 class="text-xl font-bold mb-4 text-center">Keyboard Hints</h3>
                    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 gap-2">
                        ${keyboardMapHTML}
                    </div>
                </div>
            </div>
        `;

        const input = document.getElementById('typing-input');
        input.focus();
    };

    App.prototype.handleTyping = function(e) {
        if (this.state.startTime === null && e.target.value.length > 0) {
            this.state.startTime = new Date();
        }
        this.state.userInput = e.target.value;
        const { items } = this.state.currentLessonData;
        const currentItem = items[this.state.currentWordIndex];
        
        const display = document.getElementById('typing-display');
        if (display) {
            display.innerHTML = this.getDisplayHTML(currentItem, this.state.userInput);
        }
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
        const inputField = document.getElementById('typing-input');
        if (inputField) {
            inputField.disabled = true;
        }
        setTimeout(() => {
            this.state.currentWordIndex++;
            this.state.userInput = '';
            const inputField = document.getElementById('typing-input');
            if (inputField) {
               inputField.value = '';
            }
            this.renderLessonView();
        }, 200);
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

        this.mainContent.innerHTML = `
            <div class="text-center max-w-lg mx-auto">
                <h2 class="text-3xl font-bold text-accent mb-4">পাঠ ${this.state.currentLesson + 1} সম্পন্ন!</h2>
                <div class="bg-white p-6 rounded-lg shadow-md">
                    <p class="text-xl mb-4">আপনার গতি ছিল: <span class="font-bold text-2xl">${wpm} WPM</span></p>
                    <p class="text-lg text-gray-600 mb-6">খুব ভালো করেছেন! অনুশীলন চালিয়ে যান।</p>
                    <div class="flex justify-center space-x-4">
                        <button onclick="app.startLesson(${this.state.currentLesson})" class="btn-accent py-2 px-6 rounded-lg">পুনরায় চেষ্টা</button>
                        <button onclick="app.navigateTo('learn')" class="bg-gray-200 text-gray-800 hover:bg-gray-300 py-2 px-6 rounded-lg">অন্য পাঠ</button>
                    </div>
                </div>
            </div>
        `;
    };

    App.prototype.renderPracticePage = function() {
         this.mainContent.innerHTML = `
            <div class="text-center">
                <h2 class="text-3xl font-bold mb-2">মুক্ত অনুশীলন</h2>
                <p class="text-gray-600 mb-8">এইখানে আপনি যা ইচ্ছা টাইপ করে অনুশীলন করতে পারেন।</p>
                <textarea class="w-full max-w-4xl mx-auto p-4 border-2 border-gray-300 rounded-lg text-lg focus:border-accent focus:ring-accent" rows="10" placeholder="এখানে টাইপ করুন..."></textarea>
            </div>
        `;
    };

    App.prototype.renderProgressPage = function() {
        this.mainContent.innerHTML = `
            <div class="text-center mb-8">
                <h2 class="text-3xl font-bold mb-2">আপনার অগ্রগতি</h2>
                <p class="text-gray-600">আপনার টাইপিং গতি এবং সম্পন্ন করা পাঠসমূহ দেখুন।</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="bg-white p-6 rounded-xl shadow-md">
                    <h3 class="font-bold text-xl mb-4 text-center">টাইপিং গতি (WPM)</h3>
                    <div class="chart-container"><canvas id="wpmChart"></canvas></div>
                </div>
                <div class="bg-white p-6 rounded-xl shadow-md">
                    <h3 class="font-bold text-xl mb-4 text-center">পাঠ সমাপ্তি</h3>
                    <div class="chart-container"><canvas id="completionChart"></canvas></div>
                </div>
            </div>
        `;
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