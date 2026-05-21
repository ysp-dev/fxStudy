/* ======================================================================
   FX 학습앱 — 모바일 (iPhone 15 Pro Max 기준) — 단일 JSX 파일
   ====================================================================== */

const MD = window.FX_DATA;
const {
  useState,
  useEffect,
  useMemo,
  useRef
} = React;

/* ---------- localStorage ---------- */
function useStored(key, initial) {
  const [v, setV] = useState(() => {
    try {
      const r = localStorage.getItem(key);
      return r == null ? initial : JSON.parse(r);
    } catch (e) {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(v));
    } catch (e) {}
  }, [key, v]);
  return [v, setV];
}

/* ---------- date helpers ---------- */
function compareMMDD(a, b) {
  return a.localeCompare(b);
}
function dayLabel(mmdd) {
  const [m, d] = mmdd.split('-').map(Number);
  return `${m}월 ${d}일`;
}
function dowKR(mmdd) {
  const [m, d] = mmdd.split('-').map(Number);
  const date = new Date(Date.UTC(2026, m - 1, d));
  return ['일', '월', '화', '수', '목', '금', '토'][date.getUTCDay()];
}
function daysUntilExam(today) {
  const [tm, td] = today.split('-').map(Number);
  const a = new Date(Date.UTC(2026, tm - 1, td));
  const b = new Date(Date.UTC(2026, 6, 11));
  return Math.round((b - a) / 86400000);
}

