import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiGet } from "../api/client.js";

export default function RubricPage() {
  const { id } = useParams(); // assignment id from URL
  const navigate = useNavigate();

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
        // Try the rubric endpoint first
        const r = await apiGet(`/api/assignments/${id}/rubric`);
        setRubric(r.rubric || "No rubric provided.");
        setAssignmentName(r.name || "—");
      } catch {
        // Fallback: fetch assignment and read `.rubric`
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

  if (loading)
    return (
      <div className="container">
        <p>Loading…</p>
      </div>
    );

  if (error)
    return (
      <div className="container">
        <p className="error">{error}</p>
      </div>
    );

  return (
    <div className="container">
      <h1>Rubric</h1>

      <div className="mb-3 text-sm">
        <strong>Assignment:</strong> {assignmentName}
      </div>

      <div id="print-area">
        <h1>{assignmentName}</h1>
        <div className="p-3 border rounded bg-white whitespace-pre-wrap">
          {rubric}
        </div>
      </div>

      {/* Button row */}
      <div className="button-row" 
        style={{
          display: "flex",
          gap: "12px",
          marginTop: "12px",
        }}
        >
        <button
          type="button"
          className="btn"
          style={{ flex: 1 }}
          onClick={() => navigate(`/assignment/${id}`)}
        >
          Back to Submissions
        </button>

        {/*<button 
          type="button" 
          className="btn" 
          style={{ flex: 1 }} 
          onClick={() => window.print()}
        >
          Print
        </button>*/}
        <button
          type="button"
          className="btn"
          style={{ flex: 1 }}
          onClick={() => {
            const printContent = document.getElementById("print-area").innerHTML;
            const w = window.open("", "_blank");
            w.document.write(`
              <html>
                <head>
                  <title>Rubric</title>
                  <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { font-size: 24px; margin-bottom: 10px; }
                    pre { white-space: pre-wrap; }
                  </style>
                </head>
                <body>
                  ${printContent}
                </body>
              </html>
            `);
            w.document.close();
            w.print();
            w.close();
          }}
        >
          Print Rubric
        </button>

        <button
          type="button"
          className="btn"
          style={{ flex: 1 }}
          onClick={() =>
            downloadText(
              `rubric-${(assignmentName || "assignment")
                .replace(/\s+/g, "_")
                .toLowerCase()}.txt`,
              rubric || ""
            )
          }
        >
          Download Rubric
        </button>
      </div>
    </div>
  );
}
