import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, storage, db } from "../firebase";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import DaySelect from "./DaySelect";
import { motion } from "framer-motion";

export default function Plan() {
  const [tasks, setTasks] = useState([]);
  const [subject, setSubject] = useState("");
  const [time, setTime] = useState("");

  // 🔥 MULTI SELECT: day phải là array
  const [day, setDay] = useState([]);

  const [user, setUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  // 🌙 DARK MODE (nút đã xóa khỏi UI)
  const [darkMode, setDarkMode] = useState(localStorage.getItem("dm") === "1");

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("dm", "1");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("dm", "0");
    }
  }, [darkMode]);

  // 🔥 LOAD USER + TASKS
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        navigate("/");
        return;
      }
      setUser(u);

      const docRef = doc(db, "tasks", u.uid);
      return onSnapshot(docRef, (snap) => {
        if (snap.exists()) {
          const arr = Array.isArray(snap.data().tasks)
            ? snap.data().tasks.map((t) => ({
                ...t,
                time: Number(t.time),
                day: Array.isArray(t.day) ? t.day : [t.day], // luôn là array
              }))
            : [];
          setTasks(arr);
        } else setTasks([]);
      });
    });

    return () => unsub();
  }, [navigate]);

  // SAVE
  const saveTasksToFirestore = async (arr) => {
    if (!user) return;
    await setDoc(doc(db, "tasks", user.uid), { tasks: arr });
  };

  // ADD TASK
  const addTask = async () => {
  if (!subject || !time || day.length === 0) return;

  // Tạo nhiều task – mỗi ngày là một item riêng
  const newTasks = day.map(d => ({
    id: Date.now() + Math.random(), // tránh trùng id
    day: d,            // mỗi task chỉ 1 thứ
    subject,
    time,
    completed: false,
  }));

  const updated = [...tasks, ...newTasks];
  setTasks(updated);
  await saveTasksToFirestore(updated);

  // Reset form
  setSubject("");
  setTime("");
  setDay([]);
};


  const toggleStatus = async (id) => {
    const updated = tasks.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    setTasks(updated);
    await saveTasksToFirestore(updated);
  };

  const deleteTask = async (id) => {
    const updated = tasks.filter((t) => t.id !== id);
    setTasks(updated);
    await saveTasksToFirestore(updated);
  };

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/");
  };

  if (!user) return null;

  return (
    <div className="page">

      {/* HEADER */}
      <div className="header" style={{ width: "100%", marginBottom: 20 }}>
        <div>
          <h1>Xin chào, {user.displayName || user.email} 👋</h1>
          <p style={{ opacity: 0.7 }}>Thống kê kế hoạch học tập 📚</p>
        </div>
      </div>

      <h2
        style={{
          textAlign: "center",
          marginBottom: "20px",
          fontSize: "22px",
          fontWeight: "600",
        }}
      >
        Lên kế hoạch học tập
      </h2>

      {/* FORM */}
      <div className="form" style={{ marginBottom: "25px" }}>
        {/* MULTI SELECT DAY */}
        <div className="dropdown-wrapper">
          <DaySelect day={day} setDay={setDay} />
        </div>

        <motion.input
          type="text"
          placeholder="Môn học..."
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          whileFocus={{ scale: 1.03 }}
          className="input-box"
        />

        <motion.input
          type="number"
          placeholder="Thời gian (phút)"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          whileFocus={{ scale: 1.03 }}
          className="input-box"
        />

        <button onClick={addTask} className="add-btn">
          Thêm
        </button>
      </div>

      {/* 📌 WRAP TABLE */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Thứ</th>
              <th>Môn học</th>
              <th>Thời gian (phút)</th>
              <th>Trạng thái</th>
              <th>Xóa</th>
            </tr>
          </thead>

          <tbody>
            {tasks.map((t) => (
              <tr key={t.id}>
                {/* HIỂN THỊ NHIỀU THỨ */}
                <td>{t.day}</td>

                <td>{t.subject}</td>
                <td>{t.time}</td>

                <td>
                  <button
                    onClick={() => toggleStatus(t.id)}
                    className={t.completed ? "status-done" : "status-pending"}
                  >
                    {t.completed ? "Đã hoàn thành" : "Chưa hoàn thành"}
                  </button>
                </td>

                <td>
                  <button onClick={() => deleteTask(t.id)}>❌</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
