import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiGet, apiPostJSON } from "../api/client";

export default function ReviewSubmission() {
  const { id } = useParams(); // submission id
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [finalGrade, setFinalGrade] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await apiGet(`/api/submissions/${id}`);
        setSubmission(data);
        setFinalGrade(data.final_grade ?? "");
      } catch (e) {
        setError(e.message || "Failed to load submission.");
      }
    })();
  }, [id]);

  async function saveFinal(e) {
    e.preventDefault();
    try {
      await apiPostJSON(`/api/submissions/${id}/finalize`, {
        final_grade: finalGrade,
      });
    } catch (e) {
      setError("Save failed: " + e.message);
    }
  }

  // Smart resolver for assignment + student display
  function resolveNames(sub) {
    if (!sub) {
      return { assignmentDisplay: "—", studentDisplay: "—" };
    }

    // Student is whatever backend stored
    let studentDisplay = sub.student_name || "—";

    // Try backend-provided assignment name first
    let assignmentDisplay =
      sub.assignment_name ||
      (sub.assignment && sub.assignment.name) ||
      "";

    // If backend didn't store assignment name, extract from original filename
    if (!assignmentDisplay && sub.original_filename) {
      const withoutExt = sub.original_filename.replace(/\.[^/.]+$/, "");
      const parts = withoutExt.split(" - ");

      if (parts.length >= 2) {
        // last part = student, rest = assignment/submission name
        const studentPart = parts[parts.length - 1].trim();
        const assignPart = parts.slice(0, parts.length - 1).join(" - ").trim();

        if (!sub.student_name) {
          studentDisplay = studentPart || studentDisplay;
        }
        assignmentDisplay = assignPart || assignmentDisplay;
      }
    }

    if (!assignmentDisplay) assignmentDisplay = "—";
    if (!studentDisplay) studentDisplay = "—";

    return { assignmentDisplay, studentDisplay };
  }

  function downloadFeedback() {
    if (!submission) return;

    const { assignmentDisplay, studentDisplay } = resolveNames(submission);

    const suggested = submission.ai_grade ?? "N/A";
    const final = finalGrade || submission.final_grade || "N/A";
    const feedback = submission.ai_feedback || "";

    const lines = [
      `Assignment: ${assignmentDisplay}`,
      `Student: ${studentDisplay}`,
      `Suggested Grade: ${suggested}`,
      `Final Grade: ${final}`,
      "",
      "AI Feedback:",
      "",
      feedback,
    ];

    const blob = new Blob([lines.join("\n")], {
      type: "text/plain;charset=utf-8",
    });

    // Filename like assignment_student_feedback.txt
    const rawName = `${assignmentDisplay}_${studentDisplay}`;
    const safeName = rawName.replace(/[^a-z0-9_-]+/gi, "_").toLowerCase();

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${safeName}_feedback.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  if (error) {
    return (
      <div className="container">
        <p className="error">{error}</p>
      </div>
    );
  }
  if (!submission) {
    return (
      <div className="container">
        <p>Loading…</p>
      </div>
    );
  }

  const { assignmentDisplay, studentDisplay } = resolveNames(submission);

  return (
    <div className="container">
      <h1>Review Submission</h1>

      <p>
        <strong>Assignment:</strong> {parsedAssignment}
      </p>
      <p>
        <strong>Student:</strong> {parsedStudent}
      </p>
      <p>
        <strong>Suggested Grade:</strong> {submission.ai_grade ?? "N/A"}
      </p>

      <h3>AI Feedback</h3>
      <pre className="pre">{submission.ai_feedback}</pre>

      <form onSubmit={saveFinal} className="form" style={{ marginTop: "1rem" }}>
        <label>
          <h3>Final Grade</h3>
          <input
            value={finalGrade}
            onChange={(e) => setFinalGrade(e.target.value)}
            placeholder="e.g., 88"
          />
        </label>

        <div
          className="button-row"
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "12px",
          }}
        >
          <button
            className="btn"
            type="button"
            style={{ flex: 1 }}
            onClick={downloadFeedback}
          >
            Download Feedback
          </button>

          <button className="btn" type="submit" style={{ flex: 1 }}>
            Save Final Grade
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{ flex: 1 }}
            className="btn"
          >
            Back to Submissions
          </button>
        </div>
      </form>
    </div>
  );
}
