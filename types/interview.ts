import type {
  ApplicationStatus,
  InterviewStatus as NestedInterviewStatus,
  InterviewType,
} from "@/generated/prisma/enums";

export type InterviewHistory = {
  id: string;
  interviewId: string;
  userId: string;
  action: "CREATE" | "UPDATE" | "DELETE";
  changes: Record<string, { before: unknown; after: unknown }>;
  createdAt: string;
};

export type ApplicationInterview = {
  id: string;
  type: InterviewType;
  title: string;
  scheduledAt?: string | null;
  status: NestedInterviewStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Application = {
  id: string;
  userId: string;
  status: ApplicationStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  history?: InterviewHistory[];
  company: {
    id: string;
    name: string;
    url: string;
  };
  job: {
    id: string;
    title: string;
    description?: string | null;
    location?: string | null;
    salary?: string | null;
  } | null;
  interviews: ApplicationInterview[] | null;
};
