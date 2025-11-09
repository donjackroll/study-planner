import { Link, useLocation } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
import React, { useState } from "react";

export default function Navbar({ tasks, setTasks }) {
  const [user] = useAuthState(auth);
  const location = useLocation();
  const [day, setDay] = useState("");

  const toggleStatus = (id) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    );
  };

  return (
    <nav
      style={{
        backdropFilter: "blur(10px)", // glass effect
        background: "rgba(40, 44, 70, 0.85)",
        color: "white",
        padding: "12px 30px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      {/* Logo */}
      <Link
        to="/"
        style={{
          color: "#f8f9fa",
          textDecoration: "none",
          fontSize: "22px",
          fontWeight: "bold",
          letterSpacing: "0.5px",
          transition: "0.3s",
        }}
        onMouseEnter={(e) => (e.target.style.color = "#80bfff")}
        onMouseLeave={(e) => (e.target.style.color = "#f8f9fa")}
      >
        🎓 Study Planner
      </Link>

      {/* Menu */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
        {user ? (
          <>
            <Link
              to="/plan"
              style={menuLinkStyle}
            >
              📘 Lên kế hoạch
            </Link>
            <Link
              to="/stats"
              style={menuLinkStyle}
            >
              📊 Thống kê
            </Link>
          </>
        ) : (
          location.pathname !== "/" && (
            <Link
              to="/"
              style={{
                ...menuLinkStyle,
                backgroundColor: "#4CAF50",
                padding: "8px 15px",
                borderRadius: "6px",
                fontWeight: "600",
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#66bb6a")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#4CAF50")}
            >
              🔐 Đăng nhập
            </Link>
          )
        )}
      </div>
    </nav>
  );
}

const menuLinkStyle = {
  color: "white",
  textDecoration: "none",
  fontWeight: 500,
  transition: "all 0.3s ease",
  padding: "6px 10px",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "15px",
  backgroundColor: "transparent",
  userSelect: "none",
  onMouseEnter: (e) => e.target.style.backgroundColor = "rgba(128, 191, 255, 0.2)",
  onMouseLeave: (e) => e.target.style.backgroundColor = "transparent",
};
