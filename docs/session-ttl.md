# sessions 컬렉션 TTL 정책

## 왜 필요한가

`lib/session.ts`의 `upsertUserAndCreateSession()`은 로그인할 때마다 `sessions/{token}` 문서를
새로 만든다(`{ uid, expiresAt }`, 유효기간 30일). 로그아웃/삭제 로직이 없어서 이 컬렉션은
로그인 횟수만큼 계속 쌓이기만 한다.

당장 앱 동작에는 문제가 없다 — `getSession()`이 만료된 세션을 찾으면 그 자리에서 즉시
`sessionSnap.ref.delete()`로 지우기 때문에, **보안이나 정합성 문제는 없다.** 다만 한 번도
다시 방문하지 않는 만료 세션(예: 로그인만 하고 이탈한 손님)은 아무도 안 읽어가니 영원히
안 지워지고, Firestore 문서 수·읽기 비용만 계속 늘어난다.

Firestore의 TTL(Time-to-live) 정책을 걸어두면, `expiresAt`이 지난 문서를 GCP가 백그라운드로
알아서 지워준다 — 코드 변경 없이 인프라 설정만으로 해결된다.

## 적용 방법

`sessions`는 `users/{uid}` 밑이 아니라 최상위(root-level) 컬렉션이라, 컬렉션 그룹 이름도
그대로 `sessions`다.

```bash
gcloud firestore fields ttls update expiresAt \
  --collection-group=sessions \
  --enable-ttl \
  --project=<FIREBASE_PROJECT_ID>
```

- `<FIREBASE_PROJECT_ID>`는 `.env.local`의 `FIREBASE_PROJECT_ID` 값과 동일해야 한다.
- 기본 데이터베이스(`(default)`)가 아니라 별도 이름의 Firestore DB를 쓰고 있다면
  `--database=<DATABASE_ID>`를 추가한다.
- 적용 후 상태 확인:

  ```bash
  gcloud firestore fields ttls describe expiresAt \
    --collection-group=sessions \
    --project=<FIREBASE_PROJECT_ID>
  ```

## 알아둘 점

- **삭제는 즉시가 아니다.** 문서가 만료된 시점(`expiresAt` 경과) 기준으로 **최대 24시간 이내**에
  백그라운드로 지워진다. 실시간 삭제가 필요한 로직(로그인 인증 등)은 지금처럼 애플리케이션
  코드에서 직접 만료를 검사해야 한다 — TTL은 어디까지나 "청소" 목적이지 보안 경계가 아니다.
  (`getSession()`이 이미 그렇게 하고 있어서 TTL을 켜도 기존 동작은 그대로 유지된다.)
- TTL 정책이 적용되기 전부터 이미 만료돼 있던 문서들도, 정책이 활성화되고 나면 그 시점 기준
  24시간 이내에 정리된다 — 과거에 쌓인 문서도 소급 적용됨.
- 콘솔(Firebase Console → Firestore → 필드 TTL)에서도 동일한 설정을 GUI로 켤 수 있다.

## 참고

- [Firestore TTL 정책 공식 문서](https://firebase.google.com/docs/firestore/ttl)
- [`gcloud firestore fields ttls update` 레퍼런스](https://docs.cloud.google.com/sdk/gcloud/reference/firestore/fields/ttls/update)
