// src/components/PinEntry.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function PinEntry() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!pin.trim()) {
      setError("Please enter your PIN.");
      return;
    }

    try {
      setBusy(true);
      const res = await fetch(`${API_BASE}/api/pins/${pin.trim()}`);
      if (!res.ok) {
        throw new Error("Invalid PIN");
      }
      const data = await res.json();
      // data = { class_id, assignment_id, student_id }
      navigate(`/submit/${pin.trim()}`, { state: data });
    } catch (err) {
      setError("Invalid PIN. Please check with your instructor.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h1 style={styles.title}>Submit Using PIN</h1>
        <p style={styles.subtitle}>
          Enter the 6-digit PIN provided by your instructor to submit your work.
        </p>

        <form onSubmit={onSubmit}>
          <input
            type="text"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="e.g. 100124"
            style={styles.input}
          />
          <button
            type="submit"
            style={styles.button}
            disabled={busy}
          >
            {busy ? "Checking..." : "Continue"}
          </button>
        </form>

        {error && <p style={styles.error}>{error}</p>}
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
    maxWidth: "480px",
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
    fontSize: "1.6rem",
    marginBottom: "8px",
    color: "#FFD700",
  },
  subtitle: {
    fontSize: "0.95rem",
    marginBottom: "18px",
    color: "#ddd",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "6px",
    border: "1px solid #444",
    marginBottom: "12px",
    fontSize: "1rem",
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
};
