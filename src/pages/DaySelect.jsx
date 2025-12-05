import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useRef, useEffect } from "react";

export default function DaySelect({ day, setDay }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const days = [
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
    "Chủ nhật",
  ];

  // Toggle chọn / bỏ chọn
  const toggleSelect = (d) => {
    if (day.includes(d)) {
      setDay(day.filter((x) => x !== d)); // bỏ chọn
    } else {
      setDay([...day, d]); // thêm chọn
    }
  };

  // ⭐ ĐÓNG DROPDOWN KHI CLICK RA NGOÀI
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", width: "180px" }}>
      <motion.div
        onClick={() => setOpen(!open)}
        whileTap={{ scale: 0.97 }}
        style={{
          background: "white",
          border: "1px solid #ccc",
          borderRadius: "8px",
          padding: "10px 14px",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "14px",
          color: "#333",
          boxShadow: open
            ? "0 4px 12px rgba(0,0,0,0.15)"
            : "0 2px 6px rgba(0,0,0,0.08)",
          transition: "all 0.25s ease",
          userSelect: "none",
        }}
      >
        {day.length === 0 ? "Chọn thứ" : day.join(", ")}
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25 }}
        >
          ▼
        </motion.span>
      </motion.div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "absolute",
              top: "48px",
              left: 0,
              width: "100%",
              background: "white",
              borderRadius: "8px",
              boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
              overflow: "hidden",
              zIndex: 20,
            }}
          >
            {days.map((d) => {
              const selected = day.includes(d);
              return (
                <motion.div
                  key={d}
                  onClick={() => toggleSelect(d)}
                  whileHover={{
                    backgroundColor: "#edf2ff",
                    scale: 1.02,
                    transition: { duration: 0.15 },
                  }}
                  style={{
                    padding: "10px 14px",
                    textAlign: "left",
                    fontSize: "14px",
                    color: "#333",
                    cursor: "pointer",
                    borderBottom: "1px solid #f0f0f0",
                    backgroundColor: selected ? "#e7f1ff" : "white",
                    fontWeight: selected ? "600" : "400",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  {d}

                  {selected && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      style={{ color: "#3b82f6", fontWeight: "900" }}
                    >
                      ✓
                    </motion.span>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
