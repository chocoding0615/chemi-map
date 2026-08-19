import { addExp, recordFortuneSeen, type ActionId, type FoxProgress, type FortuneSeenId } from "./progress";
import { evaluateCharmDrops, getOwnedCharmIds, addCharms, getCharmById } from "./charms";
import { notify } from "./notify";

// 페이지의 결과 화면이 뜨는 시점에 호출하는 단일 진입점 —
// exp 적립 + 부적 획득 판정 + 토스트 알림을 한 번에 처리한다.
export function awardForAction(action: ActionId): void {
  const { progress, tailsBefore, tailsAfter } = addExp(action);
  grantCharmsAndNotify(action, progress);

  if (tailsAfter > tailsBefore) {
    if (tailsAfter >= 9) {
      notify({ kind: "milestone", text: "복실이가 진짜 구미호가 됐어요! 꼬리 9개를 다 모았어요 ✨" });
    } else {
      notify({ kind: "normal", text: `🦊 복실이 꼬리가 ${tailsAfter}개가 됐어요!` });
    }
  }
}

// exp가 붙지 않는 "봤음" 기록만 필요한 카테고리(애정운/직업운/궁합)에서 호출.
export function markFortuneSeen(id: FortuneSeenId): void {
  const progress = recordFortuneSeen(id);
  grantCharmsAndNotify(id === "compat" ? "compat" : "", progress);
}

function grantCharmsAndNotify(action: string, progress: FoxProgress): void {
  const owned = getOwnedCharmIds();
  const drops = evaluateCharmDrops({
    action,
    progress,
    ownedIds: owned,
    stats: {
      dailyStreak: progress.dailyStreak,
      connectionsCount: progress.connectionsCount,
      seenFortunes: progress.seenFortunes,
    },
  });
  if (drops.length === 0) return;

  addCharms(drops);
  for (const id of drops) {
    const charm = getCharmById(id);
    if (charm) notify({ kind: "normal", text: `✨ 새 부적을 얻었어요: ${charm.name}` });
  }
}
