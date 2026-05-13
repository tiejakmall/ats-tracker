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

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
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

export const FINAL_STATUSES = ["Hired", "Rejected", "Offering", "On Hold", "Withdraw"] as const;

export const ROLES = {
  all:            { label: "All (Admin)",    stages: "all" as const,   canEdit: true  },
  recruiter:      { label: "Recruiter",      stages: ["Screening CV","Submitted Test","Recap to User"] as Stage[], canEdit: true  },
  hr_manager:     { label: "HR Manager",     stages: "all" as const,   canEdit: true  },
  interviewer:    { label: "Interviewer",    stages: ["User 1 Response","User Interview"] as Stage[], canEdit: false },
  hiring_manager: { label: "Hiring Manager", stages: ["User 1 Response","User Interview","Offering"] as Stage[], canEdit: false },
} as const;

export type RoleKey = keyof typeof ROLES;
