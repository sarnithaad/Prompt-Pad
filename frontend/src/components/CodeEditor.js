import React from "react";
import Editor from "@monaco-editor/react";

const MONACO_LANG_MAP = {
  python: "python",
  c: "c",
  cpp: "cpp",
  java: "java",
  csharp: "csharp",
  javascript: "javascript",
};

function CodeEditor({ code, setCode, theme = "dark", language = "python" }) {
  return (
    <div style={{ height: "100%", width: "100%" }}>
      <Editor
        height="100%"
        width="100%"
        language={MONACO_LANG_MAP[language] || "python"}
        theme={theme === "light" ? "vs-light" : "vs-dark"}
        value={code || ""}
        options={{
          fontSize: 16,
          minimap: { enabled: false },
          automaticLayout: true,
          scrollBeyondLastLine: false,
          wordWrap: "on",
        }}
        onChange={value => setCode(value ?? "")}
      />
    </div>
  );
}

export default CodeEditor;
