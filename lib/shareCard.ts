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

/** 이미지를 기기에 저장한다. <a download>는 데스크톱에선 잘 되지만, 모바일(특히 iOS
 * Safari나 카카오톡 인앱 브라우저)에서는 다운로드가 실제 사진첩으로 안 이어지는
 * 경우가 많다. Web Share(파일 공유)가 되면 그쪽을 먼저 시도해서, 네이티브 공유
 * 시트에서 사용자가 직접 "사진에 저장"을 고르게 한다 - 모바일에서 실제로 사진첩에
 * 들어가는 유일한 방법이다. 지원 안 되거나 실패하면 기존 다운로드 방식으로 넘어간다. */
export async function saveImage(blob: Blob, filename: string): Promise<"shared" | "downloaded"> {
  const file = new File([blob], filename, { type: "image/png" });
  const nav = navigator as Navigator & { canShare?: (data: { files: File[] }) => boolean };
  if (nav.share && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file] });
      return "shared";
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") throw err;
      // 공유 시트 자체가 실패한 경우(취소 아님)만 다운로드로 폴백한다.
    }
  }
  downloadBlob(blob, filename);
  return "downloaded";
}

/** 링크(초대 URL)만 공유한다. 이미지 파일을 같이 실어 보내면(navigator.share의 files)
 * 카카오톡 등 일부 공유 대상 앱이 text/url을 캡션으로 안 붙이고 이미지만 받기도 해서,
 * "받은 사람이 눌러서 들어올 수 있는 링크"가 목적일 땐 이미지 없이 텍스트+링크만 보낸다. */
export async function shareLink(shareText: string, url: string): Promise<"shared" | "copied"> {
  if (navigator.share) {
    try {
      await navigator.share({ title: "여우점", text: shareText, url });
      return "shared";
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") throw err;
      // 공유 시트 자체가 실패한 경우(사용자 취소 아님) 클립보드 복사로 넘어간다.
    }
  }
  await navigator.clipboard.writeText(`${shareText} ${url}`);
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
