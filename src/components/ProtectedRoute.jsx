import { Navigate } from "react-router-dom";
import { auth } from "../firebase";
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check both Firebase and localStorage for authentication
    const localToken = localStorage.getItem("token");
    
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      // If we have either a Firebase user OR a local token, we considerauthenticated
      if (firebaseUser || localToken) {
        setUser(firebaseUser || { local: true });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;
