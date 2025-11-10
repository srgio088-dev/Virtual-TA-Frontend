import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiGet } from "../api/client";

export default function AssignmentSubmissions() {
  const { id } = useParams(); // assignment id
  const [assignment, setAssignment] = useState(null);
  const [error, setError] = useState("");
  const [isRubricOpen, setIsRubricOpen] = useState(false);

  async function load() {
    try {
      const assignments = await apiGet("/api/assignments");
      const a = assignments.find(x => String(x.id) === String(id));
      if (!a) throw new Error("Assignment not found");
      setAssignment(a);
    } catch (e) { setError(e.message); }
  }

  useEffect(() => { load(); }, [id]);

  async function onDeleteSubmission(sid) {
    if (!confirm("Delete this submission?")) return;
    await fetch(`${import.meta.env.VITE_API_URL || "http://127.0.0.1:5000"}/api/submissions/${sid}`, { method: "DELETE" });
    await load();
  }

  if (error) return <div className="container"><p className="error">{error}</p></div>;
  if (!assignment) return <div className="container"><p>Loading…</p></div>;

  const subs = assignment.submissions || [];

  return (
    <div className="container">
      <h1>{assignment.name} — Submissions ({subs.length})</h1>
      {!subs.length ? <p>No submissions yet.</p> : (
        <ul className="list">
          {subs.map(s => (
            <li key={s.id} className="card">
              <div>
                <strong>{s.student_name || "Unknown"}</strong>
                <div className="muted">
                  AI: {s.ai_grade || "—"} &nbsp; | &nbsp; Final: {s.final_grade || "—"}
                </div>
              </div>
              <div className="row" style={{ gap: 12 }}>
                <Link to={`/review/${s.id}`}>Open Review</Link>
                <button onClick={() => onDeleteSubmission(s.id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
