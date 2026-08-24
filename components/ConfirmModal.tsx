"use client";

interface ConfirmModalProps {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  title,
  description,
  confirmLabel = "확인",
  cancelLabel = "취소",
  pending = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-brown/40 px-6 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-[320px] rounded-2xl bg-white p-5 text-center shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-sm font-bold text-brown">{title}</p>
        {description && <p className="mt-1.5 text-xs leading-relaxed text-brown-soft/90">{description}</p>}
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="flex-1 rounded-xl bg-cream py-2.5 text-sm font-bold text-brown-soft transition active:scale-95 disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className="flex-1 rounded-xl bg-gradient-to-b from-coral to-coral-dark py-2.5 text-sm font-bold text-white transition active:scale-95 disabled:opacity-60"
          >
            {pending ? "처리 중..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
