import React, { useState, useRef } from "react";
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
  const outputRef = useRef();

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
    setOutput(""); // Clear output when language changes
  };

  const saveCode = async () => {
    const title = prompt("Enter a title for your code:");
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
      const data = await response.json();
      window.prompt(
        "Share this link:",
        `${window.location.origin}/load/${data.id}`
      );
    } catch (err) {
      alert("Failed to save code: " + err.message);
    }
  };

  return (
    <div className="split-app">
      <div className="split-left" style={{ position: "relative" }}>
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
        </div>
        <div style={{ flex: 1, minHeight: 0 }}>
          <CodeEditor
            code={code}
            setCode={setCode}
            language={language}
            theme="dark"
          />
        </div>
        {showHelp && <Help onClose={() => setShowHelp(false)} />}
      </div>
      <div className="split-right">
        <label className="input-label">Input:</label>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          rows={3}
          placeholder="Type input here..."
          className="input-box"
        />
        <div className="output-label">Output:</div>
        <Terminal output={output} outputRef={outputRef} />
      </div>
    </div>
  );
}

export default App;
