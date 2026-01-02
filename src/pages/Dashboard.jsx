import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CrimeForm from "../components/CrimeForm";
import API_BASE_URL from "../config";

export default function Dashboard() {
  const [crimes, setCrimes] = useState([]);
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
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
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>{crime.location}</span>
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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
