import React from "react";

function OutputTerminal({ output, error }) {
  return (
    <div className="terminal">
      <h3>Output:</h3>
      {output ? <pre>{output}</pre> : null}
      {error ? <pre className="error">{error}</pre> : null}
      {!output && !error && <pre className="faint">No output.</pre>}
    </div>
  );
}

export default OutputTerminal;
