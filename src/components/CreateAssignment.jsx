import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPostJSON } from "../api/client";

export default function CreateAssignment() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [rubricText, setRubricText] = useState("");
  const [rubricFile, setRubricFile] = useState(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setStatus("");

    if (!name.trim()) {
      setError("Assignment name is required.");
      return;
    }

    if (!rubricText.trim() && !rubricFile) {
      setError("Please provide either a text rubric OR upload a rubric file.");
      return;
    }

    try {
      // 1) Create assignment using text rubric ONLY (even if file exists)
      const created = await apiPostJSON("/api/assignments", {
        name: name.trim(),
        rubric: rubricText.trim() || null, // send null if empty
      });

      // 2) If a rubric file was uploaded, post it separately
      if (rubricFile) {
        const fd = new FormData();
        fd.append("assignment_id", created.id);
        fd.append("rubric_file", rubricFile);

        await fetch(
          `${
            import.meta.env.VITE_API_URL || "http://127.0.0.1:5000"
          }/api/assignments/upload_rubric_template`,
          {
            method: "POST",
            body: fd,
          }
        );
      }

      setStatus("Assignment created!");
      navigate("/assignments");
    } catch (err) {
      console.error(err);
      setError("Unable to create assignment. " + err.message);
    }
  }

  function onFileChange(e) {
    const file = e.target.files?.[0] || null;
    setRubricFile(file);
  }

  return (
    <div
      className="container"
      style={{
        maxWidth: "700px",
        margin: "40px auto",
        padding: "30px",
        background: "#fff",
        borderRadius: "12px",
        boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
      }}
    >
      <h1>Create Assignment</h1>

      <form className="form" onSubmit={handleSubmit}>
        {/* Assignment name */}
        <label>
          Assignment Name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            type="text"
            style={{ width: "100%", padding: "10px", marginTop: "6px" }}
          />
        </label>

        {/* Text rubric */}
        <label style={{ marginTop: "20px" }}>
          Text Rubric (optional)
          <textarea
            value={rubricText}
            onChange={(e) => setRubricText(e.target.value)}
            rows="6"
            placeholder="Paste rubric text here..."
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "6px",
              resize: "vertical",
            }}
          />
        </label>

        {/* Divider */}
        <div
          style={{
            textAlign: "center",
            margin: "20px 0",
            fontWeight: "bold",
            color: "#444",
          }}
        >
          — OR —
        </div>

        {/* Rubric file upload */}
        <label>
          Upload Rubric Template File (optional)
          <input
            type="file"
            accept=".pdf,.doc,.docx,.csv,.xlsx,.xls,.txt"
            onChange={onFileChange}
            style={{ marginTop: "6px" }}
          />
        </label>

        {rubricFile && (
          <p style={{ marginTop: "8px", color: "#333" }}>
            Selected file: <strong>{rubricFile.name}</strong>
          </p>
        )}

        {/* Error / Status */}
        {error && (
          <p style={{ marginTop: "10px", color: "red", fontWeight: "bold" }}>
            {error}
          </p>
        )}
        {status && (
          <p style={{ marginTop: "10px", color: "green", fontWeight: "bold" }}>
            {status}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          style={{
            marginTop: "30px",
            padding: "12px 30px",
            background: "#FFD700",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Create Assignment
        </button>
      </form>
    </div>
  );
}
