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
      className="card form"
      onSubmit={onSubmit}
      style={{
        maxWidth: 800,
        margin: "40px auto",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        background: "#fff",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      {/* --- First Row: Title + Assignment Name --- */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <h2 style={{ margin: 0, whiteSpace: "nowrap" }}>Create Assignment</h2>
        <div style={{ flexGrow: 1 }}>
          <label style={{ fontWeight: "bold" }}>Assignment Name</label>
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

      {/* --- Second Row: Rubric Text Area --- */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <label style={{ fontWeight: "bold", marginBottom: "8px" }}>Rubric</label>
        <textarea
          rows={10}
          placeholder="e.g., Intro (20), Evidence (40), Clarity (40)"
          value={rubric}
          onChange={(e) => setRubric(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            fontSize: "1rem",
            borderRadius: "6px",
            border: "1px solid #ccc",
            resize: "vertical",
          }}
        />
      </div>

      {/* --- Error Message --- */}
      {error && (
        <p className="error" style={{ color: "red", marginTop: "-10px" }}>
          {error}
        </p>
      )}

      {/* --- Create Button --- */}
      <button
        type="submit"
        disabled={busy}
        style={{
          alignSelf: "center",
          marginTop: "10px",
          backgroundColor: "#1a73e8",
          color: "#fff",
          fontWeight: "bold",
          fontSize: "1.1rem",
          padding: "14px 60px",
          borderRadius: "8px",
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
