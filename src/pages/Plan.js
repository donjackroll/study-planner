import React, { useState, useEffect } from "react";

export default function Plan() {
  const [tasks, setTasks] = useState([]);
  const [subject, setSubject] = useState("");
  const [time, setTime] = useState("");

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("tasks")) || [];
    setTasks(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (subject && time) {
      const newTask = { id: Date.now(), subject, time };
      setTasks([...tasks, newTask]);
      setSubject("");
      setTime("");
    }
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  return (
    <div className="page">
      <h1>Lên kế hoạch học tập</h1>
      <div className="form">
        <input
          type="text"
          placeholder="Môn học"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
        <input
          type="number"
          placeholder="Thời gian (phút)"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
        <button onClick={addTask}>Thêm</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Môn học</th>
            <th>Thời gian (phút)</th>
            <th>Xóa</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((t) => (
            <tr key={t.id}>
              <td>{t.subject}</td>
              <td>{t.time}</td>
              <td>
                <button onClick={() => deleteTask(t.id)}>❌</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
