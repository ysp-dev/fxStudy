/* ======================================================================
   FX 학습앱 — 모바일 (iPhone 15 Pro Max 기준) — 단일 JSX 파일
   ====================================================================== */

const MD = window.FX_DATA;
const { useState, useEffect, useMemo, useRef } = React;

/* ---------- localStorage ---------- */
function useStored(key, initial) {
  const [v, setV] = useState(() => {
    try { const r = localStorage.getItem(key); return r == null ? initial : JSON.parse(r); }
    catch (e) { return initial; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) {} }, [key, v]);
  return [v, setV];
}

/* ---------- date helpers ---------- */
function compareMMDD(a, b) { return a.localeCompare(b); }
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
  const a = new Date(Date.UTC(2026, tm-1, td));
  const b = new Date(Date.UTC(2026, 6, 11));
  return Math.round((b - a) / 86400000);
}

/* ---------- Mobile primitives ---------- */
function Pill({ subj, children }) {
  const labels = {1:'1과목', 2:'2과목', 3:'3과목', 4:'모의'};
  return <span className={`m-pill s${subj}`}>{children || labels[subj]}</span>;
}
function Tag({ children, variant }) {
  return <span className={`m-tag${variant ? ' ' + variant : ''}`}>{children}</span>;
}
function Card({ children, title, eyebrow, tinted, flat, style }) {
  return (
    <div className={`m-card${tinted ? ' tinted' : ''}${flat ? ' flat' : ''}`} style={style}>
      {eyebrow && <div className="eyebrow">{eyebrow}</div>}
      {title && <h3>{title}</h3>}
      {children}
    </div>
  );
}
function Progress({ value, max, moss }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return <div className={`m-progress${moss ? ' moss' : ''}`}><div className="fill" style={{ width: pct + '%' }}></div></div>;
}
function CheckTap({ checked, onChange, label }) {
  return (
    <div className={`check-tap${checked ? ' checked' : ''}`} onClick={() => onChange(!checked)}>
      <div className="check-box" />
      <span className="check-label">{label}</span>
    </div>
  );
}

/* ---------- Memo table (compact) ---------- */
function MemoTbl({ data }) {
  if (!data) return null;
  if (data.lines) {
    return (
      <ul style={{ display:'flex', flexDirection:'column', gap:6 }}>
        {data.lines.map((l, i) => (
          <li key={i} style={{ fontSize:13, padding:'10px 12px', background:'var(--card-2)', borderRadius:8, lineHeight:1.55 }}>
            <span className="mark">{l}</span>
          </li>
        ))}
      </ul>
    );
  }
  return (
    <table className="m-tbl">
      {data.cols && <thead><tr>{data.cols.map((c, i) => <th key={i}>{c}</th>)}</tr></thead>}
      <tbody>
        {data.rows.map((row, ri) => (
          <tr key={ri}>{row.map((cell, ci) => (
            <td key={ci} className={ci === 0 && row.length === 2 ? 'k' : ''}>{cell}</td>
          ))}</tr>
        ))}
      </tbody>
    </table>
  );
}

/* =========================================================
   TODAY
   ========================================================= */
