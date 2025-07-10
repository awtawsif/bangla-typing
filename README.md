# Bangla Typing Tutor

A web-based interactive application designed to help users learn and improve their typing skills in the Bengali (Bangla) script. This tutor provides a user-friendly platform with structured lessons to enhance typing speed and accuracy.

## Live Demo

Experience the Bangla Typing Tutor directly in your browser:

👉 [**Live Demo on GitHub Pages**](https://awtawsif.github.io/bangla-typing)

## Features

-   **Interactive Lessons:** Structured typing exercises to guide users from beginner to advanced levels.
-   **Real-time Feedback:** Instantaneous feedback on typing accuracy, errors, and speed (WPM).
-   **Progress Tracking:** Monitor your improvement over time.
-   **User-Friendly Interface:** Clean and intuitive design for an optimal learning experience.
-   **Phonetic Support:** Designed to work seamlessly with phonetic Bangla typing methods (e.g., Avro Keyboard style input).

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

## Technologies Used

-   **HTML5:** For the structure of the web application.
-   **CSS3:** For styling and responsive design.
-   **Tailwind CSS:** For utility-first CSS styling.
-   **JavaScript (ES6+):** For interactive functionality, lesson logic, and real-time feedback.
-   **JSON:** To store syllabus data and typing exercises (`syllabus.json`).

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
*   **Multi-Layout Support:** Adding support for various Bangla keyboard layouts (e.g., Probhat, Jatiya) to cater to different user preferences.

### Improvements to Make

*   **UI/UX:** Enhancing the user interface for a more modern and intuitive experience.
*   **Performance:** Optimizing the application for faster loading and smoother performance.

### Bugs to Fix

*   **Syllabus Correction:** Reviewing and correcting inaccuracies, typos, and inconsistencies within the `syllabus.json`, `avro_hint.json` and `bijoy_hint.json` lesson files.
*   **Cross-browser Compatibility:** Ensuring the application works flawlessly across all major browsers.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

If you have any questions or feedback, feel free to reach out:

-   **GitHub:** [awtawsif](https://github.com/awtawsif)
