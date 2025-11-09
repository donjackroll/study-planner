import React, { useState, useEffect, useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF", "#FF4C4C", "#4CAF50", "#FF69B4"];

export default function Stats() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [selectedDay, setSelectedDay] = useState("Tổng kết");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);

        // Lấy document tasks của user hiện tại
        const userDocRef = doc(db, "tasks", u.uid);
        const unsubSnap = onSnapshot(userDocRef, (docSnap) => {
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
        setTasks([]);
      }
    });

    return () => unsubAuth();
  }, []);

  // Tổng kết data
  const totalData = useMemo(() => {
    const grouped = tasks.reduce((acc, t) => {
      // nếu muốn chỉ thống kê completed: if (!t.completed) return acc;
      if (t.subject) acc[t.subject] = (acc[t.subject] || 0) + t.time;
      return acc;
    }, {});
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [tasks]);

  const daysList = useMemo(() => {
    const set = new Set(tasks.map(t => t.day).filter(Boolean));
    return Array.from(set);
  }, [tasks]);

  const selectedData =
    selectedDay === "Tổng kết"
      ? totalData
      : tasks.filter(t => t.day === selectedDay)
             .reduce((acc, t) => {
               if (t.subject) acc[t.subject] = (acc[t.subject] || 0) + t.time;
               return acc;
             }, {});

  const selectedDataArray = selectedDay === "Tổng kết"
    ? totalData
    : Object.entries(selectedData).map(([name, value]) => ({ name, value }));

  if (!user) return <p style={{ textAlign: "center", marginTop: "40px" }}>Vui lòng đăng nhập để xem thống kê.</p>;

  return (
    <div style={{ padding: "30px 20px", textAlign: "center", fontFamily: "Inter, sans-serif" }}>
      <h1 style={{ fontSize: "28px", marginBottom: "30px", color: "#2b2d42", fontWeight: "700" }}>📊 Thống kê học tập</h1>

      {/* Dropdown */}
      <div style={{ marginBottom: "30px", position: "relative", display: "inline-block" }}>
        <motion.div
          onClick={() => setDropdownOpen(prev => !prev)}
          whileHover={{ scale: 1.03 }}
          style={{ padding: "10px 16px", borderRadius: "10px", border: "1px solid #ccc", cursor: "pointer", background: "#f8f9fa", minWidth: "160px", fontWeight: 600, userSelect: "none", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}
        >
          {selectedDay} <span style={{ transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "0.3s" }}>▼</span>
        </motion.div>

        <AnimatePresence>
          {dropdownOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              style={{ position: "absolute", top: "50px", left: 0, background: "#fff", borderRadius: "10px", overflow: "hidden", boxShadow: "0 5px 15px rgba(0,0,0,0.2)", zIndex: 10, display: "flex", flexDirection: "column", gap: "5px", padding: "10px", minWidth: "160px" }}
            >
              <motion.div whileHover={{ scale: 1.05, backgroundColor: "#e9ecef" }} onClick={() => { setSelectedDay("Tổng kết"); setDropdownOpen(false); }} style={{ padding: "8px 12px", borderRadius: "8px", cursor: "pointer", background: selectedDay === "Tổng kết" ? "#e9ecef" : "#fff", fontWeight: 500, textAlign: "center" }}>Tổng kết</motion.div>
              {daysList.map(day => (
                <motion.div key={day} whileHover={{ scale: 1.05, backgroundColor: "#e9ecef" }} onClick={() => { setSelectedDay(day); setDropdownOpen(false); }} style={{ padding: "8px 12px", borderRadius: "8px", cursor: "pointer", background: selectedDay === day ? "#e9ecef" : "#fff", fontWeight: 500, textAlign: "center" }}>{day}</motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Pie Chart */}
      {selectedDataArray.length === 0 ? <p>Chưa có dữ liệu cho {selectedDay}.</p> :
        <div style={{ display: "flex", justifyContent: "center" }}>
          <PieChart width={400} height={300}>
            <Pie data={selectedDataArray} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}p`} labelLine={false}>
              {selectedDataArray.map((entry, index) => <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />)}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>
      }
    </div>
  );
}
