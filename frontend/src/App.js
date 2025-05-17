import React, { useState, useRef, useEffect } from "react";
import CodeEditor from "./components/CodeEditor";
import Terminal from "./components/Terminal";
import Help from "./components/Help";
import "./styles/theme.css";

const DEFAULT_CODE = {
  python: "print('Hello, World!')",
  c: "#include <stdio.h>\nint main() {\n  printf(\"Hello, World!\\n\");\n  return 0;\n}",
  cpp: "#include <iostream>\nint main() {\n  std::cout << \"Hello, World!\\n\";\n  return 0;\n}",
  java: "public class Main {\n  public static void main(String[] args) {\n    System.out.println(\"Hello, World!\");\n  }\n}",
  csharp: "using System;\nclass Program {\n  static void Main() {\n    Console.WriteLine(\"Hello, World!\");\n  }\n}",
  javascript: "console.log('Hello, World!');"
};

const LANGUAGES = [
  { value: "python", label: "Python" },
  { value: "c", label: "C" },
  { value: "cpp", label: "C++" },
  { value: "java", label: "Java" },
  { value: "csharp", label: "C#" },
  { value: "javascript", label: "JavaScript" },
];

function App() {
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(DEFAULT_CODE["python"]);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");
  const outputRef = useRef();

  // Persist theme to localStorage
  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Load shared code from /load/:id if present in URL
  useEffect(() => {
    const match = window.location.pathname.match(/^\/load\/(.+)/);
    if (match) {
      const id = match[1];
      fetch(
        process.env.REACT_APP_API_URL
          ? `${process.env.REACT_APP_API_URL}/load/${id}`
          : `http://localhost:8000/load/${id}`
      )
        .then(res => res.json())
        .then(data => {
          if (data.code && data.language) {
            setCode(data.code);
            setLanguage(data.language);
          }
        })
        .catch(() => {
          alert("Failed to load shared code.");
        });
    }
  }, []);

  const runCode = async () => {
    setOutput("Running...");
    setLoading(true);
    try {
      const response = await fetch(
        process.env.REACT_APP_API_URL
          ? `${process.env.REACT_APP_API_URL}/run`
          : "http://localhost:8000/run",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, input, language }),
        }
      );
      if (!response.body) {
        setOutput("No response body received.");
        setLoading(false);
        return;
      }
      const reader = response.body.getReader();
      let result = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += new TextDecoder().decode(value);
        setOutput(result);
        if (outputRef.current)
          outputRef.current.scrollTop = outputRef.current.scrollHeight;
      }
    } catch (err) {
      setOutput(`Error: ${err.message}`);
    }
    setLoading(false);
  };

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    setCode(DEFAULT_CODE[lang]);
    setOutput("");
    setInput(""); // Clear input when language changes
  };

  const saveCode = async () => {
    const title = prompt("Enter a title for your code (optional):");
    if (title === null) return; // User cancelled
    try {
      const response = await fetch(
        process.env.REACT_APP_API_URL
          ? `${process.env.REACT_APP_API_URL}/save`
          : "http://localhost:8000/save",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, title, language }),
        }
      );
      if (!response.ok) throw new Error("Failed to save code");
      const data = await response.json();
      window.prompt(
        "Share this link:",
        `${window.location.origin}/load/${data.id}`
      );
    } catch (err) {
      alert("Failed to save code: " + err.message);
    }
  };

  // --- MAIN RETURN ---
  return (
    <div className={theme}>
      {/* Page-wide centered heading */}
      <div
        style={{
          textAlign: "center",
          margin: "24px 0 10px 0",
          borderBottom: "1px solid #eee",
          paddingBottom: "4px",
          background: theme === "light" ? "#fff" : "transparent",
          boxShadow: theme === "light" ? "0 2px 8px rgba(0,0,0,0.03)" : "none",
          transition: "background 0.2s"
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: "2rem",
            fontWeight: 700,
            color: theme === "dark" ? "#eee" : "#222",
            fontFamily: "Montserrat, Arial, sans-serif",
            letterSpacing: "1px",
            transition: "color 0.2s"
          }}
        >
          Prompt Pad - Your Personal Online IDE
        </h1>
        <div
          style={{
            fontSize: "1rem",
            color: theme === "dark" ? "#aaa" : "#888",
            fontWeight: 400,
            marginTop: 2,
            transition: "color 0.2s"
          }}
        >
          Code it. Run it. Learn it.
        </div>
      </div>

      {/* The main split container */}
      <div className={`split-app ${theme}`}>
        <div
          className={`split-left ${theme}`}
          style={{
            position: "relative",
            background: theme === "dark" ? "#23272f" : "#fff",
            color: theme === "dark" ? "#eee" : "#222",
            transition: "background 0.2s, color 0.2s"
          }}
        >
          <div className="editor-header">
            <label>
              Language:&nbsp;
              <select value={language} onChange={handleLanguageChange}>
                {LANGUAGES.map(l => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </label>
            <button onClick={runCode} disabled={loading} className="run-btn">
              {loading ? "Running..." : "Run"}
            </button>
            <button onClick={saveCode} className="share-btn" title="Share">Share</button>
            <button onClick={() => setShowHelp(true)} className="help-btn" title="Help">
              ?
            </button>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="theme-toggle-btn"
              title="Toggle theme"
              style={{ marginLeft: 10, fontSize: 20 }}
            >
              {theme === "dark" ? "🌙" : "🔆"}
            </button>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <CodeEditor
              code={code}
              setCode={setCode}
              language={language}
              theme={theme}
            />
          </div>
          {showHelp && <Help onClose={() => setShowHelp(false)} />}
        </div>
        <div
          className={`split-right ${theme}`}
          style={{
            background: theme === "dark" ? "#23272f" : "#fff",
            color: theme === "dark" ? "#eee" : "#222",
            transition: "background 0.2s, color 0.2s"
          }}
        >
          <label className="input-label" style={{ color: theme === "dark" ? "#eee" : "#222" }}>Input:</label>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            rows={3}
            placeholder="Type input here..."
            className="input-box"
            style={{
              background: theme === "dark" ? "#181a20" : "#fafafa",
              color: theme === "dark" ? "#eee" : "#222",
              border: "1px solid #ccc",
              transition: "background 0.2s, color 0.2s"
            }}
          />
          <div className="output-label" style={{ color: theme === "dark" ? "#eee" : "#222" }}>Output:</div>
          <Terminal output={output} outputRef={outputRef} theme={theme} />
        </div>
      </div>
    </div>
  );
}

export default App;
