import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../config";
import { auth } from "../firebase";
import { GoogleAuthProvider, FacebookAuthProvider, signInWithPopup } from "firebase/auth";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleAuthSuccess = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    if (data.user.role === "admin") {
      navigate("/admin");
    } else {
      navigate("/dashboard");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/login`,
        formData
      );
      handleAuthSuccess(response.data);
    } catch (err) {
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        setError("Cannot connect to server. Please try again later or check your internet connection.");
      } else if (err.response?.status === 404) {
        setError("Server endpoint not found. Please contact support.");
      } else {
        setError(err.response?.data?.message || "Login failed. Please check your credentials.");
      }
    }
  };

  const handleFirebaseGoogleLogin = async () => {
    try {
      setError("");
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      // Send the Firebase ID token to your backend
      const response = await axios.post(`${API_BASE_URL}/api/auth/google-login`, {
        tokenId: idToken,
      });

      handleAuthSuccess(response.data);
    } catch (err) {
      console.error("Firebase Google Login Error:", err);
      const errorMessage = err.response?.data?.message || err.message || "Google login failed";
      setError(`Google login failed: ${errorMessage}. Please check console for details.`);
    }
  };

  const handleFirebaseFacebookLogin = async () => {
    try {
      setError("");
      const provider = new FacebookAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      // Send the Firebase ID token to your backend (can use same endpoint or separate)
      const response = await axios.post(`${API_BASE_URL}/api/auth/facebook-login`, {
        accessToken: idToken, // We'll update backend to accept Firebase ID token for Facebook too
        isFirebase: true
      });

      handleAuthSuccess(response.data);
    } catch (err) {
      console.error("Firebase Facebook Login Error:", err);
      const backendError = err.response?.data?.error;
      const message = err.response?.data?.message || err.message || "Facebook login failed";
      setError(`Facebook login failed: ${message} ${backendError ? `(${backendError})` : ''}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6">Login</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm whitespace-pre-wrap text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Login
          </button>
        </form>

        <div className="my-6 flex items-center before:flex-1 before:border-t before:border-gray-300 before:mt-0.5 after:flex-1 after:border-t after:border-gray-300 after:mt-0.5">
          <p className="text-center font-semibold mx-4 mb-0 text-gray-500 text-sm">OR</p>
        </div>

        <div className="space-y-3">
          <div className="flex justify-center">
            <button
              onClick={handleFirebaseGoogleLogin}
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition font-semibold shadow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                <path fill="none" d="M0 0h48v48H0z" />
              </svg>
              Sign in with Google
            </button>
          </div>

          <div className="flex justify-center w-full">
            <button
              onClick={handleFirebaseFacebookLogin}
              className="w-full flex items-center justify-center gap-3 bg-[#1877F2] text-white py-2 rounded-lg hover:bg-[#166fe5] transition font-semibold shadow-sm"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Login with Facebook
            </button>
          </div>
        </div>

        <p className="text-center mt-6 text-gray-600">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-600 hover:underline font-semibold">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
