import React, { useEffect, useState } from "react";

function Help() {
  const [tips, setTips] = useState([]);
  useEffect(() => {
    fetch("http://localhost:8000/help")
      .then(res => res.json())
      .then(data => setTips(data.tips));
  }, []);
  return (
    <div className="help-modal">
      <h3>Help & Tips</h3>
      <ul>
        {tips.map((tip, i) => <li key={i}>{tip}</li>)}
      </ul>
    </div>
  );
}

export default Help;
