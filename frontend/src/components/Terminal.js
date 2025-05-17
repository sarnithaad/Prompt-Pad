import React from "react";

/**
 * Terminal component
 * Displays the output area with autoscroll.
 * Props:
 *   - output: string (output to display)
 *   - outputRef: ref (for autoscroll)
 */
function Terminal({ output, outputRef }) {
  return (
    <pre
      ref={outputRef}
      className="output-area"
      style={{
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
        marginBottom: 8,
      }}
      tabIndex={0}
      aria-label="Output"
    >
      {output}
    </pre>
  );
}

export default Terminal;