function ScreenToday({ today, checks, setChecks, kpDone, kpTotal, flashKnown, flashTotal, errorCount, gotoTab, gotoSub }) {
  const todayItem = MD.SCHEDULE.find(s => s.date === today);
  const next3 = MD.SCHEDULE.filter(s => compareMMDD(s.date, today) > 0).slice(0, 3);
  const TODAY_CHECKS = ['오늘 범위 완료', '문제풀이 완료', '오답노트 작성', '암기표 1회독'];
  const dayChecks = checks[today] || [false, false, false, false];

  function setCheck(i, v) {
    const c = [...dayChecks];
    c[i] = v;
    setChecks({ ...checks, [today]: c });
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

  return (
    <>
      {/* D-day big block */}
      <div className="dday-big">
        <span className="num">D{dday >= 0 ? '-' : '+'}{Math.abs(dday)}</span>
        <span className="meta">
          시험일<br/>
          <strong className="num">2026.07.11</strong> (토)
        </span>
      </div>

      {streak >= 2 && (
        <div className="streak-chip">
          <div className="streak-dot" />
          <span className="streak-num">{streak}일 연속</span>
          <span className="streak-sub">학습 중</span>
        </div>
      )}

      {/* Today task */}
      {todayItem ? (
        <div className="today-hero">
          <div className="date">
            <span>{dayLabel(today)}</span><span>·</span>
            <Pill subj={todayItem.subj} />
            {todayItem.milestone && <Tag variant="ochre">마일스톤</Tag>}
            {todayItem.exam && <Tag variant="accent">시험</Tag>}
          </div>
          <div className="topic">{todayItem.topic}</div>
          <div className="deliv">산출물 · <strong>{todayItem.deliv}</strong></div>
          <div className="check-row">
            {TODAY_CHECKS.map((label, i) => (
              <CheckTap key={i} checked={dayChecks[i]} onChange={v => setCheck(i, v)} label={label} />
            ))}
          </div>
        </div>
      ) : (
        <div className="today-hero">
          <div className="date">{dayLabel(today)} · {dowKR(today)}요일</div>
          <div className="topic">학습 스케줄 외 날짜</div>
          <div className="deliv">학습기간 <strong>05/22 ~ 07/10</strong></div>
        </div>
      )}

      {/* Stat tiles horizontal scroll */}
      <h4 style={{ margin:'18px 4px 8px' }}>전체 진행률</h4>
      <div className="stat-tiles">
        <button className="stat-tile" onClick={() => gotoTab('schedule')}>
          <div className="lbl">스케줄</div>
          <div className="val">{Math.round(passedDays/totalDays*100)}<small>%</small></div>
          <Progress value={passedDays} max={totalDays} />
          <div style={{ fontSize:11, color:'var(--ink-3)', marginTop:6, fontFamily:'var(--font-mono)' }}>
            {passedDays}/{totalDays}일
          </div>
        </button>
        <button className="stat-tile" onClick={() => gotoTab('memo')}>
          <div className="lbl">암기카드</div>
          <div className="val">{flashKnown}<small>/{flashTotal}</small></div>
          <Progress value={flashKnown} max={flashTotal} moss />
          <div style={{ fontSize:11, color:'var(--ink-3)', marginTop:6 }}>외움</div>
        </button>
        <button className="stat-tile" onClick={() => gotoSub('keypoints')}>
          <div className="lbl">빈출포인트</div>
          <div className="val">{kpDone}<small>/{kpTotal}</small></div>
          <Progress value={kpDone} max={kpTotal} />
          <div style={{ fontSize:11, color:'var(--ink-3)', marginTop:6 }}>체크</div>
        </button>
        <button className="stat-tile" onClick={() => gotoTab('errors')}>
          <div className="lbl">오답</div>
          <div className="val">{errorCount}<small>건</small></div>
          <div style={{ fontSize:11, color:'var(--ink-3)', marginTop:10 }}>누적 기록</div>
        </button>
      </div>

      {/* Milestones */}
      <div className="m-section-head">
        <h2>마일스톤</h2>
        <span className="meta">합격권 점검 기준</span>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        {MD.MILESTONES.map((m, i) => {
          const passed = compareMMDD(m.date, today) < 0;
          const isNext = !passed && MD.MILESTONES.filter(x => compareMMDD(x.date, today) >= 0)[0] === m;
          return (
            <div key={i} className="milestone-mini" style={{ opacity: passed ? 0.5 : 1 }}>
              <span className="date" style={{ color: isNext ? 'var(--accent)' : 'var(--ink-3)' }}>{m.date}</span>
              <span className="task" style={{ textDecoration: passed ? 'line-through' : 'none', color: passed ? 'var(--ink-3)' : 'var(--ink)' }}>{m.task}</span>
              {isNext && <Tag variant="accent">다음</Tag>}
              {passed && <Tag variant="moss">완료</Tag>}
            </div>
          );
        })}
      </div>

      {/* Next 3 */}
      <div className="m-section-head">
        <h2>앞으로 3일</h2>
        <span className="meta">다음 학습일</span>
      </div>
      <div className="m-list">
        {next3.map((s, i) => (
          <div key={i} className="sched-row" style={{ borderTop: i === 0 ? 0 : '0.5px solid var(--rule-soft)' }}>
            <div className="sched-date">
              <span>{s.date}</span>
              <span className={`dow${s.dow === '토' ? ' sat' : s.dow === '일' ? ' sun' : ''}`}>{s.dow}</span>
            </div>
            <div className="topic-main">
              <div className="topic-pills"><Pill subj={s.subj}>{s.subj === 4 ? '모의' : s.subj + '과목'}</Pill></div>
              <div>{s.topic}</div>
              {s.deliv && <div className="topic-deliv">→ {s.deliv}</div>}
            </div>
            <div></div>
          </div>
        ))}
      </div>
    </>
  );
}

/* =========================================================
   SCHEDULE
   ========================================================= */
function ScreenSchedule({ today, checks, setChecks }) {
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
    setChecks({ ...checks, [date]: all ? [false,false,false,false] : [true,true,true,true] });
  }

  const doneInWeek = days.filter(d => isDone(d.date)).length;

  return (
    <>
      {/* Week selector */}
      <div className="week-tabs">
        {MD.WEEKLY.map(w => {
          const [s2, e2] = w.range.split(' ~ ');
          const wDays = MD.SCHEDULE.filter(d => compareMMDD(d.date, s2) >= 0 && compareMMDD(d.date, e2) <= 0);
          const wDone = wDays.filter(d => isDone(d.date)).length;
          return (
            <button key={w.week}
              className={`week-tab${selectedWeek === w.week ? ' active' : ''}`}
              onClick={() => setSelectedWeek(w.week)}>
              {w.week}주차
              <span className="week-status">{wDone}/{wDays.length}</span>
            </button>
          );
        })}
      </div>

      {/* Week summary */}
      <div className="m-card" style={{ marginBottom:14 }}>
        <div style={{ display:'flex', alignItems:'baseline', gap:8, marginBottom:6 }}>
          <strong style={{ fontFamily:'var(--font-serif)', fontSize:17 }}>{week.week}주차</strong>
          <span className="num" style={{ fontSize:11, color:'var(--ink-3)' }}>{week.range}</span>
          <span className="num" style={{ marginLeft:'auto', fontSize:12, color: doneInWeek === days.length ? 'var(--moss)' : 'var(--ink-3)' }}>{doneInWeek}/{days.length}</span>
        </div>
        <div style={{ fontSize:13, color:'var(--ink-2)' }}>{week.goal}</div>
        <div style={{ marginTop:10 }}>
          <Progress value={doneInWeek} max={days.length} moss={doneInWeek === days.length} />
        </div>
      </div>

      {/* Day rows */}
      <div className="m-list">
        {days.map((d, i) => {
          const isToday = d.date === today;
          const isPast = compareMMDD(d.date, today) < 0;
          const done = isDone(d.date);
          return (
            <div key={d.date} className={`sched-row${isToday ? ' today-row' : ''}${isPast && !isToday ? ' past-row' : ''}`} onClick={() => toggle(d.date)}>
              <div className="sched-date">
                <span>{d.date}</span>
                <span className={`dow${d.dow === '토' ? ' sat' : d.dow === '일' ? ' sun' : ''}`}>{d.dow}</span>
              </div>
              <div className="topic-main">
                <div className="topic-pills">
                  <Pill subj={d.subj}>{d.subj === 4 ? '모의' : d.subj + '과목'}</Pill>
                  {d.milestone && <Tag variant="ochre">마일스톤</Tag>}
                  {d.exam && <Tag variant="accent">시험</Tag>}
                </div>
                <div>{d.topic}</div>
                {d.deliv && <div className="topic-deliv">→ {d.deliv}</div>}
              </div>
              <div className={`check-box`} style={{
                width:24, height:24, borderRadius:6,
                border: `1.5px solid ${done ? 'var(--accent)' : 'var(--ink-3)'}`,
                background: done ? 'var(--accent)' : 'rgba(255,255,255,0.4)',
                display:'flex', alignItems:'center', justifyContent:'center', flex:'0 0 24px',
              }}>
                {done && <span style={{ color:'#fff', fontSize:14, lineHeight:1 }}>✓</span>}
              </div>
            </div>
          );
        })}
      </div>

      <div className="m-rule"></div>
      <Card eyebrow="조정" title="지연 시 조정 원칙" tinted>
        <ul style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {MD.DELAY_RULES.map((r, i) => (
            <li key={i} style={{ fontSize:12.5, color:'var(--ink-2)', lineHeight:1.6, paddingLeft:14, position:'relative' }}>
              <span style={{ position:'absolute', left:0, color:'var(--accent)' }}>→</span>{r}
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}

/* =========================================================
   MEMO (Flashcards + Tables)
   ========================================================= */
function ScreenMemo({ flashState, setFlashState }) {
  const [mode, setMode] = useState('cards');
  const [subj, setSubj] = useState('all');
  const [onlyUnknown, setOnlyUnknown] = useState(false);
  const [shuffleKey, setShuffleKey] = useState(0);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [swipeDir, setSwipeDir] = useState(null);

  const cardId = (c) => `${c.subj}:${c.topic}:${c.q}`;

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

  useEffect(() => { setIndex(0); setFlipped(false); }, [subj, onlyUnknown, shuffleKey]);

  const card = cards[index];
  const total = cards.length;
  const knownAll = MD.FLASHCARDS.filter(c => flashState[cardId(c)] === 'known').length;

  function mark(status) {
    if (!card) return;
    setFlashState({ ...flashState, [cardId(card)]: status });
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

  return (
    <>
      {/* Mode toggle */}
      <div className="seg-tabs" style={{ marginBottom:14, display:'flex' }}>
        <button className={mode === 'cards' ? 'active' : ''} onClick={() => setMode('cards')}>플래시카드</button>
        <button className={mode === 'tables' ? 'active' : ''} onClick={() => setMode('tables')}>암기표</button>
      </div>

      {mode === 'cards' && (
        <>
          <div className="flash-filter-bar">
            <div className="seg-tabs">
              {['all', 1, 2, 3].map(s => (
                <button key={s} className={subj === s ? 'active' : ''} onClick={() => setSubj(s)}>
                  {s === 'all' ? '전체' : `${s}과목`}
                </button>
              ))}
            </div>
            <span className="flash-counter">{total > 0 ? `${index + 1}/${total}` : '0/0'}</span>
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14, fontSize:13 }}>
            <label className="check-tap" style={{ flex:1, padding:'10px 12px', minHeight:0 }} onClick={() => setOnlyUnknown(!onlyUnknown)}>
              <div className="check-box" style={onlyUnknown ? { background:'var(--accent)', borderColor:'var(--accent)' } : {}}>
                {onlyUnknown && <span style={{ color:'#fff', fontSize:12, lineHeight:1 }}>✓</span>}
              </div>
              <span className="check-label">미숙지만 보기</span>
            </label>
            <button className="m-btn sm ghost" onClick={() => setShuffleKey(k => k + 1)}>🎲 섞기</button>
          </div>

          {card ? (
            <>
              <div className="flash-mobile-stage">
                <div className={`flash-mobile-card${flipped ? ' flipped' : ''}${swipeDir === 'left' ? ' swipe-left' : swipeDir === 'right' ? ' swipe-right' : ''}`}
                     onClick={() => setFlipped(f => !f)}
                     onTouchStart={onTouchStart}
                     onTouchEnd={onTouchEnd}>
                  <div className="flash-mobile-face front">
                    <div className="face-head">
                      <span className="label">Question · {card.topic}</span>
                      <Pill subj={card.subj} />
                    </div>
                    <div className="q">{card.q}</div>
                    <div className="hint">탭해서 뒤집기 · 좌우로 스와이프</div>
                  </div>
                  <div className="flash-mobile-face back">
                    <div className="face-head">
                      <span className="label">Answer · {card.topic}</span>
                      <Pill subj={card.subj} />
                    </div>
                    <div className="a" dangerouslySetInnerHTML={{ __html: card.a }}></div>
                    <div className="hint">버튼 또는 좌우 스와이프로 평가</div>
                  </div>
                </div>
              </div>

              <div className="flash-controls-mobile">
                <button className="flash-eval no" onClick={() => mark('unknown')}>
                  <span className="label-num">모름</span>
                  <span className="label-sub">← 스와이프</span>
                </button>
                <button className="flash-eval so" onClick={() => mark('soso')}>
                  <span className="label-num">애매</span>
                  <span className="label-sub">다시 보기</span>
                </button>
                <button className="flash-eval yes" onClick={() => mark('known')}>
                  <span className="label-num">외움</span>
                  <span className="label-sub">스와이프 →</span>
                </button>
              </div>

              <div style={{ marginTop:14, fontSize:11, color:'var(--ink-3)', textAlign:'center', fontFamily:'var(--font-mono)' }}>
                전체 외움 <span style={{ color:'var(--moss)', fontWeight:600 }}>{knownAll}</span> / {MD.FLASHCARDS.length}
              </div>
            </>
          ) : (
            <div className="empty">조건에 맞는 카드가 없어요. 필터를 바꿔보세요.</div>
          )}
        </>
      )}

      {mode === 'tables' && (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {Object.entries(MD.MEMORIZE).map(([key, tbl]) => (
            <Card key={key} eyebrow="암기표" title={tbl.title}>
              <MemoTbl data={tbl} />
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

/* =========================================================
   ERRORS
   ========================================================= */
function ScreenErrors({ errors, setErrors, repeatChecks, setRepeatChecks }) {
  const [showSheet, setShowSheet] = useState(false);
  const [filterSubj, setFilterSubj] = useState('all');

  useEffect(() => {
    const screen = document.querySelector('.m-screen');
    if (!screen) return;
    screen.style.overflow = showSheet ? 'hidden' : '';
    return () => { screen.style.overflow = ''; };
  }, [showSheet]);
  const [draft, setDraft] = useState({ date: '05-22', subj: 1, source: '', question: '', mine: '', correct: '', why: '', rule: '' });

  function addError() {
    if (!draft.question || !draft.correct) return;
    setErrors([{ ...draft, id: Date.now(), reviews: [false, false, false] }, ...errors]);
    setDraft({ date:'05-22', subj:1, source:'', question:'', mine:'', correct:'', why:'', rule:'' });
    setShowSheet(false);
  }
  function delError(id) {
    if (!confirm('이 오답을 삭제할까요?')) return;
    setErrors(errors.filter(e => e.id !== id));
  }
  function toggleReview(id, idx) {
    setErrors(errors.map(e => {
      if (e.id !== id) return e;
      const reviews = [...(e.reviews || [false,false,false])];
      reviews[idx] = !reviews[idx];
      return { ...e, reviews };
    }));
  }

  const showSeed = errors.length === 0;
  const displayErrors = showSeed
    ? MD.ERROR_EXAMPLES.map((e, i) => ({ ...e, id: 'seed-' + i, date: '예시' })).filter(e => filterSubj === 'all' || e.subj === filterSubj)
    : errors.filter(e => filterSubj === 'all' || e.subj === filterSubj);

  return (
    <>
      <div style={{ display:'flex', gap:10, marginBottom:12, alignItems:'center' }}>
        <button className="m-btn primary sm" onClick={() => setShowSheet(true)}>+ 오답 추가</button>
        <div className="seg-tabs" style={{ marginLeft:'auto' }}>
          {['all', 1, 2, 3].map(s => (
            <button key={s} className={filterSubj === s ? 'active' : ''} onClick={() => setFilterSubj(s)}>
              {s === 'all' ? '전체' : `${s}`}
            </button>
          ))}
        </div>
      </div>

      <div style={{ fontSize:12, color:'var(--ink-3)', lineHeight:1.55, marginBottom:14, padding:'0 4px' }}>
        한 문제당 <strong style={{ color:'var(--ink-2)' }}>5줄</strong>이면 충분. 같은 주제로 3번 틀리면 아래 반복오답 표시하세요.
        {showSeed && <span style={{ display:'block', marginTop:4, color:'var(--accent)' }}>※ 예시 표시 중 — 오답을 추가하면 사라집니다</span>}
      </div>

      {displayErrors.length === 0 ? (
        <div className="empty">필터에 맞는 오답이 없습니다.</div>
      ) : (
        <div>
          {displayErrors.map(e => (
            <div key={e.id} className="err-mobile-card">
              <div className="head-row">
                <Pill subj={e.subj} />
                <span style={{ fontSize:11, color:'var(--ink-3)', fontFamily:'var(--font-mono)' }}>{e.date}</span>
                {e.source && <span style={{ fontSize:11, color:'var(--ink-3)' }}>· {e.source}</span>}
                {!String(e.id).startsWith('seed') && (
                  <button className="m-btn sm ghost" style={{ marginLeft:'auto', color:'var(--ink-4)', padding:'4px 8px', minHeight:0, fontSize:11 }} onClick={() => delError(e.id)}>삭제</button>
                )}
              </div>
              <div className="q-text">{e.question}</div>
              <div className="ans-row"><span className="lbl">내답</span><span>{e.mine || '—'}</span></div>
              <div className="ans-row"><span className="lbl">정답</span><strong>{e.correct || '—'}</strong></div>
              {e.why && <div className="ans-row"><span className="lbl">이유</span><span style={{ color:'var(--ink-3)' }}>{e.why}</span></div>}
              {e.rule && (
                <div className="rule">
                  <span className="rule-tag">다음 기준</span>
                  {e.rule}
                </div>
              )}
              <div className="rev">
                <span>복습</span>
                <div className="dots">
                  {[0,1,2].map(i => {
                    const isSeed = String(e.id).startsWith('seed');
                    return (
                      <div key={i}
                        className={`dot${e.reviews && e.reviews[i] ? ' on' : ''}`}
                        style={{ opacity: isSeed ? 0.25 : 1, cursor: isSeed ? 'default' : 'pointer' }}
                        onClick={() => !isSeed && toggleReview(e.id, i)} />
                    );
                  })}
                </div>
                <span style={{ marginLeft:'auto', fontSize:10, color:'var(--ink-4)' }}>당일 · 3일후 · 시험3일전</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="m-rule"></div>

      <Card eyebrow="반복오답" title="3회 이상 헷갈리는 주제" tinted>
        <p style={{ fontSize:12, color:'var(--ink-3)', marginBottom:12, lineHeight:1.55 }}>
          체크된 주제는 시험 직전 압축 복습 대상입니다.
        </p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
          {MD.REPEAT_TOPICS.map((topic, i) => {
            const checked = !!repeatChecks[topic];
            return (
              <div key={i} className={`kp-mobile-item${checked ? ' checked' : ''}`}
                style={{ marginBottom:0, padding:'8px 10px', minHeight:40 }}
                onClick={() => setRepeatChecks({...repeatChecks, [topic]: !checked})}>
                <div className="check-box" style={{ width:18, height:18, flex:'0 0 18px' }}/>
                <span className="it-text" style={{ fontSize:12 }}>{topic}</span>
              </div>
            );
          })}
        </div>
      </Card>

      <div style={{ marginTop:14 }}>
        <Card eyebrow="시험 직전" title="마지막까지 헷갈리는 것">
          <table className="m-tbl">
            <tbody>
              {MD.FINAL_LINES.map((l, i) => (
                <tr key={i}>
                  <td style={{ width:'30%', fontWeight:600 }}>{l.topic}</td>
                  <td><span className="mark">{l.mnemonic}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      {/* Add error sheet */}
      {showSheet && (
        <div className="sheet-backdrop" onClick={(e) => { if (e.target.classList.contains('sheet-backdrop')) setShowSheet(false); }}>
          <div className="sheet">
            <div className="sheet-handle" />
            <h3>오답 추가</h3>
            <div className="form-row dual">
              <div>
                <label>날짜 (MM-DD)</label>
                <input type="text" value={draft.date} onChange={e => setDraft({...draft, date: e.target.value})} />
              </div>
              <div>
                <label>과목</label>
                <select value={draft.subj} onChange={e => setDraft({...draft, subj: parseInt(e.target.value)})}>
                  <option value={1}>1과목</option>
                  <option value={2}>2과목</option>
                  <option value={3}>3과목</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <label>자료/출처</label>
              <input type="text" value={draft.source} onChange={e => setDraft({...draft, source: e.target.value})} placeholder="예: 길라잡이 문제" />
            </div>
            <div className="form-row">
              <label>문항/주제</label>
              <input type="text" value={draft.question} onChange={e => setDraft({...draft, question: e.target.value})} placeholder="예: 비거주자 원화대출" />
            </div>
            <div className="form-row dual">
              <div>
                <label>내 답</label>
                <input type="text" value={draft.mine} onChange={e => setDraft({...draft, mine: e.target.value})} />
              </div>
              <div>
                <label>정답</label>
                <input type="text" value={draft.correct} onChange={e => setDraft({...draft, correct: e.target.value})} />
              </div>
            </div>
            <div className="form-row">
              <label>틀린 이유</label>
              <textarea value={draft.why} onChange={e => setDraft({...draft, why: e.target.value})} />
            </div>
            <div className="form-row">
              <label>다음 판단 기준</label>
              <textarea value={draft.rule} onChange={e => setDraft({...draft, rule: e.target.value})} />
            </div>
            <div className="actions">
              <button className="m-btn" onClick={() => setShowSheet(false)}>취소</button>
              <button className="m-btn primary" onClick={addError}>저장</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* =========================================================
   SUMMARY (3과목 요약)
   ========================================================= */
function ScreenSummary() {
  return (
    <>
      <div style={{ fontSize:13, color:'var(--ink-2)', lineHeight:1.6, marginBottom:18, padding:'0 4px' }}>
        3과목의 성격과 장별 지도. 출제 비중 <strong>1과목 50% · 2과목 30% · 3과목 20%</strong>.
      </div>
      {MD.SUBJECTS.map(s => (
        <section key={s.num} className="subj-mobile-card">
          <div className="subj-mobile-head">
            <Pill subj={s.num} />
            <h2>{s.name}</h2>
            <Tag variant="ochre">{s.weight}%</Tag>
          </div>
          <p className="subj-mobile-character">{s.character}</p>

          <h4 style={{ marginBottom:8 }}>장별 요약</h4>
          {s.chapters.map((c, i) => (
            <div key={i} className="chapter-mini">
              <div className="ch-num">{c[0]}</div>
              <div>
                <div className="ch-title">{c[1]}</div>
                <div className="ch-detail">{c[2]}</div>
              </div>
            </div>
          ))}

          <h4 style={{ marginTop:14, marginBottom:6 }}>공부 포인트</h4>
          <ul className="point-list">{s.points.map((p, i) => <li key={i}>{p}</li>)}</ul>
        </section>
      ))}

      <div className="m-rule"></div>
      <Card eyebrow="시험전략" title="과목별 점수 전략">
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {MD.SCORE_STRATEGY.map((s, i) => (
            <div key={i}>
              <Pill subj={s.subj}>{s.subj}과목</Pill>
              <div style={{ marginTop:6, fontSize:13, color:'var(--ink-2)', lineHeight:1.55 }}>{s.advice}</div>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

/* =========================================================
   KEYPOINTS (빈출 포인트)
   ========================================================= */
function ScreenKeyPoints({ checks, setChecks }) {
  const [activeSubj, setActiveSubj] = useState(1);
  const flatKey = (si, gi, ii) => `${si}.${gi}.${ii}`;

  const subj = MD.KEYPOINTS[activeSubj - 1];
  const total = subj.groups.reduce((a, g) => a + g.items.length, 0);
  const done = subj.groups.reduce((a, g, gi) =>
    a + g.items.filter((_, ii) => checks[flatKey(activeSubj - 1, gi, ii)]).length, 0);

  return (
    <>
      <div style={{ fontSize:13, color:'var(--ink-2)', lineHeight:1.55, marginBottom:14, padding:'0 4px' }}>
        스스로 설명할 수 있게 된 항목에 체크하세요.
      </div>
      <div className="seg-tabs" style={{ marginBottom:14, display:'flex', width:'100%' }}>
        {[1, 2, 3].map(s => (
          <button key={s} className={activeSubj === s ? 'active' : ''} onClick={() => setActiveSubj(s)} style={{ flex:1 }}>
            {s}과목
          </button>
        ))}
      </div>

      <div className="m-card" style={{ marginBottom:14 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:8 }}>
          <strong style={{ fontSize:14, fontFamily:'var(--font-serif)' }}>{subj.name}</strong>
          <span className="num" style={{ fontSize:12, color:'var(--ink-3)' }}>{done} / {total}</span>
        </div>
        <Progress value={done} max={total} />
      </div>

      {subj.groups.map((g, gi) => (
        <div key={gi} className="kp-group-mobile">
          <div className="group-head">
            <Tag>{g.title.split('.')[0]}</Tag>
            <span>{g.title.split('.').slice(1).join('.').trim()}</span>
          </div>
          {g.items.map((it, ii) => {
            const k = flatKey(activeSubj - 1, gi, ii);
            const checked = !!checks[k];
            return (
              <div key={ii} className={`kp-mobile-item${checked ? ' checked' : ''}`} onClick={() => setChecks({...checks, [k]: !checked})}>
                <div className="check-box" />
                <span className="it-text">{it}</span>
              </div>
            );
          })}
        </div>
      ))}
    </>
  );
}

/* =========================================================
   MOCK EXAM
   ========================================================= */
function ScreenMock({ scores, setScores }) {
  function getVerdict(t) {
    if (t >= 70) return { label:'안정권', cls:'safe' };
    if (t >= 65) return { label:'합격권 — 오답 반복 필요', cls:'safe' };
    if (t >= 60) return { label:'위험권 — 약점 보강', cls:'warn' };
    return { label:'60점 미만 — 즉시 재학습', cls:'risk' };
  }
  function setScore(round, key, val) {
    setScores({ ...scores, [round]: { ...(scores[round] || {}), [key]: val } });
  }

  return (
    <>
      <Card eyebrow="실전 풀이" title="시간 분배" tinted>
        <table className="m-tbl" style={{ background:'transparent', border:0 }}>
          <thead><tr><th>구분</th><th style={{ textAlign:'right' }}>문항</th><th style={{ textAlign:'right' }}>시간</th></tr></thead>
          <tbody>
            <tr><td>1과목</td><td className="num" style={{ textAlign:'right' }}>35</td><td className="num" style={{ textAlign:'right' }}>50분</td></tr>
            <tr><td>2과목</td><td className="num" style={{ textAlign:'right' }}>25</td><td className="num" style={{ textAlign:'right' }}>35분</td></tr>
            <tr><td>3과목</td><td className="num" style={{ textAlign:'right' }}>20</td><td className="num" style={{ textAlign:'right' }}>30분</td></tr>
            <tr><td>마킹·검토</td><td style={{ textAlign:'right' }}>—</td><td className="num" style={{ textAlign:'right' }}>5분</td></tr>
          </tbody>
        </table>
      </Card>

      <div className="m-section-head">
        <h2>회차별 점수</h2>
        <span className="meta">합격: 평균 60+, 과목 40+</span>
      </div>

      {[1, 2].map(round => {
        const r = scores[round] || {};
        const s1 = parseFloat(r.s1) || 0, s2 = parseFloat(r.s2) || 0, s3 = parseFloat(r.s3) || 0;
        const total = (r.s1 || r.s2 || r.s3) ? ((s1/35 * 43.75) + (s2/25 * 31.25) + (s3/20 * 25)) : 0;
        const v = getVerdict(total);
        const fail = (r.s1 || r.s2 || r.s3) && (s1 < 14 || s2 < 10 || s3 < 8);
        return (
          <div key={round} className="m-card" style={{ marginBottom:12 }}>
            <div style={{ display:'flex', alignItems:'baseline', gap:8, marginBottom:6 }}>
              <strong style={{ fontFamily:'var(--font-serif)', fontSize:15 }}>제{round}회</strong>
              <span style={{ fontSize:11, color:'var(--ink-3)' }}>{round === 1 ? '07-08 (수)' : '07-09 (목)'}</span>
            </div>
            <div className="score-grid-mobile">
              <div className="score-cell-mobile">
                <div className="lbl">1과목 /35</div>
                <input type="number" max={35} min={0} value={r.s1 || ''} onChange={e => setScore(round, 's1', e.target.value)} placeholder="—" />
              </div>
              <div className="score-cell-mobile">
                <div className="lbl">2과목 /25</div>
                <input type="number" max={25} min={0} value={r.s2 || ''} onChange={e => setScore(round, 's2', e.target.value)} placeholder="—" />
              </div>
              <div className="score-cell-mobile">
                <div className="lbl">3과목 /20</div>
                <input type="number" max={20} min={0} value={r.s3 || ''} onChange={e => setScore(round, 's3', e.target.value)} placeholder="—" />
              </div>
            </div>
            <div className="score-grid-mobile" style={{ marginTop:0 }}>
              <div className="score-cell-mobile total" style={{ gridColumn:'span 2' }}>
                <div className="lbl">총점 (100점 환산)</div>
                <input type="text" readOnly value={total > 0 ? total.toFixed(1) : ''} placeholder="—" />
              </div>
              <div className="score-cell-mobile">
                <div className="lbl">과락</div>
                <input type="text" readOnly value={!r.s1 && !r.s2 && !r.s3 ? '' : (fail ? '있음' : '없음')}
                  style={{ color: fail ? 'var(--accent)' : 'var(--moss)' }} />
              </div>
            </div>
            {(r.s1 || r.s2 || r.s3) && (
              <div className={`verdict-mobile ${v.cls}`}>판정 · <strong>{v.label}</strong></div>
            )}
          </div>
        );
      })}

      {MD.MOCK_EXAMS.map(exam => (
        <div key={exam.round} style={{ marginTop:18 }}>
          <div className="m-section-head">
            <h2>{exam.name}</h2>
          </div>
          {exam.subjects.map((sub, si) => (
            <div key={si} style={{ marginBottom:14 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                <Pill subj={sub.subj} />
                <strong style={{ fontSize:13 }}>{sub.name.replace(/^\d+과목 /, '')}</strong>
              </div>
              <table className="m-tbl">
                <thead><tr><th style={{ width:70 }}>문항대</th><th>핵심</th></tr></thead>
                <tbody>
                  {sub.ranges.map((r, ri) => (
                    <tr key={ri}><td className="k">{r[0]}</td><td>{r[1]}</td></tr>
                  ))}
                </tbody>
              </table>
              <div className="traps-box">
                <h4>자주 틀리는 함정</h4>
                <ul>{sub.traps.map((t, ti) => <li key={ti}>{t}</li>)}</ul>
              </div>
            </div>
          ))}
        </div>
      ))}

      <div className="m-rule"></div>
      <Card eyebrow="분류" title="오답 분류표">
        <table className="m-tbl">
          <thead><tr><th>유형</th><th>조치</th></tr></thead>
          <tbody>
            {MD.ERROR_TYPES.map((t, i) => (
              <tr key={i}><td style={{ fontWeight:600 }}>{t.type}</td><td>{t.action}</td></tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div style={{ marginTop:14 }}>
        <Card eyebrow="재풀이 규칙" title="틀린 문제 복습 사이클" tinted>
          <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', fontSize:13, color:'var(--ink-2)' }}>
            <strong style={{ color:'var(--accent)' }}>당일 1회</strong>
            <span style={{ color:'var(--ink-4)' }}>→</span>
            <strong style={{ color:'var(--accent)' }}>3일 뒤</strong>
            <span style={{ color:'var(--ink-4)' }}>→</span>
            <strong style={{ color:'var(--accent)' }}>시험 3일 전</strong>
          </div>
        </Card>
      </div>
    </>
  );
}

/* =========================================================
   ROUTINE
   ========================================================= */
function ScreenRoutine() {
  return (
    <>
      <Card eyebrow="평일" title="매일 학습 루틴 (130분)">
        <div>
          {MD.DAILY_ROUTINE.map((r, i) => (
            <div key={i} className="routine-row-m">
              <div className="t">{r.time}</div>
              <div className="task"><strong>{r.task}</strong> · {r.detail}</div>
            </div>
          ))}
        </div>
      </Card>

      <div className="m-section-head">
        <h2>주말 루틴</h2>
        <span className="meta">2세트</span>
      </div>
      <Card>
        <div>
          {MD.WEEKEND_ROUTINE.map((r, i) => (
            <div key={i} className="routine-row-m">
              <div className="t" style={{ fontSize:13 }}>{r.set}</div>
              <div className="task">{r.task}</div>
            </div>
          ))}
        </div>
      </Card>

      <div className="m-section-head">
        <h2>합격권 마일스톤</h2>
      </div>
      <div>
        {MD.MILESTONES.map((m, i) => (
          <div key={i} className="milestone-mini">
            <span className="date">{m.date}</span>
            <span className="task">{m.task}</span>
            {(m.date === '07-11') && <Tag variant="accent">시험</Tag>}
            {(['06-10', '06-26', '07-07'].includes(m.date)) && <Tag variant="moss">1회독</Tag>}
            {(['07-08', '07-09'].includes(m.date)) && <Tag variant="ochre">모의</Tag>}
          </div>
        ))}
      </div>

      <div className="m-section-head">
        <h2>시험 직전 압축</h2>
        <span className="meta">3가지만</span>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {MD.FINAL_LINES.map((l, i) => (
          <div key={i} className="m-card" style={{ padding:'12px 14px' }}>
            <div style={{ fontSize:10, letterSpacing:'0.1em', color:'var(--accent)', fontWeight:600, textTransform:'uppercase', marginBottom:4 }}>{l.topic}</div>
            <div style={{ fontSize:13, color:'var(--ink)', lineHeight:1.5 }}>{l.mnemonic}</div>
          </div>
        ))}
      </div>

      <div className="m-rule"></div>

      <Card eyebrow="조정" title="지연 시 조정 원칙" tinted>
        <ul style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {MD.DELAY_RULES.map((r, i) => (
            <li key={i} style={{ fontSize:12.5, color:'var(--ink-2)', lineHeight:1.6, paddingLeft:14, position:'relative' }}>
              <span style={{ position:'absolute', left:0, color:'var(--accent)' }}>→</span>{r}
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}

/* =========================================================
   MORE (더보기)
   ========================================================= */
function ScreenMore({ gotoMore, resetAll }) {
  const items = [
    { id:'summary',   name:'과목 요약',     desc:'3과목의 성격과 장별 지도', subj:'1' },
    { id:'keypoints', name:'빈출 포인트',   desc:'출제 빈도 높은 항목 체크', subj:'2' },
    { id:'mock',      name:'모의고사 풀이', desc:'채점표 + 함정 정리', subj:'4' },
    { id:'routine',   name:'학습 루틴',     desc:'평일·주말·시험 직전', subj:'3' },
  ];

  return (
    <>
      <div style={{ fontSize:12, color:'var(--ink-3)', padding:'0 4px 14px' }}>
        주요 화면 외 추가 자료입니다.
      </div>
      <div className="more-list">
        {items.map((it, i) => (
          <button key={it.id} className="more-row" onClick={() => gotoMore(it.id)}>
            <div className="icon-bg" style={{ background: `var(--s${it.subj})` }}>{it.name[0]}</div>
            <div className="row-name">
              <div style={{ fontSize:14, color:'var(--ink)', fontWeight:500 }}>{it.name}</div>
              <div style={{ fontSize:11, color:'var(--ink-3)', marginTop:2 }}>{it.desc}</div>
            </div>
            <div className="chevron">›</div>
          </button>
        ))}
      </div>

      <div className="m-section-head">
        <h2>설정</h2>
      </div>
      <div className="more-list">
        <button className="more-row" onClick={resetAll}>
          <div className="icon-bg" style={{ background: 'var(--accent)' }}>↺</div>
          <div className="row-name">
            <div style={{ fontSize:14, color:'var(--accent)', fontWeight:500 }}>모든 진도 초기화</div>
            <div style={{ fontSize:11, color:'var(--ink-3)', marginTop:2 }}>체크박스·플래시카드·오답·점수 삭제</div>
          </div>
        </button>
      </div>

      <div style={{ marginTop:24, textAlign:'center', fontSize:10, color:'var(--ink-4)', lineHeight:1.6, fontFamily:'var(--font-mono)' }}>
        FX SPECIALIST · 외환전문역 1종<br/>
        진도는 이 기기에 자동 저장됩니다 · v1
      </div>
    </>
  );
}

/* =========================================================
   APP SHELL
   ========================================================= */

// SVG icons for tab bar
const ICONS = {
  today: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="16" rx="2.5"/>
      <line x1="3" y1="9" x2="21" y2="9"/>
      <line x1="8" y1="3" x2="8" y2="6"/>
      <line x1="16" y1="3" x2="16" y2="6"/>
      <circle cx="12" cy="14.5" r="2" fill="currentColor" stroke="none"/>
    </svg>
  ),
  schedule: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="6" x2="20" y2="6"/>
      <line x1="4" y1="12" x2="20" y2="12"/>
      <line x1="4" y1="18" x2="20" y2="18"/>
      <circle cx="7" cy="6" r="0.8" fill="currentColor" stroke="none"/>
      <circle cx="7" cy="12" r="0.8" fill="currentColor" stroke="none"/>
      <circle cx="7" cy="18" r="0.8" fill="currentColor" stroke="none"/>
    </svg>
  ),
  memo: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="4" width="13" height="16" rx="2" transform="rotate(-5 6 4)"/>
      <rect x="4" y="6" width="13" height="16" rx="2" fill="var(--paper)" />
      <line x1="7" y1="10" x2="13" y2="10"/>
      <line x1="7" y1="13" x2="14" y2="13"/>
      <line x1="7" y1="16" x2="11" y2="16"/>
    </svg>
  ),
  errors: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 4h10l4 4v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z"/>
      <path d="M15 4v4h4"/>
      <line x1="8" y1="13" x2="14" y2="13"/>
      <line x1="8" y1="16" x2="12" y2="16"/>
      <circle cx="16" cy="16" r="1" fill="currentColor" stroke="none"/>
    </svg>
  ),
  more: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="12" r="1.5" fill="currentColor" stroke="none"/>
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/>
      <circle cx="18" cy="12" r="1.5" fill="currentColor" stroke="none"/>
    </svg>
  ),
};

const TAB_DEFS = [
  { id:'today',    label:'오늘',   icon:ICONS.today },
  { id:'schedule', label:'일정',   icon:ICONS.schedule },
  { id:'memo',     label:'암기',   icon:ICONS.memo },
  { id:'errors',   label:'오답',   icon:ICONS.errors },
  { id:'more',     label:'더보기', icon:ICONS.more },
];

function MobileApp() {
  const [view, setView] = useState({ tab: 'today', sub: null });
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
    let total = 0, done = 0;
    MD.KEYPOINTS.forEach((s, si) => s.groups.forEach((g, gi) => g.items.forEach((_, ii) => {
      total += 1;
      if (kpChecks[`${si}.${gi}.${ii}`]) done += 1;
    })));
    return { total, done };
  }, [kpChecks]);

  const flashStats = useMemo(() => {
    const total = MD.FLASHCARDS.length;
    const known = MD.FLASHCARDS.filter(c => flashState[`${c.subj}:${c.topic}:${c.q}`] === 'known').length;
    return { total, known };
  }, [flashState]);

  function gotoTab(id) { setView({ tab: id, sub: null }); }
  function gotoSub(id) { setView({ tab: 'more', sub: id }); }
  function backToMore() { setView({ tab: 'more', sub: null }); }

  function resetAll() {
    if (!confirm('모든 진도(체크박스·플래시카드·오답·점수)를 삭제할까요?')) return;
    ['fx:daily','fx:keypoints','fx:flashcards','fx:errors','fx:repeat','fx:scores'].forEach(k => localStorage.removeItem(k));
    location.reload();
  }

  // Top bar config per view
  let topTitle = '';
  if (view.tab === 'today') topTitle = '오늘 학습';
  else if (view.tab === 'schedule') topTitle = '50일 스케줄';
  else if (view.tab === 'memo') topTitle = '암기';
  else if (view.tab === 'errors') topTitle = '오답노트';
  else if (view.tab === 'more' && !view.sub) topTitle = '더보기';
  else if (view.sub === 'summary') topTitle = '과목 요약';
  else if (view.sub === 'keypoints') topTitle = '빈출 포인트';
  else if (view.sub === 'mock') topTitle = '모의고사';
  else if (view.sub === 'routine') topTitle = '학습 루틴';

  // Render content
  let content = null;
  if (view.tab === 'today') content = <ScreenToday today={today} checks={checks} setChecks={setChecks}
    kpDone={kpStats.done} kpTotal={kpStats.total}
    flashKnown={flashStats.known} flashTotal={flashStats.total}
    errorCount={errorCount} gotoTab={gotoTab} gotoSub={gotoSub} />;
  else if (view.tab === 'schedule') content = <ScreenSchedule today={today} checks={checks} setChecks={setChecks} />;
  else if (view.tab === 'memo') content = <ScreenMemo flashState={flashState} setFlashState={setFlashState} />;
  else if (view.tab === 'errors') content = <ScreenErrors errors={errors} setErrors={setErrors}
    repeatChecks={repeatChecks} setRepeatChecks={setRepeatChecks} />;
  else if (view.tab === 'more') {
    if (view.sub === 'summary') content = <ScreenSummary />;
    else if (view.sub === 'keypoints') content = <ScreenKeyPoints checks={kpChecks} setChecks={setKpChecks} />;
    else if (view.sub === 'mock') content = <ScreenMock scores={scores} setScores={setScores} />;
    else if (view.sub === 'routine') content = <ScreenRoutine />;
    else content = <ScreenMore gotoMore={gotoSub} resetAll={resetAll} />;
  }

  return (
    <div className="m-app">
      <div className="m-topbar">
        {view.sub ? (
          <button className="m-btn ghost sm" style={{ padding:'4px 0 4px 0', color:'var(--accent)' }} onClick={backToMore}>‹ 더보기</button>
        ) : (
          <span className="left-meta">FX SPECIALIST</span>
        )}
        <span className="title">{topTitle}</span>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span className="dday-mini">D{dday >= 0 ? '-' : '+'}{Math.abs(dday)}</span>
          <button onClick={() => location.reload()} style={{ background:'none', border:'none', cursor:'pointer', fontSize:18, lineHeight:1, padding:'2px 4px', color:'var(--ink-2)', WebkitTapHighlightColor:'transparent' }} title="새로고침">↺</button>
        </div>
      </div>

      <div className="m-screen" key={view.tab + (view.sub || '')}>
        {content}
      </div>

      <nav className="m-tabbar">
        {TAB_DEFS.map(t => {
          const active = view.tab === t.id;
          let badge = null;
          if (t.id === 'errors' && errorCount > 0) badge = errorCount;
          return (
            <button key={t.id} className={`m-tab${active ? ' active' : ''}`} onClick={() => gotoTab(t.id)}>
              {t.icon}
              <span className="label">{t.label}</span>
              {badge && <span className="badge">{badge > 99 ? '99+' : badge}</span>}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

Object.assign(window, { MobileApp });
