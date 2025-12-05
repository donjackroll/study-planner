import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Plan from "./pages/Plan";
import Stats from "./pages/Stats";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";
import "./responsive.css";

function AppContent() {
  const [user, loading] = useAuthState(auth);
  const location = useLocation();

  // ❌ Ẩn Navbar khi đang ở trang Login ("/")
  const hideNavbar = location.pathname === "/";

  if (loading) {
    return <div style={{ textAlign: "center", marginTop: "50px" }}>⏳ Đang tải...</div>;
  }

  return (
    <>
      {/* Chỉ hiển thị navbar khi KHÔNG phải trang Login */}
      {!hideNavbar && <Navbar />}

      <div className="container">
        <Routes>
          {/* Nếu chưa đăng nhập → luôn quay về /login */}
          <Route
            path="/"
            element={!user ? <Login /> : <Navigate to="/plan" />}
          />

          <Route
            path="/plan"
            element={user ? <Plan /> : <Navigate to="/" />}
          />

          <Route
            path="/stats"
            element={user ? <Stats /> : <Navigate to="/" />}
          />
        </Routes>
      </div>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
