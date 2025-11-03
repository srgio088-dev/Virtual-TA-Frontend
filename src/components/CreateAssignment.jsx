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
        width: "90%",
        maxWidth: "1200px",
        margin: "60px auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "40px",
      }}
    >
      {/* ===== Row 1: Create Assignment Box ===== */}
      <form
        onSubmit={onSubmit}
        style={{
          width: "100%",
          border: "2px solid #ccc",
          borderRadius: "10px",
          padding: "30px 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "30px",
          backgroundColor: "#fff",
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        }}
      >
        <h2
          style={{
            margin: 0,
            whiteSpace: "nowrap",
            fontSize: "1.8rem",
            fontWeight: "bold",
          }}
        >
          Create Assignment
        </h2>

        <div style={{ flexGrow: 1 }}>
          <label
            style={{
              fontWeight: "bold",
              display: "block",
              marginBottom: "8px",
              fontSize: "1rem",
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
              padding: "12px",
              fontSize: "1rem",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          />
        </div>
      </form>

      {/* ===== Row 2: Rubric Box ===== */}
      <div
        style={{
          width: "100%",
          border: "2px solid #ccc",
          borderRadius: "10px",
          padding: "30px 40px",
          backgroundColor: "#fff",
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        }}
      >
        <h2
          style={{
            margin: "0 0 20px 0",
            fontSize: "1.8rem",
            fontWeight: "bold",
          }}
        >
          Rubric
        </h2>
        <textarea
          rows={12}
          placeholder="e.g., Intro (20), Evidence (40), Clarity (40)"
          value={rubric}
          onChange={(e) => setRubric(e.target.value)}
          style={{
            width: "100%",
            padding: "14px",
            fontSize: "1rem",
            borderRadius: "8px",
            border: "1px solid #ccc",
            resize: "vertical",
            minHeight: "250px",
          }}
        />
      </div>

      {/* ===== Error Message ===== */}
      {error && (
        <p style={{ color: "red", fontWeight: "500", marginTop: "-10px" }}>
          {error}
        </p>
      )}

      {/* ===== Create Button (Centered) ===== */}
      <button
        onClick={onSubmit}
        disabled={busy}
        style={{
          backgroundColor: "#1a73e8",
          color: "#fff",
          fontWeight: "bold",
          fontSize: "1.2rem",
          padding: "18px 100px",
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
