import { useState } from "react";
import axios from "axios";

export default function CrimeForm({ onSuccess }) {
  const [data, setData] = useState({
    title: "",
    description: "",
    location: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation
    if (!data.title.trim() || !data.description.trim() || !data.location.trim()) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/crimes", data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Crime Reported Successfully");
      setData({ title: "", description: "", location: "" });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to report crime");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={submitHandler}
      className="bg-white p-6 rounded shadow max-w-md mx-auto"
    >
      <h3 className="text-lg font-semibold mb-4">Report a Crime</h3>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <input
        className="border p-2 w-full mb-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Crime Title"
        value={data.title}
        onChange={(e) => setData({ ...data, title: e.target.value })}
        required
      />
      <textarea
        className="border p-2 w-full mb-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Description"
        value={data.description}
        onChange={(e) => setData({ ...data, description: e.target.value })}
        rows="4"
        required
      />
      <input
        className="border p-2 w-full mb-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Location"
        value={data.location}
        onChange={(e) => setData({ ...data, location: e.target.value })}
        required
      />
      <button 
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? "Reporting..." : "Report Crime"}
      </button>
    </form>
  );
}

