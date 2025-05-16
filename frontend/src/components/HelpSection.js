import React from "react";

function HelpSection() {
  return (
    <div className="help-section">
      <h3>Need Help?</h3>
      <ul>
        <li>Write code in the editor and click <b>Run</b> to execute.</li>
        <li>
          Switch programming languages using the <b>Language</b> dropdown.
        </li>
        <li>
          Use <b>input()</b> (or the equivalent in your language) and enter input in the Input box.
          <br />
          <span style={{ color: "#888" }}>
            (Note: Standard input is not supported for JavaScript.)
          </span>
        </li>
        <li>Try code snippets for quick learning!</li>
        <li>Switch between Light/Dark mode for comfort.</li>
        <li>Share code with friends using the <b>Share</b> button.</li>
        <li>Errors will be shown in red below the output.</li>
      </ul>
    </div>
  );
}

export default HelpSection;
