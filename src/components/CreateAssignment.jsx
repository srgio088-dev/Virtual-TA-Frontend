import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPostJSON } from "../api/client";

export default function CreateAssignment() {
  const [name, setName] = useState("");
  const [rubric, setRubric] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !rubric.trim()) {
      setError("Both name and rubric are required.");
      return;
    }

    try {
      setBusy(true);
      await apiPostJSON("/api/assignments", {
        name: name.trim(),
        rubric: rubric.trim(),
      });
      navigate("/");
    } catch (err) {
      setError(err?.message || "Failed to create assignment.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      style={{
        width: "95%",
        margin: "40px auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "50px",
      }}
    >
      {/* ===== Row 1: Create Assignment Box ===== */}
      <form
        onSubmit={onSubmit}
        style={{
          width: "100%",
          border: "2px solid #ccc",
          borderRadius: "12px",
          padding: "40px 60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "50px",
          backgroundColor: "#fff",
          boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
        }}
      >
        <h2
          style={{
            margin: 0,
            whiteSpace: "nowrap",
            fontSize: "2rem",
            fontSize: "1.5rem",
            fontWeight: "bold",
          }}
        >

        <h2
          style={{
            margin: "0 0 20px 0",
            fontSize: "2rem",
            fontSize: "1.5rem",
            fontWeight: "bold",
          }}
        >
          Rubric
        </h2>
        <textarea
          rows={16}
          placeholder="e.g., Intro (20), Evidence (40), Clarity (40)"
          value={rubric}
          onChange={(e) => setRubric(e.target.value)}
          style={{
            width: "100%",
            padding: "16px",
            fontSize: "1.1rem",
            borderRadius: "10px",
            border: "1px solid #ccc",
            resize: "vertical",
            minHeight: "300px",
          }}
        />
      </div>

      {/* ===== Error Message ===== */}
      {error && (
        <p style={{ color: "red", fontWeight: "500", fontSize: "1rem" }}>
          {error}
        </p>
      )}

      {/* ===== Create Button ===== */}
      <button
        onClick={onSubmit}
        disabled={busy}
        style={{
          backgroundColor: "#1a73e8",
          color: "#fff",
          fontWeight: "bold",
          fontSize: "1.3rem",
          padding: "20px 140px",
          borderRadius: "12px",
          border: "none",
          cursor: "pointer",
          transition: "background 0.2s ease",
        }}
        onMouseOver={(e) => (e.target.style.backgroundColor = "#155fc1")}
        onMouseOut={(e) => (e.target.style.backgroundColor = "#1a73e8")}
      >
        {busy ? "Creating…" : "Create"}
      </button>
    </div>
  );
}
