import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Bell,
  Building2,
  Compass,
  KanbanSquare,
  ListChecks,
  FileText,
  Package,
  Layers,
  Users,
  Map,
  CalendarClock,
  Gauge,
  ClipboardList,
  FolderKanban,
  Briefcase,
  Clock,
  FileStack,
  Calendar,
  Link2,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
};

export type NavSection = {
  label: string;
  items: NavItem[];
};

export const NAV_SECTIONS: NavSection[] = [
  {
    label: "My focus",
    items: [
      { label: "My Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Notifications", href: "/notifications", icon: Bell, badge: 99 },
    ],
  },
  {
    label: "Firm Overview",
    items: [
      { label: "Practice Dashboard", href: "/practice-dashboard", icon: Gauge },
      { label: "Helicopter view", href: "/helicopter-view", icon: Compass },
    ],
  },
  {
    label: "Deals",
    items: [
      { label: "Pipeline", href: "/deals", icon: KanbanSquare },
      { label: "Deals", href: "/deals?view=table", icon: ListChecks },
    ],
  },
  {
    label: "Proposals",
    items: [
      { label: "Overview", href: "/proposals", icon: FileText },
      { label: "Proposals", href: "/proposals/list", icon: FileStack },
      { label: "Services", href: "/services", icon: Package },
      { label: "Services Package", href: "/services-package", icon: Layers },
    ],
  },
  {
    label: "Clients",
    items: [
      { label: "Clients Management", href: "/clients", icon: Users },
      { label: "Relationship Map", href: "/clients/relationship-map", icon: Map },
    ],
  },
  {
    label: "Deliver",
    items: [
      { label: "Staff Scheduler & Capacity", href: "/deliver/scheduler", icon: CalendarClock },
      { label: "Capacity & Workload Planner", href: "/deliver/capacity", icon: Gauge },
      { label: "Work Management", href: "/deliver/work-management", icon: ClipboardList },
      { label: "Project Dashboard", href: "/deliver/projects", icon: FolderKanban },
      { label: "Job Management", href: "/deliver/jobs", icon: Briefcase },
      { label: "Time tracker", href: "/deliver/time-tracker", icon: Clock },
      { label: "Docs", href: "/deliver/docs", icon: FileStack },
    ],
  },
  {
    label: "Scheduling",
    items: [
      { label: "Calendar", href: "/scheduling/calendar", icon: Calendar },
      { label: "Booking Links", href: "/scheduling/booking-links", icon: Link2 },
    ],
  },
];

export { Building2 };
