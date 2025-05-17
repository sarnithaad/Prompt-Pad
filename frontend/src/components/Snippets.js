import React, { useEffect, useState } from "react";

function Snippets({ onSelect, language }) {
  const [snippets, setSnippets] = useState([]);
  useEffect(() => {
    fetch("http://localhost:8000/snippets")
      .then(res => res.json())
      .then(data => setSnippets(data[language] || []));
  }, [language]);
  return (
    <div className="snippets-modal">
      <h3>Code Snippets ({language})</h3>
      <ul>
        {snippets.map(s => (
          <li key={s.title}>
            <button onClick={() => onSelect(s.code)}>{s.title}</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Snippets;
