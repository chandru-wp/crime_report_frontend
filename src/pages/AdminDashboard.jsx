import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import API_BASE_URL from "../config";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

export default function AdminDashboard() {
  const [crimes, setCrimes] = useState([]);
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState("all");
  const [editingCrime, setEditingCrime] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [editError, setEditError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (!userData || !token || userData.role !== "admin") {
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
      alert("Failed to fetch crimes");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleStatusChange = async (crimeId, currentStatus) => {
    const statuses = ["Pending", "Investigating", "Resolved"];
    const currentIndex = statuses.indexOf(currentStatus);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];

    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${API_BASE_URL}/api/crimes/${crimeId}/status`,
        { status: nextStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCurrentPage(1);
      fetchCrimes();
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  const handleDeleteCrime = async (crimeId) => {
    if (!confirm("Are you sure you want to delete this crime report?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/api/crimes/${crimeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentPage(1);
      fetchCrimes();
    } catch (error) {
      console.error("Error deleting crime:", error);
      alert("Failed to delete crime");
    }
  };

  const handleEditCrime = (crime) => {
    setEditingCrime(crime.id);
    setEditFormData(crime);
    setEditError("");
  };

  const handleSaveEdit = async () => {
    // Validation
    if (!editFormData.title?.trim() || !editFormData.description?.trim() || !editFormData.location?.trim()) {
      setEditError("All fields are required");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `${API_BASE_URL}/api/crimes/${editingCrime}`,
        {
          title: editFormData.title,
          description: editFormData.description,
          location: editFormData.location,
          status: editFormData.status
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingCrime(null);
      setEditFormData({});
      setEditError("");
      fetchCrimes();
    } catch (error) {
      console.error("Error updating crime:", error);
      setEditError(error.response?.data?.message || "Failed to update crime");
    }
  };

  const downloadSingleReport = (crime) => {
    try {
      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.text("Crime Report", 14, 22);

      doc.setFontSize(11);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 32);

      const details = [
        ["Title", crime.title],
        ["Description", crime.description],
        ["Location", crime.location],
        ["Status", crime.status],
        ["Date", new Date(crime.createdAt).toLocaleDateString()],
      ];

      autoTable(doc, {
        startY: 40,
        head: [["Field", "Value"]],
        body: details,
      });

      doc.save(`crime-report-${crime.id.slice(0, 8)}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF: " + error.message);
    }
  };

  const downloadPDF = () => {
    try {
      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.text("Crime Reports", 14, 22);

      doc.setFontSize(11);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 32);

      const tableData = filteredCrimes.map((crime) => [
        crime.title,
        crime.location,
        crime.status,
        new Date(crime.createdAt).toLocaleDateString(),
      ]);

      autoTable(doc, {
        startY: 40,
        head: [["Title", "Location", "Status", "Date"]],
        body: tableData,
      });

      doc.save("crime-reports.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF: " + error.message);
    }
  };

  const filteredCrimes =
    filter === "all"
      ? crimes
      : crimes.filter((crime) => crime.status === filter);

  // Pagination
  const totalPages = Math.ceil(filteredCrimes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCrimes = filteredCrimes.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Analytics data
  const statusData = [
    {
      name: "Pending",
      value: crimes.filter((c) => c.status === "Pending").length,
    },
    {
      name: "Investigating",
      value: crimes.filter((c) => c.status === "Investigating").length,
    },
    {
      name: "Resolved",
      value: crimes.filter((c) => c.status === "Resolved").length,
    },
  ].filter(item => item.value > 0); // Only show statuses with data

  const monthlyData = crimes.reduce((acc, crime) => {
    const month = new Date(crime.createdAt).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});

  const monthlyChartData = Object.entries(monthlyData).map(([month, count]) => ({
    month,
    crimes: count,
  }));

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Admin Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/admin/users")}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              Manage Users
            </button>
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
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Total Crimes</h3>
            <p className="text-3xl font-bold text-gray-900">{crimes.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Pending</h3>
            <p className="text-3xl font-bold text-yellow-600">
              {crimes.filter((c) => c.status === "Pending").length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">
              Investigating
            </h3>
            <p className="text-3xl font-bold text-blue-600">
              {crimes.filter((c) => c.status === "Investigating").length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Resolved</h3>
            <p className="text-3xl font-bold text-green-600">
              {crimes.filter((c) => c.status === "Resolved").length}
            </p>
          </div>
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow h-full">
            <h3 className="text-lg font-semibold mb-4 text-center">Status Distribution</h3>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow h-full">
            <h3 className="text-lg font-semibold mb-4 text-center">Monthly Crimes</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="crimes" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Crime Reports Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">All Crime Reports</h2>
              <div className="flex gap-4">
                <select
                  className="border rounded px-4 py-2"
                  value={filter}
                  onChange={(e) => {
                    setFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="all">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Investigating">Investigating</option>
                  <option value="Resolved">Resolved</option>
                </select>
                <button
                  onClick={downloadPDF}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Download PDF
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedCrimes.map((crime) => (
                  <tr key={crime.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {crime.title}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {crime.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {crime.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          crime.status === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : crime.status === "Investigating"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {crime.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(crime.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => handleEditCrime(crime)}
                          className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => downloadSingleReport(crime)}
                          className="bg-purple-600 text-white px-2 py-1 rounded text-xs hover:bg-purple-700"
                        >
                          Download
                        </button>
                        <button
                          onClick={() => handleDeleteCrime(crime.id)}
                          className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages || 1} • Showing {paginatedCrimes.length} of {filteredCrimes.length} records
            </div>
            <div className="flex gap-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                ← Previous
              </button>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Next →
              </button>
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        {editingCrime && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
              <h2 className="text-xl font-semibold mb-4">Edit Crime Report</h2>

              {editError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {editError}
                </div>
              )}

              <form onSubmit={(e) => {
                e.preventDefault();
                handleSaveEdit();
              }}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editFormData.title || ""}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editFormData.description || ""}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, description: e.target.value })
                    }
                    rows="4"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editFormData.location || ""}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, location: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <div className="flex gap-2 mb-2">
                    {["Pending", "Investigating", "Resolved"].map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() =>
                          setEditFormData({ ...editFormData, status })
                        }
                        className={`px-3 py-2 rounded text-sm font-medium transition ${
                          editFormData.status === status
                            ? status === "Pending"
                              ? "bg-yellow-600 text-white"
                              : status === "Investigating"
                              ? "bg-blue-600 text-white"
                              : "bg-green-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                  <select
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editFormData.status || ""}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, status: e.target.value })
                    }
                    required
                  >
                    <option value="">Select Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Investigating">Investigating</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-medium"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCrime(null);
                      setEditFormData({});
                      setEditError("");
                    }}
                    className="flex-1 bg-gray-600 text-white py-2 rounded hover:bg-gray-700 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
