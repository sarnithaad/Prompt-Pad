import React from "react";

function Toolbar({ onRun, onTheme, onSnippets, onHelp, code, setCode, language }) {
  const saveCode = async () => {
    const title = prompt("Enter a title for your code:");
    const response = await fetch("http://localhost:8000/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, title, language }),
    });
    const data = await response.json();
    window.prompt("Share this link:", `${window.location.origin}/load/${data.id}`);
  };

  return (
    <div className="toolbar">
      <button onClick={onRun}>Run</button>
      <button onClick={saveCode}>Share</button>
      <button onClick={onSnippets}>Snippets</button>
      <button onClick={onHelp}>Help</button>
      <button onClick={onTheme}>Toggle Theme</button>
    </div>
  );
}

export default Toolbar;
