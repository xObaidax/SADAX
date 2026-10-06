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

function AppContent() {
  const { t, locale, setLocale, langs } = useI18n();
  const toast = useToast();
  const usage = useUsage();
  const { stats, trackWordAdded, trackReview, trackGame } = useRealStats();
  const { theme, toggle: toggleTheme } = useTheme();
  const [sets, setSets] = useLocalStorage("vocaflow_sets", DEFAULT_SETS);
  const [user, setUser] = useState(null);
  const initialLocalSets = useRef((() => {
    try { return JSON.parse(localStorage.getItem("vocaflow_sets")); } catch { return null; }
  })());
  const googleButtonRef = useRef(null);
  const googleCallbackRef = useRef(null);
  const googleInitializedRef = useRef(false);
  const [savedIds, setSavedIds] = useLocalStorage("vocaflow_saved", []);
  const [voiceSettings, setVoiceSettings] = useLocalStorage("vocaflow_voice", { rate: 0.9, pitch: 1.0 });
  const [view, setView] = useState("home");
  const [mainTab, setMainTab] = useState("games");
  const [translatorDraft, setTranslatorDraft] = useState({ sourceLang: "fr", targetLang: "ar", sourceText: "", result: "" });
  const [currentSetId, setCurrentSetId] = useState(sets[0]?.id || null);
  const [playAllFiles, setPlayAllFiles] = useState(true);
  const [selectedFileIds, setSelectedFileIds] = useState([]);
  const [authChecked, setAuthChecked] = useState(false);
  const [guestNoticeDismissed, setGuestNoticeDismissed] = useState(() => { try { return localStorage.getItem("vocaflow_guest_notice_dismissed") === "1"; } catch { return false; } });
  const [gameType, setGameType] = useState("flashcards");
  const [gameKey, setGameKey] = useState(0);
  const [retryWrong, setRetryWrong] = useState(false);
  const [gameResults, setGameResults] = useState(null);
  const [modal, setModal] = useState(null);
  const [newSet, setNewSet] = useState({ name: "", lang1: "fr", lang2: "ar" });
  const [essentialLangs, setEssentialLangs] = useState({ lang1: "fr", lang2: "ar" });
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
      } finally {
        if (active) setAuthChecked(true);
      }
    })();
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (modal !== "login" || loginStep !== "email" || otpPurpose !== "login" || !googleButtonRef.current) return;
    const clientId = (window.__GOOGLE_CLIENT_ID__ || "").trim();
    if (!clientId) {
      console.warn("[SADAX Google] Client ID is missing.");
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
        console.log("[SADAX Google] Sign-In button requested");
      } catch (error) {
        console.warn("[SADAX Google] initialization failed", error);
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
  const totalWords = sets.reduce((acc, s) => acc + s.words.length, 0);
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
    const lang1 = essentialLangs.lang1;
    const lang2 = essentialLangs.lang2;
    if (lang1 === lang2) { toast(t("sameLangError"), "error"); return; }
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
      setSets(prev => [...prev, set]);
      setCurrentSetId(id);
    }
    setModal(null);
    setMainTab("games");
    toast(t("folderReady"), "success");
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
    { type: "flashcards", name: t("flashcards"), color: "#C9A84C", icon: <CardsIcon active={true} /> },
    { type: "mcq", name: t("mcq"), color: "#2D6A4F", icon: <svg viewBox="0 0 48 48" fill="none"><rect x="4" y="6" width="40" height="10" rx="4" fill="var(--color-text)" stroke="var(--color-primary)" strokeWidth="2"/><rect x="4" y="19" width="40" height="10" rx="4" fill="var(--color-text)" stroke="var(--color-primary)" strokeWidth="2" opacity="0.6"/><rect x="4" y="32" width="40" height="10" rx="4" fill="var(--color-text)" stroke="var(--color-primary)" strokeWidth="2" opacity="0.4"/><circle cx="12" cy="11" r="3" fill="var(--color-primary)"/><path d="M10 11l2 2 3-3" stroke="var(--color-text)" strokeWidth="2" strokeLinecap="round"/></svg> },
    { type: "spelling", name: t("spelling"), color: "#C9A84C", icon: <svg viewBox="0 0 48 48" fill="none"><rect x="6" y="8" width="36" height="32" rx="4" fill="var(--color-text)" stroke="var(--color-primary)" strokeWidth="2"/><path d="M12 30l6-12 6 12" stroke="var(--color-primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/><path d="M28 30h8" stroke="var(--color-primary)" strokeWidth="3" strokeLinecap="round"/><circle cx="38" cy="14" r="3" fill="var(--color-primary)"/></svg> },
    { type: "matching", name: t("matching"), color: "#7B2D2D", icon: <svg viewBox="0 0 48 48" fill="none"><rect x="4" y="6" width="16" height="16" rx="3" fill="var(--color-text)" stroke="var(--color-primary)" strokeWidth="2"/><rect x="28" y="26" width="16" height="16" rx="3" fill="var(--color-text)" stroke="var(--color-primary)" strokeWidth="2"/><path d="M20 14h4a4 4 0 0 1 4 4v10" stroke="var(--color-primary)" strokeWidth="2.5" fill="none" strokeLinecap="round"/><circle cx="12" cy="14" r="2" fill="var(--color-primary)"/><circle cx="36" cy="34" r="2" fill="var(--color-primary)"/></svg> },
    { type: "dictee", name: t("dictee"), color: "#E8C97A", icon: <svg viewBox="0 0 48 48" fill="none"><rect x="8" y="6" width="32" height="36" rx="4" fill="var(--color-text)" stroke="var(--color-primary)" strokeWidth="2"/><path d="M16 16h16M16 24h16M16 32h10" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round"/><circle cx="36" cy="36" r="8" fill="var(--color-primary)"/><path d="M34 36l2 2 4-4" stroke="var(--color-text)" strokeWidth="2" strokeLinecap="round"/></svg> }
  ];
  const hideNav = view === 'game' || view === 'editor' || view === 'results' || modal !== null || logoutConfirm;
  return (
    <div className="app">
      {view === "home" && (
        <div>
          <div className="topbar">
            <div className="site-logo site-logo--boxed" onClick={() => { setView("home"); setMainTab("games"); }}>
              <span className="brand-icon-box"><LogoMark size={26} /></span>
              <h1 className="brand-wordmark"><span className="brand-h">S</span>ADAX</h1>
              <div className="tagline">{t("tagline")}</div>
            </div>
            <div className="topbar-actions">
              {user && <AccountNav user={user} onLogout={() => setLogoutConfirm(true)} />}
            </div>
          </div>
          {mainTab === 'traduire' && (<TranslatePage draft={translatorDraft} setDraft={setTranslatorDraft} />)}
          {mainTab === 'games' && (
            <div className="tab-content">
              {authChecked && !user && totalWords >= 5 && !guestNoticeDismissed && <div className="guest-notice-banner">
                <span className="guest-notice-title">{t("guest_notice_title")}</span>
                <div className="guest-notice-actions">
                  <button type="button" className="guest-notice-button" onClick={() => startLogin("login")}>{t("guest_notice_button")}</button>
                  <button type="button" className="guest-notice-dismiss" onClick={() => { setGuestNoticeDismissed(true); try { localStorage.setItem("vocaflow_guest_notice_dismissed", "1"); } catch {} }}>{t("guest_notice_dismiss")}</button>
                </div>
              </div>}
              <ProfileCard user={user} usage={usage} savedCount={savedWords.length} onAvatarClick={() => document.getElementById("avatar-upload").click()} />
              <input type="file" id="avatar-upload" accept="image/*" style={{ display: "none" }} onChange={e => handleAvatarUpload(e.target.files[0])} />
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
                {currentSet && <div className="game-file-select-panel">
                  <h3 className="game-file-select-title">{t("game_select_files")}</h3>
                  <div className="game-file-select-options">
                    <label className="game-file-select-option"><input type="checkbox" checked={playAllFiles} onChange={e => { setPlayAllFiles(e.target.checked); if (e.target.checked) setSelectedFileIds([]); }} /> {t("game_select_all")}</label>
                    {(currentSet.files || []).map(file => <label key={file.id} className="game-file-select-option"><input type="checkbox" checked={selectedFileIds.includes(file.id)} onChange={e => { setPlayAllFiles(false); setSelectedFileIds(prev => e.target.checked ? [...prev, file.id] : prev.filter(id => id !== file.id)); }} /> {file.name}</label>)}
                  </div>
                  <button type="button" className="game-file-select-start" onClick={() => startGame("flashcards")} disabled={!hasFileSelection || !playableWords.length}>{t("game_start_selected")}</button>
                  {!hasFileSelection && <div className="game-file-select-hint" role="status">{fileSelectionHint}</div>}
                </div>}
                <Sanctuary count={savedWords.length} onPlay={() => startGame("saved")} />
                <div className="games-header-wrap">
                  <h2 className="games-header-title main-page-title"><span className="header-emoji"><GamepadIcon size={28} color="var(--color-primary)" /></span> {t("games")}</h2>
                  <div className="games-header-desc"><RocketIcon size={14} color="var(--color-primary)" /> {t("gamesDesc")}</div>
                </div>
                <div className="games-grid">
                  {games.map(g => (
                    <div key={g.type} className="game-card" role="button" tabIndex={0} onClick={() => startGame(g.type)} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); startGame(g.type); } }}>
                      <div className="game-icon-wrap" style={{ background: `${g.color}20` }}>{g.icon}</div>
                      <div className="game-name">{g.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {mainTab === 'stats' && (<ActivityView usage={usage} totalWords={totalWords} stats={stats} />)}
          {mainTab === 'settings' && (
            <div className="tab-content settings-page">
              <h2 className="main-page-title settings-page-title">{t("settings")}</h2>
              <ProfileCard user={user} usage={usage} savedCount={savedWords.length} onAvatarClick={() => document.getElementById("avatar-upload2").click()} />
              <input type="file" id="avatar-upload2" accept="image/*" style={{ display: "none" }} onChange={e => handleAvatarUpload(e.target.files[0])} />
              <div style={{ marginTop: 20 }}>
                <div className="theme-toggle-row" role="switch" aria-checked={theme === "dark"} aria-label={theme === "light" ? t("darkMode") : t("lightMode")} tabIndex={0} onClick={toggleTheme} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleTheme(); } }}>
                  <span className="theme-toggle-label">{theme === "light" ? <MoonIcon size={20} /> : <SunIcon size={20} />}{theme === "light" ? t("darkMode") : t("lightMode")}</span>
                  <div className={`theme-toggle-switch ${theme === "dark" ? "active" : ""}`} />
                </div>
                {!user ? (
                   <button type="button" className="btn btn-primary btn-block" onClick={() => startLogin("login")} style={{ marginTop: 10 }}>🔐 {t("login")}</button>
                ) : (
                   <div>
                     <button type="button" className="btn btn-secondary btn-block" onClick={() => startLogin("backup")} style={{ marginTop: 10 }}>✉️ {t("backupEmail")}</button>
                     <button type="button" className="btn btn-danger btn-block" onClick={() => setLogoutConfirm(true)} style={{ marginTop: 10 }}>🚪 {t("logout")}</button>
                   </div>
                )}
                <button type="button" className="btn btn-secondary btn-block" onClick={() => setModal("settings")} style={{ marginTop: 10 }}>⚙️ {t("settings")}</button>
              </div>
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
              <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>{t("cancel")}</button>
              <button type="button" className="btn btn-primary" onClick={openEssentialFolder}>📂 {t("openFolder")}</button>
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
              <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>{t("cancel")}</button>
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
              <div className={`tab ${settingsTab === "general" ? "active" : ""}`} onClick={() => setSettingsTab("general")}>🌍 {t("language")}</div>
              <div className={`tab ${settingsTab === "voice" ? "active" : ""}`} onClick={() => setSettingsTab("voice")}><SpeakerIcon size={14} /> {t("voiceSettings")}</div>
              <div className={`tab ${settingsTab === "data" ? "active" : ""}`} onClick={() => setSettingsTab("data")}><BookIcon size={14} color="var(--color-primary)" /> Backup</div>
            </div>
            {settingsTab === "general" && (
              <div><div className="field"><label>🌍 {t("language")}</label><select value={locale} onChange={e => setLocale(e.target.value)}>{langs.map(l => (<option key={l.code} value={l.code}>{l.flag} {l.name}</option>))}</select></div></div>
            )}
            {settingsTab === "voice" && (
              <div>
                <div className="field">
                  <label>⚡ {t("speechRate")}: {voiceSettings.rate.toFixed(2)}</label>
                  <div className="slider-wrap"><span>🐢</span><input type="range" min="0.5" max="1.5" step="0.05" value={voiceSettings.rate} onChange={e => setVoiceSettings({ ...voiceSettings, rate: parseFloat(e.target.value) })} /><span>🐇</span><span className="slider-value">{voiceSettings.rate.toFixed(2)}</span></div>
                </div>
                <div className="field">
                  <label>🎵 {t("pitch")}: {voiceSettings.pitch.toFixed(2)}</label>
                  <div className="slider-wrap"><span>⬇</span><input type="range" min="0.5" max="1.5" step="0.05" value={voiceSettings.pitch} onChange={e => setVoiceSettings({ ...voiceSettings, pitch: parseFloat(e.target.value) })} /><span>⬆</span><span className="slider-value">{voiceSettings.pitch.toFixed(2)}</span></div>
                </div>
              </div>
            )}
            {settingsTab === "data" && (
              <div>
                <div className="field"><label><BookIcon size={14} color="var(--color-primary)" /> {t("exportData")}</label><button type="button" className="btn btn-primary btn-block" onClick={handleExport}>📥 Download Backup</button></div>
                <div className="field"><label><BookIcon size={14} color="var(--color-primary)" /> {t("importData")}</label><div className="file-upload-wrap"><FolderIcon size={18} /> Choose backup file<input type="file" accept=".json" onChange={e => handleImport(e.target.files[0])} /></div></div>
                <div className="field" style={{ marginTop: 20 }}><label>⚠️ {t("resetAll")}</label><button type="button" className="btn btn-danger btn-block" onClick={handleReset}>🗑️ {t("resetAll")}</button></div>
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
            </div>
            <div className="auth-rule" />
            {loginStep === "email" ? (
              <div className="auth-step" key="email-step">
                {otpPurpose === "login" && (
                  <div className="auth-google-wrapper">
                    <div id="google-signin-btn" ref={googleButtonRef} aria-label="Continuer avec Google" />
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
                <div className="otp-email-badge">✉️ {loginData.email}</div>
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
