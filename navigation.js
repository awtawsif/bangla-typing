// navigation.js

export function navigateTo(page) {
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
        }, 300);
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

    if (page === 'lesson') {
        this.mainHeader.classList.add('header-hidden');
    } else {
        this.mainHeader.classList.remove('header-hidden');
    }
}

export function executePageSpecificActions(page) {
    switch(page) {
        case 'learn':
            this.renderLearnPage();
            break;
        case 'practice':
            this.renderPracticePage(); // You might want to define this if it has content
            break;
        case 'profile':
            this.renderProfilePage();
            break;
        case 'lesson':
            this.renderLessonView();
            break;
        case 'completion':
            // Content is set in completeLesson, no action needed here
            break;
    }
}

export function updateNavLinks() {
    this.navLinks.forEach(link => {
        const pageName = link.getAttribute('onclick').match(/'(.*?)'/)[1];
        if (pageName === this.state.currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

export function handleHashChange() {
    const hash = window.location.hash.replace('#', '');
    if (['learn', 'practice', 'profile'].includes(hash) && this.state.currentPage !== hash) {
        this.navigateTo(hash);
    }
}