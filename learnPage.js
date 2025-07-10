// learnPage.js
export function renderLearnPage() {
    this.state.currentLesson = null;
    const levelsContainer = document.getElementById('levels-container');
    levelsContainer.innerHTML = '';

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
}

export function startLesson(lessonIndex) {
    const levelIndex = this.state.lessonLevels.findIndex(level => level.lessons.includes(lessonIndex));
    if (!this.state.progressData.unlockedLevels.has(levelIndex)) {
        console.warn(`Lesson ${lessonIndex + 1} is locked. Unlock previous levels first.`);
        return;
    }

    this.state.currentLesson = lessonIndex;
    this.state.currentWordIndex = 0;
    this.state.userInput = '';
    this.state.startTime = null;
    this.state.correctCharsCount = 0;
    this.state.incorrectCharsCount = 0;
    this.state.totalKeystrokes = 0;
    this.state.mistakeCount = 0;
    this.state.highlightedKey = null;
    this.state.isShiftActive = false;

    const lesson = this.state.syllabus[this.state.currentLesson];
    const selectedLayoutHints = this.state.keyboardHintData[this.state.userPreferences.keyboardLayout];
    let hintData = null;
    if (selectedLayoutHints && selectedLayoutHints[this.state.currentLesson]) {
        hintData = selectedLayoutHints[this.state.currentLesson];
    } else {
        console.warn(`Hints for layout '${this.state.userPreferences.keyboardLayout}' not found for lesson ${this.state.currentLesson}. Falling back to Avro hints.`);
        hintData = this.state.keyboardHintData.avro[this.state.currentLesson];
    }

    this.state.currentLessonData = {
        items: [...(lesson.characters || []), ...(lesson.words || []), ...(lesson.phrases || [])],
        phonetic_items: this.state.userPreferences.keyboardLayout === 'bijoy' 
            ? [...(hintData.char_keys || []), ...(hintData.word_keys || []), ...(hintData.phrase_keys || [])]
            : [...(hintData.phonetic_char || []), ...(hintData.phonetic_words || []), ...(hintData.phrases_phonetic || [])]
    };

    this.navigateTo('lesson');
}

export function checkForLevelUnlock() {
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
}