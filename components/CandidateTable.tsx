"use client";
import { STAGE_LIST, FINAL_STATUSES, type Candidate } from "@/lib/types";

interface Props {
  candidates: Candidate[];
  selected: Set<string>;
  canEdit: boolean;
  onToggle: (email: string) => void;
  onToggleAll: (checked: boolean) => void;
  onUpdateStage: (email: string, stage: string) => void;
  onUpdateFinal: (email: string, final: string) => void;
}

export default function CandidateTable({ candidates, selected, canEdit, onToggle, onToggleAll, onUpdateStage, onUpdateFinal }: Props) {
  const allChecked = candidates.length > 0 && candidates.every(c => selected.has(c.email));

  return (
    <div style={{ background:"var(--card)", borderRadius:12, overflow:"hidden", boxShadow:"0 2px 12px rgba(10,15,30,0.07)" }}>
      <table style={{ width:"100%", borderCollapse:"collapse" }}>
        <thead>
          <tr style={{ background:"#f8fafc" }}>
            <Th w={36}><input type="checkbox" checked={allChecked} onChange={e => onToggleAll(e.target.checked)} style={{ width:15, height:15, accentColor:"var(--blue)", cursor:"pointer" }} /></Th>
            <Th>Candidate</Th>
            {["SCR","TEST","RECAP","U1 RES","INTV","OFFR"].map(h => <Th key={h} center>{h}</Th>)}
            <Th>Current Stage</Th>
            <Th>Final Status</Th>
          </tr>
        </thead>
        <tbody>
          {candidates.length === 0 ? (
            <tr><td colSpan={10} style={{ textAlign:"center", padding:"60px 20px", color:"var(--muted)" }}>
              <div style={{ fontSize:32, marginBottom:10 }}>🔍</div>
              <div style={{ fontWeight:600, fontSize:14, color:"var(--ink-2)", marginBottom:4 }}>No candidates found</div>
              <div style={{ fontSize:12 }}>Try adjusting your filters</div>
            </td></tr>
          ) : candidates.map(c => (
            <tr key={c.email} style={{ borderBottom:"1px solid #f0f4f8", background:selected.has(c.email)?"var(--blue-soft)":undefined }}>
              <td style={{ padding:"9px 0 9px 16px" }}>
                <input type="checkbox" checked={selected.has(c.email)} onChange={() => onToggle(c.email)} style={{ width:15, height:15, accentColor:"var(--blue)", cursor:"pointer" }} />
              </td>
              <td style={{ padding:"9px 8px" }}>
                <div style={{ fontWeight:700, fontSize:13, letterSpacing:"-0.01em" }}>{c.name}</div>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:2, flexWrap:"wrap" }}>
                  <span style={{ fontSize:11, color:"var(--muted)" }}>{c.position||"—"}</span>
                  {c.source && <><Dot/><span style={{ fontSize:11, color:"var(--muted)" }}>{c.source}</span></>}
                  {c.pic    && <><Dot/><span style={{ fontSize:10, fontWeight:600, background:"#f0f4f8", color:"#4a6080", borderRadius:20, padding:"1px 7px" }}>{c.pic}</span></>}
                  {c.whatsapp && c.whatsapp!=="-" && (
                    <><Dot/><a href={`https://wa.me/${waNum(c.whatsapp)}`} target="_blank" rel="noreferrer" style={{ fontSize:11, color:"#25d366", fontWeight:700, textDecoration:"none" }}>WA</a></>
                  )}
                </div>
              </td>
              {[c.scr,c.test,c.rcp,c.u1res,c.usri,c.offr].map((d,i) => (
                <td key={i} style={{ textAlign:"center", padding:"9px 6px" }}>
                  <span style={{ fontFamily:"var(--mono)", fontSize:10, borderRadius:4, padding:"2px 6px", background:d&&d!=="-"?"var(--green-soft)":"#f0f4f8", color:d&&d!=="-"?"var(--green)":"#94a3b8" }}>{d&&d!=="-"?d:"—"}</span>
                </td>
              ))}
              <td style={{ padding:"9px 6px" }}>
                {canEdit ? (
                  <select value={c.status} onChange={e => onUpdateStage(c.email, e.target.value)}
                    style={{ fontSize:11, padding:"4px 7px", border:"1px solid var(--border)", borderRadius:6, background:"white", fontFamily:"var(--sans)", maxWidth:145, cursor:"pointer", outline:"none" }}>
                    {STAGE_LIST.map(s => <option key={s}>{s}</option>)}
                  </select>
                ) : (
                  <span style={{ fontSize:11, fontWeight:600, color:"var(--muted)" }}>{c.status}</span>
                )}
              </td>
              <td style={{ padding:"9px 8px" }}>
                {canEdit ? (
                  <select value={c.finalStatus||""} onChange={e => onUpdateFinal(c.email, e.target.value)}
                    style={{ fontSize:11, padding:"4px 7px", border:"1px solid var(--border)", borderRadius:6, fontFamily:"var(--sans)", cursor:"pointer", outline:"none", background:fbg(c.finalStatus), color:fcol(c.finalStatus), fontWeight:600, maxWidth:120 }}>
                    <option value="">— Select —</option>
                    {FINAL_STATUSES.map(f => <option key={f}>{f}</option>)}
                  </select>
                ) : (
                  <FinalBadge value={c.finalStatus} />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children, center, w }: { children?: React.ReactNode; center?: boolean; w?: number }) {
  return <th style={{ padding:"10px 8px", fontSize:9, fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", color:"var(--muted)", borderBottom:"1px solid var(--border)", textAlign:center?"center":"left", whiteSpace:"nowrap", ...(w?{width:w,paddingLeft:16}:{}) }}>{children}</th>;
}
function Dot() { return <span style={{ color:"#d0d9e6", fontSize:10 }}>·</span>; }
function waNum(n: string) { let x=n.replace(/\D/g,""); if(x.startsWith("0")) x="62"+x.slice(1); return x; }
function fbg(v?: string) { if(!v) return "white"; const l=v.toLowerCase(); if(l.includes("hire")||l.includes("join")) return "var(--green-soft)"; if(l.includes("reject")) return "var(--red-soft)"; if(l.includes("offer")) return "var(--amber-soft)"; return "#f0f4f8"; }
function fcol(v?: string) { if(!v) return "var(--muted)"; const l=v.toLowerCase(); if(l.includes("hire")||l.includes("join")) return "var(--green)"; if(l.includes("reject")) return "var(--red)"; if(l.includes("offer")) return "var(--amber)"; return "#4a6080"; }
function FinalBadge({ value }: { value?: string }) {
  if (!value) return <span style={{ color:"var(--muted)", fontSize:11 }}>—</span>;
  return <span style={{ fontFamily:"var(--mono)", fontSize:10, fontWeight:600, borderRadius:20, padding:"3px 9px", background:fbg(value), color:fcol(value) }}>{value}</span>;
}
