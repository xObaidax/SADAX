function Results({ results, onRetry, onRetryWrong, onHome }) {
  const { t } = useI18n();
  const total = results.length;
  const correct = results.filter(r => r.correct).length;
  const pct = total ? Math.round((correct / total) * 100) : 0;
  const wrong = results.filter(r => !r.correct);
  let label = t("tryAgain"), msg = t("msgTryAgain"), emoji = "muscles";
  if (pct >= 90) { label = t("excellent"); msg = t("msgExcellent"); emoji = "star"; }
  else if (pct >= 70) { label = t("good"); msg = t("msgGood"); emoji = "applause"; }
  else if (pct >= 50) { label = t("fair"); msg = t("msgFair"); emoji = "thumbsUp"; }
  return (
    <div className="results-box glass">
      <div className="results-emoji"><LearningEmoji emoji={emoji} /></div>
      <h2 style={{ fontSize: 30, fontWeight: 900, marginBottom: 10 }}>{t("results")}</h2>
      <div className="score-circle">{pct}%</div>
      <div className="muted">{t("correctAnswers")}: <strong style={{ color: "var(--primary)", fontSize: 16 }}>{correct}/{total}</strong></div>
      <div style={{ margin: "16px 0", fontWeight: 800, fontSize: 19 }}>{label}</div>
      <div className="results-message">{msg}</div>
      {wrong.length > 0 && (
        <div className="wrong-words-section">
          <div className="wrong-words-title"><CrossIcon size={16} color="#7B2D2D" /> {t("wrongWords")}</div>
          {wrong.map((w, i) => (
            <div key={i} className="word-row">
              <div>
                <div className="word-row-text">{w.word}</div>
                <div className="word-row-translation">→ {w.translation}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      <button type="button" className="btn btn-primary btn-block btn-lg" onClick={onRetry}><RefreshIcon /> {t("retry")}</button>
      {wrong.length > 0 && (<button type="button" className="btn btn-secondary btn-block" style={{ marginTop: 10 }} onClick={onRetryWrong}><StarIcon /> {t("retryWrong")}</button>)}
      <button type="button" className="btn btn-secondary btn-block" style={{ marginTop: 10 }} onClick={onHome}><HomeIcon /> {t("home")}</button>
    </div>
  );
}

function ActivityView({ usage, totalWords, stats }) {
  const { t } = useI18n();
  const [sheet, setSheet] = useState({ open: false, view: 'annual', month: null });
  const [selectedDayData, setSelectedDayData] = useState(null);
  const dailyActivity = stats.dailyActivity || {};
  const accuracy = stats.wordsReviewed > 0 ? Math.round((stats.correctAnswers / stats.wordsReviewed) * 100) : 0;
  let streak = 0;
  const todayDate = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(todayDate);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (dailyActivity[key] && (dailyActivity[key].reviewed > 0 || dailyActivity[key].added > 0)) { streak++; }
    else if (i > 0) { break; }
  }
  const weekDays = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const dayData = dailyActivity[key] || {};
    weekDays.push({ label: d.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 2), reviewed: dayData.reviewed || 0, added: dayData.added || 0, date: key });
  }
  const weekReviewedTotal = weekDays.reduce((a, b) => a + b.reviewed, 0);
  const weekAddedTotal = weekDays.reduce((a, b) => a + b.added, 0);
  const usageWeekMap = {};
  usage.weekDays.forEach(d => { usageWeekMap[d.date] = d.value; });
  const weekTimeTotal = weekDays.reduce((s, d) => s + (usageWeekMap[d.date] || 0), 0);
  const year = new Date().getFullYear();
  const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
  const currentMonth = new Date().getMonth();
  const yearStr = String(year);
  const yearReviewed = Object.keys(dailyActivity).filter(k => k.startsWith(yearStr)).reduce((s, k) => s + (dailyActivity[k].reviewed || 0), 0);
  const yearAdded = Object.keys(dailyActivity).filter(k => k.startsWith(yearStr)).reduce((s, k) => s + (dailyActivity[k].added || 0), 0);
  const yearTime = Object.entries(usage.daily || {}).filter(([k]) => k.startsWith(yearStr)).reduce((s, [, v]) => s + (v || 0), 0);
  const getIntensity = (val) => { if (val === 0) return 0; if (val < 5) return 1; if (val < 15) return 2; return 3; };
  const renderAnnualView = () => (
    <div>
      <div className="year-summary-bar">
        <div className="summary-stat"><div className="summary-stat-icon"><BooksIcon size={24} /></div><div className="summary-stat-value">{yearReviewed}</div><div className="summary-stat-label">{t("reviewedWords")}</div></div>
        <div className="summary-stat"><div className="summary-stat-icon"><PlusIcon size={18} /></div><div className="summary-stat-value">{yearAdded}</div><div className="summary-stat-label">{t("wordsAdded")}</div></div>
        <div className="summary-stat"><div className="summary-stat-icon"><ClockIcon size={22} /></div><div className="summary-stat-value">{usage.fmt(yearTime)}</div><div className="summary-stat-label">{t("totalTime")}</div></div>
        <div className="summary-stat"><div className="summary-stat-icon"><FlameSmallIcon size={24} /></div><div className="summary-stat-value">{streak}</div><div className="summary-stat-label">{t("daysStreak")}</div></div>
      </div>
      <div className="year-grid">
        {monthNames.map((name, i) => {
          let monthReviewed = 0, monthAdded = 0;
          const monthKey = `${year}-${String(i + 1).padStart(2, '0')}`;
          Object.keys(dailyActivity).forEach(dayKey => {
            if (dayKey.startsWith(monthKey)) { monthReviewed += dailyActivity[dayKey].reviewed || 0; monthAdded += dailyActivity[dayKey].added || 0; }
          });
          const isActive = monthReviewed > 0 || monthAdded > 0;
          const isCurrent = i === currentMonth;
          const weeks = [];
          const daysInMonth = new Date(year, i + 1, 0).getDate();
          for (let w = 0; w < 5; w++) {
            let weekTotal = 0;
            for (let d = w * 7 + 1; d <= Math.min((w + 1) * 7, daysInMonth); d++) {
              const dayKey = `${monthKey}-${String(d).padStart(2, '0')}`;
              const dd = dailyActivity[dayKey] || {};
              weekTotal += (dd.reviewed || 0) + (dd.added || 0);
            }
            weeks.push(weekTotal);
          }
          const maxWeek = Math.max(1, ...weeks);
          return (
            <div key={i} className={`month-card ${isCurrent ? 'current' : ''} ${!isActive ? 'inactive' : ''}`} onClick={() => isActive && setSheet({ ...sheet, view: 'month', month: monthKey })}>
              <div className="month-name">{name}</div>
              <div className="month-sparkline">
                {weeks.map((w, j) => (<div key={j} className={`spark-bar ${w === 0 ? 'empty' : ''}`} style={{ height: `${w === 0 ? 15 : Math.max(20, (w / maxWeek) * 100)}%` }} />))}
              </div>
              <div className="month-count">{isActive ? `${monthReviewed + monthAdded} ${t("words")}` : '—'}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
  const renderMonthView = () => {
    const [y, m] = sheet.month.split('-').map(Number);
    const daysInMonth = new Date(y, m, 0).getDate();
    const firstDay = new Date(y, m - 1, 1).getDay();
    const dayHeaders = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    return (
      <div>
        <button className="back-btn" onClick={() => setSheet({ ...sheet, view: 'annual' })}>← {t("back")}</button>
        <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 12 }}>{monthNames[m - 1]} {y}</h3>
        <div className="calendar-grid">
          {dayHeaders.map((h, i) => <div key={i} className="calendar-day-header">{h}</div>)}
          {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} className="calendar-day empty" />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dayKey = `${sheet.month}-${String(dayNum).padStart(2, '0')}`;
            const dayData = dailyActivity[dayKey];
            const hasActivity = dayData && (dayData.reviewed > 0 || dayData.added > 0);
            return (<div key={dayNum} className={`calendar-day ${hasActivity ? 'has-activity' : 'empty'}`} onClick={() => hasActivity && setSelectedDayData({ key: dayKey, dayNum, data: dayData })}>{dayNum}</div>);
          })}
        </div>
        {selectedDayData && selectedDayData.key.startsWith(sheet.month) && (
          <div className="day-detail-popover">
            <div className="popover-header">
              <div className="popover-title">{monthNames[m - 1]} {selectedDayData.dayNum}, {y}</div>
              <button className="sheet-close" onClick={() => setSelectedDayData(null)} aria-label="Close"><CloseIcon /></button>
            </div>
            <div className="popover-stat"><span className="popover-stat-label"><BookIcon size={14} color="var(--color-primary)" /> {t("reviewedWords")}</span><span className="popover-stat-value">{selectedDayData.data.reviewed || 0}</span></div>
            <div className="popover-stat"><span className="popover-stat-label"><PlusIcon size={14} /> {t("wordsAdded")}</span><span className="popover-stat-value">{selectedDayData.data.added || 0}</span></div>
            <div className="popover-stat"><span className="popover-stat-label"><CheckIcon size={14} color="#2D6A4F" /> {t("correctAnswers")}</span><span className="popover-stat-value">{selectedDayData.data.correct || 0}</span></div>
            <div className="popover-stat"><span className="popover-stat-label"><CrossIcon size={14} color="#7B2D2D" /> {t("wrong")}</span><span className="popover-stat-value">{selectedDayData.data.wrong || 0}</span></div>
            <div className="popover-stat"><span className="popover-stat-label"><ClockIcon size={14} /> {t("time")}</span><span className="popover-stat-value">{usage.fmt(usage.daily?.[selectedDayData.key] || 0)}</span></div>
          </div>
        )}
      </div>
    );
  };
  const hasActivity = (stats.wordsReviewed || 0) > 0 || (stats.wordsAdded || 0) > 0 || (stats.gamesPlayed || 0) > 0 || weekTimeTotal > 0;
  return (
    <div className="activity-view">
      <div className="stats-header-row"><h2><StatsIcon active={true} /> {t("stats")}</h2></div>
      {!hasActivity ? (
        <div className="stats-empty-state">
          <div className="stats-empty-icon"><StatsIcon active={false} /></div>
          <div className="stats-empty-title">{t("noActivity")}</div>
          <div className="stats-empty-desc">{t("noActivityDesc")}</div>
        </div>
      ) : (
        <>
          <div className="stats-week-strip">
            <div className="week-summary">
              <span className="week-summary-item"><BooksIcon size={16} /> {weekReviewedTotal} {t("reviewedToday")}</span>
              <span className="week-summary-item"><PlusIcon size={16} /> {weekAddedTotal} {t("wordsAdded")}</span>
              <span className="week-summary-item"><ClockIcon size={16} /> {usage.fmt(weekTimeTotal)}</span>
            </div>
            <div className="week-days-compact">
              {weekDays.map((d, i) => (
                <div key={i} className="day-num-item" title={`${d.reviewed} reviewed, ${d.added} added`}>
                  <div className="day-num-label">{d.label}</div>
                  <div className={`day-num-value intensity-${getIntensity(d.reviewed + d.added)}`}>{d.reviewed > 0 ? d.reviewed : d.added > 0 ? `+${d.added}` : '—'}</div>
                </div>
              ))}
            </div>
            <button className="btn-annual-details" onClick={() => setSheet({ open: true, view: 'annual', month: null })}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              {t("annualDetails")}
            </button>
          </div>
          <div className="stats-totals-grid">
            <div className="total-card"><div className="total-icon"><BooksIcon /></div><div className="total-value">{stats.wordsReviewed || 0}</div><div className="total-label">{t("reviewedWords")}</div></div>
            <div className="total-card"><div className="total-icon"><TargetIcon /></div><div className="total-value">{accuracy}%</div><div className="total-label">{t("accuracy")}</div></div>
            <div className="total-card"><div className="total-icon"><ClockIcon /></div><div className="total-value">{usage.fmt(usage.total)}</div><div className="total-label">{t("totalTime")}</div></div>
            <div className="total-card"><div className="total-icon"><FlameSmallIcon /></div><div className="total-value">{streak}</div><div className="total-label">{t("streak")}</div></div>
          </div>
          <div className="stats-week-strip" style={{ marginTop: 16 }}>
            <div className="stat-row"><span className="stat-row-label"><BookIcon size={16} color="var(--color-primary)" /> {t("totalWords")}</span><span className="stat-row-value">{totalWords}</span></div>
            <div className="stat-row"><span className="stat-row-label"><GemIcon size={16} color="var(--color-primary)" /> {t("wordsAdded")}</span><span className="stat-row-value">{stats.wordsAdded || 0}</span></div>
            <div className="stat-row"><span className="stat-row-label"><GamepadIcon size={16} color="var(--color-primary)" /> {t("gamesPlayed")}</span><span className="stat-row-value">{stats.gamesPlayed || 0}</span></div>
            <div className="stat-row"><span className="stat-row-label"><CheckIcon size={16} color="#2D6A4F" /> {t("correctAnswers")}</span><span className="stat-row-value">{stats.correctAnswers || 0}</span></div>
            <div className="stat-row"><span className="stat-row-label"><CrossIcon size={16} color="#7B2D2D" /> {t("wrong")}</span><span className="stat-row-value">{stats.wrongAnswers || 0}</span></div>
          </div>
        </>
      )}
      {sheet.open && (
        <div className="bottom-sheet-overlay" onClick={() => { setSheet({ ...sheet, open: false }); setSelectedDayData(null); }}>
          <div className="bottom-sheet" onClick={e => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="sheet-header">
              <div className="sheet-title">{t("annualDetails")} — {year}</div>
              <button className="sheet-close" onClick={() => { setSheet({ ...sheet, open: false }); setSelectedDayData(null); }} aria-label="Close"><CloseIcon /></button>
            </div>
            {sheet.view === 'annual' && renderAnnualView()}
            {sheet.view === 'month' && renderMonthView()}
          </div>
        </div>
      )}
    </div>
  );
}

function BottomNav({ activeTab, onTabChange, t }) {
  const tabs = [
    { id: 'traduire', icon: TranslateIcon, label: t('traduire') },
    { id: 'games', icon: GamesIcon, label: t('games') },
    { id: 'stats', icon: StatsIcon, label: t('stats') },
    { id: 'settings', icon: SettingsIcon, label: t('settings') }
  ];
  return (
    <nav className="bottom-nav-premium" role="navigation" aria-label="Main navigation">
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        const IconComponent = tab.icon;
        return (
          <button key={tab.id} className={`nav-tab ${isActive ? 'active' : ''}`} onClick={() => onTabChange(tab.id)} aria-label={tab.label} aria-current={isActive ? 'page' : undefined}>
            <span className="nav-icon"><IconComponent active={isActive} /></span>
            <span className="nav-label">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

const TRANSLATION_LANG_CODES = { ar: "ar", en: "en", fr: "fr", es: "es", de: "de", pt: "pt", ja: "ja" };
function parseGoogleTranslation(data) {
  if (!Array.isArray(data) || !Array.isArray(data[0])) return "";
  return data[0].map(part => Array.isArray(part) ? (part[0] || "") : "").join("").trim();
}
async function translateWithGoogle(text, source, target, signal) {
  const sl = TRANSLATION_LANG_CODES[source] || source;
  const tl = TRANSLATION_LANG_CODES[target] || target;
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(sl)}&tl=${encodeURIComponent(tl)}&dt=t&q=${encodeURIComponent(text.trim())}`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error("Google translation request failed");
  const translated = parseGoogleTranslation(await res.json());
  if (!translated) throw new Error("Google returned no translation");
  return translated;
}
async function translateWithMyMemory(text, source, target, signal) {
  const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.trim())}&langpair=${encodeURIComponent(source)}|${encodeURIComponent(target)}`, { signal });
  if (!res.ok) throw new Error("MyMemory translation request failed");
  const data = await res.json();
  const translated = data?.responseData?.translatedText?.trim();
  if (!translated || translated.toLowerCase().includes("mymemory warning")) throw new Error("MyMemory returned no translation");
  return translated;
}
async function translateAccurately(text, source, target, signal) {
  try {
    return await translateWithGoogle(text, source, target, signal);
  } catch (googleError) {
    if (googleError?.name === "AbortError") throw googleError;
    return await translateWithMyMemory(text, source, target, signal);
  }
}

function HistoryList({ entries, setEntries, onSelect, onSpeak }) {
  const { t } = useI18n();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const filtered = entries.filter(entry =>
    entry.source.toLowerCase().includes(search.toLowerCase()) ||
    entry.result.toLowerCase().includes(search.toLowerCase())
  );
  const relativeTime = timestamp => {
    const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60000));
    if (minutes < 1) return t("traduire_history_just_now");
    if (minutes < 60) return t("traduire_history_minutes_ago").replace("{n}", minutes);
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return t("traduire_history_hours_ago").replace("{n}", hours);
    return t("traduire_history_days_ago").replace("{n}", Math.floor(hours / 24));
  };
  const copyEntry = async result => {
    if (!navigator.clipboard?.writeText) return;
    try {
      await navigator.clipboard.writeText(result);
      toast(t("traduire_history_copied"), "success");
    } catch {}
  };
  const deleteEntry = id => {
    setEntries(prev => prev.filter(entry => entry.id !== id));
    toast(t("traduire_history_deleted"), "info");
  };
  const clearAll = () => {
    if (!window.confirm(t("traduire_history_confirm_clear"))) return;
    setEntries([]);
    toast(t("traduire_history_deleted"), "info");
  };
  return (
    <section className="traduire-history" aria-label={t("traduire_history")}>
      <button type="button" className="traduire-history-toggle" onClick={() => setOpen(value => !value)} aria-expanded={open}>
        <span>{t("traduire_history")} ({entries.length})</span><span className="traduire-history-chevron" aria-hidden="true">⌄</span>
      </button>
      {open && <div className="traduire-history-content">
        <div className="traduire-history-toolbar">
          <input className="traduire-history-search" type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder={t("traduire_history_search")} aria-label={t("traduire_history_search")} />
          <button type="button" className="traduire-history-clear" onClick={clearAll} disabled={!entries.length}>{t("traduire_history_clear_all")}</button>
        </div>
        {filtered.length ? <ul className="traduire-history-list">
          {filtered.map(entry => <li className="traduire-history-entry" key={entry.id}>
            <button type="button" className="traduire-history-select" onClick={() => onSelect(entry)}>
              <span className="traduire-history-source" dir="auto">{entry.source.slice(0, 60)}{entry.source.length > 60 ? "…" : ""}</span>
              <span className="traduire-history-result" dir="auto">{entry.result.slice(0, 60)}{entry.result.length > 60 ? "…" : ""}</span>
              <span className="traduire-history-meta">{entry.sourceLang.toUpperCase()} → {entry.targetLang.toUpperCase()} · {relativeTime(entry.timestamp)}</span>
            </button>
            <div className="traduire-history-actions">
              <button type="button" onClick={() => copyEntry(entry.result)} aria-label={t("traduire_copy")} title={t("traduire_copy")}>{t("traduire_copy")}</button>
              <button type="button" onClick={() => onSpeak(entry.result, entry.targetLang)} aria-label={t("traduire_speak")} title={t("traduire_speak")}><SpeakerIcon /></button>
              <button type="button" onClick={() => deleteEntry(entry.id)} aria-label={t("delete")} title={t("delete")}>{t("delete")}</button>
            </div>
          </li>)}
        </ul> : <p className="traduire-history-empty">{t("traduire_history_empty")}</p>}
      </div>}
    </section>
  );
}

function TranslateMicButton({ supported, listening, onClick, t }) {
  if (!supported) return null;
  return <button type="button" className={`traduire-mic ${listening ? "is-listening" : ""}`} onClick={onClick} aria-label={t(listening ? "traduire_mic_stop" : "traduire_mic_start")} aria-pressed={listening} title={t(listening ? "traduire_mic_stop" : "traduire_mic_start")}><VoiceIcon size={20} /></button>;
}

function TranslatePage({ draft, setDraft }) {
  const { t } = useI18n();
  const toast = useToast();
  const { speakText, speaking } = useSpeech();
  const { sourceLang, targetLang, sourceText, result } = draft;
  const [status, setStatus] = useState("idle");
  const [errorKey, setErrorKey] = useState("");
  const [estimatedLang, setEstimatedLang] = useState("");
  const [audioSide, setAudioSide] = useState(null);
  const [history, setHistory] = useLocalStorage("hams_traduire_history", []);
  const [listeningSide, setListeningSide] = useState(null);
  const listening = listeningSide !== null;
  const [micSupported] = useState(() => !!(window.SpeechRecognition || window.webkitSpeechRecognition));
  const requestRef = useRef(null);
  const recognitionRef = useRef(null);
  const skipTranslationRef = useRef(false);
  const translatorRef = useRef(null);
  const sourceInputRef = useRef(null);
  const focusSourceRef = useRef(false);
  const languageCodes = ["ar", "fr", "en"];
  const browserLang = (navigator.language || "").split("-")[0].toLowerCase();
  const browserGuess = languageCodes.includes(browserLang) ? browserLang : "";
  const sourceAudioLang = sourceLang === "auto" ? (estimatedLang || browserGuess) : sourceLang;

  const cancelRequest = () => {
    if (requestRef.current) requestRef.current.abort();
    requestRef.current = null;
  };
  useEffect(() => {
    cancelRequest();
    if (skipTranslationRef.current) { skipTranslationRef.current = false; return; }
    if (listening) { setStatus("idle"); return; }
    const text = sourceText.trim();
    if (text.length < 2) {
      setDraft(prev => prev.result ? { ...prev, result: "" } : prev);
      setStatus("idle");
      setErrorKey("");
      setEstimatedLang("");
      return;
    }
    const controller = new AbortController();
    requestRef.current = controller;
    setStatus("loading");
    setErrorKey("");
    setEstimatedLang("");
    let timeoutId;
    let timedOut = false;
    const showFailure = key => {
      if (requestRef.current !== controller) return;
      setErrorKey(key);
      setStatus("error");
      toast(t(key), "error");
    };
    const timer = setTimeout(async () => {
      if (navigator.onLine === false) {
        showFailure("traduire_error_offline");
        return;
      }
      timeoutId = setTimeout(() => { timedOut = true; controller.abort(); }, 10000);
      try {
        const translated = await translateAccurately(text, sourceLang, targetLang, controller.signal);
        if (requestRef.current === controller && !controller.signal.aborted) {
          setDraft(prev => ({ ...prev, result: translated }));
          setStatus("success");
          if (sourceLang === "auto") setEstimatedLang(browserGuess);
          if (translated.trim()) setHistory(prev => {
            const entries = Array.isArray(prev) ? prev : [];
            const now = Date.now();
            const duplicate = entries.find(entry => entry.source === text && entry.result === translated && entry.sourceLang === sourceLang && entry.targetLang === targetLang && now - entry.timestamp < 60000);
            if (duplicate) return [{ ...duplicate, timestamp: now }, ...entries.filter(entry => entry.id !== duplicate.id)];
            return [{ id: uid(), source: text, result: translated, sourceLang, targetLang, timestamp: now }, ...entries].slice(0, 100);
          });
        }
      } catch (error) {
        if (timedOut) showFailure("traduire_error_timeout");
        else if (!controller.signal.aborted) showFailure(navigator.onLine === false ? "traduire_error_offline" : "traduire_error_generic");
      } finally {
        clearTimeout(timeoutId);
        if (requestRef.current === controller) requestRef.current = null;
      }
    }, 400);
    return () => {
      clearTimeout(timer);
      clearTimeout(timeoutId);
      controller.abort();
      if (requestRef.current === controller) requestRef.current = null;
    };
  }, [sourceText, sourceLang, targetLang, browserGuess, listening, setDraft, setHistory, toast, t]);

  useEffect(() => () => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.onresult = null;
      recognitionRef.current.onerror = null;
      try { recognitionRef.current.stop(); } catch {}
    }
  }, []);

  useEffect(() => {
    if (!focusSourceRef.current) return;
    focusSourceRef.current = false;
    sourceInputRef.current?.focus();
    sourceInputRef.current?.setSelectionRange(sourceText.length, sourceText.length);
  });

  const discardMicrophone = () => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    recognition.onresult = null;
    recognitionRef.current = null;
    try { recognition.stop(); } catch {}
    setListeningSide(null);
  };
  const swapLanguages = () => {
    const resolvedSource = sourceLang === "auto" ? sourceAudioLang : sourceLang;
    if (!resolvedSource) return;
    discardMicrophone();
    cancelRequest();
    setDraft(prev => ({ ...prev, sourceLang: prev.targetLang, targetLang: resolvedSource }));
    setEstimatedLang("");
  };
  const clearText = () => {
    discardMicrophone();
    cancelRequest();
    setDraft(prev => ({ ...prev, sourceText: "", result: "" }));
    setStatus("idle");
    setErrorKey("");
    setEstimatedLang("");
  };
  const playAudio = side => {
    const text = side === "source" ? sourceText : result;
    const lang = side === "source" ? sourceAudioLang : targetLang;
    if (!text.trim() || !lang) return;
    setAudioSide(side);
    speakText(text, lang);
  };
  const copyResult = async () => {
    if (!result || !navigator.clipboard?.writeText) return;
    try { await navigator.clipboard.writeText(result); } catch {}
  };
  const selectHistory = entry => {
    cancelRequest();
    discardMicrophone();
    skipTranslationRef.current = listening || sourceText !== entry.source || sourceLang !== entry.sourceLang || targetLang !== entry.targetLang;
    setDraft({ sourceLang: entry.sourceLang, targetLang: entry.targetLang, sourceText: entry.source, result: entry.result });
    setStatus("success");
    setErrorKey("");
    setEstimatedLang("");
    translatorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const moveTargetToSource = (text, keepMicrophone = false) => {
    if (!keepMicrophone) discardMicrophone();
    cancelRequest();
    const movedText = text.slice(0, 1000);
    const formerSource = sourceLang === "auto" ? (sourceAudioLang || (targetLang === "fr" ? "en" : "fr")) : sourceLang;
    focusSourceRef.current = true;
    setDraft(prev => ({ ...prev, sourceLang: prev.targetLang, targetLang: formerSource, sourceText: movedText, result: "" }));
    setStatus("idle");
    setErrorKey("");
    setEstimatedLang("");
  };
  const handleTargetChange = event => {
    const text = event.target.value;
    const inputType = event.nativeEvent?.inputType || "";
    if (!text || inputType.startsWith("delete")) {
      discardMicrophone();
      cancelRequest();
      setDraft(prev => ({ ...prev, result: text }));
      setStatus("idle");
      setErrorKey("");
      return;
    }
    moveTargetToSource(text);
  };
  const toggleMicrophone = side => {
    if (listeningSide === side) {
      try { recognitionRef.current?.stop(); } catch {}
      setListeningSide(null);
      return;
    }
    if (listening) discardMicrophone();
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) return;
    const recognition = new Recognition();
    const recognitionLang = side === "source" ? (sourceLang === "auto" ? (browserGuess || "en") : sourceLang) : targetLang;
    recognition.lang = { ar: "ar-SA", fr: "fr-FR", en: "en-US" }[recognitionLang];
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    const baseText = (side === "source" ? sourceText : result).trim();
    let targetSwapped = false;
    recognition.onresult = event => {
      const transcript = Array.from(event.results, item => item[0].transcript).join(" ").trim();
      if (!transcript) return;
      const recognizedText = [baseText, transcript].filter(Boolean).join(" ").slice(0, 1000);
      if (side === "target") {
        if (!recognizedText) return;
        if (!targetSwapped) {
          targetSwapped = true;
          moveTargetToSource(recognizedText, true);
        } else {
          cancelRequest();
          setDraft(prev => ({ ...prev, sourceText: recognizedText, result: "" }));
        }
        return;
      }
      cancelRequest();
      setDraft(prev => ({ ...prev, sourceText: recognizedText, result: "" }));
      setEstimatedLang("");
    };
    recognition.onerror = event => {
      if (recognitionRef.current !== recognition) return;
      setListeningSide(null);
      if (event.error === "not-allowed" || event.error === "service-not-allowed") toast(t("traduire_mic_denied"), "error");
      else if (event.error === "network") toast(t("traduire_mic_failed"), "error");
    };
    recognition.onend = () => {
      if (recognitionRef.current === recognition) { recognitionRef.current = null; setListeningSide(null); }
    };
    recognitionRef.current = recognition;
    try { recognition.start(); setListeningSide(side); } catch {
      recognitionRef.current = null;
      setListeningSide(null);
      toast(t("traduire_mic_failed"), "error");
    }
  };
  const resultPlaceholder = status === "error" ? t(errorKey) : status === "loading" ? t("traduire_loading") : t("traduire_result_placeholder");
  const countLabel = t("traduire_char_count").replace("{n}", sourceText.length).replace("{max}", 1000);

  return (
    <section className="traduire-page" ref={translatorRef}>
      <h2 className="traduire-title">{t("traduire_title")}</h2>
      <div className="traduire-languages">
        <div className="traduire-language">
          <label className="traduire-label" htmlFor="traduire-source-lang">{t("traduire_from")}</label>
          <select className="traduire-select" id="traduire-source-lang" value={sourceLang} onChange={e => { discardMicrophone(); cancelRequest(); setDraft(prev => ({ ...prev, sourceLang: e.target.value })); setEstimatedLang(""); }}>
            <option value="auto">{t("traduire_auto_detect")}</option>
            {languageCodes.map(code => <option key={code} value={code}>{getLang(code).name}</option>)}
          </select>
        </div>
        <button type="button" className="traduire-swap" onClick={swapLanguages} disabled={sourceLang === "auto" && !sourceAudioLang} aria-label={t("traduire_swap")} title={t("traduire_swap")}>⇄</button>
        <div className="traduire-language">
          <label className="traduire-label" htmlFor="traduire-target-lang">{t("traduire_to")}</label>
          <select className="traduire-select" id="traduire-target-lang" value={targetLang} onChange={e => { discardMicrophone(); cancelRequest(); setDraft(prev => ({ ...prev, targetLang: e.target.value })); }}>
            {languageCodes.map(code => <option key={code} value={code}>{getLang(code).name}</option>)}
          </select>
        </div>
      </div>
      <div className="traduire-panels">
        <div className="traduire-panel">
          <div className="traduire-panel-heading">
            <label className="traduire-label" htmlFor="traduire-source-text">{t("traduire_from")}</label>
            <div className="traduire-audio-actions">
              <TranslateMicButton supported={micSupported} listening={listeningSide === "source"} onClick={() => toggleMicrophone("source")} t={t} />
              <button type="button" className={`traduire-speak ${speaking && audioSide === "source" ? "traduire-speak-playing" : ""}`} onClick={() => playAudio("source")} disabled={!sourceText.trim() || !sourceAudioLang} aria-label={t("traduire_speak")}><SpeakerIcon active={speaking && audioSide === "source"} /></button>
            </div>
          </div>
          <textarea className="traduire-textarea" id="traduire-source-text" ref={sourceInputRef} value={sourceText} onChange={e => { discardMicrophone(); cancelRequest(); setDraft(prev => ({ ...prev, sourceText: e.target.value.slice(0, 1000), result: "" })); setEstimatedLang(""); }} maxLength={1000} placeholder={t("traduire_placeholder")} lang={sourceLang === "auto" ? undefined : sourceLang} dir={sourceLang === "ar" ? "rtl" : "ltr"} />
          <div className="traduire-source-meta">
            {sourceLang === "auto" && estimatedLang && status === "success" && <span className="traduire-detected">{t("traduire_detected")}: {estimatedLang}</span>}
            {sourceText.length > 0 && <span className={`traduire-counter ${sourceText.length > 900 ? "traduire-counter-warning" : ""}`}>{countLabel}</span>}
          </div>
        </div>
        <div className="traduire-panel">
          <div className="traduire-panel-heading">
            <label className="traduire-label" htmlFor="traduire-result-text">{t("traduire_to")}</label>
            <div className="traduire-audio-actions">
              <TranslateMicButton supported={micSupported} listening={listeningSide === "target"} onClick={() => toggleMicrophone("target")} t={t} />
              <button type="button" className={`traduire-speak ${speaking && audioSide === "result" ? "traduire-speak-playing" : ""}`} onClick={() => playAudio("result")} disabled={!result.trim() || status === "error"} aria-label={t("traduire_speak")}><SpeakerIcon active={speaking && audioSide === "result"} /></button>
            </div>
          </div>
          <textarea className="traduire-textarea traduire-result" id="traduire-result-text" value={result} onChange={handleTargetChange} placeholder={resultPlaceholder} lang={targetLang} dir={targetLang === "ar" ? "rtl" : "ltr"} aria-live="polite" />
        </div>
      </div>
      <div className="traduire-actions">
        <button type="button" className="traduire-copy" onClick={copyResult} disabled={!result || status === "error"}>{t("traduire_copy")}</button>
        <button type="button" className="traduire-clear" onClick={clearText} disabled={!sourceText && !result && status === "idle"}>{t("traduire_clear")}</button>
      </div>
      <HistoryList entries={Array.isArray(history) ? history : []} setEntries={setHistory} onSelect={selectHistory} onSpeak={(text, lang) => { setAudioSide(null); speakText(text, lang); }} />
    </section>
  );
}

