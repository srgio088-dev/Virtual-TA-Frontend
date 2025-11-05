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

  function onDragOver(e) {
    e.preventDefault();
  }

  async function submit(e) {
    e.preventDefault();
    if (!assignmentId || files.length === 0) {
      setStatus("Pick an assignment and at least one file.");
      return;
    }
    const fd = new FormData();
    fd.append("assignment_id", assignmentId);
    for (const f of files) fd.append("files", f);

    try {
      const res = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://127.0.0.1:5000"
        }/api/upload_submissions`,
        { method: "POST", body: fd }
      );
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
        width: "95%",
        margin: "40px auto",
        border: "2px solid #ccc",
        borderRadius: "12px",
        padding: "20px 30px",
        backgroundColor: "#fff",
        boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
        fontSize: "1.1rem",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      <h2
        style={{
          margin: 0,
          fontSize: "1.5rem",
          fontWeight: "bold",
        }}
      >
        Upload Student Submissions (Multi-file)
      </h2>

      <div>
        <label
          style={{
            fontWeight: "bold",
            display: "block",
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
            width: "100%",
            padding: "16px",
            borderRadius: "10px",
            border: "1px solid #ccc",
            fontSize: "1.1rem",
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

      <div>
        <label
          style={{
            fontWeight: "bold",
            display: "block",
            marginBottom: "8px",
            fontSize: "1.1rem",
          }}
        >
          Files
        </label>
        <div
          className="dropzone"
          onDrop={onDrop}
          onDragOver={onDragOver}
          style={{
            border: "2px dashed #ccc",
            borderRadius: "10px",
            padding: "40px",
            textAlign: "center",
            backgroundColor: "#fafafa",
            fontSize: "1.1rem",
            cursor: "pointer",
          }}
        >
          <p>Drag & drop files here, or click to select</p>
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
      </div>

      {files.length > 0 && (
        <ul className="list" style={{ marginTop: 8 }}>
          {files.map((f) => (
            <li key={f.name} style={{ fontSize: "1.1rem" }}>
              {f.name}
            </li>
          ))}
        </ul>
      )}

      <button
        style={{
          backgroundColor: "#1a73e8",
          color: "#fff",
          fontWeight: "bold",
          fontSize: "1.3rem",
          padding: "14px 90px",
          borderRadius: "12px",
          border: "none",
          cursor: "pointer",
          transition: "background 0.2s ease",
          alignSelf: "center",
          marginTop: "10px",
        }}
        onMouseOver={(e) => (e.target.style.backgroundColor = "#155fc1")}
        onMouseOut={(e) => (e.target.style.backgroundColor = "#1a73e8")}
        type="submit"
      >
        Upload
      </button>

      {status && (
        <p style={{ marginTop: 8, fontSize: "1.1rem", fontWeight: "500" }}>
          {status}
        </p>
      )}
    </form>
  );
}
