
const { useState, useEffect, useMemo, useRef, useCallback, createContext, useContext, Component } = React;

class ErrorBoundary extends Component {
constructor(props) { super(props); this.state = { hasError: false }; }
static getDerivedStateFromError() { return { hasError: true }; }
render() {
if (this.state.hasError) return (<div className="error-fallback"><h2><UiIcon name="warning" /> Error</h2><button className="btn btn-primary" onClick={() => window.location.reload()}><RefreshIcon /> Reload</button></div>);
return this.props.children;
}
}

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 9);

const DICTEE_BANK = {
  A1: [
    "Bonjour, comment allez-vous ?",
    "Je m'appelle Marie.",
    "Il fait beau aujourd'hui.",
    "J'aime les pommes rouges.",
    "Où est la gare, s'il vous plaît ?",
    "Nous allons au cinéma ce soir.",
    "Mon frère a un petit chat noir.",
    "Elle habite à Paris avec sa famille.",
    "Je voudrais un café, s'il vous plaît.",
    "L'école commence à huit heures.",
    "Il y a un livre sur la table.",
    "Nous mangeons du pain et du fromage.",
    "Ma mère est très gentille.",
    "Je suis fatigué, je vais dormir.",
    "Merci beaucoup pour votre aide."
  ],
  A2: [
    "Hier, je suis allé au marché pour acheter des légumes frais.",
    "Si tu as froid, tu devrais mettre un manteau chaud.",
    "Nous avons visité un magnifique musée au centre-ville.",
    "Le train pour Lyon part dans exactement dix minutes.",
    "Elle apprend le français depuis deux ans et progresse rapidement.",
    "N'oublie pas de prendre tes clés avant de partir.",
    "Les enfants jouent dans le parc tous les mercredis après-midi.",
    "J'ai perdu mon portefeuille, est-ce que tu l'as vu ?",
    "Il faut tourner à droite au prochain carrefour.",
    "Nous devons finir ce projet avant vendredi prochain.",
    "La météo annonce de la pluie pour tout le week-end.",
    "Peux-tu m'expliquer comment utiliser cette nouvelle machine ?",
    "Ils ont décidé de déménager à la campagne l'année prochaine.",
    "Je préfère lire un bon livre plutôt que de regarder la télévision.",
    "Le médecin lui a conseillé de faire plus d'exercice."
  ],
  B1: [
    "Bien que la pluie ait gâché notre pique-nique, nous avons passé une excellente journée à l'intérieur.",
    "Si j'avais su qu'il venait, j'aurais préparé son gâteau préféré au chocolat.",
    "Il est indispensable de réserver vos billets à l'avance pendant la haute saison touristique.",
    "Les nouvelles technologies ont considérablement modifié notre façon de communiquer au quotidien.",
    "Malgré ses nombreux efforts, il n'a pas réussi à convaincre le jury de son innocence.",
    "L'entreprise pour laquelle je travaille vient d'ouvrir une nouvelle filiale à l'étranger.",
    "Il faudrait que nous réfléchissions sérieusement à l'impact de nos actions sur l'environnement.",
    "En raison des travaux sur la ligne principale, le trafic ferroviaire est fortement perturbé.",
    "C'est le genre de film qui vous fait réfléchir longtemps après avoir quitté la salle.",
    "Elle a décidé de changer de carrière afin de poursuivre sa véritable passion pour la peinture.",
    "Quoique ce sujet soit délicat, il est nécessaire d'en parler ouvertement en famille.",
    "Les bénévoles se sont mobilisés tout le week-end pour nettoyer les plages de la région.",
    "Je te prêterai mon livre à condition que tu me le rendes en parfait état.",
    "La conférence portera sur les enjeux économiques majeurs du vingt et unième siècle.",
    "Il s'est excusé sincèrement pour le malentendu qui a eu lieu hier soir."
  ],
  B2: [
    "Force est de constater que les mesures gouvernementales n'ont pas eu l'effet escompté sur l'inflation.",
    "Quiconque s'aventurerait dans cette forêt dense sans guide expérimenté courrait un danger réel.",
    "L'auteur dresse un portrait sans concession de la société contemporaine dans son dernier roman.",
    "Il va sans dire que la transition énergétique nécessite des investissements colossaux et durables.",
    "Nonobstant les critiques virulentes de l'opposition, le maire a maintenu sa décision controversée.",
    "Les négociations ont abouti à un compromis acceptable pour l'ensemble des parties prenantes.",
    "Cet artiste possède un talent indéniable pour capturer l'essence même de la condition humaine.",
    "Il convient de nuancer ces propos, car la réalité du terrain est souvent bien plus complexe.",
    "Sous réserve de l'approbation du conseil d'administration, le projet sera lancé au printemps.",
    "La recrudescence des cyberattaques soulève des questions cruciales concernant la sécurité des données.",
    "En dépit d'un emploi du temps surchargé, elle trouve toujours le moyen de se consacrer à ses proches.",
    "Le patrimoine architectural de cette ville témoigne de son riche passé historique et culturel.",
    "Il est primordial de sensibiliser les jeunes générations aux enjeux du développement durable.",
    "Cette découverte scientifique pourrait révolutionner notre approche thérapeutique de la maladie.",
    "Loin de se laisser décourager par cet échec, il a redoublé d'efforts pour atteindre son objectif."
  ],
  C1: [
    "L'ubris de ce personnage tragique le conduit inéluctablement à sa propre perte, illustrant la vanité des ambitions humaines.",
    "Les vicissitudes de l'existence n'ont point entamé sa résilience, forgée au creuset d'épreuves maintes fois surmontées.",
    "Cette œuvre littéraire, par sa prose ciselée et sa profondeur psychologique, s'inscrit indéniablement au panthéon des classiques.",
    "L'obsolescence programmée, symptôme d'une société de consommation effrénée, soulève des problématiques éthiques et écologiques majeures.",
    "Il appert que les paradigmes économiques traditionnels peinent à appréhender la complexité des marchés financiers globalisés.",
    "La dialectique hégélienne postule que l'histoire progresse par la synthèse des contradictions qui la traversent.",
    "Nonobstant la pertinence de votre argumentaire, les contraintes budgétaires actuelles rendent ce projet irréalisable à court terme.",
    "L'hermétisme de son discours, loin de clarifier le débat, a davantage obscurci les enjeux réels de cette réforme structurelle.",
    "Les soubresauts géopolitiques contemporains exigent une diplomatie à la fois pragmatique et empreinte d'une vision à long terme.",
    "Ce philosophe pourfend avec une acuité remarquable les dogmes établis, invitant à une remise en question perpétuelle de nos certitudes.",
    "L'avènement de l'intelligence artificielle générative bouleverse irrémédiablement notre rapport à la création et à la propriété intellectuelle.",
    "S'inscrivant en faux contre les idées reçues, cette étude sociologique met en exergue les subtilités des interactions urbaines.",
    "La prégnance des biais cognitifs dans nos processus décisionnels explique en partie la persistance de certaines erreurs stratégiques.",
    "Cet érudit, fort d'une culture encyclopédique, manie l'ironie avec une dextérité qui désarme ses contradicteurs les plus aguerris.",
    "L'ineffabilité de cette expérience mystique échappe par essence aux tentatives de rationalisation ou de mise en mots."
  ],
  C2: [
    "La propension de l'esprit humain à l'apophénie explique notre tendance irrépressible à déceler des schémas là où ne règne que le hasard le plus absolu.",
    "En dépit de la sophistication algorithmique croissante, l'intuition heuristique demeure l'apanage indéfectible de l'intelligence humaine face à l'imprévu.",
    "L'anomie sociale, théorisée par Durkheim, ressurgit avec une acuité particulière à l'aune de la dématérialisation des liens communautaires.",
    "Ce traité d'épistémologie s'attache à déconstruire les présupposés ontologiques qui sous-tendent notre appréhension du réel.",
    "La sérendipité, loin d'être une simple fortune, requiert une sagacité d'esprit capable de saisir la portée d'une anomalie fortuite.",
    "L'herméneutique de ce texte ancien exige une érudition pointue, tant les strates sémantiques s'y entrelacent avec une complexité byzantine.",
    "Les circonvolutions de sa pensée, bien que d'une rigueur implacable, exigent du lecteur une attention de tous les instants pour en saisir la substantifique moelle.",
    "La réification des rapports sociaux, sous l'égide du capitalisme tardif, aliène l'individu en le réduisant à sa stricte valeur d'échange.",
    "Cet écrivain excelle dans l'art de la litote, suggérant avec une pudeur toute classique les tourments les plus indicibles de l'âme humaine.",
    "L'aporie à laquelle conduit ce raisonnement purement déductif souligne les limites inhérentes à toute modélisation formelle du vivant.",
    "La palinodie de ce politicien, loin de relever d'un opportunisme vulgaire, témoigne d'une réévaluation lucide des paradigmes géostratégiques.",
    "S'abîmer dans la contemplation de l'œuvre permet d'en transcender la matérialité pour en saisir la quintessence esthétique et spirituelle.",
    "L'ecdotique de ce manuscrit médiéval a révélé des interpolations tardives qui en modifient substantiellement l'interprétation historique.",
    "Le solipsisme méthodologique, bien que théoriquement séduisant, se heurte inéluctablement à l'altérité irréductible de l'expérience d'autrui.",
    "L'idiosyncrasie de son style, faite d'archaïsmes assumés et de néologismes fulgurants, déroute le critique autant qu'elle fascine le lecteur."
  ]
};

function getDiffResult(userText, correctText) {
  const clean = t => t.toLowerCase().replace(/[-'’`.,\/#!$%\^&\*;:{}=\-_~()]/g, ' ').replace(/\s+/g, ' ').trim();
  const uWords = clean(userText).split(' ');
  const cWords = clean(correctText).split(' ');
  const uOriginal = userText.trim().split(/\s+/);
  const cOriginal = correctText.trim().split(/\s+/);

  const m = uWords.length, n = cWords.length;
  const dp = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = uWords[i-1] === cWords[j-1] ? dp[i-1][j-1] + 1 : Math.max(dp[i-1][j], dp[i][j-1]);
    }
  }

  const ops = [];
  let i = m, j = n;
  while (i > 0 && j > 0) {
    if (uWords[i-1] === cWords[j-1]) { ops.push({ type: 'match', u: i-1, c: j-1 }); i--; j--; }
    else if (dp[i-1][j] >= dp[i][j-1]) { ops.push({ type: 'extra', u: i-1 }); i--; }
    else { ops.push({ type: 'missing', c: j-1 }); j--; }
  }
  while (i > 0) { ops.push({ type: 'extra', u: i-1 }); i--; }
  while (j > 0) { ops.push({ type: 'missing', c: j-1 }); j--; }
  ops.reverse();

  const finalUser = [];
  const finalCorrect = [];
  for (let k = 0; k < ops.length; k++) {
    if (ops[k].type === 'extra' && ops[k+1] && ops[k+1].type === 'missing') {
      finalUser.push({ text: uOriginal[ops[k].u], status: 'wrong' });
      finalCorrect.push({ text: cOriginal[ops[k+1].c], status: 'wrong' });
      k++;
    } else if (ops[k].type === 'missing' && ops[k+1] && ops[k+1].type === 'extra') {
      finalCorrect.push({ text: cOriginal[ops[k].c], status: 'wrong' });
      finalUser.push({ text: uOriginal[ops[k+1].u], status: 'wrong' });
      k++;
    } else if (ops[k].type === 'match') {
      finalUser.push({ text: uOriginal[ops[k].u], status: 'correct' });
      finalCorrect.push({ text: cOriginal[ops[k].c], status: 'correct' });
    } else if (ops[k].type === 'extra') {
      finalUser.push({ text: uOriginal[ops[k].u], status: 'extra' });
    } else if (ops[k].type === 'missing') {
      finalCorrect.push({ text: cOriginal[ops[k].c], status: 'missing' });
    }
  }
  const correctCount = finalUser.filter(w => w.status === 'correct').length;
  const totalWords = cWords.length;
  return { userTokens: finalUser, correctTokens: finalCorrect, correctCount, totalWords };
}

const LANGS = [
  { code: "ar", name: "العربية", flag: "🇸🇦", dir: "rtl" },
  { code: "en", name: "English", flag: "🇬🇧", dir: "ltr" },
  { code: "fr", name: "Français", flag: "🇫🇷", dir: "ltr" },
  { code: "es", name: "Español", flag: "🇪🇸", dir: "ltr" },
  { code: "de", name: "Deutsch", flag: "🇩🇪", dir: "ltr" },
  { code: "pt", name: "Português", flag: "🇵🇹", dir: "ltr" },
  { code: "ja", name: "日本語", flag: "🇯🇵", dir: "ltr" }
];
const getLang = (code) => LANGS.find(l => l.code === code) || LANGS[1];

