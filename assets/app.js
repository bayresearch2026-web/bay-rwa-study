/* =============================================================================
 * 공용 렌더링 로직 — data/sessions.js 를 읽어 화면을 그립니다.
 * 데이터 문자열 안의 <b> 같은 태그는 의도된 서식이므로 그대로 삽입합니다.
 * (데이터는 팀이 직접 작성하는 정적 파일이며 외부 입력을 받지 않습니다.)
 * ========================================================================== */
(function (w) {
  'use strict';

  var S = w.STUDY;
  var D = S.defaults;

  /* ---- 유틸 ---------------------------------------------------------- */

  function pad(n) { return String(n).padStart(2, '0'); }

  function sessionUrl(no) { return 'session.html?s=' + no; }

  var DOW = ['일', '월', '화', '수', '목', '금', '토'];

  /**
   * 'YYYY-MM-DD' → { short:'8/4', long:'8월 4일 (화)', dow:'화' }
   * new Date('2026-08-04')는 UTC 자정으로 해석돼 시간대에 따라 하루 밀리므로
   * 연·월·일을 직접 넘겨 로컬 자정으로 만듭니다.
   */
  function fmtDate(iso) {
    if (!iso) return null;
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
    if (!m) return { short: iso, long: iso, dow: '' };

    var mo = Number(m[2]), day = Number(m[3]);
    var dow = DOW[new Date(Number(m[1]), mo - 1, day).getDay()];

    return { short: mo + '/' + day, long: mo + '월 ' + day + '일 (' + dow + ')', dow: dow };
  }

  /** 오늘 이후로 가장 먼저 오는 회차 (홈에서 "다음 세션" 표시용) */
  function nextSession() {
    var today = new Date();
    today.setHours(0, 0, 0, 0);

    var upcoming = S.sessions.filter(function (s) {
      if (!s.date) return false;
      var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.date);
      return m && new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) >= today;
    });

    return upcoming[0] || null;
  }

  function slotCount(s) {
    return (s.assign && s.assign.length) ? s.assign.length : D.memberCount;
  }

  function totalMinutes(s) { return slotCount(s) * D.minutesPerSlot; }

  /** 회차 제목: "01 · 컴플라이언스" */
  function label(s) { return pad(s.no) + '회차 · ' + s.topic; }

  var BADGE = {
    ready: { cls: 'ready', text: '진행안 확정' },
    done:  { cls: 'done',  text: '진행 완료' },
    tbd:   { cls: 'tbd',   text: '준비 전' }
  };

  /** 담당 구간 목록(1. 제목 / 2-1. 제목 …)을 .sec 줄들로 */
  function partsHTML(parts) {
    return (parts || []).map(function (p) {
      return '<div class="sec"><b>' + p.n + '</b> ' + p.t + '</div>';
    }).join('');
  }

  /* ---- 상단 네비게이션 ------------------------------------------------ */

  /**
   * @param {{pill?:string, back?:boolean}} opt
   *  pill  우측 배지 텍스트 (없으면 숨김)
   *  back  true면 "전체 회차" 돌아가기 링크 표시
   */
  function nav(opt) {
    opt = opt || {};
    var right = '';
    if (opt.back) right += '<a class="back" href="index.html">&larr; 전체 회차</a>';
    if (opt.pill) right += '<div class="pill">' + opt.pill + '</div>';

    return '' +
      '<div class="nav"><div class="nav-in">' +
        '<a class="home" href="index.html">' +
          '<img src="assets/logo.png" alt="BAY">' +
          '<div class="brand"><b>' + S.meta.team + '</b><span>' + S.meta.org + '</span></div>' +
        '</a>' + right +
      '</div></div>';
  }

  /* ---- 홈: 회차 카드 -------------------------------------------------- */

  function sessionCard(s, isNext) {
    var b = BADGE[s.status] || BADGE.tbd;
    var tbd = s.status === 'tbd';
    var d = fmtDate(s.date);
    var srcText = s.source ? s.source.label : '주제가 정해지면 채워집니다';
    var foot = tbd
      ? '진행안 준비 전' + (d ? ' · ' + d.long : '')
      : slotCount(s) + '명 · ' + totalMinutes(s) + '분' + (d ? ' · ' + d.long : '');

    return '' +
      '<a class="scard' + (tbd ? ' tbd' : '') + (isNext ? ' next' : '') + '" href="' + sessionUrl(s.no) + '">' +
        '<div class="scard-top">' +
          '<span class="no">' + pad(s.no) + '</span>' +
          (isNext ? '<span class="badge next">다음 세션</span>' : '') +
          '<span class="badge ' + b.cls + '">' + b.text + '</span>' +
        '</div>' +
        '<h3>' + s.topic + '</h3>' +
        '<p class="src">' + srcText + '</p>' +
        '<div class="foot">' + foot + '<span class="go">&rsaquo;</span></div>' +
      '</a>';
  }

  function sessionGrid() {
    var nx = nextSession();
    var cards = S.sessions.map(function (s) { return sessionCard(s, s === nx); });
    return '<div class="grid">' + cards.join('') + '</div>';
  }

  /* ---- 섹션: 담당 배분 ------------------------------------------------ */

  function assignTable(s) {
    if (!s.assign || !s.assign.length) return null;

    var rows = s.assign.map(function (a, i) {
      return '<tr>' +
        '<td><span class="part">Part ' + (i + 1) + '</span></td>' +
        '<td><span class="who">' + a.who + '</span></td>' +
        '<td>' + partsHTML(a.parts) + '</td>' +
        '<td>' + (a.focus || '') + '</td>' +
      '</tr>';
    }).join('');

    return '<div class="card"><div class="tblwrap"><table>' +
      '<thead><tr><th style="width:74px">파트</th><th style="width:84px">담당</th>' +
      '<th style="width:320px">읽을 범위</th><th>공유 시 중점</th></tr></thead>' +
      '<tbody>' + rows + '</tbody>' +
    '</table></div></div>';
  }

  /* ---- 섹션: 사전 준비 (모든 회차 공통) -------------------------------- */

  function prepTable() {
    var rows = D.prep.map(function (p) {
      var what = p.list
        ? '<ul class="do">' + p.list.map(function (i) { return '<li>' + i + '</li>'; }).join('') + '</ul>'
        : p.what + (p.note ? '<br><small>' + p.note + '</small>' : '');

      return '<tr><td class="t">' + p.when + '</td><td>' + p.who + '</td><td>' + what + '</td></tr>';
    }).join('');

    return '<div class="card"><div class="tblwrap"><table>' +
      '<thead><tr><th style="width:110px">시점</th><th style="width:96px">누가</th><th>무엇을</th></tr></thead>' +
      '<tbody>' + rows + '</tbody>' +
    '</table></div></div>';
  }

  /* ---- 섹션: 진행표 (담당 배분에서 자동 생성) --------------------------- */

  function stepsBar() {
    var chips = D.steps.map(function (st) {
      return '<span class="st"><i>' + st.n + '</i>' + st.t + '<em>' + st.d + '</em></span>';
    }).join('<span class="ar">&rsaquo;</span>');

    return '<div class="steps"><span class="lb">각 순서 ' + D.minutesPerSlot + '분 구성</span>' + chips + '</div>';
  }

  function flowTable(s) {
    if (!s.assign || !s.assign.length) return null;

    var m = D.minutesPerSlot;
    var rows = s.assign.map(function (a, i) {
      var time = pad(i * m) + '&ndash;' + pad((i + 1) * m);
      return '<tr>' +
        '<td><span class="part">Part ' + (i + 1) + '</span></td>' +
        '<td class="t">' + time + '</td>' +
        '<td><span class="who">' + a.who + '</span></td>' +
        '<td>' + partsHTML(a.parts) + '</td>' +
      '</tr>';
    }).join('');

    return '<div class="card">' + stepsBar() + '<div class="tblwrap"><table>' +
      '<thead><tr><th style="width:74px">파트</th><th style="width:92px">시간</th>' +
      '<th style="width:84px">담당</th><th>담당 범위</th></tr></thead>' +
      '<tbody>' + rows + '</tbody>' +
    '</table></div></div>';
  }

  /* ---- 섹션: 진행 기록 (세션 이후 채워지는 자리) ------------------------ */

  function recordList(s) {
    if (!s.records || !s.records.length) {
      return '<div class="card"><div class="empty">' +
        '<b>아직 기록이 없습니다</b>' +
        '세션이 끝나면 발표 정리본 · 질문 답변 · 참고 자료가 이곳에 모입니다.' +
      '</div></div>';
    }

    var items = s.records.map(function (r) {
      var ext = r.url ? ' target="_blank" rel="noopener"' : '';
      return '<a class="rec" href="' + (r.url || '#') + '"' + ext + '>' +
        '<span class="kind">' + (r.kind || '자료') + '</span>' +
        '<b>' + r.title + '</b>' +
        '<span class="go">&#8599;</span>' +
      '</a>';
    }).join('');

    return '<div class="card"><div class="reclist">' + items + '</div></div>';
  }

  /* ---- 이전 / 다음 회차 ------------------------------------------------ */

  function pager(s) {
    var i = S.sessions.indexOf(s);
    var prev = S.sessions[i - 1];
    var next = S.sessions[i + 1];

    function link(t, cls, dir) {
      if (!t) return '<a class="ghost"></a>';
      return '<a class="' + cls + '" href="' + sessionUrl(t.no) + '">' +
        '<span>' + dir + '</span><b>' + label(t) + '</b></a>';
    }

    return '<div class="pager">' +
      link(prev, 'pv', '&larr; 이전 회차') +
      link(next, 'nx', '다음 회차 &rarr;') +
    '</div>';
  }

  /* ---- 섹션 래퍼 ------------------------------------------------------ */

  function section(idx, title, desc, body) {
    if (!body) return '';
    return '<section>' +
      '<div class="shead"><span class="idx">' + idx + '</span><h2>' + title + '</h2>' +
      (desc ? '<p>' + desc + '</p>' : '') + '</div>' + body +
    '</section>';
  }

  /* ---- 공개 API ------------------------------------------------------- */

  w.UI = {
    pad: pad,
    label: label,
    fmtDate: fmtDate,
    nextSession: nextSession,
    sessionUrl: sessionUrl,
    slotCount: slotCount,
    totalMinutes: totalMinutes,
    nav: nav,
    sessionGrid: sessionGrid,
    assignTable: assignTable,
    prepTable: prepTable,
    stepsBar: stepsBar,
    flowTable: flowTable,
    recordList: recordList,
    pager: pager,
    section: section,
    find: function (no) {
      return S.sessions.filter(function (x) { return x.no === Number(no); })[0];
    }
  };

})(window);
