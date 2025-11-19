import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet } from "../api/client";

export default function PinEntry() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const data = await apiGet(`/api/pins/${pin}`);
      navigate(`/submit/${pin}`, { state: data });
    } catch {
      setError("Invalid PIN");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Enter PIN</h1>

      <form onSubmit={onSubmit}>
        <input
          className="border w-full p-3 rounded mb-3"
          placeholder="Enter your PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
        />
        <button className="bg-blue-600 text-white p-3 rounded w-full">
          Continue
        </button>
      </form>

      {error && <p className="text-red-600 mt-3">{error}</p>}
    </div>
  );
}
