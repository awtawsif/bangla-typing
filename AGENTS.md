# Bangla Typing Tutor - AGENTS.md

This file provides essential information for AI agents working on this Bangla typing tutor codebase.

## Project Overview

This is a static web application for learning Bangla typing with structured lessons, real-time feedback, and progress tracking. The app uses vanilla JavaScript, HTML5, CSS3 with Tailwind CSS, and Chart.js for visualizations.

## Build Commands

### CSS Processing
- **Build CSS**: `npm run build:css` - Compiles Tailwind CSS from `style.css` to `tailwind_style.css` (minified)
- **Watch CSS**: `npm run watch:css` - Continuously watches for CSS changes during development

### Testing
- This project has **no automated test suite**
- Manual testing is done by opening `index.html` in a browser
- To test locally: open index.html in browser after running `npm run build:css`

### Development Workflow
1. Run `npm install` to install dependencies
2. Run `npm run build:css` to compile styles
3. Open `index.html` in browser to test
4. Use `npm run watch:css` during CSS development

## Code Structure

### Core Files
- `index.html` - Main HTML structure with all views
- `script.js` - Main application logic (vanilla JS)
- `style.css` - Tailwind CSS source with custom variables
- `tailwind_style.css` - Compiled CSS output
- `syllabus.json` - Lesson content and structure
- `avro_hint.json` - Keyboard layout hints for Avro
- `bijoy_hint.json` - Keyboard layout hints for Bijoy

### Application Architecture
- **State Management**: Centralized in `app.state` object
- **View System**: Single-page app with view switching (learn, lesson, practice, profile, completion)
- **Event Handling**: Event delegation for dynamic content
- **Data Loading**: Async JSON loading for syllabus and keyboard hints

## Code Style Guidelines

### JavaScript (ES6+)
- **Function Declarations**: Use `App.prototype.methodName = function()` pattern
- **Variables**: `const` for immutable, `let` for mutable
- **State Management**: All state in `app.state` object
- **Error Handling**: Try-catch for async operations, console.error for debugging
- **Event Listeners**: Use event delegation for dynamic content
- **DOM Queries**: Cache DOM elements in constructor/initialization

### CSS/Architecture
- **Framework**: Tailwind CSS v4+ with custom CSS variables
- **Theming**: CSS custom properties for light/dark mode support
- **Responsive**: Mobile-first approach with Tailwind breakpoints
- **Custom Classes**: `.btn-accent`, `.nav-link`, `.lesson-card`, etc.
- **Animations**: CSS keyframes for transitions and micro-interactions

### HTML Structure
- **Language**: `lang="bn"` attribute for Bangla content
- **Semantic**: Use proper HTML5 semantic elements
- **Accessibility**: Include ARIA labels where needed
- **Bangla Text**: All UI text in Bangla script

## Naming Conventions

### JavaScript
- **Variables**: camelCase (e.g., `currentLesson`, `userInput`)
- **Functions**: camelCase with descriptive names (e.g., `handleTyping`, `navigateTo`)
- **Constants**: UPPER_SNAKE_CASE for static values
- **DOM Elements**: Descriptive names with element type suffix (e.g., `typingInput`, `lessonTitle`)
- **State Properties**: camelCase matching their purpose

### CSS Classes
- **Tailwind**: Use standard Tailwind utility classes
- **Custom**: kebab-case for custom classes (e.g., `.lesson-card`, `.typing-display`)
- **State Classes**: `.completed`, `.locked`, `.active`, `.pressed-correct`, `.pressed-wrong`

### File Structure
- **JSON**: snake_case for data files (e.g., `avro_hint.json`, `bijoy_hint.json`)
- **Components**: Related functionality grouped in sections of code

## Import/Dependency Management

### External Dependencies
- **Chart.js**: Loaded via CDN for progress charts
- **Google Fonts**: Hind Siliguri font for Bangla text rendering
- **Tailwind CSS**: v4+ via npm

### Internal Dependencies
- **No modules**: Everything in global scope using script tags
- **Load Order**: Chart.js → Custom styles → Main script
- **Data Files**: JSON files loaded asynchronously on app init

## Error Handling Patterns

### JavaScript
```javascript
// Async operations
try {
    const response = await fetch('data.json');
    const data = await response.json();
} catch (error) {
    console.error('Failed to load data:', error);
    // User-friendly error message in UI
}

// Event handling
document.addEventListener('click', (e) => {
    try {
        // Handle event
    } catch (error) {
        console.error('Event handler error:', error);
    }
});
```

### UI Feedback
- Show user-friendly Bangla error messages
- Use console.error for debugging
- Graceful degradation for missing data

## Bangla-Specific Considerations

### Text Rendering
- **Font**: Use Hind Siliguri for consistent Bangla display
- **UTF-8**: Ensure proper encoding throughout
- **Input Methods**: Support Avro Phonetic, Bijoy, and Probhat layouts

### Keyboard Layout Support
- **Data Structure**: Hint files map Bangla characters to keyboard keys
- **Dynamic Switching**: Real-time layout switching without page reload
- **Visual Feedback**: Show keyboard hints during lessons

### Content Structure
- **Progressive Learning**: Lessons structured from basic to complex
- **Character Sets**: Individual characters → Words → Phrases
- **Level Organization**: 6 levels with multiple lessons each

## Performance Guidelines

### DOM Manipulation
- Cache frequently accessed elements
- Use document fragments for batch operations
- Minimize layout thrashing during animations

### Data Loading
- Load all JSON files asynchronously on init
- Use Promise.all() for parallel data loading
- Cache data in state to avoid repeated fetches

### CSS Optimization
- Use CSS transforms for animations
- Leverage CSS variables for theme switching
- Minimize reflows with efficient selectors

## Browser Compatibility

- **Modern Browsers**: ES6+ support required
- **Mobile**: Responsive design with touch support
- **LocalStorage**: Used for progress persistence
- **No Server Required**: Static file hosting sufficient

## Security Notes

- **No User Authentication**: Local storage only
- **External CDN**: Chart.js and Google Fonts loaded from CDN
- **No Server Communication**: Everything client-side
- **Data Sanitization**: Basic HTML escaping for user input

## Contributing Guidelines

### Code Quality
- Maintain consistent indentation (4 spaces)
- Follow existing patterns and conventions
- Add meaningful comments for complex logic
- Test on different browsers and devices

### Bangla Content
- Verify Bangla text rendering accuracy
- Test with different keyboard layouts
- Ensure phonetic hints are correct
- Validate lesson progression logic

When working on this codebase, prioritize maintaining the educational user experience and ensuring Bangla text displays correctly across all supported platforms and input methods.