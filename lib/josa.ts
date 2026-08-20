// 이름 뒤에 붙는 한글 조사를 받침 유무로 자동 선택한다.
// 완성형 한글 음절의 코드값에서 0xAC00을 빼면 종성(받침) 인덱스가 28의 배수인지로
// 받침 유무를 판별할 수 있다 (0이면 받침 없음).
export type JosaPair = "은/는" | "이/가" | "을/를" | "와/과";

const JOSA_TABLE: Record<JosaPair, { batchim: string; noBatchim: string }> = {
  "은/는": { batchim: "은", noBatchim: "는" },
  "이/가": { batchim: "이", noBatchim: "가" },
  "을/를": { batchim: "을", noBatchim: "를" },
  "와/과": { batchim: "과", noBatchim: "와" },
};

function hasBatchim(char: string): boolean {
  const code = char.charCodeAt(0) - 0xac00;
  if (code < 0 || code > 11171) return false; // 한글 완성형 음절이 아니면 받침 없는 것으로 취급
  return code % 28 !== 0;
}

/** 이름 뒤에 올 조사를 반환한다. 예: josa("철수", "와/과") → "와" */
export function josa(name: string, pair: JosaPair): string {
  const trimmed = name.trim();
  const lastChar = trimmed[trimmed.length - 1];
  if (!lastChar) return JOSA_TABLE[pair].noBatchim;
  return hasBatchim(lastChar) ? JOSA_TABLE[pair].batchim : JOSA_TABLE[pair].noBatchim;
}

/** 이름+조사를 붙여서 반환한다. 예: withJosa("철수", "와/과") → "철수와" */
export function withJosa(name: string, pair: JosaPair): string {
  return `${name}${josa(name, pair)}`;
}
