"use client";
import { useState, useCallback } from "react";
import { SOURCES } from "@/lib/types";

interface CandRow { name:string; email:string; whatsapp:string; position:string; source:string; pic:string; }
interface Props { open:boolean; onClose:()=>void; onSave:(c:CandRow[])=>Promise<void>; }

const empty = (): CandRow => ({ name:"", email:"", whatsapp:"", position:"", source:"", pic:"" });

export default function AddCandidateModal({ open, onClose, onSave }: Props) {
  const [rows, setRows]     = useState<CandRow[]>([empty()]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Set<number>>(new Set());

  const addRow    = () => setRows(r => [...r, empty()]);
  const removeRow = (i: number) => setRows(r => r.filter((_,idx)=>idx!==i));
  const updateRow = (i: number, f: keyof CandRow, v: string) => {
    setRows(r => r.map((row,idx) => idx===i ? {...row,[f]:v} : row));
    setErrors(e => { const n=new Set(e); n.delete(i); return n; });
  };

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text");
    if (!text) return;
    const lines = text.trim().split("\n").filter(l => l.trim());
    setRows(lines.map(line => {
      const c = line.split("\t").map(x => x.trim());
      return { name:c[0]||"", email:c[1]||"", whatsapp:c[2]||"", position:c[3]||"", source:c[4]||"", pic:c[5]||"" };
    }));
    setErrors(new Set());
  }, []);

  const handleSave = async () => {
    const valid = rows.filter(r => r.name||r.email);
    const bad   = new Set<number>();
    valid.forEach((r,i) => { if(!r.name||!r.email) bad.add(i); });
    if (bad.size>0) { setErrors(bad); return; }
    if (!valid.length) return;
    setSaving(true);
    try { await onSave(valid); setRows([empty()]); setErrors(new Set()); onClose(); }
    finally { setSaving(false); }
  };

  if (!open) return null;

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(10,15,30,0.4)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:"white", borderRadius:16, width:"min(960px,95vw)", maxHeight:"90vh", display:"flex", flexDirection:"column", boxShadow:"0 24px 80px rgba(0,0,0,0.18)" }}>
        <div style={{ padding:"20px 24px 16px", borderBottom:"1px solid var(--border)", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <div style={{ fontSize:16, fontWeight:800 }}>Add Candidates</div>
            <div style={{ fontSize:11, color:"var(--muted)", marginTop:2, fontFamily:"var(--mono)" }}>{rows.length} row{rows.length!==1?"s":""}</div>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:20, cursor:"pointer", color:"var(--muted)" }}>×</button>
        </div>

        <div style={{ padding:"18px 24px", overflowY:"auto", flex:1 }}>
          {/* Paste zone */}
          <div tabIndex={0} onPaste={handlePaste}
            onFocus={e=>e.currentTarget.style.borderColor="var(--blue)"}
            onBlur={e=>e.currentTarget.style.borderColor="var(--border)"}
            style={{ border:"2px dashed var(--border)", borderRadius:10, padding:"20px", textAlign:"center", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:6, outline:"none" }}>
            <div style={{ fontSize:24 }}>📋</div>
            <div style={{ fontWeight:700, fontSize:14 }}>Paste directly from spreadsheet</div>
            <div style={{ fontSize:12, color:"var(--muted)" }}>Click here → <K>Ctrl</K>+<K>V</K> — rows fill in instantly</div>
          </div>

          <div style={{ fontSize:11, color:"var(--muted)", marginTop:10, padding:"9px 12px", background:"#f8fafc", borderRadius:8, borderLeft:"3px solid var(--border)", lineHeight:1.8 }}>
            <b>Column order:</b> {["Name","Email","WhatsApp","Position","Source","PIC"].map((c,i,a) => <span key={c}><K sm>{c}</K>{i<a.length-1?" · ":""}</span>)}
          </div>

          {/* Grid header */}
          <div style={{ ...grid, marginTop:18, padding:"0 2px 6px", fontSize:9, fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", color:"var(--muted)" }}>
            <span>Full Name *</span><span>Email *</span><span>WhatsApp</span><span>Position *</span><span>Source</span><span>PIC</span><span/>
          </div>

          {rows.map((row,i) => (
            <div key={i} style={{ ...grid, marginBottom:6 }}>
              <In val={row.name}     set={v=>updateRow(i,"name",v)}     ph="Full name"         err={errors.has(i)&&!row.name} />
              <In val={row.email}    set={v=>updateRow(i,"email",v)}    ph="email@company.com" err={errors.has(i)&&!row.email} type="email" />
              <In val={row.whatsapp} set={v=>updateRow(i,"whatsapp",v)} ph="08xx…" />
              <In val={row.position} set={v=>updateRow(i,"position",v)} ph="Position" />
              <select value={row.source} onChange={e=>updateRow(i,"source",e.target.value)} style={inp}>
                <option value="">— Source —</option>
                {SOURCES.map(s=><option key={s}>{s}</option>)}
              </select>
              <In val={row.pic} set={v=>updateRow(i,"pic",v)} ph="PIC name" />
              <button onClick={()=>removeRow(i)} style={{ background:"none", border:"none", color:"#cbd5e1", fontSize:18, cursor:"pointer", padding:"0 4px" }}
                onMouseOver={e=>e.currentTarget.style.color="var(--red)"}
                onMouseOut={e=>e.currentTarget.style.color="#cbd5e1"}>×</button>
            </div>
          ))}

          <button onClick={addRow} style={{ fontSize:12, padding:"7px 14px", marginTop:8, background:"var(--blue-soft)", color:"var(--blue)", border:"1px dashed var(--blue)", borderRadius:7, cursor:"pointer", fontWeight:600, fontFamily:"var(--sans)" }}>
            + Add Row
          </button>
        </div>

        <div style={{ padding:"14px 24px", borderTop:"1px solid var(--border)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontSize:11, color:"var(--muted)" }}>* required</span>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={onClose} style={btnL}>Cancel</button>
            <button onClick={handleSave} disabled={saving} style={{ ...btnP, opacity:saving?0.7:1 }}>{saving?"Saving…":"Save to Sheet"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function In({ val,set,ph,err,type }: { val:string; set:(v:string)=>void; ph:string; err?:boolean; type?:string }) {
  return <input type={type||"text"} value={val} onChange={e=>set(e.target.value)} placeholder={ph} style={{ ...inp, borderColor:err?"var(--red)":undefined }} />;
}
function K({ children, sm }: { children:React.ReactNode; sm?:boolean }) {
  return <kbd style={{ fontFamily:"var(--mono)", background:"#f1f5f9", border:"1px solid var(--border)", borderRadius:4, padding:sm?"0 4px":"1px 6px", fontSize:sm?10:11 }}>{children}</kbd>;
}

const grid: React.CSSProperties = { display:"grid", gridTemplateColumns:"1.3fr 1.5fr 1fr 1.2fr 1fr 1fr 28px", gap:6, alignItems:"center" };
const inp:  React.CSSProperties = { fontSize:12, padding:"6px 9px", border:"1px solid var(--border)", borderRadius:7, fontFamily:"var(--sans)", background:"white", outline:"none", width:"100%" };
const btnL: React.CSSProperties = { padding:"8px 16px", fontFamily:"var(--sans)", fontSize:13, fontWeight:600, background:"#f0f4f8", color:"var(--ink-2)", border:"none", borderRadius:8, cursor:"pointer" };
const btnP: React.CSSProperties = { padding:"8px 24px", fontFamily:"var(--sans)", fontSize:13, fontWeight:700, background:"var(--blue)", color:"white", border:"none", borderRadius:8, cursor:"pointer" };
