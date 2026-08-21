// LLM이 내는 "## 제목 / - 목록 / **강조**" 정도의 단순한 마크다운 서브셋만 렌더링한다.
// 전체 마크다운 라이브러리를 새로 추가하지 않기 위한 최소 구현.
function renderInline(text: string, keyPrefix: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={`${keyPrefix}-${i}`} className="font-bold text-coral-dark">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={`${keyPrefix}-${i}`}>{part}</span>
    )
  );
}

export default function SimpleMarkdown({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks: React.ReactNode[] = [];
  let listBuffer: string[] = [];

  function flushList(key: string) {
    if (listBuffer.length === 0) return;
    blocks.push(
      <ul key={key} className="ml-4 list-disc space-y-1.5">
        {listBuffer.map((item, i) => (
          <li key={i} className="text-sm leading-relaxed text-brown-soft">
            {renderInline(item, `${key}-li-${i}`)}
          </li>
        ))}
      </ul>
    );
    listBuffer = [];
  }

  lines.forEach((rawLine, idx) => {
    const line = rawLine.trim();
    if (line.startsWith("## ")) {
      flushList(`list-${idx}`);
      blocks.push(
        <h3 key={idx} className="mt-6 text-base font-extrabold text-brown first:mt-0">
          {line.slice(3)}
        </h3>
      );
    } else if (line.startsWith("- ") || line.startsWith("• ")) {
      listBuffer.push(line.slice(2));
    } else if (line.length === 0) {
      flushList(`list-${idx}`);
    } else {
      flushList(`list-${idx}`);
      blocks.push(
        <p key={idx} className="text-sm leading-relaxed text-brown-soft">
          {renderInline(line, `p-${idx}`)}
        </p>
      );
    }
  });
  flushList("list-final");

  return <div className="space-y-3">{blocks}</div>;
}
