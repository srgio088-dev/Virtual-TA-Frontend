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
    <form className="card form" onSubmit={submit}>
      <h2>Upload Student Submissions (Multi-file)</h2>

      <label>Assignment</label>
      <select value={assignmentId} onChange={(e)=>setAssignmentId(e.target.value)}>
        <option value="">Select…</option>
        {assignments.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
      </select>

      <label>Files</label>
      <div className="dropzone" onDrop={onDrop} onDragOver={onDragOver}>
        <p>Drag & drop files here, or click to select</p>
        <input type="file" multiple onChange={onPick} />
      </div>

      {files.length > 0 && (
        <ul className="list" style={{ marginTop: 8 }}>
          {files.map(f => <li key={f.name}>{f.name}</li>)}
        </ul>
      )}

      <button style={{ marginTop: 10 }} type="submit">Upload</button>
      {status && <p style={{ marginTop: 8 }}>{status}</p>}
    </form>
  );
}
