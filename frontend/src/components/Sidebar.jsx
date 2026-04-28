import { useState, useEffect, useRef } from "react";
import { FiMoreVertical, FiMenu } from "react-icons/fi";
import axios from "axios";

export default function Sidebar({
  history,
  openWorkflow,
  sidebarOpen,
  setSidebarOpen,
  refreshHistory,
  newWorkflow,
  theme,
}) {
  const [menuIndex, setMenuIndex] = useState(null);
  const containerRef = useRef(null);

  const isDark = theme === "dark";

  // ✅ CLOSE MENU ON OUTSIDE CLICK
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setMenuIndex(null);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggleMenu = (e, i) => {
    e.stopPropagation();
    setMenuIndex(menuIndex === i ? null : i);
  };

  const deleteWorkflow = async (id, e) => {
    e.stopPropagation();
    await axios.delete(`http://127.0.0.1:8000/history/${id}`);
    refreshHistory();
    setMenuIndex(null);
  };

  const renameWorkflow = async (id, e) => {
    e.stopPropagation();
    const name = prompt("Enter new name:");
    if (!name) return;

    await axios.put(`http://127.0.0.1:8000/history/${id}`, { name });
    refreshHistory();
    setMenuIndex(null);
  };

  const shareWorkflow = (id, e) => {
    e.stopPropagation();
    const url = `${window.location.origin}?workflow=${id}`;
    navigator.clipboard.writeText(url);
    alert("🔗 Link copied!");
    setMenuIndex(null);
  };

  return (
    <div
      ref={containerRef}
      className={`${
        sidebarOpen ? "w-64" : "w-16"
      } transition-all duration-500 p-4 border-r ${
        isDark
          ? "bg-gradient-to-b from-[#020617] to-[#0f172a] text-white border-white/10"
          : "bg-gradient-to-b from-blue-100 via-purple-100 to-pink-100 text-gray-900 border-white/40"
      }`}
    >
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        {sidebarOpen && (
          <h2 className="font-bold text-lg bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            ⚡ Copilot
          </h2>
        )}

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="hover:scale-110 transition"
        >
          <FiMenu />
        </button>
      </div>

      {sidebarOpen && (
        <>
          {/* NEW WORKFLOW */}
          <button
            onClick={newWorkflow}
            className="w-full mb-6 p-3 rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-lg hover:scale-105 transition"
          >
            + New Workflow
          </button>

          <div className="mb-3 text-sm font-semibold opacity-70">
            Recent Workflows
          </div>

          {/* 🔥 IMPORTANT FIX: overflow visible for dropdown */}
          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">

            {history.map((item, i) => (
              <div key={item.id} className="relative">

                {/* ITEM */}
                <div
                  onClick={() => openWorkflow(item)}
                  className={`p-3 rounded-xl flex justify-between items-center cursor-pointer transition-all group ${
                    isDark
                      ? "bg-white/10 hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 hover:scale-[1.02]"
                      : "bg-white/70 hover:bg-gradient-to-r hover:from-blue-400 hover:to-purple-400 hover:text-white hover:scale-[1.02] shadow-md"
                  }`}
                >
                  <span className="truncate text-sm font-medium">
                    {item.workflow?.trigger}
                  </span>

                  <button
                    onClick={(e) => toggleMenu(e, i)}
                    className="opacity-60 group-hover:opacity-100 transition"
                  >
                    <FiMoreVertical />
                  </button>
                </div>

                {/* 🔥 DROPDOWN OUTSIDE ITEM BOX */}
                {menuIndex === i && (
                  <div
                    className={`absolute right-2 top-full mt-2 w-40 rounded-xl shadow-2xl z-[9999] ${
                      isDark
                        ? "bg-[#020617] border border-white/10"
                        : "bg-white border border-gray-200"
                    }`}
                  >
                    <div
                      onClick={(e) => renameWorkflow(item.id, e)}
                      className="px-4 py-2 hover:bg-blue-500 hover:text-white cursor-pointer"
                    >
                      ✏️ Rename
                    </div>

                    <div
                      onClick={(e) => deleteWorkflow(item.id, e)}
                      className="px-4 py-2 hover:bg-red-500 hover:text-white cursor-pointer"
                    >
                      🗑 Delete
                    </div>

                    <div
                      onClick={(e) => shareWorkflow(item.id, e)}
                      className="px-4 py-2 hover:bg-purple-500 hover:text-white cursor-pointer"
                    >
                      🔗 Share
                    </div>
                  </div>
                )}
              </div>
            ))}

          </div>
        </>
      )}
    </div>
  );
}