/* ---------- Mobile primitives ---------- */
function Pill({
  subj,
  children
}) {
  const labels = {
    1: '1과목',
    2: '2과목',
    3: '3과목',
    4: '모의'
  };
  return /*#__PURE__*/React.createElement("span", {
    className: `m-pill s${subj}`
  }, children || labels[subj]);
}
function Tag({
  children,
  variant
}) {
  return /*#__PURE__*/React.createElement("span", {
    className: `m-tag${variant ? ' ' + variant : ''}`
  }, children);
}
function Card({
  children,
  title,
  eyebrow,
  tinted,
  flat,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: `m-card${tinted ? ' tinted' : ''}${flat ? ' flat' : ''}`,
    style: style
  }, eyebrow && /*#__PURE__*/React.createElement("div", {
    className: "eyebrow"
  }, eyebrow), title && /*#__PURE__*/React.createElement("h3", null, title), children);
}
function Progress({
  value,
  max,
  moss
}) {
  const pct = max > 0 ? Math.min(100, value / max * 100) : 0;
  return /*#__PURE__*/React.createElement("div", {
    className: `m-progress${moss ? ' moss' : ''}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "fill",
    style: {
      width: pct + '%'
    }
  }));
}
function CheckTap({
  checked,
  onChange,
  label
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: `check-tap${checked ? ' checked' : ''}`,
    onClick: () => onChange(!checked)
  }, /*#__PURE__*/React.createElement("div", {
    className: "check-box"
  }), /*#__PURE__*/React.createElement("span", {
    className: "check-label"
  }, label));
}

/* ---------- Memo table (compact) ---------- */
function MemoTbl({
  data
}) {
  if (!data) return null;
  if (data.lines) {
    return /*#__PURE__*/React.createElement("ul", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 6
      }
    }, data.lines.map((l, i) => /*#__PURE__*/React.createElement("li", {
      key: i,
      style: {
        fontSize: 13,
        padding: '10px 12px',
        background: 'var(--card-2)',
        borderRadius: 8,
        lineHeight: 1.55
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "mark"
    }, l))));
  }
  return /*#__PURE__*/React.createElement("table", {
    className: "m-tbl"
  }, data.cols && /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, data.cols.map((c, i) => /*#__PURE__*/React.createElement("th", {
    key: i
  }, c)))), /*#__PURE__*/React.createElement("tbody", null, data.rows.map((row, ri) => /*#__PURE__*/React.createElement("tr", {
    key: ri
  }, row.map((cell, ci) => /*#__PURE__*/React.createElement("td", {
    key: ci,
    className: ci === 0 && row.length === 2 ? 'k' : ''
  }, cell))))));
}

/* =========================================================
   TODAY
   ========================================================= */
function ScreenToday({
  today,
  checks,
  setChecks,
  kpDone,
  kpTotal,
  flashKnown,
  flashTotal,
  errorCount,
  gotoTab,
  gotoSub
}) {
  const todayItem = MD.SCHEDULE.find(s => s.date === today);
  const next3 = MD.SCHEDULE.filter(s => compareMMDD(s.date, today) > 0).slice(0, 3);
  const TODAY_CHECKS = ['오늘 범위 완료', '문제풀이 완료', '오답노트 작성', '암기표 1회독'];
  const dayChecks = checks[today] || [false, false, false, false];
  function setCheck(i, v) {
    const c = [...dayChecks];
    c[i] = v;
    setChecks({
      ...checks,
      [today]: c
    });
  }
  const dday = daysUntilExam(today);
  const totalDays = MD.SCHEDULE.length;
  const passedDays = MD.SCHEDULE.filter(s => compareMMDD(s.date, today) < 0).length;
  const streak = useMemo(() => {
    let count = 0;
    let d = today;
    while (true) {
      const c = checks[d];
      if (!c || !c.some(Boolean)) break;
      count++;
      const [mo, dy] = d.split('-').map(Number);
      const dt = new Date(Date.UTC(2026, mo - 1, dy));
      dt.setUTCDate(dt.getUTCDate() - 1);
      if (dt.getUTCFullYear() !== 2026) break;
      const nm = String(dt.getUTCMonth() + 1).padStart(2, '0');
      const nd = String(dt.getUTCDate()).padStart(2, '0');
      d = `${nm}-${nd}`;
      if (d < '05-22') break;
    }
    return count;
  }, [checks, today]);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "dday-big"
  }, /*#__PURE__*/React.createElement("span", {
    className: "num"
  }, "D", dday >= 0 ? '-' : '+', Math.abs(dday)), /*#__PURE__*/React.createElement("span", {
    className: "meta"
  }, "\uC2DC\uD5D8\uC77C", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("strong", {
    className: "num"
  }, "2026.07.11"), " (\uD1A0)")), streak >= 2 && /*#__PURE__*/React.createElement("div", {
    className: "streak-chip"
  }, /*#__PURE__*/React.createElement("div", {
    className: "streak-dot"
  }), /*#__PURE__*/React.createElement("span", {
    className: "streak-num"
  }, streak, "\uC77C \uC5F0\uC18D"), /*#__PURE__*/React.createElement("span", {
    className: "streak-sub"
  }, "\uD559\uC2B5 \uC911")), todayItem ? /*#__PURE__*/React.createElement("div", {
    className: "today-hero"
  }, /*#__PURE__*/React.createElement("div", {
    className: "date"
  }, /*#__PURE__*/React.createElement("span", null, dayLabel(today)), /*#__PURE__*/React.createElement("span", null, "\xB7"), /*#__PURE__*/React.createElement(Pill, {
    subj: todayItem.subj
  }), todayItem.milestone && /*#__PURE__*/React.createElement(Tag, {
    variant: "ochre"
  }, "\uB9C8\uC77C\uC2A4\uD1A4"), todayItem.exam && /*#__PURE__*/React.createElement(Tag, {
    variant: "accent"
  }, "\uC2DC\uD5D8")), /*#__PURE__*/React.createElement("div", {
    className: "topic"
  }, todayItem.topic), /*#__PURE__*/React.createElement("div", {
    className: "deliv"
  }, "\uC0B0\uCD9C\uBB3C \xB7 ", /*#__PURE__*/React.createElement("strong", null, todayItem.deliv)), /*#__PURE__*/React.createElement("div", {
    className: "check-row"
  }, TODAY_CHECKS.map((label, i) => /*#__PURE__*/React.createElement(CheckTap, {
    key: i,
    checked: dayChecks[i],
    onChange: v => setCheck(i, v),
    label: label
  })))) : /*#__PURE__*/React.createElement("div", {
    className: "today-hero"
  }, /*#__PURE__*/React.createElement("div", {
    className: "date"
  }, dayLabel(today), " \xB7 ", dowKR(today), "\uC694\uC77C"), /*#__PURE__*/React.createElement("div", {
    className: "topic"
  }, "\uD559\uC2B5 \uC2A4\uCF00\uC904 \uC678 \uB0A0\uC9DC"), /*#__PURE__*/React.createElement("div", {
    className: "deliv"
  }, "\uD559\uC2B5\uAE30\uAC04 ", /*#__PURE__*/React.createElement("strong", null, "05/22 ~ 07/10"))), /*#__PURE__*/React.createElement("h4", {
    style: {
      margin: '18px 4px 8px'
    }
  }, "\uC804\uCCB4 \uC9C4\uD589\uB960"), /*#__PURE__*/React.createElement("div", {
    className: "stat-tiles"
  }, /*#__PURE__*/React.createElement("button", {
    className: "stat-tile",
    onClick: () => gotoTab('schedule')
  }, /*#__PURE__*/React.createElement("div", {
    className: "lbl"
  }, "\uC2A4\uCF00\uC904"), /*#__PURE__*/React.createElement("div", {
    className: "val"
  }, Math.round(passedDays / totalDays * 100), /*#__PURE__*/React.createElement("small", null, "%")), /*#__PURE__*/React.createElement(Progress, {
    value: passedDays,
    max: totalDays
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--ink-3)',
      marginTop: 6,
      fontFamily: 'var(--font-mono)'
    }
  }, passedDays, "/", totalDays, "\uC77C")), /*#__PURE__*/React.createElement("button", {
    className: "stat-tile",
    onClick: () => gotoTab('memo')
  }, /*#__PURE__*/React.createElement("div", {
    className: "lbl"
  }, "\uC554\uAE30\uCE74\uB4DC"), /*#__PURE__*/React.createElement("div", {
    className: "val"
  }, flashKnown, /*#__PURE__*/React.createElement("small", null, "/", flashTotal)), /*#__PURE__*/React.createElement(Progress, {
    value: flashKnown,
    max: flashTotal,
    moss: true
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--ink-3)',
      marginTop: 6
    }
  }, "\uC678\uC6C0")), /*#__PURE__*/React.createElement("button", {
    className: "stat-tile",
    onClick: () => gotoSub('keypoints')
  }, /*#__PURE__*/React.createElement("div", {
    className: "lbl"
  }, "\uBE48\uCD9C\uD3EC\uC778\uD2B8"), /*#__PURE__*/React.createElement("div", {
    className: "val"
  }, kpDone, /*#__PURE__*/React.createElement("small", null, "/", kpTotal)), /*#__PURE__*/React.createElement(Progress, {
    value: kpDone,
    max: kpTotal
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--ink-3)',
      marginTop: 6
    }
  }, "\uCCB4\uD06C")), /*#__PURE__*/React.createElement("button", {
    className: "stat-tile",
    onClick: () => gotoTab('errors')
  }, /*#__PURE__*/React.createElement("div", {
    className: "lbl"
  }, "\uC624\uB2F5"), /*#__PURE__*/React.createElement("div", {
    className: "val"
  }, errorCount, /*#__PURE__*/React.createElement("small", null, "\uAC74")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--ink-3)',
      marginTop: 10
    }
  }, "\uB204\uC801 \uAE30\uB85D"))), /*#__PURE__*/React.createElement("div", {
    className: "m-section-head"
  }, /*#__PURE__*/React.createElement("h2", null, "\uB9C8\uC77C\uC2A4\uD1A4"), /*#__PURE__*/React.createElement("span", {
    className: "meta"
  }, "\uD569\uACA9\uAD8C \uC810\uAC80 \uAE30\uC900")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, MD.MILESTONES.map((m, i) => {
    const passed = compareMMDD(m.date, today) < 0;
    const isNext = !passed && MD.MILESTONES.filter(x => compareMMDD(x.date, today) >= 0)[0] === m;
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      className: "milestone-mini",
      style: {
        opacity: passed ? 0.5 : 1
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "date",
      style: {
        color: isNext ? 'var(--accent)' : 'var(--ink-3)'
      }
    }, m.date), /*#__PURE__*/React.createElement("span", {
      className: "task",
      style: {
        textDecoration: passed ? 'line-through' : 'none',
        color: passed ? 'var(--ink-3)' : 'var(--ink)'
      }
    }, m.task), isNext && /*#__PURE__*/React.createElement(Tag, {
      variant: "accent"
    }, "\uB2E4\uC74C"), passed && /*#__PURE__*/React.createElement(Tag, {
      variant: "moss"
    }, "\uC644\uB8CC"));
  })), /*#__PURE__*/React.createElement("div", {
    className: "m-section-head"
  }, /*#__PURE__*/React.createElement("h2", null, "\uC55E\uC73C\uB85C 3\uC77C"), /*#__PURE__*/React.createElement("span", {
    className: "meta"
  }, "\uB2E4\uC74C \uD559\uC2B5\uC77C")), /*#__PURE__*/React.createElement("div", {
    className: "m-list"
  }, next3.map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "sched-row",
    style: {
      borderTop: i === 0 ? 0 : '0.5px solid var(--rule-soft)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "sched-date"
  }, /*#__PURE__*/React.createElement("span", null, s.date), /*#__PURE__*/React.createElement("span", {
    className: `dow${s.dow === '토' ? ' sat' : s.dow === '일' ? ' sun' : ''}`
  }, s.dow)), /*#__PURE__*/React.createElement("div", {
    className: "topic-main"
  }, /*#__PURE__*/React.createElement("div", {
    className: "topic-pills"
  }, /*#__PURE__*/React.createElement(Pill, {
    subj: s.subj
  }, s.subj === 4 ? '모의' : s.subj + '과목')), /*#__PURE__*/React.createElement("div", null, s.topic), s.deliv && /*#__PURE__*/React.createElement("div", {
    className: "topic-deliv"
  }, "\u2192 ", s.deliv)), /*#__PURE__*/React.createElement("div", null)))));
}

/* =========================================================
   SCHEDULE
   ========================================================= */
function ScreenSchedule({
  today,
  checks,
  setChecks
}) {
  // Find current week
  const currentWeek = MD.WEEKLY.find(w => {
    const [s, e] = w.range.split(' ~ ');
    return compareMMDD(today, s) >= 0 && compareMMDD(today, e) <= 0;
  });
  const [selectedWeek, setSelectedWeek] = useState(() => currentWeek ? currentWeek.week : 1);
  const week = MD.WEEKLY.find(w => w.week === selectedWeek);
  const [start, end] = week.range.split(' ~ ');
  const days = MD.SCHEDULE.filter(s => compareMMDD(s.date, start) >= 0 && compareMMDD(s.date, end) <= 0);
  function isDone(date) {
    const c = checks[date];
    return c && c.every(Boolean);
  }
  function toggle(date) {
    const cur = checks[date] || [false, false, false, false];
    const all = cur.every(Boolean);
    setChecks({
      ...checks,
      [date]: all ? [false, false, false, false] : [true, true, true, true]
    });
  }
  const doneInWeek = days.filter(d => isDone(d.date)).length;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "week-tabs"
  }, MD.WEEKLY.map(w => {
    const [s2, e2] = w.range.split(' ~ ');
    const wDays = MD.SCHEDULE.filter(d => compareMMDD(d.date, s2) >= 0 && compareMMDD(d.date, e2) <= 0);
    const wDone = wDays.filter(d => isDone(d.date)).length;
    return /*#__PURE__*/React.createElement("button", {
      key: w.week,
      className: `week-tab${selectedWeek === w.week ? ' active' : ''}`,
      onClick: () => setSelectedWeek(w.week)
    }, w.week, "\uC8FC\uCC28", /*#__PURE__*/React.createElement("span", {
      className: "week-status"
    }, wDone, "/", wDays.length));
  })), /*#__PURE__*/React.createElement("div", {
    className: "m-card",
    style: {
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 8,
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("strong", {
    style: {
      fontFamily: 'var(--font-serif)',
      fontSize: 17
    }
  }, week.week, "\uC8FC\uCC28"), /*#__PURE__*/React.createElement("span", {
    className: "num",
    style: {
      fontSize: 11,
      color: 'var(--ink-3)'
    }
  }, week.range), /*#__PURE__*/React.createElement("span", {
    className: "num",
    style: {
      marginLeft: 'auto',
      fontSize: 12,
      color: doneInWeek === days.length ? 'var(--moss)' : 'var(--ink-3)'
    }
  }, doneInWeek, "/", days.length)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--ink-2)'
    }
  }, week.goal), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10
    }
  }, /*#__PURE__*/React.createElement(Progress, {
    value: doneInWeek,
    max: days.length,
    moss: doneInWeek === days.length
  }))), /*#__PURE__*/React.createElement("div", {
    className: "m-list"
  }, days.map((d, i) => {
    const isToday = d.date === today;
    const isPast = compareMMDD(d.date, today) < 0;
    const done = isDone(d.date);
    return /*#__PURE__*/React.createElement("div", {
      key: d.date,
      className: `sched-row${isToday ? ' today-row' : ''}${isPast && !isToday ? ' past-row' : ''}`,
      onClick: () => toggle(d.date)
    }, /*#__PURE__*/React.createElement("div", {
      className: "sched-date"
    }, /*#__PURE__*/React.createElement("span", null, d.date), /*#__PURE__*/React.createElement("span", {
      className: `dow${d.dow === '토' ? ' sat' : d.dow === '일' ? ' sun' : ''}`
    }, d.dow)), /*#__PURE__*/React.createElement("div", {
      className: "topic-main"
    }, /*#__PURE__*/React.createElement("div", {
      className: "topic-pills"
    }, /*#__PURE__*/React.createElement(Pill, {
      subj: d.subj
    }, d.subj === 4 ? '모의' : d.subj + '과목'), d.milestone && /*#__PURE__*/React.createElement(Tag, {
      variant: "ochre"
    }, "\uB9C8\uC77C\uC2A4\uD1A4"), d.exam && /*#__PURE__*/React.createElement(Tag, {
      variant: "accent"
    }, "\uC2DC\uD5D8")), /*#__PURE__*/React.createElement("div", null, d.topic), d.deliv && /*#__PURE__*/React.createElement("div", {
      className: "topic-deliv"
    }, "\u2192 ", d.deliv)), /*#__PURE__*/React.createElement("div", {
      className: `check-box`,
      style: {
        width: 24,
        height: 24,
        borderRadius: 6,
        border: `1.5px solid ${done ? 'var(--accent)' : 'var(--ink-3)'}`,
        background: done ? 'var(--accent)' : 'rgba(255,255,255,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: '0 0 24px'
      }
    }, done && /*#__PURE__*/React.createElement("span", {
      style: {
        color: '#fff',
        fontSize: 14,
        lineHeight: 1
      }
    }, "\u2713")));
  })), /*#__PURE__*/React.createElement("div", {
    className: "m-rule"
  }), /*#__PURE__*/React.createElement(Card, {
    eyebrow: "\uC870\uC815",
    title: "\uC9C0\uC5F0 \uC2DC \uC870\uC815 \uC6D0\uCE59",
    tinted: true
  }, /*#__PURE__*/React.createElement("ul", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, MD.DELAY_RULES.map((r, i) => /*#__PURE__*/React.createElement("li", {
    key: i,
    style: {
      fontSize: 12.5,
      color: 'var(--ink-2)',
      lineHeight: 1.6,
      paddingLeft: 14,
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      left: 0,
      color: 'var(--accent)'
    }
  }, "\u2192"), r)))));
}

/* =========================================================
   MEMO (Flashcards + Tables)
   ========================================================= */
function ScreenMemo({
  flashState,
  setFlashState
}) {
  const [mode, setMode] = useState('cards');
  const [subj, setSubj] = useState('all');
  const [onlyUnknown, setOnlyUnknown] = useState(false);
  const [shuffleKey, setShuffleKey] = useState(0);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [swipeDir, setSwipeDir] = useState(null);
  const cardId = c => `${c.subj}:${c.topic}:${c.q}`;
  const cards = useMemo(() => {
    let c = MD.FLASHCARDS.filter(x => subj === 'all' || x.subj === subj);
    if (onlyUnknown) c = c.filter(x => flashState[cardId(x)] !== 'known');
    if (shuffleKey > 0) {
      c = [...c];
      for (let i = c.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [c[i], c[j]] = [c[j], c[i]];
      }
    }
    return c;
  }, [subj, onlyUnknown, shuffleKey, flashState]);
  useEffect(() => {
    setIndex(0);
    setFlipped(false);
  }, [subj, onlyUnknown, shuffleKey]);
  const card = cards[index];
  const total = cards.length;
  const knownAll = MD.FLASHCARDS.filter(c => flashState[cardId(c)] === 'known').length;
  function mark(status) {
    if (!card) return;
    setFlashState({
      ...flashState,
      [cardId(card)]: status
    });
    const dir = status === 'known' ? 'right' : status === 'unknown' ? 'left' : null;
    setSwipeDir(dir);
    setTimeout(() => {
      setFlipped(false);
      setSwipeDir(null);
      setIndex(i => Math.min(total - 1, i + 1));
    }, dir ? 230 : 80);
  }

  // Touch swipe handling
  const startX = useRef(null);
  const startY = useRef(null);
  function onTouchStart(e) {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
  }
  function onTouchEnd(e) {
    if (startX.current == null) return;
    const dx = e.changedTouches[0].clientX - startX.current;
    const dy = e.changedTouches[0].clientY - startY.current;
    startX.current = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
      mark(dx > 0 ? 'known' : 'unknown');
    }
  }
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "seg-tabs",
    style: {
      marginBottom: 14,
      display: 'flex'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: mode === 'cards' ? 'active' : '',
    onClick: () => setMode('cards')
  }, "\uD50C\uB798\uC2DC\uCE74\uB4DC"), /*#__PURE__*/React.createElement("button", {
    className: mode === 'tables' ? 'active' : '',
    onClick: () => setMode('tables')
  }, "\uC554\uAE30\uD45C")), mode === 'cards' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "flash-filter-bar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "seg-tabs"
  }, ['all', 1, 2, 3].map(s => /*#__PURE__*/React.createElement("button", {
    key: s,
    className: subj === s ? 'active' : '',
    onClick: () => setSubj(s)
  }, s === 'all' ? '전체' : `${s}과목`))), /*#__PURE__*/React.createElement("span", {
    className: "flash-counter"
  }, total > 0 ? `${index + 1}/${total}` : '0/0')), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 14,
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement("label", {
    className: "check-tap",
    style: {
      flex: 1,
      padding: '10px 12px',
      minHeight: 0
    },
    onClick: () => setOnlyUnknown(!onlyUnknown)
  }, /*#__PURE__*/React.createElement("div", {
    className: "check-box",
    style: onlyUnknown ? {
      background: 'var(--accent)',
      borderColor: 'var(--accent)'
    } : {}
  }, onlyUnknown && /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#fff',
      fontSize: 12,
      lineHeight: 1
    }
  }, "\u2713")), /*#__PURE__*/React.createElement("span", {
    className: "check-label"
  }, "\uBBF8\uC219\uC9C0\uB9CC \uBCF4\uAE30")), /*#__PURE__*/React.createElement("button", {
    className: "m-btn sm ghost",
    onClick: () => setShuffleKey(k => k + 1)
  }, "\uD83C\uDFB2 \uC11E\uAE30")), card ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "flash-mobile-stage"
  }, /*#__PURE__*/React.createElement("div", {
    className: `flash-mobile-card${flipped ? ' flipped' : ''}${swipeDir === 'left' ? ' swipe-left' : swipeDir === 'right' ? ' swipe-right' : ''}`,
    onClick: () => setFlipped(f => !f),
    onTouchStart: onTouchStart,
    onTouchEnd: onTouchEnd
  }, /*#__PURE__*/React.createElement("div", {
    className: "flash-mobile-face front"
  }, /*#__PURE__*/React.createElement("div", {
    className: "face-head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "label"
  }, "Question \xB7 ", card.topic), /*#__PURE__*/React.createElement(Pill, {
    subj: card.subj
  })), /*#__PURE__*/React.createElement("div", {
    className: "q"
  }, card.q), /*#__PURE__*/React.createElement("div", {
    className: "hint"
  }, "\uD0ED\uD574\uC11C \uB4A4\uC9D1\uAE30 \xB7 \uC88C\uC6B0\uB85C \uC2A4\uC640\uC774\uD504")), /*#__PURE__*/React.createElement("div", {
    className: "flash-mobile-face back"
  }, /*#__PURE__*/React.createElement("div", {
    className: "face-head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "label"
  }, "Answer \xB7 ", card.topic), /*#__PURE__*/React.createElement(Pill, {
    subj: card.subj
  })), /*#__PURE__*/React.createElement("div", {
    className: "a",
    dangerouslySetInnerHTML: {
      __html: card.a
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "hint"
  }, "\uBC84\uD2BC \uB610\uB294 \uC88C\uC6B0 \uC2A4\uC640\uC774\uD504\uB85C \uD3C9\uAC00")))), /*#__PURE__*/React.createElement("div", {
    className: "flash-controls-mobile"
  }, /*#__PURE__*/React.createElement("button", {
    className: "flash-eval no",
    onClick: () => mark('unknown')
  }, /*#__PURE__*/React.createElement("span", {
    className: "label-num"
  }, "\uBAA8\uB984"), /*#__PURE__*/React.createElement("span", {
    className: "label-sub"
  }, "\u2190 \uC2A4\uC640\uC774\uD504")), /*#__PURE__*/React.createElement("button", {
    className: "flash-eval so",
    onClick: () => mark('soso')
  }, /*#__PURE__*/React.createElement("span", {
    className: "label-num"
  }, "\uC560\uB9E4"), /*#__PURE__*/React.createElement("span", {
    className: "label-sub"
  }, "\uB2E4\uC2DC \uBCF4\uAE30")), /*#__PURE__*/React.createElement("button", {
    className: "flash-eval yes",
    onClick: () => mark('known')
  }, /*#__PURE__*/React.createElement("span", {
    className: "label-num"
  }, "\uC678\uC6C0"), /*#__PURE__*/React.createElement("span", {
    className: "label-sub"
  }, "\uC2A4\uC640\uC774\uD504 \u2192"))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14,
      fontSize: 11,
      color: 'var(--ink-3)',
      textAlign: 'center',
      fontFamily: 'var(--font-mono)'
    }
  }, "\uC804\uCCB4 \uC678\uC6C0 ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--moss)',
      fontWeight: 600
    }
  }, knownAll), " / ", MD.FLASHCARDS.length)) : /*#__PURE__*/React.createElement("div", {
    className: "empty"
  }, "\uC870\uAC74\uC5D0 \uB9DE\uB294 \uCE74\uB4DC\uAC00 \uC5C6\uC5B4\uC694. \uD544\uD130\uB97C \uBC14\uAFD4\uBCF4\uC138\uC694.")), mode === 'tables' && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, Object.entries(MD.MEMORIZE).map(([key, tbl]) => /*#__PURE__*/React.createElement(Card, {
    key: key,
    eyebrow: "\uC554\uAE30\uD45C",
    title: tbl.title
  }, /*#__PURE__*/React.createElement(MemoTbl, {
    data: tbl
  })))));
}

/* =========================================================
   ERRORS
   ========================================================= */
function ScreenErrors({
  errors,
  setErrors,
  repeatChecks,
  setRepeatChecks
}) {
  const [showSheet, setShowSheet] = useState(false);
  const [filterSubj, setFilterSubj] = useState('all');
  useEffect(() => {
    const screen = document.querySelector('.m-screen');
    if (!screen) return;
    screen.style.overflow = showSheet ? 'hidden' : '';
    return () => {
      screen.style.overflow = '';
    };
  }, [showSheet]);
  const [draft, setDraft] = useState({
    date: '05-22',
    subj: 1,
    source: '',
    question: '',
    mine: '',
    correct: '',
    why: '',
    rule: ''
  });
  function addError() {
    if (!draft.question || !draft.correct) return;
    setErrors([{
      ...draft,
      id: Date.now(),
      reviews: [false, false, false]
    }, ...errors]);
    setDraft({
      date: '05-22',
      subj: 1,
      source: '',
      question: '',
      mine: '',
      correct: '',
      why: '',
      rule: ''
    });
    setShowSheet(false);
  }
  function delError(id) {
    if (!confirm('이 오답을 삭제할까요?')) return;
    setErrors(errors.filter(e => e.id !== id));
  }
  function toggleReview(id, idx) {
    setErrors(errors.map(e => {
      if (e.id !== id) return e;
      const reviews = [...(e.reviews || [false, false, false])];
      reviews[idx] = !reviews[idx];
      return {
        ...e,
        reviews
      };
    }));
  }
  const showSeed = errors.length === 0;
  const displayErrors = showSeed ? MD.ERROR_EXAMPLES.map((e, i) => ({
    ...e,
    id: 'seed-' + i,
    date: '예시'
  })).filter(e => filterSubj === 'all' || e.subj === filterSubj) : errors.filter(e => filterSubj === 'all' || e.subj === filterSubj);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      marginBottom: 12,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "m-btn primary sm",
    onClick: () => setShowSheet(true)
  }, "+ \uC624\uB2F5 \uCD94\uAC00"), /*#__PURE__*/React.createElement("div", {
    className: "seg-tabs",
    style: {
      marginLeft: 'auto'
    }
  }, ['all', 1, 2, 3].map(s => /*#__PURE__*/React.createElement("button", {
    key: s,
    className: filterSubj === s ? 'active' : '',
    onClick: () => setFilterSubj(s)
  }, s === 'all' ? '전체' : `${s}`)))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--ink-3)',
      lineHeight: 1.55,
      marginBottom: 14,
      padding: '0 4px'
    }
  }, "\uD55C \uBB38\uC81C\uB2F9 ", /*#__PURE__*/React.createElement("strong", {
    style: {
      color: 'var(--ink-2)'
    }
  }, "5\uC904"), "\uC774\uBA74 \uCDA9\uBD84. \uAC19\uC740 \uC8FC\uC81C\uB85C 3\uBC88 \uD2C0\uB9AC\uBA74 \uC544\uB798 \uBC18\uBCF5\uC624\uB2F5 \uD45C\uC2DC\uD558\uC138\uC694.", showSeed && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      marginTop: 4,
      color: 'var(--accent)'
    }
  }, "\u203B \uC608\uC2DC \uD45C\uC2DC \uC911 \u2014 \uC624\uB2F5\uC744 \uCD94\uAC00\uD558\uBA74 \uC0AC\uB77C\uC9D1\uB2C8\uB2E4")), displayErrors.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "empty"
  }, "\uD544\uD130\uC5D0 \uB9DE\uB294 \uC624\uB2F5\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.") : /*#__PURE__*/React.createElement("div", null, displayErrors.map(e => /*#__PURE__*/React.createElement("div", {
    key: e.id,
    className: "err-mobile-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "head-row"
  }, /*#__PURE__*/React.createElement(Pill, {
    subj: e.subj
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: 'var(--ink-3)',
      fontFamily: 'var(--font-mono)'
    }
  }, e.date), e.source && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: 'var(--ink-3)'
    }
  }, "\xB7 ", e.source), !String(e.id).startsWith('seed') && /*#__PURE__*/React.createElement("button", {
    className: "m-btn sm ghost",
    style: {
      marginLeft: 'auto',
      color: 'var(--ink-4)',
      padding: '4px 8px',
      minHeight: 0,
      fontSize: 11
    },
    onClick: () => delError(e.id)
  }, "\uC0AD\uC81C")), /*#__PURE__*/React.createElement("div", {
    className: "q-text"
  }, e.question), /*#__PURE__*/React.createElement("div", {
    className: "ans-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lbl"
  }, "\uB0B4\uB2F5"), /*#__PURE__*/React.createElement("span", null, e.mine || '—')), /*#__PURE__*/React.createElement("div", {
    className: "ans-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lbl"
  }, "\uC815\uB2F5"), /*#__PURE__*/React.createElement("strong", null, e.correct || '—')), e.why && /*#__PURE__*/React.createElement("div", {
    className: "ans-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "lbl"
  }, "\uC774\uC720"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--ink-3)'
    }
  }, e.why)), e.rule && /*#__PURE__*/React.createElement("div", {
    className: "rule"
  }, /*#__PURE__*/React.createElement("span", {
    className: "rule-tag"
  }, "\uB2E4\uC74C \uAE30\uC900"), e.rule), /*#__PURE__*/React.createElement("div", {
    className: "rev"
  }, /*#__PURE__*/React.createElement("span", null, "\uBCF5\uC2B5"), /*#__PURE__*/React.createElement("div", {
    className: "dots"
  }, [0, 1, 2].map(i => {
    const isSeed = String(e.id).startsWith('seed');
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      className: `dot${e.reviews && e.reviews[i] ? ' on' : ''}`,
      style: {
        opacity: isSeed ? 0.25 : 1,
        cursor: isSeed ? 'default' : 'pointer'
      },
      onClick: () => !isSeed && toggleReview(e.id, i)
    });
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'auto',
      fontSize: 10,
      color: 'var(--ink-4)'
    }
  }, "\uB2F9\uC77C \xB7 3\uC77C\uD6C4 \xB7 \uC2DC\uD5D83\uC77C\uC804"))))), /*#__PURE__*/React.createElement("div", {
    className: "m-rule"
  }), /*#__PURE__*/React.createElement(Card, {
    eyebrow: "\uBC18\uBCF5\uC624\uB2F5",
    title: "3\uD68C \uC774\uC0C1 \uD5F7\uAC08\uB9AC\uB294 \uC8FC\uC81C",
    tinted: true
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 12,
      color: 'var(--ink-3)',
      marginBottom: 12,
      lineHeight: 1.55
    }
  }, "\uCCB4\uD06C\uB41C \uC8FC\uC81C\uB294 \uC2DC\uD5D8 \uC9C1\uC804 \uC555\uCD95 \uBCF5\uC2B5 \uB300\uC0C1\uC785\uB2C8\uB2E4."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 6
    }
  }, MD.REPEAT_TOPICS.map((topic, i) => {
    const checked = !!repeatChecks[topic];
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      className: `kp-mobile-item${checked ? ' checked' : ''}`,
      style: {
        marginBottom: 0,
        padding: '8px 10px',
        minHeight: 40
      },
      onClick: () => setRepeatChecks({
        ...repeatChecks,
        [topic]: !checked
      })
    }, /*#__PURE__*/React.createElement("div", {
      className: "check-box",
      style: {
        width: 18,
        height: 18,
        flex: '0 0 18px'
      }
    }), /*#__PURE__*/React.createElement("span", {
      className: "it-text",
      style: {
        fontSize: 12
      }
    }, topic));
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement(Card, {
    eyebrow: "\uC2DC\uD5D8 \uC9C1\uC804",
    title: "\uB9C8\uC9C0\uB9C9\uAE4C\uC9C0 \uD5F7\uAC08\uB9AC\uB294 \uAC83"
  }, /*#__PURE__*/React.createElement("table", {
    className: "m-tbl"
  }, /*#__PURE__*/React.createElement("tbody", null, MD.FINAL_LINES.map((l, i) => /*#__PURE__*/React.createElement("tr", {
    key: i
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      width: '30%',
      fontWeight: 600
    }
  }, l.topic), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement("span", {
    className: "mark"
  }, l.mnemonic)))))))), showSheet && /*#__PURE__*/React.createElement("div", {
    className: "sheet-backdrop",
    onClick: e => {
      if (e.target.classList.contains('sheet-backdrop')) setShowSheet(false);
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "sheet"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sheet-handle"
  }), /*#__PURE__*/React.createElement("h3", null, "\uC624\uB2F5 \uCD94\uAC00"), /*#__PURE__*/React.createElement("div", {
    className: "form-row dual"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "\uB0A0\uC9DC (MM-DD)"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: draft.date,
    onChange: e => setDraft({
      ...draft,
      date: e.target.value
    })
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "\uACFC\uBAA9"), /*#__PURE__*/React.createElement("select", {
    value: draft.subj,
    onChange: e => setDraft({
      ...draft,
      subj: parseInt(e.target.value)
    })
  }, /*#__PURE__*/React.createElement("option", {
    value: 1
  }, "1\uACFC\uBAA9"), /*#__PURE__*/React.createElement("option", {
    value: 2
  }, "2\uACFC\uBAA9"), /*#__PURE__*/React.createElement("option", {
    value: 3
  }, "3\uACFC\uBAA9")))), /*#__PURE__*/React.createElement("div", {
    className: "form-row"
  }, /*#__PURE__*/React.createElement("label", null, "\uC790\uB8CC/\uCD9C\uCC98"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: draft.source,
    onChange: e => setDraft({
      ...draft,
      source: e.target.value
    }),
    placeholder: "\uC608: \uAE38\uB77C\uC7A1\uC774 \uBB38\uC81C"
  })), /*#__PURE__*/React.createElement("div", {
    className: "form-row"
  }, /*#__PURE__*/React.createElement("label", null, "\uBB38\uD56D/\uC8FC\uC81C"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: draft.question,
    onChange: e => setDraft({
      ...draft,
      question: e.target.value
    }),
    placeholder: "\uC608: \uBE44\uAC70\uC8FC\uC790 \uC6D0\uD654\uB300\uCD9C"
  })), /*#__PURE__*/React.createElement("div", {
    className: "form-row dual"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "\uB0B4 \uB2F5"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: draft.mine,
    onChange: e => setDraft({
      ...draft,
      mine: e.target.value
    })
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "\uC815\uB2F5"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: draft.correct,
    onChange: e => setDraft({
      ...draft,
      correct: e.target.value
    })
  }))), /*#__PURE__*/React.createElement("div", {
    className: "form-row"
  }, /*#__PURE__*/React.createElement("label", null, "\uD2C0\uB9B0 \uC774\uC720"), /*#__PURE__*/React.createElement("textarea", {
    value: draft.why,
    onChange: e => setDraft({
      ...draft,
      why: e.target.value
    })
  })), /*#__PURE__*/React.createElement("div", {
    className: "form-row"
  }, /*#__PURE__*/React.createElement("label", null, "\uB2E4\uC74C \uD310\uB2E8 \uAE30\uC900"), /*#__PURE__*/React.createElement("textarea", {
    value: draft.rule,
    onChange: e => setDraft({
      ...draft,
      rule: e.target.value
    })
  })), /*#__PURE__*/React.createElement("div", {
    className: "actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "m-btn",
    onClick: () => setShowSheet(false)
  }, "\uCDE8\uC18C"), /*#__PURE__*/React.createElement("button", {
    className: "m-btn primary",
    onClick: addError
  }, "\uC800\uC7A5")))));
}

/* =========================================================
   SUMMARY (3과목 요약)
   ========================================================= */
function ScreenSummary() {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--ink-2)',
      lineHeight: 1.6,
      marginBottom: 18,
      padding: '0 4px'
    }
  }, "3\uACFC\uBAA9\uC758 \uC131\uACA9\uACFC \uC7A5\uBCC4 \uC9C0\uB3C4. \uCD9C\uC81C \uBE44\uC911 ", /*#__PURE__*/React.createElement("strong", null, "1\uACFC\uBAA9 50% \xB7 2\uACFC\uBAA9 30% \xB7 3\uACFC\uBAA9 20%"), "."), MD.SUBJECTS.map(s => /*#__PURE__*/React.createElement("section", {
    key: s.num,
    className: "subj-mobile-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "subj-mobile-head"
  }, /*#__PURE__*/React.createElement(Pill, {
    subj: s.num
  }), /*#__PURE__*/React.createElement("h2", null, s.name), /*#__PURE__*/React.createElement(Tag, {
    variant: "ochre"
  }, s.weight, "%")), /*#__PURE__*/React.createElement("p", {
    className: "subj-mobile-character"
  }, s.character), /*#__PURE__*/React.createElement("h4", {
    style: {
      marginBottom: 8
    }
  }, "\uC7A5\uBCC4 \uC694\uC57D"), s.chapters.map((c, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "chapter-mini"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ch-num"
  }, c[0]), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "ch-title"
  }, c[1]), /*#__PURE__*/React.createElement("div", {
    className: "ch-detail"
  }, c[2])))), /*#__PURE__*/React.createElement("h4", {
    style: {
      marginTop: 14,
      marginBottom: 6
    }
  }, "\uACF5\uBD80 \uD3EC\uC778\uD2B8"), /*#__PURE__*/React.createElement("ul", {
    className: "point-list"
  }, s.points.map((p, i) => /*#__PURE__*/React.createElement("li", {
    key: i
  }, p))))), /*#__PURE__*/React.createElement("div", {
    className: "m-rule"
  }), /*#__PURE__*/React.createElement(Card, {
    eyebrow: "\uC2DC\uD5D8\uC804\uB7B5",
    title: "\uACFC\uBAA9\uBCC4 \uC810\uC218 \uC804\uB7B5"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, MD.SCORE_STRATEGY.map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: i
  }, /*#__PURE__*/React.createElement(Pill, {
    subj: s.subj
  }, s.subj, "\uACFC\uBAA9"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 6,
      fontSize: 13,
      color: 'var(--ink-2)',
      lineHeight: 1.55
    }
  }, s.advice))))));
}

/* =========================================================
   KEYPOINTS (빈출 포인트)
   ========================================================= */
function ScreenKeyPoints({
  checks,
  setChecks
}) {
  const [activeSubj, setActiveSubj] = useState(1);
  const flatKey = (si, gi, ii) => `${si}.${gi}.${ii}`;
  const subj = MD.KEYPOINTS[activeSubj - 1];
  const total = subj.groups.reduce((a, g) => a + g.items.length, 0);
  const done = subj.groups.reduce((a, g, gi) => a + g.items.filter((_, ii) => checks[flatKey(activeSubj - 1, gi, ii)]).length, 0);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--ink-2)',
      lineHeight: 1.55,
      marginBottom: 14,
      padding: '0 4px'
    }
  }, "\uC2A4\uC2A4\uB85C \uC124\uBA85\uD560 \uC218 \uC788\uAC8C \uB41C \uD56D\uBAA9\uC5D0 \uCCB4\uD06C\uD558\uC138\uC694."), /*#__PURE__*/React.createElement("div", {
    className: "seg-tabs",
    style: {
      marginBottom: 14,
      display: 'flex',
      width: '100%'
    }
  }, [1, 2, 3].map(s => /*#__PURE__*/React.createElement("button", {
    key: s,
    className: activeSubj === s ? 'active' : '',
    onClick: () => setActiveSubj(s),
    style: {
      flex: 1
    }
  }, s, "\uACFC\uBAA9"))), /*#__PURE__*/React.createElement("div", {
    className: "m-card",
    style: {
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("strong", {
    style: {
      fontSize: 14,
      fontFamily: 'var(--font-serif)'
    }
  }, subj.name), /*#__PURE__*/React.createElement("span", {
    className: "num",
    style: {
      fontSize: 12,
      color: 'var(--ink-3)'
    }
  }, done, " / ", total)), /*#__PURE__*/React.createElement(Progress, {
    value: done,
    max: total
  })), subj.groups.map((g, gi) => /*#__PURE__*/React.createElement("div", {
    key: gi,
    className: "kp-group-mobile"
  }, /*#__PURE__*/React.createElement("div", {
    className: "group-head"
  }, /*#__PURE__*/React.createElement(Tag, null, g.title.split('.')[0]), /*#__PURE__*/React.createElement("span", null, g.title.split('.').slice(1).join('.').trim())), g.items.map((it, ii) => {
    const k = flatKey(activeSubj - 1, gi, ii);
    const checked = !!checks[k];
    return /*#__PURE__*/React.createElement("div", {
      key: ii,
      className: `kp-mobile-item${checked ? ' checked' : ''}`,
      onClick: () => setChecks({
        ...checks,
        [k]: !checked
      })
    }, /*#__PURE__*/React.createElement("div", {
      className: "check-box"
    }), /*#__PURE__*/React.createElement("span", {
      className: "it-text"
    }, it));
  }))));
}

/* =========================================================
   MOCK EXAM
   ========================================================= */
function ScreenMock({
  scores,
  setScores
}) {
  function getVerdict(t) {
    if (t >= 70) return {
      label: '안정권',
      cls: 'safe'
    };
    if (t >= 65) return {
      label: '합격권 — 오답 반복 필요',
      cls: 'safe'
    };
    if (t >= 60) return {
      label: '위험권 — 약점 보강',
      cls: 'warn'
    };
    return {
      label: '60점 미만 — 즉시 재학습',
      cls: 'risk'
    };
  }
  function setScore(round, key, val) {
    setScores({
      ...scores,
      [round]: {
        ...(scores[round] || {}),
        [key]: val
      }
    });
  }
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Card, {
    eyebrow: "\uC2E4\uC804 \uD480\uC774",
    title: "\uC2DC\uAC04 \uBD84\uBC30",
    tinted: true
  }, /*#__PURE__*/React.createElement("table", {
    className: "m-tbl",
    style: {
      background: 'transparent',
      border: 0
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "\uAD6C\uBD84"), /*#__PURE__*/React.createElement("th", {
    style: {
      textAlign: 'right'
    }
  }, "\uBB38\uD56D"), /*#__PURE__*/React.createElement("th", {
    style: {
      textAlign: 'right'
    }
  }, "\uC2DC\uAC04"))), /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "1\uACFC\uBAA9"), /*#__PURE__*/React.createElement("td", {
    className: "num",
    style: {
      textAlign: 'right'
    }
  }, "35"), /*#__PURE__*/React.createElement("td", {
    className: "num",
    style: {
      textAlign: 'right'
    }
  }, "50\uBD84")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "2\uACFC\uBAA9"), /*#__PURE__*/React.createElement("td", {
    className: "num",
    style: {
      textAlign: 'right'
    }
  }, "25"), /*#__PURE__*/React.createElement("td", {
    className: "num",
    style: {
      textAlign: 'right'
    }
  }, "35\uBD84")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "3\uACFC\uBAA9"), /*#__PURE__*/React.createElement("td", {
    className: "num",
    style: {
      textAlign: 'right'
    }
  }, "20"), /*#__PURE__*/React.createElement("td", {
    className: "num",
    style: {
      textAlign: 'right'
    }
  }, "30\uBD84")), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", null, "\uB9C8\uD0B9\xB7\uAC80\uD1A0"), /*#__PURE__*/React.createElement("td", {
    style: {
      textAlign: 'right'
    }
  }, "\u2014"), /*#__PURE__*/React.createElement("td", {
    className: "num",
    style: {
      textAlign: 'right'
    }
  }, "5\uBD84"))))), /*#__PURE__*/React.createElement("div", {
    className: "m-section-head"
  }, /*#__PURE__*/React.createElement("h2", null, "\uD68C\uCC28\uBCC4 \uC810\uC218"), /*#__PURE__*/React.createElement("span", {
    className: "meta"
  }, "\uD569\uACA9: \uD3C9\uADE0 60+, \uACFC\uBAA9 40+")), [1, 2].map(round => {
    const r = scores[round] || {};
    const s1 = parseFloat(r.s1) || 0,
      s2 = parseFloat(r.s2) || 0,
      s3 = parseFloat(r.s3) || 0;
    const total = r.s1 || r.s2 || r.s3 ? s1 / 35 * 43.75 + s2 / 25 * 31.25 + s3 / 20 * 25 : 0;
    const v = getVerdict(total);
    const fail = (r.s1 || r.s2 || r.s3) && (s1 < 14 || s2 < 10 || s3 < 8);
    return /*#__PURE__*/React.createElement("div", {
      key: round,
      className: "m-card",
      style: {
        marginBottom: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'baseline',
        gap: 8,
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("strong", {
      style: {
        fontFamily: 'var(--font-serif)',
        fontSize: 15
      }
    }, "\uC81C", round, "\uD68C"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        color: 'var(--ink-3)'
      }
    }, round === 1 ? '07-08 (수)' : '07-09 (목)')), /*#__PURE__*/React.createElement("div", {
      className: "score-grid-mobile"
    }, /*#__PURE__*/React.createElement("div", {
      className: "score-cell-mobile"
    }, /*#__PURE__*/React.createElement("div", {
      className: "lbl"
    }, "1\uACFC\uBAA9 /35"), /*#__PURE__*/React.createElement("input", {
      type: "number",
      max: 35,
      min: 0,
      value: r.s1 || '',
      onChange: e => setScore(round, 's1', e.target.value),
      placeholder: "\u2014"
    })), /*#__PURE__*/React.createElement("div", {
      className: "score-cell-mobile"
    }, /*#__PURE__*/React.createElement("div", {
      className: "lbl"
    }, "2\uACFC\uBAA9 /25"), /*#__PURE__*/React.createElement("input", {
      type: "number",
      max: 25,
      min: 0,
      value: r.s2 || '',
      onChange: e => setScore(round, 's2', e.target.value),
      placeholder: "\u2014"
    })), /*#__PURE__*/React.createElement("div", {
      className: "score-cell-mobile"
    }, /*#__PURE__*/React.createElement("div", {
      className: "lbl"
    }, "3\uACFC\uBAA9 /20"), /*#__PURE__*/React.createElement("input", {
      type: "number",
      max: 20,
      min: 0,
      value: r.s3 || '',
      onChange: e => setScore(round, 's3', e.target.value),
      placeholder: "\u2014"
    }))), /*#__PURE__*/React.createElement("div", {
      className: "score-grid-mobile",
      style: {
        marginTop: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "score-cell-mobile total",
      style: {
        gridColumn: 'span 2'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "lbl"
    }, "\uCD1D\uC810 (100\uC810 \uD658\uC0B0)"), /*#__PURE__*/React.createElement("input", {
      type: "text",
      readOnly: true,
      value: total > 0 ? total.toFixed(1) : '',
      placeholder: "\u2014"
    })), /*#__PURE__*/React.createElement("div", {
      className: "score-cell-mobile"
    }, /*#__PURE__*/React.createElement("div", {
      className: "lbl"
    }, "\uACFC\uB77D"), /*#__PURE__*/React.createElement("input", {
      type: "text",
      readOnly: true,
      value: !r.s1 && !r.s2 && !r.s3 ? '' : fail ? '있음' : '없음',
      style: {
        color: fail ? 'var(--accent)' : 'var(--moss)'
      }
    }))), (r.s1 || r.s2 || r.s3) && /*#__PURE__*/React.createElement("div", {
      className: `verdict-mobile ${v.cls}`
    }, "\uD310\uC815 \xB7 ", /*#__PURE__*/React.createElement("strong", null, v.label)));
  }), MD.MOCK_EXAMS.map(exam => /*#__PURE__*/React.createElement("div", {
    key: exam.round,
    style: {
      marginTop: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "m-section-head"
  }, /*#__PURE__*/React.createElement("h2", null, exam.name)), exam.subjects.map((sub, si) => /*#__PURE__*/React.createElement("div", {
    key: si,
    style: {
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement(Pill, {
    subj: sub.subj
  }), /*#__PURE__*/React.createElement("strong", {
    style: {
      fontSize: 13
    }
  }, sub.name.replace(/^\d+과목 /, ''))), /*#__PURE__*/React.createElement("table", {
    className: "m-tbl"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    style: {
      width: 70
    }
  }, "\uBB38\uD56D\uB300"), /*#__PURE__*/React.createElement("th", null, "\uD575\uC2EC"))), /*#__PURE__*/React.createElement("tbody", null, sub.ranges.map((r, ri) => /*#__PURE__*/React.createElement("tr", {
    key: ri
  }, /*#__PURE__*/React.createElement("td", {
    className: "k"
  }, r[0]), /*#__PURE__*/React.createElement("td", null, r[1]))))), /*#__PURE__*/React.createElement("div", {
    className: "traps-box"
  }, /*#__PURE__*/React.createElement("h4", null, "\uC790\uC8FC \uD2C0\uB9AC\uB294 \uD568\uC815"), /*#__PURE__*/React.createElement("ul", null, sub.traps.map((t, ti) => /*#__PURE__*/React.createElement("li", {
    key: ti
  }, t)))))))), /*#__PURE__*/React.createElement("div", {
    className: "m-rule"
  }), /*#__PURE__*/React.createElement(Card, {
    eyebrow: "\uBD84\uB958",
    title: "\uC624\uB2F5 \uBD84\uB958\uD45C"
  }, /*#__PURE__*/React.createElement("table", {
    className: "m-tbl"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "\uC720\uD615"), /*#__PURE__*/React.createElement("th", null, "\uC870\uCE58"))), /*#__PURE__*/React.createElement("tbody", null, MD.ERROR_TYPES.map((t, i) => /*#__PURE__*/React.createElement("tr", {
    key: i
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      fontWeight: 600
    }
  }, t.type), /*#__PURE__*/React.createElement("td", null, t.action)))))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement(Card, {
    eyebrow: "\uC7AC\uD480\uC774 \uADDC\uCE59",
    title: "\uD2C0\uB9B0 \uBB38\uC81C \uBCF5\uC2B5 \uC0AC\uC774\uD074",
    tinted: true
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      flexWrap: 'wrap',
      fontSize: 13,
      color: 'var(--ink-2)'
    }
  }, /*#__PURE__*/React.createElement("strong", {
    style: {
      color: 'var(--accent)'
    }
  }, "\uB2F9\uC77C 1\uD68C"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--ink-4)'
    }
  }, "\u2192"), /*#__PURE__*/React.createElement("strong", {
    style: {
      color: 'var(--accent)'
    }
  }, "3\uC77C \uB4A4"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--ink-4)'
    }
  }, "\u2192"), /*#__PURE__*/React.createElement("strong", {
    style: {
      color: 'var(--accent)'
    }
  }, "\uC2DC\uD5D8 3\uC77C \uC804")))));
}

/* =========================================================
   ROUTINE
   ========================================================= */
function ScreenRoutine() {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Card, {
    eyebrow: "\uD3C9\uC77C",
    title: "\uB9E4\uC77C \uD559\uC2B5 \uB8E8\uD2F4 (130\uBD84)"
  }, /*#__PURE__*/React.createElement("div", null, MD.DAILY_ROUTINE.map((r, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "routine-row-m"
  }, /*#__PURE__*/React.createElement("div", {
    className: "t"
  }, r.time), /*#__PURE__*/React.createElement("div", {
    className: "task"
  }, /*#__PURE__*/React.createElement("strong", null, r.task), " \xB7 ", r.detail))))), /*#__PURE__*/React.createElement("div", {
    className: "m-section-head"
  }, /*#__PURE__*/React.createElement("h2", null, "\uC8FC\uB9D0 \uB8E8\uD2F4"), /*#__PURE__*/React.createElement("span", {
    className: "meta"
  }, "2\uC138\uD2B8")), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", null, MD.WEEKEND_ROUTINE.map((r, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "routine-row-m"
  }, /*#__PURE__*/React.createElement("div", {
    className: "t",
    style: {
      fontSize: 13
    }
  }, r.set), /*#__PURE__*/React.createElement("div", {
    className: "task"
  }, r.task))))), /*#__PURE__*/React.createElement("div", {
    className: "m-section-head"
  }, /*#__PURE__*/React.createElement("h2", null, "\uD569\uACA9\uAD8C \uB9C8\uC77C\uC2A4\uD1A4")), /*#__PURE__*/React.createElement("div", null, MD.MILESTONES.map((m, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "milestone-mini"
  }, /*#__PURE__*/React.createElement("span", {
    className: "date"
  }, m.date), /*#__PURE__*/React.createElement("span", {
    className: "task"
  }, m.task), m.date === '07-11' && /*#__PURE__*/React.createElement(Tag, {
    variant: "accent"
  }, "\uC2DC\uD5D8"), ['06-10', '06-26', '07-07'].includes(m.date) && /*#__PURE__*/React.createElement(Tag, {
    variant: "moss"
  }, "1\uD68C\uB3C5"), ['07-08', '07-09'].includes(m.date) && /*#__PURE__*/React.createElement(Tag, {
    variant: "ochre"
  }, "\uBAA8\uC758")))), /*#__PURE__*/React.createElement("div", {
    className: "m-section-head"
  }, /*#__PURE__*/React.createElement("h2", null, "\uC2DC\uD5D8 \uC9C1\uC804 \uC555\uCD95"), /*#__PURE__*/React.createElement("span", {
    className: "meta"
  }, "3\uAC00\uC9C0\uB9CC")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, MD.FINAL_LINES.map((l, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "m-card",
    style: {
      padding: '12px 14px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      letterSpacing: '0.1em',
      color: 'var(--accent)',
      fontWeight: 600,
      textTransform: 'uppercase',
      marginBottom: 4
    }
  }, l.topic), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--ink)',
      lineHeight: 1.5
    }
  }, l.mnemonic)))), /*#__PURE__*/React.createElement("div", {
    className: "m-rule"
  }), /*#__PURE__*/React.createElement(Card, {
    eyebrow: "\uC870\uC815",
    title: "\uC9C0\uC5F0 \uC2DC \uC870\uC815 \uC6D0\uCE59",
    tinted: true
  }, /*#__PURE__*/React.createElement("ul", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, MD.DELAY_RULES.map((r, i) => /*#__PURE__*/React.createElement("li", {
    key: i,
    style: {
      fontSize: 12.5,
      color: 'var(--ink-2)',
      lineHeight: 1.6,
      paddingLeft: 14,
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      left: 0,
      color: 'var(--accent)'
    }
  }, "\u2192"), r)))));
}

/* =========================================================
   MORE (더보기)
   ========================================================= */
function ScreenMore({
  gotoMore,
  resetAll
}) {
  const items = [{
    id: 'summary',
    name: '과목 요약',
    desc: '3과목의 성격과 장별 지도',
    subj: '1'
  }, {
    id: 'keypoints',
    name: '빈출 포인트',
    desc: '출제 빈도 높은 항목 체크',
    subj: '2'
  }, {
    id: 'mock',
    name: '모의고사 풀이',
    desc: '채점표 + 함정 정리',
    subj: '4'
  }, {
    id: 'routine',
    name: '학습 루틴',
    desc: '평일·주말·시험 직전',
    subj: '3'
  }];
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--ink-3)',
      padding: '0 4px 14px'
    }
  }, "\uC8FC\uC694 \uD654\uBA74 \uC678 \uCD94\uAC00 \uC790\uB8CC\uC785\uB2C8\uB2E4."), /*#__PURE__*/React.createElement("div", {
    className: "more-list"
  }, items.map((it, i) => /*#__PURE__*/React.createElement("button", {
    key: it.id,
    className: "more-row",
    onClick: () => gotoMore(it.id)
  }, /*#__PURE__*/React.createElement("div", {
    className: "icon-bg",
    style: {
      background: `var(--s${it.subj})`
    }
  }, it.name[0]), /*#__PURE__*/React.createElement("div", {
    className: "row-name"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      color: 'var(--ink)',
      fontWeight: 500
    }
  }, it.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--ink-3)',
      marginTop: 2
    }
  }, it.desc)), /*#__PURE__*/React.createElement("div", {
    className: "chevron"
  }, "\u203A")))), /*#__PURE__*/React.createElement("div", {
    className: "m-section-head"
  }, /*#__PURE__*/React.createElement("h2", null, "\uC124\uC815")), /*#__PURE__*/React.createElement("div", {
    className: "more-list"
  }, /*#__PURE__*/React.createElement("button", {
    className: "more-row",
    onClick: resetAll
  }, /*#__PURE__*/React.createElement("div", {
    className: "icon-bg",
    style: {
      background: 'var(--accent)'
    }
  }, "\u21BA"), /*#__PURE__*/React.createElement("div", {
    className: "row-name"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      color: 'var(--accent)',
      fontWeight: 500
    }
  }, "\uBAA8\uB4E0 \uC9C4\uB3C4 \uCD08\uAE30\uD654"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--ink-3)',
      marginTop: 2
    }
  }, "\uCCB4\uD06C\uBC15\uC2A4\xB7\uD50C\uB798\uC2DC\uCE74\uB4DC\xB7\uC624\uB2F5\xB7\uC810\uC218 \uC0AD\uC81C")))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 24,
      textAlign: 'center',
      fontSize: 10,
      color: 'var(--ink-4)',
      lineHeight: 1.6,
      fontFamily: 'var(--font-mono)'
    }
  }, "FX SPECIALIST \xB7 \uC678\uD658\uC804\uBB38\uC5ED 1\uC885", /*#__PURE__*/React.createElement("br", null), "\uC9C4\uB3C4\uB294 \uC774 \uAE30\uAE30\uC5D0 \uC790\uB3D9 \uC800\uC7A5\uB429\uB2C8\uB2E4 \xB7 v1"));
}

/* =========================================================
   APP SHELL
   ========================================================= */

// SVG icons for tab bar
const ICONS = {
  today: /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "5",
    width: "18",
    height: "16",
    rx: "2.5"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "3",
    y1: "9",
    x2: "21",
    y2: "9"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "8",
    y1: "3",
    x2: "8",
    y2: "6"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "16",
    y1: "3",
    x2: "16",
    y2: "6"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "14.5",
    r: "2",
    fill: "currentColor",
    stroke: "none"
  })),
  schedule: /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("line", {
    x1: "4",
    y1: "6",
    x2: "20",
    y2: "6"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "4",
    y1: "12",
    x2: "20",
    y2: "12"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "4",
    y1: "18",
    x2: "20",
    y2: "18"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "7",
    cy: "6",
    r: "0.8",
    fill: "currentColor",
    stroke: "none"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "7",
    cy: "12",
    r: "0.8",
    fill: "currentColor",
    stroke: "none"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "7",
    cy: "18",
    r: "0.8",
    fill: "currentColor",
    stroke: "none"
  })),
  memo: /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "6",
    y: "4",
    width: "13",
    height: "16",
    rx: "2",
    transform: "rotate(-5 6 4)"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "4",
    y: "6",
    width: "13",
    height: "16",
    rx: "2",
    fill: "var(--paper)"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "7",
    y1: "10",
    x2: "13",
    y2: "10"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "7",
    y1: "13",
    x2: "14",
    y2: "13"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "7",
    y1: "16",
    x2: "11",
    y2: "16"
  })),
  errors: /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 4h10l4 4v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M15 4v4h4"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "8",
    y1: "13",
    x2: "14",
    y2: "13"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "8",
    y1: "16",
    x2: "12",
    y2: "16"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "16",
    cy: "16",
    r: "1",
    fill: "currentColor",
    stroke: "none"
  })),
  more: /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "6",
    cy: "12",
    r: "1.5",
    fill: "currentColor",
    stroke: "none"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "1.5",
    fill: "currentColor",
    stroke: "none"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "18",
    cy: "12",
    r: "1.5",
    fill: "currentColor",
    stroke: "none"
  }))
};
const TAB_DEFS = [{
  id: 'today',
  label: '오늘',
  icon: ICONS.today
}, {
  id: 'schedule',
  label: '일정',
  icon: ICONS.schedule
}, {
  id: 'memo',
  label: '암기',
  icon: ICONS.memo
}, {
  id: 'errors',
  label: '오답',
  icon: ICONS.errors
}, {
  id: 'more',
  label: '더보기',
  icon: ICONS.more
}];
function MobileApp() {
  const [view, setView] = useState({
    tab: 'today',
    sub: null
  });
  // Persisted state
  const [checks, setChecks] = useStored('fx:daily', {});
  const [kpChecks, setKpChecks] = useStored('fx:keypoints', {});
  const [flashState, setFlashState] = useStored('fx:flashcards', {});
  const [errors, setErrors] = useStored('fx:errors', []);
  const [repeatChecks, setRepeatChecks] = useStored('fx:repeat', {});
  const [scores, setScores] = useStored('fx:scores', {});
  const today = (() => {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${m}-${day}`;
  })();
  const dday = daysUntilExam(today);

  // Stats for tabbar badges
  const errorCount = errors.length;
  const kpStats = useMemo(() => {
    let total = 0,
      done = 0;
    MD.KEYPOINTS.forEach((s, si) => s.groups.forEach((g, gi) => g.items.forEach((_, ii) => {
      total += 1;
      if (kpChecks[`${si}.${gi}.${ii}`]) done += 1;
    })));
    return {
      total,
      done
    };
  }, [kpChecks]);
  const flashStats = useMemo(() => {
    const total = MD.FLASHCARDS.length;
    const known = MD.FLASHCARDS.filter(c => flashState[`${c.subj}:${c.topic}:${c.q}`] === 'known').length;
    return {
      total,
      known
    };
  }, [flashState]);
  function gotoTab(id) {
    setView({
      tab: id,
      sub: null
    });
  }
  function gotoSub(id) {
    setView({
      tab: 'more',
      sub: id
    });
  }
  function backToMore() {
    setView({
      tab: 'more',
      sub: null
    });
  }
  function resetAll() {
    if (!confirm('모든 진도(체크박스·플래시카드·오답·점수)를 삭제할까요?')) return;
    ['fx:daily', 'fx:keypoints', 'fx:flashcards', 'fx:errors', 'fx:repeat', 'fx:scores'].forEach(k => localStorage.removeItem(k));
    location.reload();
  }

  // Top bar config per view
  let topTitle = '';
  if (view.tab === 'today') topTitle = '오늘 학습';else if (view.tab === 'schedule') topTitle = '50일 스케줄';else if (view.tab === 'memo') topTitle = '암기';else if (view.tab === 'errors') topTitle = '오답노트';else if (view.tab === 'more' && !view.sub) topTitle = '더보기';else if (view.sub === 'summary') topTitle = '과목 요약';else if (view.sub === 'keypoints') topTitle = '빈출 포인트';else if (view.sub === 'mock') topTitle = '모의고사';else if (view.sub === 'routine') topTitle = '학습 루틴';

  // Render content
  let content = null;
  if (view.tab === 'today') content = /*#__PURE__*/React.createElement(ScreenToday, {
    today: today,
    checks: checks,
    setChecks: setChecks,
    kpDone: kpStats.done,
    kpTotal: kpStats.total,
    flashKnown: flashStats.known,
    flashTotal: flashStats.total,
    errorCount: errorCount,
    gotoTab: gotoTab,
    gotoSub: gotoSub
  });else if (view.tab === 'schedule') content = /*#__PURE__*/React.createElement(ScreenSchedule, {
    today: today,
    checks: checks,
    setChecks: setChecks
  });else if (view.tab === 'memo') content = /*#__PURE__*/React.createElement(ScreenMemo, {
    flashState: flashState,
    setFlashState: setFlashState
  });else if (view.tab === 'errors') content = /*#__PURE__*/React.createElement(ScreenErrors, {
    errors: errors,
    setErrors: setErrors,
    repeatChecks: repeatChecks,
    setRepeatChecks: setRepeatChecks
  });else if (view.tab === 'more') {
    if (view.sub === 'summary') content = /*#__PURE__*/React.createElement(ScreenSummary, null);else if (view.sub === 'keypoints') content = /*#__PURE__*/React.createElement(ScreenKeyPoints, {
      checks: kpChecks,
      setChecks: setKpChecks
    });else if (view.sub === 'mock') content = /*#__PURE__*/React.createElement(ScreenMock, {
      scores: scores,
      setScores: setScores
    });else if (view.sub === 'routine') content = /*#__PURE__*/React.createElement(ScreenRoutine, null);else content = /*#__PURE__*/React.createElement(ScreenMore, {
      gotoMore: gotoSub,
      resetAll: resetAll
    });
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "m-app"
  }, /*#__PURE__*/React.createElement("div", {
    className: "m-topbar"
  }, view.sub ? /*#__PURE__*/React.createElement("button", {
    className: "m-btn ghost sm",
    style: {
      padding: '4px 0 4px 0',
      color: 'var(--accent)'
    },
    onClick: backToMore
  }, "\u2039 \uB354\uBCF4\uAE30") : /*#__PURE__*/React.createElement("span", {
    className: "left-meta"
  }, "FX SPECIALIST"), /*#__PURE__*/React.createElement("span", {
    className: "title"
  }, topTitle), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "dday-mini"
  }, "D", dday >= 0 ? '-' : '+', Math.abs(dday)), /*#__PURE__*/React.createElement("button", {
    onClick: () => location.reload(),
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: 18,
      lineHeight: 1,
      padding: '2px 4px',
      color: 'var(--ink-2)',
      WebkitTapHighlightColor: 'transparent'
    },
    title: "\uC0C8\uB85C\uACE0\uCE68"
  }, "\u21BA"))), /*#__PURE__*/React.createElement("div", {
    className: "m-screen",
    key: view.tab + (view.sub || '')
  }, content), /*#__PURE__*/React.createElement("nav", {
    className: "m-tabbar"
  }, TAB_DEFS.map(t => {
    const active = view.tab === t.id;
    let badge = null;
    if (t.id === 'errors' && errorCount > 0) badge = errorCount;
    return /*#__PURE__*/React.createElement("button", {
      key: t.id,
      className: `m-tab${active ? ' active' : ''}`,
      onClick: () => gotoTab(t.id)
    }, t.icon, /*#__PURE__*/React.createElement("span", {
      className: "label"
    }, t.label), badge && /*#__PURE__*/React.createElement("span", {
      className: "badge"
    }, badge > 99 ? '99+' : badge));
  })));
}
Object.assign(window, {
  MobileApp
});