import React, { useState } from "react";
import axios from "axios";
import ClipLoader from "react-spinners/ClipLoader"; // Spinner

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null); // reset previous result
  };

  const handleSubmit = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:8000/analyze/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data);
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "900px", margin: "auto", fontFamily: "sans-serif" }}>
      <h2 style={{ color: "#3f51b5" }}>📄 Document Analyzer</h2>
      <input
        type="file"
        accept=".pdf,.docx,.txt"
        onChange={handleFileChange}
        style={{ marginRight: "1rem", padding: "0.5rem" }}
      />
      <button
        onClick={handleSubmit}
        disabled={!file || loading}
        style={{
          backgroundColor: "#3f51b5",
          color: "#fff",
          padding: "0.6rem 1.2rem",
          borderRadius: "5px",
          border: "none",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Analyzing..." : "Submit"}
      </button>

      {loading && (
        <div style={{ marginTop: "1.5rem" }}>
          <ClipLoader color="#3f51b5" size={40} />
          <p>Analyzing document...</p>
        </div>
      )}

      {result && (
        <div style={{ marginTop: "2rem", background: "#f4f6fa", padding: "1.5rem", borderRadius: "8px" }}>
          <h3 style={{ color: "#2e7d32" }}>📝 Summary:</h3>
          <p>{result.summary}</p>

          <h3 style={{ color: "#0288d1" }}>🏷️ Persons / Entities Detected:</h3>
          <ul>
            {result.persons.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>

          <h3 style={{ color: "#f57c00" }}>📊 Sentiment:</h3>
          <p><strong>Polarity:</strong> {result.sentiment.polarity}</p>
          <p><strong>Subjectivity:</strong> {result.sentiment.subjectivity}</p>
        </div>
      )}
    </div>
  );
}

export default App;