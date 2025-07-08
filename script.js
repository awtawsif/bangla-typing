let app; // Declare app in the global scope

document.addEventListener('DOMContentLoaded', () => {
    const App = function() {
        this.state = {
            currentPage: 'learn',
            currentLesson: null,
            currentWordIndex: 0,
            userInput: '',
            startTime: null,
            correctCharsCount: 0,
            incorrectCharsCount: 0,
            totalKeystrokes: 0,
            mistakeCount: 0,
            progressData: {
                completedLessons: new Set(),
                performance: [],
                unlockedLevels: new Set([0]) // Start with Level 1 unlocked (index 0)
            },
            // User preferences
            userPreferences: {
                keyboardLayout: 'avro', // Default to Avro
                experienceLevel: 'new', // Default to new
                onboardingCompleted: false, // Track if onboarding is done
                theme: 'system' // New: 'system', 'light', 'dark'
            },
            syllabus: [], // Will hold main lesson content
            keyboardHintData: { // Will hold hint data for different layouts
                avro: null, // Will load avro_hint.json here
                bijoy: null, // Placeholder for bijoy_hint.json
                probhat: null // Placeholder for probhat_hint.json
            },
            currentLessonData: {
                items: [], // Bengali text
                phonetic_items: [] // Phonetic hints based on selected layout
            },
            isHintVisible: false,
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
            profile: document.getElementById('profile-view'), // Changed from progress
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
        this.onboardingModal = document.getElementById('onboarding-modal');
        this.confirmationModal = document.getElementById('confirmation-modal');
        

        // Chart instances to be destroyed before re-rendering
        this.wpmChartInstance = null;
        this.completionChartInstance = null;
    };

    App.prototype.init = async function() {
        await this.loadAllData();
        this.loadProgress(); // This also loads user preferences now

        // Set initial keyboard layout in UI dropdowns
        const keyboardSelect = document.getElementById('keyboard-layout-select');
        if (keyboardSelect) {
            keyboardSelect.value = this.state.userPreferences.keyboardLayout;
        }
        const profileKeyboardSelect = document.getElementById('profile-keyboard-layout-select');
        if (profileKeyboardSelect) {
            profileKeyboardSelect.value = this.state.userPreferences.keyboardLayout;
        }

        // Apply theme preference on init
        this.applyTheme(this.state.userPreferences.theme);

        if (!this.state.userPreferences.onboardingCompleted) {
            this.showOnboarding();
        } else {
            const hash = window.location.hash.replace('#', '');
            const initialPage = ['learn', 'practice', 'profile'].includes(hash) ? hash : 'learn';
            this.navigateTo(initialPage);
        }
        
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
                    // console.log("Lesson is locked!"); // Or show a visual cue to the user
                }
            }
        });

        // Onboarding button listener
        document.getElementById('onboarding-start-button').addEventListener('click', () => this.completeOnboarding());
        // Reset confirmation button listener
        document.getElementById('confirm-reset-button').addEventListener('click', () => this.resetProgress());
    };
    
    App.prototype.toggleMobileMenu = function() {
        this.mobileMenu.classList.toggle('hidden');
    };

    App.prototype.handleHashChange = function() {
        const hash = window.location.hash.replace('#', '');
        if (['learn', 'practice', 'profile'].includes(hash) && this.state.currentPage !== hash) {
            this.navigateTo(hash);
        }
    };

    App.prototype.loadAllData = async function() {
        try {
            const [syllabusResponse, avroHintResponse] = await Promise.all([
                fetch('syllabus.json'),
                fetch('avro_hint.json')
            ]);
            this.state.syllabus = await syllabusResponse.json();
            this.state.keyboardHintData.avro = await avroHintResponse.json();
            // In the future, you would load bijoy_hint.json and probhat_hint.json here:
            // const bijoyHintResponse = await fetch('bijoy_hint.json');
            // this.state.keyboardHintData.bijoy = await bijoyHintResponse.json();
            // const probhatHintResponse = await fetch('probhat_hint.json');
            // this.state.keyboardHintData.probhat = await probhatHintResponse.json();

        } catch (error) {
            console.error('Failed to load data:', error);
            document.getElementById('levels-container').innerHTML = '<p class="text-center text-red-500">ডেটা লোড করা যায়নি। অনুগ্রহ করে আপনার ইন্টারনেট সংযোগ পরীক্ষা করুন।</p>';
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
            case 'profile': // Changed from progress
                this.renderProfilePage(); // New method for profile
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
            // Updated to check for 'profile' instead of 'progress'
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
                const lesson = this.state.syllabus[lessonIndex]; // Get main lesson data
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
            console.warn(`Lesson ${lessonIndex + 1} is locked. Unlock previous levels first.`);
            return;
        }

        this.state.currentLesson = lessonIndex;
        this.state.currentWordIndex = 0;
        this.state.userInput = '';
        this.state.startTime = null;
        this.state.isHintVisible = true;
        this.state.correctCharsCount = 0;
        this.state.incorrectCharsCount = 0;
        this.state.totalKeystrokes = 0;
        this.state.mistakeCount = 0;

        const lesson = this.state.syllabus[this.state.currentLesson]; // Main lesson content
        const selectedLayoutHints = this.state.keyboardHintData[this.state.userPreferences.keyboardLayout];
        let hintData = null;
        if (selectedLayoutHints && selectedLayoutHints[this.state.currentLesson]) {
            hintData = selectedLayoutHints[this.state.currentLesson];
        } else {
            // Fallback to Avro hints if selected layout hints are not available for this lesson
            console.warn(`Hints for layout '${this.state.userPreferences.keyboardLayout}' not found for lesson ${this.state.currentLesson}. Falling back to Avro hints.`);
            hintData = this.state.keyboardHintData.avro[this.state.currentLesson];
        }

        this.state.currentLessonData = {
            items: [...(lesson.characters || []), ...(lesson.words || []), ...(lesson.phrases || [])],
            // Use phonetic data from the selected hint file
            phonetic_items: [...(hintData.phonetic_char || []), ...(hintData.phonetic_words || []), ...(hintData.phrases_phonetic || [])]
        };

        this.navigateTo('lesson');
    };

    App.prototype.toggleHint = function() {
        this.state.isHintVisible = !this.state.isHintVisible;
        this.renderLessonView();
    };

    App.prototype.renderLessonView = function() {
        const lesson = this.state.syllabus[this.state.currentLesson]; // Main lesson content
        const selectedLayoutHints = this.state.keyboardHintData[this.state.userPreferences.keyboardLayout];
        let hintData = null;
        if (selectedLayoutHints && selectedLayoutHints[this.state.currentLesson]) {
            hintData = selectedLayoutHints[this.state.currentLesson];
        } else {
            // Fallback to Avro hints if selected layout hints are not available for this lesson
            console.warn(`Hints for layout '${this.state.userPreferences.keyboardLayout}' not found for lesson ${this.state.currentLesson} during render. Falling back to Avro hints.`);
            hintData = this.state.keyboardHintData.avro[this.state.currentLesson];
        }

        const { items, phonetic_items } = this.state.currentLessonData;

        if (this.state.currentWordIndex >= items.length) {
            this.completeLesson();
            return;
        }

        const currentItem = items[this.state.currentWordIndex];
        const phoneticItem = phonetic_items[this.state.currentWordIndex];
        
        this.lessonElements.title.textContent = `${lesson.title}`;
        this.lessonElements.typingDisplay.innerHTML = this.getDisplayHTML(currentItem, this.state.userInput);
        this.lessonElements.typingDisplay.classList.remove('text-change-animation');
        void this.lessonElements.typingDisplay.offsetWidth; // Trigger reflow
        this.lessonElements.typingDisplay.classList.add('text-change-animation');
        this.lessonElements.phoneticDisplay.textContent = `(${phoneticItem})`;
        this.lessonElements.wordCount.textContent = `শব্দ: ${this.convertToBengaliNumber(this.state.currentWordIndex + 1)} / ${this.convertToBengaliNumber(items.length)}`;

        // Use keyboard_map from the selected hint file
        if (this.state.isHintVisible && hintData.keyboard_map) {
            this.lessonElements.hintContainer.classList.remove('hidden');
            this.lessonElements.keyboardMapContainer.innerHTML = Object.entries(hintData.keyboard_map).map(([key, value]) => `
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

        this.state.totalKeystrokes++;

        const currentInputLength = this.state.userInput.length;
        if (currentInputLength > 0 && currentInputLength <= currentItem.length) {
            if (this.state.userInput[currentInputLength - 1] !== currentItem[currentInputLength - 1]) {
                this.state.mistakeCount++;
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

        if (e.key === 'Enter' || (e.key === ' ' && this.state.userInput === currentItem)) {
            e.preventDefault();
            if (this.state.userInput === currentItem) {
                this.moveToNextWord();
            } else {
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
        const timeTaken = (endTime - this.state.startTime) / 1000;
        
        // Use the phonetic_items from the currentLessonData (which is already layout-specific)
        const { phonetic_items } = this.state.currentLessonData;
        const totalTargetChars = phonetic_items.reduce((acc, item) => acc + item.length, 0);
        
        const wpm = timeTaken > 0 ? Math.round((totalTargetChars / 5) / (timeTaken / 60)) : 0;

        let accuracy = 0;
        if (this.state.totalKeystrokes > 0) {
            accuracy = Math.round(100 - (this.state.mistakeCount / this.state.totalKeystrokes) * 100);
        }
        const correctChars = this.state.totalKeystrokes - this.state.mistakeCount;

        this.state.progressData.completedLessons.add(this.state.currentLesson);
        this.state.progressData.performance.push({
            lesson: this.state.currentLesson,
            wpm: wpm,
            accuracy: accuracy,
            date: new Date().toISOString().split('T')[0]
        });

        this.checkForLevelUnlock();
        this.saveProgress();

        this.navigateTo('completion');
        this.completionElements.title.textContent = `পাঠ ${this.convertToBengaliNumber(this.state.currentLesson + 1)} সম্পন্ন!`;
        this.completionElements.wpmResult.innerHTML = `${this.convertToBengaliNumber(wpm)} WPM <span class="text-lg text-gray-600">(${this.convertToBengaliNumber(accuracy)}% নির্ভুলতা)</span><br><span class="text-base text-gray-700">মোট অক্ষর: ${this.convertToBengaliNumber(this.state.totalKeystrokes)}, সঠিক: ${this.convertToBengaliNumber(correctChars)}, ভুল: ${this.convertToBengaliNumber(this.state.mistakeCount)}</span>`;
        this.completionElements.retryButton.onclick = () => this.startLesson(this.state.currentLesson);

        const nextLessonButton = document.getElementById('next-lesson-button');
        const nextLesson = this.state.currentLesson + 1;

        // Check if there is a next lesson
        if (nextLesson < this.state.syllabus.length) {
            const nextLessonLevelIndex = this.state.lessonLevels.findIndex(level => level.lessons.includes(nextLesson));
            const isNextLevelUnlocked = this.state.progressData.unlockedLevels.has(nextLessonLevelIndex);

            // If the next level is unlocked, show "Next Lesson" button
            if (isNextLevelUnlocked) {
                nextLessonButton.textContent = 'পরবর্তী পাঠ';
                nextLessonButton.onclick = () => this.startLesson(nextLesson);
                nextLessonButton.classList.remove('hidden'); // Ensure it's visible
            } else {
                // If the next level is locked, show "Other Lessons" button
                nextLessonButton.textContent = 'অন্য পাঠ';
                nextLessonButton.onclick = () => this.navigateTo('learn');
                nextLessonButton.classList.remove('hidden'); // Ensure it's visible
            }
        } else {
            // If it's the last lesson of the syllabus, show "Other Lessons" button
            nextLessonButton.textContent = 'অন্য পাঠ';
            nextLessonButton.onclick = () => this.navigateTo('learn');
            nextLessonButton.classList.remove('hidden'); // Ensure it's visible
        }
    };

    App.prototype.startNextLesson = function() {
        const nextLesson = this.state.currentLesson + 1;
        if (nextLesson < this.state.syllabus.length) {
            this.startLesson(nextLesson);
        }
    };

    App.prototype.checkForLevelUnlock = function() {
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
                        // console.log(`Level ${nextLevelIndex + 1} unlocked!`);
                    }
                }
            }
        }
    };

    App.prototype.renderPracticePage = function() {
        // No dynamic content to render, view is already in HTML
    };

    App.prototype.renderProfilePage = function() { // New method for profile page
        this.renderCharts();
        // Set the current keyboard layout in the profile settings dropdown
        document.getElementById('profile-keyboard-layout-select').value = this.state.userPreferences.keyboardLayout;
        // Set the current theme in the profile settings dropdown
        document.getElementById('profile-dark-mode-select').value = this.state.userPreferences.theme;
    };
    
    App.prototype.renderCharts = function() {
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

        // Determine text color for charts based on theme
        const chartTextColor = (this.state.userPreferences.theme === 'dark' || (this.state.userPreferences.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) ? '#e2e8f0' : '#000';
        const chartGridColor = (this.state.userPreferences.theme === 'dark' || (this.state.userPreferences.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
        const chartLineColorWPM = (this.state.userPreferences.theme === 'dark' || (this.state.userPreferences.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) ? '#81B29A' : '#81B29A'; // Greenish
        const chartLineFillWPM = (this.state.userPreferences.theme === 'dark' || (this.state.userPreferences.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) ? 'rgba(129, 178, 154, 0.3)' : 'rgba(129, 178, 154, 0.2)';
        const chartLineColorAccuracy = (this.state.userPreferences.theme === 'dark' || (this.state.userPreferences.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) ? '#F2CC8F' : '#F2CC8F'; // Yellowish
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
                                color: chartTextColor // X-axis labels
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
                                color: chartTextColor // Y-axis title
                            },
                            ticks: {
                                callback: (value) => this.convertToBengaliNumber(value),
                                color: chartTextColor // Y-axis labels
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
                                color: chartTextColor // Y1-axis title
                            },
                            min: 0,
                            max: 100,
                            ticks: {
                                callback: (value) => this.convertToBengaliNumber(value),
                                color: chartTextColor // Y1-axis labels
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            labels: {
                                color: chartTextColor // Legend text color
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
                        family: 'Hind Siliguri', // <-- your custom font
                        size: 14,
                        weight: 'normal'
                        },
                        color: chartTextColor // Legend text color
                    }
                    },
                    tooltip: {
                    bodyFont: {
                        family: 'Hind Siliguri', // <-- font for tooltip body
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
    };

    App.prototype.saveProgress = function() {
        try {
            localStorage.setItem('typingProgress', JSON.stringify({
                completedLessons: Array.from(this.state.progressData.completedLessons),
                performance: this.state.progressData.performance,
                unlockedLevels: Array.from(this.state.progressData.unlockedLevels),
                userPreferences: this.state.userPreferences // Save user preferences
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
                    unlockedLevels: new Set(parsed.unlockedLevels || [0])
                };
                // Load user preferences, merging with defaults to prevent missing properties
                const defaultPreferences = {
                    keyboardLayout: 'avro',
                    experienceLevel: 'new',
                    onboardingCompleted: false,
                    theme: 'system'
                };
                this.state.userPreferences = Object.assign({}, defaultPreferences, parsed.userPreferences);

                // If old data format, convert isDarkMode to theme
                if (this.state.userPreferences.isDarkMode !== undefined) {
                    this.state.userPreferences.theme = this.state.userPreferences.isDarkMode ? 'dark' : 'light';
                    delete this.state.userPreferences.isDarkMode; // Clean up old property
                }
            } else {
                // If no saved data, set theme to system preference
                this.state.userPreferences.theme = 'system';
            }
        } catch (e) {
            console.error("Failed to load progress from localStorage", e);
            // Defaults are now handled by Object.assign, so no specific fallback is needed here.
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

    // Onboarding and Profile Customization Methods
    App.prototype.showOnboarding = function() {
        this.onboardingModal.classList.remove('hidden');
        // Ensure initial values are set in the onboarding modal
        document.getElementById('onboarding-keyboard-layout').value = this.state.userPreferences.keyboardLayout;
        document.getElementById('onboarding-experience-level').value = this.state.userPreferences.experienceLevel;
        document.getElementById('onboarding-dark-mode').value = this.state.userPreferences.theme;
    };

    App.prototype.completeOnboarding = function() {
        this.state.userPreferences.keyboardLayout = document.getElementById('onboarding-keyboard-layout').value;
        this.state.userPreferences.experienceLevel = document.getElementById('onboarding-experience-level').value;
        this.state.userPreferences.theme = document.getElementById('onboarding-dark-mode').value;
        this.state.userPreferences.onboardingCompleted = true;
        this.saveProgress(); // Save preferences
        this.applyTheme(this.state.userPreferences.theme); // Apply the selected theme immediately

        // Apply level unlocking based on experience level
        this.state.progressData.unlockedLevels.clear(); // Clear existing unlocked levels
        this.state.progressData.unlockedLevels.add(0); // Always unlock Level 1 (index 0)

        if (this.state.userPreferences.experienceLevel === 'intermediate') {
            this.state.progressData.unlockedLevels.add(1); // Unlock Level 2
            this.state.progressData.unlockedLevels.add(2); // Unlock Level 3
        } else if (this.state.userPreferences.experienceLevel === 'experienced') {
            // Unlock all levels
            for (let i = 0; i < this.state.lessonLevels.length; i++) {
                this.state.progressData.unlockedLevels.add(i);
            }
        }
        this.saveProgress(); // Save updated unlocked levels

        this.onboardingModal.classList.add('hidden');
        // Update the main header dropdown
        document.getElementById('keyboard-layout-select').value = this.state.userPreferences.keyboardLayout;
        this.navigateTo('learn'); // Navigate to learn page after onboarding
        this.renderLearnPage(); // Re-render learn page to show newly unlocked lessons
    };

    App.prototype.setKeyboardLayout = function(layout) {
        this.state.userPreferences.keyboardLayout = layout;
        this.saveProgress(); // Save preference immediately
        // Update both dropdowns to reflect the change
        document.getElementById('keyboard-layout-select').value = layout;
        const profileKeyboardSelect = document.getElementById('profile-keyboard-layout-select');
        if (profileKeyboardSelect) {
            profileKeyboardSelect.value = layout;
        }
        // If on a lesson, re-render to update hints
        if (this.state.currentPage === 'lesson' && this.state.currentLesson !== null) {
            this.renderLessonView();
        }
    };

    App.prototype.showResetConfirmation = function() {
        this.confirmationModal.classList.remove('hidden');
    };

    App.prototype.hideConfirmation = function() {
        this.confirmationModal.classList.add('hidden');
    };

    App.prototype.resetProgress = function() {
        // Reset only progress-related data, keep preferences
        this.state.progressData = {
            completedLessons: new Set(),
            performance: [],
            unlockedLevels: new Set([0]) // Reset to only Level 1 unlocked
        };
        this.saveProgress(); // Save the reset state
        this.hideConfirmation();
        this.navigateTo('profile'); // Go back to profile to see changes
        this.renderProfilePage(); // Re-render charts
        this.renderLearnPage(); // Re-render learn page to show locked lessons
    };

    
    App.prototype.setDarkMode = function(theme) {
        this.state.userPreferences.theme = theme;
        this.applyTheme(theme);
        this.saveProgress();
        // Re-render charts if on profile page to apply new colors
        if (this.state.currentPage === 'profile') {
            this.renderProfilePage();
        }
    };

    App.prototype.applyTheme = function(theme) {
        let isDarkMode = false;
        if (theme === 'dark') {
            isDarkMode = true;
        } else if (theme === 'light') {
            isDarkMode = false;
        } else { // system
            isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        }

        if (isDarkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
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
