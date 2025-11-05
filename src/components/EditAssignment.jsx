import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiGet, apiPostJSON } from "../api/client";

export default function EditAssignment() {
  const { id } = useParams(); // assignment ID from URL
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [rubric, setRubric] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load assignment to edit
  useEffect(() => {
    async function load() {
      try {
        const data = await apiGet(`/api/assignments/${id}`);
        setName(data.name || "");
        setRubric(data.rubric || "");
      } catch (err) {
        setError("Failed to load assignment.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  // Submit updated assignment
  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !rubric.trim()) {
      setError("Both name and rubric are required.");
      return;
    }

    try {
      setBusy(true);

      await fetch(
        `${import.meta.env.VITE_API_URL || "http://127.0.0.1:5000"}/api/assignments/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            rubric: rubric.trim(),
          }),
        }
      );

      navigate("/");
    } catch (err) {
      setError("Failed to update assignment.");
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
      {/* ===== Row 1: Edit Assignment Box ===== */}
      <form
        onSubmit={onSubmit}
        style={{
          width: "100%",
          border: "2px solid #ccc",
          borderRadius: "12px",
          padding: "40px 60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "50px",
          backgroundColor: "#fff",
          boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
        }}
      >
        <h2
          style={{
            margin: 0,
            whiteSpace: "nowrap",
            fontSize: "2rem",
            fontWeight: "bold",
          }}
        >
          Edit Assignment
        </h2>

        <div style={{ flexGrow: 1 }}>
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
      </form>

      {/* ===== Row 2: Rubric Box ===== */}
      <div
        style={{
          width: "100%",
          border: "2px solid #ccc",
          borderRadius: "12px",
          padding: "40px 60px",
          backgroundColor: "#fff",
          boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
        }}
      >
        <h2
          style={{
            margin: "0 0 20px 0",
            fontSize: "2rem",
            fontWeight: "bold",
          }}
        >
          Rubric
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

      {/* ===== Error Message ===== */}
      {error && (
        <p style={{ color: "red", fontWeight: "500", fontSize: "1rem" }}>
          {error}
        </p>
      )}

      {/* ===== Update Button ===== */}
      <button
        onClick={onSubmit}
        disabled={busy}
        style={{
          backgroundColor: "#1a73e8",
          color: "#fff",
          fontWeight: "bold",
          fontSize: "1.3rem",
          padding: "20px 140px",
          borderRadius: "12px",
          border: "none",
          cursor: "pointer",
          transition: "background 0.2s ease",
        }}
        onMouseOver={(e) => (e.target.style.backgroundColor = "#155fc1")}
        onMouseOut={(e) => (e.target.style.backgroundColor = "#1a73e8")}
      >
        {busy ? "Updating…" : "Update"}
      </button>
    </div>
  );
}
