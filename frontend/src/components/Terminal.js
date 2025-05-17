import React, { useState, useRef } from "react";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const LANGUAGES = [
  { label: "Python", value: "python" },
  { label: "C", value: "c" },
  { label: "C++", value: "cpp" },
  { label: "Java", value: "java" },
  { label: "C#", value: "csharp" },
  { label: "JavaScript", value: "javascript" },
];

function Terminal() {
  const [code, setCode] = useState("");
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("python");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const outputRef = useRef(null);

  const handleRun = async () => {
    setOutput("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, input, language }),
      });

      if (!response.body) {
        setOutput("No response body received.");
        setLoading(false);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let result = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += decoder.decode(value);
        setOutput(result);
        // Scroll to bottom as output grows
        if (outputRef.current) {
          outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
      }
    } catch (err) {
      setOutput(`Error: ${err.message}`);
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.controls}>
        <select
          value={language}
          onChange={e => setLanguage(e.target.value)}
          style={styles.select}
        >
          {LANGUAGES.map(lang => (
            <option key={lang.value} value={lang.value}>{lang.label}</option>
          ))}
        </select>
        <button onClick={handleRun} disabled={loading} style={styles.button}>
          {loading ? "Running..." : "Run"}
        </button>
      </div>
      <textarea
        style={styles.codeArea}
        rows={10}
        placeholder="Write your code here..."
        value={code}
        onChange={e => setCode(e.target.value)}
      />
      <textarea
        style={styles.inputArea}
        rows={2}
        placeholder="Input (for input(), scanf, etc.)"
        value={input}
        onChange={e => setInput(e.target.value)}
      />
      <div style={styles.outputLabel}>Output:</div>
      <pre ref={outputRef} style={styles.outputArea}>
        {output}
      </pre>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 700,
    margin: "30px auto",
    padding: 24,
    background: "#222",
    borderRadius: 8,
    color: "#fff",
    fontFamily: "monospace",
    boxShadow: "0 2px 16px rgba(0,0,0,0.2)",
  },
  controls: {
    display: "flex",
    gap: 12,
    marginBottom: 12,
  },
  select: {
    padding: 4,
    fontSize: 16,
  },
  button: {
    padding: "4px 16px",
    fontSize: 16,
    background: "#0070f3",
    color: "#fff",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
  },
  codeArea: {
    width: "100%",
    fontFamily: "monospace",
    fontSize: 16,
    marginBottom: 8,
    background: "#1a1a1a",
    color: "#fff",
    border: "1px solid #444",
    borderRadius: 4,
    padding: 8,
  },
  inputArea: {
    width: "100%",
    fontFamily: "monospace",
    fontSize: 14,
    marginBottom: 8,
    background: "#1a1a1a",
    color: "#fff",
    border: "1px solid #444",
    borderRadius: 4,
    padding: 8,
  },
  outputLabel: {
    fontWeight: "bold",
    margin: "10px 0 4px 0",
  },
  outputArea: {
    width: "100%",
    minHeight: 120,
    maxHeight: 240,
    background: "#111",
    color: "#0f0",
    border: "1px solid #444",
    borderRadius: 4,
    padding: 8,
    overflowY: "auto",
    fontSize: 15,
    whiteSpace: "pre-wrap",
  },
};

export default Terminal;
