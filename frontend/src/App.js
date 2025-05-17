import React, { useState, useRef } from "react";
import Editor from "./components/Editor";
import Terminal from "./components/Terminal";
import Toolbar from "./components/Toolbar";
import Snippets from "./components/Snippets";
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
  const [theme, setTheme] = useState("light");
  const [showHelp, setShowHelp] = useState(false);
  const [showSnippets, setShowSnippets] = useState(false);
  const outputRef = useRef();

  const runCode = async () => {
    setOutput("Running...");
    const response = await fetch("http://localhost:8000/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, input, language }),
    });
    const reader = response.body.getReader();
    let result = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      result += new TextDecoder().decode(value);
      setOutput(result);
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  };

  const handleSnippet = (snippet) => setCode(snippet);

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    setCode(DEFAULT_CODE[lang]);
  };

  return (
    <div className={`app-container ${theme}`}>
      <Toolbar
        onRun={runCode}
        onTheme={() => setTheme(theme === "light" ? "dark" : "light")}
        onSnippets={() => setShowSnippets(!showSnippets)}
        onHelp={() => setShowHelp(!showHelp)}
        code={code}
        setCode={setCode}
        language={language}
      />
      <div className="main">
        <div className="editor-section">
          <label>
            Language:&nbsp;
            <select value={language} onChange={handleLanguageChange}>
              {LANGUAGES.map(l => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </label>
          <Editor code={code} setCode={setCode} theme={theme} language={language} />
        </div>
        <div className="io-section">
          <label>Input (for input/scanf/cin/etc):</label>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            rows={3}
            placeholder="Type input here..."
          />
          <Terminal output={output} outputRef={outputRef} />
        </div>
      </div>
      {showSnippets && <Snippets onSelect={handleSnippet} language={language} />}
      {showHelp && <Help />}
    </div>
  );
}

export default App;
