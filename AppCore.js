// AppCore.js
import { keyboardLayoutData, lessonLevels } from './constants.js';
import { navigateTo, handleHashChange, updateNavLinks, executePageSpecificActions } from './navigation.js';
import { renderLearnPage, startLesson, checkForLevelUnlock } from './learnPage.js';
import { 
    renderLessonView, 
    handleTyping, 
    handleTypingKeydown, 
    handleTypingKeyup, 
    getDisplayHTML, 
    moveToNextWord, 
    completeLesson, 
    startNextLesson 
} from './lessonLogic.js';
import { renderKeyboard, updateKeyboardHighlight } from './keyboard.js';
import { renderProfilePage, renderCharts } from './profilePage.js';
import { saveProgress, saveUserPreferences, loadProgress, resetProgress } from './progressManagement.js';
import { showOnboarding, completeOnboarding } from './onboarding.js';
import { setKeyboardLayout, setTheme, setPreference, applyTheme } from './preferences.js';
import { convertToBengaliNumber } from './utils.js';

export const App = function() {
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
        userPreferences: {
            keyboardLayout: 'avro',
            onboardingCompleted: false,
            theme: 'system',
            showPhoneticHint: true,
            showWordCount: true,
            showKeyboardHint: true
        },
        syllabus: [], // Will hold main lesson content
        keyboardHintData: {
            avro: null,
            bijoy: null,
            probhat: null
        },
        currentLessonData: {
            items: [],
            phonetic_items: []
        },
        isHintVisible: true,
        lessonLevels: lessonLevels, // Imported from constants
        highlightedKey: null,
        isShiftActive: false
    };

    this.viewElements = {
        learn: document.getElementById('learn-view'),
        lesson: document.getElementById('lesson-view'),
        practice: document.getElementById('practice-view'),
        profile: document.getElementById('profile-view'),
        completion: document.getElementById('completion-view')
    };

    this.lessonElements = {
        title: document.getElementById('lesson-title'),
        typingDisplay: document.getElementById('typing-display'),
        phoneticDisplay: document.getElementById('phonetic-display'),
        typingInput: document.getElementById('typing-input'),
        wordCount: document.getElementById('word-count'),
        hintContainer: document.getElementById('hint-container'),
        onScreenKeyboard: document.getElementById('on-screen-keyboard'),
        lessonInstruction: document.getElementById('lesson-instruction')
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
    this.mainHeader = document.getElementById('main-header');

    this.wpmChartInstance = null;
    this.completionChartInstance = null;

    this.keyboardLayoutData = keyboardLayoutData; // Imported from constants

    // Bind methods to 'this'
    this.navigateTo = navigateTo.bind(this);
    this.handleHashChange = handleHashChange.bind(this);
    this.updateNavLinks = updateNavLinks.bind(this);
    this.executePageSpecificActions = executePageSpecificActions.bind(this);
    this.renderLearnPage = renderLearnPage.bind(this);
    this.startLesson = startLesson.bind(this);
    this.checkForLevelUnlock = checkForLevelUnlock.bind(this);
    this.renderLessonView = renderLessonView.bind(this);
    this.handleTyping = handleTyping.bind(this);
    this.handleTypingKeydown = handleTypingKeydown.bind(this);
    this.handleTypingKeyup = handleTypingKeyup.bind(this);
    this.getDisplayHTML = getDisplayHTML.bind(this);
    this.moveToNextWord = moveToNextWord.bind(this);
    this.completeLesson = completeLesson.bind(this);
    this.startNextLesson = startNextLesson.bind(this);
    this.renderKeyboard = renderKeyboard.bind(this);
    this.updateKeyboardHighlight = updateKeyboardHighlight.bind(this);
    this.renderProfilePage = renderProfilePage.bind(this);
    this.renderCharts = renderCharts.bind(this);
    this.saveProgress = saveProgress.bind(this);
    this.saveUserPreferences = saveUserPreferences.bind(this);
    this.loadProgress = loadProgress.bind(this);
    this.resetProgress = resetProgress.bind(this);
    this.showOnboarding = showOnboarding.bind(this);
    this.completeOnboarding = completeOnboarding.bind(this);
    this.setKeyboardLayout = setKeyboardLayout.bind(this);
    this.setTheme = setTheme.bind(this);
    this.setPreference = setPreference.bind(this);
    this.applyTheme = applyTheme.bind(this);
    this.convertToBengaliNumber = convertToBengaliNumber.bind(this);
};

App.prototype.init = async function() {
    await this.loadAllData();
    this.loadProgress();

    const keyboardSelect = document.getElementById('keyboard-layout-select');
    if (keyboardSelect) {
        keyboardSelect.value = this.state.userPreferences.keyboardLayout;
    }
    const profileKeyboardSelect = document.getElementById('profile-keyboard-layout-select');
    if (profileKeyboardSelect) {
        profileKeyboardSelect.value = this.state.userPreferences.keyboardLayout;
    }

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
    this.lessonElements.typingInput.addEventListener('keyup', (e) => this.handleTypingKeyup(e));

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
                // console.log("Lesson is locked!");
            }
        }
    });

    document.getElementById('onboarding-start-button').addEventListener('click', () => this.completeOnboarding());
    document.getElementById('confirm-reset-button').addEventListener('click', () => this.resetProgress());

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.state.currentPage === 'lesson') {
            e.preventDefault();
            this.navigateTo('learn');
        }
    });
};

App.prototype.toggleMobileMenu = function() {
    this.mobileMenu.classList.toggle('hidden');
};

App.prototype.loadAllData = async function() {
    try {
        const [syllabusResponse, avroHintResponse, bijoyHintResponse] = await Promise.all([
            fetch('syllabus.json'),
            fetch('avro_hint.json'),
            fetch('bijoy_hint.json')
            // Add other hint files if they become available
            // fetch('probhat_hint.json')
        ]);
        this.state.syllabus = await syllabusResponse.json();
        this.state.keyboardHintData.avro = await avroHintResponse.json();
        this.state.keyboardHintData.bijoy = await bijoyHintResponse.json();
        // this.state.keyboardHintData.probhat = await probhatHintResponse.json();

    } catch (error) {
        console.error('Failed to load data:', error);
        document.getElementById('levels-container').innerHTML = '<p class="text-center text-red-500">ডেটা লোড করা যায়নি। অনুগ্রহ করে আপনার ইন্টারনেট সংযোগ পরীক্ষা করুন।</p>';
    }
};