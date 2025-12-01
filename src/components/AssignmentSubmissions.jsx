import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { apiGet } from "../api/client";
import RubricToggle from "../components/RubricToggle";

export default function AssignmentSubmissions() {
  const { id } = useParams(); // assignment id
  const [assignment, setAssignment] = useState(null);
  const [error, setError] = useState("");
  const [isRubricOpen, setIsRubricOpen] = useState(false);
  const navigate = useNavigate();

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

  //THIS IS NEW FOR CSV DOWNLOAD

  // place this after onDeleteSubmission(...) and before the `if (error) ...` return
async function downloadCSV() {
  if (!assignment || !assignment.submissions || !assignment.submissions.length) return;

  const base = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

  // Fetch full submission details for every submission (uses the same endpoint ReviewSubmission uses)
  const promises = assignment.submissions.map(async (s) => {
    try {
      const res = await fetch(`${base}/api/submissions/${s.id}`);
      if (!res.ok) {
        // fallback to the short object if something fails
        return { ...s, ai_feedback: "" };
      }
      const full = await res.json();
      return full;
    } catch (err) {
      return { ...s, ai_feedback: "" };
    }
  });

  const fullSubs = await Promise.all(promises);

  // Build CSV rows
  const header = ["Student", "AI Grade", "Final Grade", "AI Feedback"];
  const rows = fullSubs.map(fs => {
    const student = (fs.student_name || "").replace(/"/g, '""');
    const aiGrade = (fs.ai_grade || "").toString().replace(/"/g, '""');
    const finalGrade = (fs.final_grade || "").toString().replace(/"/g, '""');
    // Replace newlines inside feedback with literal \n to keep CSV consistent, and escape quotes
    const feedback = (fs.ai_feedback || "").replace(/\r\n/g, "\n").replace(/\n/g, "\\n").replace(/"/g, '""');
    return [`"${student}"`, `"${aiGrade}"`, `"${finalGrade}"`, `"${feedback}"`].join(",");
  });

  const csvContent = [header.join(","), ...rows].join("\n");

  // download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  // sanitize assignment name for filename
  const safeName = (assignment.name || "assignment").replace(/\s+/g, "_").replace(/[^\w\-_.]/g, "");
  a.download = `${safeName}_AI_Feedback.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
  
  //THIS IS NEW FOR CSV DOWNLOAD^^

  if (error) return <div className="container"><p className="error">{error}</p></div>;
  if (!assignment) return <div className="container"><p>Loading…</p></div>;

  const subs = assignment.submissions || [];

  return (
  <div className="container">
    <h1>{assignment.name} — Submissions ({subs.length})</h1>

    {/*<div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "1rem" }}>

      <button className="btn" style={{ flex: 1 }} onClick={() => navigate(`/assignment/${assignment.id}/rubric`)}>View Rubric</button>
      <button className="btn" style={{ flex: 1 }} onClick={() => navigate(`/assignments`)}>Back to Assignment List</button>
      <button className="btn" onClick={downloadCSV}>Download All AI Feedback (CSV)</button>

    </div>*/}

    <div className="button-row"
      style={{ 
        display: "flex", 
        gap: "12px", 
        marginBottom: "8px" }}>

      <button type="button" className="btn" style={{ flex: 1 }} onClick={() => navigate(`/assignment/${assignment.id}/rubric`)}>View Rubric</button>
      <button type="button" className="btn" style={{ flex: 1 }} onClick={() => navigate(`/assignments`)}>Back to Assignment List</button>
      <button type="button" className="btn" onClick={downloadCSV}>Download All AI Feedback (CSV)</button>
    </div>

    {!subs.length ? (
      <p>No submissions yet.</p>
    ) : (
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
    <button 
      className="btn"
      onClick={() => navigate(`/review/${s.id}`)}
    >
      Open Review
    </button>

    <button 
      className="btn"
      onClick={() => onDeleteSubmission(s.id)}
    >
      Delete
    </button>
  </div>
</li>
        ))}
      </ul>
    )}
  </div>
);
}
