// progressManagement.js
export function saveProgress() {
    try {
        const layout = this.state.userPreferences.keyboardLayout;
        const progressKey = `typingProgress-${layout}`;
        localStorage.setItem(progressKey, JSON.stringify({
            completedLessons: Array.from(this.state.progressData.completedLessons),
            performance: this.state.progressData.performance,
            unlockedLevels: Array.from(this.state.progressData.unlockedLevels),
        }));
        this.saveUserPreferences();
    } catch (e) {
        console.error("Failed to save progress to localStorage", e);
    }
}

export function saveUserPreferences() {
    try {
        localStorage.setItem('typingUserPreferences', JSON.stringify(this.state.userPreferences));
    } catch (e) {
        console.error("Failed to save user preferences to localStorage", e);
    }
}

export function loadProgress() {
    try {
        const savedPreferences = localStorage.getItem('typingUserPreferences');
        if (savedPreferences) {
            const parsedPreferences = JSON.parse(savedPreferences);
            const defaultPreferences = {
                keyboardLayout: 'avro',
                onboardingCompleted: false,
                theme: 'system',
                showPhoneticHint: true,
                showWordCount: true,
                showKeyboardHint: true
            };
            this.state.userPreferences = Object.assign({}, defaultPreferences, parsedPreferences);

            // Handle legacy 'isDarkMode' if it exists
            if (this.state.userPreferences.isDarkMode !== undefined) {
                this.state.userPreferences.theme = this.state.userPreferences.isDarkMode ? 'dark' : 'light';
                delete this.state.userPreferences.isDarkMode;
            }
        } else {
            // Set sensible defaults if no preferences are saved
            this.state.userPreferences.theme = 'system';
            this.state.userPreferences.showPhoneticHint = true;
            this.state.userPreferences.showWordCount = true;
            this.state.userPreferences.showKeyboardHint = true;
        }

        const layout = this.state.userPreferences.keyboardLayout;
        const progressKey = `typingProgress-${layout}`;
        const savedData = localStorage.getItem(progressKey);
        if (savedData) {
            const parsed = JSON.parse(savedData);
            this.state.progressData = {
                completedLessons: new Set(parsed.completedLessons || []),
                performance: parsed.performance || [],
                unlockedLevels: new Set(parsed.unlockedLevels || [0])
            };
        } else {
            this.state.progressData = {
                completedLessons: new Set(),
                performance: [],
                unlockedLevels: new Set([0])
            };
        }
    } catch (e) {
        console.error("Failed to load progress from localStorage", e);
    }
}

export function resetProgress() {
    const layout = this.state.userPreferences.keyboardLayout;
    const progressKey = `typingProgress-${layout}`;
    localStorage.removeItem(progressKey);

    this.state.progressData = {
        completedLessons: new Set(),
        performance: [],
        unlockedLevels: new Set([0])
    };
    this.saveProgress();
    this.hideConfirmation(); // Assuming hideConfirmation is defined within App or passed
    this.navigateTo('profile');
    this.renderProfilePage();
    this.renderLearnPage();
}