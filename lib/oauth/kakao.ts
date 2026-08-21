import type { OAuthProfile } from "@/lib/session";

export function buildKakaoAuthorizeUrl(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.KAKAO_REST_API_KEY ?? "",
    redirect_uri: redirectUri,
    response_type: "code",
    state,
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
    };
  };

  return {
    providerId: String(profileJson.id),
    nickname: profileJson.kakao_account?.profile?.nickname ?? "여우 손님",
    profileImageUrl: profileJson.kakao_account?.profile?.profile_image_url ?? null,
  };
}
