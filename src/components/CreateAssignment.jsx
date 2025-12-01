import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPostJSON } from "../api/client";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function CreateAssignment() {
  const navigate = useNavigate();

  const [baseName, setBaseName] = useState("");
  const [rubricText, setRubricText] = useState("");
  const [rubricFile, setRubricFile] = useState(null);
  const [dueDate, setDueDate] = useState(""); // NEW 11/19
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

    // Require either text rubric OR file
    if (!rubricText.trim() && !rubricFile) {
      setError("Please either paste a rubric OR upload a rubric template file.");
      return;
    }

    const n = Math.max(1, Number(assignmentCount) || 1);
    setIsSubmitting(true);

    try {
      for (let i = 1; i <= n; i++) {
        const name = n === 1 ? trimmedBaseName : `${trimmedBaseName} ${i}`;

        // If a file is provided, use multipart/form-data so backend can use PdfReader
        if (rubricFile) {
          const formData = new FormData();
          formData.append("name", name);
          formData.append("rubric", rubricText); // optional extra text
          formData.append("rubric_file", rubricFile);
          formData.append("due_date", dueDate || "");

          const res = await fetch(`${API_BASE}/api/assignments`, {
            method: "POST",
            body: formData,
          });

          if (!res.ok) {
            const msg = await res.text();
            throw new Error(msg || "Failed to create assignment with rubric file.");
          }
        } else {
          // Original JSON behavior (no file, just text rubric)
          await apiPostJSON("/api/assignments", {
            name,
            rubric: rubricText,
            due_date: dueDate || null, // NEW 11/19
          });
        }
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
          Assignment Name
          <input
            type="text"
            value={baseName}
            onChange={(e) => setBaseName(e.target.value)}
            placeholder='e.g. "Essay 1" or base name "Quiz"'
          />
        </label>

        <label>
          Number of assignments (for bulk creation)
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
          Due Date
          <input
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          <small>
            All created assignments will share this due date. Currently you will
            need to individually update the assignments to their correct due
            date.
          </small>
        </label>

        <label>
          Text Rubric
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
          <input
            type="file"
            accept=".txt,.md,.pdf,.doc,.docx"
            onChange={handleFileChange}
          />
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
          onMouseOut={(e) => (e.target.style.backgroundColor = "#FFD700")}
        >
          {isSubmitting ? "Creating…" : "Create Assignment"}
        </button>
      </form>
    </div>
  );
}
