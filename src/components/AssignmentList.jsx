import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiGet } from "../api/client";

// Fallback API base if you need to call fetch directly (for DELETE)
const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export default function AssignmentList() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function loadAssignments() {
      try {
        setLoading(true);
        const data = await apiGet("/api/assignments");
        setAssignments(data || []);
      } catch (err) {
        console.error("Failed to load assignments", err);
        setError(err?.message || "Failed to load assignments");
      } finally {
        setLoading(false);
      }
    }
    loadAssignments();
  }, []);

  const handleDelete = async (id) => {
    const ok = window.confirm("Are you sure you want to delete this assignment?");
    if (!ok) return;

    try {
      const res = await fetch(`${API_BASE}/api/assignments/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Delete failed:", text);
        throw new Error("Failed to delete assignment");
      }

      setAssignments((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error(err);
      setError(err?.message || "Failed to delete assignment");
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Assignments</h1>
        <button
          onClick={() => navigate("/create-assignment")}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded shadow"
        >
          + New Assignment
        </button>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <p>Loading assignments...</p>
      ) : assignments.length === 0 ? (
        <p className="text-gray-600">
          No assignments yet. Click <span className="font-semibold">“New Assignment”</span> to create one.
        </p>
      ) : (
        <div className="space-y-4">
          {assignments.map((a) => (
            <div
              key={a.id}
              className="bg-white shadow rounded p-4 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{a.name}</h2>
                  {a.due_date && (
                    <p className="text-xs text-gray-500">
                      Due: {new Date(a.due_date).toLocaleString()}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Submissions: {a.submission_count ?? (a.submissions ? a.submissions.length : 0)}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-3 flex flex-wrap gap-2">
                {/* Open Review (adjust route if your review path is different) */}
                <button
                  onClick={() => navigate(`/assignments/${a.id}`)}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded shadow"
                >
                  Open Review
                </button>

                {/* 🔹 Generate PIN – styled the same as other primary buttons */}
                <button
                  onClick={() => navigate(`/pin-setup/${a.id}`)}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded shadow"
                >
                  Generate PIN
                </button>

                {/* Edit button */}
                <button
                  onClick={() => navigate(`/edit/${a.id}`)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded shadow"
                >
                  Edit
                </button>

                {/* Delete button */}
                <button
                  onClick={() => handleDelete(a.id)}
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded shadow"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
