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
    <form
      onSubmit={onSubmit}
      style={{
        width: "95%",
        margin: "40px auto",
        border: "2px solid #ccc",
        borderRadius: "12px",
        padding: "20px 30px",
        backgroundColor: "#fff",
        boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        fontSize: "1.1rem",
      }}
    >
      {/* ===== Header ===== */}
      <h2
        style={{
          margin: 0,
          fontSize: "1.5rem",
          fontWeight: "bold",
        }}
      >
        Create Assignment
      </h2>

      {/* ===== Assignment Name ===== */}
      <div>
        <label
          style={{
            fontWeight: "bold",
            display: "block",
            marginBottom: "8px",
          }}
        >
          Assignment Name
        </label>
        <input
          placeholder="e.g., Essay 1"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "10px",
            border: "1px solid #ccc",
            fontSize: "1rem",
          }}
        />
      </div>

      {/* ===== Rubric ===== */}
      <div>
        <label
          style={{
            fontWeight: "bold",
            display: "block",
            marginBottom: "8px",
          }}
        >
          Rubric
        </label>
        <textarea
          rows={12}
          placeholder="e.g., Intro (20), Evidence (40), Clarity (40)"
          value={rubric}
          onChange={(e) => setRubric(e.target.value)}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "10px",
            border: "1px solid #ccc",
            fontSize: "1rem",
            resize: "vertical",
            minHeight: "250px",
          }}
        />
      </div>

      {/* ===== Error ===== */}
      {error && (
        <p style={{ color: "red", fontWeight: "500", fontSize: "1rem" }}>
          {error}
        </p>
      )}

      {/* ===== Button ===== */}
      <button
        disabled={busy}
        style={{
          backgroundColor: "#1a73e8",
          color: "#fff",
          fontWeight: "bold",
          fontSize: "1.2rem",
          padding: "12px 80px",
          borderRadius: "10px",
          border: "none",
          cursor: "pointer",
          alignSelf: "center",
          transition: "background 0.2s ease",
        }}
        onMouseOver={(e) => (e.target.style.backgroundColor = "#155fc1")}
        onMouseOut={(e) => (e.target.style.backgroundColor = "#1a73e8")}
      >
        {busy ? "Creating…" : "Create"}
      </button>
    </form>
  );
}
