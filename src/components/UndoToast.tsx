"use client";

import { useEffect, useState } from "react";

interface UndoToastProps {
  message: string;
  onUndo: () => void;
  onDismiss: () => void;
  duration?: number;
}

export default function UndoToast({
  message,
  onUndo,
  onDismiss,
  duration = 4000,
}: UndoToastProps) {
  const [progress, setProgress] = useState(100);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = 50;
    const decrement = (interval / duration) * 100;
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          setVisible(false);
          setTimeout(onDismiss, 200);
          return 0;
        }
        return prev - decrement;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [duration, onDismiss]);

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-200 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
    >
      <div className="bg-warm-900 text-white rounded-xl shadow-lg px-5 py-3 flex items-center gap-4 min-w-[320px]">
        <span className="text-sm flex-1">{message}</span>
        <button
          onClick={() => {
            onUndo();
            setVisible(false);
            setTimeout(onDismiss, 200);
          }}
          className="text-sm font-semibold text-sage-300 hover:text-sage-200 transition-colors shrink-0"
        >
          Undo
        </button>
      </div>
      {/* Progress bar */}
      <div className="h-0.5 bg-warm-700 rounded-b-xl mx-1 overflow-hidden">
        <div
          className="h-full bg-sage-400 transition-none"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
