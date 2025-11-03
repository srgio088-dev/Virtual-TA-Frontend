import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPostJSON } from "../api/client"; // reuse your helper

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
      await apiPostJSON("/api/assignments", { name: name.trim(), rubric: rubric.trim() });
      navigate("/"); // back to Assignment list
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
        maxWidth: 720,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        padding: "20px",
      }}
    >
      <h2 style={{ marginBottom: "10px" }}>Create Assignment</h2>

      <label style={{ fontWeight: "bold" }}>Assignment Name</label>
      <input
        placeholder="e.g., Essay 1"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{
          padding: "8px",
          fontSize: "1rem",
          borderRadius: "6px",
          border: "1px solid #ccc",
        }}
      />

      <label style={{ fontWeight: "bold", marginTop: "10px" }}>Rubric</label>
      <textarea
        rows={10}
        placeholder="e.g., Intro (20), Evidence (40), Clarity (40)"
        value={rubric}
        onChange={(e) => setRubric(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          fontSize: "1rem",
          borderRadius: "6px",
          border: "1px solid #ccc",
          resize: "vertical",
        }}
      />

      {error && <p className="error" style={{ color: "red", marginTop: 4 }}>{error}</p>}

      <button
        type="submit"
        disabled={busy}
        style={{
          marginTop: "12px",
          backgroundColor: "#1a73e8",
          color: "white",
          fontWeight: "bold",
          padding: "10px 20px",
          borderRadius: "6px",
          border: "none",
          cursor: "pointer",
          fontSize: "1rem",
        }}
      >
        {busy ? "Creating…" : "Create"}
      </button>
    </form>
  );
}
