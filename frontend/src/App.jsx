import React, { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import ClipLoader from "react-spinners/ClipLoader";

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysisType, setAnalysisType] = useState("basic"); // dropdown selection

  const onDrop = useCallback((acceptedFiles) => {
    setFile(acceptedFiles[0]);
    setResult(null);
  }, []);

  useEffect(() => {
    document.body.style.backgroundColor = "#000000";
    document.body.style.margin = 0;
  }, []);
  

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [],
      "text/plain": []
    }
  });

  const handleSubmit = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", analysisType); // Send selected dropdown value
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
    <div style={{ padding: "2rem", maxWidth: "900px", margin: "auto", fontFamily: "sans-serif", backgroundColor: "black", color: "#fff" }}>
      <h2 style={{ color: "#3f51b5" }}>📄 Document Analyzer</h2>

      {/* Drag and Drop Area */}
      <div
        {...getRootProps()}
        style={{
          border: "2px dashed #3f51b5",
          padding: "2rem",
          height: "45vh",
          borderRadius: "8px",
          textAlign: "center",
          background: isDragActive ? "#1e1e1e" : "#1a1a1a",
          marginBottom: "1rem",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          cursor: "pointer"
        }}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the file here...</p>
        ) : (
          <p>Drag and drop a file here, or click to select a file</p>
        )}
        {file && <p>📎 Selected: {file.name}</p>}
      </div>

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
          marginTop: "1rem"
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
        <div style={{ marginTop: "2rem", background: "#012", padding: "1.5rem", borderRadius: "8px", border: "2px solid #3f51b5" }}>
          <h3 style={{ color: "crimson" }}>📝 Summary:</h3>
          <p>{result.summary}</p>

          <h3 style={{ color: "crimson" }}>🏷️ Persons / Entities Detected:</h3>
          <ul>
            {result.persons.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>

          <h3 style={{ color: "crimson" }}>📊 Sentiment:</h3>
          <p><strong>Polarity:</strong> {result.sentiment.polarity}</p>
          <p><strong>Subjectivity:</strong> {result.sentiment.subjectivity}</p>
        </div>
      )}
    </div>
  );
}

export default App;