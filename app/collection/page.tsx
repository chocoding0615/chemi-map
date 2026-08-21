import { redirect } from "next/navigation";

// 부적 주머니는 마이페이지 안의 탭으로 옮겨졌다. 예전 링크를 북마크해둔
// 사람들이 있을 수 있어 라우트 자체는 남기고 그리로 리다이렉트만 한다.
export default function CollectionPage() {
  redirect("/my?tab=collection");
}
