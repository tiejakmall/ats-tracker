"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Sidebar from "@/components/Sidebar";
import FilterBar from "@/components/FilterBar";
import BulkBar from "@/components/BulkBar";
import CandidateTable from "@/components/CandidateTable";
import AddCandidateModal from "@/components/modals/AddCandidateModal";
import EmailModal from "@/components/modals/EmailModal";
import { type Candidate, type RoleKey, ROLES } from "@/lib/types";

// ── Toast ──────────────────────────────────────────────────────
function Toast({ msg }: { msg: string }) {
  if (!msg) return null;
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 9999,
      background: "#1e2d45", color: "white", padding: "11px 18px",
      borderRadius: 10, fontSize: 13, fontWeight: 500,
      boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
      animation: "slideUp 0.25s ease",
    }}>
      {msg}
      <style>{`@keyframes slideUp { from { transform: translateY(20px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }`}</style>
    </div>
  );
}

export default function DashboardPage() {
  // ── Data ──
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading]       = useState(true);
  const [toast, setToast]           = useState("");

  // ── Filters ──
  const [activeStage, setActiveStage]   = useState("all");
  const [activeRole, setActiveRole]     = useState<RoleKey>("all");
  const [filterPos, setFilterPos]       = useState("");
  const [filterPic, setFilterPic]       = useState("");
  const [filterFinal, setFilterFinal]   = useState("");
  const [search, setSearch]             = useState("");

  // ── Selection ──
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // ── Modals ──
  const [addOpen,   setAddOpen]   = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);

  // ── Toast helper ──
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  // ── Fetch ──
  const refresh = useCallback(async () => {
    try {
      const res  = await fetch("/api/candidates");
      const data = await res.json();
      if (data.success) setCandidates(data.data);
    } catch (e) {
      showToast("Failed to load candidates");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  // ── Derived filter options ──
  const positions = useMemo(() => [...new Set(candidates.map(c => c.position).filter(Boolean))].sort(), [candidates]);
  const pics      = useMemo(() => [...new Set(candidates.map(c => c.pic).filter(Boolean))].sort(), [candidates]);

  // ── Filtered candidates ──
  const role = ROLES[activeRole];

  const filtered = useMemo(() => {
    return candidates.filter(c => {
      if (search      && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterPos   && c.position    !== filterPos)   return false;
      if (filterPic   && c.pic         !== filterPic)   return false;
      if (filterFinal && c.finalStatus !== filterFinal) return false;
      if (activeStage !== "all" && c.status !== activeStage) return false;
      if (role.stages !== "all" && !(role.stages as string[]).includes(c.status)) return false;
      return true;
    });
  }, [candidates, search, filterPos, filterPic, filterFinal, activeStage, role]);

  // ── Stage counts ──
  const stageCounts = useMemo(() => {
    const c: Record<string, number> = {};
    candidates.forEach(x => { c[x.status] = (c[x.status] || 0) + 1; });
    return c;
  }, [candidates]);

  // ── Selection helpers ──
  const toggleSelect = (email: string) => {
    setSelected(s => {
      const n = new Set(s);
      n.has(email) ? n.delete(email) : n.add(email);
      return n;
    });
  };

  const toggleAll = (checked: boolean) => {
    setSelected(checked ? new Set(filtered.map(c => c.email)) : new Set());
  };

  const clearSelection = () => setSelected(new Set());

  const selectedCandidates = candidates.filter(c => selected.has(c.email));

  // ── Update stage ──
  const handleUpdateStage = async (email: string, newStatus: string) => {
    try {
      await fetch("/api/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newStatus }),
      });
      await refresh();
      showToast("Stage updated ✓");
    } catch {
      showToast("Failed to update stage");
    }
  };

  // ── Update final status ──
  const handleUpdateFinal = async (email: string, finalStatus: string) => {
    try {
      await fetch("/api/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, finalStatus }),
      });
      // Optimistic update
      setCandidates(cs => cs.map(c => c.email === email ? { ...c, finalStatus } : c));
      showToast("Final status updated ✓");
    } catch {
      showToast("Failed to update final status");
    }
  };

  // ── Bulk stage ──
  const handleBulkStage = async (stage: string) => {
    for (const email of selected) {
      await fetch("/api/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newStatus: stage }),
      });
    }
    showToast(`${selected.size} candidate(s) → "${stage}" ✓`);
    clearSelection();
    await refresh();
  };

  // ── Add candidates ──
  const handleAdd = async (rows: object[]) => {
    const res  = await fetch("/api/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidates: rows }),
    });
    const data = await res.json();
    if (data.success) { showToast(`${data.added} candidate(s) added ✓`); await refresh(); }
    else showToast("Error: " + data.error);
  };

  // ── Send email ──
  const handleEmail = async (subject: string, body: string) => {
    const recipients = selectedCandidates.map(c => ({
      email: c.email, name: c.name, position: c.position, subject, body,
    }));
    const res  = await fetch("/api/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipients }),
    });
    const data = await res.json();
    if (data.success) {
      showToast(`Email sent to ${recipients.length} recipient(s) ✓`);
      clearSelection();
    } else {
      showToast("Some emails failed to send");
    }
  };

  return (
    <div style={{ display: "flex" }}>
      {/* Sidebar */}
      <Sidebar
        counts={stageCounts}
        total={candidates.length}
        activeStage={activeStage}
        activeRole={activeRole}
        onStageChange={s => { setActiveStage(s); clearSelection(); }}
        onRoleChange={r => { setActiveRole(r); clearSelection(); }}
        onAddClick={() => setAddOpen(true)}
      />

      {/* Main */}
      <main style={{ marginLeft: "var(--sidebar-w)", flex: 1, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <FilterBar
          positions={positions}
          pics={pics}
          filterPos={filterPos}
          filterPic={filterPic}
          filterFinal={filterFinal}
          search={search}
          onFilterPos={v => { setFilterPos(v); clearSelection(); }}
          onFilterPic={v => { setFilterPic(v); clearSelection(); }}
          onFilterFinal={v => { setFilterFinal(v); clearSelection(); }}
          onSearch={v => { setSearch(v); clearSelection(); }}
        />

        <BulkBar
          count={selected.size}
          onApplyStage={handleBulkStage}
          onEmail={() => setEmailOpen(true)}
          onClear={clearSelection}
        />

        <div style={{ padding: "18px 24px", flex: 1 }}>
          {/* Stats */}
          <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
            {[
              { val: filtered.length,                                                    label: "Shown",       color: "#1a56db" },
              { val: filtered.filter(c => !c.finalStatus || c.finalStatus === "").length, label: "In Progress", color: "#d97706" },
              { val: filtered.filter(c => (c.finalStatus || "").toLowerCase().includes("hire")).length, label: "Hired", color: "#0e9f6e" },
            ].map(s => (
              <div key={s.label} style={{
                background: "white", border: "1px solid var(--border)", borderRadius: 8,
                padding: "8px 16px", display: "flex", alignItems: "center", gap: 10,
              }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: 22, fontWeight: 700, color: s.color }}>{s.val}</div>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>{s.label}</div>
              </div>
            ))}

            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
              {loading && <span style={{ fontSize: 12, color: "var(--muted)", fontFamily: "var(--mono)" }}>Loading…</span>}
              <button
                onClick={refresh}
                style={{
                  padding: "7px 14px", fontSize: 12, fontWeight: 600,
                  background: "white", border: "1px solid var(--border)",
                  borderRadius: 8, cursor: "pointer", fontFamily: "var(--sans)",
                }}
              >
                ↻ Refresh
              </button>
            </div>
          </div>

          <CandidateTable
            candidates={filtered}
            selected={selected}
            canEdit={role.canEdit}
            onToggle={toggleSelect}
            onToggleAll={toggleAll}
            onUpdateStage={handleUpdateStage}
            onUpdateFinal={handleUpdateFinal}
          />
        </div>
      </main>

      {/* Modals */}
      <AddCandidateModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSave={handleAdd}
      />
      <EmailModal
        open={emailOpen}
        recipients={selectedCandidates}
        onClose={() => setEmailOpen(false)}
        onSend={handleEmail}
      />

      <Toast msg={toast} />
    </div>
  );
}
