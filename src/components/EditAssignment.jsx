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
        width: "90%",
        maxWidth: "1200px",
        margin: "40px auto",
        display: "flex",
        flexDirection: "column",
        gap: "30px",
        background: "#fff",
        padding: "40px",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      }}
    >
      {/* ===== Row 1: Create Assignment Section ===== */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "20px",
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "20px",
        }}
      >
        <h2 style={{ margin: 0, whiteSpace: "nowrap" }}>Create Assignment</h2>

        <div style={{ flexGrow: 1 }}>
          <label
            style={{
              fontWeight: "bold",
              display: "block",
              marginBottom: "6px",
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
              padding: "10px",
              fontSize: "1rem",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          />
        </div>
      </div>

      {/* ===== Row 2: Rubric Section ===== */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "20px",
        }}
      >
        <label
          style={{
            fontWeight: "bold",
            marginBottom: "8px",
            fontSize: "1rem",
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

      {/* ===== Create Button ===== */}
      <button
        type="submit"
        disabled={busy}
        style={{
          alignSelf: "center",
          marginTop: "10px",
          backgroundColor: "#1a73e8",
          color: "#fff",
          fontWeight: "bold",
          fontSize: "1.2rem",
          padding: "18px 100px",
          borderRadius: "10px",
          border: "none",
          cursor: "pointer",
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
