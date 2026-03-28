"use client";

import { useEffect, useState, useCallback, use } from "react";
import {
  Incident,
  Severity,
  InjuryType,
  INJURY_TYPE_LABELS,
} from "@/lib/types";
import { getIncident, updateIncident } from "@/lib/storage";
import { generateWorkflow } from "@/lib/workflow-engine";
import { calculateDeadline, isOverdue, isDueSoon } from "@/lib/deadlines";
import StatusBadge from "@/components/StatusBadge";
import UndoToast from "@/components/UndoToast";

// ──────────────────────────────────────────────
// Resource Panel (sidebar)
// ──────────────────────────────────────────────
function ResourcePanel() {
  return (
    <div className="bg-white rounded-2xl border border-warm-200 shadow-sm p-6">
      <h3 className="text-sm font-semibold text-warm-700 uppercase tracking-wider mb-4">
        Arkansas Resources
      </h3>
      <ul className="space-y-3">
        {[
          {
            title: "Arkansas Workers' Compensation Commission",
            desc: "Official forms, filing, and employer requirements",
            url: "https://www.awcc.state.ar.us/",
          },
          {
            title: "Employer's First Report of Injury (Form AR-N)",
            desc: "Required filing for all workplace injuries",
            url: "https://www.awcc.state.ar.us/forms.html",
          },
          {
            title: "OSHA Injury & Illness Reporting",
            desc: "Federal reporting requirements for serious injuries",
            url: "https://www.osha.gov/report",
          },
          {
            title: "Arkansas Dept. of Labor & Licensing",
            desc: "Workplace safety regulations and guidance",
            url: "https://www.labor.arkansas.gov/",
          },
        ].map((link) => (
          <li key={link.url}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 rounded-xl bg-warm-50 hover:bg-sage-50 border border-warm-100 hover:border-sage-200 transition-colors group"
            >
              <span className="text-sm font-medium text-warm-800 group-hover:text-sage-700 transition-colors">
                {link.title}
              </span>
              <span className="flex items-center gap-1 text-xs text-warm-500 mt-0.5">
                {link.desc}
                <svg
                  className="w-3 h-3 inline-block ml-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                  />
                </svg>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ──────────────────────────────────────────────
// Timing Badge with calculated deadline
// ──────────────────────────────────────────────
function TimingBadge({
  timing,
  injuryDate,
}: {
  timing: string;
  injuryDate: string;
}) {
  const deadline = calculateDeadline(timing, injuryDate);
  const overdue = deadline ? isOverdue(deadline) : false;
  const dueSoon = deadline ? isDueSoon(deadline) : false;
  const isUrgent =
    timing.toLowerCase().includes("immediately") ||
    timing.toLowerCase().includes("within 24 hours");

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
        overdue
          ? "bg-red-100 text-red-800"
          : dueSoon
          ? "bg-amber-50 text-amber-700"
          : isUrgent
          ? "bg-red-50 text-red-700"
          : "bg-warm-100 text-warm-600"
      }`}
    >
      <svg
        className="w-3 h-3"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        />
      </svg>
      {deadline
        ? overdue
          ? `Overdue (was ${deadline.label})`
          : `Due by ${deadline.label}`
        : timing}
    </span>
  );
}

// ──────────────────────────────────────────────
// Edit Modal
// ──────────────────────────────────────────────
function EditModal({
  incident,
  onSave,
  onClose,
}: {
  incident: Incident;
  onSave: (updated: Incident) => void;
  onClose: () => void;
}) {
  const [employeeName, setEmployeeName] = useState(incident.employeeName);
  const [dateOfInjury, setDateOfInjury] = useState(incident.dateOfInjury);
  const [injuryType, setInjuryType] = useState<InjuryType>(
    incident.injuryType
  );
  const [severity, setSeverity] = useState<Severity>(incident.severity);
  const [description, setDescription] = useState(incident.description);

  const severityChanged = severity !== incident.severity;
  const injuryTypeChanged = injuryType !== incident.injuryType;

  function handleSave() {
    const needsRegeneration = severityChanged || injuryTypeChanged;

    let steps = incident.steps;
    if (needsRegeneration) {
      const newSteps = generateWorkflow({ severity, injuryType });
      // Preserve completion state for steps that still exist (matched by title)
      steps = newSteps.map((newStep) => {
        const oldStep = incident.steps.find((s) => s.title === newStep.title);
        if (oldStep) {
          return {
            ...newStep,
            completed: oldStep.completed,
            completedAt: oldStep.completedAt,
          };
        }
        return newStep;
      });
    }

    const allCompleted = steps.every((s) => s.completed);
    const anyCompleted = steps.some((s) => s.completed);

    const updated: Incident = {
      ...incident,
      employeeName: employeeName.trim(),
      dateOfInjury,
      injuryType,
      severity,
      description: description.trim(),
      steps,
      status: allCompleted
        ? "completed"
        : anyCompleted
        ? "in_progress"
        : "new",
    };

    onSave(updated);
  }

  const canSave = employeeName.trim() && dateOfInjury && description.trim().length >= 10;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-warm-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-warm-900">Edit Incident</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-warm-100 flex items-center justify-center transition-colors"
            >
              <svg
                className="w-5 h-5 text-warm-500"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-warm-700 mb-1.5">
              Employee Name
            </label>
            <input
              type="text"
              value={employeeName}
              onChange={(e) => setEmployeeName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-warm-200 bg-warm-50 text-warm-900 focus:outline-none focus:ring-2 focus:ring-sage-500/30 focus:border-sage-500 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-warm-700 mb-1.5">
              Date of Injury
            </label>
            <input
              type="date"
              value={dateOfInjury}
              onChange={(e) => setDateOfInjury(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="w-full px-4 py-2.5 rounded-xl border border-warm-200 bg-warm-50 text-warm-900 focus:outline-none focus:ring-2 focus:ring-sage-500/30 focus:border-sage-500 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-warm-700 mb-1.5">
              Injury Type
            </label>
            <select
              value={injuryType}
              onChange={(e) => setInjuryType(e.target.value as InjuryType)}
              className="w-full px-4 py-2.5 rounded-xl border border-warm-200 bg-warm-50 text-warm-900 focus:outline-none focus:ring-2 focus:ring-sage-500/30 focus:border-sage-500 transition"
            >
              {Object.entries(INJURY_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-warm-700 mb-1.5">
              Severity
            </label>
            <div className="flex gap-3">
              {(["minor", "moderate", "severe"] as Severity[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSeverity(s)}
                  className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-medium capitalize transition-all ${
                    severity === s
                      ? "border-sage-500 bg-sage-50 text-sage-800"
                      : "border-warm-200 bg-warm-50 text-warm-600 hover:border-warm-300"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            {(severityChanged || injuryTypeChanged) && (
              <p className="text-xs text-amber-600 mt-2">
                Changing severity or injury type will regenerate the action plan.
                Completed steps with matching titles will keep their status.
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-warm-700 mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-2.5 rounded-xl border border-warm-200 bg-warm-50 text-warm-900 focus:outline-none focus:ring-2 focus:ring-sage-500/30 focus:border-sage-500 transition resize-none"
            />
          </div>
        </div>

        <div className="p-6 border-t border-warm-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-warm-600 font-medium hover:bg-warm-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="px-5 py-2.5 rounded-xl bg-sage-500 text-white font-medium hover:bg-sage-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Main Page
// ──────────────────────────────────────────────
export default function IncidentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Undo toast state
  const [undoToast, setUndoToast] = useState<{
    message: string;
    previousIncident: Incident;
  } | null>(null);

  useEffect(() => {
    const inc = getIncident(id);
    if (inc) {
      setIncident(inc);
      const firstIncomplete = inc.steps.find((s) => !s.completed);
      if (firstIncomplete) setExpandedStep(firstIncomplete.id);
    }
    setLoaded(true);
  }, [id]);

  const handleUndo = useCallback(() => {
    if (!undoToast) return;
    updateIncident(undoToast.previousIncident);
    setIncident(undoToast.previousIncident);
    setUndoToast(null);
  }, [undoToast]);

  const handleDismissToast = useCallback(() => {
    setUndoToast(null);
  }, []);

  function toggleStep(stepId: string) {
    if (!incident) return;

    // Save current state for undo
    const previousIncident = { ...incident, steps: [...incident.steps] };

    const toggledStep = incident.steps.find((s) => s.id === stepId);
    const willComplete = toggledStep && !toggledStep.completed;

    const updatedSteps = incident.steps.map((s) => {
      if (s.id === stepId) {
        return {
          ...s,
          completed: !s.completed,
          completedAt: !s.completed ? new Date().toISOString() : null,
        };
      }
      return s;
    });

    const allCompleted = updatedSteps.every((s) => s.completed);
    const anyCompleted = updatedSteps.some((s) => s.completed);

    const updated: Incident = {
      ...incident,
      steps: updatedSteps,
      status: allCompleted
        ? "completed"
        : anyCompleted
        ? "in_progress"
        : "new",
    };

    updateIncident(updated);
    setIncident(updated);

    const stepTitle = toggledStep?.title || "Step";
    setUndoToast({
      message: willComplete
        ? `"${stepTitle}" marked complete`
        : `"${stepTitle}" marked incomplete`,
      previousIncident,
    });
  }

  function handleEditSave(updated: Incident) {
    updateIncident(updated);
    setIncident(updated);
    setShowEditModal(false);
  }

  function handlePrint() {
    window.print();
  }

  function toggleExpand(stepId: string) {
    setExpandedStep(expandedStep === stepId ? null : stepId);
  }

  if (!loaded) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-2 border-sage-300 border-t-sage-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-warm-700 mb-2">
          Incident not found
        </h2>
        <p className="text-warm-500 mb-6">
          This incident may have been deleted.
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sage-500 text-white font-medium hover:bg-sage-600 transition-colors"
        >
          Return to Dashboard
        </a>
      </div>
    );
  }

  const completedCount = incident.steps.filter((s) => s.completed).length;
  const progress =
    incident.steps.length > 0
      ? (completedCount / incident.steps.length) * 100
      : 0;

  return (
    <div>
      {/* Print-only styles */}
      <style>{`
        @media print {
          header, footer, .no-print { display: none !important; }
          body { background: white !important; }
          main { padding: 0 !important; max-width: 100% !important; }
          .print-expand { display: block !important; }
          .print-break { page-break-inside: avoid; }
        }
      `}</style>

      {/* Back link */}
      <a
        href="/"
        className="no-print inline-flex items-center gap-1.5 text-sm text-warm-500 hover:text-sage-600 transition-colors mb-6"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 19.5 8.25 12l7.5-7.5"
          />
        </svg>
        Back to Dashboard
      </a>

      {/* Incident header */}
      <div className="bg-white rounded-2xl border border-warm-200 shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-warm-900 mb-1">
              {incident.employeeName}
            </h2>
            <div className="flex items-center gap-3 text-sm text-warm-500 flex-wrap">
              <span>{INJURY_TYPE_LABELS[incident.injuryType]}</span>
              <span className="text-warm-300">·</span>
              <span>
                {new Date(
                  incident.dateOfInjury + "T00:00:00"
                ).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span className="text-warm-300">·</span>
              <span className="capitalize">{incident.severity} severity</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={incident.status} />
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-warm-600 leading-relaxed bg-warm-50 rounded-xl p-4 mb-4">
          {incident.description}
        </p>

        {/* Progress */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 h-2 bg-warm-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-sage-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-sm font-medium text-warm-600 whitespace-nowrap">
            {completedCount} of {incident.steps.length} complete
          </span>
        </div>

        {/* Action buttons */}
        <div className="no-print flex items-center gap-3">
          <button
            onClick={() => setShowEditModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-warm-200 text-sm font-medium text-warm-700 hover:bg-warm-50 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
              />
            </svg>
            Edit
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-warm-200 text-sm font-medium text-warm-700 hover:bg-warm-50 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z"
              />
            </svg>
            Print Action Plan
          </button>
        </div>

        {incident.status === "completed" && (
          <div className="mt-4 p-4 rounded-xl bg-sage-50 border border-sage-200 flex items-center gap-3">
            <svg
              className="w-6 h-6 text-sage-600 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
            <div>
              <p className="text-sm font-semibold text-sage-800">
                All steps completed
              </p>
              <p className="text-xs text-sage-600">
                Keep your records filed securely. You can return to this incident
                anytime.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Main content: Steps + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Steps checklist */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-sm font-semibold text-warm-600 uppercase tracking-wider mb-2">
            Action Plan
          </h3>

          {incident.steps.map((step, index) => {
            const isExpanded = expandedStep === step.id;
            return (
              <div
                key={step.id}
                className={`print-break bg-white rounded-2xl border shadow-sm transition-all ${
                  step.completed
                    ? "border-sage-200 bg-sage-50/30"
                    : "border-warm-200"
                }`}
              >
                {/* Step header */}
                <button
                  onClick={() => toggleExpand(step.id)}
                  className="w-full flex items-start gap-4 p-5 text-left"
                >
                  {/* Checkbox */}
                  <label
                    className="no-print shrink-0 mt-0.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={step.completed}
                      onChange={() => toggleStep(step.id)}
                      className="sr-only peer"
                    />
                    <div
                      className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all ${
                        step.completed
                          ? "bg-sage-500 border-sage-500"
                          : "border-warm-300 hover:border-sage-400"
                      }`}
                    >
                      {step.completed && (
                        <svg
                          className="w-3.5 h-3.5 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={3}
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m4.5 12.75 6 6 9-13.5"
                          />
                        </svg>
                      )}
                    </div>
                  </label>

                  {/* Step info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-medium text-warm-400">
                        Step {index + 1}
                      </span>
                      <TimingBadge
                        timing={step.timing}
                        injuryDate={incident.dateOfInjury}
                      />
                    </div>
                    <h4
                      className={`font-semibold transition-colors ${
                        step.completed
                          ? "text-warm-500 line-through"
                          : "text-warm-900"
                      }`}
                    >
                      {step.title}
                    </h4>
                    {step.completed && step.completedAt && (
                      <p className="text-xs text-sage-600 mt-1">
                        Completed{" "}
                        {new Date(step.completedAt).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                  </div>

                  {/* Expand indicator */}
                  <svg
                    className={`no-print w-5 h-5 text-warm-400 shrink-0 transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m19.5 8.25-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </button>

                {/* Expanded content — always visible in print */}
                <div
                  className={`px-5 pb-5 pl-15 border-t border-warm-100 ${
                    isExpanded ? "" : "hidden print-expand"
                  }`}
                >
                  <div className="pt-4 pl-10 space-y-4">
                    <p className="text-sm text-warm-700 leading-relaxed">
                      {step.description}
                    </p>
                    <div className="p-3 rounded-lg bg-sage-50 border border-sage-100">
                      <p className="text-xs font-semibold text-sage-700 mb-1">
                        Why this matters
                      </p>
                      <p className="text-sm text-sage-800 leading-relaxed">
                        {step.whyItMatters}
                      </p>
                    </div>
                    {step.officialLink && (
                      <a
                        href={step.officialLink.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-sage-600 hover:text-sage-700 font-medium"
                      >
                        {step.officialLink.label}
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                          />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Timeline summary with deadlines */}
          <div className="bg-white rounded-2xl border border-warm-200 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-warm-700 uppercase tracking-wider mb-4">
              Timeline
            </h3>
            <ul className="space-y-3">
              {incident.steps
                .filter((s) => !s.completed)
                .map((step) => {
                  const deadline = calculateDeadline(
                    step.timing,
                    incident.dateOfInjury
                  );
                  const overdue = deadline ? isOverdue(deadline) : false;
                  return (
                    <li key={step.id} className="flex items-start gap-3">
                      <div
                        className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                          overdue ? "bg-red-500" : "bg-warm-300"
                        }`}
                      />
                      <div>
                        <p className="text-sm text-warm-700 font-medium leading-tight">
                          {step.title}
                        </p>
                        <p
                          className={`text-xs ${
                            overdue ? "text-red-600 font-medium" : "text-warm-500"
                          }`}
                        >
                          {deadline
                            ? overdue
                              ? `Overdue — was due ${deadline.label}`
                              : `Due by ${deadline.label}`
                            : step.timing}
                        </p>
                      </div>
                    </li>
                  );
                })}
              {incident.steps.filter((s) => !s.completed).length === 0 && (
                <li className="text-sm text-sage-600 font-medium">
                  All tasks completed!
                </li>
              )}
            </ul>
          </div>

          {/* Disclaimer */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-amber-600 shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                />
              </svg>
              <div>
                <p className="text-sm font-semibold text-amber-800 mb-1">
                  Important
                </p>
                <p className="text-xs text-amber-700 leading-relaxed">
                  This tool provides general guidance and is not legal advice.
                  Workers&apos; comp laws vary by situation. Consult a qualified
                  attorney for legal questions.
                </p>
              </div>
            </div>
          </div>

          {/* Resources */}
          <ResourcePanel />
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <EditModal
          incident={incident}
          onSave={handleEditSave}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {/* Undo Toast */}
      {undoToast && (
        <UndoToast
          message={undoToast.message}
          onUndo={handleUndo}
          onDismiss={handleDismissToast}
        />
      )}
    </div>
  );
}
