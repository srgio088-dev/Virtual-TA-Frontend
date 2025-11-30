import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiGet, apiPostJSON } from "../api/client";

export default function PinSetup() {
  const { id } = useParams(); // assignment id from URL
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);

  const [classId, setClassId] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    async function loadAssignment() {
      try {
        setLoading(true);
        const data = await apiGet(`/api/assignments/${id}`);
        setAssignment(data);
      } catch (err) {
        console.error("Failed to load assignment", err);
        setError(err?.message || "Failed to load assignment");
      } finally {
        setLoading(false);
      }
    }
    loadAssignment();
  }, [id]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setPin("");

    // Enforce 4-digit numeric class ID
    if (!/^\d{4}$/.test(classId)) {
      setError("Class ID must be exactly 4 digits (e.g., 3880).");
      return;
    }

    try {
      setBusy(true);
      const res = await apiPostJSON("/api/pins", {
        class_id: classId,         // e.g., "3880"
        assignment_id: Number(id), // int
        // student_id is optional; backend defaults to 0
      });

      console.log("PIN response:", res);

      if (res && res.pin) {
        setPin(res.pin);
      } else {
        setError("Server did not return a PIN.");
      }
    } catch (err) {
      console.error("Failed to generate PIN", err);
      setError(err?.message || "Failed to generate PIN");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-8">
      <div className="bg-white shadow rounded p-6">
        {/* Assignment name at the top */}
        <h1 className="text-2xl font-bold mb-2">
          {loading
            ? "Loading assignment..."
            : assignment
            ? assignment.name
            : "Assignment not found"}
        </h1>

        <p className="text-sm text-gray-600 mb-4">
          Generate a class PIN students will use when submitting this assignment.
        </p>

        {error && (
          <div className="mb-4 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">
              Class ID (4 digits)
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="\\d{4}"            // HTML pattern: 4 digits
              maxLength={4}
              value={classId}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 4);
                setClassId(value);
              }}
              className="w-full border rounded px-3 py-2"
              placeholder="e.g. 3880"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Use the numeric part of the course (e.g., CIS3880 → 3880).
            </p>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded"
          >
            {busy ? "Generating..." : "Generate PIN"}
          </button>
        </form>

        {pin && (
          <div className="mt-6 p-4 border rounded bg-green-50 border-green-200">
            <p className="text-sm font-medium mb-1">Generated PIN</p>
            <p className="text-2xl font-mono">{pin}</p>
          </div>
        )}
      </div>
    </div>
  );
}
