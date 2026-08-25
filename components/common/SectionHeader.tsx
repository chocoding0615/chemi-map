import Link from "next/link";

interface SectionHeaderProps {
  title: string;
  moreHref?: string;
  moreLabel?: string;
}

// "복실이의 비밀일기 [더보기]"처럼 좌측 제목 + 우측 더보기 링크 패턴을 통일한다.
// moreHref가 없으면 제목만 보여준다(운세 그룹 섹션처럼 더보기 링크가 없는 경우).
export default function SectionHeader({ title, moreHref, moreLabel = "더보기" }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-sm font-semibold text-brown-soft/90">{title}</h2>
      {moreHref && (
        <Link href={moreHref} className="text-xs font-semibold text-coral-dark underline underline-offset-2">
          {moreLabel}
        </Link>
      )}
    </div>
  );
}
