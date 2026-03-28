/**
 * Parses a timing string like "Within 24 hours", "Within 10 days", "Immediately"
 * and calculates an actual due date from the injury date.
 */
export function calculateDeadline(
  timing: string,
  injuryDate: string
): { dueDate: Date; label: string } | null {
  const base = new Date(injuryDate + "T00:00:00");
  const lower = timing.toLowerCase();

  if (lower === "immediately") {
    return { dueDate: base, label: formatDate(base) };
  }

  // Match "within X hours"
  const hoursMatch = lower.match(/within\s+(\d+)[\s–-]*(?:\d+\s*)?hours?/);
  if (hoursMatch) {
    const hours = parseInt(hoursMatch[1]);
    const due = new Date(base.getTime() + hours * 60 * 60 * 1000);
    return { dueDate: due, label: formatDate(due) };
  }

  // Match "within X days"
  const daysMatch = lower.match(/within\s+(\d+)[\s–-]*(?:\d+\s*)?days?/);
  if (daysMatch) {
    const days = parseInt(daysMatch[1]);
    const due = new Date(base);
    due.setDate(due.getDate() + days);
    return { dueDate: due, label: formatDate(due) };
  }

  // Match "within X week(s)"
  const weeksMatch = lower.match(/within\s+(\d+)\s*weeks?/);
  if (weeksMatch) {
    const weeks = parseInt(weeksMatch[1]);
    const due = new Date(base);
    due.setDate(due.getDate() + weeks * 7);
    return { dueDate: due, label: formatDate(due) };
  }

  // "Ongoing" or unrecognized — no specific deadline
  return null;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function isOverdue(deadline: { dueDate: Date }): boolean {
  return deadline.dueDate.getTime() < Date.now();
}

export function isDueSoon(deadline: { dueDate: Date }): boolean {
  const hoursLeft =
    (deadline.dueDate.getTime() - Date.now()) / (1000 * 60 * 60);
  return hoursLeft > 0 && hoursLeft <= 48;
}
