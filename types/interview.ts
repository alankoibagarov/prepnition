export type InterviewStatus = "PLANNED" | "SCHEDULED" | "COMPLETED" | "CANCELLED";

export type Interview = {
  id: string;
  userId: string;
  title: string;
  company?: string | null;
  position?: string | null;
  scheduledAt?: string | null;
  status: InterviewStatus;
  notes?: string | null;
  score?: number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
};
