import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

export default function AssignmentSubmissions() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/assignments/${id}`)
      .then(res => setAssignment(res.data))
      .catch(err => console.error(err));

    axios.get(`${import.meta.env.VITE_API_URL}/submissions/by-assignment/${id}`)
      .then(res => setSubmissions(res.data))
      .catch(err => console.error(err));
  }, [id]);

  const deleteSubmission = async (submissionId) => {
    if (!window.confirm("Are you sure you want to delete this submission?")) return;

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/submissions/${submissionId}`);
      setSubmissions(prev => prev.filter(s => s.id !== submissionId));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  if (!assignment) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center p-6">
      {/* OUTER CARD — this is the ONLY CARD */}
      <div className="w-full max-w-6xl bg-white p-10 rounded-2xl shadow-lg">

        {/* Page Title */}
        <h1 className="text-4xl font-bold text-center mb-8">
          {assignment.name}
        </h1>

        {/* Top Buttons (unchanged layout) */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            className="btn"
            onClick={() => navigate(`/rubric/${assignment.id}`)}
            style={{
              backgroundColor: "#facc15",
              border: "2px solid #000",
            }}
          >
            View Rubric
          </button>

          <button
            className="btn"
            onClick={() => navigate("/assignments")}
            style={{
              backgroundColor: "#facc15",
              border: "2px solid #000",
            }}
          >
            Back to Assignment List
          </button>

          <button
            className="btn"
            style={{
              backgroundColor: "#facc15",
              border: "2px solid #000",
            }}
            onClick={() =>
              window.location.href = `${import.meta.env.VITE_API_URL}/submissions/export/${id}`
            }
          >
            Download All AI Feedback (CSV)
          </button>
        </div>

        {/* Submissions Header */}
        <h2 className="text-2xl font-bold mb-4">Submissions ({submissions.length})</h2>

        {/* Submission List */}
        <div className="space-y-6">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="flex items-center justify-between p-4 rounded-xl bg-gray-50"
              style={{ border: "1px solid #e5e7eb" }}
            >
              <div>
                <p className="font-semibold">{sub.file_name}</p>
                <p className="text-sm">AI: {sub.ai_grade}  |  Final: {sub.final_grade ?? "—"}</p>
              </div>

              <div className="flex gap-3">
                <button
                  className="btn"
                  onClick={() => navigate(`/review/${sub.id}`)}
                  style={{
                    backgroundColor: "#facc15",
                    border: "2px solid #000",
                  }}
                >
                  Open Review
                </button>

                <button
                  className="btn"
                  onClick={() => deleteSubmission(sub.id)}
                  style={{
                    backgroundColor: "#facc15",
                    border: "2px solid #000",
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
