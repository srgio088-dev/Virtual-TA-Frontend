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
        console.log("🔍 /api/submissions/:id response:", data);
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

  /*
    EXAMPLE FILENAME: DiscussionPost1_JohnSmith.docx

    LEFT  of "_" = assignment
    RIGHT of "_" = student

    If ANYTHING fails -> N/A
  */
  
  function resolveNames(sub) {
    try {
      if (!sub || !sub.file_path) {
        return { assignmentDisplay: "N/A", studentDisplay: "N/A" };
      }

  // Get just the filename
      const filename = sub.file_path.split(/[\\/]/).pop();

      // Remove the extension
      const withoutExt = filename.replace(/\.[^/.]+$/, "");

      // Find underscore
      const underscoreIndex = withoutExt.indexOf("_");

      if (underscoreIndex === -1) {
        return { assignmentDisplay: "N/A", studentDisplay: "N/A" };
      }

      const assignmentRaw = withoutExt.slice(0, underscoreIndex);
      const studentRaw = withoutExt.slice(underscoreIndex + 1);

      if (!assignmentRaw || !studentRaw) {
        return { assignmentDisplay: "N/A", studentDisplay: "N/A" };
      }

      return {
        assignmentDisplay: assignmentRaw,
        studentDisplay: studentRaw,
      };
    } catch (err) {
      console.error("Name parsing failed:", err);
      return { assignmentDisplay: "N/A", studentDisplay: "N/A" };
    }
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
