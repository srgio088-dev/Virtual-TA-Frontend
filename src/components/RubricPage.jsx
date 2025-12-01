import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiGet } from "../api/client.js";

export default function RubricPage() {
  const { id } = useParams(); // assignment id
  const [assignmentName, setAssignmentName] = useState("—");
  const [rubric, setRubric] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  function downloadText(filename, text) {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  useEffect(() => {
    (async () => {
      try {
        // try the rubric endpoint first
        const r = await apiGet(`/api/assignments/${id}/rubric`);
        setRubric(r.rubric || "No rubric provided.");
        setAssignmentName(r.name || "—");
      } catch {
        // fallback: fetch the assignment itself and read .rubric
        try {
          const a = await apiGet(`/api/assignments/${id}`);
          setRubric(a.rubric || "No rubric provided.");
          setAssignmentName(a.name || "—");
        } catch (e) {
          setError(e.message || "Failed to load rubric");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="container"><p>Loading…</p></div>;
  if (error)   return <div className="container"><p className="error">{error}</p></div>;

  return (
    <div className="container">
      <h1>Rubric</h1>

      <div className="mb-3 text-sm">
        <strong>Assignment:</strong> {assignmentName}
      </div>

      <div className="p-3 border rounded bg-white whitespace-pre-wrap">
        {rubric}
      </div>

      <div className="row" style={{ gap: 12, marginTop: 12 }}>

        <button
          type="button"
          className="btn"
          onClick={() => navigate(`/assignment/${id}`)}
        >
          Back to Submissions
        </button>
        
        <button
          type="button"
          className="btn"
          onClick={() => window.print()}
        >
          Print
        </button>
        <button
          type="button"
          className="btn"
          onClick={() =>
            downloadText(
              `rubric-${(assignmentName || "assignment").replace(/\s+/g, "_")}.txt`,
              rubric || ""
            )
          }
        >
          Download
        </button>
      </div>
    </div>
  );
}
