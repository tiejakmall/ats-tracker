"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import Sidebar from "@/components/Sidebar";
import FilterBar from "@/components/FilterBar";
import BulkBar from "@/components/BulkBar";
import CandidateTable from "@/components/CandidateTable";
import AddCandidateModal from "@/components/modals/AddCandidateModal";
import EmailModal from "@/components/modals/EmailModal";
import { type Candidate, type RoleKey, ROLES } from "@/lib/types";

function Toast({ msg }: { msg: string }) {
  if (!msg) return null;
  return (
    <div style={{ position:"fixed", bottom:24, right:24, zIndex:9999, background:"#1e2d45", color:"white", padding:"11px 18px", borderRadius:10, fontSize:13, fontWeight:500, boxShadow:"0 8px 24px rgba(0,0,0,0.2)", animation:"slideUp 0.25s ease" }}>
      {msg}
      <style>{`@keyframes slideUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
    </div>
  );
}

export default function DashboardPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [toast,      setToast]      = useState("");

  const [activeStage,  setActiveStage]  = useState("all");
  const [activeRole,   setActiveRole]   = useState<RoleKey>("all");
  const [filterPos,    setFilterPos]    = useState("");
  const [filterPic,    setFilterPic]    = useState("");
  const [filterFinal,  setFilterFinal]  = useState("");
  const [search,       setSearch]       = useState("");
  const [selected,     setSelected]     = useState<Set<string>>(new Set());
  const [addOpen,      setAddOpen]      = useState(false);
  const [emailOpen,    setEmailOpen]    = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(()=>setToast(""), 3500); };

  const refresh = useCallback(async () => {
    try {
      const res  = await fetch("/api/candidates");
      const data = await res.json();
      if (data.success) setCandidates(data.data);
      else showToast("Error loading data: " + data.error);
    } catch { showToast("Failed to connect to server"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const positions = useMemo(() => Array.from(new Set(candidates.map(c=>c.position).filter(Boolean))).sort(), [candidates]);
  const pics      = useMemo(() => Array.from(new Set(candidates.map(c=>c.pic).filter(Boolean))).sort(), [candidates]);

  const role = ROLES[activeRole];

  const filtered = useMemo(() => candidates.filter(c => {
    if (search      && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterPos   && c.position    !== filterPos)   return false;
    if (filterPic   && c.pic         !== filterPic)   return false;
    if (filterFinal && c.finalStatus !== filterFinal) return false;
    if (activeStage !== "all" && c.status !== activeStage) return false;
    if (role.stages !== "all" && !(role.stages as string[]).includes(c.status)) return false;
    return true;
  }), [candidates, search, filterPos, filterPic, filterFinal, activeStage, role]);

  const stageCounts = useMemo(() => {
    const m: Record<string,number> = {};
    candidates.forEach(c => { m[c.status]=(m[c.status]||0)+1; });
    return m;
  }, [candidates]);

  const toggleSelect = (email: string) => setSelected(s => { const n=new Set(s); n.has(email)?n.delete(email):n.add(email); return n; });
  const toggleAll    = (checked: boolean) => setSelected(checked ? new Set(filtered.map(c=>c.email)) : new Set());
  const clearSel     = () => setSelected(new Set());
  const selectedCandidates = candidates.filter(c => selected.has(c.email));

  const handleUpdateStage = async (email: string, newStatus: string) => {
    // Optimistic update
    setCandidates(cs => cs.map(c => c.email===email ? {...c, status:newStatus} : c));
    try {
      await fetch("/api/update", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({email,newStatus}) });
      showToast("Stage updated ✓");
    } catch { showToast("Failed to update"); refresh(); }
  };

  const handleUpdateFinal = async (email: string, finalStatus: string) => {
    setCandidates(cs => cs.map(c => c.email===email ? {...c, finalStatus} : c));
    try {
      await fetch("/api/update", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({email,finalStatus}) });
      showToast("Final status updated ✓");
    } catch { showToast("Failed to update"); refresh(); }
  };

  const handleBulkStage = async (stage: string) => {
    const emails = Array.from(selected);
    await Promise.all(emails.map(email =>
      fetch("/api/update", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({email,newStatus:stage}) })
    ));
    showToast(`${emails.length} candidate(s) → "${stage}" ✓`);
    clearSel(); refresh();
  };

  const handleAdd = async (rows: object[]) => {
    const res  = await fetch("/api/add", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({candidates:rows}) });
    const data = await res.json();
    if (data.success) { showToast(`${data.added} candidate(s) added ✓`); refresh(); }
    else showToast("Error: " + data.error);
  };

  const handleEmail = async (subject: string, body: string) => {
    const recipients = selectedCandidates.map(c => ({ email:c.email, name:c.name, position:c.position, subject, body }));
    const res  = await fetch("/api/email", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({recipients}) });
    const data = await res.json();
    if (data.success) { showToast(`Email sent to ${recipients.length} recipient(s) ✓`); clearSel(); }
    else showToast("Some emails failed");
  };

  return (
    <div style={{ display:"flex" }}>
      <Sidebar counts={stageCounts} total={candidates.length} activeStage={activeStage} activeRole={activeRole}
        onStageChange={s=>{setActiveStage(s);clearSel();}} onRoleChange={r=>{setActiveRole(r);clearSel();}} onAddClick={()=>setAddOpen(true)} />

      <main style={{ marginLeft:"var(--sidebar-w)", flex:1, minHeight:"100vh", display:"flex", flexDirection:"column" }}>
        <FilterBar positions={positions} pics={pics} filterPos={filterPos} filterPic={filterPic} filterFinal={filterFinal} search={search}
          onFilterPos={v=>{setFilterPos(v);clearSel();}} onFilterPic={v=>{setFilterPic(v);clearSel();}}
          onFilterFinal={v=>{setFilterFinal(v);clearSel();}} onSearch={v=>{setSearch(v);clearSel();}} />

        <BulkBar count={selected.size} onApplyStage={handleBulkStage} onEmail={()=>setEmailOpen(true)} onClear={clearSel} />

        <div style={{ padding:"18px 24px", flex:1 }}>
          {/* Stats */}
          <div style={{ display:"flex", gap:10, marginBottom:14, flexWrap:"wrap", alignItems:"center" }}>
            {[
              { val:filtered.length, label:"Shown", color:"#1a56db" },
              { val:filtered.filter(c=>!c.finalStatus||c.finalStatus==="").length, label:"In Progress", color:"#d97706" },
              { val:filtered.filter(c=>(c.finalStatus||"").toLowerCase().includes("hire")).length, label:"Hired", color:"#0e9f6e" },
            ].map(s => (
              <div key={s.label} style={{ background:"white", border:"1px solid var(--border)", borderRadius:8, padding:"8px 16px", display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ fontFamily:"var(--mono)", fontSize:22, fontWeight:700, color:s.color }}>{s.val}</div>
                <div style={{ fontSize:11, color:"var(--muted)" }}>{s.label}</div>
              </div>
            ))}
            <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:8 }}>
              {loading && <span style={{ fontSize:12, color:"var(--muted)", fontFamily:"var(--mono)" }}>Loading…</span>}
              <button onClick={refresh} style={{ padding:"7px 14px", fontSize:12, fontWeight:600, background:"white", border:"1px solid var(--border)", borderRadius:8, cursor:"pointer", fontFamily:"var(--sans)" }}>
                ↻ Refresh
              </button>
            </div>
          </div>

          <CandidateTable candidates={filtered} selected={selected} canEdit={role.canEdit}
            onToggle={toggleSelect} onToggleAll={toggleAll}
            onUpdateStage={handleUpdateStage} onUpdateFinal={handleUpdateFinal} />
        </div>
      </main>

      <AddCandidateModal open={addOpen} onClose={()=>setAddOpen(false)} onSave={handleAdd} />
      <EmailModal open={emailOpen} recipients={selectedCandidates} onClose={()=>setEmailOpen(false)} onSend={handleEmail} />
      <Toast msg={toast} />
    </div>
  );
}
