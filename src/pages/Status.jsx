import { useState, useEffect } from "react";
import API_BASE_URL from "../config";

export default function Status() {
  const [apiStatus, setApiStatus] = useState("checking");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const checkAPI = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/profile`);
        if (response.status === 401) {
          setApiStatus("connected");
          setMessage("✅ Backend API is connected! (Login required)");
        } else {
          setApiStatus("connected");
          setMessage("✅ Backend API is working!");
        }
      } catch (error) {
        setApiStatus("disconnected");
        setMessage(`❌ Cannot connect to backend: ${API_BASE_URL}`);
        console.error("API Error:", error);
      }
    };

    checkAPI();
  }, []);

  return (
    <div className={`p-4 rounded ${apiStatus === "connected" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
      <p className="font-semibold">{message}</p>
      <p className="text-sm">API URL: {API_BASE_URL}</p>
    </div>
  );
}
