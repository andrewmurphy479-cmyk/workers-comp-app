"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Severity,
  InjuryType,
  Incident,
  INJURY_TYPE_LABELS,
} from "@/lib/types";
import { createIncident } from "@/lib/storage";
import { generateWorkflow } from "@/lib/workflow-engine";

type FormStep = 1 | 2 | 3;

export default function NewIncidentPage() {
  const router = useRouter();
  const [step, setStep] = useState<FormStep>(1);

  // Form state
  const [employeeName, setEmployeeName] = useState("");
  const [dateOfInjury, setDateOfInjury] = useState("");
  const [injuryType, setInjuryType] = useState<InjuryType | "">("");
  const [severity, setSeverity] = useState<Severity | "">("");
  const [description, setDescription] = useState("");

  function canProceedStep1() {
    return employeeName.trim() && dateOfInjury;
  }

  function canProceedStep2() {
    return injuryType && severity;
  }

  function canSubmit() {
    return description.trim().length >= 10;
  }

  function handleSubmit() {
    if (!canProceedStep1() || !canProceedStep2() || !canSubmit()) return;

    const steps = generateWorkflow({
      severity: severity as Severity,
      injuryType: injuryType as InjuryType,
    });

    const incident: Incident = {
      id: crypto.randomUUID(),
      employeeName: employeeName.trim(),
      dateOfInjury,
      injuryType: injuryType as InjuryType,
      severity: severity as Severity,
      description: description.trim(),
      steps,
      status: "new",
      createdAt: new Date().toISOString(),
    };

    createIncident(incident);
    router.push(`/incidents/${incident.id}`);
  }

  const severityOptions: { value: Severity; label: string; desc: string }[] = [
    {
      value: "minor",
      label: "Minor",
      desc: "First aid only, no lost work time expected",
    },
    {
      value: "moderate",
      label: "Moderate",
      desc: "Medical treatment needed, possible lost work time",
    },
    {
      value: "severe",
      label: "Severe",
      desc: "Emergency care, hospitalization, or serious injury",
    },
  ];

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

      <div className="max-w-2xl mx-auto">
        {/* Progress indicator */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  s <= step
                    ? "bg-sage-500 text-white"
                    : "bg-warm-200 text-warm-500"
                }`}
              >
                {s < step ? (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m4.5 12.75 6 6 9-13.5"
                    />
                  </svg>
                ) : (
                  s
                )}
              </div>
              {s < 3 && (
                <div
                  className={`flex-1 h-0.5 rounded ${
                    s < step ? "bg-sage-400" : "bg-warm-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-warm-200 shadow-sm p-8">
          {/* Step 1: Who & When */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-warm-900 mb-1">
                Who was injured?
              </h2>
              <p className="text-sm text-warm-500 mb-8">
                Let&apos;s start with the basic details about the incident.
              </p>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-warm-700 mb-2">
                    Employee Name
                  </label>
                  <input
                    type="text"
                    value={employeeName}
                    onChange={(e) => setEmployeeName(e.target.value)}
                    placeholder="Full name of the injured employee"
                    className="w-full px-4 py-3 rounded-xl border border-warm-200 bg-warm-50 text-warm-900 placeholder:text-warm-400 focus:outline-none focus:ring-2 focus:ring-sage-500/30 focus:border-sage-500 transition"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-warm-700 mb-2">
                    Date of Injury
                  </label>
                  <input
                    type="date"
                    value={dateOfInjury}
                    onChange={(e) => setDateOfInjury(e.target.value)}
                    max={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-3 rounded-xl border border-warm-200 bg-warm-50 text-warm-900 focus:outline-none focus:ring-2 focus:ring-sage-500/30 focus:border-sage-500 transition"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  disabled={!canProceedStep1()}
                  className="px-6 py-3 rounded-xl bg-sage-500 text-white font-medium hover:bg-sage-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Injury type & Severity */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold text-warm-900 mb-1">
                What happened?
              </h2>
              <p className="text-sm text-warm-500 mb-8">
                This helps us generate the right action plan for you.
              </p>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-warm-700 mb-2">
                    Type of Injury
                  </label>
                  <select
                    value={injuryType}
                    onChange={(e) =>
                      setInjuryType(e.target.value as InjuryType)
                    }
                    className="w-full px-4 py-3 rounded-xl border border-warm-200 bg-warm-50 text-warm-900 focus:outline-none focus:ring-2 focus:ring-sage-500/30 focus:border-sage-500 transition"
                  >
                    <option value="">Select injury type...</option>
                    {Object.entries(INJURY_TYPE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-warm-700 mb-3">
                    Severity Level
                  </label>
                  <div className="space-y-3">
                    {severityOptions.map((opt) => (
                      <label
                        key={opt.value}
                        className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          severity === opt.value
                            ? "border-sage-500 bg-sage-50"
                            : "border-warm-200 bg-warm-50 hover:border-warm-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="severity"
                          value={opt.value}
                          checked={severity === opt.value}
                          onChange={(e) =>
                            setSeverity(e.target.value as Severity)
                          }
                          className="mt-0.5 accent-sage-500"
                        />
                        <div>
                          <span
                            className={`font-medium ${
                              severity === opt.value
                                ? "text-sage-800"
                                : "text-warm-800"
                            }`}
                          >
                            {opt.label}
                          </span>
                          <p className="text-sm text-warm-500 mt-0.5">
                            {opt.desc}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 rounded-xl text-warm-600 font-medium hover:bg-warm-100 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!canProceedStep2()}
                  className="px-6 py-3 rounded-xl bg-sage-500 text-white font-medium hover:bg-sage-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Description */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-bold text-warm-900 mb-1">
                Describe the incident
              </h2>
              <p className="text-sm text-warm-500 mb-8">
                Include what happened, where, and any contributing factors. This
                will be part of your official record.
              </p>

              <div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what happened in detail..."
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl border border-warm-200 bg-warm-50 text-warm-900 placeholder:text-warm-400 focus:outline-none focus:ring-2 focus:ring-sage-500/30 focus:border-sage-500 transition resize-none"
                  autoFocus
                />
                <p className="text-xs text-warm-400 mt-2">
                  Minimum 10 characters
                </p>
              </div>

              {/* Summary */}
              <div className="mt-6 p-4 rounded-xl bg-warm-50 border border-warm-200">
                <h4 className="text-sm font-semibold text-warm-700 mb-2">
                  Incident Summary
                </h4>
                <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <dt className="text-warm-500">Employee</dt>
                  <dd className="text-warm-800 font-medium">{employeeName}</dd>
                  <dt className="text-warm-500">Date</dt>
                  <dd className="text-warm-800 font-medium">
                    {new Date(dateOfInjury + "T00:00:00").toLocaleDateString(
                      "en-US",
                      {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      }
                    )}
                  </dd>
                  <dt className="text-warm-500">Injury Type</dt>
                  <dd className="text-warm-800 font-medium">
                    {INJURY_TYPE_LABELS[injuryType as InjuryType]}
                  </dd>
                  <dt className="text-warm-500">Severity</dt>
                  <dd className="text-warm-800 font-medium capitalize">
                    {severity}
                  </dd>
                </dl>
              </div>

              <div className="mt-8 flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 rounded-xl text-warm-600 font-medium hover:bg-warm-100 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit()}
                  className="px-6 py-3 rounded-xl bg-sage-500 text-white font-medium hover:bg-sage-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Generate Action Plan
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
