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

  /**
   * Resolve assignment & student display using:
   * - student_name from backend when available
   * - assignment name parsed from file_path, which looks like:
   *   "uploads/Discussion_Post_1_Social_Engineering_-_Jed_Cooper.docx"
   *   so we:
   *     1) take the file name part
   *     2) strip extension
   *     3) split on "_-_"
   *     4) left side -> assignment name (underscores => spaces)
   *        right side -> student name (underscores => spaces) if needed
   */
  function resolveNames(sub) {
    if (!sub) {
      return { assignmentDisplay: "N/A", studentDisplay: "N/A" };
    }

    // Start with backend student_name
    let studentDisplay = sub.student_name || "";

    // We will parse assignment name from file_path
    let assignmentDisplay = "";

    const rawPath = sub.file_path || "";
    if (rawPath) {
      // Get just the filename: "Discussion_Post_1_Social_Engineering_-_Jed_Cooper.docx"
      const filename = rawPath.split(/[\\/]/).pop();
      if (filename) {
        // Strip extension
        const withoutExt = filename.replace(/\.[^/.]+$/, "");
        // The separator between assignment and student parts is "_-_"
        const sep = "_-_";
        const idx = withoutExt.lastIndexOf(sep);

        if (idx !== -1) {
          const assignmentRaw = withoutExt.slice(0, idx);
          const studentFromFileRaw = withoutExt.slice(idx + sep.length);

          // Convert underscores to spaces
          const normalize = (s) =>
            (s || "").replace(/_/g, " ").trim();

          assignmentDisplay = normalize(assignmentRaw);

          // If backend did not already supply student_name, fall back to parsed
          if (!studentDisplay) {
            studentDisplay = normalize(studentFromFileRaw);
          }
        }
      }
    }

    // If assignment name still missing, fall back to "Assignment #<id>"
    if (!assignmentDisplay) {
      if (sub.assignment_name) {
        assignmentDisplay = sub.assignment_name;
      } else if (sub.assignment && sub.assignment.name) {
        assignmentDisplay = sub.assignment.name;
      } else if (sub.assignment_id) {
        assignmentDisplay = `Assignment #${sub.assignment_id}`;
      } else {
        assignmentDisplay = "N/A";
      }
    }

    // If student name still missing, give a safe default
    if (!studentDisplay) {
      studentDisplay = "N/A";
    }

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
