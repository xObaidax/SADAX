// Toggle to true when Resend/SMTP is ready.
const SHOW_EMAIL_LOGIN = false;

const FOLDERS_ENDPOINT = "/api/folders/";

async function folderRequest(url, method, payload) {
  const response = await fetch(url, {
    method,
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", "X-CSRFToken": getCookie("csrftoken") },
    ...(payload === undefined ? {} : { body: JSON.stringify(payload) })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.detail || "Could not save folder.");
    error.status = response.status;
    throw error;
  }
  return data;
}

const folderPayload = set => ({ client_id: String(set.id), name: set.name, lang1: set.lang1, lang2: set.lang2, files: set.files || [] });
const warnFolderSync = error => console.warn(error.status === 404 ? "Folder API is unavailable; keeping local folders." : "Folder sync failed; keeping local folders.", error);

function GameScene({ type }) {
  const primary = "var(--color-primary)", soft = "var(--color-primary-soft)";
  const secondary = "var(--color-secondary)", secondarySoft = "var(--color-secondary-soft)";
  const muted = "var(--color-text-muted)";
  if (type === "flashcards") return (
    <svg viewBox="0 0 320 120" fill="none" aria-hidden="true" focusable="false">
      <rect x="93" y="24" width="134" height="76" rx="13" fill={secondarySoft} stroke={secondary} strokeWidth="2" transform="rotate(-11 160 62)" />
      <rect x="105" y="20" width="134" height="76" rx="13" fill={soft} stroke={primary} strokeWidth="2" transform="rotate(7 172 58)" />
      <g transform="rotate(-3 166 56)">
        <rect x="99" y="18" width="134" height="76" rx="13" fill="var(--color-card)" stroke={primary} strokeWidth="2" />
        <rect x="119" y="43" width="68" height="7" rx="3.5" fill={primary} />
        <rect x="119" y="60" width="95" height="6" rx="3" fill={muted} opacity=".55" />
        <circle cx="206" cy="40" r="7" fill={secondary} />
      </g>
    </svg>
  );
  if (type === "mcq") return (
    <svg viewBox="0 0 320 120" fill="none" aria-hidden="true" focusable="false">
      {[17, 48, 79].map((y, i) => <g key={y}>
        <rect x="78" y={y} width="164" height="25" rx="10" fill={i === 1 ? soft : "var(--color-card)"} stroke={i === 1 ? primary : muted} strokeWidth="2" opacity={i === 1 ? 1 : .6} />
        <circle cx="96" cy={y + 12.5} r="6" fill={i === 1 ? primary : secondarySoft} stroke={i === 1 ? primary : secondary} strokeWidth="2" />
        {i === 1 ? <path d="m93 60 3 3 5-6" stroke="var(--color-card)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /> : <rect x="113" y={y + 10} width={i === 0 ? 84 : 66} height="5" rx="2.5" fill={muted} opacity=".55" />}
      </g>)}
    </svg>
  );
  if (type === "spelling") return (
    <svg viewBox="0 0 320 120" fill="none" aria-hidden="true" focusable="false">
      <rect x="74" y="41" width="46" height="46" rx="10" fill={soft} stroke={primary} strokeWidth="2" transform="rotate(-8 97 64)" />
      <rect x="129" y="36" width="46" height="46" rx="10" fill="var(--color-card)" stroke={primary} strokeWidth="2" />
      <rect x="183" y="42" width="46" height="46" rx="10" fill={secondarySoft} stroke={secondary} strokeWidth="2" transform="rotate(7 206 65)" />
      <text x="86" y="72" fill={primary} fontSize="21" fontWeight="700">A</text>
      <text x="144" y="68" fill={primary} fontSize="21" fontWeight="700">B</text>
      <text x="198" y="73" fill={secondary} fontSize="21" fontWeight="700">C</text>
      <path d="M152 15v14" stroke={secondary} strokeWidth="2" strokeLinecap="round" />
      <circle cx="246" cy="80" r="13" fill={secondarySoft} stroke={secondary} strokeWidth="2" />
      <path d="m240 80 4 4 8-9" stroke={secondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  if (type === "matching") return (
    <svg viewBox="0 0 320 120" fill="none" aria-hidden="true" focusable="false">
      {[18, 48, 78].map((y, i) => <g key={y}>
        <rect x="51" y={y} width="74" height="23" rx="9" fill={i === 1 ? soft : "var(--color-card)"} stroke={primary} strokeWidth="2" />
        <rect x="195" y={y} width="74" height="23" rx="9" fill={i === 1 ? secondarySoft : "var(--color-card)"} stroke={secondary} strokeWidth="2" />
        <rect x="68" y={y + 9} width="38" height="5" rx="2.5" fill={muted} opacity=".65" />
        <rect x="212" y={y + 9} width="38" height="5" rx="2.5" fill={muted} opacity=".65" />
      </g>)}
      <path d="M125 29c38 0 32 60 70 60M125 89c37 0 33-60 70-60" stroke={muted} strokeWidth="2" strokeDasharray="3 5" strokeLinecap="round" opacity=".55" />
      <path d="M125 59c35 0 35 0 70 0" stroke={primary} strokeWidth="2" strokeDasharray="3 5" strokeLinecap="round" />
    </svg>
  );
  return (
    <svg viewBox="0 0 320 120" fill="none" aria-hidden="true" focusable="false">
      <path d="M78 64V53a35 35 0 0 1 70 0v11" stroke={primary} strokeWidth="4" strokeLinecap="round" />
      <rect x="72" y="59" width="17" height="32" rx="8" fill={soft} stroke={primary} strokeWidth="2" />
      <rect x="137" y="59" width="17" height="32" rx="8" fill={soft} stroke={primary} strokeWidth="2" />
      <path d="M166 53q12 10 0 20m11-28q20 18 0 36" stroke={secondary} strokeWidth="2" strokeLinecap="round" />
      <rect x="203" y="30" width="88" height="66" rx="12" fill="var(--color-card)" stroke={secondary} strokeWidth="2" />
      <rect x="217" y="48" width="57" height="5" rx="2.5" fill={primary} />
      <rect x="217" y="62" width="43" height="5" rx="2.5" fill={muted} opacity=".6" />
      <rect x="217" y="76" width="52" height="5" rx="2.5" fill={muted} opacity=".6" />
    </svg>
  );
}

function AppContent() {
  const { t, locale, setLocale, langs } = useI18n();
  const toast = useToast();
  const usage = useUsage();
  const { stats, trackWordAdded, trackReview, trackGame } = useRealStats();
  const { speakText } = useSpeech();
  const { theme, toggle: toggleTheme } = useTheme();
  const [sets, setSets] = useLocalStorage("vocaflow_sets", DEFAULT_SETS);
  const [user, setUser] = useState(null);
  const initialLocalSets = useRef((() => {
    try { return JSON.parse(localStorage.getItem("vocaflow_sets")); } catch { return null; }
  })());
  const googleButtonRef = useRef(null);
  const googleCallbackRef = useRef(null);
  const googleInitializedRef = useRef(false);
  const [googleButtonStatus, setGoogleButtonStatus] = useState("loading");
  const [savedIds, setSavedIds] = useLocalStorage("vocaflow_saved", []);
  const [voiceSettings, setVoiceSettings] = useLocalStorage("vocaflow_voice", { rate: 0.9, pitch: 1.0 });
  const [view, setView] = useState("home");
  const [mainTab, setMainTab] = useState("home");
  const [translatorDraft, setTranslatorDraft] = useState({ sourceLang: "fr", targetLang: "ar", sourceText: "", result: "" });
  const [currentSetId, setCurrentSetId] = useState(sets[0]?.id || null);
  const [playAllFiles, setPlayAllFiles] = useState(true);
  const [selectedFileIds, setSelectedFileIds] = useState([]);
  const [numberOfWords, setNumberOfWords] = useState(1);
  const [revealedCards, setRevealedCards] = useState([]);
  const [gameType, setGameType] = useState("flashcards");
  const [gameKey, setGameKey] = useState(0);
  const [retryWrong, setRetryWrong] = useState(false);
  const [gameResults, setGameResults] = useState(null);
  const [modal, setModal] = useState(null);
  const [newSet, setNewSet] = useState({ name: "", lang1: "fr", lang2: "ar" });
  const [essentialLangs, setEssentialLangs] = useState({ lang1: "fr", lang2: "ar" });
  const [isAddingPreset, setIsAddingPreset] = useState(false);
  const presetAddInFlightRef = useRef(false);
  const [loginData, setLoginData] = useState({ name: "", email: "" });
  const [loginStep, setLoginStep] = useState("email");
  const [otpPurpose, setOtpPurpose] = useState("login");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [otpSeconds, setOtpSeconds] = useState(0);
  const [resendSeconds, setResendSeconds] = useState(0);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [authClosing, setAuthClosing] = useState(false);
  const authCloseTimerRef = useRef(null);
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const [logoutPending, setLogoutPending] = useState(false);
  const [logoutExiting, setLogoutExiting] = useState(false);
  const [settingsTab, setSettingsTab] = useState("general");
  const loadWords = async (account, localSets = sets) => {
    let rows = await wordRequest(AUTH_ENDPOINTS.words, "GET");
    const owner = localStorage.getItem("vocaflow_word_owner");
    const canMigrate = !owner || owner === String(account.id);
    const ownedLocalSets = canMigrate && Array.isArray(localSets) ? localSets : [];
    let folders = setsFromWords(rows, ownedLocalSets);
    try {
      const data = await folderRequest(FOLDERS_ENDPOINT, "GET");
      if (!Array.isArray(data.folders)) throw new Error("Invalid folder list.");
      const localById = new Map(folders.map(set => [String(set.id), set]));
      const serverIds = new Set();
      const merged = [];
      for (const remote of data.folders) {
        const folderId = remote.client_id || String(remote.id);
        const local = localById.get(String(folderId));
        serverIds.add(String(folderId));
        const serverFiles = Array.isArray(remote.files) ? remote.files : [];
        const localOnlyFiles = (local?.files || []).filter(file => !serverFiles.some(item => item.id === file.id));
        const files = [...serverFiles, ...localOnlyFiles];
        const folder = { ...local, id: folderId, name: remote.name, lang1: remote.lang1, lang2: remote.lang2, files, serverId: remote.id, words: local?.words || [] };
        merged.push(folder);
        if (localOnlyFiles.length) {
          try { await folderRequest(`${FOLDERS_ENDPOINT}${remote.id}/`, "PUT", folderPayload(folder)); }
          catch (error) { warnFolderSync(error); }
        }
      }
      for (const local of folders) {
        if (serverIds.has(String(local.id))) continue;
        try {
          const saved = await folderRequest(FOLDERS_ENDPOINT, "POST", folderPayload(local));
          merged.push({ ...local, serverId: saved.id });
        } catch (error) {
          warnFolderSync(error);
          merged.push(local);
        }
      }
      folders = merged;
    } catch (error) { warnFolderSync(error); }
    if (canMigrate && Array.isArray(localSets)) {
      const known = new Set(rows.map(row => row.client_id).filter(Boolean));
      for (const set of localSets) {
        for (const word of (set.words || [])) {
          if (word.serverId || known.has(String(word.id))) continue;
          const saved = await wordRequest(AUTH_ENDPOINTS.words, "POST", { ...wordPayload(word, set), file_id: word.fileId || "" });
          rows.push(saved);
          known.add(String(word.id));
        }
      }
    }
    const rowsById = new Map(rows.map(row => [row.id, row]));
    setSets(setsFromWords(rows, folders).map(set => ({ ...set, files: set.files || [], words: set.words.map(word => {
      const row = rowsById.get(word.serverId);
      return { ...word, fileId: row?.file_id || null, addedAt: row?.created_at || null };
    }) })));
    localStorage.setItem("vocaflow_word_owner", String(account.id));
  };
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const response = await fetch(AUTH_ENDPOINTS.currentUser, { credentials: "same-origin" });
        if (response.status === 401) {
          localStorage.removeItem("vocaflow_user");
          if (localStorage.getItem("vocaflow_word_owner")) setSets([]);
          if (active) setModal("login");
          return;
        }
        if (!response.ok) throw new Error("Could not restore your session.");
        const data = await response.json();
        if (!active) return;
        setUser(data.user);
        await loadWords(data.user, initialLocalSets.current);
        if (active) setModal(null);
      } catch (error) {
        if (active) toast(error.message, "error");
      }
    })();
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (modal !== "login" || loginStep !== "email" || otpPurpose !== "login" || !googleButtonRef.current) return;
    setGoogleButtonStatus("loading");
    const clientId = (window.__GOOGLE_CLIENT_ID__ || "").trim();
    if (!clientId) {
      console.warn("[SADAX Google] Client ID is missing.");
      setGoogleButtonStatus("unavailable");
      return;
    }
    let cancelled = false;
    let retryTimer;
    const waitForGSI = () => {
      if (cancelled) return;
      const gsi = window.google?.accounts?.id;
      if (!gsi) {
        retryTimer = setTimeout(waitForGSI, 100);
        return;
      }
      try {
        if (!googleInitializedRef.current) {
          gsi.initialize({
            client_id: clientId,
            callback: response => {
              console.log("[SADAX Google] credential callback", { hasCredential: Boolean(response?.credential), selectBy: response?.select_by });
              if (!response?.credential) {
                console.error("[SADAX Google] Google returned no credential.");
                toast("Google n'a pas renvoyé de connexion. Réessayez.", "error");
                return;
              }
              googleCallbackRef.current?.(response);
            },
            auto_select: false,
            cancel_on_tap_outside: true
          });
          googleInitializedRef.current = true;
        }
        const btnEl = googleButtonRef.current;
        if (!btnEl) return;
        btnEl.replaceChildren();
        gsi.renderButton(btnEl, {
          type: "standard",
          theme: "outline",
          size: "large",
          shape: "rectangular",
          text: "continue_with",
          logo_alignment: "left",
          width: 320,
          locale: "fr"
        });
        setGoogleButtonStatus("ready");
        console.log("[SADAX Google] Sign-In button requested");
      } catch (error) {
        console.warn("[SADAX Google] initialization failed", error);
        setGoogleButtonStatus("unavailable");
      }
    };
    waitForGSI();
    return () => {
      cancelled = true;
      clearTimeout(retryTimer);
    };
  }, [modal, loginStep, otpPurpose]);
  useEffect(() => {
    if (!currentSetId && sets.length) setCurrentSetId(sets[0].id);
    if (currentSetId && !sets.find(s => s.id === currentSetId)) setCurrentSetId(sets[0]?.id || null);
  }, [sets, currentSetId]);
  useEffect(() => { setPlayAllFiles(true); setSelectedFileIds([]); }, [currentSetId]);
  useEffect(() => {
    if (modal !== "login" || loginStep !== "otp") return undefined;
    const timer = setInterval(() => {
      setOtpSeconds(value => Math.max(0, value - 1));
      setResendSeconds(value => Math.max(0, value - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [modal, loginStep]);
  const currentSet = sets.find(s => s.id === currentSetId) || null;
  const savedWords = sets.flatMap(s => s.words.filter(w => savedIds.includes(w.id)).map(w => ({ ...w, lang1: s.lang1, lang2: s.lang2 })));
  const savedSet = savedWords.length ? { id: "saved", name: t("sanctuary"), lang1: savedWords[0].lang1, lang2: savedWords[0].lang2, words: savedWords } : null;
  useEffect(() => { if (view === "game" && gameType === "saved" && !savedWords.length) setView("home"); }, [view, gameType, savedWords.length]);
  const totalWords = sets.reduce((acc, s) => acc + s.words.length, 0);
  const masteredCount = sets.reduce((acc, set) => acc + set.words.filter(word => Number(word.mastery_level) > 0).length, 0);
  const todayKey = new Date().toISOString().slice(0, 10);
  const todayReviewed = stats.dailyActivity?.[todayKey]?.reviewed || 0;
  const dailyGoal = 5;
  let homeStreak = 0;
  for (let i = 0; i < 365; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const activity = stats.dailyActivity?.[date.toISOString().slice(0, 10)];
    if ((activity?.reviewed || 0) > 0 || (activity?.added || 0) > 0) homeStreak++;
    else if (i > 0) break;
  }
  const dailyWordSet = currentSet;
  const dailyWords = dailyWordSet?.words.filter(word => !savedIds.includes(word.id)).slice(0, numberOfWords) || [];
  useEffect(() => { if (view !== "home" || mainTab !== "home") setRevealedCards([]); }, [view, mainTab]);
  const playableWords = currentSet ? (playAllFiles ? currentSet.words : currentSet.words.filter(word => selectedFileIds.includes(word.fileId))) : [];
  const hasFileSelection = playAllFiles || selectedFileIds.length > 0;
  const fileSelectionHint = locale === "ar" ? "اختر ملفًا واحدًا على الأقل أو الكل" : locale === "fr" ? "Sélectionnez au moins un fichier ou Tous" : "Select at least one file or All";
  const baseSet = gameType === "saved" ? savedSet : currentSet ? { ...currentSet, words: playableWords } : null;
  const wrongIds = gameResults ? [...new Set(gameResults.filter(r => !r.correct).map(r => r.id))] : [];
  const gameSet = retryWrong && gameResults && baseSet ? { ...baseSet, words: baseSet.words.filter(w => wrongIds.includes(w.id)) } : baseSet;
  const updateSet = async (updated) => {
    const previous = sets.find(set => set.id === updated.id);
    if (!previous) return false;
    try {
      if (user) {
        const oldWords = new Map(previous.words.map(word => [word.id, word]));
        const savedWords = [];
        for (const word of updated.words) {
          const oldWord = oldWords.get(word.id);
          const payload = wordPayload(word, updated);
          let saved;
          if (oldWord?.serverId) {
            const changed = oldWord.word !== word.word || oldWord.translation !== word.translation ||
              previous.name !== updated.name || previous.lang1 !== updated.lang1 || previous.lang2 !== updated.lang2 ||
              oldWord.mastery_level !== word.mastery_level || oldWord.fileId !== word.fileId;
            saved = changed ? await wordRequest(`${AUTH_ENDPOINTS.words}${oldWord.serverId}/`, "PUT", { ...payload, file_id: word.fileId || "" }) : { id: oldWord.serverId };
          } else {
            saved = await wordRequest(AUTH_ENDPOINTS.words, "POST", { ...payload, file_id: word.fileId || "" });
          }
          savedWords.push({ ...word, serverId: saved.id });
        }
        for (const word of previous.words) {
          if (!updated.words.some(item => item.id === word.id) && word.serverId) {
            await wordRequest(`${AUTH_ENDPOINTS.words}${word.serverId}/`, "DELETE");
          }
        }
        updated = { ...updated, words: savedWords };
        try {
          const savedFolder = await folderRequest(updated.serverId ? `${FOLDERS_ENDPOINT}${updated.serverId}/` : FOLDERS_ENDPOINT, updated.serverId ? "PUT" : "POST", folderPayload(updated));
          updated = { ...updated, serverId: savedFolder.id };
        } catch (error) { warnFolderSync(error); }
      }
      setSets(prev => prev.map(set => set.id === updated.id ? updated : set));
      return true;
    } catch (error) { toast(error.message, "error"); return false; }
  };
  const deleteSet = async (id) => {
    const set = sets.find(item => item.id === id);
    try {
      if (user && set) for (const word of set.words) if (word.serverId) await wordRequest(`${AUTH_ENDPOINTS.words}${word.serverId}/`, "DELETE");
      if (user && set?.serverId) {
        try { await folderRequest(`${FOLDERS_ENDPOINT}${set.serverId}/`, "DELETE"); }
        catch (error) { warnFolderSync(error); }
      }
      setSets(prev => prev.filter(item => item.id !== id));
      toast(t("deleted"), "info");
    } catch (error) { toast(error.message, "error"); }
  };
  const deleteWord = async (setId, wordId) => {
    const word = sets.find(set => set.id === setId)?.words.find(item => item.id === wordId);
    try {
      if (user && word?.serverId) await wordRequest(`${AUTH_ENDPOINTS.words}${word.serverId}/`, "DELETE");
      setSets(prev => prev.map(set => set.id !== setId ? set : { ...set, words: set.words.filter(item => item.id !== wordId) }));
      return true;
    } catch (error) { toast(error.message, "error"); return false; }
  };
  const toggleSaved = (wordId) => setSavedIds(prev => prev.includes(wordId) ? prev.filter(id => id !== wordId) : [...prev, wordId]);
  const resetOtpModal = () => {
    if (authCloseTimerRef.current) clearTimeout(authCloseTimerRef.current);
    authCloseTimerRef.current = null;
    setAuthClosing(false);
    setModal(null);
    setLoginStep("email");
    setOtpPurpose("login");
    setOtpDigits(["", "", "", "", "", ""]);
    setOtpSeconds(0);
    setResendSeconds(0);
    setOtpLoading(false);
    setOtpError("");
  };
  const closeAuthModal = () => {
    setAuthClosing(true);
    authCloseTimerRef.current = setTimeout(resetOtpModal, 240);
  };
  const requestOtp = async (purpose = otpPurpose) => {
    const email = loginData.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setOtpError(t("invalidEmail")); return; }
    setOtpLoading(true);
    setOtpError("");
    try {
      await postAuth(AUTH_ENDPOINTS.requestOtp, { email, purpose });
      setLoginData(prev => ({ ...prev, email }));
      setOtpPurpose(purpose);
      setOtpDigits(["", "", "", "", "", ""]);
      setOtpSeconds(600);
      setResendSeconds(60);
      setLoginStep("otp");
    } catch (error) {
      setOtpError(error.message || t("otpNetworkError"));
    } finally {
      setOtpLoading(false);
    }
  };
  const handleOtpChange = (index, event) => {
    const raw = event.target.value.replace(/\D/g, "");
    if (!raw) {
      setOtpDigits(prev => prev.map((digit, i) => i === index ? "" : digit));
      return;
    }
    const next = [...otpDigits];
    raw.slice(0, 6 - index).split("").forEach((digit, offset) => { next[index + offset] = digit; });
    setOtpDigits(next);
    const nextIndex = Math.min(index + raw.length, 5);
    document.getElementById(`otp-${nextIndex}`)?.focus();
  };
  const handleOtpKeyDown = (index, event) => {
    if (event.key === "Backspace" && !otpDigits[index] && index > 0) document.getElementById(`otp-${index - 1}`)?.focus();
    if (event.key === "ArrowLeft" && index > 0) document.getElementById(`otp-${index - 1}`)?.focus();
    if (event.key === "ArrowRight" && index < 5) document.getElementById(`otp-${index + 1}`)?.focus();
  };
  const completeLogin = async (account) => {
    setUser(account);
    await loadWords(account, sets);
    closeAuthModal();
  };
  const verifyOtp = async () => {
    const code = otpDigits.join("");
    if (code.length !== 6) { setOtpError(t("enterCode")); return; }
    if (otpSeconds <= 0) { setOtpError(t("expiredCode")); return; }
    setOtpLoading(true);
    setOtpError("");
    try {
      const data = await postAuth(AUTH_ENDPOINTS.verifyOtp, { email: loginData.email.trim().toLowerCase(), code, purpose: otpPurpose });
      const returnedUser = data.user || data.account;
      if (otpPurpose === "backup" && user) {
        setUser({ ...user, ...(returnedUser || {}), backupEmail: loginData.email.trim().toLowerCase(), backupEmailVerified: true });
        resetOtpModal();
      } else {
        await completeLogin(returnedUser);
      }
      toast(t("savedMsg"), "success");
    } catch (error) {
      const remaining = error.data?.attempts_remaining;
      setOtpError(remaining !== undefined ? `${error.message || t("invalidCode")}: ${remaining}` : (error.message || t("otpNetworkError")));
      if (error.status === 429 || error.data?.locked) setOtpSeconds(0);
    } finally {
      setOtpLoading(false);
    }
  };
  const startLogin = (purpose = "login") => {
    setAuthClosing(false);
    setOtpPurpose(purpose);
    setLoginStep("email");
    setOtpError("");
    setOtpDigits(["", "", "", "", "", ""]);
    setModal("login");
  };
  googleCallbackRef.current = async (response) => {
    setOtpLoading(true);
    setOtpError("");
    try {
      console.log("[SADAX Google] sending credential to /auth/google/callback/");
      const data = await postAuth(AUTH_ENDPOINTS.googleCallback, { credential: response.credential });
      console.log("[SADAX Google] backend accepted sign-in", { userId: data.user?.id });
      await completeLogin(data.user);
    } catch (error) {
      console.error("[SADAX Google] sign-in failed", { status: error.status, message: error.message });
      setOtpError(error.message || t("otpNetworkError"));
      toast("Connexion Google échouée. Réessayez.", "error");
    }
    finally { setOtpLoading(false); }
  };
  const logout = async () => {
    if (logoutPending) return;
    setLogoutPending(true);
    try {
      await postAuth(AUTH_ENDPOINTS.logout, {});
      setLogoutExiting(true);
      await new Promise(resolve => setTimeout(resolve, 180));
      try { window.google?.accounts?.id?.disableAutoSelect?.(); } catch {}
      setUser(null);
      setSets([]);
      setSavedIds([]);
      setCurrentSetId(null);
      setGameResults(null);
      try {
        for (const key of ["vocaflow_user", "vocaflow_word_owner", "vocaflow_sets", "vocaflow_saved"]) {
          localStorage.removeItem(key);
        }
      } catch {}
      setView("home");
      setMainTab("games");
      resetOtpModal();
      setLoginData({ name: "", email: "" });
      setModal("login");
      setLogoutConfirm(false);
      setLogoutExiting(false);
      toast(t("logout"), "info");
    } catch (error) { toast(error.message, "error"); setLogoutExiting(false); }
    finally { setLogoutPending(false); }
  };
  const createSet = async () => {
    if (!newSet.name.trim()) { toast(t("setName"), "error"); return; }
    const set = { id: "set" + uid(), name: newSet.name.trim(), lang1: newSet.lang1, lang2: newSet.lang2, files: [], words: [] };
    setSets(prev => [...prev, set]);
    setCurrentSetId(set.id);
    setModal(null);
    setNewSet({ name: "", lang1: "fr", lang2: "ar" });
    toast(t("created"), "success");
    if (user) {
      try {
        const saved = await folderRequest(FOLDERS_ENDPOINT, "POST", folderPayload(set));
        setSets(prev => prev.map(item => item.id === set.id ? { ...item, serverId: saved.id } : item));
      } catch (error) { warnFolderSync(error); }
    }
  };
  const openEssentialFolder = async () => {
    if (presetAddInFlightRef.current) return;
    const lang1 = essentialLangs.lang1;
    const lang2 = essentialLangs.lang2;
    if (lang1 === lang2) { toast(t("sameLangError"), "error"); return; }
    presetAddInFlightRef.current = true;
    setIsAddingPreset(true);
    try {
    const id = "essential_" + lang1 + "_" + lang2;
    const existing = sets.find(s => s.id === id);
    if (existing) {
      setCurrentSetId(id);
    } else {
      const setName = t("essentialFolder") + " · " + getLang(lang1).name + " → " + getLang(lang2).name;
      let set = buildEssentialSet(lang1, lang2, setName);
      if (user) {
        try {
          const words = [];
          for (const word of set.words) {
            const saved = await wordRequest(AUTH_ENDPOINTS.words, "POST", { ...wordPayload(word, set), file_id: word.fileId || "" });
            words.push({ ...word, serverId: saved.id });
          }
          set = { ...set, words };
        } catch (error) { toast(error.message, "error"); return; }
        try {
          const savedFolder = await folderRequest(FOLDERS_ENDPOINT, "POST", folderPayload(set));
          set = { ...set, serverId: savedFolder.id };
        } catch (error) { warnFolderSync(error); }
      }
      setSets(prev => prev.some(item => item.id === id) ? prev : [...prev, set]);
      setCurrentSetId(id);
    }
    setModal(null);
    setMainTab("games");
    toast(t("folderReady"), "success");
    } finally {
      presetAddInFlightRef.current = false;
      setIsAddingPreset(false);
    }
  };
  const startGame = (type) => {
    if (type === "saved") {
      if (!savedWords.length) { toast(t("noSaved"), "error"); return; }
      setGameType("saved"); setRetryWrong(false); setGameKey(Date.now()); setView("game");
      return;
    }
    if (type === "dictee") {
      setGameType("dictee"); setRetryWrong(false); setGameKey(Date.now()); setView("game");
      return;
    }
    if (!currentSet) { toast(t("needSelectSet"), "error"); return; }
    if (!playableWords.length) { toast(t("noWords"), "error"); return; }
    setGameType(type); setRetryWrong(false); setGameKey(Date.now()); setView("game");
  };
  const finishGame = (results) => {
    const total = results.length;
    const correct = results.filter(r => r.correct).length;
    const pct = total ? Math.round((correct / total) * 100) : 0;
    usage.updateBestScore(pct);
    setGameResults(results);
    setView("results");
  };
  const handleAvatarUpload = (file) => {
    if (!file) return;
    if (!user) { startLogin("login"); return; }
    if (file.size > 2 * 1024 * 1024) { toast("Max 2MB", "error"); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      const nd = e.target.result;
      setUser({ ...user, avatar: nd });
      toast(t("savedMsg"), "success");
    };
    reader.onerror = () => toast(t("errorOccurred"), "error");
    reader.readAsDataURL(file);
  };
  const handleExport = () => {
    try {
      const data = { version: "10.0", sets, user, savedIds, voiceSettings, stats, exportedAt: new Date().toISOString() };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `vocaflow-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast(t("dataExported"), "success");
    } catch { toast(t("errorOccurred"), "error"); }
  };
  const handleImport = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.sets) {
          if (user) await loadWords(user, data.sets);
          else setSets(data.sets);
        }
        if (data.savedIds) setSavedIds(data.savedIds);
        if (data.voiceSettings) setVoiceSettings(data.voiceSettings);
        if (data.stats) { try { localStorage.setItem('vocaflow_real_stats', JSON.stringify(data.stats)); } catch {} }
        toast(t("dataImported"), "success");
        setModal(null);
      } catch { toast(t("invalidFile"), "error"); }
    };
    reader.onerror = () => toast(t("errorOccurred"), "error");
    reader.readAsText(file);
  };
  const handleReset = async () => {
    if (!confirm(t("confirmReset"))) return;
    try {
      if (user) {
        const words = await wordRequest(AUTH_ENDPOINTS.words, "GET");
        for (const word of words) await wordRequest(`${AUTH_ENDPOINTS.words}${word.id}/`, "DELETE");
        try {
          const data = await folderRequest(FOLDERS_ENDPOINT, "GET");
          for (const folder of (data.folders || [])) await folderRequest(`${FOLDERS_ENDPOINT}${folder.id}/`, "DELETE");
        } catch (error) { warnFolderSync(error); }
      }
      localStorage.clear();
      setSets([]);
      setSavedIds([]);
      setModal(null);
    } catch (error) { toast(error.message, "error"); }
  };
  const games = [
    { type: "flashcards", name: t("flashcards"), description: t("tapToFlip") },
    { type: "mcq", name: t("mcq"), description: `${t("question")} · ${t("check")}` },
    { type: "spelling", name: t("spelling"), description: t("typeWord") },
    { type: "matching", name: t("matching"), description: t("matchPairs") },
    { type: "dictee", name: t("dictee"), description: t("dicteeSubtitle") }
  ];
  const hideNav = view === 'game' || view === 'editor' || view === 'results' || modal !== null || logoutConfirm;
  return (
    <div className="app">
      {view === "home" && (
        <div>
          <div className="topbar">
            <div className="site-logo site-logo--boxed" onClick={() => { setView("home"); setMainTab("home"); }}>
              <span className="brand-icon-box"><LogoMark size={26} /></span>
              <h1 className="brand-wordmark"><span className="brand-h">S</span>ADAX</h1>
              <div className="tagline">{t("tagline")}</div>
            </div>
            <div className="topbar-actions">
              {user && <AccountNav user={user} onLogout={() => setLogoutConfirm(true)} />}
            </div>
          </div>
          {mainTab === 'home' && (
            <div className="tab-content">
              <ProfileCard variant="home" user={user} usage={usage} savedCount={savedWords.length} />
              <div className="home-stats-strip">
                <div className="home-stat ui-card-compact stagger-enter" style={{ '--index': 1 }}><strong>{totalWords}</strong><span>{t("totalWords")}</span></div>
                <div className="home-stat ui-card-compact stagger-enter" style={{ '--index': 2 }}><strong>{homeStreak}</strong><span>{t("daysStreak")}</span></div>
                <div className="home-stat ui-card-compact stagger-enter" style={{ '--index': 3 }}><strong>{usage.level}</strong><span>{t("level")}</span></div>
              </div>
              <section className="home-progress ui-card stagger-enter" style={{ '--index': 4 }}>
                <h3>{t("home_progress")}</h3>
                <div className="home-progress-track" role="progressbar" aria-valuenow={Math.min(todayReviewed, dailyGoal)} aria-valuemin="0" aria-valuemax={dailyGoal} aria-label={t("home_progress")}><div className="home-progress-fill" style={{ width: `${Math.min(100, todayReviewed / dailyGoal * 100)}%` }} /></div>
                <p>{t("home_progress_count").replace("{n}", todayReviewed).replace("{max}", dailyGoal)}</p>
              </section>
              <section className="home-daily-word ui-card stagger-enter" style={{ '--index': 5 }}>
                <h3>{t("home_daily_words_title")}</h3>
                <p className="home-daily-hint" id="home-daily-hint">{t("home_daily_words_hint")}</p>
                <div className="home-daily-controls">
                  <div className="home-daily-count-control">
                    <label htmlFor="home-daily-count">{t("home_daily_words_count")} <output htmlFor="home-daily-count">{numberOfWords}</output></label>
                    <input id="home-daily-count" type="range" min="1" max="10" value={numberOfWords} onChange={e => setNumberOfWords(Number(e.target.value))} />
                  </div>
                </div>
                {!dailyWords.length ? <p className="home-daily-empty">{dailyWordSet?.words.length ? t("home_daily_all_saved") : t("home_daily_words_empty")}</p> : (
                  <div className="home-daily-list">
                    {dailyWords.map((word, index) => {
                      const cardKey = `${dailyWordSet.id}:${word.id ?? index}`;
                      const revealed = revealedCards.includes(cardKey);
                      const isSaved = savedIds.includes(word.id);
                      return <div key={cardKey} className={`home-daily-entry ui-card ${revealed ? "revealed" : ""}`} onClick={() => setRevealedCards(previous => previous.includes(cardKey) ? previous : [...previous, cardKey])}>
                        <div className="home-daily-entry-main">
                          <button type="button" className="home-daily-reveal" aria-expanded={revealed} aria-describedby="home-daily-hint" lang={word.lang1 || dailyWordSet.lang1}>{word.word}</button>
                          <div className="home-daily-entry-actions">
                            <button type="button" className="ui-btn-icon" onClick={event => { event.stopPropagation(); speakText(word.word, word.lang1 || dailyWordSet.lang1); }} aria-label={`${t("traduire_speak")}: ${word.word}`}><SpeakerIcon size={20} /></button>
                            <button type="button" className="ui-btn-icon home-daily-save" onClick={event => { event.stopPropagation(); toggleSaved(word.id); toast(t("home_daily_moved_to_sanctuary"), "success"); }} aria-label={isSaved ? t("saved") : t("save")} aria-pressed={isSaved}><BookmarkIcon filled={isSaved} size={20} /></button>
                          </div>
                        </div>
                        <div className="home-daily-translation" aria-hidden={!revealed}><span lang={word.lang2 || dailyWordSet.lang2}>{word.translation}</span></div>
                      </div>;
                    })}
                  </div>
                )}
              </section>
              <div className="stagger-enter" style={{ '--index': 6 }}><Sanctuary count={savedWords.length} onPlay={() => startGame("saved")} /></div>
            </div>
          )}
          {mainTab === 'traduire' && (<TranslatePage draft={translatorDraft} setDraft={setTranslatorDraft} />)}
          {mainTab === 'games' && (
            <div className="tab-content">
              <div style={{ marginTop: 20 }}>
                <SelectSetDropdown
                  sets={sets}
                  currentSetId={currentSetId}
                  onSelect={id => setCurrentSetId(id)}
                  onEdit={id => { setCurrentSetId(id); setView("editor"); }}
                  onDelete={deleteSet}
                  onCreate={() => setModal("createSet")}
                  onOpenEssential={() => setModal("essential")}
                />
                {currentSet && <div className="game-file-select-panel ui-card">
                  <h3 className="game-file-select-title">{t("game_select_files")}</h3>
                  <div className="game-file-select-options">
                    <label className="game-file-select-option"><input type="checkbox" checked={playAllFiles} onChange={e => { setPlayAllFiles(e.target.checked); if (e.target.checked) setSelectedFileIds([]); }} /> {t("game_select_all")}</label>
                    {(currentSet.files || []).map(file => <label key={file.id} className="game-file-select-option"><input type="checkbox" checked={selectedFileIds.includes(file.id)} onChange={e => { setPlayAllFiles(false); setSelectedFileIds(prev => e.target.checked ? [...prev, file.id] : prev.filter(id => id !== file.id)); }} /> {file.name}</label>)}
                  </div>
                  <button type="button" className="game-file-select-start" onClick={() => startGame("flashcards")} disabled={!hasFileSelection || !playableWords.length}>{t("game_start_selected")}</button>
                  {!hasFileSelection && <div className="game-file-select-hint" role="status">{fileSelectionHint}</div>}
                </div>}
                <div className="games-header-wrap">
                  <h2 className="games-header-title main-page-title"><span className="header-emoji"><GamepadIcon size={28} color="var(--color-primary)" /></span> {t("games")}</h2>
                  <div className="games-header-desc"><RocketIcon size={14} color="var(--color-primary)" /> {t("gamesDesc")}</div>
                </div>
                <div className="games-grid">
                  {games.map((g, i) => (
                    <div key={g.type} className="game-card stagger-enter" role="button" tabIndex={0} style={{ '--index': i }} onClick={() => startGame(g.type)} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); startGame(g.type); } }}>
                      <div className="game-illustration"><GameScene type={g.type} /></div>
                      <div className="game-name">{g.name}</div>
                      <div className="game-description">{g.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {mainTab === 'stats' && (<ActivityView usage={usage} totalWords={totalWords} masteredCount={masteredCount} stats={stats} />)}
          {mainTab === 'settings' && (
            <div className="tab-content settings-page">
              <h2 className="main-page-title settings-page-title">{t("settings_page_title")}</h2>
              <input type="file" id="avatar-upload2" accept="image/*" style={{ display: "none" }} onChange={e => handleAvatarUpload(e.target.files[0])} />
              <section className="settings-section ui-card stagger-enter" style={{ '--index': 0, '--stagger-step': '60ms' }}>
                <h3>{t("settings_appearance")}</h3>
                <div className="theme-toggle-row ui-card-compact" role="switch" aria-checked={theme === "dark"} aria-label={theme === "light" ? t("darkMode") : t("lightMode")} tabIndex={0} onClick={toggleTheme} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleTheme(); } }}>
                  <span className="theme-toggle-label">{theme === "light" ? <MoonIcon size={20} /> : <SunIcon size={20} />}{theme === "light" ? t("darkMode") : t("lightMode")}</span>
                  <div className={`theme-toggle-switch ${theme === "dark" ? "active" : ""}`} />
                </div>
              </section>
              <section className="settings-section ui-card stagger-enter" style={{ '--index': 1, '--stagger-step': '60ms' }}>
                <h3>{t("settings_language")}</h3>
                <div className="field"><label htmlFor="settings-language"><UiIcon name="globe" size={18} /> {t("language")}</label><select id="settings-language" className="ui-input" value={locale} onChange={e => setLocale(e.target.value)}>{langs.map(l => <option key={l.code} value={l.code}>{l.flag} {l.name}</option>)}</select></div>
              </section>
              <section className="settings-section ui-card stagger-enter" style={{ '--index': 2, '--stagger-step': '60ms' }}>
                <h3>{t("settings_audio")}</h3>
                <div className="field"><label htmlFor="settings-rate"><UiIcon name="bolt" size={18} /> {t("speechRate")}: {voiceSettings.rate.toFixed(2)}</label><div className="slider-wrap"><UiIcon name="turtle" size={18} /><input id="settings-rate" type="range" min="0.5" max="1.5" step="0.05" value={voiceSettings.rate} onChange={e => setVoiceSettings({ ...voiceSettings, rate: parseFloat(e.target.value) })} /><UiIcon name="rabbit" size={18} /><span className="slider-value">{voiceSettings.rate.toFixed(2)}</span></div></div>
                <div className="field"><label htmlFor="settings-pitch"><UiIcon name="music" size={18} /> {t("pitch")}: {voiceSettings.pitch.toFixed(2)}</label><div className="slider-wrap"><UiIcon name="arrowDown" size={18} /><input id="settings-pitch" type="range" min="0.5" max="1.5" step="0.05" value={voiceSettings.pitch} onChange={e => setVoiceSettings({ ...voiceSettings, pitch: parseFloat(e.target.value) })} /><UiIcon name="arrowUp" size={18} /><span className="slider-value">{voiceSettings.pitch.toFixed(2)}</span></div></div>
              </section>
              <section className="settings-section settings-account ui-card stagger-enter" style={{ '--index': 3, '--stagger-step': '60ms' }}>
                <h3>{t("settings_account")}</h3>
                <ProfileCard user={user} usage={usage} savedCount={savedWords.length} onAvatarClick={() => document.getElementById("avatar-upload2").click()} />
                {!user ? (
                   <button type="button" className="ui-btn ui-btn-primary btn-block" onClick={() => startLogin("login")}><UiIcon name="lock" /> {t("login")}</button>
                ) : (
                   <div className="settings-account-actions">
                     {SHOW_EMAIL_LOGIN && <button type="button" className="ui-btn ui-btn-secondary btn-block" onClick={() => startLogin("backup")}><UiIcon name="mail" /> {t("backupEmail")}</button>}
                     <button type="button" className="ui-btn ui-btn-danger btn-block" onClick={() => setLogoutConfirm(true)}><UiIcon name="signOut" /> {t("logout")}</button>
                   </div>
                )}
              </section>
              <section className="settings-section ui-card stagger-enter" style={{ '--index': 4, '--stagger-step': '60ms' }}>
                <h3>{t("settings_data")}</h3>
                <div className="settings-data-actions">
                  <button type="button" className="ui-btn ui-btn-secondary" onClick={handleExport}><UiIcon name="download" /> {t("exportData")}</button>
                  <label className="file-upload-wrap ui-btn ui-btn-secondary"><FolderIcon size={18} /> {t("importData")}<input type="file" accept=".json" onChange={e => handleImport(e.target.files[0])} /></label>
                  <button type="button" className="ui-btn ui-btn-danger" onClick={handleReset}><TrashIcon /> {t("resetAll")}</button>
                </div>
              </section>
            </div>
          )}
        </div>
      )}
      {view === "editor" && currentSet && (
        <SetEditor set={currentSet} onBack={() => setView("home")} onUpdate={updateSet} onDeleteWord={deleteWord} onWordAdded={trackWordAdded} />
      )}
      {view === "game" && (gameSet || gameType === "dictee") && (
        <div>
          {(gameType === "flashcards" || gameType === "saved") && (
            <FlashcardsGame key={gameKey} set={gameSet} savedIds={savedIds} onToggleSaved={toggleSaved} onFinish={finishGame} onExit={() => setView("home")} voiceSettings={voiceSettings} onReview={trackReview} onGameComplete={trackGame} />
          )}
          {gameType === "mcq" && (
            <MCQGame key={gameKey} set={gameSet} savedIds={savedIds} onToggleSaved={toggleSaved} onFinish={finishGame} onExit={() => setView("home")} voiceSettings={voiceSettings} onReview={trackReview} onGameComplete={trackGame} />
          )}
          {gameType === "spelling" && (
            <SpellingGame key={gameKey} set={gameSet} savedIds={savedIds} onToggleSaved={toggleSaved} onFinish={finishGame} onExit={() => setView("home")} voiceSettings={voiceSettings} onReview={trackReview} onGameComplete={trackGame} />
          )}
          {gameType === "matching" && (
            <MatchingGame key={gameKey} set={gameSet} savedIds={savedIds} onToggleSaved={toggleSaved} onFinish={finishGame} onExit={() => setView("home")} onReview={trackReview} onGameComplete={trackGame} />
          )}
          {gameType === "dictee" && (
            <DicteeGame key={gameKey} onExit={() => setView("home")} onGameComplete={trackGame} />
          )}
        </div>
      )}
      {view === "results" && gameResults && (
        <Results results={gameResults} onRetry={() => { setRetryWrong(false); setGameKey(Date.now()); setView("game"); }} onRetryWrong={() => { setRetryWrong(true); setGameKey(Date.now()); setView("game"); }} onHome={() => setView("home")} />
      )}
      {modal === "essential" && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 style={{ display: "flex", alignItems: "center", gap: 10 }}><EssentialFolderIcon size={28} /> {t("essentialFolder")}</h3>
            <p className="muted" style={{ marginBottom: 16, lineHeight: 1.6 }}>{t("essentialFolderDesc")}</p>
            <div className="grid-2">
              <div className="field">
                <label>{t("firstLang")}</label>
                <select value={essentialLangs.lang1} onChange={e => setEssentialLangs({ ...essentialLangs, lang1: e.target.value })}>
                  {langs.map(l => (<option key={l.code} value={l.code}>{l.flag} {l.name}</option>))}
                </select>
              </div>
              <div className="field">
                <label>{t("secondLang")}</label>
                <select value={essentialLangs.lang2} onChange={e => setEssentialLangs({ ...essentialLangs, lang2: e.target.value })}>
                  {langs.map(l => (<option key={l.code} value={l.code}>{l.flag} {l.name}</option>))}
                </select>
              </div>
            </div>
            <div className="essential-preview">
              {ESSENTIAL_WORDS.slice(0, 8).map((w, i) => (
                <div key={i} className="essential-preview-row">
                  <span>{w[essentialLangs.lang1] || w.en}</span>
                  <span className="muted">→</span>
                  <span>{w[essentialLangs.lang2] || w.en}</span>
                </div>
              ))}
              <div className="essential-more">+ {ESSENTIAL_WORDS.length - 8} {t("words")}</div>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary ui-btn-secondary" onClick={() => setModal(null)}>{t("cancel")}</button>
              <button type="button" className="btn btn-primary" onClick={openEssentialFolder} disabled={isAddingPreset} aria-busy={isAddingPreset}><FolderIcon /> {isAddingPreset ? t("presetAdding") : t("openFolder")}</button>
            </div>
          </div>
        </div>
      )}
      {modal === "createSet" && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3><PlusIcon size={20} /> {t("createSet")}</h3>
            <div className="field"><label>{t("setName")}</label><input value={newSet.name} onChange={e => setNewSet({ ...newSet, name: e.target.value })} autoFocus /></div>
            <div className="grid-2">
              <div className="field"><label>{t("firstLang")}</label><select value={newSet.lang1} onChange={e => setNewSet({ ...newSet, lang1: e.target.value })}>{langs.map(l => (<option key={l.code} value={l.code}>{l.flag} {l.name}</option>))}</select></div>
              <div className="field"><label>{t("secondLang")}</label><select value={newSet.lang2} onChange={e => setNewSet({ ...newSet, lang2: e.target.value })}>{langs.map(l => (<option key={l.code} value={l.code}>{l.flag} {l.name}</option>))}</select></div>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary ui-btn-secondary" onClick={() => setModal(null)}>{t("cancel")}</button>
              <button type="button" className="btn btn-primary" onClick={createSet}>{t("save")}</button>
            </div>
          </div>
        </div>
      )}
      {modal === "settings" && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{t("settings")}</h3>
            <div className="tabs">
              <div className={`tab ${settingsTab === "general" ? "active" : ""}`} onClick={() => setSettingsTab("general")}><UiIcon name="globe" size={18} /> {t("language")}</div>
              <div className={`tab ${settingsTab === "voice" ? "active" : ""}`} onClick={() => setSettingsTab("voice")}><SpeakerIcon size={14} /> {t("voiceSettings")}</div>
              <div className={`tab ${settingsTab === "data" ? "active" : ""}`} onClick={() => setSettingsTab("data")}><BookIcon size={14} color="var(--color-primary)" /> Backup</div>
            </div>
            {settingsTab === "general" && (
              <div><div className="field"><label><UiIcon name="globe" size={18} /> {t("language")}</label><select value={locale} onChange={e => setLocale(e.target.value)}>{langs.map(l => (<option key={l.code} value={l.code}>{l.flag} {l.name}</option>))}</select></div></div>
            )}
            {settingsTab === "voice" && (
              <div>
                <div className="field">
                  <label><UiIcon name="bolt" size={18} /> {t("speechRate")}: {voiceSettings.rate.toFixed(2)}</label>
                  <div className="slider-wrap"><span><UiIcon name="turtle" size={18} /></span><input type="range" min="0.5" max="1.5" step="0.05" value={voiceSettings.rate} onChange={e => setVoiceSettings({ ...voiceSettings, rate: parseFloat(e.target.value) })} /><span><UiIcon name="rabbit" size={18} /></span><span className="slider-value">{voiceSettings.rate.toFixed(2)}</span></div>
                </div>
                <div className="field">
                  <label><UiIcon name="music" size={18} /> {t("pitch")}: {voiceSettings.pitch.toFixed(2)}</label>
                  <div className="slider-wrap"><span><UiIcon name="arrowDown" size={18} /></span><input type="range" min="0.5" max="1.5" step="0.05" value={voiceSettings.pitch} onChange={e => setVoiceSettings({ ...voiceSettings, pitch: parseFloat(e.target.value) })} /><span><UiIcon name="arrowUp" size={18} /></span><span className="slider-value">{voiceSettings.pitch.toFixed(2)}</span></div>
                </div>
              </div>
            )}
            {settingsTab === "data" && (
              <div>
                <div className="field"><label><BookIcon size={14} color="var(--color-primary)" /> {t("exportData")}</label><button type="button" className="btn btn-primary btn-block" onClick={handleExport}><UiIcon name="download" /> Download Backup</button></div>
                <div className="field"><label><BookIcon size={14} color="var(--color-primary)" /> {t("importData")}</label><div className="file-upload-wrap"><FolderIcon size={18} /> Choose backup file<input type="file" accept=".json" onChange={e => handleImport(e.target.files[0])} /></div></div>
                <div className="field" style={{ marginTop: 20 }}><label><UiIcon name="warning" size={18} /> {t("resetAll")}</label><button type="button" className="btn btn-danger ui-btn-danger btn-block" onClick={handleReset}><TrashIcon /> {t("resetAll")}</button></div>
              </div>
            )}
            <div className="modal-actions"><button type="button" className="btn btn-primary btn-block" onClick={() => setModal(null)}>{t("close")}</button></div>
          </div>
        </div>
      )}
      {modal === "login" && (
        <div className={`modal-overlay auth-overlay ${authClosing ? "auth-closing" : ""}`} onClick={resetOtpModal}>
          <div className="auth-card" role="dialog" aria-modal="true" aria-label="Connexion SADAX" dir="ltr" onClick={e => e.stopPropagation()}>
            <div className="auth-brand">
              <div className="auth-mark"><LogoMark size={49} /></div>
              <h3>{otpPurpose === "backup" ? t("backupEmail") : <>Bienvenue sur <span className="brand-wordmark">SADAX</span></>}</h3>
              <p className="auth-subtitle">{otpPurpose === "backup" ? t("backupEmailIntro") : "Connectez-vous pour sauvegarder vos progrès"}</p>
              <div className="auth-tagline">{t("tagline")}</div>
            </div>
            <div className="auth-rule" />
            {loginStep === "email" ? (
              <div className="auth-step" key="email-step">
                {otpPurpose === "login" && (
                  <div className="auth-google-wrapper">
                    <div id="google-signin-btn" ref={googleButtonRef} aria-label="Continuer avec Google" />
                    {googleButtonStatus !== "ready" && <div className="auth-google-status" role="status" aria-live="polite">{googleButtonStatus === "loading" && <span className="auth-google-spinner" aria-hidden="true" />}{t(googleButtonStatus === "loading" ? "authGoogleLoading" : "authGoogleUnavailable")}</div>}
                  </div>
                )}
                {SHOW_EMAIL_LOGIN && (
                  <>
                    {otpPurpose === "login" && <div className="auth-divider"><span>ou</span></div>}
                    <div className="field">
                      <label htmlFor="auth-email">Adresse e-mail</label>
                      <input id="auth-email" type="email" value={loginData.email} onChange={e => { setLoginData({ ...loginData, email: e.target.value }); setOtpError(""); }} placeholder="votre@email.com" autoComplete="email" onKeyDown={e => e.key === "Enter" && requestOtp()} />
                    </div>
                    {otpError && <div className="otp-error" role="alert">{otpError}</div>}
                    <button type="button" className="auth-primary" onClick={() => requestOtp()} disabled={otpLoading}>
                      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="2" /><path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      {otpLoading ? "Envoi en cours…" : "Envoyer le code"}
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="auth-step" key="otp-step">
                <p className="otp-intro">Saisissez le code à 6 chiffres envoyé à</p>
                <div className="otp-email-badge"><UiIcon name="mail" size={18} /> {loginData.email}</div>
                <div className="field" style={{ marginTop: 18 }}>
                  <label style={{ textAlign: "center" }}>{t("enterCode")}</label>
                  <div className="otp-inputs">
                    {otpDigits.map((digit, index) => (
                      <input key={index} id={`otp-${index}`} className="otp-input" value={digit} onChange={event => handleOtpChange(index, event)} onKeyDown={event => handleOtpKeyDown(index, event)} inputMode="numeric" pattern="[0-9]*" maxLength={6} autoComplete={index === 0 ? "one-time-code" : "off"} aria-label={`${t("enterCode")} ${index + 1}`} />
                    ))}
                  </div>
                </div>
                <div className={`otp-countdown ${otpSeconds === 0 ? "expired" : ""}`}>{otpSeconds > 0 ? `Code valable encore ${Math.floor(otpSeconds / 60)}:${String(otpSeconds % 60).padStart(2, "0")}` : t("expiredCode")}</div>
                {otpError && <div className="otp-error" role="alert">{otpError}</div>}
                <button type="button" className="auth-primary" onClick={verifyOtp} disabled={otpLoading || otpDigits.join("").length !== 6 || otpSeconds === 0}>{otpLoading ? "Vérification…" : "Vérifier le code"}</button>
                <div className="auth-otp-links">
                  {resendSeconds > 0 ? <span className="auth-resend-wait">Renvoyer le code dans {resendSeconds}s</span> : <button type="button" className="auth-text-button" onClick={() => requestOtp()} disabled={otpLoading}>Renvoyer le code</button>}
                  <button type="button" className="auth-text-button" onClick={() => { setLoginStep("email"); setOtpError(""); }} disabled={otpLoading}>{t("changeEmail")}</button>
                </div>
              </div>
            )}
            <button type="button" className="auth-text-button auth-cancel" onClick={resetOtpModal} disabled={otpLoading}>{t("cancel")}</button>
          </div>
        </div>
      )}
      {logoutConfirm && (
        <div className={`logout-confirm-overlay ${logoutExiting ? "leaving" : ""}`} onClick={() => { if (!logoutPending) setLogoutConfirm(false); }}>
          <div className="logout-confirm-card" role="alertdialog" aria-modal="true" aria-labelledby="logout-confirm-title" dir="ltr" onClick={e => e.stopPropagation()}>
            <div className="logout-confirm-icon"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true"><path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4M14 8l4 4-4 4M8 12h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
            <h3 id="logout-confirm-title">Voulez-vous vraiment vous déconnecter?</h3>
            <div className="logout-confirm-actions">
              <button type="button" className="logout-cancel" onClick={() => setLogoutConfirm(false)} disabled={logoutPending}>Annuler</button>
              <button type="button" className="logout-submit" onClick={logout} disabled={logoutPending}>{logoutPending ? "Déconnexion…" : "Déconnecter"}</button>
            </div>
          </div>
        </div>
      )}
      {!hideNav && <BottomNav activeTab={mainTab} onTabChange={setMainTab} t={t} />}
    </div>
  );
}

function Root() {
  return (
    <ErrorBoundary>
      <I18nProvider>
        <ThemeProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </ThemeProvider>
      </I18nProvider>
    </ErrorBoundary>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<Root />);
