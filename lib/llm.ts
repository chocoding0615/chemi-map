// OpenRouter(https://openrouter.ai) 경유 LLM 호출. 서버(API 라우트)에서만 불러야 한다 —
// OPENROUTER_API_KEY는 절대 클라이언트 번들에 들어가면 안 된다.
// 모델은 OPENROUTER_MODEL env로 바꿀 수 있다(기본값은 저렴한 Kimi K2).

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "moonshotai/kimi-k2";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function callLLM(messages: ChatMessage[], maxTokens = 4000): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY가 설정되지 않았어요. .env.local에 키를 추가해주세요.");
  }

  const res = await fetch(OPENROUTER_URL, {
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
  });

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
