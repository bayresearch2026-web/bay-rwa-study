# BAY 리서치팀 · RWA 스터디

Blockchain at Yonsei 리서치팀 RWA 스터디 진행안 사이트. Xangle RWA Series 완독 9회차.

매주 화요일 · 2026-08-04 시작 · 2026-09-29 종료

| 회차 | 일자 | 주제 | 원문 |
|---|---|---|---|
| 1 | 08-04 (화) | RWA 토큰화 생태계 분류 | [2479](https://xangle.io/research/detail/2479) |
| 2 | 08-11 (화) | 솔라나 RWA 주요 플레이어 | [2494](https://xangle.io/research/detail/2494) |
| 3 | 08-18 (화) | 토큰화 주식 | [2496](https://xangle.io/research/detail/2496) |
| 4 | 08-25 (화) | 커스터디 / KMS | [2499](https://xangle.io/research/detail/2499) |
| 5 | 09-01 (화) | 토큰화 채권 | [2508](https://xangle.io/research/detail/2508) |
| 6 | 09-08 (화) | 컴플라이언스 | [2512](https://xangle.io/research/detail/2512) |
| 7 | 09-15 (화) | 토큰화 대체자산 | [2517](https://xangle.io/research/detail/2517) |
| 8 | 09-22 (화) | 지갑 인프라 | [2520](https://xangle.io/research/detail/2520) |
| 9 | 09-29 (화) | 디파이 : 렌딩 | [2521](https://xangle.io/research/detail/2521) |

홈 화면은 오늘 날짜를 기준으로 다음에 진행할 회차에 "다음 세션" 배지를 자동으로 붙입니다.

회차 순서는 아티클 발행 순서를 따랐습니다. 담당 배분은 각 아티클 목차를 6등분한 초안이므로
팀 사정에 맞게 조정하세요. 순서를 바꾸려면 `data/sessions.js`의 `sessions` 배열 순서를 옮기고
`no` 값만 다시 매기면 됩니다.

빌드 도구·의존성 없는 정적 사이트입니다. HTML/CSS/JS 파일 그대로 서빙됩니다.

```
index.html          홈 — 9개 회차 카드 + 공통 운영 규칙
session.html        회차 상세 — ?s=1 ~ ?s=9
data/sessions.js    ★ 모든 회차 내용. 수정은 여기만 하면 됨
assets/style.css    전 페이지 공용 스타일
assets/app.js       공용 렌더링 로직
assets/hero.png     히어로 일러스트 / logo.png / favicon.ico
vercel.json         정적 캐시 헤더
```

## 로컬에서 보기

`index.html`을 브라우저로 바로 열어도 되지만, 로컬 서버로 띄우는 쪽이 실제 배포와 동일합니다.

```bash
python -m http.server 8777
```

## 회차 내용 수정하기

`data/sessions.js` 한 파일만 고치면 홈과 상세 페이지가 함께 갱신됩니다. HTML은 건드리지 않습니다.

### 회차 객체 구조

```js
{
  no: 10,
  topic: '토큰화 국채',                  // 홈 카드 제목 + 상단 배지
  title: { accent: 'Tokenized', rest: 'Treasuries' },   // accent가 파란 글씨
  status: 'ready',                      // 'tbd' | 'ready' | 'done'
  date: '2026-08-19',                   // 비워두면 표시 안 됨
  source: {
    label: 'Xangle RWA Series — 토큰화 국채',
    url:   'https://xangle.io/research/detail/XXXX',
    short: 'xangle.io/research/detail/XXXX'
  },
  assign: [
    { who: '팀원 A',
      parts: [ { n: '1.', t: '섹션 제목' }, { n: '2-1.', t: '섹션 제목' } ],
      focus: '공유할 때 짚어야 할 내용' },
    // … 팀원 수만큼
  ],
  records: []
}
```

`status: 'tbd'`로 두면 주제 미정 회차로 표시됩니다. 이때는 `source`를 `null`,
`assign`을 `[]`로 두면 되고, 상세 페이지에 "주제 확정 대기 중" 안내가 대신 나옵니다.
회차를 추가·삭제하면 홈 카드 수와 이전/다음 네비게이션이 자동으로 따라갑니다.

**실제 진행일이 정해지면** 각 회차 `date`를 채우세요. 홈 카드와 상세 히어로에 표시됩니다.

**진행표(시간표)는 따로 안 적어도 됩니다.** `assign` 순서대로 30분씩 자동 계산돼서
`00–30`, `30–60` … 으로 그려집니다. 담당자가 5명이면 150분, 7명이면 210분으로 알아서 맞춰집니다.

### 세션이 끝난 뒤 기록 올리기

`records`에 항목을 추가하면 상세 페이지 `04 진행 기록`에 목록으로 뜹니다.

```js
records: [
  { kind: '정리본',   title: '1회차 통합 정리',        url: 'https://notion.so/...' },
  { kind: '질문 답변', title: '사전 질문 12개 답변',    url: 'https://notion.so/...' },
  { kind: '참고',     title: 'MiCA 원문 요약',        url: 'https://...' }
]
```

`status`를 `'done'`으로 바꾸면 홈 카드 배지가 "진행 완료"로 바뀝니다.

### 공통 규칙 바꾸기

인원수, 인당 시간, 사전 준비 일정(D-7 / D-2 …), 30분 구성은 `defaults`에 있습니다.
여기를 고치면 9개 회차에 한번에 반영됩니다.

### 공용 노션 페이지 링크

`meta.notionUrl`에 주소를 넣으면 홈 히어로에 버튼이 생깁니다. 비워두면 버튼이 숨겨집니다.

## 배포 (GitHub → Vercel)

```bash
git init
git add .
git commit -m "BAY RWA 스터디 사이트"
git remote add origin https://github.com/<계정>/<저장소>.git
git push -u origin main
```

Vercel에서 이 저장소를 Import 합니다. 빌드 설정은 전부 비워두면 됩니다.

- Framework Preset: **Other**
- Build Command: 비움
- Output Directory: 비움 (루트를 그대로 서빙)

이후 `data/sessions.js`를 고쳐 push 할 때마다 자동 재배포됩니다.

## 앞으로 노션 연동을 붙일 때

화면 코드는 `data/sessions.js`의 `window.STUDY` 하나만 바라보게 짜여 있습니다.
그래서 연동은 "노션 → 같은 모양의 데이터 만들기"만 하면 되고, HTML/CSS는 그대로 둡니다. 두 가지 방법이 있습니다.

1. **빌드 시점에 생성 (권장)**
   노션 API로 DB를 읽어 `data/sessions.js`를 새로 써주는 스크립트를 만들고,
   Vercel Build Command에서 실행합니다. 배포된 페이지는 계속 순수 정적 파일이라 빠릅니다.

2. **런타임에 불러오기**
   Vercel Serverless Function(`/api/sessions`)에서 노션 API를 호출하고,
   페이지가 그걸 fetch 해서 `window.STUDY`에 넣습니다. 항상 최신이지만 노션 API 토큰 관리와
   응답 지연을 감수해야 합니다.

어느 쪽이든 노션 DB 속성을 회차 / 주제 / 원문링크 / 상태 / 진행일 / 담당배분 / 기록 으로 잡아두면
위 스키마와 1:1로 매핑됩니다.
