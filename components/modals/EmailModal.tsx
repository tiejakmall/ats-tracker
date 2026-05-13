"use client";
import { useState } from "react";
import type { Candidate } from "@/lib/types";

interface Props { open:boolean; recipients:Candidate[]; onClose:()=>void; onSend:(subject:string,body:string)=>Promise<void>; }

export default function EmailModal({ open, recipients, onClose, onSend }: Props) {
  const [subject, setSubject] = useState("");
  const [body,    setBody]    = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!subject.trim()||!body.trim()) return;
    setSending(true);
    try { await onSend(subject,body); setSubject(""); setBody(""); onClose(); }
    finally { setSending(false); }
  };

  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(10,15,30,0.4)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:"white", borderRadius:16, width:"min(560px,95vw)", boxShadow:"0 24px 80px rgba(0,0,0,0.18)" }}>
        <div style={{ padding:"20px 24px 16px", borderBottom:"1px solid var(--border)", display:"flex", justifyContent:"space-between" }}>
          <div style={{ fontSize:16, fontWeight:800 }}>Send Bulk Email</div>
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:20, cursor:"pointer", color:"var(--muted)" }}>×</button>
        </div>
        <div style={{ padding:"18px 24px" }}>
          <div style={{ fontSize:12, marginBottom:14, padding:"8px 12px", background:"#f8fafc", borderRadius:8, lineHeight:1.7 }}>
            <b>To:</b> <span style={{ color:"var(--muted)" }}>{recipients.map(r=>r.name).join(", ")}</span>
          </div>
          <div style={{ marginBottom:14 }}>
            <Lbl>Subject</Lbl>
            <input value={subject} onChange={e=>setSubject(e.target.value)} placeholder="e.g. Interview Invitation" style={{ ...inp, width:"100%", marginTop:4 }} />
          </div>
          <div style={{ marginBottom:8 }}>
            <Lbl>Message</Lbl>
            <textarea value={body} onChange={e=>setBody(e.target.value)} rows={7}
              placeholder={"Dear [Candidate Name],\n\nWe'd like to invite you for the [Position] role..."}
              style={{ ...inp, width:"100%", marginTop:4, resize:"vertical" }} />
          </div>
          <div style={{ fontSize:11, color:"var(--muted)", fontFamily:"var(--mono)" }}>Placeholders: [Candidate Name] · [Position]</div>
        </div>
        <div style={{ padding:"14px 24px", borderTop:"1px solid var(--border)", display:"flex", justifyContent:"flex-end", gap:8 }}>
          <button onClick={onClose} style={btnL}>Cancel</button>
          <button onClick={handleSend} disabled={sending||!subject.trim()||!body.trim()}
            style={{ padding:"8px 24px", fontFamily:"var(--sans)", fontSize:13, fontWeight:700, background:!subject.trim()||!body.trim()?"#d0d9e6":"#0e9f6e", color:"white", border:"none", borderRadius:8, cursor:"pointer", opacity:sending?0.7:1 }}>
            {sending?"Sending…":`✉ Send to ${recipients.length}`}
          </button>
        </div>
      </div>
    </div>
  );
}

function Lbl({ children }: { children:React.ReactNode }) {
  return <div style={{ fontSize:12, fontWeight:600, color:"var(--muted)" }}>{children}</div>;
}
const inp:  React.CSSProperties = { fontSize:13, padding:"8px 10px", border:"1px solid var(--border)", borderRadius:8, fontFamily:"var(--sans)", outline:"none", background:"white" };
const btnL: React.CSSProperties = { padding:"8px 16px", fontFamily:"var(--sans)", fontSize:13, fontWeight:600, background:"#f0f4f8", color:"var(--ink-2)", border:"none", borderRadius:8, cursor:"pointer" };
