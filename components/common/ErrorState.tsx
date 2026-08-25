interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({ message = "앗, 문제가 생겼어요", onRetry }: ErrorStateProps) {
  return (
    <div className="flex w-full flex-col items-center justify-center rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-brown/5">
      <span className="text-3xl">🦊💦</span>
      <p className="mt-2 text-sm font-bold text-brown">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-xl bg-cream px-4 py-2 text-xs font-bold text-brown-soft transition active:scale-95 hover:bg-apricot"
        >
          다시 시도
        </button>
      )}
    </div>
  );
}