const LOCALES = {
ar: { appName: "SADAX", tagline: "Speak · Absorb · Discover · Adapt · Xplore", selectSet: "اختر مجموعة", createSet: "إنشاء مجموعة جديدة", search: "ابحث...", edit: "تعديل", delete: "حذف", cancel: "إلغاء", save: "حفظ", setName: "اسم المجموعة", firstLang: "اللغة الأولى", secondLang: "اللغة الثانية", games: "الألعاب", gamesDesc: "اختر لعبتك وابدأ اللعب!", flashcards: "البطاقات", mcq: "اختيار من متعدد", spelling: "الإملاء", matching: "المطابقة", sentenceGame: "جمل تلقائية", sanctuary: "ملجأك الآمن", sanctuarySubtitle: "كلمات محفوظة ثمينة بأمان", preciousWords: "كلمات محفوظة ثمينة", preciousWordSingular: "كلمة محفوظة ثمينة", playSanctuary: "العب بالملجأ", guest: "ضيف", guestNote: "البيانات تُحفظ محلياً فقط.", welcomeBack: "أهلاً بعودتك", welcomeGuest: "أهلاً بك", level: "المستوى", today: "اليوم", saved: "محفوظة", settings: "الإعدادات", logout: "تسجيل الخروج", login: "تسجيل الدخول", name: "الاسم", email: "البريد", close: "إغلاق", correct: "صحيح", wrong: "خطأ", results: "النتائج", retry: "إعادة الكل", retryWrong: "إعادة الخاطئ فقط", home: "الرئيسية", noSet: "لا توجد مجموعات", noWords: "لا توجد كلمات", needSelectSet: "اختر مجموعة أولاً", created: "تم إنشاء المجموعة", deleted: "تم الحذف", savedMsg: "تم الحفظ ✓", addWord: "إضافة كلمة", word: "الكلمة", translation: "الترجمة", add: "إضافة", noSaved: "لا توجد كلمات محفوظة", tapToFlip: "اضغط للتقليب", check: "تحقق", typeWord: "اكتب الكلمة...", listenWrite: "استمع واكتب الكلمة", matchPairs: "طابق الكلمات", time: "الوقت", score: "النقاط", correctAnswers: "الإجابات الصحيحة", wrongWords: "الكلمات الخاطئة", excellent: "ممتاز!", good: "جيد جداً!", fair: "جيد!", tryAgain: "حاول مجدداً", msgExcellent: "أنت نجم!", msgGood: "عمل رائع!", msgFair: "مجهود جيد", msgTryAgain: "لا تستسلم!", of: "من", card: "بطاقة", question: "سؤال", words: "كلمات", confirmDeleteSet: "حذف هذه المجموعة؟", confirmDeleteWord: "حذف هذه الكلمة؟", back: "رجوع", editor: "المحرر", translating: "جاري الترجمة...", darkMode: "الوضع الليلي", lightMode: "الوضع النهاري", theme: "المظهر", voiceSettings: "إعدادات الصوت", speechRate: "سرعة النطق", pitch: "النبرة", language: "اللغة", exportData: "تصدير البيانات", importData: "استيراد البيانات", resetAll: "حذف جميع البيانات", confirmReset: "سيتم حذف جميع البيانات!", dataExported: "تم التصدير ✓", dataImported: "تم الاستيراد ✓", invalidFile: "ملف غير صالح", stats: "الإحصائيات", annualDetails: "التفاصيل السنوية", wordsThisYear: "كلمة هذا العام", timeThisYear: "الوقت هذا العام", daysStreak: "يوم متتالي", reviewedWords: "كلمات مراجعة", newWords: "كلمات جديدة", masteredWords: "كلمات مُتقنة", timeSpent: "الوقت المستغرق", minutes: "دقيقة", totalWords: "إجمالي الكلمات", totalTime: "إجمالي الوقت", changePic: "تغيير الصورة", errorOccurred: "حدث خطأ", wordsAdded: "كلمات مضافة", gamesPlayed: "ألعاب لُعبت", accuracy: "الدقة", streak: "أيام متتالية", noActivity: "لا يوجد نشاط بعد", noActivityDesc: "ابدأ بمراجعة البطاقات لرؤية إحصائياتك الحقيقية!", reviewedToday: "تمت مراجعته اليوم", translate: "ترجمة تلقائية", translatedSuccess: "تمت الترجمة ✓", translationFailed: "فشل الترجمة", context: "السياق", explanation: "الشرح والاستخدام", essentialFolder: "المجلد الأساسي", essentialFolderDesc: "٥٠ كلمة أساسية مترجمة تلقائياً إلى اللغة التي تختارها", openFolder: "فتح المجلد", folderReady: "تم فتح المجلد ✓", sameLangError: "اختر لغتين مختلفتين", dicteeSubtitle: "استمع واكتب ما تسمعه", dicteeDesc: "استمع للجملة ثم اكتبها. اضغط على زر إعادة النطق للاستماع إليها من جديد. عند الانتهاء اضغط تحقق لتصحيح إملائك.", dictee: "إملاء", dicteeTitle: "إملاء", dicteeLoading: "جاري التحميل...", dicteePlaying: "قيد التشغيل", dicteePaused: "متوقف مؤقتاً", dicteeReady: "جاهز", dicteeRewind: "رجوع ٣ ثوان", dicteeForward: "تقديم ٣ ثوان", dicteeReplay: "إعادة النطق", dicteeSlow: "بطيء", dicteePlayPause: "تشغيل / إيقاف", dicteeHint: "تلميح", dicteeShowHint: "إظهار التلميح", dicteeHideHint: "إخفاء التلميح", dicteeClear: "مسح", dicteeWritePlaceholder: "اكتب ما تسمعه...", dicteeCorrect: "تحقق", dicteeYourAnswer: "إجابتك", dicteeCorrection: "التصحيح", dicteeListenAgain: "استمع مجدداً", dicteeNext: "الجولة التالية", dicteeSeeResults: "عرض النتائج", dicteeFinished: "انتهى الإملاء!", dicteeFinalScore: "النتيجة النهائية", dicteeErrorAnalysis: "تحليل الأخطاء", dicteeMissingWords: "كلمات ناقصة", dicteeExtraWords: "كلمات زائدة", dicteeSpellingErrors: "إملاء / تصريف", dicteeDictations: "الإملاءات", dicteeChooseAnotherLevel: "اختر مستوى آخر", dicteeLevel1: "مبتدئ", dicteeLevel2: "أساسي", dicteeLevel3: "متوسط", dicteeLevel4: "متقدم", dicteeLevel5: "خبير", dicteeLevel6: "إتقان", dicteeContinue: "واصل جهدك!", dicteeExcellentMsg: "ممتاز! أنت بطل!", dicteeVeryGoodMsg: "رائع! تحكم جميل!", dicteeGoodMsg: "عمل جيد، واصل!", dicteeNoAudio: "تعذّر تشغيل الصوت، جاري تجربة مصدر آخر..." },
en: { appName: "SADAX", tagline: "Speak · Absorb · Discover · Adapt · Xplore", selectSet: "Select Set", createSet: "Create New Set", search: "Search...", edit: "Edit", delete: "Delete", cancel: "Cancel", save: "Save", setName: "Set name", firstLang: "First language", secondLang: "Second language", games: "Games", gamesDesc: "Choose your game and start playing!", flashcards: "Flashcards", mcq: "Multiple Choice", spelling: "Spelling", matching: "Matching", sentenceGame: "Sentence Game", sanctuary: "Your Sanctuary", sanctuarySubtitle: "Saved precious words in safety", preciousWords: "saved precious words", preciousWordSingular: "saved precious word", playSanctuary: "Play Sanctuary", guest: "Guest", guestNote: "Data saved locally only.", welcomeBack: "Welcome back", welcomeGuest: "Welcome", level: "Level", today: "Today", saved: "Saved", settings: "Settings", logout: "Logout", login: "Login", name: "Name", email: "Email", close: "Close", correct: "Correct", wrong: "Wrong", results: "Results", retry: "Retry All", retryWrong: "Retry Wrong Only", home: "Home", noSet: "No sets", noWords: "No words", needSelectSet: "Please select a set first", created: "Set created", deleted: "Deleted", savedMsg: "Saved ✓", addWord: "Add word", word: "Word", translation: "Translation", add: "Add", noSaved: "No saved words", tapToFlip: "Tap to flip", check: "Check", typeWord: "Type the word...", listenWrite: "Listen and write", matchPairs: "Match the pairs", time: "Time", score: "Score", correctAnswers: "Correct answers", wrongWords: "Wrong words", excellent: "Excellent!", good: "Very good!", fair: "Good!", tryAgain: "Try again", msgExcellent: "You're a star!", msgGood: "Great job!", msgFair: "Good effort", msgTryAgain: "Don't give up!", of: "of", card: "Card", question: "Question", words: "words", confirmDeleteSet: "Delete this set?", confirmDeleteWord: "Delete this word?", back: "Back", editor: "Editor", translating: "Translating...", darkMode: "Dark Mode", lightMode: "Light Mode", theme: "Theme", voiceSettings: "Voice Settings", speechRate: "Speech Rate", pitch: "Pitch", language: "Language", exportData: "Export Data", importData: "Import Data", resetAll: "Reset All Data", confirmReset: "Delete ALL data?", dataExported: "Data exported ✓", dataImported: "Data imported ✓", invalidFile: "Invalid file", stats: "Stats", annualDetails: "Annual Details", wordsThisYear: "words this year", timeThisYear: "time this year", daysStreak: "days", reviewedWords: "Reviewed words", newWords: "New words", masteredWords: "Mastered words", timeSpent: "Time spent", minutes: "min", totalWords: "Total Words", totalTime: "Total Time", changePic: "Change Picture", errorOccurred: "An error occurred", wordsAdded: "Words Added", gamesPlayed: "Games Played", accuracy: "Accuracy", streak: "Day Streak", noActivity: "No activity yet", noActivityDesc: "Start reviewing cards to see your real stats here!", reviewedToday: "Reviewed today", translate: "Auto Translate", translatedSuccess: "Translated ✓", translationFailed: "Translation failed", context: "Context", explanation: "Explanation & Usage", essentialFolder: "Essential Folder", essentialFolderDesc: "50 essential words auto-translated into your chosen language", openFolder: "Open Folder", folderReady: "Folder ready ✓", sameLangError: "Choose two different languages", dicteeSubtitle: "Listen and write what you hear", dicteeDesc: "Listen to the sentence then write it. Press Replay to listen again. When done, press Check to correct your spelling.", dictee: "Dictation", dicteeTitle: "Dictation", dicteeLoading: "Loading...", dicteePlaying: "Playing", dicteePaused: "Paused", dicteeReady: "Ready", dicteeRewind: "Rewind 3s", dicteeForward: "Forward 3s", dicteeReplay: "Replay Sentence", dicteeSlow: "Slow", dicteePlayPause: "Play / Pause", dicteeHint: "Hint", dicteeShowHint: "Show Hint", dicteeHideHint: "Hide Hint", dicteeClear: "Clear", dicteeWritePlaceholder: "Write what you hear...", dicteeCorrect: "Check", dicteeYourAnswer: "Your answer", dicteeCorrection: "Correction", dicteeListenAgain: "Listen again", dicteeNext: "Next Round", dicteeSeeResults: "See results", dicteeFinished: "Dictation complete!", dicteeFinalScore: "Final score", dicteeErrorAnalysis: "Error Analysis", dicteeMissingWords: "Missing words", dicteeExtraWords: "Extra words", dicteeSpellingErrors: "Spelling / Conjugation", dicteeDictations: "Dictations", dicteeChooseAnotherLevel: "Choose another level", dicteeLevel1: "Beginner", dicteeLevel2: "Elementary", dicteeLevel3: "Intermediate", dicteeLevel4: "Advanced", dicteeLevel5: "Expert", dicteeLevel6: "Mastery", dicteeContinue: "Keep going!", dicteeExcellentMsg: "Excellent! You're a champion!", dicteeVeryGoodMsg: "Very good! Great mastery!", dicteeGoodMsg: "Good job, keep going!", dicteeNoAudio: "Audio failed, trying another source..." },
fr: { appName: "SADAX", tagline: "Speak · Absorb · Discover · Adapt · Xplore", selectSet: "Choisir", createSet: "Créer", search: "Rechercher...", edit: "Modifier", delete: "Supprimer", cancel: "Annuler", save: "Enregistrer", setName: "Nom", firstLang: "Première langue", secondLang: "Deuxième langue", games: "Jeux", gamesDesc: "Choisissez votre jeu !", flashcards: "Cartes", mcq: "QCM", spelling: "Orthographe", matching: "Associer", sentenceGame: "Phrases", sanctuary: "Sanctuaire", sanctuarySubtitle: "Mots précieux sauvegardés en sécurité", preciousWords: "mots précieux sauvegardés", preciousWordSingular: "mot précieux sauvegardé", playSanctuary: "Jouer", guest: "Invité", guestNote: "Données locales.", welcomeBack: "Bon retour", welcomeGuest: "Bienvenue", level: "Niveau", today: "Aujourd'hui", saved: "Sauvegardé", settings: "Paramètres", logout: "Déconnexion", login: "Connexion", name: "Nom", email: "Email", close: "Fermer", correct: "Correct", wrong: "Faux", results: "Résultats", retry: "Recommencer", retryWrong: "Incorrects", home: "Accueil", noSet: "Aucun ensemble", noWords: "Aucun mot", needSelectSet: "Sélectionnez un ensemble", created: "Créé", deleted: "Supprimé", savedMsg: "Enregistré ✓", addWord: "Ajouter", word: "Mot", translation: "Traduction", add: "Ajouter", noSaved: "Aucun mot", tapToFlip: "Retourner", check: "Vérifier", typeWord: "Écrivez...", listenWrite: "Écoutez et écrivez", matchPairs: "Associez", time: "Temps", score: "Score", correctAnswers: "Bonnes réponses", wrongWords: "Incorrects", excellent: "Excellent !", good: "Très bien !", fair: "Bien !", tryAgain: "Réessayez", msgExcellent: "Vous êtes une star !", msgGood: "Bon travail !", msgFair: "Bon effort", msgTryAgain: "N'abandonnez pas !", of: "de", card: "Carte", question: "Question", words: "mots", confirmDeleteSet: "Supprimer ?", confirmDeleteWord: "Supprimer ?", back: "Retour", editor: "Éditeur", translating: "Traduction...", darkMode: "Nuit", lightMode: "Jour", theme: "Thème", voiceSettings: "Voix", speechRate: "Vitesse", pitch: "Tonalité", language: "Langue", exportData: "Exporter", importData: "Importer", resetAll: "Tout effacer", confirmReset: "Tout effacer ?", dataExported: "Exporté ✓", dataImported: "Importé ✓", invalidFile: "Invalide", stats: "Stats", annualDetails: "Détails annuels", wordsThisYear: "mots cette année", timeThisYear: "temps cette année", daysStreak: "jours", reviewedWords: "Mots révisés", newWords: "Nouveaux mots", masteredWords: "Mots maîtrisés", timeSpent: "Temps passé", minutes: "min", totalWords: "Total", totalTime: "Temps Total", changePic: "Changer", errorOccurred: "Erreur", wordsAdded: "Mots ajoutés", gamesPlayed: "Parties jouées", accuracy: "Précision", streak: "Jours consécutifs", noActivity: "Aucune activité", noActivityDesc: "Commencez à réviser pour voir vos vraies stats !", reviewedToday: "Révisés aujourd'hui", translate: "Traduire", translatedSuccess: "Traduit ✓", translationFailed: "Échec de la traduction", context: "Contexte", explanation: "Explication", essentialFolder: "Dossier essentiel", essentialFolderDesc: "50 mots essentiels traduits automatiquement dans la langue choisie", openFolder: "Ouvrir le dossier", folderReady: "Dossier prêt ✓", sameLangError: "Choisissez deux langues différentes", dicteeSubtitle: "Écoutez et écrivez ce que vous entendez", dicteeDesc: "Écoutez la phrase puis écrivez-la. Appuyez sur Rejouer pour la réécouter. Quand vous avez terminé, appuyez sur Corriger.", dictee: "Dictée", dicteeTitle: "Dictée", dicteeLoading: "Chargement...", dicteePlaying: "Lecture en cours", dicteePaused: "En pause", dicteeReady: "Prêt", dicteeRewind: "Reculer 3s", dicteeForward: "Avancer 3s", dicteeReplay: "Rejouer la phrase", dicteeSlow: "Lent", dicteePlayPause: "Lecture / Pause", dicteeHint: "Indice", dicteeShowHint: "Afficher l'indice", dicteeHideHint: "Masquer l'indice", dicteeClear: "Effacer", dicteeWritePlaceholder: "Écrivez ce que vous entendez...", dicteeCorrect: "Corriger", dicteeYourAnswer: "Votre réponse", dicteeCorrection: "Correction", dicteeListenAgain: "Réécouter", dicteeNext: "Manche suivante", dicteeSeeResults: "Voir les résultats", dicteeFinished: "Dictée terminée !", dicteeFinalScore: "Score final", dicteeErrorAnalysis: "Analyse des erreurs", dicteeMissingWords: "Mots manquants", dicteeExtraWords: "Mots en trop", dicteeSpellingErrors: "Orthographe / Conjugaison", dicteeDictations: "Dictées", dicteeChooseAnotherLevel: "Choisir un autre niveau", dicteeLevel1: "Débutant", dicteeLevel2: "Élémentaire", dicteeLevel3: "Intermédiaire", dicteeLevel4: "Avancé", dicteeLevel5: "Expert", dicteeLevel6: "Maîtrise", dicteeContinue: "Continuez vos efforts !", dicteeExcellentMsg: "Excellent ! Vous êtes un champion !", dicteeVeryGoodMsg: "Très bien ! Belle maîtrise !", dicteeGoodMsg: "Bon travail, continuez !", dicteeNoAudio: "Audio indisponible, essai d'une autre source..." },
es: { appName: "SADAX", tagline: "Speak · Absorb · Discover · Adapt · Xplore", selectSet: "Seleccionar", createSet: "Crear", search: "Buscar...", edit: "Editar", delete: "Eliminar", cancel: "Cancelar", save: "Guardar", setName: "Nombre", firstLang: "Primer idioma", secondLang: "Segundo idioma", games: "Juegos", gamesDesc: "¡Elige tu juego!", flashcards: "Tarjetas", mcq: "Opción Múltiple", spelling: "Ortografía", matching: "Emparejar", sentenceGame: "Frases", sanctuary: "Santuario", sanctuarySubtitle: "Palabras guardadas seguras", preciousWords: "palabras preciosas guardadas", preciousWordSingular: "palabra preciosa guardada", playSanctuary: "Jugar", guest: "Invitado", guestNote: "Datos locales.", welcomeBack: "Bienvenido", welcomeGuest: "Bienvenido", level: "Nivel", today: "Hoy", saved: "Guardado", settings: "Ajustes", logout: "Salir", login: "Entrar", name: "Nombre", email: "Correo", close: "Cerrar", correct: "Correcto", wrong: "Incorrecto", results: "Resultados", retry: "Reintentar", retryWrong: "Incorrectas", home: "Inicio", noSet: "Sin conjuntos", noWords: "Sin palabras", needSelectSet: "Selecciona un conjunto", created: "Creado", deleted: "Eliminado", savedMsg: "Guardado ✓", addWord: "Añadir palabra", word: "Palabra", translation: "Traducción", add: "Añadir", noSaved: "Sin palabras guardadas", tapToFlip: "Toca para girar", check: "Verificar", typeWord: "Escribe...", listenWrite: "Escucha y escribe", matchPairs: "Empareja", time: "Tiempo", score: "Puntos", correctAnswers: "Correctas", wrongWords: "Incorrectas", excellent: "¡Excelente!", good: "¡Muy bien!", fair: "¡Bien!", tryAgain: "¡Inténtalo!", msgExcellent: "¡Eres una estrella!", msgGood: "¡Buen trabajo!", msgFair: "Buen esfuerzo", msgTryAgain: "¡No te rindas!", of: "de", card: "Tarjeta", question: "Pregunta", words: "palabras", confirmDeleteSet: "¿Eliminar?", confirmDeleteWord: "¿Eliminar?", back: "Atrás", editor: "Editor", translating: "Traduciendo...", darkMode: "Noche", lightMode: "Día", theme: "Tema", voiceSettings: "Voz", speechRate: "Velocidad", pitch: "Tono", language: "Idioma", exportData: "Exportar", importData: "Importar", resetAll: "Borrar todo", confirmReset: "¿Borrar todo?", dataExported: "Exportado ✓", dataImported: "Importado ✓", invalidFile: "Inválido", stats: "Estadísticas", annualDetails: "Detalles anuales", wordsThisYear: "palabras este año", timeThisYear: "tiempo este año", daysStreak: "días", reviewedWords: "Palabras revisadas", newWords: "Nuevas palabras", masteredWords: "Dominadas", timeSpent: "Tiempo", minutes: "min", totalWords: "Total", totalTime: "Tiempo Total", changePic: "Cambiar", errorOccurred: "Error", wordsAdded: "Añadidas", gamesPlayed: "Partidas", accuracy: "Precisión", streak: "Racha", noActivity: "Sin actividad", noActivityDesc: "¡Empieza a revisar para ver estadísticas!", reviewedToday: "Revisadas hoy", translate: "Traducir", translatedSuccess: "Traducido ✓", translationFailed: "Error", context: "Contexto", explanation: "Explicación", essentialFolder: "Carpeta esencial", essentialFolderDesc: "50 palabras esenciales traducidas al idioma elegido", openFolder: "Abrir carpeta", folderReady: "Carpeta lista ✓", sameLangError: "Elige dos idiomas diferentes", dicteeSubtitle: "Escucha y escribe lo que oyes", dicteeDesc: "Escucha la frase y escríbela. Pulsa Replay para escucharla de nuevo. Al terminar, pulsa Verificar.", dictee: "Dictado", dicteeTitle: "Dictado", dicteeLoading: "Cargando...", dicteePlaying: "Reproduciendo", dicteePaused: "En pausa", dicteeReady: "Listo", dicteeRewind: "Retroceder 3s", dicteeForward: "Avanzar 3s", dicteeReplay: "Repetir frase", dicteeSlow: "Lento", dicteePlayPause: "Reproducir / Pausa", dicteeHint: "Pista", dicteeShowHint: "Mostrar pista", dicteeHideHint: "Ocultar pista", dicteeClear: "Borrar", dicteeWritePlaceholder: "Escribe lo que oyes...", dicteeCorrect: "Verificar", dicteeYourAnswer: "Tu respuesta", dicteeCorrection: "Corrección", dicteeListenAgain: "Escuchar de nuevo", dicteeNext: "Siguiente ronda", dicteeSeeResults: "Ver resultados", dicteeFinished: "¡Dictado terminado!", dicteeFinalScore: "Puntuación final", dicteeErrorAnalysis: "Análisis de errores", dicteeMissingWords: "Palabras faltantes", dicteeExtraWords: "Palabras extra", dicteeSpellingErrors: "Ortografía / Conjugación", dicteeDictations: "Dictados", dicteeChooseAnotherLevel: "Elegir otro nivel", dicteeLevel1: "Principiante", dicteeLevel2: "Elemental", dicteeLevel3: "Intermedio", dicteeLevel4: "Avanzado", dicteeLevel5: "Experto", dicteeLevel6: "Maestría", dicteeContinue: "¡Sigue así!", dicteeExcellentMsg: "¡Excelente! ¡Eres un campeón!", dicteeVeryGoodMsg: "¡Muy bien! ¡Buen dominio!", dicteeGoodMsg: "¡Buen trabajo, sigue!", dicteeNoAudio: "Audio no disponible, probando otra fuente..." },
de: { appName: "SADAX", tagline: "Speak · Absorb · Discover · Adapt · Xplore", selectSet: "Auswählen", createSet: "Neu erstellen", search: "Suchen...", edit: "Bearbeiten", delete: "Löschen", cancel: "Abbrechen", save: "Speichern", setName: "Name", firstLang: "Erste Sprache", secondLang: "Zweite Sprache", games: "Spiele", gamesDesc: "Wähle ein Spiel!", flashcards: "Karten", mcq: "Multiple Choice", spelling: "Rechtschreibung", matching: "Zuordnen", sentenceGame: "Sätze", sanctuary: "Heiligtum", sanctuarySubtitle: "Sicher gespeicherte Wörter", preciousWords: "gespeicherte kostbare Wörter", preciousWordSingular: "gespeichertes kostbares Wort", playSanctuary: "Spielen", guest: "Gast", guestNote: "Lokale Daten.", welcomeBack: "Willkommen", welcomeGuest: "Willkommen", level: "Level", today: "Heute", saved: "Gespeichert", settings: "Einstellungen", logout: "Abmelden", login: "Anmelden", name: "Name", email: "E-Mail", close: "Schließen", correct: "Richtig", wrong: "Falsch", results: "Ergebnisse", retry: "Wiederholen", retryWrong: "Nur Fehler", home: "Start", noSet: "Keine Sets", noWords: "Keine Wörter", needSelectSet: "Wähle ein Set", created: "Erstellt", deleted: "Gelöscht", savedMsg: "Gespeichert ✓", addWord: "Wort hinzufügen", word: "Wort", translation: "Übersetzung", add: "Hinzufügen", noSaved: "Keine gespeicherten Wörter", tapToFlip: "Zum Drehen tippen", check: "Prüfen", typeWord: "Schreibe...", listenWrite: "Höre und schreibe", matchPairs: "Zuordnen", time: "Zeit", score: "Punkte", correctAnswers: "Richtige", wrongWords: "Falsche", excellent: "Ausgezeichnet!", good: "Sehr gut!", fair: "Gut!", tryAgain: "Nochmal!", msgExcellent: "Du bist ein Star!", msgGood: "Tolle Arbeit!", msgFair: "Guter Versuch", msgTryAgain: "Gib nicht auf!", of: "von", card: "Karte", question: "Frage", words: "Wörter", confirmDeleteSet: "Löschen?", confirmDeleteWord: "Löschen?", back: "Zurück", editor: "Editor", translating: "Übersetze...", darkMode: "Nacht", lightMode: "Tag", theme: "Thema", voiceSettings: "Stimme", speechRate: "Geschwindigkeit", pitch: "Tonhöhe", language: "Sprache", exportData: "Exportieren", importData: "Importieren", resetAll: "Alles löschen", confirmReset: "Alles löschen?", dataExported: "Exportiert ✓", dataImported: "Importiert ✓", invalidFile: "Ungültig", stats: "Statistiken", annualDetails: "Jahresdetails", wordsThisYear: "Wörter dieses Jahr", timeThisYear: "Zeit dieses Jahr", daysStreak: "Tage", reviewedWords: "Überprüfte Wörter", newWords: "Neue Wörter", masteredWords: "Beherrschte Wörter", timeSpent: "Verbrachte Zeit", minutes: "Min", totalWords: "Gesamt", totalTime: "Gesamtzeit", changePic: "Ändern", errorOccurred: "Fehler", wordsAdded: "Hinzugefügt", gamesPlayed: "Spiele", accuracy: "Genauigkeit", streak: "Serie", noActivity: "Keine Aktivität", noActivityDesc: "Beginne zu wiederholen!", reviewedToday: "Heute überprüft", translate: "Übersetzen", translatedSuccess: "Übersetzt ✓", translationFailed: "Fehler", context: "Kontext", explanation: "Erklärung", essentialFolder: "Wichtiger Ordner", essentialFolderDesc: "50 wichtige Wörter automatisch übersetzt", openFolder: "Ordner öffnen", folderReady: "Ordner bereit ✓", sameLangError: "Wähle zwei verschiedene Sprachen", dicteeSubtitle: "Höre zu und schreibe", dicteeDesc: "Höre den Satz und schreibe ihn. Drücke Replay, um ihn erneut zu hören. Wenn fertig, auf Prüfen drücken.", dictee: "Diktat", dicteeTitle: "Diktat", dicteeLoading: "Lädt...", dicteePlaying: "Wiedergabe", dicteePaused: "Pausiert", dicteeReady: "Bereit", dicteeRewind: "3s zurück", dicteeForward: "3s vor", dicteeReplay: "Satz wiederholen", dicteeSlow: "Langsam", dicteePlayPause: "Play / Pause", dicteeHint: "Tipp", dicteeShowHint: "Tipp zeigen", dicteeHideHint: "Tipp verbergen", dicteeClear: "Löschen", dicteeWritePlaceholder: "Schreibe, was du hörst...", dicteeCorrect: "Prüfen", dicteeYourAnswer: "Deine Antwort", dicteeCorrection: "Korrektur", dicteeListenAgain: "Nochmal hören", dicteeNext: "Nächste Runde", dicteeSeeResults: "Ergebnisse", dicteeFinished: "Diktat beendet!", dicteeFinalScore: "Endpunktzahl", dicteeErrorAnalysis: "Fehleranalyse", dicteeMissingWords: "Fehlende Wörter", dicteeExtraWords: "Zusätzliche Wörter", dicteeSpellingErrors: "Rechtschreibung / Konjugation", dicteeDictations: "Diktate", dicteeChooseAnotherLevel: "Anderes Level", dicteeLevel1: "Anfänger", dicteeLevel2: "Grundstufe", dicteeLevel3: "Mittelstufe", dicteeLevel4: "Fortgeschritten", dicteeLevel5: "Experte", dicteeLevel6: "Meisterschaft", dicteeContinue: "Weiter so!", dicteeExcellentMsg: "Ausgezeichnet! Du bist ein Champion!", dicteeVeryGoodMsg: "Sehr gut! Tolle Beherrschung!", dicteeGoodMsg: "Gute Arbeit, weiter!", dicteeNoAudio: "Audio nicht verfügbar, versuche andere Quelle..." },
pt: { appName: "SADAX", tagline: "Speak · Absorb · Discover · Adapt · Xplore", selectSet: "Selecionar", createSet: "Criar", search: "Procurar...", edit: "Editar", delete: "Excluir", cancel: "Cancelar", save: "Salvar", setName: "Nome", firstLang: "Primeira língua", secondLang: "Segunda língua", games: "Jogos", gamesDesc: "Escolha o jogo!", flashcards: "Cartões", mcq: "Múltipla Escolha", spelling: "Ortografia", matching: "Emparelhar", sentenceGame: "Frases", sanctuary: "Santuário", sanctuarySubtitle: "Palavras guardadas em segurança", preciousWords: "palavras preciosas guardadas", preciousWordSingular: "palavra preciosa guardada", playSanctuary: "Jogar", guest: "Convidado", guestNote: "Dados locais.", welcomeBack: "Bem-vindo", welcomeGuest: "Bem-vindo", level: "Nível", today: "Hoje", saved: "Guardado", settings: "Configurações", logout: "Sair", login: "Entrar", name: "Nome", email: "Email", close: "Fechar", correct: "Certo", wrong: "Errado", results: "Resultados", retry: "Tentar de novo", retryWrong: "Só erradas", home: "Início", noSet: "Sem conjuntos", noWords: "Sem palavras", needSelectSet: "Selecione um conjunto", created: "Criado", deleted: "Excluído", savedMsg: "Salvo ✓", addWord: "Adicionar palavra", word: "Palavra", translation: "Tradução", add: "Adicionar", noSaved: "Sem palavras guardadas", tapToFlip: "Toque para virar", check: "Verificar", typeWord: "Escreva...", listenWrite: "Ouça e escreva", matchPairs: "Emparelhe", time: "Tempo", score: "Pontos", correctAnswers: "Certas", wrongWords: "Erradas", excellent: "Excelente!", good: "Muito bom!", fair: "Bom!", tryAgain: "Tente novamente", msgExcellent: "Você é uma estrela!", msgGood: "Bom trabalho!", msgFair: "Bom esforço", msgTryAgain: "Não desista!", of: "de", card: "Cartão", question: "Pergunta", words: "palavras", confirmDeleteSet: "Excluir?", confirmDeleteWord: "Excluir?", back: "Voltar", editor: "Editor", translating: "Traduzindo...", darkMode: "Noite", lightMode: "Dia", theme: "Tema", voiceSettings: "Voz", speechRate: "Velocidade", pitch: "Tom", language: "Língua", exportData: "Exportar", importData: "Importar", resetAll: "Apagar tudo", confirmReset: "Apagar tudo?", dataExported: "Exportado ✓", dataImported: "Importado ✓", invalidFile: "Inválido", stats: "Estatísticas", annualDetails: "Detalhes anuais", wordsThisYear: "palavras este ano", timeThisYear: "tempo este ano", daysStreak: "dias", reviewedWords: "Palavras revisadas", newWords: "Novas palavras", masteredWords: "Dominadas", timeSpent: "Tempo", minutes: "min", totalWords: "Total", totalTime: "Tempo Total", changePic: "Mudar", errorOccurred: "Erro", wordsAdded: "Adicionadas", gamesPlayed: "Jogos", accuracy: "Precisão", streak: "Sequência", noActivity: "Sem atividade", noActivityDesc: "Comece a revisar para ver estatísticas!", reviewedToday: "Revisadas hoje", translate: "Traduzir", translatedSuccess: "Traduzido ✓", translationFailed: "Erro", context: "Contexto", explanation: "Explicação", essentialFolder: "Pasta essencial", essentialFolderDesc: "50 palavras essenciais traduzidas automaticamente", openFolder: "Abrir pasta", folderReady: "Pasta pronta ✓", sameLangError: "Escolha dois idiomas diferentes", dicteeSubtitle: "Ouça e escreva o que ouve", dicteeDesc: "Ouça a frase e escreva-a. Pressione Replay para ouvi-la novamente. No final, pressione Verificar.", dictee: "Ditado", dicteeTitle: "Ditado", dicteeLoading: "Carregando...", dicteePlaying: "Reproduzindo", dicteePaused: "Pausado", dicteeReady: "Pronto", dicteeRewind: "Voltar 3s", dicteeForward: "Avançar 3s", dicteeReplay: "Repetir frase", dicteeSlow: "Lento", dicteePlayPause: "Reproduzir / Pausar", dicteeHint: "Dica", dicteeShowHint: "Mostrar dica", dicteeHideHint: "Ocultar dica", dicteeClear: "Limpar", dicteeWritePlaceholder: "Escreva o que ouve...", dicteeCorrect: "Verificar", dicteeYourAnswer: "Sua resposta", dicteeCorrection: "Correção", dicteeListenAgain: "Ouvir de novo", dicteeNext: "Próxima rodada", dicteeSeeResults: "Ver resultados", dicteeFinished: "Ditado concluído!", dicteeFinalScore: "Pontuação final", dicteeErrorAnalysis: "Análise de erros", dicteeMissingWords: "Palavras faltantes", dicteeExtraWords: "Palavras extras", dicteeSpellingErrors: "Ortografia / Conjugação", dicteeDictations: "Ditados", dicteeChooseAnotherLevel: "Escolher outro nível", dicteeLevel1: "Iniciante", dicteeLevel2: "Elementar", dicteeLevel3: "Intermediário", dicteeLevel4: "Avançado", dicteeLevel5: "Especialista", dicteeLevel6: "Maestria", dicteeContinue: "Continue assim!", dicteeExcellentMsg: "Excelente! Você é um campeão!", dicteeVeryGoodMsg: "Muito bom! Ótimo domínio!", dicteeGoodMsg: "Bom trabalho, continue!", dicteeNoAudio: "Áudio indisponível, tentando outra fonte..." },
ja: { appName: "SADAX", tagline: "Speak · Absorb · Discover · Adapt · Xplore", selectSet: "セットを選択", createSet: "新規作成", search: "検索...", edit: "編集", delete: "削除", cancel: "キャンセル", save: "保存", setName: "セット名", firstLang: "第一言語", secondLang: "第二言語", games: "ゲーム", gamesDesc: "ゲームを選んで始めよう！", flashcards: "カード", mcq: "多肢選択", spelling: "スペル", matching: "マッチング", sentenceGame: "文章", sanctuary: "聖域", sanctuarySubtitle: "大切な単語を安全に保存", preciousWords: "保存された大切な単語", preciousWordSingular: "保存された大切な単語", playSanctuary: "プレイ", guest: "ゲスト", guestNote: "ローカル保存のみ。", welcomeBack: "おかえりなさい", welcomeGuest: "ようこそ", level: "レベル", today: "今日", saved: "保存済", settings: "設定", logout: "ログアウト", login: "ログイン", name: "名前", email: "メール", close: "閉じる", correct: "正解", wrong: "不正解", results: "結果", retry: "もう一度", retryWrong: "間違いのみ", home: "ホーム", noSet: "セットなし", noWords: "単語なし", needSelectSet: "セットを選択してください", created: "作成しました", deleted: "削除しました", savedMsg: "保存しました ✓", addWord: "単語を追加", word: "単語", translation: "翻訳", add: "追加", noSaved: "保存された単語なし", tapToFlip: "タップして裏返す", check: "確認", typeWord: "入力...", listenWrite: "聞いて書く", matchPairs: "ペアを合わせる", time: "時間", score: "スコア", correctAnswers: "正解数", wrongWords: "間違い", excellent: "素晴らしい！", good: "とても良い！", fair: "良い！", tryAgain: "もう一度！", msgExcellent: "スターです！", msgGood: "素晴らしい！", msgFair: "良い努力", msgTryAgain: "諦めないで！", of: "/", card: "カード", question: "問題", words: "単語", confirmDeleteSet: "削除しますか？", confirmDeleteWord: "削除しますか？", back: "戻る", editor: "編集", translating: "翻訳中...", darkMode: "ダーク", lightMode: "ライト", theme: "テーマ", voiceSettings: "音声設定", speechRate: "速度", pitch: "ピッチ", language: "言語", exportData: "エクスポート", importData: "インポート", resetAll: "全削除", confirmReset: "全て削除しますか？", dataExported: "エクスポート完了 ✓", dataImported: "インポート完了 ✓", invalidFile: "無効なファイル", stats: "統計", annualDetails: "年間詳細", wordsThisYear: "今年の単語", timeThisYear: "今年の時間", daysStreak: "日", reviewedWords: "復習した単語", newWords: "新しい単語", masteredWords: "習得した単語", timeSpent: "費やした時間", minutes: "分", totalWords: "総単語数", totalTime: "総時間", changePic: "変更", errorOccurred: "エラー", wordsAdded: "追加した単語", gamesPlayed: "プレイ数", accuracy: "正確さ", streak: "連続日数", noActivity: "アクティビティなし", noActivityDesc: "カードを復習して統計を見ましょう！", reviewedToday: "今日の復習", translate: "翻訳", translatedSuccess: "翻訳完了 ✓", translationFailed: "翻訳失敗", context: "文脈", explanation: "説明", essentialFolder: "重要フォルダ", essentialFolderDesc: "50個の重要単語を自動翻訳", openFolder: "フォルダを開く", folderReady: "準備完了 ✓", sameLangError: "異なる言語を選択してください", dicteeSubtitle: "聞いて書いてください", dicteeDesc: "文を聞いて書きます。もう一度聞くにはリプレイを押します。終わったら確認を押してください。", dictee: "ディクテーション", dicteeTitle: "ディクテーション", dicteeLoading: "読み込み中...", dicteePlaying: "再生中", dicteePaused: "一時停止", dicteeReady: "準備完了", dicteeRewind: "3秒戻す", dicteeForward: "3秒進める", dicteeReplay: "文を再度再生", dicteeSlow: "ゆっくり", dicteePlayPause: "再生 / 一時停止", dicteeHint: "ヒント", dicteeShowHint: "ヒントを表示", dicteeHideHint: "ヒントを隠す", dicteeClear: "クリア", dicteeWritePlaceholder: "聞こえたことを書いてください...", dicteeCorrect: "確認", dicteeYourAnswer: "あなたの回答", dicteeCorrection: "訂正", dicteeListenAgain: "もう一度聞く", dicteeNext: "次のラウンド", dicteeSeeResults: "結果を見る", dicteeFinished: "ディクテーション完了！", dicteeFinalScore: "最終スコア", dicteeErrorAnalysis: "エラー分析", dicteeMissingWords: "不足単語", dicteeExtraWords: "余分な単語", dicteeSpellingErrors: "スペル / 活用", dicteeDictations: "ディクテーション", dicteeChooseAnotherLevel: "別のレベルを選ぶ", dicteeLevel1: "初級", dicteeLevel2: "基礎", dicteeLevel3: "中級", dicteeLevel4: "上級", dicteeLevel5: "エキスパート", dicteeLevel6: "マスター", dicteeContinue: "頑張って！", dicteeExcellentMsg: "素晴らしい！チャンピオン！", dicteeVeryGoodMsg: "とても良い！見事！", dicteeGoodMsg: "良い仕事、続けて！", dicteeNoAudio: "音声を利用できません。別のソースを試します..." }
};

