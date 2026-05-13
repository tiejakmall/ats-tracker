"use client";

import { STAGE_LIST, ROLES, type RoleKey, type Stage } from "@/lib/types";

interface Props {
  counts: Record<string, number>;
  total: number;
  activeStage: string;
  activeRole: RoleKey;
  onStageChange: (s: string) => void;
  onRoleChange: (r: RoleKey) => void;
  onAddClick: () => void;
}

export default function Sidebar({
  counts, total, activeStage, activeRole,
  onStageChange, onRoleChange, onAddClick,
}: Props) {
  const stages: Array<{ key: string; label: string }> = [
    { key: "all", label: "All Stages" },
    ...STAGE_LIST.map(s => ({ key: s, label: s })),
  ];

  return (
    <aside style={{
      position: "fixed", top: 0, left: 0,
      width: "var(--sidebar-w)", height: "100vh",
      background: "var(--ink)", display: "flex",
      flexDirection: "column", zIndex: 200, overflowY: "auto",
    }}>
      {/* Logo */}
      <div style={{ padding: "20px 18px 16px", borderBottom: "1px solid #1e2d45" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "#4a6080", letterSpacing: "0.15em", textTransform: "uppercase" }}>
          TalentTrack
        </div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#f0f6ff", marginTop: 3, letterSpacing: "-0.02em" }}>
          ATS <span style={{ color: "#4d8af0" }}>›26</span>
        </div>
      </div>

      {/* Role selector */}
      <div style={{ padding: "14px 14px 10px" }}>
        <Label>Viewing as</Label>
        <select
          value={activeRole}
          onChange={e => onRoleChange(e.target.value as RoleKey)}
          style={{
            width: "100%", padding: "7px 10px", marginTop: 4,
            fontFamily: "var(--sans)", fontSize: 12, fontWeight: 500,
            background: "#1e2d45", color: "#a8c0dc",
            border: "1px solid #2e4060", borderRadius: 8, cursor: "pointer", outline: "none",
          }}
        >
          {Object.entries(ROLES).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      <Divider />

      {/* Stage nav */}
      <div>
        <div style={{ padding: "10px 18px 6px" }}><Label>Current Stage</Label></div>
        {stages.map(({ key, label }) => {
          const count = key === "all" ? total : (counts[key] ?? 0);
          const active = activeStage === key;
          return (
            <button
              key={key}
              onClick={() => onStageChange(key)}
              style={{
                width: "100%", display: "flex", alignItems: "center",
                gap: 8, padding: "8px 18px", border: "none",
                borderLeft: `3px solid ${active ? "#4d8af0" : "transparent"}`,
                background: active ? "#0f1e38" : "transparent",
                color: active ? "#90b4f5" : "#5a7a9a",
                fontFamily: "var(--sans)", fontSize: 12.5, fontWeight: active ? 600 : 400,
                cursor: "pointer", textAlign: "left",
              }}
            >
              <span style={{ flex: 1 }}>{key === "all" ? "📋 " + label : label}</span>
              <span style={{
                fontFamily: "var(--mono)", fontSize: 10,
                background: active ? "#1a3a6e" : "#1e2d45",
                color: active ? "#90b4f5" : "#4a6080",
                borderRadius: 20, padding: "1px 7px", minWidth: 24, textAlign: "center",
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <Divider />

      {/* Add button */}
      <div style={{ padding: "4px 14px 16px" }}>
        <button
          onClick={onAddClick}
          style={{
            width: "100%", padding: "10px", fontFamily: "var(--sans)",
            fontSize: 13, fontWeight: 700, background: "#1a56db",
            color: "white", border: "none", borderRadius: 8, cursor: "pointer",
          }}
          onMouseOver={e => (e.currentTarget.style.background = "#1447c0")}
          onMouseOut={e  => (e.currentTarget.style.background = "#1a56db")}
        >
          + Add Candidate
        </button>
      </div>
    </aside>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: "var(--mono)", fontSize: 9, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "#3a5570" }}>
      {children}
    </div>
  );
}

function Divider() {
  return <div style={{ borderTop: "1px solid #1a2a3e", margin: "6px 0" }} />;
}
