import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import "./Navbar.css";

export default function Navbar() {
  const [shrinkLevel, setShrinkLevel] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user] = useAuthState(auth);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (scrollY > 40) setShrinkLevel(1);
      else setShrinkLevel(0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Đăng xuất
  const logout = () => {
    auth.signOut();
    setMenuOpen(false);
  };

  return (
  <>
    {/* NAVBAR */}
    <div className={`navbar shrink-${shrinkLevel}`}>
      
      {/* MOBILE MENU ICON BÊN TRÁI */}
      <div className="mobile-menu-icon" onClick={() => setMenuOpen(true)}>
        ☰
      </div>

      {/* LOGO */}
      <div className="nav-left">🎓 Study Planner</div>

      {/* DESKTOP MENU (ẩn trên mobile) */}
      <div className="nav-right desktop-menu">
        <Link to="/plan">📘 Lên Kế Hoạch</Link>
        <Link to="/stats">📊 Thống Kê</Link>
        <button className="nav-logout" onClick={logout}>🚪 Đăng Xuất</button>
      </div>
    </div>

    {/* SIDEBAR MOBILE */}
    <div className={`sidebar ${menuOpen ? "open" : ""}`}>
      <div className="sidebar-header">
        <span className="close-btn" onClick={() => setMenuOpen(false)}>✕</span>
      </div>

      <Link to="/plan" className="sidebar-item" onClick={() => setMenuOpen(false)}>
        📘 Lên Kế Hoạch
      </Link>

      <Link to="/stats" className="sidebar-item" onClick={() => setMenuOpen(false)}>
        📊 Thống Kê
      </Link>

      <button className="sidebar-item logout" onClick={logout}>
        🚪 Đăng Xuất
      </button>
    </div>
  </>
  );
}
