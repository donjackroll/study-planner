// Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
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
  const [showAltMethods, setShowAltMethods] = useState(false);
  const navigate = useNavigate();

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  // ---------------- Email login ----------------
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

  // ---------------- Google login ----------------
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

  // ---------------- Phone login (production) ----------------
  const setupRecaptcha = () => {
    // Tạo recaptcha duy nhất, dùng lại nhiều lần (best practice cho production)
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible", // có thể đổi thành 'normal' để test dễ hơn
          callback: (response) => {
            console.log("✅ reCAPTCHA verified:", response);
          },
          "expired-callback": () => {
            console.log("⚠️ reCAPTCHA expired, sẽ tạo lại.");
            window.recaptchaVerifier = null;
          },
        }
      );

      // BẮT BUỘC: render() để recaptcha hoạt động ổn định trên production
      window.recaptchaVerifier.render().catch((e) => {
        console.error("render recaptcha error:", e);
      });
    }
  };

  const formatPhone = (raw) => {
    let p = raw.trim();
    // Nếu user nhập 0xxxxxxxx thì chuyển thành +84xxxxxxxx
    if (p.startsWith("0")) {
      p = "+84" + p.slice(1);
    }
    // Nếu đã có +84 thì giữ nguyên
    return p;
  };

  const sendOTP = async () => {
    try {
      setError("");
      if (!phone) throw new Error("Nhập số điện thoại!");

      const phoneNumber = formatPhone(phone);

      // Điều kiện: phone phải là E.164 (+84...)
      if (!phoneNumber.startsWith("+")) {
        throw new Error("Số điện thoại phải có mã vùng, ví dụ: +84...");
      }

      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;

      const confirmation = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        appVerifier
      );
      setConfirmationResult(confirmation);
      showToast("✅ OTP đã được gửi!");
    } catch (err) {
      console.error(err);
      setError("❌ Lỗi khi gửi OTP: " + err.message);
    }
  };

  const verifyOTP = async () => {
    try {
      setError("");
      if (!otp) throw new Error("Nhập mã OTP!");
      if (!confirmationResult) throw new Error("Chưa gửi OTP!");

      await confirmationResult.confirm(otp);
      showToast("✅ Đăng nhập bằng số điện thoại thành công!");
      setTimeout(() => navigate("/plan"), 800);
    } catch (err) {
      console.error(err);
      setError("❌ OTP không đúng: " + err.message);
    }
  };

  return (
    <div className="login-background">
      {/* Container recaptcha – phải tồn tại trong DOM */}
      <div id="recaptcha-container"></div>

      {/* Toast message */}
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

      {/* Main Card */}
      <motion.div
        className="login-card"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
      >
        
        <h1>🎓 STUDY PLANNER </h1>

        <AnimatePresence mode="wait">
          {!showAltMethods ? (
            // ================= EMAIL FORM =================
            <motion.div
              key="email"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.4 }}
              className="form-container"
            >
              {!isRegistered ? (
                <>
                  <input
                    type="email"
                    placeholder="Email..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <input
                    type="password"
                    placeholder="Mật khẩu..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <p className="error">{error}</p>
                  <button onClick={handleLogin} className="login">
                    Đăng nhập
                  </button>
                  <button onClick={handleRegister} className="register">
                    Đăng ký
                  </button>

                  <button
                    className="alt-btn"
                    onClick={() => setShowAltMethods(true)}
                  >
                    🔄 Phương thức đăng nhập khác
                  </button>
                </>
              ) : (
                <>
                  <h3>Tài khoản đã được tạo!</h3>
                  <input
                    type="text"
                    placeholder="Tên hiển thị..."
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                  <button onClick={handleSetName} className="login">
                    Lưu tên hiển thị
                  </button>
                </>
              )}
            </motion.div>
          ) : (
            // ================= OTHER LOGIN FORM =================
            <motion.div
              key="alt"
              initial={{ opacity: 0, y: 80 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -80 }}
              transition={{ duration: 0.4 }}
              className="form-container"
            >
              <h3>Phương thức đăng nhập khác</h3>

              {/* Google Login */}
              <button onClick={handleGoogleLogin} className="google">
                Đăng nhập với Google
              </button>

              {/* Phone Login */}
              <input
                type="text"
                placeholder="Số điện thoại (vd: 0912..., +84912...)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              {!confirmationResult ? (
                <button onClick={sendOTP} className="login">
                  Gửi OTP
                </button>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Nhập OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                  <button onClick={verifyOTP} className="login">
                    Xác nhận OTP
                  </button>
                </>
              )}

              <p className="error">{error}</p>

              <button
                className="alt-btn"
                onClick={() => setShowAltMethods(false)}
              >
                ⬅ Quay lại Email / Mật khẩu
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
