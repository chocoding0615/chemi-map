import type { OAuthProfile } from "@/lib/session";

export function buildNaverAuthorizeUrl(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.NAVER_CLIENT_ID ?? "",
    redirect_uri: redirectUri,
    state,
  });
  return `https://nid.naver.com/oauth2.0/authorize?${params.toString()}`;
}

export async function fetchNaverProfile(code: string, redirectUri: string, state: string): Promise<OAuthProfile> {
  const tokenParams = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: process.env.NAVER_CLIENT_ID ?? "",
    client_secret: process.env.NAVER_CLIENT_SECRET ?? "",
    redirect_uri: redirectUri,
    code,
    state,
  });

  const tokenRes = await fetch(`https://nid.naver.com/oauth2.0/token?${tokenParams.toString()}`);
  if (!tokenRes.ok) throw new Error(`naver token exchange failed: ${tokenRes.status}`);
  const tokenJson = (await tokenRes.json()) as { access_token?: string; error?: string };
  if (!tokenJson.access_token) throw new Error(`naver token exchange failed: ${tokenJson.error ?? "unknown"}`);

  const profileRes = await fetch("https://openapi.naver.com/v1/nid/me", {
    headers: { Authorization: `Bearer ${tokenJson.access_token}` },
  });
  if (!profileRes.ok) throw new Error(`naver profile fetch failed: ${profileRes.status}`);
  const profileJson = (await profileRes.json()) as {
    // age는 "20-29" 형태 - 네이버 개발자센터의 "제공 정보 선택"에서 연령대 항목을
    // 켜고 사용자가 동의해야 온다. 카카오와 달리 여기(URL)엔 요청할 파라미터가
    // 없고, 콘솔 설정만으로 동의 화면에 자동으로 포함된다.
    response?: { id: string; nickname?: string; profile_image?: string; age?: string };
  };
  if (!profileJson.response) throw new Error("naver profile fetch failed: empty response");

  return {
    providerId: profileJson.response.id,
    nickname: profileJson.response.nickname ?? "여우 손님",
    profileImageUrl: profileJson.response.profile_image ?? null,
    ageRange: profileJson.response.age ?? null,
  };
}
