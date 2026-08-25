// html-to-image는 클라이언트에서만 필요해서 동적 import로 불러온다(초기 번들에서 제외).
export async function captureNodeAsPng(node: HTMLElement): Promise<Blob> {
  await document.fonts.ready;
  const { toBlob } = await import("html-to-image");
  const blob = await toBlob(node, { pixelRatio: 3, cacheBust: true });
  if (!blob) throw new Error("이미지를 만들지 못했어요.");
  return blob;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** 파일 공유(Web Share)가 가능하면 이미지+링크를 함께 공유하고, 안 되면 텍스트+링크를 클립보드에 복사한다.
 * 링크가 없으면 이미지만 받은 친구는 정작 테스트를 하러 갈 방법이 없다 - 초대 링크(url)를
 * 항상 텍스트에 함께 실어 보낸다(navigator.share의 url 필드는 files와 같이 쓰면 무시하는
 * 브라우저가 많아, 텍스트에 직접 포함시키는 쪽이 더 안전하다). */
export async function shareImageOrCopyLink(blob: Blob, filename: string, shareText: string, url: string): Promise<"shared" | "copied"> {
  const file = new File([blob], filename, { type: "image/png" });
  const textWithLink = `${shareText} ${url}`;
  const nav = navigator as Navigator & { canShare?: (data: { files: File[] }) => boolean };
  if (nav.share && nav.canShare?.({ files: [file] })) {
    await nav.share({ files: [file], text: textWithLink, title: "여우점" });
    return "shared";
  }
  await navigator.clipboard.writeText(textWithLink);
  return "copied";
}

/** navigator.share()에서 사용자가 공유 시트를 직접 닫아서 난 AbortError인지 판별한다 —
 * 이 경우는 "실패"가 아니라 마음을 바꾼 것뿐이라 에러 토스트를 띄우면 안 된다. */
export function isUserCancelledShare(err: unknown): boolean {
  return err instanceof DOMException && err.name === "AbortError";
}

/** 이미지 캡처/공유가 진짜로 실패했을 때 최후의 수단으로 페이지 링크만이라도 복사해준다. */
export async function copyPageUrlFallback(): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(window.location.href);
    return true;
  } catch {
    return false;
  }
}
