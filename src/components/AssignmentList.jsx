import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet, apiPostJSON } from "../api/client";

export default function AssignmentList() {
  const [assignments, setAssignments] = useState([]);
  const [error, setError] = useState("");

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
            <li key={a.id} className="card">
              <div>
                <strong>{a.name}</strong>{" "}
                <span className="muted">({a.submission_count ?? (a.submissions?.length || 0)} submissions)</span>
                <p className="muted">
                  {a.rubric_id ? `Rubric #${a.rubric_id}` : `Rubric: ${a.rubric?.slice(0,100)}${a.rubric?.length>100?"…":""}`}
                </p>
              </div>
              <div className="row" style={{ gap: 12 }}>
                <Link className="btn" to={`/assignment/${a.id}`}>View Submissions</Link>
                <Link className="btn" to={`/edit/${a.id}`}>Edit</Link>
                <button className="btn" onClick={() => onDelete(a.id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
