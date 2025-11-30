import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiGet, apiPostJSON } from "../api/client";

export default function AssignmentList() {
  const [assignments, setAssignments] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState(null);

  // 🔐 PIN generation modal state
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pinForm, setPinForm] = useState({
    classId: "",
    studentName: "",
    assignmentId: null,
  });
  const [pinLoading, setPinLoading] = useState(false);
  const [pinError, setPinError] = useState("");
  const [pinResult, setPinResult] = useState("");

  async function load() {
    try {
      const data = await apiGet("/api/assignments");
      setAssignments(data);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onDelete(id) {
    if (!confirm("Delete this assignment?")) return;
    await fetch(
      `${
        import.meta.env.VITE_API_URL || "http://127.0.0.1:5000"
      }/api/assignments/${id}`,
      { method: "DELETE" }
    );
    await load();
  }

  const openPinModal = (assignment) => {
    setPinForm({
      classId: "",
      studentName: "",
      assignmentId: assignment.id,
    });
    setPinResult("");
    setPinError("");
    setPinModalOpen(true);
  };

  const closePinModal = () => {
    setPinModalOpen(false);
  };

  const handleGeneratePin = async (e) => {
    e.preventDefault();
    setPinError("");
    setPinResult("");

    if (!pinForm.classId.trim() || !pinForm.studentName.trim()) {
      setPinError("Class ID and Student Name are required.");
      return;
    }

    try {
      setPinLoading(true);
      const body = {
        class_id: Number(pinForm.classId),
        assignment_id: pinForm.assignmentId,
        student_id: pinForm.studentName.trim(),
      };
      const res = await apiPostJSON("/api/pins", body);
      // backend returns { pin: "100124" }
      setPinResult(res.pin || "");
    } catch (err) {
      setPinError(err?.message || "Failed to generate PIN.");
    } finally {
      setPinLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Assignments</h1>
      {error && <p className="error">{error}</p>}
      {!assignments.length ? (
        <p>No assignments yet.</p>
      ) : (
        <ul className="list">
          {assignments.map((a) => (
            <li
              key={a.id}
              className={`assignment-card ${
                selectedId === a.id ? "selected" : ""
              }`}
              onClick={() =>
                setSelectedId(selectedId === a.id ? null : a.id)
              }
            >
              <div className="assignment-main">
                <strong>{a.name}</strong>{" "}
                <span className="muted">
                  (
                  {a.submission_count ??
                    (a.submissions?.length || 0)}{" "}
                  submissions)
                </span>

                <p className="muted">
                  {a.rubric_id
                    ? `Rubric #${a.rubric_id}`
                    : `Rubric: ${a.rubric?.slice(0, 100)}${
                        a.rubric?.length > 100 ? "…" : ""
                      }`}
                </p>

                {/* Due Date Display */}
                <p className="muted">
                  {a.due_date ? `Due: ${a.due_date}` : "No due date"}
                </p>
              </div>

              {/* Hidden until hover */}
              <div className="assignment-actions">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/assignment/${a.id}`);
                  }}
                >
                  View Submissions
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/edit/${a.id}`);
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(a.id);
                  }}
                >
                  Delete
                </button>

                {/* 🔐 NEW: Generate PIN button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openPinModal(a);
                  }}
                >
                  Generate PIN
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* 🔐 PIN Modal */}
      {pinModalOpen && (
        <div style={modalStyles.backdrop}>
          <div style={modalStyles.card}>
            <h2 style={modalStyles.title}>Generate PIN</h2>
            <p style={modalStyles.subtitle}>
              Assignment:{" "}
              <strong>{pinForm.assignmentId}</strong>
            </p>

            <form onSubmit={handleGeneratePin}>
              <div style={modalStyles.field}>
                <label style={modalStyles.label}>Course Number</label>
                <input
                  value={pinForm.classId}
                  onChange={(e) =>
                    setPinForm((prev) => ({
                      ...prev,
                      classId: e.target.value,
                    }))
                  }
                  placeholder="e.g. 4850"
                  style={modalStyles.input}
                />
              </div>

              <div style={modalStyles.field}>
                <label style={modalStyles.label}>Student Name</label>
                <input
                  type="text"
                  value={pinForm.studentName}
                  onChange={(e) =>
                    setPinForm((prev) => ({
                      ...prev,
                      studentName: e.target.value,
                    }))
                  }
                  placeholder="e.g. Jane Smith"
                  style={modalStyles.input}
                />
              </div>

              {pinError && (
                <p style={modalStyles.error}>{pinError}</p>
              )}

              {pinResult && (
                <div style={modalStyles.pinBox}>
                  <p style={{ margin: 0 }}>
                    Share this PIN with the student:
                  </p>
                  <div style={modalStyles.pinValue}>{pinResult}</div>
                </div>
              )}

              <div style={modalStyles.actions}>
                <button
                  type="button"
                  onClick={closePinModal}
                  style={modalStyles.secondaryButton}
                >
                  Close
                </button>
                <button
                  type="submit"
                  style={modalStyles.primaryButton}
                  disabled={pinLoading}
                >
                  {pinLoading ? "Generating..." : "Generate PIN"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const modalStyles = {
  backdrop: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  card: {
    backgroundColor: "#111",
    color: "#fff",
    padding: "24px 28px",
    borderRadius: "10px",
    width: "100%",
    maxWidth: "420px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.6)",
    border: "1px solid #333",
    fontFamily: "Arial, sans-serif",
  },
  title: {
    fontSize: "1.4rem",
    marginBottom: "4px",
    color: "#FFD700",
  },
  subtitle: {
    fontSize: "0.9rem",
    marginBottom: "16px",
    color: "#ddd",
  },
  field: {
    marginBottom: "12px",
  },
  label: {
    display: "block",
    marginBottom: "4px",
    fontSize: "0.9rem",
  },
  input: {
    width: "100%",
    padding: "8px 10px",
    borderRadius: "6px",
    border: "1px solid #444",
    backgroundColor: "#000",
    color: "#fff",
  },
  error: {
    color: "#ff6b6b",
    fontSize: "0.9rem",
    marginTop: "4px",
  },
  pinBox: {
    marginTop: "12px",
    marginBottom: "12px",
    padding: "10px 12px",
    borderRadius: "6px",
    border: "1px solid #FFD700",
    backgroundColor: "#222",
  },
  pinValue: {
    marginTop: "6px",
    fontSize: "1.4rem",
    fontWeight: "bold",
    letterSpacing: "2px",
    color: "#FFD700",
  },
  actions: {
    marginTop: "16px",
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
  },
  primaryButton: {
    padding: "8px 14px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#FFD700",
    color: "#000",
    fontWeight: 600,
    cursor: "pointer",
  },
  secondaryButton: {
    padding: "8px 14px",
    borderRadius: "6px",
    border: "1px solid #666",
    backgroundColor: "transparent",
    color: "#fff",
    cursor: "pointer",
  },
};
