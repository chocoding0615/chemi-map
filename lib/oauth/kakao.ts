import type { OAuthProfile } from "@/lib/session";

export function buildKakaoAuthorizeUrl(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.KAKAO_REST_API_KEY ?? "",
    redirect_uri: redirectUri,
    response_type: "code",
    state,
    // scope를 넣으면 그 항목들만 명시적으로 요청한다 - 기존에 쓰던 닉네임/프로필사진도
    // 콘솔 설정과 무관하게 항상 같이 요청되도록 age_range와 함께 명시한다.
    // age_range 자체는 카카오 개발자 콘솔에서 "연령대" 동의항목을 켜야 실제로 값이 온다.
    scope: "profile_nickname profile_image age_range",
  });
  return `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;
}

export async function fetchKakaoProfile(code: string, redirectUri: string): Promise<OAuthProfile> {
  const tokenParams = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: process.env.KAKAO_REST_API_KEY ?? "",
    client_secret: process.env.KAKAO_CLIENT_SECRET ?? "",
    redirect_uri: redirectUri,
    code,
  });

  const tokenRes = await fetch("https://kauth.kakao.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: tokenParams.toString(),
  });
  if (!tokenRes.ok) throw new Error(`kakao token exchange failed: ${tokenRes.status}`);
  const tokenJson = (await tokenRes.json()) as { access_token: string };

  const profileRes = await fetch("https://kapi.kakao.com/v2/user/me", {
    headers: { Authorization: `Bearer ${tokenJson.access_token}` },
  });
  if (!profileRes.ok) throw new Error(`kakao profile fetch failed: ${profileRes.status}`);
  const profileJson = (await profileRes.json()) as {
    id: number;
    kakao_account?: {
      profile?: { nickname?: string; profile_image_url?: string };
      // "20~29" 형태 - 동의 안 했거나 콘솔에서 항목이 꺼져있으면 필드 자체가 없다.
      age_range?: string;
    };
  };

  return {
    providerId: String(profileJson.id),
    nickname: profileJson.kakao_account?.profile?.nickname ?? "여우 손님",
    profileImageUrl: profileJson.kakao_account?.profile?.profile_image_url ?? null,
    ageRange: profileJson.kakao_account?.age_range ?? null,
  };
}