const DICTEE_UI_COPY = {
  ar: { dicteeSpeedLabel: "سرعة النطق", dicteePreviousAria: "الإملاء السابق", dicteeSelectAria: "اختيار الإملاء", dicteeNextAria: "الإملاء التالي", dicteeBackFive: "رجوع 5 ثوانٍ", dicteeForwardFive: "تقديم 5 ثوانٍ" },
  en: { dicteeSpeedLabel: "Playback speed", dicteePreviousAria: "Previous dictation", dicteeSelectAria: "Select dictation", dicteeNextAria: "Next dictation", dicteeBackFive: "Rewind 5 seconds", dicteeForwardFive: "Forward 5 seconds" },
  fr: { dicteeSpeedLabel: "Vitesse de lecture", dicteePreviousAria: "Dictée précédente", dicteeSelectAria: "Choisir une dictée", dicteeNextAria: "Dictée suivante", dicteeBackFive: "Reculer de 5 secondes", dicteeForwardFive: "Avancer de 5 secondes" },
  es: { dicteeSpeedLabel: "Velocidad de reproducción", dicteePreviousAria: "Dictado anterior", dicteeSelectAria: "Seleccionar dictado", dicteeNextAria: "Siguiente dictado", dicteeBackFive: "Retroceder 5 segundos", dicteeForwardFive: "Avanzar 5 segundos" },
  de: { dicteeSpeedLabel: "Wiedergabegeschwindigkeit", dicteePreviousAria: "Vorheriges Diktat", dicteeSelectAria: "Diktat auswählen", dicteeNextAria: "Nächstes Diktat", dicteeBackFive: "5 Sekunden zurück", dicteeForwardFive: "5 Sekunden vor" },
  pt: { dicteeSpeedLabel: "Velocidade de reprodução", dicteePreviousAria: "Ditado anterior", dicteeSelectAria: "Selecionar ditado", dicteeNextAria: "Próximo ditado", dicteeBackFive: "Recuar 5 segundos", dicteeForwardFive: "Avançar 5 segundos" },
  ja: { dicteeSpeedLabel: "再生速度", dicteePreviousAria: "前のディクテーション", dicteeSelectAria: "ディクテーションを選択", dicteeNextAria: "次のディクテーション", dicteeBackFive: "5秒戻す", dicteeForwardFive: "5秒進める" }
};
Object.keys(DICTEE_UI_COPY).forEach(code => Object.assign(LOCALES[code], DICTEE_UI_COPY[code]));

