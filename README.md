# **⚠️ WARNING: The Typing Syllabus Needs Improvement!**

The current Bangla typing syllabus used on this site is **still not perfect**—some lessons may have inaccuracies or need corrections. If you spot any issues or can help improve the syllabus files (`syllabus.json`, `avro_hint.json`, `bijoy_hint.json`), **I would love your help!**  
Please consider contributing suggestions or fixes via GitHub issues or pull requests.

# Bangla Typing Tutor

A web-based interactive application designed to help users learn and improve their typing skills in the Bengali (Bangla) script. This tutor provides a user-friendly platform with structured lessons to enhance typing speed and accuracy.

## Live Demo

Experience the Bangla Typing Tutor directly in your browser:

👉 [**Live Demo on GitHub Pages**](https://awtawsif.github.io/bangla-typing)

## Features

-   **Interactive Lessons:** 57+ structured typing exercises across 6 progressive levels (from basic characters to practical texts)
-   **Real-time Feedback:** Instantaneous feedback on typing accuracy, errors, and speed (WPM) with visual keyboard hints
-   **Progress Tracking:** Comprehensive progress monitoring with charts, WPM statistics, and lesson completion tracking
-   **Multiple Keyboard Layouts:** Support for Avro Phonetic, Bijoy, and Probhat layouts with dynamic switching
-   **Dark/Light Theme:** Automatic theme detection with manual override options
-   **User-Friendly Interface:** Responsive design optimized for both desktop and mobile devices
-   **Visual Keyboard Hints:** On-screen keyboard display showing correct finger positioning
-   **Progressive Learning:** Level-based system unlocking new content as users master previous lessons
-   **Bangla Number Display:** All statistics and UI elements use Bengali numerators for cultural consistency

## How to Use

1.  **Access the Live Demo:** Click on the [Live Demo link](https://awtawsif.github.io/bangla-typing) above.
2.  **Start Typing:** Follow the on-screen instructions and type the displayed Bengali text using your keyboard.
3.  **Practice Regularly:** Consistent practice is key to improving your typing speed and accuracy.

## Local Installation (for Development)

If you wish to run this project locally for development or customization, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/awtawsif/bangla-typing.git
    ```
2.  **Navigate to the project directory:**
    ```bash
    cd bangla-typing
    ```
3.  **Install Dependencies:**
    Install the necessary Node.js packages, including Tailwind CSS.
    ```bash
    npm install
    ```
4.  **Build Tailwind CSS:**
    Generate the `tailwind_style.css` file.
    ```bash
    npm run build:css
    ```
    For continuous compilation during development, use:
    ```bash
    npm run watch:css
    ```
5.  **Open `index.html`:**
    Simply open the `index.html` file in your preferred web browser. No server setup is required as it's a static web application.

    ```bash
    # On Linux/macOS
    open index.html

    # On Windows
    start index.html
    ```

6.  **Test the Application:**
    - Verify all CSS styles are applied correctly
    - Test keyboard layouts and typing functionality
    - Check charts and progress tracking features

## Technologies Used

-   **HTML5:** Semantic structure with accessibility support (`lang="bn"`)
-   **CSS3:** Advanced styling with CSS custom properties and animations
-   **Tailwind CSS v4+:** Utility-first CSS framework with custom configuration
-   **JavaScript (ES6+):** Modern JavaScript with async/await, event delegation, and modular architecture
-   **Chart.js:** Data visualization for progress tracking and statistics
-   **JSON Data Files:** 
    - `syllabus.json` - 57+ lessons with characters, words, and phrases
    - `avro_hint.json` - Keyboard layout mapping for Avro Phonetic
    - `bijoy_hint.json` - Keyboard layout mapping for Bijoy layout
-   **Google Fonts:** Hind Siliguri for consistent Bangla text rendering
-   **LocalStorage:** Client-side progress persistence and user preferences

## Contributing

Contributions are welcome! If you have suggestions for improvements, new features, or bug fixes, please follow these steps:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/YourFeature`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'Add some feature'`).
5.  Push to the branch (`git push origin feature/YourFeature`).
6.  Open a Pull Request.

## Future Plans

Here's a roadmap of what's planned for the future of the Bangla Typing Tutor.

### Features to Add

*   **User Accounts:** To save progress and track performance across sessions.
*   **More Lessons:** Expanding the syllabus with more advanced lessons and exercises.
*   **Custom Lessons:** Allowing users to create and practice their own custom lessons.
*   **Typing Games:** Adding fun and interactive games to make learning more engaging.
*   **Multi-Layout Support:** Adding support for additional Bangla keyboard layouts (e.g., Jatiya, Munir) to cater to different user preferences.

### Improvements to Make

*   **UI/UX:** Enhanced animations, micro-interactions, and accessibility improvements
*   **Performance:** Bundle size optimization and faster chart rendering
*   **Mobile Experience:** Improved touch interactions and mobile-specific keyboard layouts
*   **Accessibility:** Better screen reader support and keyboard navigation

### Bugs to Fix

*   **Syllabus Enhancement:** Reviewing and expanding the 57 lessons across 6 levels for better learning progression
*   **Cross-browser Compatibility:** Ensuring consistent behavior across Chrome, Firefox, Safari, and Edge
*   **Data Validation:** Improving accuracy of keyboard hint mappings and phonetic displays
*   **Performance Issues:** Optimizing chart rendering and large data set handling

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

If you have any questions or feedback, feel free to reach out:

-   **GitHub:** [awtawsif](https://github.com/awtawsif)
