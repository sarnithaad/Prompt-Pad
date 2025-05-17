import React from "react";
import MonacoEditor from "react-monaco-editor";

const MONACO_LANG_MAP = {
  python: "python",
  c: "c",
  cpp: "cpp",
  java: "java",
  csharp: "csharp",
  javascript: "javascript",
};

function Editor({ code, setCode, theme, language }) {
  return (
    <MonacoEditor
      width="600"
      height="400"
      language={MONACO_LANG_MAP[language]}
      theme={theme === "dark" ? "vs-dark" : "vs-light"}
      value={code}
      options={{
        fontSize: 16,
        minimap: { enabled: false },
        automaticLayout: true,
      }}
      onChange={setCode}
    />
  );
}

export default Editor;
