import FoxMascot from "@/components/FoxMascot";

interface LoadingStateProps {
  text?: string;
}

// 기존 /saju 제출 버튼의 로딩 톤("복실이가 사주를 보는 중...")을 공용 컴포넌트로 뽑았다.
export default function LoadingState({ text = "복실이가 준비하고 있어요..." }: LoadingStateProps) {
  return (
    <div className="flex w-full flex-col items-center justify-center py-10">
      <FoxMascot size={48} prop="scroll" />
      <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-brown-soft">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-coral/30 border-t-coral" />
        {text}
      </div>
    </div>
  );
}
