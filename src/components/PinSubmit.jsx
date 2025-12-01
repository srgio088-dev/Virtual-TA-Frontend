// src/components/PinSubmit.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function PinSubmit() {
  const { pin } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // This is what we passed from PinEntry via navigate(..., { state: data })
  // expected: { class_id, assignment_id, student_id }
  const data = location.state;

  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // NEW: store assignment name for display
  const [assignmentName, setAssignmentName] = useState("");

  // If user hit /submit/:pin directly (no state), send them back to PIN page
  if (!data) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.card}>
          <h2 style={styles.title}>Invalid Session</h2>
          <p style={styles.subtitle}>
            Please go back to the PIN page and enter your PIN again.
          </p>
          <button style={styles.button} onClick={() => navigate("/submit")}>
            Go to PIN Page
          </button>
        </div>
      </div>
    );
  }

  // Fetch assignment details so we can show the assignment name
  useEffect(() => {
    async function fetchAssignment() {
      try {
        const res = await fetch(
          `${API_BASE}/api/assignments/${data.assignment_id}`
        );
        if (!res.ok) return;
        const assignment = await res.json();
        setAssignmentName(assignment.name || "");
      } catch (err) {
        console.error("Failed to load assignment for PIN submit", err);
      }
    }

    if (data?.assignment_id) {
      fetchAssignment();
    }
  }, [data]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!file) {
      setError("Please choose a file to upload.");
      return;
    }

    const formData = new FormData();
    // backend expects: student_name, assignment_id, file
    formData.append("student_name", data.student_id); // from PIN
    formData.append("assignment_id", data.assignment_id);
    formData.append("file", file);

    try {
      setBusy(true);
      const res = await fetch(`${API_BASE}/api/upload_submission`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Upload failed");
      }

      setSuccess("Your submission was uploaded and graded!");
      setFile(null);
    } catch (err) {
      console.error(err);
      setError(err.message || "Upload failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h2 style={styles.title}>Submit Assignment</h2>
        <p style={styles.subtitle}>
          PIN: <strong>{pin}</strong>
          <br />
          {/* CHANGED: show Assignment name instead of "Assignment ID" + number */}
          Assignment:{" "}
          <strong>
            {assignmentName || `#${data.assignment_id}`}
          </strong>
        </p>

        <form onSubmit={handleSubmit}>
          <label style={styles.label}>
            Choose file (txt, pdf, docx):
            <input
              type="file"
              accept=".txt,.pdf,.docx"
              onChange={(e) => setFile(e.target.files[0] || null)}
              style={styles.fileInput}
            />
          </label>

          <button type="submit" style={styles.button} disabled={busy}>
            {busy ? "Uploading..." : "Upload & Submit"}
          </button>
        </form>

        {error && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.success}>{success}</p>}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingTop: "40px",
  },
  card: {
    maxWidth: "520px",
    width: "100%",
    backgroundColor: "#111",
    color: "#fff",
    padding: "24px 28px",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.4)",
    border: "1px solid #333",
    fontFamily: "Arial, sans-serif",
  },
  title: {
    fontSize: "1.5rem",
    marginBottom: "10px",
    color: "#FFD700",
  },
  subtitle: {
    fontSize: "0.95rem",
    marginBottom: "16px",
    color: "#ddd",
  },
  label: {
    display: "block",
    marginBottom: "12px",
    fontSize: "0.95rem",
  },
  fileInput: {
    display: "block",
    marginTop: "6px",
    marginBottom: "16px",
  },
  button: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#FFD700",
    color: "#000",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "1rem",
  },
  error: {
    marginTop: "10px",
    color: "#ff6b6b",
    fontSize: "0.9rem",
  },
  success: {
    marginTop: "10px",
    color: "#4caf50",
    fontSize: "0.9rem",
  },
};