const VOICE_INPUT_COPY = {
  ar: { voiceInput: "تحدث لإضافة الكلمة", voiceListening: "جارٍ الاستماع...", voiceUnsupported: "الإملاء الصوتي غير متاح في هذا المتصفح", voicePermission: "اسمح بالوصول إلى الميكروفون لاستخدام الإملاء الصوتي" },
  en: { voiceInput: "Speak to add the word", voiceListening: "Listening...", voiceUnsupported: "Voice input is not supported in this browser", voicePermission: "Allow microphone access to use voice input" },
  fr: { voiceInput: "Parlez pour ajouter le mot", voiceListening: "Écoute en cours...", voiceUnsupported: "La saisie vocale n'est pas prise en charge", voicePermission: "Autorisez le microphone pour utiliser la saisie vocale" },
  es: { voiceInput: "Habla para añadir la palabra", voiceListening: "Escuchando...", voiceUnsupported: "La entrada de voz no es compatible", voicePermission: "Permite el acceso al micrófono para usar la voz" },
  de: { voiceInput: "Sprechen, um das Wort hinzuzufügen", voiceListening: "Höre zu...", voiceUnsupported: "Spracheingabe wird in diesem Browser nicht unterstützt", voicePermission: "Erlaube den Mikrofonzugriff für die Spracheingabe" },
  pt: { voiceInput: "Fale para adicionar a palavra", voiceListening: "A ouvir...", voiceUnsupported: "A entrada de voz não é suportada", voicePermission: "Permita o acesso ao microfone para usar a voz" },
  ja: { voiceInput: "話して単語を追加", voiceListening: "聞き取り中...", voiceUnsupported: "このブラウザは音声入力に対応していません", voicePermission: "音声入力にはマイクへのアクセスを許可してください" }
};
Object.keys(VOICE_INPUT_COPY).forEach(code => { if (LOCALES[code]) Object.assign(LOCALES[code], VOICE_INPUT_COPY[code]); });
const AUTH_COPY = {
  ar: { emailOtp: "الدخول بالبريد الإلكتروني", emailOtpIntro: "أدخل بريدك الإلكتروني وسنرسل رمزاً من 6 أرقام صالحاً لمدة 10 دقائق.", sendCode: "إرسال الرمز", checkInbox: "تحقق من بريدك الوارد", codeSentTo: "أرسلنا الرمز إلى", enterCode: "أدخل رمز التحقق", verifyCode: "تحقق من الرمز", resendCode: "إعادة إرسال الرمز", resendIn: "يمكن إعادة الإرسال بعد", seconds: "ثانية", changeEmail: "تغيير البريد", expiredCode: "انتهت صلاحية الرمز. اطلب رمزاً جديداً.", invalidCode: "الرمز غير صحيح. المحاولات المتبقية", tooManyAttempts: "تم إيقاف المحاولات لمدة 30 دقيقة.", invalidEmail: "أدخل بريداً إلكترونياً صحيحاً.", otpNetworkError: "تعذر الاتصال بالخادم. حاول مرة أخرى.", googleLogin: "المتابعة باستخدام Google", or: "أو", backupEmail: "إضافة بريد احتياطي", backupEmailIntro: "أثبت بريداً احتياطياً للوصول إلى حسابك بالبريد أو Google." },
  en: { emailOtp: "Continue with email", emailOtpIntro: "Enter your email and we’ll send a 6-digit code valid for 10 minutes.", sendCode: "Send code", checkInbox: "Check your inbox", codeSentTo: "We sent a code to", enterCode: "Enter verification code", verifyCode: "Verify code", resendCode: "Resend code", resendIn: "You can resend in", seconds: "seconds", changeEmail: "Change email", expiredCode: "The code expired. Request a new one.", invalidCode: "Incorrect code. Attempts remaining", tooManyAttempts: "Too many attempts. Try again in 30 minutes.", invalidEmail: "Enter a valid email address.", otpNetworkError: "Could not reach the server. Try again.", googleLogin: "Continue with Google", or: "or", backupEmail: "Add backup email", backupEmailIntro: "Verify a backup email so you can access this account with email or Google." },
  fr: { emailOtp: "Continuer avec l’e-mail", emailOtpIntro: "Saisissez votre e-mail et nous enverrons un code à 6 chiffres valable 10 minutes.", sendCode: "Envoyer le code", checkInbox: "Vérifiez votre boîte mail", codeSentTo: "Nous avons envoyé un code à", enterCode: "Saisissez le code", verifyCode: "Vérifier le code", resendCode: "Renvoyer le code", resendIn: "Vous pourrez renvoyer dans", seconds: "secondes", changeEmail: "Changer d’e-mail", expiredCode: "Le code a expiré. Demandez-en un nouveau.", invalidCode: "Code incorrect. Essais restants", tooManyAttempts: "Trop de tentatives. Réessayez dans 30 minutes.", invalidEmail: "Saisissez un e-mail valide.", otpNetworkError: "Serveur inaccessible. Réessayez.", googleLogin: "Continuer avec Google", or: "ou", backupEmail: "Ajouter un e-mail de secours", backupEmailIntro: "Vérifiez un e-mail de secours pour accéder au compte par e-mail ou Google." },
  es: { emailOtp: "Continuar con email", emailOtpIntro: "Introduce tu email y enviaremos un código de 6 dígitos válido durante 10 minutos.", sendCode: "Enviar código", checkInbox: "Revisa tu bandeja de entrada", codeSentTo: "Enviamos un código a", enterCode: "Introduce el código", verifyCode: "Verificar código", resendCode: "Reenviar código", resendIn: "Puedes reenviar en", seconds: "segundos", changeEmail: "Cambiar email", expiredCode: "El código ha caducado. Solicita uno nuevo.", invalidCode: "Código incorrecto. Intentos restantes", tooManyAttempts: "Demasiados intentos. Prueba de nuevo en 30 minutos.", invalidEmail: "Introduce un email válido.", otpNetworkError: "No se pudo conectar al servidor. Inténtalo de nuevo.", googleLogin: "Continuar con Google", or: "o", backupEmail: "Añadir email de respaldo", backupEmailIntro: "Verifica un email de respaldo para acceder con email o Google." },
  de: { emailOtp: "Mit E-Mail fortfahren", emailOtpIntro: "Gib deine E-Mail ein. Wir senden einen 6-stelligen Code, der 10 Minuten gültig ist.", sendCode: "Code senden", checkInbox: "Prüfe deinen Posteingang", codeSentTo: "Wir haben einen Code gesendet an", enterCode: "Bestätigungscode eingeben", verifyCode: "Code prüfen", resendCode: "Code erneut senden", resendIn: "Erneut senden in", seconds: "Sekunden", changeEmail: "E-Mail ändern", expiredCode: "Der Code ist abgelaufen. Fordere einen neuen an.", invalidCode: "Falscher Code. Verbleibende Versuche", tooManyAttempts: "Zu viele Versuche. Versuche es in 30 Minuten erneut.", invalidEmail: "Gib eine gültige E-Mail ein.", otpNetworkError: "Server nicht erreichbar. Versuche es erneut.", googleLogin: "Mit Google fortfahren", or: "oder", backupEmail: "Backup-E-Mail hinzufügen", backupEmailIntro: "Bestätige eine Backup-E-Mail für den Zugriff per E-Mail oder Google." },
  pt: { emailOtp: "Continuar com e-mail", emailOtpIntro: "Digite seu e-mail e enviaremos um código de 6 dígitos válido por 10 minutos.", sendCode: "Enviar código", checkInbox: "Verifique sua caixa de entrada", codeSentTo: "Enviamos um código para", enterCode: "Digite o código", verifyCode: "Verificar código", resendCode: "Reenviar código", resendIn: "Você poderá reenviar em", seconds: "segundos", changeEmail: "Alterar e-mail", expiredCode: "O código expirou. Solicite um novo.", invalidCode: "Código incorreto. Tentativas restantes", tooManyAttempts: "Muitas tentativas. Tente novamente em 30 minutos.", invalidEmail: "Digite um e-mail válido.", otpNetworkError: "Não foi possível acessar o servidor. Tente novamente.", googleLogin: "Continuar com Google", or: "ou", backupEmail: "Adicionar e-mail de recuperação", backupEmailIntro: "Verifique um e-mail de recuperação para acessar por e-mail ou Google." },
  ja: { emailOtp: "メールで続行", emailOtpIntro: "メールアドレスを入力すると、10分間有効な6桁コードを送信します。", sendCode: "コードを送信", checkInbox: "受信トレイを確認", codeSentTo: "コードを送信しました", enterCode: "確認コードを入力", verifyCode: "コードを確認", resendCode: "コードを再送信", resendIn: "再送信まで", seconds: "秒", changeEmail: "メールを変更", expiredCode: "コードの有効期限が切れました。新しいコードをリクエストしてください。", invalidCode: "コードが正しくありません。残りの試行回数", tooManyAttempts: "試行回数が多すぎます。30分後に再試行してください。", invalidEmail: "有効なメールアドレスを入力してください。", otpNetworkError: "サーバーに接続できません。もう一度お試しください。", googleLogin: "Googleで続行", or: "または", backupEmail: "予備メールを追加", backupEmailIntro: "予備メールを確認すると、メールまたはGoogleでアクセスできます。" }
};
Object.keys(AUTH_COPY).forEach(code => { if (LOCALES[code]) Object.assign(LOCALES[code], AUTH_COPY[code]); });
Object.keys(LOCALES).forEach(code => { LOCALES[code].appName = "SADAX"; });
const TRADUIRE_COPY = {
  ar: { traduire: "ترجمة", traduire_title: "المترجم", traduire_from: "من", traduire_to: "إلى", traduire_swap: "تبديل اللغات", traduire_copy: "نسخ", traduire_clear: "مسح", traduire_placeholder: "أدخل النص...", traduire_result_placeholder: "ستظهر الترجمة هنا", traduire_error: "فشلت الترجمة", traduire_loading: "جاري الترجمة..." },
  fr: { traduire: "Traduire", traduire_title: "Traducteur", traduire_from: "De", traduire_to: "Vers", traduire_swap: "Inverser", traduire_copy: "Copier", traduire_clear: "Effacer", traduire_placeholder: "Entrez du texte...", traduire_result_placeholder: "La traduction apparaîtra ici", traduire_error: "Échec de la traduction", traduire_loading: "Traduction..." },
  en: { traduire: "Translate", traduire_title: "Translator", traduire_from: "From", traduire_to: "To", traduire_swap: "Swap languages", traduire_copy: "Copy", traduire_clear: "Clear", traduire_placeholder: "Enter text...", traduire_result_placeholder: "Translation will appear here", traduire_error: "Translation failed", traduire_loading: "Translating..." }
};
Object.keys(TRADUIRE_COPY).forEach(code => Object.assign(LOCALES[code], TRADUIRE_COPY[code]));
const TRADUIRE_ENHANCEMENT_COPY = {
  ar: { traduire_auto_detect: "تعرّف تلقائي", traduire_detected: "اللغة المكتشفة (تقديريًا)", traduire_char_count: "{n} / {max}", traduire_speak: "تشغيل الصوت", traduire_stop: "إيقاف الصوت", traduire_error_offline: "لا يوجد اتصال بالإنترنت. تحقق من الشبكة.", traduire_error_timeout: "انتهت مهلة الترجمة. حاول مجددًا.", traduire_error_generic: "فشلت الترجمة. حاول مجددًا." },
  fr: { traduire_auto_detect: "Détection automatique", traduire_detected: "Langue détectée (estimation)", traduire_char_count: "{n} / {max}", traduire_speak: "Lire le texte", traduire_stop: "Arrêter la lecture", traduire_error_offline: "Pas de connexion Internet. Vérifiez votre réseau.", traduire_error_timeout: "La traduction a expiré. Réessayez.", traduire_error_generic: "Échec de la traduction. Réessayez." },
  en: { traduire_auto_detect: "Auto Detect", traduire_detected: "Detected (estimated)", traduire_char_count: "{n} / {max}", traduire_speak: "Play audio", traduire_stop: "Stop audio", traduire_error_offline: "No internet connection. Check your network.", traduire_error_timeout: "Translation timed out. Try again.", traduire_error_generic: "Translation failed. Please try again." }
};
Object.keys(TRADUIRE_ENHANCEMENT_COPY).forEach(code => Object.assign(LOCALES[code], TRADUIRE_ENHANCEMENT_COPY[code]));
const TRADUIRE_HISTORY_VOICE_COPY = {
  ar: { traduire_history: "السجل", traduire_history_search: "ابحث في السجل...", traduire_history_empty: "لا توجد ترجمات بعد.", traduire_history_clear_all: "مسح الكل", traduire_history_confirm_clear: "هل تريد مسح سجل الترجمات بالكامل؟", traduire_history_deleted: "تم حذف الترجمة من السجل", traduire_history_copied: "تم نسخ الترجمة", traduire_history_just_now: "الآن", traduire_history_minutes_ago: "منذ {n} د", traduire_history_hours_ago: "منذ {n} س", traduire_history_days_ago: "منذ {n} يوم", traduire_mic_start: "بدء الإدخال الصوتي", traduire_mic_stop: "إيقاف الإدخال الصوتي", traduire_mic_denied: "تم رفض إذن الميكروفون", traduire_mic_failed: "فشل التعرف على الصوت" },
  fr: { traduire_history: "Historique", traduire_history_search: "Rechercher dans l’historique...", traduire_history_empty: "Aucune traduction pour le moment.", traduire_history_clear_all: "Tout effacer", traduire_history_confirm_clear: "Effacer tout l’historique des traductions ?", traduire_history_deleted: "Traduction supprimée de l’historique", traduire_history_copied: "Traduction copiée", traduire_history_just_now: "À l’instant", traduire_history_minutes_ago: "Il y a {n} min", traduire_history_hours_ago: "Il y a {n} h", traduire_history_days_ago: "Il y a {n} j", traduire_mic_start: "Démarrer la saisie vocale", traduire_mic_stop: "Arrêter la saisie vocale", traduire_mic_denied: "Accès au microphone refusé", traduire_mic_failed: "Échec de la reconnaissance vocale" },
  en: { traduire_history: "History", traduire_history_search: "Search history...", traduire_history_empty: "No translations yet.", traduire_history_clear_all: "Clear all", traduire_history_confirm_clear: "Clear all translation history?", traduire_history_deleted: "Translation deleted from history", traduire_history_copied: "Translation copied", traduire_history_just_now: "Just now", traduire_history_minutes_ago: "{n}m ago", traduire_history_hours_ago: "{n}h ago", traduire_history_days_ago: "{n}d ago", traduire_mic_start: "Start voice input", traduire_mic_stop: "Stop voice input", traduire_mic_denied: "Microphone permission denied", traduire_mic_failed: "Voice recognition failed" }
};
Object.keys(TRADUIRE_HISTORY_VOICE_COPY).forEach(code => Object.assign(LOCALES[code], TRADUIRE_HISTORY_VOICE_COPY[code]));
const FOLDER_COPY = {
  ar: { folder_new_file: "ملف جديد", folder_file_name_placeholder: "اسم الملف", folder_delete_file: "حذف الملف", folder_delete_file_confirm: "حذف هذا الملف؟ ستبقى كلماته مباشرة في المجلد.", folder_word_file_label: "الملف", folder_word_no_file: "بلا ملف", group_today: "اليوم", group_yesterday: "أمس", game_select_files: "ملفات اللعب", game_select_all: "الكل", game_start_selected: "ابدأ بالمحدد", guest_notice_title: "احفظ كلماتك في حسابك لتتمكن من الوصول إليها لاحقًا.", guest_notice_button: "تسجيل الدخول", guest_notice_dismiss: "إخفاء" },
  fr: { folder_new_file: "Nouveau fichier", folder_file_name_placeholder: "Nom du fichier", folder_delete_file: "Supprimer le fichier", folder_delete_file_confirm: "Supprimer ce fichier ? Ses mots resteront directement dans le dossier.", folder_word_file_label: "Fichier", folder_word_no_file: "Sans fichier", group_today: "Aujourd’hui", group_yesterday: "Hier", game_select_files: "Fichiers à jouer", game_select_all: "Tous", game_start_selected: "Commencer la sélection", guest_notice_title: "Connectez-vous pour retrouver vos mots plus tard.", guest_notice_button: "Se connecter", guest_notice_dismiss: "Masquer" },
  en: { folder_new_file: "New file", folder_file_name_placeholder: "File name", folder_delete_file: "Delete file", folder_delete_file_confirm: "Delete this file? Its words will remain directly in the folder.", folder_word_file_label: "File", folder_word_no_file: "No file", group_today: "Today", group_yesterday: "Yesterday", game_select_files: "Files to play", game_select_all: "All", game_start_selected: "Start selected", guest_notice_title: "Sign in to keep your words available later.", guest_notice_button: "Sign in", guest_notice_dismiss: "Dismiss" }
};
Object.keys(FOLDER_COPY).forEach(code => Object.assign(LOCALES[code], FOLDER_COPY[code]));
const AUTH_ENDPOINTS = {
  requestOtp: "/auth/email/request-otp/",
  verifyOtp: "/auth/email/verify-otp/",
  currentUser: "/auth/me/",
  googleCallback: "/auth/google/callback/",
  logout: "/auth/logout/",
  words: "/api/words/"
};
const GOOGLE_CLIENT_ID = typeof window.__GOOGLE_CLIENT_ID__ === "string" ? window.__GOOGLE_CLIENT_ID__.trim() : "";
function getCookie(name) {
  const prefix = `${name}=`;
  return document.cookie.split(";").map(value => value.trim()).find(value => value.startsWith(prefix))?.slice(prefix.length) || "";
}
async function postAuth(url, payload) {
  const response = await fetch(url, {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", "X-CSRFToken": getCookie("csrftoken") },
    body: JSON.stringify(payload)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.detail || data.error || "Authentication request failed");
    error.data = data;
    error.status = response.status;
    throw error;
  }
  return data;
}