function groupFolderWords(words, t, locale) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const dateKey = date => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  const groups = new Map();
  [...words].sort((a, b) => (Date.parse(b.addedAt) || 0) - (Date.parse(a.addedAt) || 0)).forEach(word => {
    const date = word.addedAt ? new Date(word.addedAt) : null;
    const valid = date && !Number.isNaN(date.getTime());
    const key = valid ? dateKey(date) : "unknown";
    if (!groups.has(key)) {
      const label = !valid ? "—" : key === dateKey(today) ? t("group_today") : key === dateKey(yesterday) ? t("group_yesterday") : new Intl.DateTimeFormat(locale, { day: "2-digit", month: "long", year: "numeric" }).format(date);
      groups.set(key, { key, label, words: [] });
    }
    groups.get(key).words.push(word);
  });
  return [...groups.values()];
}

function SetEditor({ set, onBack, onUpdate, onDeleteWord, onWordAdded }) {
  const { t, locale } = useI18n();
  const toast = useToast();
  const [name, setName] = useState(set.name);
  const [lang1, setLang1] = useState(set.lang1);
  const [lang2, setLang2] = useState(set.lang2);
  const [newWord, setNewWord] = useState({ word: "", translation: "" });
  const [editingWordId, setEditingWordId] = useState(null);
  const [selectedFileId, setSelectedFileId] = useState("");
  const [newFileOpen, setNewFileOpen] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [editingFileId, setEditingFileId] = useState(null);
  const [editingFileName, setEditingFileName] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const userEditedRef = useRef(false);
  const translateTimerRef = useRef(null);
  const abortRef = useRef(null);
  const wordInputRef = useRef(null);
  const files = set.files || [];
  const handleVoiceChange = useCallback((text) => { setNewWord(prev => ({ ...prev, word: text })); }, []);
  const handleVoiceError = useCallback((reason) => { toast(reason === "permission" ? t("voicePermission") : t("voiceUnsupported"), "error"); }, [toast, t]);
  const { listening, supported, toggleListening } = useVoiceInput({ language: lang1, value: newWord.word, onChange: handleVoiceChange, onError: handleVoiceError });
  useEffect(() => { setName(set.name); setLang1(set.lang1); setLang2(set.lang2); setSelectedFileId(""); setEditingWordId(null); setNewFileOpen(false); setEditingFileId(null); }, [set.id]);
  const performTranslation = useCallback(async (text) => {
    if (!text.trim()) { setNewWord(prev => ({ ...prev, translation: '' })); return; }
    setIsTranslating(true);
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const translated = await translateAccurately(text, lang1, lang2, controller.signal);
      if (!userEditedRef.current) setNewWord(prev => ({ ...prev, translation: translated }));
    } catch (err) { if (err.name === 'AbortError') return; } finally { setIsTranslating(false); }
  }, [lang1, lang2]);
  useEffect(() => {
    if (editingWordId) return;
    if (newWord.word.trim().length < 2) { setNewWord(prev => ({ ...prev, translation: '' })); return; }
    userEditedRef.current = false;
    clearTimeout(translateTimerRef.current);
    translateTimerRef.current = setTimeout(() => performTranslation(newWord.word), 300);
    return () => clearTimeout(translateTimerRef.current);
  }, [newWord.word, performTranslation, editingWordId]);
  useEffect(() => {
    if (editingWordId) return;
    if (newWord.word.trim().length >= 2) {
      userEditedRef.current = false;
      clearTimeout(translateTimerRef.current);
      translateTimerRef.current = setTimeout(() => performTranslation(newWord.word), 300);
    }
  }, [lang1, lang2, editingWordId]);
  const saveSetInfo = async () => {
    if (await onUpdate({ ...set, name, lang1, lang2 })) toast(t("savedMsg"), "success");
  };
  const addWord = async () => {
    if (!newWord.word.trim() || !newWord.translation.trim()) { toast("Fill both fields", "error"); return; }
    const word = { id: editingWordId || "w" + uid(), word: newWord.word.trim(), translation: newWord.translation.trim(), fileId: selectedFileId || null, ...(!editingWordId ? { addedAt: new Date().toISOString() } : {}) };
    const updatedSet = { ...set, words: editingWordId ? set.words.map(item => item.id === editingWordId ? { ...item, ...word } : item) : [...set.words, word] };
    if (!await onUpdate(updatedSet)) return;
    if (!editingWordId && onWordAdded) onWordAdded();
    setEditingWordId(null);
    setNewWord({ word: "", translation: "" });
    setSelectedFileId("");
    toast(t("savedMsg"), "success");
  };
  const createFile = async () => {
    const fileName = newFileName.trim();
    if (!fileName) return;
    if (!await onUpdate({ ...set, files: [...files, { id: "f_" + uid(), name: fileName }] })) return;
    setNewFileName("");
    setNewFileOpen(false);
    toast(t("savedMsg"), "success");
  };
  const saveFileName = async fileId => {
    const fileName = editingFileName.trim();
    if (!fileName) return;
    if (!await onUpdate({ ...set, files: files.map(file => file.id === fileId ? { ...file, name: fileName } : file) })) return;
    setEditingFileId(null);
    toast(t("savedMsg"), "success");
  };
  const deleteFile = async fileId => {
    if (!confirm(t("folder_delete_file_confirm"))) return;
    const updated = { ...set, files: files.filter(file => file.id !== fileId), words: set.words.map(word => word.fileId === fileId ? { ...word, fileId: null } : word) };
    if (!await onUpdate(updated)) return;
    if (selectedFileId === fileId) setSelectedFileId("");
    toast(t("deleted"), "info");
  };
  const addWordToFile = fileId => {
    setEditingWordId(null);
    setNewWord({ word: "", translation: "" });
    setSelectedFileId(fileId);
    wordInputRef.current?.focus();
  };
  const renderWordGroups = words => groupFolderWords(words, t, locale).map(group => (
    <div key={group.key} className="folder-date-group">
      <div className="folder-date-header">{group.label}</div>
      {group.words.map(w => (
        <div key={w.id} className="word-row">
          <div className="word-row-main">
            <div className="word-row-text">{w.word}</div>
            <div className="word-row-translation">→ {w.translation}</div>
          </div>
          <div className="flex-row">
            <button type="button" className="btn btn-secondary" onClick={() => { setEditingWordId(w.id); setNewWord({ word: w.word, translation: w.translation }); setSelectedFileId(w.fileId || ""); wordInputRef.current?.focus(); }} aria-label={t("edit")}>{t("edit")}</button>
            <button type="button" className="icon-btn danger" onClick={async () => { if (confirm(t("confirmDeleteWord")) && await onDeleteWord(set.id, w.id)) toast(t("deleted"), "info"); }} aria-label={t("delete")}><TrashIcon /></button>
          </div>
        </div>
      ))}
    </div>
  ));
  const l1 = getLang(lang1);
  const l2 = getLang(lang2);
  return (
    <div>
      <div className="page-header">
        <button type="button" className="btn btn-secondary" onClick={onBack}>← {t("back")}</button>
        <h2><EditIcon size={20} /> {t("editor")}</h2>
      </div>
      <div className="editor-box glass">
        <div className="field"><label>{t("setName")}</label><input value={name} onChange={e => setName(e.target.value)} /></div>
        <div className="grid-2">
          <div className="field"><label>{t("firstLang")}</label><select value={lang1} onChange={e => setLang1(e.target.value)}>{LANGS.map(l => (<option key={l.code} value={l.code}>{l.flag} {l.name}</option>))}</select></div>
          <div className="field"><label>{t("secondLang")}</label><select value={lang2} onChange={e => setLang2(e.target.value)}>{LANGS.map(l => (<option key={l.code} value={l.code}>{l.flag} {l.name}</option>))}</select></div>
        </div>
        <button type="button" className="btn btn-primary" onClick={saveSetInfo}><CheckIcon size={16} color="var(--color-text)" /> {t("save")}</button>
      </div>
      <div className="editor-box glass">
        <h3 style={{ marginBottom: 14, fontSize: 17, fontWeight: 800 }}><PlusIcon size={16} /> {t("addWord")}</h3>
        <div className="field">
          <label>{t("word")} ({l1.name})</label>
          <div className="voice-input-wrap">
            <input ref={wordInputRef} value={newWord.word} onChange={e => setNewWord({ ...newWord, word: e.target.value })} placeholder={`${t("word")} (${l1.name})`} />
            <button type="button" className={`voice-input-btn ${listening ? "listening" : ""}`} onClick={toggleListening} disabled={!supported} aria-label={listening ? t("voiceListening") : t("voiceInput")} aria-pressed={listening} title={listening ? t("voiceListening") : t("voiceInput")}><VoiceIcon size={22} /></button>
          </div>
          <div className={`voice-input-hint ${listening ? "listening" : ""}`}><VoiceIcon size={14} /> {listening ? t("voiceListening") : t("voiceInput")}</div>
          {isTranslating && <div className="muted" style={{ marginTop: 8 }}><UiIcon name="hourglass" size={18} /> {t("translating")}</div>}
        </div>
        <div className="field">
          <label>{t("translation")} ({l2.name})</label>
          <input value={newWord.translation} onChange={e => { userEditedRef.current = true; setNewWord({ ...newWord, translation: e.target.value }); }} placeholder={`${t("translation")} (${l2.name})`} />
        </div>
        <div className="field">
          <label htmlFor="folder-word-file">{t("folder_word_file_label")}</label>
          <select id="folder-word-file" value={selectedFileId} onChange={e => setSelectedFileId(e.target.value)}>
            <option value="">{t("folder_word_no_file")}</option>
            {files.map(file => <option key={file.id} value={file.id}>{file.name}</option>)}
          </select>
        </div>
        <button type="button" className="btn btn-success btn-block" onClick={addWord} disabled={!newWord.word.trim() || !newWord.translation.trim()}><PlusIcon size={16} /> {editingWordId ? t("save") : t("add")}</button>
        {editingWordId && <button type="button" className="btn btn-secondary btn-block" onClick={() => { setEditingWordId(null); setNewWord({ word: "", translation: "" }); setSelectedFileId(""); }}>{t("cancel")}</button>}
      </div>
      <div className="editor-box glass">
        <div className="folder-file-toolbar">
          <h3><BookIcon size={16} color="var(--color-primary)" /> {t("words")} ({set.words.length})</h3>
          <button type="button" className="btn btn-secondary" onClick={() => setNewFileOpen(true)}><PlusIcon size={16} /> {t("folder_new_file")}</button>
        </div>
        {newFileOpen && <div className="folder-file-create">
          <input value={newFileName} onChange={e => setNewFileName(e.target.value)} onKeyDown={e => { if (e.key === "Enter") createFile(); }} placeholder={t("folder_file_name_placeholder")} autoFocus />
          <button type="button" className="btn btn-primary" onClick={createFile} disabled={!newFileName.trim()}>{t("save")}</button>
          <button type="button" className="btn btn-secondary" onClick={() => { setNewFileOpen(false); setNewFileName(""); }}>{t("cancel")}</button>
        </div>}
        {set.words.length === 0 && (<div className="empty-state"><div className="empty-icon"><BookIcon size={48} color="var(--color-primary)" /></div><div className="empty-text">{t("noWords")}</div></div>)}
        {files.map(file => {
          const fileWords = set.words.filter(word => word.fileId === file.id);
          return <details key={file.id} className="folder-file-section">
            <summary className="folder-file-summary">{file.name} ({fileWords.length})</summary>
            <div className="folder-file-body">
              <div className="folder-file-actions">
                {editingFileId === file.id ? <>
                  <input value={editingFileName} onChange={e => setEditingFileName(e.target.value)} onKeyDown={e => { if (e.key === "Enter") saveFileName(file.id); }} aria-label={t("folder_file_name_placeholder")} />
                  <button type="button" className="btn btn-primary" onClick={() => saveFileName(file.id)} disabled={!editingFileName.trim()}>{t("save")}</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setEditingFileId(null)}>{t("cancel")}</button>
                </> : <button type="button" className="btn btn-secondary" onClick={() => { setEditingFileId(file.id); setEditingFileName(file.name); }}>{t("edit")}</button>}
                <button type="button" className="btn btn-secondary" onClick={() => addWordToFile(file.id)}>{t("addWord")}</button>
                <button type="button" className="btn btn-danger" onClick={() => deleteFile(file.id)}>{t("folder_delete_file")}</button>
              </div>
              {fileWords.length ? renderWordGroups(fileWords) : <div className="muted">{t("noWords")}</div>}
            </div>
          </details>;
        })}
        {set.words.some(word => !word.fileId || !files.some(file => file.id === word.fileId)) && <div className="folder-file-direct">
          <h4>{t("folder_word_no_file")}</h4>
          {renderWordGroups(set.words.filter(word => !word.fileId || !files.some(file => file.id === word.fileId)))}
        </div>}
      </div>
    </div>
  );
}

