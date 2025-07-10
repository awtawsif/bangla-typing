// constants.js

export const lessonLevels = [
    { title: "মৌলিক অক্ষর", lessons: [0, 1, 2, 3, 4, 5] },
    { title: "টপ রো ও বিশেষ স্বরবর্ণ", lessons: [6, 7, 8, 9, 10, 11, 12, 13, 14] },
    { title: "বিশেষ চিহ্ন ও সংখ্যা", lessons: [15, 16, 17, 18, 19, 20] },
    { title: "যুক্তাক্ষর - ক থেকে ন", lessons: [21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39] },
    { title: "যুক্তাক্ষর - প থেকে হ", lessons: [40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50] },
    { title: "ব্যবহারিক অনুশীলন", lessons: [51, 52, 53, 54, 55, 56] }
];

export const keyboardLayoutData = [
    [
        { key: '`', shiftKey: '~', code: 'Backquote' }, { key: '1', shiftKey: '!', code: 'Digit1' }, { key: '2', shiftKey: '@', code: 'Digit2' },
        { key: '3', shiftKey: '#', code: 'Digit3' }, { key: '4', shiftKey: '$', code: 'Digit4' }, { key: '5', shiftKey: '%', code: 'Digit5' },
        { key: '6', shiftKey: '^', code: 'Digit6' }, { key: '7', shiftKey: '&', code: 'Digit7' }, { key: '8', shiftKey: '*', code: 'Digit8' },
        { key: '9', shiftKey: '(', code: 'Digit9' }, { key: '0', shiftKey: ')', code: 'Digit0' }, { key: '-', shiftKey: '_', code: 'Minus' },
        { key: '=', shiftKey: '+', code: 'Equal' }, { key: 'backspace', display: 'Backspace', class: 'w-20', code: 'Backspace' }
    ],
    [
        { key: 'tab', display: 'Tab', class: 'w-16', code: 'Tab' }, { key: 'q', code: 'KeyQ' }, { key: 'w', code: 'KeyW' }, { key: 'e', code: 'KeyE' },
        { key: 'r', code: 'KeyR' }, { key: 't', code: 'KeyT' }, { key: 'y', code: 'KeyY' }, { key: 'u', code: 'KeyU' }, { key: 'i', code: 'KeyI' }, { key: 'o', code: 'KeyO' },
        { key: 'p', code: 'KeyP' }, { key: '[', shiftKey: '{', code: 'BracketLeft' }, { key: ']', shiftKey: '}', code: 'BracketRight' },
        { key: '\\', shiftKey: '|', class: 'w-16', code: 'Backslash' }
    ],
    [
        { key: 'capslock', display: 'Caps Lock', class: 'w-20', code: 'CapsLock' }, { key: 'a', code: 'KeyA' }, { key: 's', code: 'KeyS' },
        { key: 'd', code: 'KeyD' }, { key: 'f', code: 'KeyF' }, { key: 'g', code: 'KeyG' }, { key: 'h', code: 'KeyH' }, { key: 'j', code: 'KeyJ' }, { key: 'k', code: 'KeyK' },
        { key: 'l', code: 'KeyL' }, { key: ';', shiftKey: ':', code: 'Semicolon' }, { key: "'", shiftKey: '"', code: 'Quote' },
        { key: 'enter', display: 'Enter', class: 'w-24', code: 'Enter' }
    ],
    [
        { key: 'shiftleft', display: 'Shift', class: 'w-28', code: 'ShiftLeft' }, { key: 'z', code: 'KeyZ' }, { key: 'x', code: 'KeyX' },
        { key: 'c', code: 'KeyC' }, { key: 'v', code: 'KeyV' }, { key: 'b', code: 'KeyB' }, { key: 'n', code: 'KeyN' }, { key: 'm', code: 'KeyM' },
        { key: ',', shiftKey: '<', code: 'Comma' }, { key: '.', shiftKey: '>', code: 'Period' }, { key: '/', shiftKey: '?', code: 'Slash' },
        { key: 'shiftright', display: 'Shift', class: 'w-28', code: 'ShiftRight' }
    ],
    [
        { key: 'controlleft', display: 'Ctrl', class: 'w-16', code: 'ControlLeft' },
        { key: 'altleft', display: 'Alt', class: 'w-16', code: 'AltLeft' },
        { key: 'space', display: 'Space', class: 'w-96', code: 'Space' },
        { key: 'altright', display: 'Alt', class: 'w-16', code: 'AltRight' },
        { key: 'controlright', display: 'Ctrl', class: 'w-16', code: 'ControlRight' }
    ]
];