async function wordRequest(url, method, payload) {
  const response = await fetch(url, {
    method,
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", "X-CSRFToken": getCookie("csrftoken") },
    ...(payload === undefined ? {} : { body: JSON.stringify(payload) })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.detail || "Could not save words.");
  return data;
}

function wordPayload(word, set) {
  return {
    client_id: String(word.id),
    french: word.word,
    arabic: word.translation,
    category: set.name.slice(0, 100),
    mastery_level: word.mastery_level || 0,
    set_id: String(set.id),
    set_name: set.name,
    source_language: set.lang1,
    target_language: set.lang2
  };
}

function setsFromWords(rows, localSets) {
  const sets = localSets.map(set => ({ ...set, words: [] }));
  for (const row of rows) {
    const setId = row.set_id || "synced_words";
    let set = sets.find(item => String(item.id) === setId);
    if (!set) {
      set = { id: setId, name: row.set_name || row.category || "Synced words", lang1: row.source_language || "fr", lang2: row.target_language || "ar", words: [] };
      sets.push(set);
    }
    set.words.push({ id: row.client_id || `db${row.id}`, word: row.french, translation: row.arabic, serverId: row.id, mastery_level: row.mastery_level });
  }
  return sets;
}

const I18nContext = createContext();
function I18nProvider({ children }) {
  const [locale, setLocale] = useState(() => {
    try { const saved = localStorage.getItem("vocaflow_locale"); if (saved && LOCALES[saved]) return saved; } catch {}
    const browserLang = (navigator.language || navigator.userLanguage || "").toLowerCase();
    if (browserLang.startsWith("ar")) return "ar";
    if (browserLang.startsWith("en")) return "en";
    return "fr";
  });
  useEffect(() => { try { const lang = getLang(locale); document.documentElement.lang = locale; document.documentElement.dir = lang.dir; localStorage.setItem("vocaflow_locale", locale); } catch {} }, [locale]);
  const t = useCallback((key) => LOCALES[locale]?.[key] || LOCALES.en[key] || key, [locale]);
  return (<I18nContext.Provider value={{ t, locale, setLocale, langs: LANGS }}>{children}</I18nContext.Provider>);
}
const useI18n = () => useContext(I18nContext);

const ToastContext = createContext();
function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const showToast = useCallback((message, type = "info") => { const id = uid(); setToasts(prev => [...prev, { id, message, type }]); setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000); }, []);
  return (<ToastContext.Provider value={showToast}>{children}<div className="toast-container">{toasts.map(t => (<div key={t.id} className={"toast " + t.type}><span>{t.type === "success" ? <CheckIcon size={16} color="#2D6A4F" /> : t.type === "error" ? <CrossIcon size={16} color="#7B2D2D" /> : <UiIcon name="info" size={16} />}</span><span>{t.message}</span></div>))}</div></ToastContext.Provider>);
}
const useToast = () => useContext(ToastContext);

const ThemeContext = createContext();
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => { try { return localStorage.getItem("vocaflow_theme") || "dark"; } catch { return "dark"; } });
  useEffect(() => { try { document.documentElement.setAttribute("data-theme", theme); localStorage.setItem("vocaflow_theme", theme); } catch {} }, [theme]);
  const toggle = () => setTheme(t => t === "light" ? "dark" : "light");
  return (<ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>);
}
const useTheme = () => useContext(ThemeContext);

function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => { try { const item = localStorage.getItem(key); return item ? JSON.parse(item) : initialValue; } catch { return initialValue; } });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} }, [key, value]);
  return [value, setValue];
}

function useSpeech(defaultRate = 0.9, defaultPitch = 1.0) {
  const [speaking, setSpeaking] = useState(false);
  const voicesRef = useRef([]);
  const audioRef = useRef(null);
  useEffect(() => {
    if (!window.speechSynthesis) return;
    const loadVoices = () => { try { voicesRef.current = window.speechSynthesis.getVoices() || []; } catch(e) { voicesRef.current = []; } };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      if (window.speechSynthesis) { window.speechSynthesis.onvoiceschanged = null; window.speechSynthesis.cancel(); }
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    };
  }, []);
  const speakWithSpeechSynthesis = useCallback((text, langCode, options, onError) => {
    try {
      if (!window.speechSynthesis) { setSpeaking(false); onError && onError(); return; }
      const voices = voicesRef.current || [];
      let selectedVoice = null;
      const langPrefix = langCode ? langCode.split('-')[0].toLowerCase() : '';
      if (langPrefix) {
        selectedVoice = voices.find(v => v.lang && v.lang.toLowerCase().startsWith(langPrefix));
      }
      const utterance = new SpeechSynthesisUtterance(text);
      if (selectedVoice) { utterance.voice = selectedVoice; utterance.lang = selectedVoice.lang; } else { utterance.lang = langCode || "en-US"; }
      utterance.rate = options.rate !== undefined ? options.rate : defaultRate;
      utterance.pitch = options.pitch !== undefined ? options.pitch : defaultPitch;
      utterance.volume = 1;
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = (e) => { setSpeaking(false); if (onError && e.error === 'language-unavailable') onError(); };
      window.speechSynthesis.speak(utterance);
    } catch(e) { setSpeaking(false); if (onError) onError(); }
  }, [defaultRate, defaultPitch]);
  const speakText = useCallback((text, lang, options = {}) => {
    if (!text) return;
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    const cleanText = text.trim();
    const mappedLang = lang === "ar" ? "ar-SA" : lang === "en" ? "en-US" : lang === "fr" ? "fr-FR" : lang === "es" ? "es-ES" : lang === "de" ? "de-DE" : lang === "pt" ? "pt-PT" : lang === "ja" ? "ja-JP" : lang;
    const googleTTS = () => {
      let fellBack = false;
      const fallback = () => {
        if (!fellBack) {
          fellBack = true;
          audioRef.current = null;
          setSpeaking(false);
          speakWithSpeechSynthesis(cleanText, mappedLang, options, () => {});
        }
      };
      const ttsLang = mappedLang.split("-")[0] || "en";
      const audio = new Audio(`https://translate.google.com/translate_tts?ie=UTF-8&tl=${ttsLang}&client=tw-ob&q=${encodeURIComponent(cleanText)}`);
      audio.preload = "auto";
      audio.volume = 1;
      audioRef.current = audio;
      audio.playbackRate = options.rate !== undefined ? options.rate : defaultRate;
      audio.onplay = () => setSpeaking(true);
      audio.onpause = () => { if (!audio.ended) setSpeaking(false); };
      audio.onended = () => { audioRef.current = null; setSpeaking(false); };
      audio.onerror = fallback;
      audio.play().catch(fallback);
    };
    googleTTS();
  }, [defaultRate, defaultPitch, speakWithSpeechSynthesis]);
  return { speakText, speaking };
}

function useLongPress(onLongPress, onClick, delay = 500) {
  const timerRef = useRef(null);
  const startPosRef = useRef({ x: 0, y: 0 });
  const suppressClickRef = useRef(false);
  const longPressFiredRef = useRef(false);
  const callbacksRef = useRef({ onLongPress, onClick });
  callbacksRef.current = { onLongPress, onClick };

  const cancel = () => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };
  useEffect(() => {
    const onScroll = () => {
      if (timerRef.current !== null) {
        cancel();
        suppressClickRef.current = true;
      }
    };
    window.addEventListener("scroll", onScroll, true);
    return () => { cancel(); window.removeEventListener("scroll", onScroll, true); };
  }, []);

  const start = e => {
    longPressFiredRef.current = false;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    cancel();
    suppressClickRef.current = false;
    startPosRef.current = { x: e.clientX, y: e.clientY };
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      longPressFiredRef.current = true;
      suppressClickRef.current = true;
      callbacksRef.current.onLongPress(e);
    }, delay);
  };
  const move = e => {
    if (timerRef.current === null) return;
    if (Math.abs(e.clientX - startPosRef.current.x) > 10 || Math.abs(e.clientY - startPosRef.current.y) > 10) {
      cancel();
      suppressClickRef.current = true;
    }
  };
  return {
    onPointerDown: start,
    onPointerUp: cancel,
    onPointerMove: move,
    onPointerCancel: () => { cancel(); suppressClickRef.current = true; },
    onPointerLeave: () => { cancel(); suppressClickRef.current = true; },
    onClick: e => {
      if (e.detail !== 0 && suppressClickRef.current) { e.preventDefault(); suppressClickRef.current = false; return; }
      callbacksRef.current.onClick?.(e);
    },
    onContextMenu: e => {
      e.preventDefault();
      cancel();
      if (!longPressFiredRef.current) callbacksRef.current.onLongPress(e);
      longPressFiredRef.current = true;
      suppressClickRef.current = true;
    },
  };
}

