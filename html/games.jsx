function FlashcardsGame({ set, savedIds, onToggleSaved, onFinish, onExit, voiceSettings, onReview, onGameComplete }) {
  const { t } = useI18n();
  const { speakText, speaking } = useSpeech(voiceSettings.rate, voiceSettings.pitch);
  const initialCards = useMemo(() => shuffle(set.words), [set.id, set.words.length]);
  const isSanctuary = set.id === "saved";
  const cards = useMemo(() => isSanctuary ? initialCards : initialCards.filter(w => !savedIds.includes(w.id)), [initialCards, savedIds, isSanctuary]);
  const [idx, setIdx] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [results, setResults] = useState([]);
  const [isAnswering, setIsAnswering] = useState(false);
  const [swipeX, setSwipeX] = useState(0);
  const swipeStartRef = useRef(null);
  const suppressCardClickRef = useRef(false);
  const card = cards[idx];
  useEffect(() => {
    if (idx >= cards.length) {
      if (cards.length === 0) { if (onGameComplete) onGameComplete(); onFinish(results, initialCards); }
      else { setIdx(cards.length - 1); }
    }
  }, [cards.length, idx]);
  useEffect(() => { setShowTranslation(false); setIsAnswering(false); setSwipeX(0); swipeStartRef.current = null; }, [idx]);
  const cardLang1 = card?.lang1 || set.lang1;
  const cardLang2 = card?.lang2 || set.lang2;
  const speakFront = useCallback(() => { if (card) speakText(card.word, cardLang1); }, [card, cardLang1, speakText]);
  const speakBack = useCallback(() => { if (card) speakText(card.translation, cardLang2); }, [card, cardLang2, speakText]);
  const handleCardClick = () => { if (isAnswering) return; setShowTranslation(prev => !prev); };
  const speakCurrent = () => { if (showTranslation) speakBack(); else speakFront(); };
  if (!card) return (<div className="glass results-box"><p>{t("noWords")}</p><button type="button" className="btn btn-primary" onClick={onExit}>{t("home")}</button></div>);
  const l1 = getLang(cardLang1);
  const l2 = getLang(cardLang2);
  const answer = (ok) => {
    if (isAnswering) return;
    setIsAnswering(true);
    if (onReview) onReview(ok);
    const newResults = [...results, { id: card.id, correct: ok, word: card.word, translation: card.translation }];
    setResults(newResults);
    setTimeout(() => {
      if (idx + 1 >= cards.length) { if (onGameComplete) onGameComplete(); onFinish(newResults, initialCards); }
      else { setIdx(idx + 1); }
      setIsAnswering(false);
    }, 400);
  };
  const handleCardPointerDown = (e) => {
    if (isAnswering || (e.pointerType === "mouse" && e.button !== 0)) return;
    swipeStartRef.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const handleCardPointerMove = (e) => {
    if (!swipeStartRef.current || isAnswering) return;
    const dx = e.clientX - swipeStartRef.current.x;
    const dy = e.clientY - swipeStartRef.current.y;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) {
      e.preventDefault();
      setSwipeX(Math.max(-180, Math.min(180, dx)));
    }
  };
  const handleCardPointerUp = (e) => {
    if (!swipeStartRef.current || isAnswering) return;
    const dx = e.clientX - swipeStartRef.current.x;
    const dy = e.clientY - swipeStartRef.current.y;
    swipeStartRef.current = null;
    if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy)) {
      suppressCardClickRef.current = true;
      setSwipeX(dx > 0 ? 500 : -500);
      answer(dx > 0);
      window.setTimeout(() => { suppressCardClickRef.current = false; }, 450);
    } else if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
      suppressCardClickRef.current = true;
      setSwipeX(0);
      window.setTimeout(() => { suppressCardClickRef.current = false; }, 250);
    } else {
      setSwipeX(0);
    }
  };
  const handleCardKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === " ") && !isAnswering) {
      e.preventDefault();
      handleCardClick();
    }
  };
  const isSaved = savedIds.includes(card.id);
  const progress = cards.length ? ((idx + 1) / cards.length) * 100 : 0;
  return (
    <div className="flashcard-game game-shell">
      <div className="game-header">
        <button type="button" className="icon-btn" onClick={onExit} aria-label={t("back")}><CloseIcon /></button>
        <div style={{ textAlign: "center", flex: 1 }}>
          <div className="game-title">{set.name}</div>
          <div className="game-subtitle">{t("card")} {idx + 1} {t("of")} {cards.length}</div>
        </div>
        <button type="button" className="icon-btn" onClick={() => answer(false)} aria-label="Skip"><SkipIcon /></button>
      </div>
      <div className="progress-bar"><div className="progress-fill" style={{ width: progress + "%" }} /></div>
      <div className="dual-card-container single-card-mode">
        <div
          className={`dual-card ${showTranslation ? 'dual-card-arabic' : 'dual-card-french'}`}
          role="button"
          tabIndex={0}
          aria-label={`${t("tapToFlip")}. ${t("correct")} إلى اليمين، ${t("wrong")} إلى اليسار`}
          onClick={() => { if (!suppressCardClickRef.current) handleCardClick(); }}
          onKeyDown={handleCardKeyDown}
          onPointerDown={handleCardPointerDown}
          onPointerMove={handleCardPointerMove}
          onPointerUp={handleCardPointerUp}
          onPointerCancel={() => { swipeStartRef.current = null; setSwipeX(0); }}
          style={swipeX ? { transform: `translate3d(${swipeX}px, 0, 0) rotate(${swipeX / 18}deg)`, transition: "none" } : undefined}
        >
          <span className={`swipe-label right ${swipeX > 30 ? "visible" : ""}`}>✓ {t("correct")}</span>
          <span className={`swipe-label left ${swipeX < -30 ? "visible" : ""}`}>× {t("wrong")}</span>
          <div className="card-top-actions">
            <button type="button" className="card-round-btn save-word-btn" aria-label={isSaved ? t("saved") : t("save")} aria-pressed={isSaved} onPointerDown={e => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); onToggleSaved(card.id); }}>
              <BookmarkIcon filled={isSaved} />
            </button>
            <span className="card-chip">{idx + 1}/{cards.length}</span>
            <button type="button" className="card-round-btn sound-btn" aria-label="Pronunciation" aria-pressed={speaking} onPointerDown={e => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); speakCurrent(); }}>
              <SpeakerIcon active={speaking} />
            </button>
          </div>
          <div className="card-lang-label">{showTranslation ? `${l2.flag} ${l2.name}` : `${l1.flag} ${l1.name}`}</div>
          <div className={showTranslation ? "card-translation" : "card-word"} dir={showTranslation ? l2.dir : l1.dir} lang={showTranslation ? (card.lang2 || set.lang2) : (card.lang1 || set.lang1)}>
            {showTranslation ? card.translation : card.word}
          </div>
          <div className="card-hint">✨ {t("tapToFlip")}</div>
        </div>
      </div>
      <div className="card-dots">
        {cards.slice(0, Math.min(cards.length, 30)).map((c, i) => (
          <div key={c.id} className={`card-dot ${i < idx ? (results[i]?.correct ? 'correct' : 'wrong') : ''} ${i === idx ? 'current' : ''}`} />
        ))}
      </div>
      <div className="answer-buttons">
        <button type="button" className="btn btn-danger btn-lg" onClick={() => answer(false)} disabled={isAnswering}>
          <CrossIcon size={16} /> {t("wrong")}
        </button>
        <button type="button" className="btn btn-success btn-lg" onClick={() => answer(true)} disabled={isAnswering}>
          <CheckIcon size={16} /> {t("correct")}
        </button>
      </div>
    </div>
  );
}

