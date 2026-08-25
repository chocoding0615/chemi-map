// OpenRouter(https://openrouter.ai) 경유 LLM 호출. 서버(API 라우트)에서만 불러야 한다 —
// OPENROUTER_API_KEY는 절대 클라이언트 번들에 들어가면 안 된다.
// 모델은 OPENROUTER_MODEL env로 바꿀 수 있다. 기본값은 deepseek-chat(DeepSeek V3) —
// 출력 위주(긴 한국어 리포트)인 이 워크로드에서 kimi-k2보다 출력 단가가 절반 이하라
// 2026-08 기준 OpenRouter 가격표로 비교해 골랐다(각 $/1M): kimi-k2 0.57/2.30 vs
// deepseek-chat 0.26/1.03. 가격은 수시로 바뀌니 나중에 다시 비교해볼 가치가 있다.
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "deepseek/deepseek-chat";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

const DEFAULT_TIMEOUT_MS = 60_000;

export async function callLLM(messages: ChatMessage[], maxTokens = 4000, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY가 설정되지 않았어요. .env.local에 키를 추가해주세요.");
  }

  let res: Response;
  try {
    res = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || DEFAULT_MODEL,
        messages,
        max_tokens: maxTokens,
      }),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (err) {
    const isTimeout = err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError");
    if (isTimeout) {
      throw new Error("복실이가 답변을 만드는 데 시간이 너무 오래 걸려요. 잠시 후 다시 시도해주세요.");
    }
    throw err;
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`LLM 호출 실패 (${res.status}): ${text.slice(0, 300)}`);
  }

  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const content = data.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) {
    throw new Error("LLM 응답이 비어있어요.");
  }
  return content;
}
