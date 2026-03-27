"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Incident, INJURY_TYPE_LABELS } from "@/lib/types";
import { getIncident, updateIncident } from "@/lib/storage";
import StatusBadge from "@/components/StatusBadge";

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

function TimingBadge({ timing }: { timing: string }) {
  const isUrgent =
    timing.toLowerCase().includes("immediately") ||
    timing.toLowerCase().includes("within 24 hours");
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
        isUrgent
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
      {timing}
    </span>
  );
}

export default function IncidentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  useEffect(() => {
    const inc = getIncident(id);
    if (inc) {
      setIncident(inc);
      // Auto-expand the first incomplete step
      const firstIncomplete = inc.steps.find((s) => !s.completed);
      if (firstIncomplete) setExpandedStep(firstIncomplete.id);
    }
    setLoaded(true);
  }, [id]);

  function toggleStep(stepId: string) {
    if (!incident) return;

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
      {/* Back link */}
      <a
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-warm-500 hover:text-sage-600 transition-colors mb-6"
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
            <div className="flex items-center gap-3 text-sm text-warm-500">
              <span>{INJURY_TYPE_LABELS[incident.injuryType]}</span>
              <span className="text-warm-300">·</span>
              <span>
                {new Date(incident.dateOfInjury + "T00:00:00").toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span className="text-warm-300">·</span>
              <span className="capitalize">{incident.severity} severity</span>
            </div>
          </div>
          <StatusBadge status={incident.status} />
        </div>

        {/* Description */}
        <p className="text-sm text-warm-600 leading-relaxed bg-warm-50 rounded-xl p-4 mb-4">
          {incident.description}
        </p>

        {/* Progress */}
        <div className="flex items-center gap-4">
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
                className={`bg-white rounded-2xl border shadow-sm transition-all ${
                  step.completed
                    ? "border-sage-200 bg-sage-50/30"
                    : "border-warm-200"
                }`}
              >
                {/* Step header — clickable to expand */}
                <button
                  onClick={() => toggleExpand(step.id)}
                  className="w-full flex items-start gap-4 p-5 text-left"
                >
                  {/* Checkbox */}
                  <label
                    className="shrink-0 mt-0.5"
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
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-warm-400">
                        Step {index + 1}
                      </span>
                      <TimingBadge timing={step.timing} />
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
                    className={`w-5 h-5 text-warm-400 shrink-0 transition-transform ${
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

                {/* Expanded content */}
                {isExpanded && (
                  <div className="px-5 pb-5 pl-15 border-t border-warm-100">
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
                )}
              </div>
            );
          })}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Timeline summary */}
          <div className="bg-white rounded-2xl border border-warm-200 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-warm-700 uppercase tracking-wider mb-4">
              Timeline
            </h3>
            <ul className="space-y-3">
              {incident.steps
                .filter((s) => !s.completed)
                .map((step) => (
                  <li key={step.id} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-warm-300 mt-1.5 shrink-0" />
                    <div>
                      <p className="text-sm text-warm-700 font-medium leading-tight">
                        {step.title}
                      </p>
                      <p className="text-xs text-warm-500">{step.timing}</p>
                    </div>
                  </li>
                ))}
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
    </div>
  );
}
