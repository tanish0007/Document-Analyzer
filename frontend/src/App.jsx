import { useState } from "react";
import axios from "axios";

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("http://localhost:8000/analyze/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setResult(res.data);
    } catch (err) {
      console.error("Upload failed", err);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>📄 Document Analyzer</h2>
      <input type="file" accept=".pdf,.docx,.txt" onChange={handleFileChange} />
      <button onClick={handleSubmit} style={{ marginLeft: "1rem" }}>
        Submit
      </button>

      {result && (
        <div style={{ marginTop: "2rem" }}>
          <h3>Summary:</h3>
          <p>{result.summary}</p>

          <h3>Persons Detected:</h3>
          <ul>{result.persons.map((p, i) => <li key={i}>{p}</li>)}</ul>

          <h3>Sentiment:</h3>
          <p>Polarity: {result.sentiment.polarity}</p>
          <p>Subjectivity: {result.sentiment.subjectivity}</p>
        </div>
      )}
    </div>
  );
}

export default App;
