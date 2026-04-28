import { useEffect, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";

export default function GraphBuilder({ workflow, execution }) {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [rfKey, setRfKey] = useState(0);

  useEffect(() => {
    if (!workflow?.actions?.length) return;

    const newNodes = [];
    const newEdges = [];

    const centerX = 300;
    const startY = 80;
    const gapY = 140;

    // 🔥 TRIGGER NODE
    newNodes.push({
      id: "trigger",
      position: { x: centerX, y: startY },
      data: { label: `⚡ ${workflow.trigger}` },
      style: nodeStyle("trigger"),
    });

    workflow.actions.forEach((action, i) => {
      const step = execution?.steps?.[i];
      const status = step?.status || "default";

      const id = `node-${i}`;

      newNodes.push({
        id,
        position: {
          x: centerX,
          y: startY + (i + 1) * gapY,
        },
        data: {
          label: `${getIcon(action.type)} ${formatLabel(action.type)}`,
        },
        style: nodeStyle(status),
      });

      newEdges.push({
        id: `edge-${i}`,
        source: i === 0 ? "trigger" : `node-${i - 1}`,
        target: id,
        animated: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
        style: {
          stroke: "#a855f7",
          strokeWidth: 2,
        },
      });
    });

    setNodes(newNodes);
    setEdges(newEdges);
    setRfKey((prev) => prev + 1);
  }, [workflow, execution]);

  return (
    <div className="h-[520px] rounded-2xl overflow-hidden border border-white/10">
      <ReactFlow
        key={rfKey}
        nodes={nodes}
        edges={edges}
        fitView
      >
        <Background gap={20} size={1} color="#888" />
        <Controls />
      </ReactFlow>
    </div>
  );
}

//
// 🎨 NODE STYLE (SaaS Look)
//
function nodeStyle(status) {
  let gradient = "from-purple-500 to-blue-500";

  if (status === "sent" || status === "done" || status === "success") {
    gradient = "from-green-500 to-emerald-400";
  }

  if (status === "failed" || status === "error") {
    gradient = "from-red-500 to-pink-500";
  }

  if (status === "skipped") {
    gradient = "from-yellow-400 to-orange-400";
  }

  if (status === "trigger") {
    gradient = "from-indigo-500 to-purple-600";
  }

  return {
    padding: 14,
    borderRadius: 16,
    minWidth: 200,
    textAlign: "center",
    color: "white",
    fontWeight: "500",
    background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
    backgroundImage: `linear-gradient(135deg, ${
      gradient.includes("green")
        ? "#22c55e, #4ade80"
        : gradient.includes("red")
        ? "#ef4444, #ec4899"
        : gradient.includes("yellow")
        ? "#facc15, #fb923c"
        : gradient.includes("indigo")
        ? "#6366f1, #9333ea"
        : "#a855f7, #3b82f6"
    })`,
    boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
    transition: "all 0.3s ease",
  };
}

//
// 🔥 ICONS
//
function getIcon(type) {
  const map = {
    send_email: "📧",
    send_whatsapp: "📱",
    create_customer: "👤",
    send_invoice: "🧾",
    notify_admin: "🚨",
    retry_payment: "🔁",
    log_event: "📝",
  };

  return map[type] || "⚙️";
}

//
// ✨ FORMAT LABEL
//
function formatLabel(text) {
  return text.replaceAll("_", " ");
}