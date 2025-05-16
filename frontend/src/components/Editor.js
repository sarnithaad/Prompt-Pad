import React from "react";
import Editor from "@monaco-editor/react";

function CodeEditor({ code, setCode, theme, language }) {
  return (
    <Editor
      height="400px"
      language={language}
      value={code}
      theme={theme === "dark" ? "vs-dark" : "vs-light"}
      options={{
        fontSize: 16,
        minimap: { enabled: false },
        automaticLayout: true,
        lineNumbers: "on",
      }}
      onChange={value => setCode(value || "")}
    />
  );
}

export default CodeEditor;
