import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function Stats() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const grouped = tasks.reduce((acc, t) => {
      acc[t.subject] = (acc[t.subject] || 0) + parseInt(t.time);
      return acc;
    }, {});
    const formatted = Object.entries(grouped).map(([subject, time]) => ({
      name: subject,
      value: time,
    }));
    setData(formatted);
  }, []);

  return (
    <div className="page">
      <h1>Thống kê thời gian học tập</h1>
      {data.length === 0 ? (
        <p>Chưa có dữ liệu kế hoạch.</p>
      ) : (
        <PieChart width={400} height={300}>
          <Pie
            data={data}
            cx={200}
            cy={150}
            labelLine={false}
            label={({ name, value }) => `${name}: ${value}p`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      )}
    </div>
  );
}
