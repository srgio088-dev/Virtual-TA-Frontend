import React, { useEffect, useState } from "react";
import { apiGet, apiPostForm } from "../api/client";

export default function UploadForm() {
  const [assignments, setAssignments] = useState([]);
  const [assignmentId, setAssignmentId] = useState("");
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    apiGet("/api/assignments").then(setAssignments);
  }, []);

  function onPick(e) {
    setFiles(Array.from(e.target.files || []));
  }

  function onDrop(e) {
    e.preventDefault();
    setFiles(Array.from(e.dataTransfer.files || []));
  }

  function onDragOver(e) { e.preventDefault(); }

  async function submit(e) {
    e.preventDefault();
    if (!assignmentId || files.length === 0) {
      setStatus("Pick an assignment and at least one file.");
      return;
    }
    const fd = new FormData();
    fd.append("assignment_id", assignmentId);
    for (const f of files) fd.append("files", f); // -> backend getlist("files")
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://127.0.0.1:5000"}/api/upload_submissions`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setStatus(`✅ Uploaded ${data.created_ids.length} file(s).`);
      setFiles([]);
    } catch (err) {
      setStatus(`❌ ${err.message}`);
    }
  }

  return (
  <form
    className="card form"
    onSubmit={submit}
    style={{
      maxWidth: "700px",
      margin: "50px auto",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "30px",
      padding: "40px",
      borderRadius: "12px",
      backgroundColor: "#fff",
      boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
    }}
  >
    {/* ===== Top Section ===== */}
    <div
      style={{
        width: "100%",
        textAlign: "center",
        marginBottom: "10px",
      }}
    >
      <h2 style={{ fontSize: "1.8rem", marginBottom: "20px" }}>
        Upload Student Submissions (Multi-file)
      </h2>

      <label
        style={{
          display: "block",
          fontWeight: "bold",
          marginBottom: "8px",
          fontSize: "1.1rem",
        }}
      >
        Assignment
      </label>

      <select
        value={assignmentId}
        onChange={(e) => setAssignmentId(e.target.value)}
        style={{
          width: "60%",
          padding: "10px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          fontSize: "1rem",
        }}
      >
        <option value="">Select…</option>
        {assignments.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
      </select>
    </div>

    {/* ===== File Upload Section ===== */}
    <div
      style={{
        width: "100%",
        border: "2px dashed #bbb",
        borderRadius: "12px",
        padding: "40px",
        textAlign: "center",
        backgroundColor: "#fafafa",
      }}
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      <p style={{ fontSize: "1.1rem", color: "#555" }}>
        Drag & drop files here, or click to select
      </p>
      <input
        type="file"
        multiple
        onChange={onPick}
        style={{
          marginTop: "12px",
          fontSize: "1rem",
        }}
      />
    </div>

    {/* ===== File List ===== */}
    {files.length > 0 && (
      <ul
        style={{
          listStyleType: "none",
          padding: 0,
          width: "100%",
          textAlign: "left",
          color: "#333",
        }}
      >
        {files.map((f) => (
          <li key={f.name}>📄 {f.name}</li>
        ))}
      </ul>
    )}

    {/* ===== Upload Button ===== */}
    <button
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
      type="submit"
    >
      Upload
    </button>
<p
  style={{
    marginTop: "10px",
    fontSize: "0.8rem",   // Smaller text size
    color: "#000000",
    textAlign: "center",
    lineHeight: "1.4",
  }}
>
  <strong>Suggedted file name format:</strong> AssignmentName_StudentFirstAndLast or AssignmentName_LastNameFirstInitial </p>
    
    {/* <strong>Suggedted file name format:</strong><br />
  AssignmentName_StudentFirstAndLast <br />
  or AssignmentName_LastNameFirstInitial
</p> */}
    
    {/* ===== Status Message ===== */}
    {status && (
      <p style={{ marginTop: "10px", color: "#333", fontWeight: "500" }}>
        {status}
      </p>
    )}
  </form>
);
}
