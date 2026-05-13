export interface Candidate {
  no: number;
  email: string;
  name: string;
  position: string;
  source: string;
  pic: string;
  scr: string;
  test: string;
  rcp: string;
  u1res: string;
  usri: string;
  offr: string;
  finalStatus: string;
  whatsapp: string;
  status: string;
}

export const STAGE_LIST = [
  "Screening CV",
  "Submitted Test",
  "Recap to User",
  "User 1 Response",
  "User Interview",
  "Offering",
] as const;

export type Stage = (typeof STAGE_LIST)[number];

export const SOURCES = [
  "Jobstreet", "LinkedIn", "Referral", "Website",
  "Glints", "Kalibrr", "Walk-in", "Other",
] as const;

export const FINAL_STATUSES = [
  "Hired", "Rejected", "Offering", "On Hold", "Withdraw",
] as const;

export const ROLES = {
  all:            { label: "All (Admin)",    stages: "all" as const,   canEdit: true  },
  recruiter:      { label: "Recruiter",      stages: ["Screening CV","Submitted Test","Recap to User"] as Stage[], canEdit: true  },
  hr_manager:     { label: "HR Manager",     stages: "all" as const,   canEdit: true  },
  interviewer:    { label: "Interviewer",    stages: ["User 1 Response","User Interview"] as Stage[], canEdit: false },
  hiring_manager: { label: "Hiring Manager", stages: ["User 1 Response","User Interview","Offering"] as Stage[], canEdit: false },
} as const;

export type RoleKey = keyof typeof ROLES;

// Column indices (0-based) — sesuaikan jika kolom beda
export const COL = {
  email:       0,  // A
  name:        1,  // B
  position:    2,  // C
  source:      3,  // D
  pic:         4,  // E
  scr:         5,  // F
  test:        16, // Q
  rcp:         24, // Y
  u1res:       28, // AC
  usri:        44, // AS
  offr:        51, // AZ
  finalStatus: 55, // BD
  whatsapp:    59, // BH
  status:      60, // BI
} as const;

export const STAGE_COL_MAP: Record<string, number> = {
  "Screening CV":    6,   // F (1-based untuk Sheets API)
  "Submitted Test":  17,  // Q
  "Recap to User":   25,  // Y
  "User 1 Response": 29,  // AC
  "User Interview":  45,  // AS
  "Offering":        52,  // AZ
};
