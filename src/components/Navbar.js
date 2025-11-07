import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="navbar">
      <h2>🎓 Study Planner</h2>
      <div>
        <Link to="/">Đăng nhập</Link>
        <Link to="/plan">Lên kế hoạch</Link>
        <Link to="/stats">Thống kê</Link>
      </div>
    </nav>
  );
}
