"use client";

export default function EmptyState() {
  return (
    <div className="text-center py-16 px-6">
      <div className="w-16 h-16 rounded-2xl bg-warm-100 flex items-center justify-center mx-auto mb-5">
        <svg
          className="w-8 h-8 text-warm-400"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-warm-700 mb-2">
        No incidents yet
      </h3>
      <p className="text-sm text-warm-500 max-w-sm mx-auto">
        When a workplace injury occurs, start a new incident to get step-by-step
        guidance on what to do.
      </p>
    </div>
  );
}
