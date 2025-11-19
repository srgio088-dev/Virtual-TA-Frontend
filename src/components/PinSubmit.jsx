import React, { useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { apiPostJSON } from "../api/client";

export default function PinSubmit() {
  const { pin } = useParams();
  const { state: data } = useLocation();

  const [content, setContent] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      await apiPostJSON("/api/submissions", {
        assignment_id: data.assignment_id,
        student_id: data.student_id,
        content,
      });

      setSuccess("Submitted successfully!");
    } catch {
      setError("Submission failed.");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">
        Submitting for Assignment #{data.assignment_id}
      </h2>

      <form onSubmit={onSubmit}>
        <textarea
          className="border w-full p-3 h-48 rounded mb-3"
          placeholder="Paste your work here"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button className="bg-green-600 text-white p-3 rounded w-full">
          Submit
        </button>
      </form>

      {success && <p className="text-green-600 mt-3">{success}</p>}
      {error && <p className="text-red-600 mt-3">{error}</p>}
    </div>
  );
}
