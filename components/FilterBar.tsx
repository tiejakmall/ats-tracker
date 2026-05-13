"use client";
import { FINAL_STATUSES } from "@/lib/types";

interface Props {
  positions: string[]; pics: string[];
  filterPos: string; filterPic: string; filterFinal: string; search: string;
  onFilterPos: (v: string) => void; onFilterPic: (v: string) => void;
  onFilterFinal: (v: string) => void; onSearch: (v: string) => void;
}

export default function FilterBar({ positions, pics, filterPos, filterPic, filterFinal, search, onFilterPos, onFilterPic, onFilterFinal, onSearch }: Props) {
  return (
    <div style={{ position:"sticky", top:0, zIndex:100, background:"var(--card)", borderBottom:"1px solid var(--border)", padding:"10px 24px", display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
      <span style={{ fontSize:15, fontWeight:800, letterSpacing:"-0.02em", marginRight:8 }}>Dashboard</span>

      <Pill active={!!filterPos}>
        <span>💼</span>
        <select value={filterPos} onChange={e => onFilterPos(e.target.value)} style={sel}>
          <option value="">All Positions</option>
          {positions.map(p => <option key={p}>{p}</option>)}
        </select>
      </Pill>

      <Pill active={!!filterPic}>
        <span>👤</span>
        <select value={filterPic} onChange={e => onFilterPic(e.target.value)} style={sel}>
          <option value="">All PIC</option>
          {pics.map(p => <option key={p}>{p}</option>)}
        </select>
      </Pill>

      <Pill active={!!filterFinal}>
        <span>🏁</span>
        <select value={filterFinal} onChange={e => onFilterFinal(e.target.value)} style={sel}>
          <option value="">All Final Status</option>
          {FINAL_STATUSES.map(f => <option key={f}>{f}</option>)}
        </select>
      </Pill>

      <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:6, background:"var(--surface)", border:"1px solid var(--border)", borderRadius:20, padding:"6px 12px" }}>
        <span style={{ color:"var(--muted)", fontSize:13 }}>⌕</span>
        <input type="text" value={search} onChange={e => onSearch(e.target.value)} placeholder="Search candidate…"
          style={{ border:"none", outline:"none", background:"transparent", fontFamily:"var(--sans)", fontSize:12, width:180 }} />
      </div>
    </div>
  );
}

function Pill({ children, active }: { children: React.ReactNode; active: boolean }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 10px", border:`1px solid ${active?"var(--blue)":"var(--border)"}`, borderRadius:20, background:active?"var(--blue-soft)":"var(--card)", color:active?"var(--blue)":"var(--muted)", fontSize:12 }}>
      {children}
    </div>
  );
}

const sel: React.CSSProperties = { border:"none", outline:"none", background:"transparent", fontFamily:"var(--sans)", fontSize:12, cursor:"pointer", maxWidth:160 };
