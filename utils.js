// utils.js
export function convertToBengaliNumber(number) {
    const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const bengaliNumbers = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(number).split('').map(digit => {
        const index = englishNumbers.indexOf(digit);
        return index !== -1 ? bengaliNumbers[index] : digit;
    }).join('');
}

export function convertToPhonetic(banglaText) {
    // This is a placeholder. A real implementation would involve a comprehensive
    // mapping of Bengali characters and conjuncts to their phonetic English equivalents.
    // For demonstration, we'll just return the input text.
    return banglaText;
}