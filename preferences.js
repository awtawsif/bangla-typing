// preferences.js
export function setKeyboardLayout(layout) {
    this.state.userPreferences.keyboardLayout = layout;
    localStorage.setItem('typingUserPreferences', JSON.stringify(this.state.userPreferences));
    this.loadProgress();

    document.getElementById('keyboard-layout-select').value = layout;
    const profileKeyboardSelect = document.getElementById('profile-keyboard-layout-select');
    if (profileKeyboardSelect) {
        profileKeyboardSelect.value = layout;
    }

    this.executePageSpecificActions(this.state.currentPage);

    if (this.state.currentPage === 'lesson' && this.state.currentLesson !== null) {
        this.renderLessonView();
    }
}

export function setTheme(theme) {
    this.state.userPreferences.theme = theme;
    this.applyTheme(theme);
    this.saveUserPreferences();
    if (this.state.currentPage === 'profile') {
        this.renderProfilePage();
    }
}

export function setPreference(preferenceName, value) {
    // Ensure boolean values are stored as booleans, not strings
    let parsedValue = value;
    if (value === 'true') {
        parsedValue = true;
    } else if (value === 'false') {
        parsedValue = false;
    }

    this.state.userPreferences[preferenceName] = parsedValue;
    this.saveUserPreferences();
    if (this.state.currentPage === 'lesson' && this.state.currentLesson !== null) {
        this.renderLessonView();
    }
    if (this.state.currentPage === 'profile') {
        this.renderProfilePage();
    }
}

export function applyTheme(theme) {
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
    this.saveUserPreferences();
}

// Function to show reset confirmation (it was missing from original script scope, but called)
export function showResetConfirmation() {
    this.confirmationModal.classList.remove('hidden');
}