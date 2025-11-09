// src/pages/Login.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  // ----------------- Email Login -----------------
  const handleLogin = async () => {
    try {
      if (!email || !password) throw new Error("Nhập email & mật khẩu!");
      await signInWithEmailAndPassword(auth, email, password);
      showToast("✅ Đăng nhập thành công!");
      setTimeout(() => navigate("/plan"), 800);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRegister = async () => {
    try {
      if (!email || !password) throw new Error("Nhập email & mật khẩu!");
      await createUserWithEmailAndPassword(auth, email, password);
      setIsRegistered(true);
      showToast("🎉 Tạo tài khoản thành công!");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSetName = async () => {
    try {
      if (!displayName.trim()) throw new Error("Nhập tên hiển thị!");
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName });
        showToast("✅ Lưu tên hiển thị thành công!");
        navigate("/plan");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // ----------------- Google Login -----------------
  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      showToast("✅ Đăng nhập Google thành công!");
      setTimeout(() => navigate("/plan"), 800);
    } catch (err) {
      setError(err.message);
    }
  };

  // ----------------- Phone Login -----------------
  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        "recaptcha-container",
        { size: "invisible" },
        auth
      );
    }
  };

  const sendOTP = async () => {
    try {
      if (!phone) throw new Error("Nhập số điện thoại!");
      setupRecaptcha();
      const confirmation = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier);
      setConfirmationResult(confirmation);
      showToast("✅ OTP đã được gửi!");
    } catch (err) {
      setError("❌ Lỗi khi gửi OTP: " + err.message);
    }
  };

  const verifyOTP = async () => {
    try {
      if (!otp) throw new Error("Nhập mã OTP!");
      await confirmationResult.confirm(otp);
      showToast("✅ Đăng nhập bằng số điện thoại thành công!");
      setTimeout(() => navigate("/plan"), 800);
    } catch (err) {
      setError("❌ OTP không đúng: " + err.message);
    }
  };

  return (
    <div className="login-background">
      <div id="recaptcha-container"></div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 20, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="toast"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div className="login-card" initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <h1>🎓 Study Planner</h1>

        {!isRegistered ? (
          <>
            <div className="form-container">
              <input type="email" placeholder="Email..." value={email} onChange={e => setEmail(e.target.value)} />
              <input type="password" placeholder="Mật khẩu..." value={password} onChange={e => setPassword(e.target.value)} />
              <p className="error">{error}</p>
              <button onClick={handleLogin} className="login">Đăng nhập</button>
              <button onClick={handleRegister} className="register">Đăng ký</button>
              <button onClick={handleGoogleLogin} className="google">Google Login</button>
            </div>

            <hr />

            <div className="phone-container">
              <input type="text" placeholder="Số điện thoại (+84...)" value={phone} onChange={e => setPhone(e.target.value)} />
              {!confirmationResult ? (
                <button onClick={sendOTP} className="login">Gửi OTP</button>
              ) : (
                <>
                  <input type="text" placeholder="Nhập OTP" value={otp} onChange={e => setOtp(e.target.value)} />
                  <button onClick={verifyOTP} className="login">Xác nhận OTP</button>
                </>
              )}
            </div>
          </>
        ) : (
          <div className="form-container">
            <h3>Tài khoản đã được tạo!</h3>
            <input type="text" placeholder="Tên hiển thị..." value={displayName} onChange={e => setDisplayName(e.target.value)} />
            <button onClick={handleSetName} className="login">Lưu tên hiển thị</button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
