"use client";

import { useEffect, useState } from "react";
import { Incident, INJURY_TYPE_LABELS } from "@/lib/types";
import { loadIncidents, deleteIncident } from "@/lib/storage";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";

export default function Dashboard() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setIncidents(loadIncidents());
    setLoaded(true);
  }, []);

  function handleDelete(id: string, name: string) {
    if (!confirm(`Delete the incident for ${name}? This cannot be undone.`))
      return;
    deleteIncident(id);
    setIncidents(loadIncidents());
  }

  function completedCount(inc: Incident) {
    return inc.steps.filter((s) => s.completed).length;
  }

  if (!loaded) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-2 border-sage-300 border-t-sage-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Hero section */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-warm-900 mb-2">Dashboard</h2>
        <p className="text-warm-500">
          Manage workplace injury incidents and follow guided action plans.
        </p>
      </div>

      {/* Start new incident CTA */}
      <a
        href="/incidents/new"
        className="group flex items-center gap-4 bg-white rounded-2xl border border-warm-200 p-6 mb-8 shadow-sm hover:shadow-md hover:border-sage-300 transition-all"
      >
        <div className="w-12 h-12 rounded-xl bg-sage-500 flex items-center justify-center shadow-sm group-hover:bg-sage-600 transition-colors shrink-0">
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-base font-semibold text-warm-900 group-hover:text-sage-700 transition-colors">
            Start New Incident
          </h3>
          <p className="text-sm text-warm-500">
            Report a workplace injury and get step-by-step guidance
          </p>
        </div>
        <svg
          className="w-5 h-5 text-warm-400 ml-auto group-hover:translate-x-1 transition-transform"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m8.25 4.5 7.5 7.5-7.5 7.5"
          />
        </svg>
      </a>

      {/* Active incidents */}
      <div>
        <h3 className="text-sm font-semibold text-warm-600 uppercase tracking-wider mb-4">
          {incidents.length > 0
            ? `Active Incidents (${incidents.length})`
            : "Active Incidents"}
        </h3>

        {incidents.length === 0 ? (
          <div className="bg-white rounded-2xl border border-warm-200 shadow-sm">
            <EmptyState />
          </div>
        ) : (
          <div className="space-y-3">
            {incidents.map((inc) => (
              <div
                key={inc.id}
                className="bg-white rounded-2xl border border-warm-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <a
                  href={`/incidents/${inc.id}`}
                  className="flex items-center gap-4 p-5"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1.5">
                      <h4 className="font-semibold text-warm-900 truncate">
                        {inc.employeeName}
                      </h4>
                      <StatusBadge status={inc.status} />
                    </div>
                    <div className="flex items-center gap-4 text-sm text-warm-500">
                      <span>{INJURY_TYPE_LABELS[inc.injuryType]}</span>
                      <span className="text-warm-300">·</span>
                      <span>
                        {new Date(inc.dateOfInjury).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </span>
                      <span className="text-warm-300">·</span>
                      <span className="capitalize">{inc.severity}</span>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-warm-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-sage-500 rounded-full transition-all duration-500"
                          style={{
                            width: `${
                              inc.steps.length > 0
                                ? (completedCount(inc) / inc.steps.length) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-warm-500 whitespace-nowrap">
                        {completedCount(inc)} of {inc.steps.length} steps
                      </span>
                    </div>
                  </div>
                  <svg
                    className="w-5 h-5 text-warm-400 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m8.25 4.5 7.5 7.5-7.5 7.5"
                    />
                  </svg>
                </a>
                {/* Delete button */}
                <div className="border-t border-warm-100 px-5 py-2 flex justify-end">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete(inc.id, inc.employeeName);
                    }}
                    className="text-xs text-warm-400 hover:text-red-500 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