const SPEECH_INPUT_LANGS = { ar: "ar-SA", en: "en-US", fr: "fr-FR", es: "es-ES", de: "de-DE", pt: "pt-PT", ja: "ja-JP" };
function useVoiceInput({ language, value, onChange, onError }) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef(null);
  const baseValueRef = useRef("");
  const transcriptRef = useRef("");
  const valueRef = useRef(value);
  useEffect(() => { valueRef.current = value; }, [value]);
  useEffect(() => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setSupported(!!Recognition);
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        try { recognitionRef.current.stop(); } catch {}
      }
    };
  }, []);
  const toggleListening = useCallback(() => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) { onError && onError("unsupported"); return; }
    if (listening) {
      try { recognitionRef.current?.stop(); } catch {}
      return;
    }
    const recognition = new Recognition();
    recognition.lang = SPEECH_INPUT_LANGS[language] || language || "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    baseValueRef.current = valueRef.current.trim();
    transcriptRef.current = "";
    recognition.onresult = event => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) transcript += event.results[i][0].transcript;
      transcriptRef.current = transcript.trim();
      const nextValue = [baseValueRef.current, transcriptRef.current].filter(Boolean).join(" ").trim();
      onChange(nextValue);
    };
    recognition.onerror = event => {
      setListening(false);
      if (event.error === "not-allowed" || event.error === "service-not-allowed") onError && onError("permission");
      else if (event.error !== "aborted" && event.error !== "no-speech") onError && onError("error");
    };
    recognition.onend = () => { recognitionRef.current = null; setListening(false); };
    recognitionRef.current = recognition;
    try { recognition.start(); setListening(true); } catch { setListening(false); onError && onError("error"); }
  }, [language, listening, onChange, onError]);
  return { listening, supported, toggleListening };
}

function useUsage() {
  const [stored, setStored] = useLocalStorage("vocaflow_usage", { total: 0, daily: {}, sessions: 0, bestScore: 0, startDate: new Date().toISOString().slice(0, 10) });
  const sessionRef = useRef(0);
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    const tick = setInterval(() => { sessionRef.current += 1; forceUpdate(n => n + 1); }, 1000);
    const save = () => { try { const secs = sessionRef.current; if (secs > 0) { const day = new Date().toISOString().slice(0, 10); setStored(prev => ({ ...prev, total: (prev.total || 0) + secs, sessions: (prev.sessions || 0) + 1, daily: { ...(prev.daily || {}), [day]: ((prev.daily?.[day]) || 0) + secs } })); sessionRef.current = 0; } } catch {} };
    const periodic = setInterval(save, 30000);
    const onUnload = () => save();
    window.addEventListener("beforeunload", onUnload);
    return () => { clearInterval(tick); clearInterval(periodic); save(); window.removeEventListener("beforeunload", onUnload); };
  }, []);
  const updateBestScore = (pct) => { try { setStored(prev => ({ ...prev, bestScore: Math.max(prev.bestScore || 0, pct) })); } catch {} };
  const day = new Date().toISOString().slice(0, 10);
  const total = (stored.total || 0) + sessionRef.current;
  const today = ((stored.daily?.[day]) || 0) + sessionRef.current;
  const level = Math.min(Math.floor(total / 60 / 15) + 1, 99);
  const weekDays = [];
  for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); const key = d.toISOString().slice(0, 10); weekDays.push({ label: d.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 2), value: stored.daily?.[key] || 0, date: key }); }
  const fmt = (s) => { if (s < 60) return s + "s"; if (s < 3600) return Math.floor(s / 60) + "m"; return Math.floor(s / 3600) + "h " + Math.floor((s % 3600) / 60) + "m"; };
  return { total, today, level, weekDays, fmt, updateBestScore, daily: stored.daily || {}, startDate: stored.startDate };
}

function useRealStats() {
  const [stats, setStats] = useLocalStorage('vocaflow_real_stats', { wordsAdded: 0, wordsReviewed: 0, correctAnswers: 0, wrongAnswers: 0, gamesPlayed: 0, dailyActivity: {}, startDate: new Date().toISOString().slice(0, 10) });
  const trackWordAdded = useCallback(() => {
    const day = new Date().toISOString().slice(0, 10);
    setStats(prev => {
      const dailyActivity = prev.dailyActivity || {};
      const dayData = dailyActivity[day] || { added: 0, reviewed: 0, correct: 0, wrong: 0 };
      return { ...prev, wordsAdded: (prev.wordsAdded || 0) + 1, dailyActivity: { ...dailyActivity, [day]: { ...dayData, added: (dayData.added || 0) + 1 } } };
    });
  }, []);
  const trackReview = useCallback((correct) => {
    const day = new Date().toISOString().slice(0, 10);
    setStats(prev => {
      const dailyActivity = prev.dailyActivity || {};
      const dayData = dailyActivity[day] || { added: 0, reviewed: 0, correct: 0, wrong: 0 };
      return { ...prev, wordsReviewed: (prev.wordsReviewed || 0) + 1, correctAnswers: correct ? (prev.correctAnswers || 0) + 1 : (prev.correctAnswers || 0), wrongAnswers: !correct ? (prev.wrongAnswers || 0) + 1 : (prev.wrongAnswers || 0), dailyActivity: { ...dailyActivity, [day]: { reviewed: (dayData.reviewed || 0) + 1, correct: correct ? (dayData.correct || 0) + 1 : (dayData.correct || 0), wrong: !correct ? (dayData.wrong || 0) + 1 : (dayData.wrong || 0), added: dayData.added || 0 } } };
    });
  }, []);
  const trackGame = useCallback(() => { setStats(prev => ({ ...prev, gamesPlayed: (prev.gamesPlayed || 0) + 1 })); }, []);
  return { stats, trackWordAdded, trackReview, trackGame };
}

