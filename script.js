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
        };
        this.mainContent = document.getElementById('main-content');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.mobileMenu = document.getElementById('mobile-menu');
    };

    App.prototype.init = async function() {
        await this.loadSyllabus();
        this.loadProgress();
        const hash = window.location.hash.replace('#', '');
        const initialPage = ['learn', 'practice', 'progress', 'guide'].includes(hash) ? hash : 'learn';
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

        // Listen for physical keyboard events for virtual keyboard feedback
        window.addEventListener('keydown', (e) => this.handlePhysicalKeydown(e));
        window.addEventListener('keyup', (e) => this.handlePhysicalKeyup(e));
    };
    
    App.prototype.toggleMobileMenu = function() {
        this.mobileMenu.classList.toggle('hidden');
    };

    App.prototype.handleHashChange = function() {
        const hash = window.location.hash.replace('#', '');
        if (['learn', 'practice', 'progress', 'guide'].includes(hash) && this.state.currentPage !== hash) {
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
            case 'guide':
                this.renderGuidePage();
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
        // Hide keyboard when not in lesson
        const keyboardContainer = document.getElementById('keyboard-container');
        if (keyboardContainer) keyboardContainer.innerHTML = '';

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
        this.renderLessonView();
        this.renderKeyboard();
        // Highlight the first expected key immediately
        const lesson = this.state.syllabus[this.state.currentLesson];
        const practiceItems = lesson.words;
        const currentItem = practiceItems[this.state.currentWordIndex];
        this.updateKeyboard(currentItem, "");
    };

    App.prototype.renderLessonView = function() {
        const lesson = this.state.syllabus[this.state.currentLesson];
        const practiceItems = lesson.words;
        const phoneticItems = lesson.phonetic_words;

        if (this.state.currentWordIndex >= practiceItems.length) {
            // Hide keyboard after lesson complete
            const keyboardContainer = document.getElementById('keyboard-container');
            if (keyboardContainer) keyboardContainer.innerHTML = '';
            this.completeLesson();
            return;
        }

        const currentItem = practiceItems[this.state.currentWordIndex];
        const phoneticItem = phoneticItems[this.state.currentWordIndex];
        const displayHTML = this.getDisplayHTML(currentItem, this.state.userInput);

        // Move keyboard below typing area by rendering a placeholder div
        this.mainContent.innerHTML = `
            <div class="max-w-3xl mx-auto flex flex-col gap-6">
                <div class="flex justify-between items-center mb-2">
                    <button onclick="app.navigateTo('learn')" class="btn-accent py-2 px-4 rounded-lg flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
                        সব পাঠ
                    </button>
                    <h2 class="text-2xl font-bold text-center flex-1">পাঠ ${this.state.currentLesson + 1}: ${lesson.title}</h2>
                    <div style="width:40px"></div>
                </div>
                <div class="bg-secondary p-6 rounded-xl shadow-inner flex flex-col gap-2">
                    <p class="text-center text-gray-600 mb-2">নিচের লেখাটির জন্য টাইপ করুন:</p>
                    <div id="typing-display" class="typing-display text-center mb-2">${displayHTML}</div>
                    <p class="text-center text-gray-500 mb-4">(${phoneticItem})</p>
                    <textarea id="typing-input" class="w-full p-4 border-2 border-gray-300 rounded-lg text-2xl focus:border-accent focus:ring-accent" rows="3" autofocus></textarea>
                    <div class="text-center mt-4 text-gray-500">শব্দ: ${this.state.currentWordIndex + 1} / ${practiceItems.length}</div>
                </div>
                <div id="onscreen-keyboard-placeholder"></div>
            </div>
        `;

        // Move the keyboard into the placeholder
        const keyboardContainer = document.getElementById('keyboard-container');
        const placeholder = document.getElementById('onscreen-keyboard-placeholder');
        if (keyboardContainer && placeholder) {
            placeholder.appendChild(keyboardContainer);
            keyboardContainer.style.display = 'block';
        }

        const input = document.getElementById('typing-input');
        input.focus();
        // Highlight the first expected key after rendering view
        this.updateKeyboard(currentItem, this.state.userInput);
    };

    App.prototype.handleTyping = function(e) {
        if (this.state.startTime === null && e.target.value.length > 0) {
            this.state.startTime = new Date();
        }
        this.state.userInput = e.target.value;
        const lesson = this.state.syllabus[this.state.currentLesson];
        const practiceItems = lesson.words;
        // const phoneticItems = lesson.phonetic_words;
        const currentItem = practiceItems[this.state.currentWordIndex];
        // const currentPhoneticItem = phoneticItems[this.state.currentWordIndex];
        
        const display = document.getElementById('typing-display');
        if (display) {
            display.innerHTML = this.getDisplayHTML(currentItem, this.state.userInput);
        }

        this.updateKeyboard(currentItem, this.state.userInput);

        // Remove auto move to next word here
        // if (this.state.userInput === currentPhoneticItem) {
        //     this.moveToNextWord();
        // }
    };

    // New: handle keydown for space/enter to move to next word/phrase
    App.prototype.handleTypingKeydown = function(e) {
        // Only act on Space or Enter
        if (e.key === ' ' || e.key === 'Enter') {
            const lesson = this.state.syllabus[this.state.currentLesson];
            const practiceItems = lesson.words;
            const currentItem = practiceItems[this.state.currentWordIndex];
            // Trim input to avoid trailing spaces
            const trimmedInput = this.state.userInput.trim();
            // Only move to next if input matches the target exactly
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
        
        const lesson = this.state.syllabus[this.state.currentLesson];
        const phoneticItems = lesson.phonetic_words;
        const totalChars = phoneticItems.reduce((acc, item) => acc + item.length, 0);
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
        // Hide keyboard when not in lesson
        const keyboardContainer = document.getElementById('keyboard-container');
        if (keyboardContainer) keyboardContainer.innerHTML = '';
         this.mainContent.innerHTML = `
            <div class="text-center">
                <h2 class="text-3xl font-bold mb-2">মুক্ত অনুশীলন</h2>
                <p class="text-gray-600 mb-8">এইখানে আপনি যা ইচ্ছা টাইপ করে অনুশীলন করতে পারেন।</p>
                <textarea class="w-full max-w-4xl mx-auto p-4 border-2 border-gray-300 rounded-lg text-lg focus:border-accent focus:ring-accent" rows="10" placeholder="এখানে টাইপ করুন..."></textarea>
            </div>
        `;
    };

    App.prototype.renderProgressPage = function() {
        // Hide keyboard when not in lesson
        const keyboardContainer = document.getElementById('keyboard-container');
        if (keyboardContainer) keyboardContainer.innerHTML = '';
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

    App.prototype.renderGuidePage = function() {
        // Hide keyboard when not in lesson
        const keyboardContainer = document.getElementById('keyboard-container');
        if (keyboardContainer) keyboardContainer.innerHTML = '';
        this.mainContent.innerHTML = `
            <div class="max-w-4xl mx-auto">
                <h2 class="text-3xl font-bold text-center mb-8">দ্রুত সহায়িকা</h2>
                <div class="space-y-6">
                    <div class="bg-white p-6 rounded-xl shadow-md">
                        <h3 class="font-bold text-xl mb-3">মৌলিক স্বরবর্ণ</h3>
                        <p><strong>অ:</strong> o, <strong>আ:</strong> a, <strong>ই:</strong> i, <strong>ঈ:</strong> I/ee, <strong>উ:</strong> u, <strong>ঊ:</strong> U, <strong>ঋ:</strong> rri, <strong>এ:</strong> e, <strong>ঐ:</strong> OI, <strong>ও:</strong> O, <strong>ঔ:</strong> OU</p>
                    </div>
                    <div class="bg-white p-6 rounded-xl shadow-md">
                        <h3 class="font-bold text-xl mb-3">ফলা-চিহ্ন</h3>
                        <p><strong>ব-ফলা ( ্ব ):</strong> w (e.g., bishwo -> বিশ্ব), <strong>য-ফলা ( ্য ):</strong> y (e.g., byasto -> ব্যস্ত), <strong>র-ফলা ( ্র ):</strong> r (e.g., prokash -> প্রকাশ), <strong>রেফ ( র্র ):</strong> rr (e.g., orrtho -> অর্থ)</p>
                    </div>
                     <div class="bg-white p-6 rounded-xl shadow-md">
                        <h3 class="font-bold text-xl mb-3">বিশেষ অক্ষর ও যতিচিহ্ন</h3>
                        <ul class="list-disc list-inside space-y-2">
                            <li><strong>দাঁড়ি (।):</strong> . (period)</li>
                            <li><strong>টাকা (৳):</strong> $ (dollar sign)</li>
                            <li><strong>ৎ (খণ্ড-ত):</strong> t\`\` (t followed by two accent keys)</li>
                            <li><strong>ং (অনুস্বার):</strong> ng</li>
                            <li><strong>ঃ (বিসর্গ):</strong> : (colon)</li>
                            <li><strong>ঁ (চন্দ্রবিন্দু):</strong> ^ (caret, may vary)</li>
                            <li><strong>Accent Key (\`):</strong> যুক্তাক্ষর ভাঙতে বা মূল স্বরবর্ণ লিখতে ব্যবহৃত হয়। যেমন: amra (আম্রা) vs am\`ra (আমরা)</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
    };

    // Helper: mapping Bangla char to expected key (simplified for demo)
    App.prototype.getExpectedKey = function(target, input) {
        // For now, just use the next Bangla character and map to phonetic key
        // You may want to improve this mapping for full phonetic support
        const charToKey = {
            'অ': 'o', 'আ': 'a', 'ই': 'i', 'ঈ': 'I', 'উ': 'u', 'ঊ': 'U', 'ঋ': 'rri', 'এ': 'e', 'ঐ': 'oi', 'ও': 'O', 'ঔ': 'ou',
            'ক': 'k', 'খ': 'kh', 'গ': 'g', 'ঘ': 'gh', 'ঙ': 'Ng', 'চ': 'c', 'ছ': 'ch', 'জ': 'j', 'ঝ': 'jh', 'ঞ': 'Y',
            'ট': 'T', 'ঠ': 'Th', 'ড': 'D', 'ঢ': 'Dh', 'ণ': 'N', 'ত': 't', 'থ': 'th', 'দ': 'd', 'ধ': 'dh', 'ন': 'n',
            'প': 'p', 'ফ': 'f', 'ব': 'b', 'ভ': 'v', 'ম': 'm', 'য': 'z', 'র': 'r', 'ল': 'l', 'শ': 'S', 'ষ': 'Sh', 'স': 's', 'হ': 'h',
            'ড়': 'R', 'ঢ়': 'Rh', 'য়': 'y', 'ৎ': '.t', 'ং': 'ng', 'ঃ': ':', 'ঁ': 'n',
            'া': 'a', 'ি': 'i', 'ী': 'I', 'ু': 'u', 'ূ': 'U', 'ৃ': 'rri', 'ে': 'e', 'ৈ': 'oi', 'ো': 'O', 'ৌ': 'ou',
            ' ': ' ', ',': ',', '.': '.', '?': '?', '।': '.', '৳': '$', ':': ':', '-': '-', '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
        };
        const nextChar = target[input.length];
        if (!nextChar) return null;
        let key = charToKey[nextChar];
        if (!key) {
            // fallback: try to use the char itself if it's ascii
            key = nextChar;
        }
        // Only use first letter for highlighting (for multi-letter mappings)
        return key ? key[0].toLowerCase() : null;
    };

    App.prototype.renderKeyboard = function() {
        const keyboardContainer = document.getElementById('keyboard-container');
        const keys = [
            ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
            ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
            ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
            [' ', '.', ',', '?', '$']
        ];

        let keyboardHTML = '<div class="keyboard">';
        keys.forEach(row => {
            keyboardHTML += '<div class="keyboard-row">';
            row.forEach(key => {
                let display = key === ' ' ? '&nbsp;' : key;
                keyboardHTML += `<div class="key" data-key="${key}">${display}</div>`;
            });
            keyboardHTML += '</div>';
        });
        keyboardHTML += '</div>';
        keyboardContainer.innerHTML = keyboardHTML;
    };

    // Responsive keyboard update: show which key to press and which was pressed, color-coded
    App.prototype.updateKeyboard = function(target, input) {
        const keys = document.querySelectorAll('.key');
        keys.forEach(key => {
            key.classList.remove('active', 'pressed-correct', 'pressed-wrong');
        });

        // Highlight next expected key
        const expectedKey = this.getExpectedKey(target, input);
        if (expectedKey) {
            const keyToPress = document.querySelector(`.key[data-key="${expectedKey}"]`);
            if (keyToPress) {
                keyToPress.classList.add('active');
            }
        }

        // If last key pressed, highlight as pressed (handled by physical key events)
        // This is now handled in handlePhysicalKeydown/keyup
    };

    // Track last pressed key for feedback
    App.prototype.handlePhysicalKeydown = function(e) {
        // Only highlight if typing input is focused
        const input = document.getElementById('typing-input');
        if (!input || document.activeElement !== input) return;

        // Normalize key (space, etc.)
        let pressedKey = e.key;
        if (pressedKey === ' ') pressedKey = ' ';
        if (pressedKey.length === 1) pressedKey = pressedKey.toLowerCase();

        // Remove previous pressed states
        document.querySelectorAll('.key').forEach(key => {
            key.classList.remove('pressed-correct', 'pressed-wrong');
        });

        // Get expected key
        const lesson = this.state.syllabus[this.state.currentLesson];
        const practiceItems = lesson ? lesson.words : [];
        const currentItem = practiceItems[this.state.currentWordIndex] || '';
        const expectedKey = this.getExpectedKey(currentItem, this.state.userInput);

        // Find the virtual key
        const keyElem = document.querySelector(`.key[data-key="${pressedKey}"]`);
        if (keyElem) {
            if (pressedKey === expectedKey) {
                keyElem.classList.add('pressed-correct');
            } else {
                keyElem.classList.add('pressed-wrong');
            }
        }
    };

    App.prototype.handlePhysicalKeyup = function(e) {
        // Remove pressed state on keyup
        let releasedKey = e.key;
        if (releasedKey === ' ') releasedKey = ' ';
        if (releasedKey.length === 1) releasedKey = releasedKey.toLowerCase();
        const keyElem = document.querySelector(`.key[data-key="${releasedKey}"]`);
        if (keyElem) {
            keyElem.classList.remove('pressed-correct', 'pressed-wrong');
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
