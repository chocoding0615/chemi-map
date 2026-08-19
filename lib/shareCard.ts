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

/** 파일 공유(Web Share)가 가능하면 이미지를 그대로 공유하고, 안 되면 페이지 링크를 클립보드에 복사한다. */
export async function shareImageOrCopyLink(blob: Blob, filename: string, shareText: string): Promise<"shared" | "copied"> {
  const file = new File([blob], filename, { type: "image/png" });
  const nav = navigator as Navigator & { canShare?: (data: { files: File[] }) => boolean };
  if (nav.share && nav.canShare?.({ files: [file] })) {
    await nav.share({ files: [file], text: shareText, title: "여우점" });
    return "shared";
  }
  await navigator.clipboard.writeText(`${shareText} ${window.location.origin}`);
  return "copied";
}
