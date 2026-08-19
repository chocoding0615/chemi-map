import { addExp, recordFortuneSeen, type ActionId, type FoxProgress, type FortuneSeenId } from "./progress";
import { evaluateCharmDrops, getOwnedCharmIds, addCharms, getCharmById } from "./charms";
import { notify, notifyNineTail } from "./notify";

const MILESTONE_LINE: Partial<Record<number, string>> = {
  3: "이제 제법 여우 티가 나죠?",
  6: "여섯 개라니… 복실이도 신기해하고 있어요.",
};

// 페이지의 결과 화면이 뜨는 시점에 호출하는 단일 진입점 —
// exp 적립 + 부적 획득 판정 + 토스트 알림을 한 번에 처리한다.
export function awardForAction(action: ActionId): void {
  const { progress, tailsBefore, tailsAfter } = addExp(action);
  grantCharmsAndNotify(action, progress);

  if (tailsAfter > tailsBefore) {
    if (tailsAfter >= 9) {
      notifyNineTail(); // 9꼬리는 토스트 대신 별도 모달(NineTailModal)이 담당
    } else {
      const extra = MILESTONE_LINE[tailsAfter];
      const text = `🦊 복실이 꼬리가 ${tailsAfter}개가 됐어요! 조금씩 어른 여우가 되어가요.${extra ? ` ${extra}` : ""}`;
      notify({ kind: "normal", text });
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
