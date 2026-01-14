export type Stage = "Applied" | "Interview" | "Offer" | "Rejected" | "Ghosted";

export type WorkMode = "Remote" | "Hybrid" | "On-site";

export type Priority = "Low" | "Medium" | "High";

export type AppStatus = "Active" | "Closed";

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  location: string;
  workMode: WorkMode;
  stage: Stage;
  status: AppStatus;
  priority: Priority;
  salaryMin?: number;
  salaryMax?: number;
  appliedAt: string;
  lastTouchAt: string;
  nextStep?: string;
  notes?: string;
  link?: string;
  tags?: string[];
}
