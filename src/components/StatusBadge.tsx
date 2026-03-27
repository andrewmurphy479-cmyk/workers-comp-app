"use client";

import { IncidentStatus } from "@/lib/types";

const config: Record<
  IncidentStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  new: {
    label: "New",
    bg: "bg-blue-50",
    text: "text-blue-700",
    dot: "bg-blue-500",
  },
  in_progress: {
    label: "In Progress",
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },
  completed: {
    label: "Completed",
    bg: "bg-sage-50",
    text: "text-sage-700",
    dot: "bg-sage-500",
  },
};

export default function StatusBadge({ status }: { status: IncidentStatus }) {
  const c = config[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}
