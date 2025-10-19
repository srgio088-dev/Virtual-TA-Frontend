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
    <form className="card form" onSubmit={onSubmit} style={{ maxWidth: 720, margin: "0 auto" }}>
      <h2>Create Assignment</h2>

      <label>Assignment Name</label>
      <input
        placeholder="e.g., Essay 1"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <label>Rubric</label>
      <textarea
        rows={6}
        placeholder="e.g., Intro (20), Evidence (40), Clarity (40)"
        value={rubric}
        onChange={(e) => setRubric(e.target.value)}
      />

      {error && <p className="error" style={{ marginTop: 8 }}>{error}</p>}

      <button type="submit" disabled={busy} style={{ marginTop: 12 }}>
        {busy ? "Creating…" : "Create"}
      </button>
    </form>
  );
}
