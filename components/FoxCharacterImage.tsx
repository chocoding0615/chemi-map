"use client";

import { useState } from "react";
import Image from "next/image";

interface FoxCharacterImageProps {
  src: string;
  fallbackEmoji: string;
  size: number;
  alt?: string;
}

// 오행별 캐릭터 이미지(public/fox/*.png)는 별도 제공 예정 — 아직 파일이 없는 동안엔
// 이미지 로드가 실패해서 자동으로 소품 이모지로 대체된다. 이미지가 채워지면 코드
// 수정 없이 그대로 그 이미지가 우선 노출된다.
export default function FoxCharacterImage({ src, fallbackEmoji, size, alt = "" }: FoxCharacterImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span style={{ fontSize: size, lineHeight: 1 }} role="img" aria-label={alt}>
        {fallbackEmoji}
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      unoptimized
      onError={() => setFailed(true)}
      style={{ objectFit: "contain" }}
    />
  );
}
