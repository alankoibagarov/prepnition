export enum InterviewStatus {
  DRAFT = "DRAFT",
  ACTIVE = "ACTIVE",
  REJECTED = "REJECTED",
  WITHDRAWN = "WITHDRAWN",
  OFFER = "OFFER",
}

export type InterviewHistory = {
  id: string;
  interviewId: string;
  userId: string;
  action: "CREATE" | "UPDATE" | "DELETE";
  changes: Record<string, { before: unknown; after: unknown }>;
  createdAt: string;
};

export type Application = {
  id: string;
  userId: string;
  position?: string | null;
  scheduledAt?: string | null;
  status: InterviewStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  history?: InterviewHistory[];
  company: {
    id: string;
    name: string;
  } | null;
  job: {
    id: string;
    title: string;
    description?: string | null;
    location?: string | null;
    salary?: string | null;
  } | null;
};

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
  history?: InterviewHistory[];
};
