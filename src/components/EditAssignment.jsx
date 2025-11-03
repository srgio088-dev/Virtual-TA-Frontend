import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiGet, apiPostJSON } from "../api/client";

export default function EditAssignment() {
  const [searchParams] = useSearchParams();
  const assignmentId = searchParams.get("id");

  const [name, setName] = useState("");
  const [rubric, setRubric] = useState("");

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const navigate = useNavigate();

  // Load existing data
  useEffect(() => {
    async function load() {
      try {
        const data = await apiGet(`/api/assignments/${assignmentId}`);
        setName(data.name || "");
        setRubric(data.rubric || data.rubric_text || "");
      } catch (e) {
        setError("Failed to load assignment.");
      }
    }
    load();
  }, [assignmentId]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    if (!name.trim() || !rubric.trim()) {
      setError("Both name and rubric are required.");
      return;
    }

    try {
      setBusy(true);

      // PUT /api/assignments/:id  (Update)
      await apiPostJSON(`/api/assignments/${assignmentId}`, {
        name: name.trim(),
        rubric: rubric.trim(),
        _method: "PUT" // if your backend uses method override
      });

      navigate("/");
    } catch (err) {
      setError(err?.message || "Failed to update assignment.");
    } finally {
      setBusy(false);
    }
  }

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
      <h2>Edit Assignment</h2>

      <label style={{ fontWeight: "bold" }}>Assignment Name</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
      />

      <label style={{ fontWeight: "bold" }}>Rubric</label>
      <textarea
        rows={10}
        value={rubric}
        onChange={(e) => setRubric(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "6px",
          border: "1px solid #ccc",
        }}
      />

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button
        type="submit"
        disabled={busy}
        style={{
          backgroundColor: "#1a73e8",
          color: "white",
          fontWeight: "bold",
          padding: "10px 20px",
          borderRadius: "6px",
          border: "none",
          marginTop: "10px",
          cursor: "pointer",
        }}
      >
        {busy ? "Saving…" : "Save Changes"}
      </button>
    </form>
  );
}