function MCQGame({ set, savedIds, onToggleSaved, onFinish, onExit, voiceSettings, onReview, onGameComplete }) {
  const { t } = useI18n();
  const { speakText } = useSpeech(voiceSettings.rate, voiceSettings.pitch);
  const initialCards = useMemo(() => shuffle(set.words), [set.id, set.words.length]);
  const isSanctuary = set.id === "saved";
  const cards = useMemo(() => isSanctuary ? initialCards : initialCards.filter(w => !savedIds.includes(w.id)), [initialCards, savedIds, isSanctuary]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [options, setOptions] = useState([]);
  const [results, setResults] = useState([]);
  const card = cards[idx];
  useEffect(() => {
    if (idx >= cards.length) {
      if (cards.length === 0) { if (onGameComplete) onGameComplete(); onFinish(results, initialCards); }
      else { setIdx(cards.length - 1); }
    }
  }, [cards.length, idx]);
  useEffect(() => {
    if (!card) return;
    const others = set.words.filter(w => w.id !== card.id && !savedIds.includes(w.id)).map(w => w.translation).sort(() => Math.random() - 0.5).slice(0, 3);
    setOptions(shuffle([card.translation, ...others]));
    setSelected(null);
  }, [idx, card?.id, savedIds]);
  if (!card) return (<div className="glass results-box"><p>{t("noWords")}</p><button type="button" className="btn btn-primary" onClick={onExit}>{t("home")}</button></div>);
  const choose = (opt) => {
    if (selected !== null) return;
    const ok = opt === card.translation;
    setSelected(opt);
    if (onReview) onReview(ok);
    const res = [...results, { id: card.id, correct: ok, word: card.word, translation: card.translation }];
    setResults(res);
    setTimeout(() => {
      if (idx + 1 >= cards.length) { if (onGameComplete) onGameComplete(); onFinish(res, initialCards); }
      else { setIdx(idx + 1); }
    }, 1100);
  };
  const progress = cards.length ? ((idx + 1) / cards.length) * 100 : 0;
  const isSaved = savedIds.includes(card.id);
  return (
    <div className="mcq-game game-shell">
      <div className="game-header">
        <button type="button" className="icon-btn" onClick={onExit} aria-label={t("back")}><CloseIcon /></button>
        <div style={{ textAlign: "center", flex: 1 }}>
          <div className="game-title"><GamepadIcon size={20} color="var(--color-primary)" /> {set.name}</div>
          <div className="game-subtitle">{t("question")} {idx + 1} {t("of")} {cards.length}</div>
        </div>
      </div>
      <div className="progress-bar"><div className="progress-fill" style={{ width: progress + "%" }} /></div>
      <div className="mcq-word-box glass" style={{position: 'relative'}}>
        <div style={{position: 'absolute', top: 12, left: 12, right: 12, display: 'flex', justifyContent: 'space-between', zIndex: 5}}>
          <button type="button" className="icon-btn save-word-btn" aria-label={isSaved ? t("saved") : t("save")} aria-pressed={isSaved} onClick={(e) => { e.stopPropagation(); onToggleSaved(card.id); }}><BookmarkIcon filled={isSaved} /></button>
          <button type="button" className="icon-btn" onClick={(e) => { e.stopPropagation(); speakText(card.word, set.lang1); }}><SpeakerIcon /></button>
        </div>
        <div style={{paddingTop: 30}} lang={card.lang1 || set.lang1}>{card.word}</div>
      </div>
      <div className="mcq-options">
        {options.map((opt, i) => {
          let cls = "mcq-option";
          if (selected !== null) {
            if (opt === card.translation) cls += " correct";
            else if (opt === selected) cls += " wrong";
          }
          return (<button type="button" key={i} className={cls} disabled={selected !== null} onClick={() => choose(opt)}>{opt}</button>);
        })}
      </div>
    </div>
  );
}

function SpellingGame({ set, savedIds, onToggleSaved, onFinish, onExit, voiceSettings, onReview, onGameComplete }) {
  const { t } = useI18n();
  const { speakText } = useSpeech(voiceSettings.rate, voiceSettings.pitch);
  const initialCards = useMemo(() => shuffle(set.words), [set.id, set.words.length]);
  const isSanctuary = set.id === "saved";
  const cards = useMemo(() => isSanctuary ? initialCards : initialCards.filter(w => !savedIds.includes(w.id)), [initialCards, savedIds, isSanctuary]);
  const [idx, setIdx] = useState(0);
  const [val, setVal] = useState("");
  const [msg, setMsg] = useState(null);
  const [results, setResults] = useState([]);
  const card = cards[idx];
  useEffect(() => {
    if (idx >= cards.length) {
      if (cards.length === 0) { if (onGameComplete) onGameComplete(); onFinish(results, initialCards); }
      else { setIdx(cards.length - 1); }
    }
  }, [cards.length, idx]);
  useEffect(() => { setVal(""); setMsg(null); }, [idx, card?.id]);
  if (!card) return (<div className="glass results-box"><p>{t("noWords")}</p><button type="button" className="btn btn-primary" onClick={onExit}>{t("home")}</button></div>);
  const submit = () => {
    if (!card || msg) return;
    const ok = val.trim().toLowerCase() === card.word.toLowerCase();
    setMsg(ok ? "correct" : "wrong");
    if (onReview) onReview(ok);
    const res = [...results, { id: card.id, correct: ok, word: card.word, translation: card.translation }];
    setResults(res);
    setTimeout(() => {
      if (idx + 1 >= cards.length) { if (onGameComplete) onGameComplete(); onFinish(res, initialCards); }
      else { setIdx(idx + 1); }
    }, 1500);
  };
  const progress = cards.length ? ((idx + 1) / cards.length) * 100 : 0;
  const l2 = getLang(set.lang2);
  const isSaved = savedIds.includes(card.id);
  return (
    <div className="spelling-game game-shell">
      <div className="game-header">
        <button type="button" className="icon-btn" onClick={onExit} aria-label={t("back")}><CloseIcon /></button>
        <div style={{ textAlign: "center", flex: 1 }}>
          <div className="game-title"><BookIcon size={20} color="var(--color-primary)" /> {set.name}</div>
          <div className="game-subtitle">{t("question")} {idx + 1} {t("of")} {cards.length}</div>
        </div>
      </div>
      <div className="progress-bar"><div className="progress-fill" style={{ width: progress + "%" }} /></div>
      <div className="spelling-box glass" style={{position: 'relative'}}>
        <div style={{position: 'absolute', top: 12, left: 12, right: 12, display: 'flex', justifyContent: 'space-between', zIndex: 5}}>
          <button type="button" className="icon-btn save-word-btn" aria-label={isSaved ? t("saved") : t("save")} aria-pressed={isSaved} onClick={(e) => { e.stopPropagation(); onToggleSaved(card.id); }}><BookmarkIcon filled={isSaved} /></button>
          <button type="button" className="icon-btn" onClick={(e) => { e.stopPropagation(); speakText(card.translation, set.lang2); }}><SpeakerIcon /></button>
        </div>
        <div style={{marginTop: 30, fontSize: 13, color: "var(--text-light)", fontWeight: 600}}>{l2.flag} {t("listenWrite")}</div>
        <div className="spelling-translation" dir={l2.dir} lang={card.lang2 || set.lang2}>{card.translation}</div>
      </div>
      <input className={`spelling-input ${msg || ""}`} value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => { if (e.key === "Enter") submit(); }} placeholder={t("typeWord")} disabled={!!msg} autoFocus />
      {msg === "wrong" && (<div style={{ textAlign: "center", color: "var(--danger)", fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><CrossIcon size={16} color="#7B2D2D" /> {card.word}</div>)}
      {msg === "correct" && (<div style={{ textAlign: "center", color: "var(--success)", fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><CheckIcon size={16} color="#2D6A4F" /></div>)}
      <button type="button" className="btn btn-primary btn-block btn-lg" onClick={submit} disabled={!val.trim() || !!msg}>{t("check")}</button>
    </div>
  );
}

function MatchingGame({ set, savedIds, onToggleSaved, onFinish, onExit, onReview, onGameComplete }) {
  const { t } = useI18n();
  const { speakText } = useSpeech(0.9, 1.0);
  const isSanctuary = set.id === "saved";
  const initialPairs = useMemo(() => shuffle(set.words).slice(0, 6), [set.id, set.words.length]);
  const pairs = useMemo(() => isSanctuary ? initialPairs : initialPairs.filter(w => !savedIds.includes(w.id)), [initialPairs, savedIds, isSanctuary]);
  const [leftWords] = useState(() => shuffle(initialPairs));
  const [rightTrans] = useState(() => shuffle(initialPairs));
  const [selA, setSelA] = useState(null);
  const [selB, setSelB] = useState(null);
  const [permanentMatchedIds, setPermanentMatchedIds] = useState([]);
  const [greenFlashIds, setGreenFlashIds] = useState([]);
  const [wrongFlashIds, setWrongFlashIds] = useState([]);
  const [results, setResults] = useState([]);
  useEffect(() => {
    if (!selA || !selB) return;
    const ok = selA.id === selB.id;
    if (onReview) onReview(ok);
    const res = [...results, { id: selA.id, correct: ok, word: selA.word, translation: selA.translation }];
    setResults(res);
    if (ok) {
      setGreenFlashIds([selA.id]);
      const newPermanent = [...permanentMatchedIds, selA.id];
      setTimeout(() => {
        setPermanentMatchedIds(newPermanent);
        setGreenFlashIds([]);
        setSelA(null); setSelB(null);
        if (newPermanent.length >= pairs.length) { if (onGameComplete) onGameComplete(); onFinish(res, initialPairs); }
      }, 1000);
    } else {
      setWrongFlashIds([selA.id, selB.id]);
      setTimeout(() => { setWrongFlashIds([]); setSelA(null); setSelB(null); }, 1000);
    }
  }, [selA, selB, pairs.length, permanentMatchedIds, results, initialPairs, onReview, onFinish, onGameComplete]);
  if (pairs.length < 2) return (<div className="glass results-box"><p>{t("noWords")}</p><button type="button" className="btn btn-primary" onClick={onExit}>{t("home")}</button></div>);
  const l1 = getLang(set.lang1);
  const l2 = getLang(set.lang2);
  const leftFiltered = leftWords.filter(i => !permanentMatchedIds.includes(i.id) && !savedIds.includes(i.id));
  const rightFiltered = rightTrans.filter(i => !permanentMatchedIds.includes(i.id) && !savedIds.includes(i.id));
  return (
    <div className="matching-game game-shell">
      <div className="game-header">
        <button type="button" className="icon-btn" onClick={onExit} aria-label={t("back")}><CloseIcon /></button>
        <div style={{ textAlign: "center", flex: 1 }}>
          <div className="game-title"><CrossIcon size={20} color="var(--color-primary)" /> {set.name}</div>
          <div className="game-subtitle">{permanentMatchedIds.length}/{pairs.length} {t("matchPairs")}</div>
        </div>
      </div>
      <div className="match-game-layout" dir="ltr">
        <div className="match-column-section">
          <div className="match-column-header">{l2.name}</div>
          <div className="match-column">
            {rightFiltered.map(item => {
              const isSelected = selB?.id === item.id;
              const isGreen = greenFlashIds.includes(item.id);
              const isWrong = wrongFlashIds.includes(item.id);
              return (
                <div key={item.id} className={`match-btn ${isSelected ? "selected" : ""} ${isGreen ? "green-flash" : ""} ${isWrong ? "wrong-flash" : ""}`} role="button" tabIndex={0} aria-pressed={isSelected} onClick={() => { if (!selA || !selB) setSelB(item); }} onKeyDown={e => { if ((e.key === "Enter" || e.key === " ") && (!selA || !selB)) { e.preventDefault(); setSelB(item); } }}>
                  <div className="match-actions" onClick={(e) => e.stopPropagation()}>
                    <button type="button" className="icon-btn save-word-btn" onClick={(e) => { e.stopPropagation(); onToggleSaved(item.id); }} aria-label={savedIds.includes(item.id) ? t("saved") : t("save")} aria-pressed={savedIds.includes(item.id)}><BookmarkIcon filled={savedIds.includes(item.id)} size={14} /></button>
                    <button type="button" className="icon-btn" onClick={(e) => { e.stopPropagation(); speakText(item.translation, set.lang2); }} aria-label="Speak"><SpeakerIcon size={14} /></button>
                  </div>
                  <span className="match-text" dir={l2.dir} lang={item.lang2 || set.lang2}>{item.translation}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="match-column-section">
          <div className="match-column-header">{l1.name}</div>
          <div className="match-column">
            {leftFiltered.map(item => {
              const isSelected = selA?.id === item.id;
              const isGreen = greenFlashIds.includes(item.id);
              const isWrong = wrongFlashIds.includes(item.id);
              return (
                <div key={item.id} className={`match-btn ${isSelected ? "selected" : ""} ${isGreen ? "green-flash" : ""} ${isWrong ? "wrong-flash" : ""}`} role="button" tabIndex={0} aria-pressed={isSelected} onClick={() => { if (!selA || !selB) setSelA(item); }} onKeyDown={e => { if ((e.key === "Enter" || e.key === " ") && (!selA || !selB)) { e.preventDefault(); setSelA(item); } }}>
                  <div className="match-actions" onClick={(e) => e.stopPropagation()}>
                    <button type="button" className="icon-btn save-word-btn" onClick={(e) => { e.stopPropagation(); onToggleSaved(item.id); }} aria-label={savedIds.includes(item.id) ? t("saved") : t("save")} aria-pressed={savedIds.includes(item.id)}><BookmarkIcon filled={savedIds.includes(item.id)} size={14} /></button>
                    <button type="button" className="icon-btn" onClick={(e) => { e.stopPropagation(); speakText(item.word, set.lang1); }} aria-label="Speak"><SpeakerIcon size={14} /></button>
                  </div>
                  <span className="match-text" dir={l1.dir} lang={item.lang1 || set.lang1}>{item.word}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function SentenceGame({ set, savedIds, onToggleSaved, onFinish, onExit, voiceSettings, onReview, onGameComplete }) {
  const { t, locale } = useI18n();
  const { speakText } = useSpeech(voiceSettings.rate, voiceSettings.pitch);
  const [selectedWord, setSelectedWord] = useState(null);
  const [sentence, setSentence] = useState("");
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const words = set.words;
  const generateSentenceLocal = useCallback((word, lang) => {
    const templates = {
      ar: [`اليوم قلت "${word}" لصديقتي لأنها ساعدتني كثيراً.`, `في المدرسة، تعلمنا كلمة "${word}" واستخدمناها في جملة.`, `أحب أن أقول "${word}" عندما أكون ممتناً لشخص ما.`, `كتبت في دفتر الملاحظات: "${word}" هي كلمة مهمة جداً.`, `قال المعلم: "من فضلك استخدم "${word}" في جملة مفيدة."`],
      en: [`Today I said "${word}" to my friend because she helped me a lot.`, `At school, we learned the word "${word}" and used it in a sentence.`, `I like to say "${word}" when I am grateful to someone.`, `I wrote in my notebook: "${word}" is a very important word.`, `The teacher said, "Please use "${word}" in a useful sentence."`],
      fr: [`Aujourd'hui, j'ai dit « ${word} » à mon amie parce qu'elle m'a beaucoup aidé.`, `À l'école, nous avons appris le mot « ${word} » et l'avons utilisé dans une phrase.`, `J'aime dire « ${word} » quand je suis reconnaissant envers quelqu'un.`, `J'ai écrit dans mon cahier : « ${word} » est un mot très important.`, `Le professeur a dit : « Veuillez utiliser « ${word} » dans une phrase utile. »`],
      es: [`Hoy dije "${word}" a mi amiga porque me ayudó mucho.`, `En la escuela, aprendimos la palabra "${word}" y la usamos en una oración.`, `Me gusta decir "${word}" cuando estoy agradecido con alguien.`],
      de: [`Heute habe ich "${word}" zu meiner Freundin gesagt, weil sie mir sehr geholfen hat.`, `In der Schule haben wir das Wort "${word}" gelernt und in einem Satz verwendet.`, `Ich sage gerne "${word}", wenn ich jemandem dankbar bin.`],
      pt: [`Hoje eu disse "${word}" para minha amiga porque ela me ajudou muito.`, `Na escola, aprendemos a palavra "${word}" e a usamos em uma frase.`],
      ja: [`今日、友達が助けてくれたので「${word}」と言いました。`, `学校で「${word}」という言葉を学び、文で使いました。`]
    };
    const langTemplates = templates[lang] || templates.en;
    return langTemplates[Math.floor(Math.random() * langTemplates.length)];
  }, []);
  const generateExplanationLocal = useCallback((word, translation, lang) => {
    const templates = {
      ar: `كلمة "${word}" تعني "${translation}" بالعربية. وهي من الكلمات الشائعة التي تستخدم في الحياة اليومية للتعبير عن معنى "${translation}".`,
      en: `The word "${word}" means "${translation}" in Arabic. It is a common word used in everyday life to express the meaning of "${translation}".`,
      fr: `Le mot « ${word} » signifie « ${translation} » en arabe. C'est un mot courant utilisé dans la vie quotidienne pour exprimer le sens de « ${translation} ».`,
      es: `La palabra "${word}" significa "${translation}" en árabe.`,
      de: `Das Wort "${word}" bedeutet "${translation}" auf Arabisch.`,
      pt: `A palavra "${word}" significa "${translation}" em árabe.`,
      ja: `「${word}」はアラビア語で「${translation}」を意味します。`
    };
    return templates[lang] || templates.en;
  }, []);
  const generateSentence = useCallback(async (word) => {
    const lang = set.lang1;
    const langName = getLang(lang).name;
    const prompt = `Create a logical, realistic, and natural daily life context sentence in ${langName} that includes the word "${word}". Return ONLY the sentence itself, without quotes or extra text.`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const res = await fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}`, { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) throw new Error("bad");
      const text = await res.text();
      const clean = text.trim().split('\n')[0].trim();
      if (clean && clean.length > 2 && clean.length < 300) return clean;
    } catch (e) {} finally { clearTimeout(timeout); }
    return generateSentenceLocal(word, lang);
  }, [set.lang1, generateSentenceLocal]);
  const generateExplanation = useCallback(async (word, translation) => {
    const uiLang = locale;
    const uiLangName = getLang(uiLang).name;
    const langName = getLang(set.lang1).name;
    const prompt = `Explain the meaning, usage, and context of the ${langName} word "${word}" (which translates to "${translation}") in ${uiLangName}. Keep it concise and clear. Return ONLY the explanation text.`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const res = await fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}`, { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) throw new Error("bad");
      const text = await res.text();
      const clean = text.trim().split('\n')[0].trim();
      if (clean && clean.length > 2) return clean;
    } catch (e) {} finally { clearTimeout(timeout); }
    return generateExplanationLocal(word, translation, uiLang);
  }, [locale, set.lang1, generateExplanationLocal]);
  const handleSelectWord = async (word) => {
    setSelectedWord(word);
    setPickerOpen(false);
    setLoading(true);
    try {
      const [sent, expl] = await Promise.all([generateSentence(word.word), generateExplanation(word.word, word.translation)]);
      setSentence(sent);
      setExplanation(expl);
    } catch (e) {
      setSentence(generateSentenceLocal(word.word, set.lang1));
      setExplanation(generateExplanationLocal(word.word, word.translation, locale));
    } finally {
      setLoading(false);
      if (onGameComplete) onGameComplete();
    }
  };
  const handleRegenerate = async () => {
    if (!selectedWord) return;
    setLoading(true);
    try {
      const [sent, expl] = await Promise.all([generateSentence(selectedWord.word), generateExplanation(selectedWord.word, selectedWord.translation)]);
      setSentence(sent);
      setExplanation(expl);
    } catch (e) {
      setSentence(generateSentenceLocal(selectedWord.word, set.lang1));
      setExplanation(generateExplanationLocal(selectedWord.word, selectedWord.translation, locale));
    } finally { setLoading(false); }
  };
  return (
    <div className="sentence-game game-shell">
      <div className="game-header">
        <button type="button" className="icon-btn" onClick={onExit} aria-label={t("back")}><CloseIcon /></button>
        <div style={{ textAlign: "center", flex: 1 }}>
          <div className="game-title"><SentenceIcon size={20} /> {set.name}</div>
          <div className="game-subtitle">{t("sentenceGame")}</div>
        </div>
      </div>
      {selectedWord ? (
        <div className="glass results-box sentence-result">
          <div style={{ marginBottom: 20 }}>
            <span className="card-chip" style={{ background: 'color-mix(in srgb, var(--color-primary) 15%, transparent)', color: 'var(--text)' }}>{selectedWord.word} → {selectedWord.translation}</span>
          </div>
          {loading ? (<div className="muted" style={{ margin: '20px 0' }}>⏳ {t("translating")}</div>) : (
            <>
              <div style={{ background: 'color-mix(in srgb, var(--color-primary) 5%, transparent)', padding: 16, borderRadius: 14, marginBottom: 16, textAlign: 'start', borderLeft: '4px solid var(--primary)' }}>
                <div style={{fontSize: 12, fontWeight: 800, color: 'var(--primary)', marginBottom: 8, textTransform: 'uppercase'}}>📖 {t("context")}</div>
                <div style={{fontSize: 18, fontWeight: 700, lineHeight: 1.6}}>{sentence}</div>
              </div>
              <div style={{ background: 'color-mix(in srgb, var(--color-success) 5%, transparent)', padding: 16, borderRadius: 14, marginBottom: 16, textAlign: 'start', borderLeft: '4px solid var(--success)' }}>
                <div style={{fontSize: 12, fontWeight: 800, color: 'var(--success)', marginBottom: 8, textTransform: 'uppercase'}}>💡 {t("explanation")}</div>
                <div style={{fontSize: 15, fontWeight: 600, lineHeight: 1.6}}>{explanation}</div>
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
                <button type="button" className="btn btn-primary" onClick={() => speakText(sentence, set.lang1)}><SpeakerIcon /> {t("dicteeListenAgain")}</button>
                <button type="button" className="btn btn-secondary" onClick={handleRegenerate}>🔄 {t("retry")}</button>
                <button type="button" className="btn btn-secondary" onClick={() => setPickerOpen(true)}><BookIcon size={16} /> {t("word")}</button>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="glass results-box sentence-empty" style={{ textAlign: 'center' }}>
          <p style={{ marginBottom: 20, fontWeight: 700, fontSize: 18 }}>✨ {t("sentenceGame")}</p>
          <button type="button" className="btn btn-primary btn-lg" onClick={() => setPickerOpen(true)}><BookIcon size={18} /> {t("word")}</button>
        </div>
      )}
      {pickerOpen && (
        <div className="modal-overlay" onClick={() => setPickerOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{t("word")}</h3>
            <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {words.length === 0 ? (
                <div className="empty-state"><div className="empty-icon"><BookIcon size={48} color="var(--color-primary)" /></div><div className="empty-text">{t("noWords")}</div></div>
              ) : (
                words.map(w => (
                  <div key={w.id} className="word-row" style={{ cursor: 'pointer' }} onClick={() => handleSelectWord(w)}>
                    <div className="word-row-main">
                      <div className="word-row-text">{w.word}</div>
                      <div className="word-row-translation">→ {w.translation}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={() => setPickerOpen(false)}>{t("cancel")}</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================= */
/* DICTEE - SIMPLIFIED (REPLAY + NEXT ROUND ONLY) */
/* ============================================= */
function DicteeGame({ onExit, onGameComplete }) {
  const { t, locale } = useI18n();
  const { speakText } = useSpeech(1, 1);
  const [state, setState] = useState("level_select");
  const [level, setLevel] = useState(null);
  const [session, setSession] = useState([]);
  const [idx, setIdx] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [diffResult, setDiffResult] = useState(null);
  const [results, setResults] = useState([]);
  const [showHint, setShowHint] = useState(false);
  const [playerStatus, setPlayerStatus] = useState("idle");
  const [audioTime, setAudioTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const audioRef = useRef(null);
  const speechRunRef = useRef(0);
  const pendingSeekRef = useRef(null);

  const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];
  const levelLabels = [t("dicteeLevel1"), t("dicteeLevel2"), t("dicteeLevel3"), t("dicteeLevel4"), t("dicteeLevel5"), t("dicteeLevel6")];
  const currentText = session[idx] || "";

  const hintText = useMemo(() => {
    if (!currentText) return "";
    return currentText.split(/\s+/).map(w => {
      let shown = false;
      return w.split("").map(ch => {
        if (isWordChar(ch)) {
          if (!shown) { shown = true; return ch; }
          return "•";
        }
        return ch;
      }).join("");
    }).join(" ");
  }, [currentText]);

  const wordCount = useMemo(() => currentText.split(/\s+/).filter(Boolean).length, [currentText]);
  const formatTime = seconds => {
    const safe = Math.max(0, Math.round(seconds));
    return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, "0")}`;
  };

  const stopPlayer = useCallback((nextStatus = "paused") => {
    speechRunRef.current += 1;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = audioRef.current.currentTime || 0;
    }
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setPlayerStatus(nextStatus);
  }, []);

  const createAudio = useCallback(() => {
    if (!currentText) return null;
    if (audioRef.current && audioRef.current.dataset.text === currentText) return audioRef.current;
    if (audioRef.current) audioRef.current.pause();
    const audio = new Audio(`https://translate.google.com/translate_tts?ie=UTF-8&tl=fr&client=tw-ob&q=${encodeURIComponent(currentText)}`);
    audio.dataset.text = currentText;
    audio.preload = "auto";
    audio.playbackRate = playbackRate;
    audio.onloadedmetadata = () => {
      setAudioDuration(Number.isFinite(audio.duration) ? audio.duration : Math.max(3, currentText.split(/\s+/).length * 0.55));
      if (pendingSeekRef.current !== null) {
        audio.currentTime = Math.max(0, Math.min(audio.duration || 0, pendingSeekRef.current));
        pendingSeekRef.current = null;
        setAudioTime(audio.currentTime);
      }
    };
    audio.ontimeupdate = () => setAudioTime(audio.currentTime || 0);
    audio.onplay = () => setPlayerStatus("playing");
    audio.onpause = () => { if (!audio.ended) setPlayerStatus("paused"); };
    audio.onended = () => { setAudioTime(audio.duration || audioTime); setPlayerStatus("ended"); };
    audio.onerror = () => {
      audioRef.current = null;
      if (window.speechSynthesis) {
        const runId = ++speechRunRef.current;
        const utterance = new SpeechSynthesisUtterance(currentText);
        utterance.lang = "fr-FR";
        utterance.rate = playbackRate;
        utterance.pitch = 1;
        utterance.onstart = () => setPlayerStatus("playing");
        utterance.onend = () => { if (runId === speechRunRef.current) setPlayerStatus("ended"); };
        utterance.onerror = () => { if (runId === speechRunRef.current) setPlayerStatus("paused"); };
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      } else {
        speakText(currentText, "fr", { rate: playbackRate });
      }
    };
    audioRef.current = audio;
    return audio;
  }, [audioTime, currentText, playbackRate, speakText]);

  const playSentence = useCallback(() => {
    const audio = createAudio();
    if (!audio) return;
    audio.playbackRate = playbackRate;
    audio.play().catch(() => {
      if (audio.onerror) audio.onerror();
    });
  }, [createAudio, playbackRate]);

  const togglePlayer = () => {
    const audio = audioRef.current;
    if (audio && playerStatus === "playing") {
      audio.pause();
      return;
    }
    if (audio && playerStatus === "paused") {
      audio.play().catch(() => {});
      return;
    }
    if (audio && playerStatus === "ended") audio.currentTime = 0;
    playSentence();
  };

  const seekBySeconds = seconds => {
    const audio = createAudio();
    if (!audio) return;
    const knownDuration = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : audioDuration;
    const target = Math.max(0, Math.min(knownDuration || 999, (audio.currentTime || audioTime) + seconds));
    if (knownDuration) {
      audio.currentTime = target;
      setAudioTime(target);
    } else {
      pendingSeekRef.current = target;
    }
  };

  const handleTimelineChange = e => {
    const target = Number(e.target.value);
    const audio = createAudio();
    if (!audio) return;
    if (Number.isFinite(audio.duration) && audio.duration > 0) audio.currentTime = target;
    else pendingSeekRef.current = target;
    setAudioTime(target);
  };

  const handleRateChange = e => {
    const nextRate = Number(e.target.value);
    setPlaybackRate(nextRate);
    if (audioRef.current) audioRef.current.playbackRate = nextRate;
  };

  useEffect(() => {
    setShowHint(false);
    speechRunRef.current += 1;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    pendingSeekRef.current = null;
    setAudioTime(0);
    setAudioDuration(0);
    setPlayerStatus("idle");
  }, [idx, currentText]);

  useEffect(() => () => {
    speechRunRef.current += 1;
    if (audioRef.current) audioRef.current.pause();
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  }, []);

  const startLevel = (l) => {
    const bank = DICTEE_BANK[l] || [];
    const shuffled = shuffle(bank).slice(0, Math.min(15, bank.length));
    setSession(shuffled);
    setLevel(l);
    setIdx(0);
    setUserInput("");
    setDiffResult(null);
    setResults([]);
    setState("playing");
    if (onGameComplete) onGameComplete();
  };

  const handleCorriger = () => {
    if (!currentText || !userInput.trim()) return;
    const res = getDiffResult(userInput, currentText);
    setDiffResult(res);
    setState("corrected");
    setResults(prev => [...prev, { text: currentText, ...res }]);
  };

  const chooseDictation = nextIndex => {
    const safeIndex = Math.max(0, Math.min(session.length - 1, nextIndex));
    setIdx(safeIndex);
    setUserInput("");
    setDiffResult(null);
    setState("playing");
  };

  const handleNext = () => {
    if (idx + 1 >= session.length) {
      setState("finished");
    } else {
      chooseDictation(idx + 1);
    }
  };

  if (state === "level_select") {
    return (
      <div className="dictee-game game-shell">
        <div className="game-header">
          <button type="button" className="icon-btn" onClick={onExit} aria-label={t("back")}><CloseIcon /></button>
          <div style={{ textAlign: "center", flex: 1 }}>
            <div className="game-title">🎧 {t("dicteeTitle")}</div>
            <div className="game-subtitle">{t("dicteeSubtitle")}</div>
          </div>
        </div>
        <div className="dictee-info-card">🎯 {t("dicteeDesc")}</div>
        <div className="dictee-level-grid">
          {levels.map((l, i) => (
            <button key={l} className="dictee-level-btn" onClick={() => startLevel(l)}>
              <span style={{ display: "block", fontSize: 22, fontWeight: 900 }}>{l}</span>
              <span style={{ display: "block", fontSize: 10, fontWeight: 700, color: "var(--text-light)", marginTop: 4 }}>{levelLabels[i]}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (state === "finished") {
    const totalCorrect = results.reduce((a, b) => a + b.correctCount, 0);
    const totalWords = results.reduce((a, b) => a + b.totalWords, 0);
    const pct = totalWords ? Math.round((totalCorrect / totalWords) * 100) : 0;
    const missingErrors = results.reduce((a, b) => a + b.correctTokens.filter(tk => tk.status === 'missing').length, 0);
    const extraErrors = results.reduce((a, b) => a + b.userTokens.filter(tk => tk.status === 'extra').length, 0);
    const wrongErrors = results.reduce((a, b) => a + b.userTokens.filter(tk => tk.status === 'wrong').length, 0);
    let emoji = "💪";
    let msg = t("dicteeContinue");
    if (pct >= 90) { emoji = "🏆"; msg = t("dicteeExcellentMsg"); }
    else if (pct >= 75) { emoji = "🌟"; msg = t("dicteeVeryGoodMsg"); }
    else if (pct >= 50) { emoji = "👍"; msg = t("dicteeGoodMsg"); }
    return (
      <div className="dictee-game game-shell results-box glass">
        <div className="results-emoji"><LearningEmoji emoji={emoji} /></div>
        <h2 style={{ fontSize: 26, fontWeight: 900, marginBottom: 8 }}>{t("dicteeFinished")}</h2>
        <div className="score-circle">{pct}%</div>
        <div className="muted">{t("dicteeFinalScore")} : <strong style={{ color: "var(--primary)" }}>{totalCorrect} / {totalWords}</strong> {t("words")}</div>
        <div className="results-message">{msg}</div>
        <div className="dictee-final-stats">
          <div className="dictee-stat-card"><div className="dictee-stat-value">{results.length}</div><div className="dictee-stat-label">{t("dicteeDictations")}</div></div>
          <div className="dictee-stat-card"><div className="dictee-stat-value">{pct}%</div><div className="dictee-stat-label">{t("accuracy")}</div></div>
        </div>
        <div className="wrong-words-section">
          <div className="wrong-words-title">📊 {t("dicteeErrorAnalysis")}</div>
          <div className="word-row"><span>{t("dicteeMissingWords")}</span><strong>{missingErrors}</strong></div>
          <div className="word-row"><span>{t("dicteeExtraWords")}</span><strong>{extraErrors}</strong></div>
          <div className="word-row"><span>{t("dicteeSpellingErrors")}</span><strong>{wrongErrors}</strong></div>
        </div>
        <button type="button" className="btn btn-primary btn-block btn-lg" onClick={() => setState("level_select")}>🔄 {t("dicteeChooseAnotherLevel")}</button>
        <button type="button" className="btn btn-secondary btn-block" style={{ marginTop: 10 }} onClick={onExit}>🏠 {t("home")}</button>
      </div>
    );
  }

  const progressPct = state === "corrected"
    ? ((idx + 1) / Math.max(1, session.length)) * 100
    : (idx / Math.max(1, session.length)) * 100;

  return (
    <div className="dictee-game game-shell" dir={locale === "ar" ? "rtl" : "ltr"}>
      <div className="game-header">
        <button type="button" className="icon-btn" onClick={onExit} aria-label={t("back")}><CloseIcon /></button>
        <div style={{ textAlign: "center", flex: 1 }}>
          <div className="game-title">🎧 {t("dicteeTitle")} {level}</div>
          <div className="game-subtitle">{idx + 1} / {session.length}</div>
        </div>
        <div className="dictee-navigation">
          <button type="button" className="icon-btn" onClick={() => chooseDictation(idx - 1)} disabled={idx === 0} aria-label="الإملاء السابق">‹</button>
          <select value={idx} onChange={e => chooseDictation(Number(e.target.value))} aria-label="اختيار الإملاء">
            {session.map((_, i) => <option key={i} value={i}>#{i + 1}</option>)}
          </select>
          <button type="button" className="icon-btn" onClick={() => chooseDictation(idx + 1)} disabled={idx >= session.length - 1} aria-label="الإملاء التالي">›</button>
        </div>
      </div>

      <div className="progress-bar"><div className="progress-fill" style={{ width: progressPct + "%" }} /></div>

      <div className="dictee-pro-player glass" dir="ltr">
        <div className="dictee-audio-info">
          <span className="dictee-badge">🎧 {playerStatus === "playing" ? t("dicteePlaying") : playerStatus === "paused" ? t("dicteePaused") : t("dicteeReady")}</span>
          <span className="dictee-badge live">📝 {wordCount} {t("words")}</span>
        </div>
        <div className="dictee-player-timeline">
          <span>{formatTime(audioTime)}</span>
          <input
            className="dictee-scrubber"
            type="range"
            min="0"
            max={Math.max(1, audioDuration)}
            step="0.1"
            value={Math.min(audioTime, audioDuration || 1)}
            onChange={handleTimelineChange}
            aria-label={t("dicteeReplay")}
          />
          <span>{formatTime(audioDuration)}</span>
        </div>
        <div className="dictee-player-controls">
          <button type="button" className="icon-btn" onClick={() => seekBySeconds(-5)} aria-label="رجوع 5 ثوانٍ" title="رجوع 5 ثوانٍ">↶<small>5</small></button>
          <button type="button" className="play-main" onClick={togglePlayer} aria-label={t("dicteePlayPause")} title={t("dicteePlayPause")}>
            {playerStatus === "playing" ? "⏸" : "▶"}
          </button>
          <button type="button" className="icon-btn" onClick={() => seekBySeconds(5)} aria-label="تقديم 5 ثوانٍ" title="تقديم 5 ثوانٍ">↷<small>5</small></button>
        </div>
        <div className="dictee-speed-row">
          <span>⚙️ سرعة النطق</span>
          <select value={playbackRate} onChange={handleRateChange} aria-label="سرعة النطق">
            <option value="0.55">0.55×</option>
            <option value="0.7">0.70×</option>
            <option value="0.85">0.85×</option>
            <option value="1">1.00×</option>
            <option value="1.15">1.15×</option>
          </select>
        </div>
      </div>

      {state === "playing" && (
        <>
          <div className="dictee-toolbar">
            <button type="button" className="btn btn-secondary" onClick={() => setShowHint(h => !h)}>
              💡 {showHint ? t("dicteeHideHint") : t("dicteeShowHint")}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setUserInput("")} disabled={!userInput}>
              🧹 {t("dicteeClear")}
            </button>
          </div>

          {showHint && (<div className="dictee-hint" dir="ltr">{hintText}</div>)}

          <textarea
            className="dictee-textarea"
            dir="ltr"
            value={userInput}
            onChange={e => setUserInput(e.target.value)}
            placeholder={t("dicteeWritePlaceholder")}
            autoFocus
          />
          <button type="button" className="btn btn-primary btn-block btn-lg" onClick={handleCorriger} disabled={!userInput.trim()}>
            ✅ {t("dicteeCorrect")}
          </button>
        </>
      )}

      {state === "corrected" && diffResult && (
        <div className="diff-result" dir="ltr">
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <span style={{ fontSize: 24, fontWeight: 900, color: "var(--primary)" }}>{diffResult.correctCount} / {diffResult.totalWords} {t("words")}</span>
          </div>
          <h4>{t("dicteeYourAnswer")}</h4>
          <div className="diff-text">
            {diffResult.userTokens.map((tok, i) => (<span key={i} className={`diff-word ${tok.status}`}>{tok.text}</span>))}
          </div>
          <h4>{t("dicteeCorrection")}</h4>
          <div className="diff-text">
            {diffResult.correctTokens.map((tok, i) => (<span key={i} className={`diff-word ${tok.status}`}>{tok.text}</span>))}
          </div>
          <button type="button" className="btn btn-success btn-block btn-lg" onClick={handleNext}>
            {idx + 1 >= session.length ? `${t("dicteeSeeResults")} 🏁` : `${t("dicteeNext")} ➡️`}
          </button>
        </div>
      )}
    </div>
  );
}

