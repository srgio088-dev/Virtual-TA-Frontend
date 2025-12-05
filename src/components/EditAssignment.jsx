import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiGet } from "../api/client";

export default function EditAssignment() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [rubric, setRubric] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("EditAssignment mount, id=", id);
    if (!id) {
      setError("No assignment ID in URL. Check your route (should be /edit/:id).");
      setLoading(false);
      return;
    }

    async function load() {
      try {
        setLoading(true);
        let data;
        if (typeof apiGet === "function") {
          data = await apiGet(`/api/assignments/${id}`);
        } else {
          const res = await fetch(
            `${import.meta.env.VITE_API_URL || "http://127.0.0.1:5000"}/api/assignments/${id}`
          );
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          data = await res.json();
        }
        console.log("Loaded assignment data:", data);
        setName(data.name || "");
        setRubric(data.rubric || "");
        if (data.due_date) {
          const dt = new Date(data.due_date);
          const iso = dt.toISOString().slice(0, 16);
          setDueDate(iso);
        } else {
          setDueDate("");
        }
      } catch (err) {
        console.error("Failed to load assignment:", err);
        setError("Failed to load assignment: " + (err.message || String(err)));
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !rubric.trim()) {
      setError("Both name and rubric are required.");
      return;
    }

    try {
      setBusy(true);
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || "http://127.0.0.1:5000"}/api/assignments/${id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            rubric: rubric.trim(),
            due_date: dueDate || null,
          }),
        }
      );
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Update failed (${res.status}): ${txt}`);
      }
      navigate("/assignments");
    } catch (err) {
      console.error("Update error:", err);
      setError("Update failed: " + (err.message || String(err)));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <h2 style={{ padding: 40 }}>Loading…</h2>;

  return (
    <div
      style={{
        width: "95%",
        margin: "40px auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "50px",
      }}
    >
      <form
        onSubmit={onSubmit}
        style={{
          width: "100%",
          border: "2px solid #ccc",
          borderRadius: "12px",
          padding: "12px 16px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          alignItems: "flex-start",
          backgroundColor: "#fff",
          boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "1.5rem",
            fontWeight: "bold",
          }}
        >
          Edit Assignment
        </h2>
        <div style={{ width: "100%" }}>
          <label
            style={{
              fontWeight: "bold",
              display: "block",
              marginBottom: "8px",
              fontSize: "1.1rem",
            }}
          >
            Assignment Name
          </label>
          <input
            placeholder="e.g., Essay 1"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: "100%",
              padding: "16px",
              fontSize: "1.1rem",
              borderRadius: "10px",
              border: "1px solid #ccc",
            }}
          />
        </div>
        <div style={{ width: "100%" }}>
  <label
    style={{
      fontWeight: "bold",
      display: "block",
      marginBottom: "8px",
      fontSize: "1.1rem",
    }}
  >
    Due Date
  </label>
  <input
    type="datetime-local"
    value={dueDate}
    onChange={(e) => setDueDate(e.target.value)}
    style={{
      width: "100%",
      padding: "16px",
      fontSize: "1.1rem",
      borderRadius: "10px",
      border: "1px solid #ccc",
    }}
  />
</div>
      </form>

      <div
        style={{
          width: "100%",
          border: "2px solid #ccc",
          borderRadius: "12px",
          padding: "12px 16px", 
          backgroundColor: "#fff",
          boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
        }}
      >
        <h2
          style={{
            margin: "10 10 20px 0",
            fontSize: "1.5rem",
            fontWeight: "bold",
          }}
        >
          Edit Rubric
        </h2>
        <textarea
          rows={16}
          placeholder="e.g., Intro (20), Evidence (40), Clarity (40)"
          value={rubric}
          onChange={(e) => setRubric(e.target.value)}
          style={{
            width: "100%",
            padding: "16px",
            fontSize: "1.1rem",
            borderRadius: "10px",
            border: "1px solid #ccc",
            resize: "vertical",
            minHeight: "300px",
          }}
        />
      </div>

      {error && (
        <p style={{ color: "red", fontWeight: 500, fontSize: "1rem" }}>
          {error}
        </p>
      )}
      <button
        onClick={onSubmit}
        disabled={busy}
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
        {busy ? "Updating…" : "Update"}
      </button>

      <div style={{ width: "100%", maxWidth: 900, marginTop: 20 }}>
        <small style={{ color: "#666" }}>Debug: URL id = {String(id)}</small>
      </div>
    </div>
  );
}
