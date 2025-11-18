import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPostJSON } from "../api/client";

export default function CreateAssignment() {
  const navigate = useNavigate();

  const [baseName, setBaseName] = useState("");
  const [rubricText, setRubricText] = useState("");
  const [rubricFile, setRubricFile] = useState(null);
  const [assignmentCount, setAssignmentCount] = useState(1);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleFileChange(e) {
    const file = e.target.files?.[0] || null;
    setRubricFile(file);
    setSelectedFileName(file ? file.name : "");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const trimmedBaseName = baseName.trim();
    if (!trimmedBaseName) {
      setError("Assignment name is required.");
      return;
    }

    if (!rubricText.trim() && !rubricFile) {
      setError("Please either paste a rubric OR upload a rubric template file.");
      return;
    }

    // Figure out the rubric text we’re going to send
    let rubricBody = rubricText;
    if (!rubricBody.trim() && rubricFile) {
      try {
        rubricBody = await rubricFile.text();
      } catch (err) {
        console.error(err);
        setError("Could not read the uploaded rubric file.");
        return;
      }
      if (!rubricBody.trim()) {
        setError("The uploaded rubric file appears to be empty.");
        return;
      }
    }

    const n = Math.max(1, Number(assignmentCount) || 1);

    setIsSubmitting(true);
    try {
      // Create 1..n assignments, all with the same rubric
      for (let i = 1; i <= n; i++) {
        const name = n === 1 ? trimmedBaseName : `${trimmedBaseName} ${i}`;
        await apiPostJSON("/api/assignments", {
          name,
          rubric: rubricBody,
        });
      }

      navigate("/assignments");
    } catch (err) {
      console.error(err);
      setError(
        "Unable to create assignment(s). " +
          (err?.message ? String(err.message) : "")
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container">
      <h1>Create Assignment</h1>

      <form className="form" onSubmit={handleSubmit}>
        <label>
          Assignment Name / Base Name
          <input
            type="text"
            value={baseName}
            onChange={(e) => setBaseName(e.target.value)}
            placeholder='e.g. "Essay 1" or base name "Quiz"'
          />
        </label>

        <label>
          Number of assignments (for bulk create)
          <input
            type="number"
            min="1"
            value={assignmentCount}
            onChange={(e) => setAssignmentCount(e.target.value)}
          />
          <small>
            Example: Base name <strong>Quiz</strong> and number{" "}
            <strong>10</strong> will create Quiz 1 … Quiz 10 using the same
            rubric.
          </small>
        </label>

        <label>
          Text Rubric (optional)
          <textarea
            rows={8}
            value={rubricText}
            onChange={(e) => setRubricText(e.target.value)}
            placeholder="Paste rubric text here..."
          />
        </label>

        <div style={{ textAlign: "center", margin: "1rem 0" }}>— OR —</div>

        <label>
          Upload Rubric Template File (optional)
          <input type="file" accept=".txt,.md,.pdf,.doc,.docx" onChange={handleFileChange} />
        </label>

        {selectedFileName && (
          <p className="muted">Selected file: {selectedFileName}</p>
        )}

        {error && <p className="error">{error}</p>}

        <button 
          type="submit" 
          disabled={isSubmitting}
          style={{
            backgroundColor: "#FFD700",
            color: "#000000",
            fontWeight: "600",
            fontSize: "1.2rem",
            padding: "14px",
            borderRadius: "8px",
            border: "2px solid #000000",
            cursor: "pointer",
            transition: "background 0.3s ease",
            width: "100%",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#E5C100")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#E5C100")}
        >
          {isSubmitting ? "Creating…" : "Create Assignment"}
        </button>
        
      </form>
    </div>
  );
}
