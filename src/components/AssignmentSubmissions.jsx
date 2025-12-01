import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiGet } from "../api/client";

export default function AssignmentSubmissions() {
  const { id } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function load() {
    try {
      const assignments = await apiGet("/api/assignments");
      const a = assignments.find((x) => String(x.id) === String(id));
      if (!a) throw new Error("Assignment not found");
      setAssignment(a);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  async function onDeleteSubmission(sid) {
    if (!confirm("Delete this submission?")) return;
    await fetch(
      `${
        import.meta.env.VITE_API_URL || "http://127.0.0.1:5000"
      }/api/submissions/${sid}`,
      { method: "DELETE" }
    );
    await load();
  }

  async function downloadCSV() {
    if (!assignment?.submissions?.length) return;

    const base = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

    const fullSubs = await Promise.all(
      assignment.submissions.map(async (s) => {
        try {
          const res = await fetch(`${base}/api/submissions/${s.id}`);
          if (!res.ok) return { ...s, ai_feedback: "" };
          return await res.json();
        } catch {
          return { ...s, ai_feedback: "" };
        }
      })
    );

    const header = ["Student", "AI Grade", "Final Grade", "AI Feedback"];
    const rows = fullSubs.map((fs) => {
      const student = (fs.student_name || "").replace(/"/g, '""');
      const aiGrade = (fs.ai_grade || "").toString().replace(/"/g, '""');
      const finalGrade = (fs.final_grade || "").toString().replace(/"/g, '""');
      const feedback = (fs.ai_feedback || "")
        .replace(/\r?\n/g, "\\n")
        .replace(/"/g, '""');

      return [`"${student}"`, `"${aiGrade}"`, `"${finalGrade}"`, `"${feedback}"`].join(
        ","
      );
    });

    const csvContent = [header.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    const safeName = (assignment.name || "assignment")
      .replace(/\s+/g, "_")
      .replace(/[^\w\-_.]/g, "");
    a.href = url;
    a.download = `${safeName}_AI_Feedback.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  if (error) return <div className="container"><p className="error">{error}</p></div>;
  if (!assignment) return <div className="container"><p>Loading…</p></div>;

  const subs = assignment.submissions || [];

  return (
    <div className="container" style={{ margin: "0 auto" }}>
      <div
        className="card"
        style={{
          maxWidth: "900px",
          width: "100%",
          margin: "0 auto",
          padding: "2rem 2.5rem",
          display: "flex",
          flexDirection: "column"
        }}
      >
        <header style={{ marginBottom: "1.5rem", textAlign: "center" }}>
          <h1 style={{ marginBottom: "1rem" }}>{assignment.name}</h1>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "12px",
              flexWrap: "wrap",
              marginBottom: "1rem",
            }}
          >
            <button className="btn" onClick={() => navigate(`/assignment/${id}/rubric`)}>
              View Rubric
            </button>

            <button className="btn" onClick={() => navigate(`/assignments`)}>
              Back to Assignment List
            </button>

            <button className="btn" onClick={downloadCSV}>
              Download All AI Feedback (CSV)
            </button>
          </div>
        </header>

        <section>
          <h2 style={{ marginBottom: "1rem" }}>Submissions ({subs.length})</h2>

          {!subs.length ? (
            <p>No submissions yet.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "18px" }}>
              {subs.map((s) => (
                <li
                  key={s.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 18px",
                    borderRadius: "10px",
                    background: "#fff",
                    border: "1px solid #e5e5e5",
                  }}
                >
                  <div>
                    <strong>{s.student_name}</strong>
                    <div className="muted">
                      AI: {s.ai_grade || "—"} | Final: {s.final_grade || "—"}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "10px" }}>
                    <button className="btn" onClick={() => navigate(`/review/${s.id}`)}>
                      Open Review
                    </button>

                    <button className="btn" onClick={() => onDeleteSubmission(s.id)}>
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
