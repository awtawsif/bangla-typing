// onboarding.js
export function showOnboarding() {
    this.onboardingModal.classList.remove('hidden');
    document.getElementById('onboarding-dark-mode').value = this.state.userPreferences.theme;

    const container = document.getElementById('onboarding-experience-levels-container');
    container.innerHTML = '';

    for (const layoutKey in this.state.keyboardHintData) {
        if (this.state.keyboardHintData.hasOwnProperty(layoutKey) && this.state.keyboardHintData[layoutKey] !== null) {
            const layoutName = layoutKey.charAt(0).toUpperCase() + layoutKey.slice(1);
            const div = document.createElement('div');
            div.innerHTML = `
                <label for="onboarding-experience-level-${layoutKey}" class="block text-gray-600 text-sm font-medium mb-1">${layoutName}:</label>
                <select id="onboarding-experience-level-${layoutKey}" class="app-select w-full">
                    <option value="new">নতুন</option>
                    <option value="intermediate">মাঝারি</option>
                    <option value="experienced">অভিজ্ঞ</option>
                </select>
            `;
            container.appendChild(div);
        }
    }
}

export function completeOnboarding() {
    this.state.userPreferences.keyboardLayout = 'avro';
    this.state.userPreferences.theme = document.getElementById('onboarding-dark-mode').value;
    this.state.userPreferences.onboardingCompleted = true;

    for (const layoutKey in this.state.keyboardHintData) {
        if (this.state.keyboardHintData.hasOwnProperty(layoutKey) && this.state.keyboardHintData[layoutKey] !== null) {
            const experience = document.getElementById(`onboarding-experience-level-${layoutKey}`).value;
            const unlockedLevels = new Set([0]);

            if (experience === 'intermediate') {
                unlockedLevels.add(1);
                unlockedLevels.add(2);
            } else if (experience === 'experienced') {
                for (let i = 0; i < this.state.lessonLevels.length; i++) {
                    unlockedLevels.add(i);
                }
            }

            const progressKey = `typingProgress-${layoutKey}`;
            const progressData = {
                completedLessons: [],
                performance: [],
                unlockedLevels: Array.from(unlockedLevels)
            };
            localStorage.setItem(progressKey, JSON.stringify(progressData));
        }
    }

    this.saveUserPreferences();
    this.applyTheme(this.state.userPreferences.theme);

    this.onboardingModal.classList.add('hidden');
    this.loadProgress();
    document.getElementById('keyboard-layout-select').value = this.state.userPreferences.keyboardLayout;
    this.navigateTo('learn');
    this.renderLearnPage();
}

// Helper function that was internal to App, needed for resetProgress
export function hideConfirmation() {
    this.confirmationModal.classList.add('hidden');
}