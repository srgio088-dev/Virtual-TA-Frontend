import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ReviewSubmission({ submission }) {
  const navigate = useNavigate();
  const [finalGrade, setFinalGrade] = useState("");

  // Parse Assignment + Student from filename
  const parseNamesFromFile = (filename) => {
    try {
      if (!filename || !filename.includes("_")) {
        return { assignment: "N/A", student: "N/A" };
      }

      const noExtension = filename.split(".")[0];
      const [assignment, student] = noExtension.split("_");

      if (!assignment || !student) {
        return { assignment: "N/A", student: "N/A" };
      }

      return { assignment, student };
    } catch (error) {
      return { assignment: "N/A", student: "N/A" };
    }
  };

  const { assignment: assignmentDisplay, student: studentDisplay } =
    parseNamesFromFile(submission?.file_name);

  const saveFinal = (e) => {
    e.preventDefault();
    console.log("Final grade saved:", finalGrade);
  };

  const downloadFeedback = () => {
    console.log("Downloading feedback...");
  };

  return (
    <div className="outer-container">
      <img
        className="side-img left"
        src="/images/Linn_Cove.webp"
        alt="Left decoration"
      />

      <div className="container">
        <h1>Review Submission</h1>

        <p>
          <strong>Assignment:</strong> {assignmentDisplay}
        </p>

        <p>
          <strong>Student:</strong> {studentDisplay}
        </p>

        <p>
          <strong>Suggested Grade:</strong> {submission?.ai_grade ?? "N/A"}
        </p>

        <h3>AI Feedback</h3>
        <pre className="pre">{submission?.ai_feedback}</pre>

        <form onSubmit={saveFinal} className="form">
          <label>
            <h3>Final Grade</h3>
            <input
              value={finalGrade}
              onChange={(e) => setFinalGrade(e.target.value)}
              placeholder="e.g., 88"
            />
          </label>

          <div className="button-row">
            <button
              className="btn"
              type="button"
              onClick={downloadFeedback}
            >
              Download Feedback
            </button>

            <button className="btn" type="submit">
              Save Final Grade
            </button>

            <button
              className="btn"
              type="button"
              onClick={() => navigate(-1)}
            >
              Back to Submissions
            </button>
          </div>
        </form>
      </div>

      <img
        className="side-img right"
        src="/images/Linn_Cove.webp"
        alt="Right decoration"
      />
    </div>
  );
}
