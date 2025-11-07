import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    if (name.trim()) {
      localStorage.setItem("user", name);
      navigate("/plan");
    }
  };

  return (
    <div className="page">
      <h1>Đăng nhập</h1>
      <input
        type="text"
        placeholder="Nhập tên của bạn..."
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={handleLogin}>Bắt đầu</button>
    </div>
  );
}
