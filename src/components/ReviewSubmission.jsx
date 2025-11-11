import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiGet, apiPostJSON } from "../api/client";

export default function ReviewSubmission() {
  const { id } = useParams(); // here 'id' is typically a submission id OR assignment id depending on your backend design
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [finalGrade, setFinalGrade] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        // If your backend is assignment-centric, you might fetch a list of submissions for this assignment instead.
        const data = await apiGet(`/api/submissions/${id}`);
        setSubmission(data);
        setFinalGrade(data.final_grade ?? "");
      } catch (e) {
        setError(e.message);
      }
    })();
  }, [id]);

  async function saveFinal(e) {
    e.preventDefault();
    try {
      await apiPostJSON(`/api/submissions/${id}/finalize`, { final_grade: finalGrade });
      navigate("/assignments");
    } catch (e) {
      setError("Save failed: " + e.message);
    }
  }

  if (error) return <div className="container"><p className="error">{error}</p></div>;
  if (!submission) return <div className="container"><p>Loading…</p></div>;

  return (
    <div className="container">
      <h1>Review Submission</h1>
      <p><strong>Assignment:</strong> {submission.student_name}</p>
      <p><strong>Suggested Grade:</strong> {submission.ai_grade ?? "N/A"}</p>
      <h3>AI Feedback</h3>
      <pre className="pre">{submission.ai_feedback}</pre>

      <form onSubmit={saveFinal} className="form">
        <label>
          Final Grade
          <input value={finalGrade} onChange={(e) => setFinalGrade(e.target.value)} placeholder="e.g., 88" />
        </label>
        <button type="submit">Save Final Grade</button>
      </form>
    </div>
  );
}
