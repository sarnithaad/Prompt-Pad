# Prompt-Pad

Check the live project - https://prompt-pad-sarnitha-a-ds-projects.vercel.app/

Overview: 
Prompt Pad is a full-stack, cloud-based online IDE designed to help learners and developers write, execute, and share code directly from their browser, without any local setup. It supports multiple programming languages and simulates a terminal environment for real-time output. With features like code sharing via links, syntax-highlighted editor and theme toggling (light/dark) Prompt Pad provides a complete coding playground inside the browser.

Tech Stack: 
1. Frontend:
Framework: React.js
Styling: Tailwind CSS
Animations & UX Enhancements: Framer Motion

2. Backend:
Framework: FastAPI (Python)
Code Execution Engine: Judge0 API via REST (secured & asynchronous submission/polling)
Database: MongoDB

Core Features: 
1. Multi-language Code Editor
Supports Python, C, C++, Java, C#, JavaScript
Preloaded "Hello World" code templates for quick testing

2. Input/Output Terminal
Accepts custom input from the user
Real-time output display using streaming response

3. Code Sharing
Users can save and share code snippets using a generated link
Code gets stored in MongoDB with a unique identifier for retrieval

4. Theme Switching - Toggle between light and dark mode

5. Responsive and Accessible Design

Deployment: 
Frontend: Vercel
Backend: Render
Database: MongoDB Atlas
