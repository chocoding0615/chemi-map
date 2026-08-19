"use client";

import { useEffect, useState } from "react";
import { onToast, type ToastPayload } from "@/lib/notify";

interface ActiveToast extends ToastPayload {
  id: number;
}

export default function ToastHost() {
  const [toasts, setToasts] = useState<ActiveToast[]>([]);

  useEffect(() => {
    return onToast((payload) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { ...payload, id }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, payload.kind === "milestone" ? 5000 : 2800);
    });
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-50 flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto max-w-[90vw] rounded-full px-4 py-2 text-center text-sm font-bold shadow-lg transition ${
            t.kind === "milestone"
              ? "bg-gradient-to-r from-coral to-lavender text-white"
              : "bg-white text-brown ring-1 ring-brown/10"
          }`}
        >
          {t.text}
        </div>
      ))}
    </div>
  );
}
