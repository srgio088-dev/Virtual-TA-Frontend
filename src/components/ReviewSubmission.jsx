import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiGet, apiPostJSON } from "../api/client";

export default function ReviewSubmission() {
  const { id } = useParams();           // submission id
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
      // stay on page after save – you can change this if you want to redirect
      // navigate("/assignments");
    } catch (e) {
      setError("Save failed: " + e.message);
    }
  }

  function downloadFeedback() {
    if (!submission) return;

    const assignmentName =
      submission.assignment_name ||
      (submission.assignment && submission.assignment.name) ||
      submission.student_name || // fallback: file/submission label
      "Assignment";

    const studentName = submission.student_name || "Student";
    const suggested = submission.ai_grade ?? "N/A";
    const final = finalGrade || submission.final_grade || "N/A";
    const feedback = submission.ai_feedback || "";

    const lines = [
      `Assignment: ${assignmentName}`,
      `Student: ${studentName}`,
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

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const safeName = assignmentName
      .replace(/[^a-z0-9_-]+/gi, "_")
      .toLowerCase();

    a.href = url;
    a.download = `${safeName}_submission_${submission.id}_feedback.txt`;
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

  // ✅ show assignment name OR fall back to the submission/file label
  // Split the combined label (e.g., "DiscussionPost1 GeorgeV")
const { assignment, student } = splitLabel(submission.student_name);

const assignmentDisplay =
  submission.assignment_name ||
  (submission.assignment && submission.assignment.name) ||
  assignment ||
  "—";

const studentDisplay =
  submission.student_name ? student : submission.student_name || "—";

  return (
    <div className="container">
      <h1>Review Submission</h1>

      <p>
        <strong>Assignment:</strong> {assignmentDisplay}
      </p>
      <p>
        <strong>Student:</strong> {studentDisplay}
      </p>
      <p>
        <strong>Suggested Grade:</strong> {submission.ai_grade ?? "N/A"}
      </p>

      <h3>AI Feedback</h3>
      <pre className="pre">{submission.ai_feedback}</pre>

      <button className="btn" type="button" onClick={downloadFeedback}>
        Download Feedback
      </button>

      <form onSubmit={saveFinal} className="form" style={{ marginTop: "1rem" }}>
        <label>
          Final Grade
          <input
            value={finalGrade}
            onChange={(e) => setFinalGrade(e.target.value)}
            placeholder="e.g., 88"
          />
        </label>
        <button type="submit" className="btn">
          Save Final Grade
        </button>
      </form>

      {/* ✅ Back button under Save Final Grade */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="btn"
        style={{
          marginTop: "0.75rem",
          backgroundColor: "#ffffff",
          color: "#000000",
          border: "2px solid #facc15",
        }}
      >
        Back to Submissions
      </button>
    </div>
  );
}
