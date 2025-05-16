import React, { useState, useEffect } from "react";
import Editor from "./components/Editor";
import OutputTerminal from "./components/OutputTerminal";
import Snippets from "./components/Snippets";
import ThemeToggle from "./components/ThemeToggle";
import HelpSection from "./components/HelpSection";
import LanguageSwitcher from "./components/LanguageSwitcher";
import "./styles.css";

// Language code templates
const TEMPLATES = {
  python: "# Write your Python code here\n",
  javascript: "// Write your JavaScript code here\n",
  c: "#include <stdio.h>\nint main() {\n    // Write your C code here\n    return 0;\n}\n",
  cpp: "#include <iostream>\nint main() {\n    // Write your C++ code here\n    return 0;\n}\n",
  java: "public class Main {\n    public static void main(String[] args) {\n        // Write your Java code here\n    }\n}\n",
  csharp: "using System;\nclass Program {\n    static void Main(string[] args) {\n        // Write your C# code here\n    }\n}\n"
};

const SUPPORTED_LANGUAGES = [
  { value: "python", label: "Python" },
  { value: "javascript", label: "JavaScript" },
  { value: "c", label: "C" },
  { value: "cpp", label: "C++" },
  { value: "java", label: "Java" },
  { value: "csharp", label: "C#" }
];

function App() {
  const [code, setCode] = useState(() =>
    localStorage.getItem("code") || TEMPLATES.python
  );
  const [inputs, setInputs] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [theme, setTheme] = useState(() =>
    localStorage.getItem("theme") || "light"
  );
  const [language, setLanguage] = useState(() =>
    localStorage.getItem("language") || "python"
  );

  // Auto-save code, theme, and language
  useEffect(() => {
    localStorage.setItem("code", code);
  }, [code]);
  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);
  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  // Load shared code if URL contains ?share=ID
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareId = params.get("share");
    if (shareId) {
      fetch(`http://localhost:8000/share/${shareId}`)
        .then(res => res.json())
        .then(data => {
          setCode(data.code);
          if (data.language) setLanguage(data.language);
        });
    }
  }, []);

  // Updated: Send code, inputs, and language to backend
  const runCode = async () => {
    setOutput("Running...");
    setError("");
    try {
      const res = await fetch("http://localhost:8000/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, inputs, language }),
      });
      const data = await res.json();
      setOutput(data.output);
      setError(data.error);
    } catch (err) {
      setOutput("");
      setError("Failed to connect to backend.");
    }
  };

  // Updated: Share code and language
  const shareCode = async () => {
    const res = await fetch("http://localhost:8000/share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, language }),
    });
    const data = await res.json();
    const url = `${window.location.origin}?share=${data.id}`;
    window.prompt("Share this link:", url);
  };

  // Updated: Set code template when language changes
  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setCode(TEMPLATES[lang] || "");
  };

  return (
    <div className={`app ${theme}`}>
      <header>
        <h1>Prompt Pad</h1>
        <ThemeToggle theme={theme} setTheme={setTheme} />
      </header>
      <div className="main">
        {/* Updated: Pass supported languages */}
        <LanguageSwitcher
          language={language}
          setLanguage={handleLanguageChange}
          languages={SUPPORTED_LANGUAGES}
        />
        <Snippets setCode={setCode} language={language} />
        <Editor code={code} setCode={setCode} theme={theme} language={language} />
        <div className="input-section">
          <label>Input :</label>
          <textarea value={inputs} onChange={e => setInputs(e.target.value)} />
        </div>
        <div className="btn-row">
          <button className="run-btn" onClick={runCode}>Run ▶️</button>
          <button className="share-btn" onClick={shareCode}>Share 🔗</button>
        </div>
        <OutputTerminal output={output} error={error} />
      </div>
      <HelpSection />
    </div>
  );
}

export default App;
