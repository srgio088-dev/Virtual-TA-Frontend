import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiGet, apiPostJSON } from "../api/client";

export default function AssignmentList() {
  const [assignments, setAssignments] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function load() {
    try {
      const data = await apiGet("/api/assignments");
      setAssignments(data);
    } catch (e) { setError(e.message); }
  }

  useEffect(() => { load(); }, []);

  async function onDelete(id) {
    if (!confirm("Delete this assignment?")) return;
    await fetch(`${import.meta.env.VITE_API_URL || "http://127.0.0.1:5000"}/api/assignments/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div className="container">
      <h1>Assignments</h1>
      {error && <p className="error">{error}</p>}
      {!assignments.length ? <p>No assignments yet.</p> : (
        <ul className="list">
          {assignments.map(a => (
          /* NEW CODE ADDED BELOW */
            <li key={a.id} className="assignment-card">
  <div className="assignment-main">
    <strong>{a.name}</strong>{" "}
    <span className="muted">
      ({a.submission_count ?? (a.submissions?.length || 0)} submissions)
    </span>

    <p className="muted">
      {a.rubric_id
        ? `Rubric #${a.rubric_id}`
        : `Rubric: ${a.rubric?.slice(0, 100)}${a.rubric?.length > 100 ? "…" : ""}`}
    </p>
  </div>

  {/* Hidden until hover */}
  <div className="assignment-actions">
    <button onClick={() => navigate(`/assignment/${a.id}`)}>View Submissions</button>
    <button onClick={() => navigate(`/edit/${a.id}`)}>Edit</button>
    <button onClick={() => onDelete(a.id)}>Delete</button>
  </div>
</li>

/* NEW CODE ADDED ABOVE */
          ))}
        </ul>
      )}
    </div>
  );
}
