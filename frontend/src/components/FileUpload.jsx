import React, { useState } from "react";
import axios from "axios";

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await axios.post("http://localhost:8000/analyze/", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    setResult(res.data);
  };

  return (
    <div>
      <input
        type="file"
        accept=".pdf,.docx,.txt"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button onClick={handleUpload} disabled={!file}>
        Analyze
      </button>

      {result && (
        <div style={{ marginTop: "2rem" }}>
          <h2>📋 Summary</h2>
          <p>{result.summary}</p>
          <h3>🧑 Persons</h3>
          <ul>{result.persons.map((p, i) => <li key={i}>{p}</li>)}</ul>
          <h3>😊 Sentiment</h3>
          <p>Polarity: {result.sentiment.polarity}</p>
          <p>Subjectivity: {result.sentiment.subjectivity}</p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;