import type {
  DealPriority,
  DealStage,
  EmployeeRole,
  EmployeeStatus,
} from "@/lib/constants";

export type DealOwner = {
  id: string;
  name: string;
  avatarColor: string;
};

export type DealDTO = {
  id: string;
  title: string;
  companyName: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  valueCents: number;
  winProbability: number;
  priority: DealPriority;
  source: string;
  stage: DealStage;
  stageOrder: number;
  proposalCount: number;
  dueDate: string | null;
  ownerId: string | null;
  owner: DealOwner | null;
  createdAt: string;
};

export type SopDTO = {
  id: string;
  title: string;
  category: string;
  summary: string | null;
  content: string;
  status: "draft" | "published";
  ownerId: string | null;
  owner: DealOwner | null;
  createdAt: string;
  updatedAt: string;
};

export type EmployeeDTO = {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
  role: EmployeeRole;
  status: EmployeeStatus;
  startDate: string | null;
  managerId: string | null;
  manager: DealOwner | null;
  createdAt: string;
};

export type OnboardingTaskDTO = {
  id: string;
  userId: string;
  title: string;
  done: boolean;
  dueDate: string | null;
};
