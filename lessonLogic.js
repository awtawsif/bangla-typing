// lessonLogic.js

export function renderLessonView() {
    const lesson = this.state.syllabus[this.state.currentLesson];
    const selectedLayoutHints = this.state.keyboardHintData[this.state.userPreferences.keyboardLayout];
    let hintData = null;
    if (selectedLayoutHints && selectedLayoutHints[this.state.currentLesson]) {
        hintData = selectedLayoutHints[this.state.currentLesson];
    } else {
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
    
    this.lessonElements.typingDisplay.innerHTML = this.getDisplayHTML(currentItem, this.state.userInput);
    this.lessonElements.typingDisplay.classList.remove('text-change-animation');
    void this.lessonElements.typingDisplay.offsetWidth;
    this.lessonElements.typingDisplay.classList.add('text-change-animation');
    
    if (this.state.userPreferences.showPhoneticHint) {
        this.lessonElements.phoneticDisplay.textContent = `(${phoneticItem})`;
        this.lessonElements.phoneticDisplay.classList.remove('hidden');
    } else {
        this.lessonElements.phoneticDisplay.classList.add('hidden');
    }

    if (this.state.userPreferences.showKeyboardHint && this.state.userPreferences.keyboardLayout === 'avro') {
        this.lessonElements.hintContainer.classList.remove('hidden');
        this.renderKeyboard();
        this.updateKeyboardHighlight();
    } else {
        this.lessonElements.hintContainer.classList.add('hidden');
    }

    this.lessonElements.typingInput.value = this.state.userInput;
    this.lessonElements.typingInput.focus();
}

export function handleTyping(e) {
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
    this.updateKeyboardHighlight();
}

export function handleTypingKeydown(e) {
    const { items } = this.state.currentLessonData;
    const currentItem = items[this.state.currentWordIndex];

    const pressedKeyEl = document.querySelector(`.key[data-code="${e.code}"]`);
    if (pressedKeyEl) {
        pressedKeyEl.classList.add('pressed-visual');
    }

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
}

export function handleTypingKeyup(e) {
    const pressedKeyEl = document.querySelector(`.key[data-code="${e.code}"]`);
    if (pressedKeyEl) {
        pressedKeyEl.classList.remove('pressed-visual');
    }
}

export function getDisplayHTML(target, input) {
    let html = '';
    for (let i = 0; i < target.length; i++) {
        if (i < input.length) {
            html += `<span class="${target[i] === input[i] ? 'correct' : 'incorrect'}">${target[i]}</span>`;
        } else {
            html += `<span>${target[i]}</span>`;
        }
    }
    return html;
}

export function moveToNextWord() {
    this.state.currentWordIndex++;
    this.state.userInput = '';
    this.renderLessonView();
}

export function completeLesson() {
    const endTime = new Date();
    const timeTaken = (endTime - this.state.startTime) / 1000;
    
    const { phonetic_items } = this.state.currentLessonData;
    const totalTargetChars = phonetic_items.reduce((acc, item) => acc + item.length, 0);
    
    const wpm = timeTaken > 0 ? Math.round((totalTargetChars / 5) / (timeTaken / 60)) : 0;

    let accuracy = 0;
    if (this.state.totalKeystrokes > 0) {
        accuracy = Math.round(100 - (this.state.mistakeCount / this.state.totalKeystrokes) * 100);
    }
    const correctChars = this.state.totalKeystrokes - this.state.mistakeCount;

    this.state.progressData.completedLessons.add(this.state.currentLesson);
    const performanceEntry = {
        lesson: this.state.currentLesson,
        wpm: wpm,
        accuracy: accuracy,
        date: new Date().toISOString().split('T')[0]
    };

    const existingPerformanceIndex = this.state.progressData.performance.findIndex(p => p.lesson === this.state.currentLesson);

    if (existingPerformanceIndex !== -1) {
        this.state.progressData.performance[existingPerformanceIndex] = performanceEntry;
    } else {
        this.state.progressData.performance.push(performanceEntry);
    }

    this.checkForLevelUnlock();
    this.saveProgress();

    this.navigateTo('completion');
    this.completionElements.title.textContent = `পাঠ ${this.convertToBengaliNumber(this.state.currentLesson + 1)} সম্পন্ন!`;
    this.completionElements.wpmResult.innerHTML = `${this.convertToBengaliNumber(wpm)} WPM <span class="text-lg text-gray-600">(${this.convertToBengaliNumber(accuracy)}% নির্ভুলতা)</span><br><span class="text-base text-gray-700">মোট অক্ষর: ${this.convertToBengaliNumber(this.state.totalKeystrokes)}, সঠিক: ${this.convertToBengaliNumber(correctChars)}, ভুল: ${this.convertToBengaliNumber(this.state.mistakeCount)}</span>`;
    this.completionElements.retryButton.onclick = () => this.startLesson(this.state.currentLesson);

    const nextLessonButton = document.getElementById('next-lesson-button');
    const nextLesson = this.state.currentLesson + 1;

    if (nextLesson < this.state.syllabus.length) {
        const nextLessonLevelIndex = this.state.lessonLevels.findIndex(level => level.lessons.includes(nextLesson));
        const isNextLevelUnlocked = this.state.progressData.unlockedLevels.has(nextLessonLevelIndex);

        if (isNextLevelUnlocked) {
            nextLessonButton.textContent = 'পরবর্তী পাঠ';
            nextLessonButton.onclick = () => this.startLesson(nextLesson);
            nextLessonButton.classList.remove('hidden');
        } else {
            nextLessonButton.textContent = 'অন্য পাঠ';
            nextLessonButton.onclick = () => this.navigateTo('learn');
            nextLessonButton.classList.remove('hidden');
        }
    } else {
        nextLessonButton.textContent = 'অন্য পাঠ';
        nextLessonButton.onclick = () => this.navigateTo('learn');
        nextLessonButton.classList.remove('hidden');
    }
    this.updateKeyboardHighlight();
}

export function startNextLesson() {
    const nextLesson = this.state.currentLesson + 1;
    if (nextLesson < this.state.syllabus.length) {
        this.startLesson(nextLesson);
    }
}