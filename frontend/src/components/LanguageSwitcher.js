import React from "react";

// Accept a 'languages' prop for flexibility
function LanguageSwitcher({ language, setLanguage, languages }) {
  return (
    <div className="lang-switcher">
      <label>Language: </label>
      <select value={language} onChange={e => setLanguage(e.target.value)}>
        {languages.map(lang => (
          <option key={lang.value} value={lang.value}>{lang.label}</option>
        ))}
      </select>
      <span style={{fontSize: "0.9em", color: "#888"}}>
        &nbsp;(Supports: Python, JavaScript, C, C++, Java, C#)
      </span>
    </div>
  );
}

export default LanguageSwitcher;
