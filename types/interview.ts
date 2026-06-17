export enum InterviewStatus {
  CREATED = "CREATED",
  APPLICATION = "APPLICATION",
  SCREENING = "SCREENING",
  TECHNICAL = "TECHNICAL",
  MANAGERIAL = "MANAGERIAL",
  REJECTED = "REJECTED",
  GHOSTED = "GHOSTED",
  WITHDRAWN = "WITHDRAWN",
  OFFER = "OFFER",
}

export type Interview = {
  id: string;
  userId: string;
  title: string;
  company?: string | null;
  position?: string | null;
  scheduledAt?: string | null;
  status: InterviewStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
};
