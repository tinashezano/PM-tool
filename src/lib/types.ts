import type { DealPriority, DealStage } from "@/lib/constants";

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
