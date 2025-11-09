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
  const [day, setDay] = useState("");
  const [user, setUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

useEffect(() => {
  const u = auth.currentUser;
  if (u) {
    setUser(u); // lấy avatar từ Google nếu đăng nhập bằng Google
  }

  const unsubAuth = onAuthStateChanged(auth, (u) => {
    if (u) {
      setUser(u);
      // load tasks
      const docRef = doc(db, "tasks", u.uid);
      const unsubSnap = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const userTasks = Array.isArray(data.tasks)
            ? data.tasks.map(t => ({ ...t, time: Number(t.time) || 0 }))
            : [];
          setTasks(userTasks);
        } else {
          setTasks([]);
        }
      });
      return () => unsubSnap();
    } else {
      setUser(null);
      navigate("/");
    }
  });

  return () => unsubAuth();
}, [navigate]);


  const saveTasksToFirestore = async (updatedTasks) => {
    if (!user?.uid) return;
    try {
      const docRef = doc(db, "tasks", user.uid);
      await setDoc(docRef, { tasks: updatedTasks });
    } catch (err) {
      console.error("Save tasks error:", err);
    }
  };

  const addTask = async () => {
    if (!subject || !time || !day) return;
    const newTask = { id: Date.now(), day, subject, time, completed: false };
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    await saveTasksToFirestore(updatedTasks);
    setSubject("");
    setTime("");
    setDay("");
  };

  const toggleStatus = async (id) => {
    const updatedTasks = tasks.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    setTasks(updatedTasks);
    await saveTasksToFirestore(updatedTasks);
  };

  const deleteTask = async (id) => {
    const updatedTasks = tasks.filter((t) => t.id !== id);
    setTasks(updatedTasks);
    await saveTasksToFirestore(updatedTasks);
  };

  const handleLogout = async () => {
    try { await auth.signOut(); } catch {}
    localStorage.removeItem("user");
    navigate("/");
  };

const handleAvatarChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  if (!["image/jpeg", "image/png", "image/gif", "image/jpg"].includes(file.type)) {
    alert("Vui lòng chọn file ảnh hợp lệ (.jpg, .jpeg, .png, .gif)");
    return;
  }
  if (!user?.uid) return;

  try {
    setUploading(true);
    const storageRef = ref(storage, `avatars/${user.uid}/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    if (auth.currentUser) {
      await updateProfile(auth.currentUser, { photoURL: downloadURL });
      await auth.currentUser.reload(); // reload user
      setUser({ ...auth.currentUser }); // set lại state từ auth.currentUser
    }
  } catch (err) {
    console.error(err);
    alert("❌ Lỗi khi tải ảnh: " + err.message);
  } finally {
    setUploading(false);
  }
};


  const handleChangeName = async () => {
    const newName = prompt("Nhập tên hiển thị mới:", user?.displayName || "");
    if (!newName || !user) return;
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: newName });
        await auth.currentUser.reload();
        setUser(auth.currentUser);
        alert("✅ Tên hiển thị đã được cập nhật!");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi đổi tên: " + err.message);
    }
  };

  if (user === null) return null;

  return (
    <div className="page">
      {uploading && (
        <div className={`uploading-banner`} id="uploadBanner">
          🔄 Đang cập nhật ảnh đại diện... Vui lòng đợi hoàn tất.
        </div>
      )}
      <div className="header" style={{ width: "80%", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1>Xin chào, {user?.displayName || user?.email || "Người dùng"} 👋</h1>
          <p style={{ opacity: 0.7 }}>Thống kê kế hoạch học tập của bạn 📚</p>
        </div>
        <div style={{ position: "relative" }} onMouseEnter={() => setShowMenu(true)} onMouseLeave={() => setShowMenu(false)}>
  <img
    src="https://cdn-icons-png.flaticon.com/512/1077/1077012.png"
    alt="avatar"
    className={`avatar ${uploading ? "updating" : ""}`}
    title="Tùy chọn tài khoản"
  />
  {showMenu && (
    <div className="dropdown">
      <label htmlFor="avatar-upload" className="dropdown-item" style={{ display: 'flex', alignItems: 'center' }}>
        🖼️ Thay đổi ảnh đại diện
      </label>
      <input
        id="avatar-upload"
        type="file"
        accept="image/*"
        onChange={handleAvatarChange}
        style={{ display: "none" }}
      />
      <div className="dropdown-item" onClick={handleChangeName}>✏️ Thay đổi tên hiển thị</div>
      <div className="dropdown-item logout" onClick={handleLogout}>🚪 Đăng xuất</div>
    </div>
  )}
</div>

      </div>
<h2 style={{ 
  textAlign: "center", 
  color: "#2c3e50", 
  marginBottom: "20px", 
  fontWeight: "600",
  fontSize: "22px"
}}>
  Lên kế hoạch học tập
</h2>

<div 
  className="form" 
  style={{ 
    display: "flex", 
    gap: "12px", 
    alignItems: "center", 
    justifyContent: "center",
    marginBottom: "25px",
    flexWrap: "wrap"
  }}
>
<div className="dropdown-wrapper">
<DaySelect day={day} setDay={setDay} />
</div>



 {/* Ô nhập Môn học */}
<motion.input
  type="text"
  placeholder="Môn học..."
  value={subject}
  onChange={(e) => setSubject(e.target.value)}
  whileFocus={{ scale: 1.03, boxShadow: "0 0 0 2px #4CAF50" }}
  transition={{ type: "spring", stiffness: 300, damping: 20 }}
  style={{
    flex: 1,
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #dcdcdc",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
    fontSize: "14px",
    outline: "none",
  }}
/>

{/* Ô nhập Thời gian */}
<motion.input
  type="number"
  placeholder="Thời gian (phút)"
  value={time}
  onChange={(e) => setTime(e.target.value)}
  whileFocus={{ scale: 1.03, boxShadow: "0 0 0 2px #4CAF50" }}
  transition={{ type: "spring", stiffness: 300, damping: 20 }}
  style={{
    width: "160px",
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #dcdcdc",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
    fontSize: "14px",
    outline: "none",
  }}
/>


  <button 
    onClick={addTask} 
    style={{ 
      padding: "10px 20px", 
      borderRadius: "8px", 
      backgroundColor: "#4CAF50", 
      color: "white", 
      border: "none", 
      cursor: "pointer",
      fontWeight: "500",
      transition: "background 0.3s ease, transform 0.1s ease"
    }}
    onMouseOver={(e) => e.target.style.backgroundColor = "#43a047"}
    onMouseOut={(e) => e.target.style.backgroundColor = "#4CAF50"}
    onMouseDown={(e) => e.target.style.transform = "scale(0.97)"}
    onMouseUp={(e) => e.target.style.transform = "scale(1)"}
  >
    Thêm
  </button>
</div>


      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#f2f2f2" }}>
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
              <td style={{ textAlign: "center", border: "1px solid #ddd" }}>{t.day}</td>
              <td style={{ textAlign: "center", border: "1px solid #ddd" }}>{t.subject}</td>
              <td style={{ textAlign: "center", border: "1px solid #ddd" }}>{t.time}</td>
              <td style={{ textAlign: "center", border: "1px solid #ddd" }}>
                <button onClick={() => toggleStatus(t.id)} style={{ padding: "5px 10px", borderRadius: "5px", border: "none", cursor: "pointer", backgroundColor: t.completed ? "#4CAF50" : "#f44336", color: "white" }}>
                  {t.completed ? "Đã hoàn thành" : "Chưa hoàn thành"}
                </button>
              </td>
              <td style={{ textAlign: "center", border: "1px solid #ddd" }}>
                <button onClick={() => deleteTask(t.id)}>❌</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}