import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Plan from "./pages/Plan";
import Stats from "./pages/Stats";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase"; // ✅ firebase.js phải nằm trong src/

function App() {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return <div style={{ textAlign: "center", marginTop: "50px" }}>⏳ Đang tải...</div>;
  }

  return (
    <Router>
      <Navbar />
      <div className="container">
        <Routes>
          {/* Nếu chưa đăng nhập thì luôn chuyển hướng về / */}
          <Route
            path="/"
            element={!user ? <Login /> : <Navigate to="/plan" />}
          />

          {/* Chỉ cho phép truy cập khi đã đăng nhập */}
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
    </Router>
  );
}

export default App;
