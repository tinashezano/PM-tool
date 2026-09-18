export type DealStage =
  | "new_enquiry"
  | "discovery_booked"
  | "discovery_completed"
  | "proposal_required"
  | "proposal_sent"
  | "onboarding"
  | "won"
  | "lost";

export const DEAL_STAGES: { id: DealStage; label: string }[] = [
  { id: "new_enquiry", label: "New Enquiry" },
  { id: "discovery_booked", label: "Discovery Booked" },
  { id: "discovery_completed", label: "Discovery Completed" },
  { id: "proposal_required", label: "Proposal Required" },
  { id: "proposal_sent", label: "Proposal Sent" },
  { id: "onboarding", label: "Onboarding" },
];

export type DealPriority = "low" | "medium" | "high";

export const DEAL_PRIORITIES: { id: DealPriority; label: string }[] = [
  { id: "low", label: "Low" },
  { id: "medium", label: "Medium" },
  { id: "high", label: "High" },
];

export type DealSource =
  | "website_form"
  | "referral"
  | "inbound_call"
  | "manual"
  | "other";

export const DEAL_SOURCES: { id: DealSource; label: string }[] = [
  { id: "website_form", label: "Website form" },
  { id: "referral", label: "Referral" },
  { id: "inbound_call", label: "Inbound call" },
  { id: "manual", label: "Manual" },
  { id: "other", label: "Other" },
];

export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function formatDate(date: string | Date | null | undefined): string | null {
  if (!date) return null;
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-AU", { day: "2-digit", month: "short", year: "numeric" }).format(d);
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}
