// keyboard.js
export function renderKeyboard() {
    const keyboardContainer = this.lessonElements.onScreenKeyboard;
    keyboardContainer.innerHTML = '';

    this.keyboardLayoutData.forEach(row => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'keyboard-row';
        row.forEach(keyData => {
            const keyDiv = document.createElement('div');
            keyDiv.className = `key ${keyData.class || ''}`;
            keyDiv.dataset.key = keyData.key;
            keyDiv.dataset.code = keyData.code;

            let keyContent = '';
            if (keyData.display) {
                keyContent = `<span class="bottom-label">${keyData.display}</span>`;
            } else {
                const topLabel = keyData.shiftKey ? `<span class="top-label">${keyData.shiftKey}</span>` : '';
                const bottomLabel = `<span class="bottom-label">${keyData.key}</span>`;
                keyContent = `${topLabel}${bottomLabel}`;
            }
            keyDiv.innerHTML = keyContent;
            rowDiv.appendChild(keyDiv);
        });
        keyboardContainer.appendChild(rowDiv);
    });
    this.updateKeyboardHighlight();
}

export function updateKeyboardHighlight() {
    document.querySelectorAll('.key').forEach(keyEl => {
        keyEl.classList.remove('highlight-key', 'pressed-visual');
    });
    
    document.querySelectorAll('[data-key="shiftleft"], [data-key="shiftright"]').forEach(shiftKeyEl => {
        shiftKeyEl.classList.remove('active');
    });

    const { items, phonetic_items } = this.state.currentLessonData;
    const currentItem = items[this.state.currentWordIndex];
    const phoneticItem = phonetic_items[this.state.currentWordIndex];

    if (!currentItem || !phoneticItem) {
        this.state.highlightedKey = null;
        return;
    }

    const typedLength = this.state.userInput.length;
    if (typedLength >= phoneticItem.length) {
        this.state.highlightedKey = null;
        return;
    }

    const nextPhoneticChar = phoneticItem[typedLength];
    
    let targetKey = nextPhoneticChar.toLowerCase();
    let needsShift = (nextPhoneticChar === nextPhoneticChar.toUpperCase() && nextPhoneticChar.toLowerCase() !== nextPhoneticChar.toUpperCase());

    // Special handling for symbols that require shift
    if (nextPhoneticChar === '!' && targetKey === '1') needsShift = true;
    else if (nextPhoneticChar === '@' && targetKey === '2') needsShift = true;
    else if (nextPhoneticChar === '#' && targetKey === '3') needsShift = true;
    else if (nextPhoneticChar === '$' && targetKey === '4') needsShift = true;
    else if (nextPhoneticChar === '%' && targetKey === '5') needsShift = true;
    else if (nextPhoneticChar === '^' && targetKey === '6') needsShift = true;
    else if (nextPhoneticChar === '&' && targetKey === '7') needsShift = true;
    else if (nextPhoneticChar === '*' && targetKey === '8') needsShift = true;
    else if (nextPhoneticChar === '(' && targetKey === '9') needsShift = true;
    else if (nextPhoneticChar === ')' && targetKey === '0') needsShift = true;
    else if (nextPhoneticChar === '_' && targetKey === '-') needsShift = true;
    else if (nextPhoneticChar === '+' && targetKey === '=') needsShift = true;
    else if (nextPhoneticChar === '{' && targetKey === '[') needsShift = true;
    else if (nextPhoneticChar === '}' && targetKey === ']') needsShift = true;
    else if (nextPhoneticChar === '|' && targetKey === '\\') needsShift = true;
    else if (nextPhoneticChar === ':' && targetKey === ';') needsShift = true;
    else if (nextPhoneticChar === '"' && targetKey === "'") needsShift = true;
    else if (nextPhoneticChar === '<' && targetKey === ',') needsShift = true;
    else if (nextPhoneticChar === '>' && targetKey === '.') needsShift = true;
    else if (nextPhoneticChar === '?' && targetKey === '/') needsShift = true;
    else if (nextPhoneticChar === '~' && targetKey === '`') needsShift = true;

    this.state.highlightedKey = targetKey;
    this.state.isShiftActive = needsShift;

    const keyToHighlight = document.querySelector(`.key[data-key="${targetKey}"]`);
    if (keyToHighlight) {
        keyToHighlight.classList.add('highlight-key');
    }

    if (needsShift) {
        document.querySelectorAll('[data-key="shiftleft"], [data-key="shiftright"]').forEach(shiftKeyEl => {
            shiftKeyEl.classList.add('active');
        });
    }
}