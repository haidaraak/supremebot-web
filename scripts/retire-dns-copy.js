/* Retires the DNS-TXT verification claim from the copy.
 *
 * The captured backend performs no target verification: /api/attacks carries
 * only target/method/duration/concurrent, and no verification route appears in
 * the HAR. The old copy described a gate that does not exist, so it is replaced
 * with the authorization framing that is actually true — test what you own or
 * are permitted to test. Nothing here is replaced by "no verification, target
 * anyone"; the authorized-scope language is kept deliberately.
 */
const fs = require("fs");
const path = require("path");

const LOCALES = ["en", "ar", "de", "es", "fr", "pt", "ru", "tr"];
const DIR = path.join(__dirname, "..", "src", "i18n", "locales");

const R = {
  "hero.subtitle": {
    en: "SupremeBot generates controlled load against your own targets — with live telemetry, precise controls and an API built for automation.",
    ar: "يولّد SupremeBot حِملًا مُتحكَّمًا تجاه أهدافك الخاصة — مع قياسات حية وتحكم دقيق وواجهة برمجية مبنية للأتمتة.",
    de: "SupremeBot erzeugt kontrollierte Last gegen Ihre eigenen Ziele — mit Live-Telemetrie, präzisen Steuerungen und einer API für Automatisierung.",
    es: "SupremeBot genera carga controlada hacia tus propios objetivos — con telemetría en vivo, controles precisos y una API diseñada para la automatización.",
    fr: "SupremeBot génère une charge contrôlée vers vos propres cibles — avec télémétrie en direct, contrôles précis et une API pensée pour l'automatisation.",
    pt: "O SupremeBot gera carga controlada contra seus próprios alvos — com telemetria em tempo real, controles precisos e uma API feita para automação.",
    ru: "SupremeBot создаёт контролируемую нагрузку на ваши собственные цели — с живой телеметрией, точным управлением и API для автоматизации.",
    tr: "SupremeBot kendi hedeflerinize kontrollü yük üretir — canlı telemetri, hassas kontroller ve otomasyon için tasarlanmış bir API ile.",
  },
  "hero.trusted": {
    en: "Authorized testing only",
    ar: "اختبار مصرّح به فقط",
    de: "Nur autorisierte Tests",
    es: "Solo pruebas autorizadas",
    fr: "Tests autorisés uniquement",
    pt: "Apenas testes autorizados",
    ru: "Только авторизованное тестирование",
    tr: "Yalnızca yetkili test",
  },
  "steps.subtitle": {
    en: "Three steps. No calls, no sales queue — sign up, configure your test and launch.",
    ar: "ثلاث خطوات. لا مكالمات ولا طوابير مبيعات — سجّل، اضبط اختبارك ثم أطلقه.",
    de: "Drei Schritte. Keine Anrufe, keine Warteschlange — anmelden, Test konfigurieren, starten.",
    es: "Tres pasos. Sin llamadas ni colas de ventas — regístrate, configura tu prueba y lánzala.",
    fr: "Trois étapes. Aucun appel, aucune file d'attente — inscrivez-vous, configurez votre test et lancez-le.",
    pt: "Três passos. Sem ligações nem fila de vendas — cadastre-se, configure seu teste e inicie.",
    ru: "Три шага. Без звонков и очередей — зарегистрируйтесь, настройте тест и запустите.",
    tr: "Üç adım. Arama yok, satış kuyruğu yok — kaydolun, testinizi yapılandırın ve başlatın.",
  },
  "steps.s2Title": {
    en: "Confirm your scope",
    ar: "أكّد نطاقك",
    de: "Scope bestätigen",
    es: "Confirma tu alcance",
    fr: "Confirmez votre périmètre",
    pt: "Confirme seu escopo",
    ru: "Подтвердите область тестирования",
    tr: "Kapsamınızı onaylayın",
  },
  "steps.s2Desc": {
    en: "Decide which hosts you own or are authorized to test, and record that scope before you launch.",
    ar: "حدّد المضيفات التي تملكها أو المخوّلة لك باختبارها، وسجّل هذا النطاق قبل الإطلاق.",
    de: "Legen Sie fest, welche Hosts Ihnen gehören oder zum Testen freigegeben sind, und halten Sie diesen Scope vor dem Start fest.",
    es: "Decide qué hosts son tuyos o están autorizados para probar, y registra ese alcance antes de lanzar.",
    fr: "Déterminez les hôtes que vous possédez ou êtes autorisé à tester, et enregistrez ce périmètre avant de lancer.",
    pt: "Defina quais hosts são seus ou estão autorizados para teste, e registre esse escopo antes de iniciar.",
    ru: "Определите, какие хосты принадлежат вам или разрешены для тестирования, и зафиксируйте эту область перед запуском.",
    tr: "Hangi hostların size ait olduğunu veya test etmeye yetkili olduğunuzu belirleyin ve başlatmadan önce bu kapsamı kaydedin.",
  },
  "features.f4Title": {
    en: "Authorized testing only",
    ar: "اختبار مصرّح به فقط",
    de: "Nur autorisierte Tests",
    es: "Solo pruebas autorizadas",
    fr: "Tests autorisés uniquement",
    pt: "Apenas testes autorizados",
    ru: "Только авторизованное тестирование",
    tr: "Yalnızca yetkili test",
  },
  "features.f4Desc": {
    en: "Every test runs against infrastructure you own or have written permission to test. The platform is built for authorized load testing, not for targeting third parties.",
    ar: "كل اختبار يُطلق تجاه بنية تحتية تملكها أو لديك إذن مكتوب باختبارها. المنصة مصممة لاختبار الحمل المصرّح به، لا لاستهداف أطراف أخرى.",
    de: "Jeder Test läuft gegen Infrastruktur, die Sie besitzen oder für die Sie eine schriftliche Erlaubnis haben. Die Plattform ist für autorisiertes Lasttesting gebaut — nicht für Angriffe auf Dritte.",
    es: "Cada prueba se ejecuta contra infraestructura que posees o para la que tienes permiso escrito. La plataforma está diseñada para pruebas de carga autorizadas, no para atacar a terceros.",
    fr: "Chaque test s'exécute sur une infrastructure que vous possédez ou que vous êtes autorisé à tester par écrit. La plateforme est conçue pour des tests de charge autorisés, pas pour cibler des tiers.",
    pt: "Cada teste é executado contra infraestrutura que você possui ou tem permissão por escrito para testar. A plataforma é feita para testes de carga autorizados, não para atacar terceiros.",
    ru: "Каждый тест запускается против инфраструктуры, которой вы владеете или на тестирование которой получили письменное разрешение. Платформа создана для авторизованного нагрузочного тестирования, а не для атаки третьих лиц.",
    tr: "Her test, size ait olduğunuz veya yazılı izniniz olan altyapıya karşı çalışır. Platform yetkili yük testleri içindir, üçüncü tarafları hedeflemek için değil.",
  },
  "faq.a1": {
    en: "Stress testing infrastructure you own — or have written authorization to test — is legal in most jurisdictions. SupremeBot is built for that use, and is not intended for use against infrastructure you do not control.",
    ar: "اختبار البنية التحتية التي تملكها — أو لديك إذن مكتوب باختبارها — قانوني في معظم الدول. صُمِّم SupremeBot لهذا الاستخدام، ولا يُقصد به الاستخدام ضد بنية تحتية لا تتحكم بها.",
    de: "Das Belastungstesten eigener Infrastruktur — oder mit schriftlicher Erlaubnis — ist in den meisten Ländern legal. SupremeBot ist genau dafür gebaut und nicht für Infrastruktur gedacht, die Sie nicht kontrollieren.",
    es: "Probar la infraestructura que posees — o para la que tienes autorización escrita — es legal en la mayoría de jurisdicciones. SupremeBot está diseñado para ese uso, y no para usarse contra infraestructura que no controlas.",
    fr: "Tester en charge l'infrastructure que vous possédez — ou que vous êtes autorisé à tester par écrit — est légal dans la plupart des pays. SupremeBot est conçu pour cet usage, et non pour une infrastructure que vous ne contrôlez pas.",
    pt: "Testar a infraestrutura que você possui — ou tem autorização por escrito para testar — é legal na maioria das jurisdições. O SupremeBot é feito para esse uso, e não para uso contra infraestrutura que você não controla.",
    ru: "Нагрузочное тестирование инфраструктуры, которой вы владеете или на тестирование которой получили письменное разрешение, законно в большинстве юрисдикций. SupremeBot создан именно для этого, а не для использования против инфраструктуры, которой вы не управляете.",
    tr: "Kendi altyapınızın — veya yazılı izniniz olan altyapının — yük testini yapmak çoğu ülkede yasaldır. SupremeBot bu kullanım için üretilmiştir; kontrol etmediğiniz altyapıya yönelik değildir.",
  },
  "faq.q2": {
    en: "What can I test?",
    ar: "ماذا يمكنني اختباره؟",
    de: "Was darf ich testen?",
    es: "¿Qué puedo probar?",
    fr: "Que puis-je tester ?",
    pt: "O que posso testar?",
    ru: "Что я могу тестировать?",
    tr: "Neleri test edebilirim?",
  },
  "faq.a2": {
    en: "Hosts and services you operate, or infrastructure where you hold written authorization to load-test. If you are unsure whether a target is in scope, confirm with its owner before launching.",
    ar: "مضيفات وخدمات تشغّلها، أو بنية تحتية لديك إذن مكتبي باختبار حملها. إن لم تكن متأكدًا من أن هدفًا ضمن نطاقك، فأكّد ذلك مع مالكه قبل الإطلاق.",
    de: "Hosts und Dienste, die Sie betreiben, oder Infrastruktur, für die Sie eine schriftliche Erlaubnis zum Lasttest haben. Wenn Sie unsicher sind, ob ein Ziel in Ihren Scope fällt, klären Sie das vor dem Start mit dem Eigentümer.",
    es: "Hosts y servicios que operas, o infraestructura para la que tienes autorización escrita de probar. Si dudas de si un objetivo está dentro de tu alcance, confírmalo con su propietario antes de lanzar.",
    fr: "Les hôtes et services que vous exploitez, ou l'infrastructure pour laquelle vous détenez une autorisation écrite de tester en charge. Si vous doutez de l'appartenance d'une cible à votre périmètre, confirmez-le auprès de son propriétaire avant de lancer.",
    pt: "Hosts e serviços que você opera, ou infraestrutura onde você tem autorização por escrito para testar. Se não tem certeza de que um alvo está no escopo, confirme com o proprietário antes de iniciar.",
    ru: "Хосты и службы, которыми вы управляете, или инфраструктура, на нагрузочное тестирование которой у вас есть письменное разрешение. Если вы не уверены, входит ли цель в область тестирования, уточните это у её владельца перед запуском.",
    tr: "İşlettiğiniz host ve hizmetler, veya yük testi için yazılı yetkinizin olduğu altyapı. Bir hedefin kapsamınızda olduğundan emin değilseniz, başlatmadan önce sahibiyle teyit edin.",
  },
  "faq.a5": {
    en: "About 60 seconds. Sign up, choose a plan and run your first test. Most users launch within five minutes.",
    ar: "نحو 60 ثانية. سجّل، اختر خطة وأطلق أول اختبار. معظم المستخدمين يُطلقون خلال خمس دقائق.",
    de: "Etwa 60 Sekunden. Anmelden, Plan wählen, ersten Test starten. Die meisten Nutzer starten innerhalb von fünf Minuten.",
    es: "Unos 60 segundos. Regístrate, elige un plan y ejecuta tu primera prueba. La mayoría la lanza en cinco minutos.",
    fr: "Environ 60 secondes. Inscrivez-vous, choisissez un forfait et lancez votre premier test. La plupart des utilisateurs lancent en cinq minutes.",
    pt: "Cerca de 60 segundos. Cadastre-se, escolha um plano e execute seu primeiro teste. A maioria inicia em cinco minutos.",
    ru: "Около 60 секунд. Зарегистрируйтесь, выберите тариф и запустите первый тест. Большинство пользователей запускают его в течение пяти минут.",
    tr: "Yaklaşık 60 saniye. Kaydolun, bir plan seçin ve ilk testinizi başlatın. Çoğu kullanıcı beş dakika içinde başlatır.",
  },
  "cta.subtitle": {
    en: "Free to sign up. Run your first authorized test in under five minutes.",
    ar: "التسجيل مجاني. أطلق أول اختبار مصرّح به خلال أقل من خمس دقائق.",
    de: "Kostenlose Anmeldung. Führen Sie Ihren ersten autorisierten Test in unter fünf Minuten durch.",
    es: "Registro gratuito. Ejecuta tu primera prueba autorizada en menos de cinco minutos.",
    fr: "Inscription gratuite. Lancez votre premier test autorisé en moins de cinq minutes.",
    pt: "Cadastro gratuito. Execute seu primeiro teste autorizado em menos de cinco minutos.",
    ru: "Регистрация бесплатна. Запустите первый авторизованный тест менее чем за пять минут.",
    tr: "Kayıt ücretsiz. İlk yetkili testinizi beş dakikadan kısa sürede başlatın.",
  },
  "launch.subtitle": {
    en: "Test only infrastructure you own or are authorized to test.",
    ar: "اختبر فقط البنية التحتية التي تملكها أو المخوّلة لك باختبارها.",
    de: "Testen Sie nur Infrastruktur, die Sie besitzen oder die zum Testen freigegeben ist.",
    es: "Prueba solo la infraestructura que posees o estás autorizado a probar.",
    fr: "Ne testez que l'infrastructure que vous possédez ou êtes autorisé à tester.",
    pt: "Teste apenas a infraestrutura que você possui ou está autorizado a testar.",
    ru: "Тестируйте только инфраструктуру, которой вы владеете или которую вам разрешено тестировать.",
    tr: "Yalnızca size ait olduğunuz veya test etmeye yetkili olduğunuz altyapıyı test edin.",
  },
  "compare.row_dns": {
    en: "Authorized scope — your own infrastructure or written permission",
    ar: "نطاق مصرّح به — بنيتك التحتية أو إذن مكتوب",
    de: "Autorisierter Scope — eigene Infrastruktur oder schriftliche Erlaubnis",
    es: "Alcance autorizado — infraestructura propia o permiso escrito",
    fr: "Périmètre autorisé — infrastructure propre ou permission écrite",
    pt: "Escopo autorizado — infraestrutura própria ou permissão por escrito",
    ru: "Авторизованная область — своя инфраструктура или письменное разрешение",
    tr: "Yetkili kapsam — kendi altyapınız veya yazılı izin",
  },
};