/* ICONS */
function WaveIcon({ size = 24, color = "currentColor" }) {
  return (<svg viewBox="0 0 24 24" fill="none" width={size} height={size} role="img" aria-label="Wave"><defs><linearGradient id="waveHandGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="var(--color-primary)" /><stop offset="100%" stopColor="var(--color-bg)" /></linearGradient></defs><path d="M7.5 11.5V5.75a1.25 1.25 0 0 1 2.5 0v5.25m0-4.5a1.25 1.25 0 0 1 2.5 0v4.5m0-3a1.25 1.25 0 0 1 2.5 0V14c0 4.75-3 8-8.5 8C3 22 .5 19 .5 15.5v-4a1.25 1.25 0 0 1 2.5 0v2.25h1c.69 0 1.25.56 1.25 1.25V14a1.25 1.25 0 0 1 2.5 0" stroke="url(#waveHandGrad)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" /><path d="M18.5 6.5c.75-.75 1.5-1.3 2.4-1.55.4-.11.8-.08 1.15.08.5.23.86.7.97 1.25.12.55-.04 1.12-.45 1.5-1.1 1-3.2 2.5-5.3 3.5" stroke="var(--color-primary-light)" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.8"/><path d="M20 4.5c.3-.4.75-.7 1.2-.8" stroke="var(--color-primary)" strokeWidth="1.2" strokeLinecap="round" opacity="0.6"/></svg>);
}
function SunIcon({ size = 24 }) {
  return (<svg viewBox="0 0 24 24" fill="none" width={size} height={size} role="img" aria-label="Sun"><defs><linearGradient id="sunThemeGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="var(--color-primary)" /><stop offset="100%" stopColor="var(--color-primary-light)" /></linearGradient></defs><circle cx="12" cy="12" r="4" fill="url(#sunThemeGrad)" stroke="url(#sunThemeGrad)" strokeWidth="1"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="var(--color-primary)" strokeWidth="1.8" strokeLinecap="round"/></svg>);
}
function MoonIcon({ size = 24 }) {
  return (<svg viewBox="0 0 24 24" fill="none" width={size} height={size} role="img" aria-label="Moon"><defs><linearGradient id="moonThemeGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="var(--color-primary)" /><stop offset="100%" stopColor="var(--color-bg)" /></linearGradient></defs><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="url(#moonThemeGrad)" stroke="url(#moonThemeGrad)" strokeWidth="1.5"/></svg>);
}
function RocketIcon({ size = 24, color = "currentColor" }) {
  return (<svg viewBox="0 0 24 24" fill="none" width={size} height={size} role="img" aria-label="Rocket"><path d="M12 15c-1.5-2-2-4-2-7l2-5 2 5c0 3-.5 5-2 7z" fill={color} opacity="0.8"/><path d="M12 15c-2-1-3.5-2.5-4.5-4.5L9 8l3 7z" fill={color} opacity="0.6"/><path d="M12 15c2-1 3.5-2.5 4.5-4.5L15 8l-3 7z" fill={color} opacity="0.6"/><circle cx="12" cy="15" r="2" fill="var(--color-text)"/><path d="M8 19c1 2 3 3 4 3s3-1 4-3" stroke={color} strokeWidth="2" strokeLinecap="round"/></svg>);
}
function CheckIcon({ size = 20, color = "currentColor" }) {
  return (<svg viewBox="0 0 24 24" fill="none" width={size} height={size} role="img" aria-label="Check"><circle cx="12" cy="12" r="10" fill="none" stroke={color} strokeWidth="2"/><path d="M8 12.5l2.5 2.5L16 9.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>);
}
function CrossIcon({ size = 20, color = "currentColor" }) {
  return (<svg viewBox="0 0 24 24" fill="none" width={size} height={size} role="img" aria-label="Cross"><circle cx="12" cy="12" r="10" fill="none" stroke={color} strokeWidth="2"/><path d="M15 9l-6 6M9 9l6 6" stroke={color} strokeWidth="2" strokeLinecap="round"/></svg>);
}
function GamepadIcon({ size = 24, color = "currentColor" }) {
  return (<svg viewBox="0 0 24 24" fill="none" width={size} height={size} role="img" aria-label="Gamepad"><path d="M6 9h12a4 4 0 014 4v1a4 4 0 01-4 4h-1.5l-1.5-2h-6l-1.5 2H6a4 4 0 01-4-4v-1a4 4 0 014-4z" fill={color} opacity="0.8"/><path d="M8 12v3M6.5 13.5h3" stroke="var(--color-text)" strokeWidth="2" strokeLinecap="round"/><circle cx="16" cy="12.5" r="1.5" fill="var(--color-text)"/><circle cx="18.5" cy="14.5" r="1.5" fill="var(--color-text)"/></svg>);
}
function BookIcon({ size = 24, color = "currentColor" }) {
  return (<svg viewBox="0 0 24 24" fill="none" width={size} height={size} role="img" aria-label="Book"><path d="M4 4h6v16H4V4z" fill={color} opacity="0.7"/><path d="M10 4h6v16h-6V4z" fill={color} opacity="0.85"/><path d="M16 4h4v16h-4V4z" fill={color}/><path d="M4 4h16" stroke="var(--color-text)" strokeWidth="1"/><path d="M6 8h2M6 11h2M12 8h2M12 11h2M12 14h2M18 8h1M18 11h1" stroke="var(--color-text)" strokeWidth="1" strokeLinecap="round"/></svg>);
}
function LogoMark({ size = 32 }) {
  return (
    <svg className="brand-mark" viewBox="0 0 40 40" fill="none" width={size} height={size} role="img" aria-label="SADAX logo">
      <defs>
        <linearGradient id="brandBloomGrad" x1="4" y1="4" x2="36" y2="36"><stop offset="0%" stopColor="var(--color-primary-light)" /><stop offset="48%" stopColor="var(--color-primary)" /><stop offset="100%" stopColor="var(--color-primary-light)" /></linearGradient>
        <linearGradient id="brandBookGrad" x1="8" y1="15" x2="32" y2="31"><stop offset="0%" stopColor="var(--color-text)" /><stop offset="100%" stopColor="var(--color-primary-light)" /></linearGradient>
      </defs>
      <circle cx="20" cy="20" r="18" fill="url(#brandBloomGrad)" opacity="0.16" />
      <path d="M20 21C12 19 9 13 11 8c6 0 10 4 9 13Z" fill="url(#brandBloomGrad)" className="brand-mark-petal" />
      <path d="M20 21c8-2 11-8 9-13-6 0-10 4-9 13Z" fill="var(--color-primary-light)" opacity="0.88" className="brand-mark-petal" />
      <path d="M20 21c-1 7-5 11-10 11 0-6 3-10 10-11Z" fill="var(--color-primary)" opacity="0.85" className="brand-mark-petal" />
      <path d="M20 21c1 7 5 11 10 11 0-6-3-10-10-11Z" fill="var(--color-primary-light)" opacity="0.9" className="brand-mark-petal" />
      <path d="M10 20.5c3-2 6-3 10 1.5 4-4.5 7-3.5 10-1.5v9.2c-3-1.5-6-1.5-10 1.5-4-3-7-3-10-1.5v-9.2Z" fill="url(#brandBookGrad)" stroke="var(--color-primary-light)" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M20 22v8.8" stroke="var(--color-primary)" strokeWidth="1.2" />
      <circle cx="20" cy="20" r="2.2" fill="var(--color-primary-light)" stroke="var(--color-primary)" strokeWidth="0.8" />
    </svg>
  );
}
function VoiceIcon({ size = 22 }) {
  return (<svg viewBox="0 0 24 24" fill="none" width={size} height={size} role="img" aria-label="Voice input"><rect x="8" y="2.5" width="8" height="13" rx="4" fill="currentColor" opacity="0.18" stroke="currentColor" strokeWidth="1.8"/><path d="M5 11.5a7 7 0 0014 0M12 18.5V22M8.5 22h7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>);
}
const UI_ICON_SHAPES = {
  headphones: <><path d="M3 13v-2a9 9 0 0 1 18 0v2"/><rect x="2" y="12" width="4" height="7" rx="2"/><rect x="18" y="12" width="4" height="7" rx="2"/><path d="M20 19a4 4 0 0 1-4 3h-3"/></>,
  target: <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></>,
  trophy: <><path d="M7 3h10v8a5 5 0 0 1-10 0V3ZM7 5H4v3a4 4 0 0 0 4 4M17 5h3v3a4 4 0 0 1-4 4M12 16v4M8 21h8"/></>,
  star: <path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21 7 14.2l-5-4.9 6.9-1L12 2Z"/>,
  thumbsUp: <><path d="M7 10v11H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3ZM7 10l4-7a2 2 0 0 1 3 2l-1 4h6a3 3 0 0 1 3 3l-1 7a3 3 0 0 1-3 2H7"/></>,
  chart: <><path d="M3 20h18M5 16v-5M10 16V7M15 16v-9M20 16V4"/></>,
  refresh: <><path d="M20 7a9 9 0 0 0-15-2L3 7M3 3v4h4M4 17a9 9 0 0 0 15 2l2-2M21 21v-4h-4"/></>,
  home: <><path d="m3 11 9-8 9 8v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-9Z"/><path d="M9 21v-7h6v7"/></>,
  note: <><path d="M5 3h11l3 3v15H5V3ZM16 3v4h3M8 11h8M8 15h8M8 19h5"/></>,
  pause: <><path d="M8 5v14M16 5v14"/></>,
  play: <path d="m8 5 11 7-11 7V5Z"/>,
  gear: <><path d="M10 2h4l.6 2.2 2 .8 2-.9 2.8 2.8-.9 2 .8 2L23 11v4l-2.2.6-.8 2 .9 2-2.8 2.8-2-.9-2 .8L14 24h-4l-.6-2.2-2-.8-2 .9-2.8-2.8.9-2-.8-2L1 15v-4l2.2-.6.8-2-.9-2L5.9 3.6l2 .9 2-.8L10 2Z" transform="translate(0 -1) scale(1 .92)"/><circle cx="12" cy="12" r="3"/></>,
  lightbulb: <><path d="M9 18h6M10 21h4M8 15c-1.3-1.1-2-2.6-2-4a6 6 0 0 1 12 0c0 1.4-.7 2.9-2 4l-1 2H9l-1-2Z"/></>,
  broom: <><path d="m14 3 7 7M13 10l4-4M11 12l4 4M9 13c-3 1-5 4-5 8h8c3-1 5-4 5-8l-4-4-4 4Z"/></>,
  flag: <><path d="M5 22V3M5 4c5-3 9 3 15 0v11c-6 3-10-3-15 0"/></>,
  arrowRight: <><path d="M4 12h16m-6-6 6 6-6 6"/></>,
  arrowLeft: <><path d="M20 12H4m6-6-6 6 6 6"/></>,
  arrowUp: <><path d="M12 20V4m-6 6 6-6 6 6"/></>,
  arrowDown: <><path d="M12 4v16m-6-6 6 6 6-6"/></>,
  muscles: <><path d="M3 19c2-2 3-5 4-8l3 1 2-5 3-2 2 2-2 4 3 1 3 4-3 5H7l-4-2ZM10 12l3 3"/></>,
  sparkle: <><path d="m12 2 2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2L12 2ZM19 2v3M17.5 3.5h3"/></>,
  bookOpen: <><path d="M12 5c-3-2-6-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-3-1-6-1-9 1ZM12 5v15"/></>,
  mail: <><rect x="2" y="5" width="20" height="14" rx="2"/><path d="m3 7 9 7 9-7"/></>,
  lock: <><rect x="4" y="10" width="16" height="12" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 15v3"/></>,
  signOut: <><path d="M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h5M14 7l5 5-5 5M8 12h11"/></>,
  globe: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c-3 3-4 6-4 9s1 6 4 9M12 3c3 3 4 6 4 9s-1 6-4 9"/></>,
  bolt: <path d="m13 2-9 11h7l-1 9 10-12h-7V2Z"/>,
  turtle: <><path d="M4 15a8 8 0 0 1 16 0H4ZM6 15l-2 3M10 15v4M15 15v4M19 15l2 3M20 11h2"/></>,
  rabbit: <><path d="M7 10 6 3a2 2 0 0 1 3-1l3 7 2-7a2 2 0 0 1 3 1l-1 7M5 15a7 7 0 0 1 14 0 7 7 0 0 1-14 0ZM9 15h.01M15 15h.01M11 18h2"/></>,
  music: <><path d="M9 18V5l11-2v13M9 18a3 2 0 1 1-6 0 3 2 0 0 1 6 0ZM20 16a3 2 0 1 1-6 0 3 2 0 0 1 6 0Z"/></>,
  download: <><path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/></>,
  warning: <><path d="m12 3 10 18H2L12 3ZM12 9v5M12 18h.01"/></>,
  hourglass: <><path d="M5 2h14M5 22h14M7 3c0 5 5 5 5 9s-5 4-5 9M17 3c0 5-5 5-5 9s5 4 5 9"/></>,
  info: <><circle cx="12" cy="12" r="10"/><path d="M12 11v6M12 7h.01"/></>,
  castle: <><path d="M3 21V8h3V4h3v4h6V4h3v4h3v13H3ZM9 21v-7h6v7M3 12h18"/></>,
  user: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>
};
function UiIcon({ name, size = 20 }) {
  return <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{UI_ICON_SHAPES[name]}</svg>;
}
function HeadphonesIcon(props) { return <UiIcon name="headphones" {...props} />; }
function TrophyIcon(props) { return <UiIcon name="trophy" {...props} />; }
function StarIcon(props) { return <UiIcon name="star" {...props} />; }
function ThumbsUpIcon(props) { return <UiIcon name="thumbsUp" {...props} />; }
function ChartIcon(props) { return <UiIcon name="chart" {...props} />; }
function RefreshIcon(props) { return <UiIcon name="refresh" {...props} />; }
function HomeIcon(props) { return <UiIcon name="home" {...props} />; }
function NoteIcon(props) { return <UiIcon name="note" {...props} />; }
function PauseIcon(props) { return <UiIcon name="pause" {...props} />; }
function GearIcon(props) { return <UiIcon name="gear" {...props} />; }
function LightbulbIcon(props) { return <UiIcon name="lightbulb" {...props} />; }
function BroomIcon(props) { return <UiIcon name="broom" {...props} />; }
function FlagIcon(props) { return <UiIcon name="flag" {...props} />; }
function ArrowRightIcon(props) { return <UiIcon name="arrowRight" {...props} />; }
function MusclesIcon(props) { return <UiIcon name="muscles" {...props} />; }
function SparkleIcon(props) { return <UiIcon name="sparkle" {...props} />; }
function LearningEmoji({ emoji }) {
  const Icon = { muscles: MusclesIcon, trophy: TrophyIcon, star: StarIcon, thumbsUp: ThumbsUpIcon, applause: SparkleIcon }[emoji] || SparkleIcon;
  return (<span className="learning-emoji"><span className="learning-emoji-glow" aria-hidden="true" /><span className="learning-emoji-core"><Icon size={48} /></span></span>);
}
function GemIcon({ size = 24, color = "currentColor" }) {
  return (<svg viewBox="0 0 24 24" fill="none" width={size} height={size} role="img" aria-label="Gem"><path d="M6 3h12l3 6-9 12L3 9l3-6z" fill={color} stroke="var(--color-text)" strokeWidth="0.5" strokeLinejoin="round"/><path d="M3 9h18M9 3l3 6 3-6M12 9l0 12" stroke="var(--color-text)" strokeWidth="1" strokeLinejoin="round"/><path d="M6 3l3 6M18 3l-3 6" stroke="var(--color-text)" strokeWidth="0.8"/></svg>);
}
function GamesIcon({ active }) {
  return (<svg viewBox="0 0 24 24" fill="none" role="img" aria-label="Games"><defs><linearGradient id="gamesGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="var(--color-primary)" /><stop offset="100%" stopColor="var(--color-bg)" /></linearGradient></defs><path d="M6 9h12a4 4 0 014 4v1a4 4 0 01-4 4h-1.5l-1.5-2h-6l-1.5 2H6a4 4 0 01-4-4v-1a4 4 0 014-4z" fill={active ? "url(#gamesGrad)" : "none"} stroke={active ? "var(--color-primary)" : "currentColor"} strokeWidth="1.8" strokeLinejoin="round"/><path d="M8 12v3M6.5 13.5h3" stroke={active ? "var(--color-text)" : "var(--color-primary)"} strokeWidth="1.8" strokeLinecap="round"/><circle cx="16" cy="12.5" r="1.2" fill={active ? "var(--color-text)" : "var(--color-primary)"}/><circle cx="18.5" cy="14.5" r="1.2" fill={active ? "var(--color-text)" : "var(--color-primary)"}/></svg>);
}
function TranslateIcon({ size = 24 }) {
  return (<svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" role="img" aria-label="Translate"><path d="M3.5 2.5h8a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6l-3 2.5v-2.8a2 2 0 0 1-1.5-1.9V4.5a2 2 0 0 1 2-2Z"/><path d="M12.5 8.5h8a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-1V22l-3-2.5h-4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z"/><path d="M5 10.8 7.1 5.9l2.1 4.9M5.8 9h2.6"/><path d="M18.7 11.8c-.7-.5-1.8-.6-2.5 0-.7.5-.7 1.4 0 1.9.6.4 1.4.2 2.1-.2m-.4.2c.7.5 1 1.1.8 1.9-.2.9-1.1 1.4-2.5 1.4h-1.1"/></svg>);
}
function CardsIcon({ active }) {
  return (<svg viewBox="0 0 24 24" fill="none" role="img" aria-label="Flashcards"><defs><linearGradient id="cardsGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="var(--color-primary)" /><stop offset="100%" stopColor="var(--color-bg)" /></linearGradient></defs><rect x="4" y="6" width="13" height="16" rx="2" fill={active ? "url(#cardsGrad)" : "none"} stroke={active ? "var(--color-primary)" : "currentColor"} strokeWidth="1.5" opacity="0.6"/><rect x="7" y="3" width="13" height="16" rx="2" fill={active ? "url(#cardsGrad)" : "none"} stroke={active ? "var(--color-primary)" : "currentColor"} strokeWidth="1.5"/><path d="M18 1l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z" fill="var(--color-primary-light)"/></svg>);
}
function StatsIcon({ active }) {
  return (<svg viewBox="0 0 24 24" fill="none" role="img" aria-label="Stats"><defs><linearGradient id="statsGrad" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stopColor="var(--color-primary)" /><stop offset="100%" stopColor="var(--color-primary-light)" /></linearGradient></defs><rect x="4" y="14" width="4" height="7" rx="1" fill={active ? "url(#statsGrad)" : "none"} stroke={active ? "var(--color-primary)" : "currentColor"} strokeWidth="1.5"/><rect x="10" y="10" width="4" height="11" rx="1" fill={active ? "url(#statsGrad)" : "none"} stroke={active ? "var(--color-primary)" : "currentColor"} strokeWidth="1.5"/><rect x="16" y="5" width="4" height="16" rx="1" fill={active ? "url(#statsGrad)" : "none"} stroke={active ? "var(--color-primary)" : "currentColor"} strokeWidth="1.5"/></svg>);
}
function SettingsIcon({ active }) {
  return (<svg viewBox="0 0 24 24" fill="none" role="img" aria-label="Settings"><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" fill={active ? "var(--color-primary)" : "none"} stroke={active ? "var(--color-primary)" : "currentColor"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 15a3 3 0 100-6 3 3 0 000 6z" fill={active ? "var(--color-bg)" : "none"} stroke={active ? "var(--color-primary)" : "currentColor"} strokeWidth="1.8"/></svg>);
}
function ClockIcon({ size = 24 }) {
  return (<svg viewBox="0 0 24 24" fill="none" width={size} height={size} role="img" aria-label="Time"><defs><linearGradient id="clockGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="var(--color-primary)" /><stop offset="100%" stopColor="var(--color-bg)" /></linearGradient></defs><circle cx="12" cy="12" r="10" fill="url(#clockGrad)" stroke="url(#clockGrad)" strokeWidth="0.5"/><circle cx="12" cy="12" r="8.5" fill="none" stroke="color-mix(in srgb, var(--color-text) 30%, transparent)" strokeWidth="0.8"/><path d="M12 6v6l4 2" stroke="var(--color-text)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="1.2" fill="var(--color-text)"/></svg>);
}
function FolderIcon({ size = 24 }) {
  return (<svg viewBox="0 0 24 24" fill="none" width={size} height={size} role="img" aria-label="Folder"><defs><linearGradient id="folderGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="var(--color-primary)" /><stop offset="100%" stopColor="var(--color-bg)" /></linearGradient></defs><path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" fill="url(#folderGrad)"/><path d="M3 9h18" stroke="color-mix(in srgb, var(--color-text) 30%, transparent)" strokeWidth="1"/><path d="M7 13h6M7 15.5h4" stroke="color-mix(in srgb, var(--color-text) 70%, transparent)" strokeWidth="1.5" strokeLinecap="round"/></svg>);
}
function EssentialFolderIcon({ size = 28 }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" width={size} height={size} role="img" aria-label="Essential folder">
      <defs>
        <linearGradient id="essFolderBack" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--color-primary-light)" />
          <stop offset="100%" stopColor="var(--color-primary)" />
        </linearGradient>
        <linearGradient id="essFolderFront" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--color-primary-light)" />
          <stop offset="55%" stopColor="var(--color-primary)" />
          <stop offset="100%" stopColor="var(--color-primary-light)" />
        </linearGradient>
        <linearGradient id="essFolderSpark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--color-primary-light)" />
          <stop offset="100%" stopColor="var(--color-primary)" />
        </linearGradient>
      </defs>
      <path d="M4 10a3 3 0 0 1 3-3h10l3.5 4H41a3 3 0 0 1 3 3v22a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V10z" fill="url(#essFolderBack)" opacity="0.55"/>
      <path d="M4 15a3 3 0 0 1 3-3h10l3.5 4H41a3 3 0 0 1 3 3v17a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V15z" fill="url(#essFolderFront)"/>
      <path d="M4 18h40" stroke="color-mix(in srgb, var(--color-text) 18%, transparent)" strokeWidth="1"/>
      <path d="M13 27h15M13 32h10" stroke="color-mix(in srgb, var(--color-text) 85%, transparent)" strokeWidth="2.2" strokeLinecap="round"/>
      <circle cx="36" cy="32" r="6.5" fill="var(--color-text)" opacity="0.95"/>
      <path d="M33.5 32l2 2 3.5-3.5" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M38 5l1 2.3 2.3 1L39 9.3 38 11.6l-1-2.3-2.3-1 2.3-1L38 5z" fill="url(#essFolderSpark)"/>
      <path d="M11 4l.7 1.6L13.3 6.3l-1.6.7L11 8.6l-.7-1.6L8.7 6.3l1.6-.7L11 4z" fill="var(--color-primary-light)" opacity="0.85"/>
    </svg>
  );
}
function SpeakerIcon({ size = 20, active = false }) {
  return (<svg viewBox="0 0 24 24" fill="none" width={size} height={size} role="img" aria-label="Pronunciation"><path d="M11 5L6 9H2v6h4l5 4V5z" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><path d="M15.5 8.5a5 5 0 010 7M18.5 5.5a9 9 0 010 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity={active ? "1" : "0.7"}/></svg>);
}
function BookmarkIcon({ filled = false, size = 20 }) {
  return (<svg viewBox="0 0 24 24" fill="none" width={size} height={size} role="img" aria-label="Save"><defs><linearGradient id="bookmarkGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--color-primary)" /><stop offset="100%" stopColor="var(--color-bg)" /></linearGradient></defs><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z" fill={filled ? "url(#bookmarkGrad)" : "none"} stroke={filled ? "var(--color-primary)" : "currentColor"} strokeWidth="1.8" strokeLinejoin="round"/></svg>);
}
function PlusIcon({ size = 20 }) {
  return (<svg viewBox="0 0 24 24" fill="none" width={size} height={size} role="img" aria-label="Add"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.8"/><path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>);
}
function CloseIcon({ size = 20 }) {
  return (<svg viewBox="0 0 24 24" fill="none" width={size} height={size} role="img" aria-label="Close"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>);
}
function SkipIcon({ size = 20 }) {
  return (<svg viewBox="0 0 24 24" fill="none" width={size} height={size} role="img" aria-label="Skip"><path d="M5 4l10 8-10 8V4zM19 5v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>);
}
function PlayIcon({ size = 20 }) {
  return (<svg viewBox="0 0 24 24" fill="none" width={size} height={size} role="img" aria-label="Play"><path d="M5 3l14 9-14 9V3z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>);
}
function TargetIcon({ size = 24 }) {
  return (<svg viewBox="0 0 24 24" fill="none" width={size} height={size} role="img" aria-label="Accuracy"><defs><linearGradient id="targetGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="var(--color-primary)" /><stop offset="100%" stopColor="var(--color-bg)" /></linearGradient></defs><circle cx="12" cy="12" r="10" fill="url(#targetGrad)"/><circle cx="12" cy="12" r="7" fill="none" stroke="var(--color-text)" strokeWidth="1.5" opacity="0.4"/><circle cx="12" cy="12" r="4" fill="none" stroke="var(--color-text)" strokeWidth="1.5" opacity="0.6"/><circle cx="12" cy="12" r="1.5" fill="var(--color-text)"/></svg>);
}
function FlameSmallIcon({ size = 24 }) {
  return (<svg viewBox="0 0 24 24" fill="none" width={size} height={size} role="img" aria-label="Streak"><defs><linearGradient id="flameSmallGrad" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stopColor="var(--color-primary)" /><stop offset="100%" stopColor="var(--color-primary-light)" /></linearGradient></defs><path d="M12 2C15 6 19 9 18 14c-1 4-3 6-6 6s-5-2-6-6c-1-5 3-8 6-12z" fill="url(#flameSmallGrad)"/><path d="M12 8c1.5 2 3 3.5 2.5 6-.5 2-1.5 3-2.5 3s-2-1-2.5-3c-.5-2.5 1-4 2.5-6z" fill="color-mix(in srgb, var(--color-text) 40%, transparent)"/></svg>);
}
function BooksIcon({ size = 24 }) {
  return (<svg viewBox="0 0 24 24" fill="none" width={size} height={size} role="img" aria-label="Words"><defs><linearGradient id="booksGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="var(--color-primary)" /><stop offset="100%" stopColor="var(--color-bg)" /></linearGradient></defs><path d="M4 4h6v16H4V4z" fill="url(#booksGrad)" opacity="0.7"/><path d="M10 4h6v16h-6V4z" fill="url(#booksGrad)" opacity="0.85"/><path d="M16 4h4v16h-4V4z" fill="url(#booksGrad)"/><path d="M4 4h16" stroke="color-mix(in srgb, var(--color-text) 30%, transparent)" strokeWidth="1"/><path d="M6 8h2M6 11h2M12 8h2M12 11h2M12 14h2M18 8h1M18 11h1" stroke="color-mix(in srgb, var(--color-text) 50%, transparent)" strokeWidth="1" strokeLinecap="round"/></svg>);
}
function SentenceIcon({ size = 24 }) {
  return (<svg viewBox="0 0 24 24" fill="none" width={size} height={size} role="img" aria-label="Sentence Game"><defs><linearGradient id="sentenceGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="var(--color-primary)" /><stop offset="100%" stopColor="var(--color-bg)" /></linearGradient></defs><rect x="4" y="4" width="16" height="16" rx="3" fill="url(#sentenceGrad)"/><path d="M8 9h8M8 12h8M8 15h5" stroke="color-mix(in srgb, var(--color-text) 70%, transparent)" strokeWidth="1.5" strokeLinecap="round"/><circle cx="16.5" cy="15.5" r="2" fill="var(--color-text)"/><path d="M16 15.5l1 1 2-2" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>);
}
function EditIcon({ size = 18 }) {
  return (<svg viewBox="0 0 24 24" fill="none" width={size} height={size} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>);
}
function TrashIcon({ size = 18 }) {
  return (<svg viewBox="0 0 24 24" fill="none" width={size} height={size} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>);
}

function FlameIconEnhanced({ level = 0 }) {
  const [rainbowPhase, setRainbowPhase] = useState(0);
  useEffect(() => {
    if (level >= 60) {
      const interval = setInterval(() => setRainbowPhase(p => (p + 1) % 4), 3000);
      return () => clearInterval(interval);
    }
  }, [level]);
  let colorClass = 'flame-red';
  let gradientId = 'flameGradRed';
  let colors = ['#FFD18A', '#FFB347', '#FF8C42'];
  if (level >= 60) {
    colorClass = 'flame-rainbow';
    gradientId = 'flameGradRainbow';
    const phases = [['#FFD18A', '#FFB347', '#FF8C42'],['#FFE59A', '#FF8C42', '#F97316'],['#FFF0A3', '#FFD700', '#FF8C42'],['#C8BFFF', '#9D92E0', '#7B6FD4']];
    colors = phases[rainbowPhase];
  } else if (level >= 45) { colorClass = 'flame-purple'; gradientId = 'flameGradPurple'; colors = ['#C8BFFF', '#9D92E0', '#7B6FD4']; }
  else if (level >= 30) { colorClass = 'flame-blue'; gradientId = 'flameGradBlue'; colors = ['#FFF0A3', '#FFD700', '#FF8C42']; }
  else if (level >= 15) { colorClass = 'flame-white'; gradientId = 'flameGradWhite'; colors = ['#FFE59A', '#FF8C42', '#F97316']; }
  return (
    <div className={`flame-container ${colorClass}`}>
      <svg viewBox="0 0 100 120" className="flame-svg" role="img" aria-label={`Level ${level}`}>
        <defs>
          <radialGradient id={gradientId} cx="50%" cy="35%" r="65%">
            <stop offset="0%" style={{ stopColor: colors[0], transition: 'stop-color 3s ease-in-out' }} />
            <stop offset="45%" style={{ stopColor: colors[1], transition: 'stop-color 3s ease-in-out' }} />
            <stop offset="100%" style={{ stopColor: colors[2], transition: 'stop-color 3s ease-in-out' }} />
          </radialGradient>
        </defs>
        <path d="M50 4 C66 22 88 40 82 72 C78 100 60 114 50 114 C40 114 22 100 18 72 C12 40 34 22 50 4 Z" fill={`url(#${gradientId})`} opacity="0.96"/>
        <path d="M50 24 C60 38 74 50 68 72 C64 90 55 100 50 100 C45 100 36 90 32 72 C26 50 40 38 50 24 Z" style={{ fill: colors[0], transition: 'fill 3s ease-in-out', opacity: 0.5 }} />
      </svg>
      <span className="flame-level">{level}</span>
    </div>
  );
}

/* ============================================= */
/* ESSENTIAL WORDS DATA (50 words x 7 languages) */
/* ============================================= */
const ESSENTIAL_WORDS = [
{ ar: "مرحباً", en: "Hello", fr: "Bonjour", es: "Hola", de: "Hallo", pt: "Olá", ja: "こんにちは" },
{ ar: "شكراً", en: "Thank you", fr: "Merci", es: "Gracias", de: "Danke", pt: "Obrigado", ja: "ありがとう" },
{ ar: "من فضلك", en: "Please", fr: "S'il vous plaît", es: "Por favor", de: "Bitte", pt: "Por favor", ja: "お願いします" },
{ ar: "نعم", en: "Yes", fr: "Oui", es: "Sí", de: "Ja", pt: "Sim", ja: "はい" },
{ ar: "لا", en: "No", fr: "Non", es: "No", de: "Nein", pt: "Não", ja: "いいえ" },
{ ar: "ماء", en: "Water", fr: "Eau", es: "Agua", de: "Wasser", pt: "Água", ja: "水" },
{ ar: "خبز", en: "Bread", fr: "Pain", es: "Pan", de: "Brot", pt: "Pão", ja: "パン" },
{ ar: "طعام", en: "Food", fr: "Nourriture", es: "Comida", de: "Essen", pt: "Comida", ja: "食べ物" },
{ ar: "منزل", en: "House", fr: "Maison", es: "Casa", de: "Haus", pt: "Casa", ja: "家" },
{ ar: "صديق", en: "Friend", fr: "Ami", es: "Amigo", de: "Freund", pt: "Amigo", ja: "友達" },
{ ar: "عائلة", en: "Family", fr: "Famille", es: "Familia", de: "Familie", pt: "Família", ja: "家族" },
{ ar: "أم", en: "Mother", fr: "Mère", es: "Madre", de: "Mutter", pt: "Mãe", ja: "母" },
{ ar: "أب", en: "Father", fr: "Père", es: "Padre", de: "Vater", pt: "Pai", ja: "父" },
{ ar: "أخ", en: "Brother", fr: "Frère", es: "Hermano", de: "Bruder", pt: "Irmão", ja: "兄" },
{ ar: "أخت", en: "Sister", fr: "Sœur", es: "Hermana", de: "Schwester", pt: "Irmã", ja: "姉" },
{ ar: "حب", en: "Love", fr: "Amour", es: "Amor", de: "Liebe", pt: "Amor", ja: "愛" },
{ ar: "كتاب", en: "Book", fr: "Livre", es: "Libro", de: "Buch", pt: "Livro", ja: "本" },
{ ar: "مدرسة", en: "School", fr: "École", es: "Escuela", de: "Schule", pt: "Escola", ja: "学校" },
{ ar: "معلم", en: "Teacher", fr: "Professeur", es: "Profesor", de: "Lehrer", pt: "Professor", ja: "先生" },
{ ar: "طالب", en: "Student", fr: "Étudiant", es: "Estudiante", de: "Student", pt: "Estudante", ja: "学生" },
{ ar: "عمل", en: "Work", fr: "Travail", es: "Trabajo", de: "Arbeit", pt: "Trabalho", ja: "仕事" },
{ ar: "مال", en: "Money", fr: "Argent", es: "Dinero", de: "Geld", pt: "Dinheiro", ja: "お金" },
{ ar: "وقت", en: "Time", fr: "Temps", es: "Tiempo", de: "Zeit", pt: "Tempo", ja: "時間" },
{ ar: "يوم", en: "Day", fr: "Jour", es: "Día", de: "Tag", pt: "Dia", ja: "日" },
{ ar: "ليل", en: "Night", fr: "Nuit", es: "Noche", de: "Nacht", pt: "Noite", ja: "夜" },
{ ar: "صباح", en: "Morning", fr: "Matin", es: "Mañana", de: "Morgen", pt: "Manhã", ja: "朝" },
{ ar: "مساء", en: "Evening", fr: "Soir", es: "Tarde", de: "Abend", pt: "Tarde", ja: "夕方" },
{ ar: "اليوم", en: "Today", fr: "Aujourd'hui", es: "Hoy", de: "Heute", pt: "Hoje", ja: "今日" },
{ ar: "غداً", en: "Tomorrow", fr: "Demain", es: "Mañana", de: "Morgen", pt: "Amanhã", ja: "明日" },
{ ar: "أمس", en: "Yesterday", fr: "Hier", es: "Ayer", de: "Gestern", pt: "Ontem", ja: "昨日" },
{ ar: "كبير", en: "Big", fr: "Grand", es: "Grande", de: "Groß", pt: "Grande", ja: "大きい" },
{ ar: "صغير", en: "Small", fr: "Petit", es: "Pequeño", de: "Klein", pt: "Pequeno", ja: "小さい" },
{ ar: "جيد", en: "Good", fr: "Bon", es: "Bueno", de: "Gut", pt: "Bom", ja: "良い" },
{ ar: "سيء", en: "Bad", fr: "Mauvais", es: "Malo", de: "Schlecht", pt: "Mau", ja: "悪い" },
{ ar: "حار", en: "Hot", fr: "Chaud", es: "Caliente", de: "Heiß", pt: "Quente", ja: "熱い" },
{ ar: "بارد", en: "Cold", fr: "Froid", es: "Frío", de: "Kalt", pt: "Frio", ja: "冷たい" },
{ ar: "سعيد", en: "Happy", fr: "Heureux", es: "Feliz", de: "Glücklich", pt: "Feliz", ja: "幸せ" },
{ ar: "حزين", en: "Sad", fr: "Triste", es: "Triste", de: "Traurig", pt: "Triste", ja: "悲しい" },
{ ar: "جميل", en: "Beautiful", fr: "Beau", es: "Hermoso", de: "Schön", pt: "Bonito", ja: "美しい" },
{ ar: "سريع", en: "Fast", fr: "Rapide", es: "Rápido", de: "Schnell", pt: "Rápido", ja: "速い" },
{ ar: "بطيء", en: "Slow", fr: "Lent", es: "Lento", de: "Langsam", pt: "Lento", ja: "遅い" },
{ ar: "رجل", en: "Man", fr: "Homme", es: "Hombre", de: "Mann", pt: "Homem", ja: "男" },
{ ar: "امرأة", en: "Woman", fr: "Femme", es: "Mujer", de: "Frau", pt: "Mulher", ja: "女性" },
{ ar: "طفل", en: "Child", fr: "Enfant", es: "Niño", de: "Kind", pt: "Criança", ja: "子供" },
{ ar: "مدينة", en: "City", fr: "Ville", es: "Ciudad", de: "Stadt", pt: "Cidade", ja: "都市" },
{ ar: "شارع", en: "Street", fr: "Rue", es: "Calle", de: "Straße", pt: "Rua", ja: "道" },
{ ar: "سيارة", en: "Car", fr: "Voiture", es: "Coche", de: "Auto", pt: "Carro", ja: "車" },
{ ar: "هاتف", en: "Phone", fr: "Téléphone", es: "Teléfono", de: "Telefon", pt: "Telefone", ja: "電話" },
{ ar: "حاسوب", en: "Computer", fr: "Ordinateur", es: "Computadora", de: "Computer", pt: "Computador", ja: "コンピューター" },
{ ar: "مساعدة", en: "Help", fr: "Aide", es: "Ayuda", de: "Hilfe", pt: "Ajuda", ja: "助け" }
];

function isWordChar(ch) {
  return /[a-zA-ZÀ-ÿ0-9\u0600-\u06FF\u3040-\u30FF\u4E00-\u9FFF]/.test(ch);
}

function buildEssentialSet(lang1, lang2, name) {
  const words = ESSENTIAL_WORDS.map((w, i) => ({
    id: "ess_" + lang1 + "_" + lang2 + "_" + i,
    word: w[lang1] || w.en,
    translation: w[lang2] || w.en
  }));
  return {
    id: "essential_" + lang1 + "_" + lang2,
    name: name,
    lang1: lang1,
    lang2: lang2,
    words: words,
    isEssential: true
  };
}

const DEFAULT_SETS = [{
  id: "set_demo_1", name: "Français → العربية", lang1: "fr", lang2: "ar",
  words: [
    { id: "w1", word: "Bonjour", translation: "مرحباً" }, { id: "w2", word: "Merci", translation: "شكراً" },
    { id: "w3", word: "École", translation: "مدرسة" }, { id: "w4", word: "Livre", translation: "كتاب" },
    { id: "w5", word: "Maison", translation: "منزل" }, { id: "w6", word: "Amour", translation: "حب" },
    { id: "w7", word: "Famille", translation: "عائلة" }, { id: "w8", word: "Voiture", translation: "سيارة" },
    { id: "w9", word: "Chat", translation: "قطة" }, { id: "w10", word: "Chien", translation: "كلب" }
  ]
}];

function ProfileCard({ user, usage, savedCount, onAvatarClick }) {
  const { t } = useI18n();
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : <UiIcon name="user" size={28} />;
  const greeting = user?.name ? `${t("welcomeBack")}, ${user.name}!` : t("welcomeGuest");
  return (
    <div className="profile-card">
      <div className="profile-header">
        <div className="avatar" onClick={onAvatarClick} title={t("changePic")}>{user?.avatar || user?.avatar_url ? <img src={user.avatar || user.avatar_url} alt="profile" /> : initial}</div>
        <div className="profile-info">
          <div className="profile-greeting">{greeting} <span className="wave"><WaveIcon size={22} color="var(--color-primary)" /></span></div>
          <div className="profile-note">{t("guestNote")}</div>
        </div>
      </div>
      <div className="profile-stats">
        <div className="stat-item"><FlameIconEnhanced level={usage.level} /><span><div className="stat-label">{t("level")}</div></span></div>
        <div className="stat-item"><ClockIcon size={24} /><span><span className="value">{usage.fmt(usage.today)}</span><div className="stat-label">{t("today")}</div></span></div>
        <div className="stat-item"><GemIcon size={24} color="var(--color-primary)" /><span><span className="value">{savedCount}</span><div className="stat-label">{t("saved")}</div></span></div>
      </div>
    </div>
  );
}

function AccountNav({ user, onLogout }) {
  const initials = (user.name || user.email || "U").trim().split(/\s+/).slice(0, 2).map(part => part.charAt(0)).join("").toUpperCase();
  return (
    <div className="account-nav">
      <div className="account-nav-avatar">{user.avatar || user.avatar_url ? <img src={user.avatar || user.avatar_url} alt="" /> : initials}</div>
      <span className="account-nav-name">{user.name || user.email}</span>
      <button type="button" className="account-logout" onClick={onLogout} aria-label="Déconnexion" title="Déconnexion">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4M14 8l4 4-4 4M8 12h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        <span className="account-logout-label">Déconnexion</span>
      </button>
    </div>
  );
}

function SelectSetDropdown({ sets, currentSetId, onSelect, onEdit, onDelete, onCreate, onOpenEssential }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const current = sets.find(s => s.id === currentSetId);
  const filtered = sets.filter(s => s.name.toLowerCase().includes(q.toLowerCase()));
  const showEssential = !q || t("essentialFolder").toLowerCase().includes(q.toLowerCase()) || "essential".includes(q.toLowerCase()) || "50".includes(q) || "folder".includes(q.toLowerCase());
  return (
    <div className="dropdown-wrapper">
      <button type="button" className="dropdown-trigger" onClick={() => setOpen(!open)}>
        <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <FolderIcon size={22} />
          <span>{current ? current.name : t("selectSet")}</span>
        </span>
        <span className={`arrow ${open ? "open" : ""}`}>▼</span>
      </button>
      {open && (
        <div className="dropdown-menu">
          <input className="dropdown-search" value={q} onChange={e => setQ(e.target.value)} placeholder={t("search")} autoFocus />
          {showEssential && (
            <div className="dropdown-item essential" onClick={() => { setOpen(false); onOpenEssential(); }}>
              <span className="essential-folder-emoji"><EssentialFolderIcon size={30} /></span>
              <div className="dropdown-item-main">
                <div className="dropdown-item-name">{t("essentialFolder")}</div>
                <div className="dropdown-item-meta">{t("essentialFolderDesc")}</div>
              </div>
              <span className="essential-badge">50</span>
            </div>
          )}
          {filtered.length === 0 && !showEssential && <div className="muted" style={{ padding: "14px" }}>{t("noSet")}</div>}
          {filtered.map(set => {
            const l1 = getLang(set.lang1);
            const l2 = getLang(set.lang2);
            return (
              <div key={set.id} className="dropdown-item" onClick={() => { onSelect(set.id); setOpen(false); }}>
                <div className="dropdown-item-main">
                  <div className="dropdown-item-name"><UiIcon name="globe" size={16} /> {l1.name} / {l2.name} · {set.name}</div>
                  <div className="dropdown-item-meta">{set.words.length} {t("words")}</div>
                </div>
                <div className="dropdown-item-actions">
                  <button type="button" className="icon-btn" title={t("edit")} onClick={(e) => { e.stopPropagation(); onEdit(set.id); setOpen(false); }}><EditIcon /></button>
                  <button type="button" className="icon-btn danger" title={t("delete")} onClick={(e) => { e.stopPropagation(); if (confirm(t("confirmDeleteSet"))) onDelete(set.id); }}><TrashIcon /></button>
                </div>
              </div>
            );
          })}
          <div className="dropdown-item primary" onClick={() => { setOpen(false); onCreate(); }}>
            <PlusIcon size={16} /> {t("createSet")}
          </div>
        </div>
      )}
    </div>
  );
}

function Sanctuary({ count, onPlay }) {
  const { t } = useI18n();
  const countText = count === 1 ? t("preciousWordSingular") : `${count} ${t("preciousWords")}`;
  return (
    <div className="sanctuary">
      <div className="sanctuary-header">
        <div className="sanctuary-info">
          <div className="sanctuary-icon"><UiIcon name="castle" size={34} /></div>
          <div>
            <div className="sanctuary-title">{t("sanctuary")}</div>
            <div className="sanctuary-subtitle">{t("sanctuarySubtitle")}</div>
            <span className="sanctuary-count"><GemIcon size={14} color="var(--color-primary)" /> {countText}</span>
          </div>
        </div>
        <button type="button" className="btn btn-gold" onClick={onPlay} disabled={count === 0}>
          <PlayIcon size={14} /> {t("playSanctuary")}
        </button>
      </div>
    </div>
  );
}

