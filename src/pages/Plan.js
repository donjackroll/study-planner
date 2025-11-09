import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, storage, db } from "../firebase";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc, onSnapshot } from "firebase/firestore";

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
    const unsubAuth = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);

        // Lắng nghe document tasks real-time
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

        return () => unsubSnap(); // cleanup khi user logout hoặc component unmount
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
    if (!user?.uid) {
      alert("Không tìm thấy user. Vui lòng đăng nhập lại.");
      return;
    }
    try {
      setUploading(true);
      localStorage.setItem("uploading", "true");
      const storageRef = ref(storage, `avatars/${user.uid}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { photoURL: downloadURL });
        await auth.currentUser.reload();
        setUser({ ...auth.currentUser });
        const avatarEl = document.querySelector(".avatar");
        if (avatarEl) {
          avatarEl.classList.add("success-glow");
          setTimeout(() => avatarEl.classList.remove("success-glow"), 1000);
        }
      }
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi tải ảnh: " + err.message);
    } finally {
      setUploading(false);
      localStorage.removeItem("uploading");
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
          <img src={user?.photoURL || "https://cdn-icons-png.flaticon.com/512/1077/1077012.png"} alt="avatar" className={`avatar ${uploading ? "updating" : ""}`} title="Tùy chọn tài khoản" />
          {showMenu && (
            <div className="dropdown">
              <label htmlFor="avatar-upload" className="dropdown-item" style={{ display: 'flex', alignItems: 'center' }}>🖼️ Thay đổi ảnh đại diện</label>
              <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: "none" }} />
              <div className="dropdown-item" onClick={handleChangeName}>✏️ Thay đổi tên hiển thị</div>
              <div className="dropdown-item logout" onClick={handleLogout}>🚪 Đăng xuất</div>
            </div>
          )}
        </div>
      </div>

      <h2>Lên kế hoạch học tập</h2>
      <div className="form" style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "20px" }}>
        <select value={day} onChange={(e) => setDay(e.target.value)} style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }}>
          <option value="">Chọn thứ</option>
          <option value="Thứ 2">Thứ 2</option>
          <option value="Thứ 3">Thứ 3</option>
          <option value="Thứ 4">Thứ 4</option>
          <option value="Thứ 5">Thứ 5</option>
          <option value="Thứ 6">Thứ 6</option>
          <option value="Thứ 7">Thứ 7</option>
          <option value="Chủ nhật">Chủ nhật</option>
        </select>
        <input type="text" placeholder="Môn học..." value={subject} onChange={(e) => setSubject(e.target.value)} style={{ flex: 1, padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }} />
        <input type="number" placeholder="Thời gian (phút)" value={time} onChange={(e) => setTime(e.target.value)} style={{ width: "140px", padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }} />
        <button onClick={addTask} style={{ padding: "8px 16px", borderRadius: "6px", backgroundColor: "#4CAF50", color: "white", border: "none", cursor: "pointer" }}>Thêm</button>
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