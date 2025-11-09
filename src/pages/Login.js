// src/pages/Login.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
import "./Login.css"; // CSS animation background

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [toast, setToast] = useState(""); // trạng thái banner
  const navigate = useNavigate();

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000); // tự ẩn sau 3s
  };

  const handleLogin = async () => {
    try {
      if (!email || !password) {
        setError("⚠️ Vui lòng nhập email và mật khẩu!");
        return;
      }
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      localStorage.setItem(
        "user",
        JSON.stringify({ email: user.email, name: user.displayName || user.email })
      );
      showToast("✅ Đăng nhập thành công!");
      setTimeout(() => navigate("/plan"), 800); // delay để thấy toast
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRegister = async () => {
    try {
      if (!email || !password) {
        setError("⚠️ Vui lòng nhập email và mật khẩu!");
        return;
      }
      await createUserWithEmailAndPassword(auth, email, password);
      setIsRegistered(true);
      setError("");
      showToast("🎉 Tạo tài khoản thành công!");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSetName = async () => {
    try {
      if (!displayName.trim()) {
        setError("⚠️ Vui lòng nhập tên hiển thị!");
        return;
      }
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName });
        localStorage.setItem(
          "user",
          JSON.stringify({ email: auth.currentUser.email, name: displayName })
        );
        showToast("✅ Lưu tên hiển thị thành công!");
        navigate("/plan");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-background">
      {/* Banner toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 20, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={toastStyle}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card login */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
        whileHover={{ scale: 1.02, boxShadow: "0 15px 35px rgba(0,0,0,0.3)" }}
        style={cardStyle}
      >
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          style={{ marginBottom: "25px", color: "#333" }}
        >
          🎓 Study Planner
        </motion.h1>

        {!isRegistered ? (
          <>
            <motion.input
              type="email"
              placeholder="Email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              whileFocus={{ scale: 1.02, borderColor: "#667eea" }}
              style={inputStyle}
            />
            <motion.input
              type="password"
              placeholder="Mật khẩu..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              whileFocus={{ scale: 1.02, borderColor: "#667eea" }}
              style={inputStyle}
            />
            {error && <p style={{ color: "red", fontSize: "14px" }}>{error}</p>}
            <motion.button
              onClick={handleLogin}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              style={buttonStyle}
            >
              Đăng nhập
            </motion.button>
            <motion.button
              onClick={handleRegister}
              whileHover={{ scale: 1.05, backgroundColor: "#5a67d8" }}
              whileTap={{ scale: 0.97 }}
              style={{ ...buttonStyle, backgroundColor: "#667eea", marginTop: "10px" }}
            >
              Đăng ký
            </motion.button>
          </>
        ) : (
          <>
            <motion.h3
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              style={{ color: "#333" }}
            >
              🎉 Tài khoản đã được tạo!
            </motion.h3>
            <p>Nhập tên hiển thị của bạn:</p>
            <motion.input
              type="text"
              placeholder="Tên hiển thị..."
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              whileFocus={{ scale: 1.02, borderColor: "#667eea" }}
              style={inputStyle}
            />
            {error && <p style={{ color: "red", fontSize: "14px" }}>{error}</p>}
            <motion.button
              onClick={handleSetName}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              style={buttonStyle}
            >
              Lưu tên hiển thị
            </motion.button>
          </>
        )}
      </motion.div>
    </div>
  );
}

const cardStyle = {
  background: "rgba(255,255,255,0.95)",
  padding: "40px 30px",
  borderRadius: "20px",
  width: "100%",
  maxWidth: "400px",
  textAlign: "center",
  boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
};

const inputStyle = {
  width: "100%",
  padding: "12px 15px",
  margin: "10px 0",
  borderRadius: "10px",
  border: "1px solid #ccc",
  outline: "none",
  fontSize: "14px",
  boxSizing: "border-box",
};

const buttonStyle = {
  width: "100%",
  padding: "12px 0",
  borderRadius: "10px",
  border: "none",
  backgroundColor: "#4CAF50",
  color: "white",
  fontSize: "16px",
  cursor: "pointer",
  transition: "0.3s",
};

const toastStyle = {
  position: "fixed",
  top: 20,
  left: "50%",
  transform: "translateX(-50%)",
  background: "#4caf50",
  color: "white",
  padding: "12px 20px",
  borderRadius: "8px",
  fontWeight: "500",
  zIndex: 1000,
  boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
};
