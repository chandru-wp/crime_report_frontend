import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CrimeForm from "../components/CrimeForm";
import API_BASE_URL from "../config";

export default function Dashboard() {
  const [crimes, setCrimes] = useState([]);
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCrime, setEditingCrime] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    location: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (!userData || !token) {
      navigate("/login");
      return;
    }

    setUser(userData);
    fetchCrimes();
  }, [navigate]);

  const fetchCrimes = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/api/crimes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCrimes(response.data);
    } catch (error) {
      console.error("Error fetching crimes:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleCrimeReported = () => {
    setShowForm(false);
    fetchCrimes();
  };

  const handleEditClick = (crime) => {
    setEditingCrime(crime.id);
    setEditFormData({
      title: crime.title,
      description: crime.description,
      location: crime.location
    });
    setShowForm(false);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${API_BASE_URL}/api/crimes/${editingCrime}`,
        editFormData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess("Crime report updated successfully");
      setEditingCrime(null);
      setEditFormData({ title: "", description: "", location: "" });
      setTimeout(() => setSuccess(""), 3000);
      fetchCrimes();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update crime report");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleDeleteCrime = async (crimeId, crimeTitle) => {
    if (!confirm(`Are you sure you want to delete "${crimeTitle}"? This action cannot be undone.`)) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${API_BASE_URL}/api/crimes/${crimeId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess("Crime report deleted successfully");
      setTimeout(() => setSuccess(""), 3000);
      fetchCrimes();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete crime report");
      setTimeout(() => setError(""), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            High-Tech Crime Response System
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">Welcome, {user?.name}</span>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Messages */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        {/* Report Crime Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
          >
            {showForm ? "Hide Form" : "Report New Crime"}
          </button>
        </div>

        {/* Crime Form */}
        {showForm && (
          <div className="mb-8">
            <CrimeForm onSuccess={handleCrimeReported} />
          </div>
        )}

        {/* Edit Crime Form */}
        {editingCrime && (
          <div className="bg-white p-6 rounded-lg shadow mb-8 border-l-4 border-blue-600">
            <h2 className="text-xl font-semibold mb-4">Edit Crime Report</h2>
            <form onSubmit={handleEditSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Crime Title</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editFormData.title}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, title: e.target.value })
                  }
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Description</label>
                <textarea
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editFormData.description}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, description: e.target.value })
                  }
                  rows="4"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editFormData.location}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, location: e.target.value })
                  }
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditingCrime(null)}
                  className="bg-gray-400 text-white px-6 py-2 rounded-lg hover:bg-gray-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Recent Crimes */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Crime Reports</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {crimes.slice(0, 9).map((crime) => (
              <div
                key={crime.id}
                className="border rounded-lg p-4 hover:shadow-md transition"
              >
                <h3 className="font-semibold text-lg mb-2">{crime.title}</h3>
                <p className="text-gray-600 text-sm mb-2">
                  {crime.description}
                </p>
                <div className="text-xs text-gray-500 mb-3">
                  <div className="flex justify-between items-center mb-2">
                    <span>📍 {crime.location}</span>
                    <span
                      className={`px-2 py-1 rounded ${
                        crime.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : crime.status === "Investigating"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {crime.status}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleEditClick(crime)}
                    className="flex-1 bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCrime(crime.id, crime.title)}
                    className="flex-1 bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
