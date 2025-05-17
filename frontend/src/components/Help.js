import React, { useEffect, useState } from "react";

function Help({ onClose }) {
  // Optionally fetch extra tips from backend
  const [tips, setTips] = useState([]);
  useEffect(() => {
    let ignore = false;
    fetch(
      process.env.REACT_APP_API_URL
        ? `${process.env.REACT_APP_API_URL}/help`
        : "http://localhost:8000/help"
    )
      .then(res => res.json())
      .then(data => {
        if (!ignore && data && Array.isArray(data.tips)) {
          setTips(data.tips);
        }
      })
      .catch(() => {}); // Ignore errors if backend is unavailable
    return () => { ignore = true; };
  }, []);

  return (
    <div className="help-editor-modal-overlay" onClick={onClose} tabIndex={-1} aria-modal="true" role="dialog">
      <div className="help-editor-modal" onClick={e => e.stopPropagation()}>
        <button className="help-close-btn" onClick={onClose} aria-label="Close help">×</button>
        <h3>How to Use the Code Runner</h3>
        <ol style={{ marginBottom: "18px" }}>
          <li>
            <b>Select your programming language</b> from the dropdown above the code editor.
          </li>
          <li>
            <b>Write or edit your code</b> in the editor on the left. A starter snippet is provided for each language.
          </li>
          <li>
            <b>Enter any required input</b> (for <code>input()</code>, <code>scanf</code>, etc.) in the <b>Input</b> box on the right.
          </li>
          <li>
            <b>Click the <span style={{color:'#0070f3'}}>Run</span> button</b> to execute your code.
          </li>
          <li>
            <b>View the output</b> in the <b>Output</b> area below the input box.
          </li>
        </ol>
        <div style={{ marginBottom: "12px" }}>
          <b>Tips:</b>
          <ul>
            <li>You can change the language at any time; the editor will reset to a default snippet for each language.</li>
            <li>Input is sent to your code as standard input (stdin).</li>
            <li>Errors and program output will be shown in the output area.</li>
            <li>Click <b>?</b> again to view this guide any time.</li>
          </ul>
        </div>
        {tips.length > 0 && (
          <div>
            <b>Additional Tips:</b>
            <ul>
              {tips.map((tip, i) => <li key={i}>{tip}</li>)}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default Help;
