/* Phase 5b copy: host-tab labels, the managed origin-discovery service, and the
 * operator quote. Idempotent — existing keys are left untouched. Run with
 * `node scripts/add-phase5b-copy.js`. */
const fs = require("fs");
const path = require("path");

const LOCALES = ["en", "ar", "de", "es", "fr", "pt", "ru", "tr"];
const DIR = path.join(__dirname, "..", "src", "i18n", "locales");

const COPY = {
  tools: {
    dnsTitle: {
      en: "DNS records for {{host}}",
      ar: "سجلات DNS لـ {{host}}",
      de: "DNS-Einträge für {{host}}",
      es: "Registros DNS de {{host}}",
      fr: "Enregistrements DNS pour {{host}}",
      pt: "Registros DNS de {{host}}",
      ru: "DNS-записи для {{host}}",
      tr: "{{host}} için DNS kayıtları",
    },
    nxdomain: {
      en: "{{host}} does not resolve — the name is not registered or has no DNS records.",
      ar: "لا يتم حل {{host}} — الاسم غير مسجل أو ليس لديه سجلات DNS.",
      de: "{{host}} lässt sich nicht auflösen — der Name ist nicht registriert oder hat keine DNS-Einträge.",
      es: "{{host}} no resuelve — el nombre no está registrado o no tiene registros DNS.",
      fr: "{{host}} ne se résout pas — le nom n'est pas enregistré ou n'a aucun enregistrement DNS.",
      pt: "{{host}} não resolve — o nome não está registrado ou não possui registros DNS.",
      ru: "{{host}} не разрешается — имя не зарегистрировано или не имеет DNS-записей.",
      tr: "{{host}} çözümlenmiyor — ad kayıtlı değil veya DNS kaydı yok.",
    },
    noRecords: {
      en: "No records returned for this query.",
      ar: "لم تُرجع أي سجلات لهذا الاستعلام.",
      de: "Für diese Abfrage wurden keine Einträge zurückgegeben.",
      es: "Esta consulta no devolvió registros.",
      fr: "Aucun enregistrement renvoyé pour cette requête.",
      pt: "Nenhum registro retornado para esta consulta.",
      ru: "По этому запросу записей не найдено.",
      tr: "Bu sorgu için kayıt dönmedi.",
    },
    cdnHintLabel: {
      en: "Fronted by a CDN or WAF.",
      ar: "يتم إدارته عبر CDN أو WAF.",
      de: "Durch ein CDN oder WAF vorbereitet.",
      es: "Protegido por un CDN o WAF.",
      fr: "Placé derrière un CDN ou un WAF.",
      pt: "Protegido por um CDN ou WAF.",
      ru: "Размещён за CDN или WAF.",
      tr: "Bir CDN veya WAF arkasında.",
    },
    cdnHintNote: {
      en: "Observed from reverse DNS only. The reported address belongs to the front, not to anything behind it.",
      ar: "مُلاحَظ من DNS العكسي فقط. العنوان المُبلَّغ ينتمي للواجهة، ليس لما خلفها.",
      de: "Nur aus Reverse-DNS abgeleitet. Die gemeldete Adresse gehört dem Front, nicht dem Dahinterliegenden.",
      es: "Se deduce solo del DNS inverso. La dirección pertenece al frontal, no a lo que haya detrás.",
      fr: "Déduit du DNS inverse seulement. L'adresse appartient à la façade, pas à ce qui se trouve derrière.",
      pt: "Deduzido apenas do DNS reverso. O endereço pertence à frente, não ao que está atrás.",
      ru: "Определено только по обратному DNS. Адрес принадлежит фронту, а не тому, что за ним.",
      tr: "Yalnızca ters DNS'ten çıkarıldı. Bildirilen adres ön tarafa aittir, arkasındaki hiçbir şeye değil.",
    },
    colType: { en: "Type", ar: "النوع", de: "Typ", es: "Tipo", fr: "Type", pt: "Tipo", ru: "Тип", tr: "Tür" },
    colName: { en: "Name", ar: "الاسم", de: "Name", es: "Nombre", fr: "Nom", pt: "Nome", ru: "Имя", tr: "Ad" },
    colTtl: { en: "TTL", ar: "TTL", de: "TTL", es: "TTL", fr: "TTL", pt: "TTL", ru: "TTL", tr: "TTL" },
    colValue: { en: "Value", ar: "القيمة", de: "Wert", es: "Valor", fr: "Valeur", pt: "Valor", ru: "Значение", tr: "Değer" },
  },
  quote: {
    body: {
      en: "“Made for real stress operations. No fake power, no 30 second hype — just solid, long lasting performance when you need it. Push it hard, get real results, and if anything comes up, our team has your back.”",
      ar: "“صُنع لعمليات الضغط الحقيقية. لا قوة وهمية ولا ضجيج لمدة 30 ثانية — فقط أداء متين وطويل الأمد عند الحاجة. اضغط بقوة، احصل على نتائج حقيقية، وإن طرأ أي شيء، فريقنا يقف معك.”",
      de: "“Gemacht für echte Belastungstests. Keine Fake-Power, kein 30-Sekunden-Hype — nur solide, dauerhafte Leistung, wenn du sie brauchst. Geh ran, bekomm echte Ergebnisse, und wenn etwas auftaucht, steht unser Team hinter dir.”",
      es: "“Hecho para operaciones de estrés reales. Sin poder falso, sin hype de 30 segundos — solo rendimiento sólido y duradero cuando lo necesitas. Pruébalo a fondo, obtén resultados reales, y si surge algo, nuestro equipo te respalda.”",
      fr: "« Conçu pour de vraies opérations de charge. Pas de fausse puissance, pas de hype de 30 secondes — juste des performances solides et durables quand vous en avez besoin. Poussez fort, obtenez des résultats réels, et si quoi que ce soit survient, notre équipe vous couvre. »",
      pt: "“Feito para operações de estresse reais. Sem poder falso, sem hype de 30 segundos — apenas desempenho sólido e duradouro quando você precisa. Force, obtenha resultados reais, e se algo surgir, nossa equipe te apoia.”",
      ru: "«Создано для реальных нагрузочных операций. Никакой фейковой мощности и 30-секундного хайпа — только надёжная и долговечная производительность тогда, когда она нужна. Жмите на полную, получайте реальные результаты, а если что-то пойдёт не так — наша команда вас прикроет.»",
      tr: "“Gerçek stres operasyonları için yapıldı. Sahte güç yok, 30 saniyelik abartı yok — ihtiyaç duyduğunda sadece sağlam ve uzun ömürlü performans. Sıkıca bastır, gerçek sonuçlar al ve bir şey çıkarsa ekibimiz arkanda.”",
    },
    author: {
      en: "Private user",
      ar: "مستخدم خاص",
      de: "Privater Nutzer",
      es: "Usuario privado",
      fr: "Utilisateur privé",
      pt: "Usuário privado",
      ru: "Приватный пользователь",
      tr: "Özel kullanıcı",
    },
    role: {
      en: "Verified operator, red team",
      ar: "مُشغِّل موثَّق، فريق أحمر",
      de: "Verifizierter Operator, Red Team",
      es: "Operador verificado, red team",
      fr: "Opérateur vérifié, red team",
      pt: "Operador verificado, red team",
      ru: "Проверенный оператор, red team",
      tr: "Doğrulanmış operatör, kırmızı takım",
    },
  },
  services: {
    eyebrow: {
      en: "Managed services",
      ar: "خدمات مُدارة",
      de: "Managed Services",
      es: "Servicios gestionados",
      fr: "Services gérés",
      pt: "Serviços gerenciados",
      ru: "Управляемые услуги",
      tr: "Yönetilen hizmetler",
    },
    title: {
      en: "Work done by our team, not just tooling",
      ar: "العمل الذي يقوم به فريقنا، وليس الأدوات فقط",
      de: "Arbeit unseres Teams, nicht nur Werkzeug",
      es: "Trabajo hecho por nuestro equipo, no solo herramientas",
      fr: "Le travail de notre équipe, pas seulement des outils",
      pt: "Trabalho feito pela nossa equipe, não apenas ferramentas",
      ru: "Работу делает наша команда, а не только инструменты",
      tr: "Sadece araçlar değil, ekibimiz tarafından yapılan iş",
    },
    subtitle: {
      en: "Some questions need a person reading the output, not a form. These are delivered manually by our team, scoped to infrastructure you own or are authorised to have assessed.",
      ar: "بعض الأسئلة تحتاج شخصًا يقرأ النتائج، لا نموذجًا. تُقدَّم هذه يدويًا بواسطة فريقنا، ضمن البنية التحتية التي تملكها أو المخوَّلة لك بتقييمها.",
      de: "Manche Fragen brauchen einen Menschen, der das Ergebnis liest, kein Formular. Diese werden manuell von unserem Team geliefert — beschränkt auf Infrastruktur, die Sie besitzen oder bewerten lassen dürfen.",
      es: "Algunas preguntas necesitan a alguien leyendo el resultado, no un formulario. Los entrega manualmente nuestro equipo, limitados a infraestructura que posees o estás autorizado a que se evalúe.",
      fr: "Certaines questions exigent une personne qui lit le résultat, pas un formulaire. Ils sont livrés manuellement par notre équipe, limités à l'infrastructure que vous possédez ou êtes autorisé à faire évaluer.",
      pt: "Algumas perguntas exigem uma pessoa lendo o resultado, não um formulário. São entregues manualmente pela nossa equipe, limitados à infraestrutura que você possui ou está autorizado a ter avaliada.",
      ru: "На некоторые вопросы должен ответить человек, читающий вывод, а не форма. Их выполняет вручную наша команда — только для инфраструктуры, которой вы владеете или которую уполномочены проверить.",
      tr: "Bazı sorular form değil, sonucu okuyan bir kişi ister. Bunlar ekibimiz tarafından elle teslim edilir ve yalnızca size ait olduğunuz veya değerlendirilmesine yetkili olduğunuz altyapı için yapılır.",
    },
    originName: { en: "Origin Discovery", ar: "اكتشاف المصدر", de: "Origin Discovery", es: "Origin Discovery", fr: "Origin Discovery", pt: "Origin Discovery", ru: "Origin Discovery", tr: "Origin Discovery" },
    originPrice: { en: "$200", ar: "$200", de: "$200", es: "$200", fr: "$200", pt: "$200", ru: "$200", tr: "$200" },
    originHeadline: {
      en: "Find the real origin behind Cloudflare, DDoS-Guard and similar fronts",
      ar: "اعثر على المصدر الحقيقي خلف Cloudflare وDDoS-Guard وواجهات مماثلة",
      de: "Finde den echten Ursprung hinter Cloudflare, DDoS-Guard und ähnlichen Fronten",
      es: "Encuentra el origen real detrás de Cloudflare, DDoS-Guard y frentes similares",
      fr: "Trouvez l'origine réelle derrière Cloudflare, DDoS-Guard et fronts similaires",
      pt: "Encontre a origem real por trás de Cloudflare, DDoS-Guard e frentes similares",
      ru: "Найдите реальный источник за Cloudflare, DDoS-Guard и подобными фронтами",
      tr: "Cloudflare, DDoS-Guard ve benzeri ön yüzlerin arkasındaki gerçek kaynağı bulun",
    },
    originDesc: {
      en: "When a CDN or mitigation front answers for a name you are authorised to assess, we trace it back to its authoritative origin through passive sources — certificates, history, and the name's own configuration — and hand you a written report.",
      ar: "حين تجيب واجهة CDN أو حماية عن اسم مخوَّل لك بتقييمه، نتتبَّع أصلها الموثوق عبر مصادر سلبية — الشهادات، السجل، وإعدادات الاسم نفسه — ونسلِّمك تقريرًا مكتوبًا.",
      de: "Wenn ein CDN oder ein Schutz-Front für einen Namen antwortet, den Sie bewerten dürfen, verfolgen wir ihn über passive Quellen zurück zu seinem autoritativen Ursprung — Zertifikate, Verlauf und die Konfiguration des Namens selbst — und liefern einen schriftlichen Bericht.",
      es: "Cuando un CDN o un frente de mitigación responde por un nombre que estás autorizado a evaluar, rastreamos su origen autoritativo mediante fuentes pasivas — certificados, historial y la configuración del propio nombre — y te entregamos un informe escrito.",
      fr: "Lorsqu'un CDN ou un front d'atténuation répond pour un nom que vous êtes autorisé à évaluer, nous remontons à son origine faisant autorité via des sources passives — certificats, historique et la configuration du nom lui-même — et vous remettons un rapport écrit.",
      pt: "Quando um CDN ou frente de mitigação responde por um nome que você está autorizado a avaliar, rastreamos até sua origem autoritativa por fontes passivas — certificados, histórico e a própria configuração do nome — e entregamos um relatório escrito.",
      ru: "Если CDN или фронт защиты отвечает за имя, которое вы уполномочены проверять, мы прослеживаем его авторитетный источник по пассивным данным — сертификатам, истории и настройкам самого имени — и выдаём письменный отчёт.",
      tr: "Yetkili olduğunuz bir ad yerine bir CDN veya koruma ön yüzü cevap verdiğinde, onu pasif kaynaklarla — sertifikalar, geçmiş ve adın kendi yapılandırması — yetkili kaynağına kadar izler ve size yazılı bir rapor teslim ederiz.",
    },
    originIncluded: {
      en: "What is included",
      ar: "ماذا يشمل",
      de: "Was enthalten ist",
      es: "Qué incluye",
      fr: "Ce qui est inclus",
      pt: "O que está incluído",
      ru: "Что входит",
      tr: "Neler dahil",
    },
    originB1: { en: "Written report of the identified origin and the chain of evidence", ar: "تقرير مكتوب بالمصدر المُحدَّد وسلسلة الأدلة", de: "Schriftlicher Bericht zum ermittelten Ursprung und der Beweiskette", es: "Informe escrito del origen identificado y la cadena de evidencia", fr: "Rapport écrit de l'origine identifiée et de la chaîne de preuves", pt: "Relatório escrito da origem identificada e da cadeia de evidências", ru: "Письменный отчёт об источнике и цепочке доказательств", tr: "Belirlenen kaynak ve kanıt zincirinin yazılı raporu" },
    originB2: { en: "Passive sources only — no traffic is sent at your host", ar: "مصادر سلبية فقط — لا يُرسَل أي траيف نحو مضيفك", de: "Nur passive Quellen — es wird kein Traffic an Ihren Host gesendet", es: "Solo fuentes pasivas — no se envía tráfico a tu host", fr: "Sources passives uniquement — aucun trafic envoyé vers votre hôte", pt: "Apenas fontes passivas — nenhum tráfego é enviado ao seu host", ru: "Только пассивные источники — на ваш хост не отправляется трафик", tr: "Yalnızca pasif kaynaklar — hostunuza trafik gönderilmez" },
    originB3: { en: "Turnaround within 48 hours, scoped to the domains you own", ar: "التسليم خلال 48 ساعة، ضمن النطاقات التي تملكها", de: "Lieferung innerhalb von 48 Stunden, auf Ihre eigenen Domänen beschränkt", es: "Entrega en 48 horas, limitado a los dominios que posees", fr: "Livraison sous 48 heures, limité aux domaines que vous possédez", pt: "Entrega em 48 horas, limitado aos domínios que você possui", ru: "Срок — 48 часов, только для ваших доменов", tr: "48 saat içinde teslim, yalnızca sahip olduğunuz alan adları için" },
    originStaticNote: {
      en: "Static HTML sites with no separate origin cannot be traced this way — there is nothing behind the front to find. If that turns out to be the case we tell you and refund the order.",
      ar: "المواقع الثابتة بدون مصدر منفصل لا يمكن تتبُّعها بهذه الطريقة — لا يوجد شيء خلف الواجهة. وإن ثبت ذلك نخبرك ونُعيد المبلغ.",
      de: "Statische HTML-Seiten ohne eigenen Ursprung lassen sich so nicht zurückverfolgen — es ist nichts hinter dem Front zu finden. Trifft das zu, sagen wir es Ihnen und erstatten den Betrag.",
      es: "Los sitios HTML estáticos sin un origen separado no se pueden rastrear así — no hay nada detrás del frente. Si resulta ser el caso te lo decimos y te devolvemos el pago.",
      fr: "Les sites HTML statiques sans origine distincte ne peuvent pas être tracés ainsi — il n'y a rien derrière la façade. Si tel est le cas, nous vous le disons et vous remboursons.",
      pt: "Sites HTML estáticos sem origem separada não podem ser rastreados assim — não há nada atrás da frente. Se for o caso, avisamos e reembolsamos o pedido.",
      ru: "Статичные HTML-сайты без отдельного источника так не отследить — за фронтом ничего нет. Если выяснится это, мы сообщим и вернём оплату.",
      tr: "Ayrı kaynağı olmayan statik HTML siteler bu şekilde izlenemez — ön yüzün arkasında bulunacak bir şey yoktur. Öyle çıkarsa size söyleriz ve ödemeyi iade ederiz.",
    },
    originScopeNote: {
      en: "We take this on for infrastructure you own or have written authorisation to assess. Requests against third parties are refused.",
      ar: "نقبل هذا للبنية التحتية التي تملكها أو لديك إذن مكتوب بتقييمها. تُرفض الطلبات ضد أطراف ثالثة.",
      de: "Wir machen das nur für Infrastruktur, die Sie besitzen oder für die Sie eine schriftliche Vollmacht haben. Anfragen gegen Dritte lehnen wir ab.",
      es: "Lo hacemos para infraestructura que posees o tienes autorización escrita para evaluar. Las peticiones contra terceros se rechazan.",
      fr: "Nous le faisons pour l'infrastructure que vous possédez ou que vous êtes autorisé à évaluer par écrit. Les demandes contre des tiers sont refusées.",
      pt: "Fazemos para infraestrutura que você possui ou tem autorização por escrito para avaliar. Pedidos contra terceiros são recusados.",
      ru: "Мы берём это только для инфраструктуры, которой вы владеете или на проверку которой есть письменное разрешение. Запросы против третьих лиц отклоняются.",
      tr: "Bunu yalnızca size ait olduğunuz veya yazılı yetkinizin olan altyapı için kabul ederiz. Üçüncü taraflara yönelik talepler reddedilir.",
    },
    originCta: {
      en: "Request via Telegram",
      ar: "اطلب عبر تيليجرام",
      de: "Über Telegram anfragen",
      es: "Solicitar por Telegram",
      fr: "Demander via Telegram",
      pt: "Solicitar via Telegram",
      ru: "Заказать через Telegram",
      tr: "Telegram ile talep et",
    },
    originHandle: { en: "@supremec2", ar: "@supremec2", de: "@supremec2", es: "@supremec2", fr: "@supremec2", pt: "@supremec2", ru: "@supremec2", tr: "@supremec2" },
    originLegal: {
      en: "Delivery is handled by a person, not an automated form.",
      ar: "يتم التسليم بواسطة شخص، وليس نموذجًا آليًا.",
      de: "Die Zustellung erfolgt durch eine Person, nicht ein automatisiertes Formular.",
      es: "La entrega la gestiona una persona, no un formulario automatizado.",
      fr: "La livraison est gérée par une personne, pas un formulaire automatisé.",
      pt: "A entrega é feita por uma pessoa, não por um formulário automatizado.",
      ru: "Выдачу ведёт человек, а не автоматическая форма.",
      tr: "Teslimatı otomatik bir form değil, bir kişi yürütür.",
    },
  },
};

/* ── Apply ─────────────────────────────────────────────────── */

function set(obj, dotted, value) {
  const parts = dotted.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (cur[parts[i]] === undefined) cur[parts[i]] = {};
    if (typeof cur[parts[i]] !== "object" || cur[parts[i]] === null) {
      throw new Error(`path collision at ${parts.slice(0, i + 1).join(".")}`);
    }
    cur = cur[parts[i]];
  }
  const last = parts[parts.length - 1];
  if (cur[last] === undefined) cur[last] = value;
  return cur[last] === value;
}

let added = 0;
let skipped = 0;
for (const locale of LOCALES) {
  const file = path.join(DIR, `${locale}.json`);
  const doc = JSON.parse(fs.readFileSync(file, "utf8"));
  for (const [ns, keys] of Object.entries(COPY)) {
    for (const [key, byLocale] of Object.entries(keys)) {
      if (set(doc, `${ns}.${key}`, byLocale[locale])) added++;
      else skipped++;
    }
  }
  fs.writeFileSync(file, JSON.stringify(doc, null, 2) + "\n");
}
console.log(`added ${added} strings, kept ${skipped} existing, across ${LOCALES.length} locales`);
