"use client";
import { STAGE_LIST } from "@/lib/types";

interface Props {
  count: number;
  onApplyStage: (stage: string) => void;
  onEmail: () => void;
  onClear: () => void;
}

export default function BulkBar({ count, onApplyStage, onEmail, onClear }: Props) {
  if (count === 0) return null;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, background:"var(--ink-2)", color:"white", padding:"9px 24px", fontSize:13 }}>
      <span><span style={{ fontFamily:"var(--mono)", fontWeight:700, color:"#fbbf24" }}>{count}</span> selected</span>
      <select defaultValue="" onChange={e => { if (e.target.value) { onApplyStage(e.target.value); e.target.value=""; } }}
        style={{ fontSize:12, padding:"5px 10px", borderRadius:6, border:"none", background:"#2e4060", color:"white", fontFamily:"var(--sans)", cursor:"pointer" }}>
        <option value="">— Move to stage —</option>
        {STAGE_LIST.map(s => <option key={s}>{s}</option>)}
      </select>
      <Btn bg="#d97706" color="#1e293b" onClick={onEmail}>✉ Send Email</Btn>
      <Btn bg="#4a6080" color="white" onClick={onClear} ml>✕ Clear</Btn>
    </div>
  );
}

function Btn({ bg, color, onClick, children, ml }: { bg:string; color:string; onClick:()=>void; children:React.ReactNode; ml?:boolean }) {
  return (
    <button onClick={onClick} style={{ fontSize:12, padding:"5px 14px", borderRadius:6, border:"none", cursor:"pointer", fontWeight:700, fontFamily:"var(--sans)", background:bg, color, ...(ml?{marginLeft:"auto"}:{}) }}>
      {children}
    </button>
  );
}