function set(obj, dotted, value) {
  const parts = dotted.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (cur[parts[i]] === undefined) throw new Error(`missing path ${dotted}`);
    cur = cur[parts[i]];
  }
  const last = parts[parts.length - 1];
  if (!(last in cur)) throw new Error(`missing key ${dotted}`);
  cur[last] = value;
}

let changed = 0;
for (const locale of LOCALES) {
  const file = path.join(DIR, `${locale}.json`);
  const doc = JSON.parse(fs.readFileSync(file, "utf8"));
  for (const [key, byLocale] of Object.entries(R)) {
    set(doc, key, byLocale[locale]);
    changed++;
  }
  fs.writeFileSync(file, JSON.stringify(doc, null, 2) + "\n");
}
console.log(`updated ${changed} strings across ${LOCALES.length} locales`);

// Report any residual DNS/TXT wording that slipped past the table.
const residue = [];
for (const locale of LOCALES) {
  const doc = JSON.parse(fs.readFileSync(path.join(DIR, `${locale}.json`), "utf8"));
  const walk = (v, p) => {
    if (typeof v === "string") {
      if (/\bTXT\b|DNS/i.test(v)) residue.push(`${locale} ${p}: ${v}`);
    } else if (v && typeof v === "object") {
      for (const k in v) walk(v[k], p ? `${p}.${k}` : k);
    }
  };
  walk(doc, "");
}
console.log(residue.length ? residue.join("\n") : "no residual DNS/TXT copy");
