import React, { useState } from "react";

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [jobDesc, setJobDesc] = useState("");

  const handleChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file");
      return;
    }

    if (file.type !== "application/pdf") {
      setErrorMsg("Only PDF files allowed");
      return;
    } else {
      setErrorMsg("");
    }

    if (!jobDesc.trim()) {
      setErrorMsg("Job description cannot be empty");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("jobDesc", jobDesc);

    try {
      setLoading(true);

      const response = await fetch("http://127.0.0.1:5000/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("upload failed");

      const data = await response.json();
      setResult(data);
      setErrorMsg("");
    } catch (err) {
      setErrorMsg("Something went wrong. Please try again.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 75) return "#4CAF50";
    if (score >= 50) return "#FFC107";
    return "#F44336";
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>AI Resume Analyzer</h1>

        <p style={styles.label}>Job Description</p>

        <textarea
          placeholder="Paste Job Description here..."
          value={jobDesc}
          onChange={(e) => setJobDesc(e.target.value)}
          style={styles.textarea}
        />

        {/* File + Button Row */}
        <div style={styles.inputRow}>
          <input type="file" onChange={handleChange} />

          <button
            onClick={handleUpload}
            style={{
              ...styles.button,
              opacity: loading || !file || !jobDesc.trim() ? 0.6 : 1,
              cursor:
                loading || !file || !jobDesc.trim()
                  ? "not-allowed"
                  : "pointer",
            }}
            disabled={loading || !file || !jobDesc.trim()}
          >
            {loading ? "Analyzing..." : "Upload & Analyze"}
          </button>
        </div>

        {errorMsg && <p style={styles.error}>{errorMsg}</p>}

        {/* SCORE */}
        {result?.score !== undefined && (
          <>
            <div
              style={{
                ...styles.scoreBox,
                background: getScoreColor(result.score),
              }}
            >
              <h2>ATS Score</h2>
              <h1 style={styles.scoreText}>{result.score}/100</h1>
            </div>

            <div style={styles.progressBar}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${result.score}%`,
                  background: getScoreColor(result.score),
                }}
              />
            </div>
          </>
        )}

        {/* RESULT */}
        {result && (
          <div style={styles.resultBox}>
            {/* Strengths + Weaknesses */}
            <div style={styles.row}>
              <div style={styles.col}>
                <h2 style={styles.green}>✔ Strengths</h2>
                <ul>
                  {result.strengths?.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              <div style={styles.col}>
                <h2 style={styles.red}>✖ Weaknesses</h2>
                <ul>
                  {result.weaknesses?.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Suggestions */}
            <div style={styles.section}>
              <h2 style={styles.blue}>💡 Suggestions</h2>
              <ul>
                {result.suggestions?.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Missing Keywords */}
            <div style={styles.section}>
              <h2 style={styles.orange}>⚠ Missing Keywords</h2>

              {result.missing_keywords?.length === 0 ? (
                <p style={{ color: "green" }}>
                  ✔ No missing keywords
                </p>
              ) : (
                <div style={styles.tags}>
                  {result.missing_keywords.map((item, i) => (
                    <span key={i} style={styles.tag}>
                      {item}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #eef2f3, #dfe9f3)",
    padding: "20px",
  },

  card: {
    background: "#fff",
    padding: "30px",
    borderRadius: "14px",
    width: "700px",
    maxWidth: "95%",
    boxShadow: "0 12px 30px rgba(0,0,0,0.1)",
  },

  title: {
    textAlign: "center",
    marginBottom: "20px",
  },

  label: {
    fontWeight: "bold",
    marginBottom: "5px",
  },

  textarea: {
    width: "100%",
    height: "120px",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    marginBottom: "20px",
  },

  inputRow: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },

  button: {
    padding: "10px 18px",
    borderRadius: "8px",
    border: "none",
    background: "#4CAF50",
    color: "#fff",
    fontWeight: "bold",
  },

  error: {
    color: "red",
    marginTop: "10px",
  },

  scoreBox: {
    marginTop: "20px",
    padding: "25px",
    borderRadius: "16px",
    color: "#fff",
    textAlign: "center",
  },

  scoreText: {
    fontSize: "42px",
    margin: 0,
  },

  progressBar: {
    marginTop: "10px",
    height: "10px",
    background: "#ddd",
    borderRadius: "10px",
  },

  progressFill: {
    height: "100%",
    borderRadius: "10px",
  },

  resultBox: {
    marginTop: "20px",
  },

  row: {
    display: "flex",
    gap: "20px",
  },

  col: {
    flex: 1,
  },

  section: {
    marginTop: "15px",
  },

  tags: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
  },

  tag: {
    background: "#fff3e0",
    padding: "6px 12px",
    borderRadius: "20px",
  },

  green: { color: "#2e7d32" },
  red: { color: "#c62828" },
  blue: { color: "#1565c0" },
  orange: { color: "#ef6c00" },
};

export default App;