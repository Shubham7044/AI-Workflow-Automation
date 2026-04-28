import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./components/Sidebar";
import GraphBuilder from "./components/GraphBuilder";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function App() {
  const [input, setInput] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [theme, setTheme] = useState("dark");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);

  const [liveSteps, setLiveSteps] = useState([]);

  // 🔥 FIX: typing state to prevent clearing history click
  const [isTyping, setIsTyping] = useState(false);

  const isDark = theme === "dark";

  // TAB TITLE
  useEffect(() => {
    document.title = "AI Workflow Builder ⚡";
  }, []);

  // 🔥 FIX: only clear when USER types
  useEffect(() => {
    if (isTyping) {
      setResult(null);
      setLiveSteps([]);
    }
  }, [input]);

  // LOAD HISTORY
  const loadHistory = async () => {
    try {
      const res = await axios.get(`${API}/history`);
      setHistory(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  // LOAD FROM SHARE LINK
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const workflowId = params.get("workflow");

    if (!workflowId) return;

    const fetchWorkflow = async () => {
      try {
        const res = await axios.get(`${API}/history`);
        const found = res.data.find((w) => w.id === workflowId);

        if (found) {
          setIsTyping(false); // 🔥 IMPORTANT

          setResult({
            workflow: found.workflow,
            execution: found.execution,
          });

          setInput(found.context?.input || "");
          setEmail(found.context?.email || "");
          setPhone(found.context?.phone || "");
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchWorkflow();
  }, []);

  // RUN WORKFLOW
  const runWorkflow = async () => {
    if (!input.trim()) return alert("Enter workflow");

    try {
      setLoading(true);

      const res = await axios.post(`${API}/run`, {
        input,
        email,
        phone,
      });

      setResult(res.data);
      loadHistory();
      setLiveSteps([]);

      // 🔥 LIVE EXECUTION ANIMATION
      res.data.execution.steps.forEach((step, index) => {
        setTimeout(() => {
          setLiveSteps((prev) => [...prev, step]);
        }, index * 700);
      });

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // OPEN FROM SIDEBAR
  const openWorkflow = (item) => {
    setIsTyping(false); // 🔥 CRITICAL FIX

    setResult({
      workflow: item.workflow,
      execution: item.execution,
    });

    setInput(item.context?.input || "");
    setEmail(item.context?.email || "");
    setPhone(item.context?.phone || "");

    setLiveSteps([]);
  };

  const newWorkflow = () => {
    setIsTyping(false);

    setInput("");
    setEmail("");
    setPhone("");
    setResult(null);
    setLiveSteps([]);

    window.history.pushState({}, "", "/");
  };

  // 🎨 STYLES
  const bg = isDark
    ? "bg-[#020617] text-white"
    : "bg-gradient-to-br from-[#eef2ff] via-[#f5f3ff] to-[#ffe4e6] text-gray-900";

  const card = isDark
    ? "bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg"
    : "bg-white backdrop-blur-xl border border-gray-200 shadow-2xl";

  const inputStyle = isDark
    ? "bg-[#020617] border border-white/10 text-white placeholder-gray-400"
    : "bg-white border border-gray-300 text-gray-900 placeholder-gray-500 shadow-sm";

  return (
    <div className={`flex min-h-screen ${bg}`}>

      <Sidebar
        history={history}
        openWorkflow={openWorkflow}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        newWorkflow={newWorkflow}
        refreshHistory={loadHistory}
        theme={theme}
      />

      <div className="flex-1 p-6 space-y-6">

        {/* HEADER */}
        <div className="flex justify-center relative">

          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            ⚡ AI Workflow Builder
          </h1>

          <div className="absolute right-0">
            <div className="flex bg-white/20 backdrop-blur-xl rounded-full p-1 shadow-inner">

              <button
                onClick={() => setTheme("light")}
                className={`px-4 py-1 rounded-full ${
                  !isDark ? "bg-white text-black shadow" : "text-white opacity-70"
                }`}
              >
                ☀
              </button>

              <button
                onClick={() => setTheme("dark")}
                className={`px-4 py-1 rounded-full ${
                  isDark
                    ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow"
                    : "text-gray-700 opacity-70"
                }`}
              >
                🌙
              </button>

            </div>
          </div>
        </div>

        {/* INPUT */}
        <div className={`${card} p-6 rounded-2xl flex gap-3 flex-wrap justify-center`}>

          <input
            value={input}
            onChange={(e) => {
              setIsTyping(true); // 🔥 FIX
              setInput(e.target.value);
            }}
            placeholder="Describe your workflow..."
            className={`px-4 py-3 rounded-xl w-[300px] ${inputStyle}`}
          />

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className={`px-4 py-3 rounded-xl ${inputStyle}`}
          />

          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone (+91...)"
            className={`px-4 py-3 rounded-xl ${inputStyle}`}
          />

          {/* 🚀 MODERN RUN BUTTON */}
          <button
            onClick={runWorkflow}
            disabled={loading}
            className={`px-8 py-3 rounded-xl text-white font-semibold transition ${
              loading
                ? "bg-gray-400 opacity-50 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-purple-500 hover:scale-105 hover:shadow-xl"
            }`}
          >
            {loading ? "⏳ Running..." : "🚀 Run"}
          </button>
        </div>

        {/* GRAPH */}
        {result?.workflow?.actions && (
          <div className={`${card} p-4 rounded-2xl`}>
            <GraphBuilder
              workflow={result.workflow}
              execution={result.execution}
            />
          </div>
        )}

        {/* EXECUTION PANEL (UNCHANGED - already perfect) */}
        {(liveSteps.length > 0 || result?.execution?.steps) && (
          <div className={`${card} p-8 rounded-3xl relative overflow-hidden`}>

            {!isDark && (
              <div className="absolute inset-0 bg-gradient-to-r from-blue-200/20 via-purple-200/20 to-pink-200/20 blur-2xl opacity-40"></div>
            )}

            <div className="relative z-10">

              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">⚡ Live Execution</h2>
                <div className="px-4 py-1 text-xs rounded-full bg-green-500 text-white shadow">
                  Running
                </div>
              </div>

              <div className="relative flex flex-col gap-6 pl-12">

                <div className="absolute left-5 top-0 bottom-0 w-[3px] bg-gradient-to-b from-purple-500 via-blue-500 to-transparent opacity-40 rounded-full" />

                {(liveSteps.length > 0 ? liveSteps : result.execution.steps).map((step, i) => {
                  const isActive = i === liveSteps.length - 1;

                  return (
                    <div key={i} className="flex items-start gap-6">

                      <div className="relative">
                        {isActive && (
                          <div className="absolute inset-0 rounded-full bg-purple-500 blur-md opacity-40 animate-pulse" />
                        )}

                        <div className="w-10 h-10 flex items-center justify-center rounded-full text-white bg-gradient-to-r from-green-500 to-emerald-500 shadow">
                          ✔
                        </div>
                      </div>

                      <div
                        className={`flex-1 p-5 rounded-xl border transition-all duration-300 hover:scale-[1.01] hover:shadow-lg ${
                          isActive
                            ? "bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-400/40 shadow-xl"
                            : isDark
                            ? "bg-white/5 border-white/10"
                            : "bg-white border-gray-200 shadow-md"
                        }`}
                      >

                        <div className="flex justify-between">
                          <span className="font-semibold capitalize">
                            {step.action.replace("_", " ")}
                          </span>

                          <span className="text-xs opacity-70">
                            {step.status}
                          </span>
                        </div>

                        <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              isActive
                                ? "bg-gradient-to-r from-purple-500 to-blue-500 animate-pulse"
                                : "bg-green-500"
                            }`}
                          />
                        </div>

                        {isActive && (
                          <p className="text-xs mt-2 text-purple-400 animate-pulse">
                            Processing...
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {result?.execution?.timestamp && (
                <div className="mt-8 pt-4 border-t border-gray-200 text-xs opacity-50">
                  {result.execution.timestamp}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}