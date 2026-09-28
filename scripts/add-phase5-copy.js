/* Adds the Phase 5 copy — recon tools, networks marquee, C2-routing service —
 * to every locale. Idempotent: an existing key is left untouched so hand
 * edits survive a re-run. Run with `node scripts/add-phase5-copy.js`.
 */
const fs = require("fs");
const path = require("path");

const LOCALES = ["en", "ar", "de", "es", "fr", "pt", "ru", "tr"];
const DIR = path.join(__dirname, "..", "src", "i18n", "locales");

/* Shape: { namespace: { key: { locale: text } } }. Interpolation placeholders
 * are kept identical across locales — i18next resolves them per-locale. */
const COPY = {
  common: {
    yes: { en: "Yes", ar: "نعم", de: "Ja", es: "Sí", fr: "Oui", pt: "Sim", ru: "Да", tr: "Evet" },
    no: { en: "No", ar: "لا", de: "Nein", es: "No", fr: "Non", pt: "Não", ru: "Нет", tr: "Hayır" },
  },
  networks: {
    eyebrow: {
      en: "Over {{count}} successful tests across networks",
      ar: "أكثر من {{count}} اختبار ناجح عبر الشبكات",
      de: "Über {{count}} erfolgreiche Tests in verschiedenen Netzwerken",
      es: "Más de {{count}} pruebas exitosas en redes",
      fr: "Plus de {{count}} tests réussis sur les réseaux",
      pt: "Mais de {{count}} testes bem-sucedidos em redes",
      ru: "Более {{count}} успешных тестов в сетях",
      tr: "Ağlarda {{count}} başarılı testin üzerindedir",
    },
  },
  tools: {
    title: {
      en: "Free reconnaissance tools",
      ar: "أدوات استطلاع مجانية",
      de: "Kostenlose Reconnaissance-Tools",
      es: "Herramientas de reconocimiento gratuitas",
      fr: "Outils de reconnaissance gratuits",
      pt: "Ferramentas de reconhecimento gratuitas",
      ru: "Бесплатные инструменты разведки",
      tr: "Ücretsiz keşif araçları",
    },
    subtitle: {
      en: "Enumerate and inspect infrastructure you own or are authorised to assess — certificate transparency, host reachability and response headers. No signup, no key, no log retained on our side.",
      ar: "استكشف وافحص البنية التحتية التي تملكها أو المخوّلة لك بتقييمها — شهادات الشفافية، قابلية الوصول للمضيف وترويسات الاستجابة. دون تسجيل أو مفتاح أو احتفاظ بسجلات من جانبنا.",
      de: "Enumerieren und prüfen Sie Infrastruktur, die Sie besitzen oder bewerten dürfen — Certificate Transparency, Host-Ereichbarkeit und Antwortheader. Keine Anmeldung, kein Schlüssel, keine Protokollierung unsererseits.",
      es: "Enumera e inspecciona la infraestructura que posees o estás autorizado a evaluar — transparencia de certificados, disponibilidad del host y cabeceras de respuesta. Sin registro, sin clave y sin registros guardados.",
      fr: "Énumérez et inspectez l'infrastructure que vous possédez ou êtes autorisé à évaluer — transparence des certificats, joignabilité de l'hôte et en-têtes de réponse. Aucune inscription, aucune clé, aucun journal conservé.",
      pt: "Enumere e inspecione a infraestrutura que você possui ou está autorizado a avaliar — transparência de certificados, acessibilidade do host e cabeçalhos de resposta. Sem cadastro, sem chave e sem logs retidos.",
      ru: "Перечисляйте и проверяйте инфраструктуру, которой владеете или которую уполномочены оценивать — прозрачность сертификатов, доступность хоста и заголовки ответов. Без регистрации, без ключа, без хранения логов.",
      tr: "Sahip olduğunuz veya değerlendirmeye yetkili olduğunuz altyapıyı listeyin ve inceleyin — sertifika şeffaflığı, host erişilebilirliği ve yanıt başlıkları. Kayıt, anahtar veya tarafımızca tutulan log yoktur.",
    },
    tab_subdomains: { en: "Subdomains", ar: "النطاقات الفرعية", de: "Subdomains", es: "Subdominios", fr: "Sous-domaines", pt: "Subdomínios", ru: "Поддомены", tr: "Alt alanlar" },
    tab_host: { en: "Host", ar: "المضيف", de: "Host", es: "Host", fr: "Hôte", pt: "Host", ru: "Хост", tr: "Host" },
    tab_headers: { en: "Headers", ar: "الترويسات", de: "Header", es: "Cabeceras", fr: "En-têtes", pt: "Cabeçalhos", ru: "Заголовки", tr: "Başlıklar" },
    label_subdomains: {
      en: "Root domain",
      ar: "النطاق الجذري",
      de: "Stammdomäne",
      es: "Dominio raíz",
      fr: "Domaine racine",
      pt: "Domínio raiz",
      ru: "Корневой домен",
      tr: "Kök alan adı",
    },
    label_host: {
      en: "Host or IP",
      ar: "مضيف أو عنوان IP",
      de: "Host oder IP",
      es: "Host o IP",
      fr: "Hôte ou IP",
      pt: "Host ou IP",
      ru: "Хост или IP",
      tr: "Host veya IP",
    },
    label_headers: {
      en: "Hostname",
      ar: "اسم المضيف",
      de: "Hostname",
      es: "Nombre de host",
      fr: "Nom d'hôte",
      pt: "Nome do host",
      ru: "Имя хоста",
      tr: "Host adı",
    },
    placeholder_subdomains: { en: "example.com", ar: "example.com", de: "example.com", es: "example.com", fr: "example.com", pt: "example.com", ru: "example.com", tr: "example.com" },
    placeholder_host: { en: "example.com or 203.0.113.1", ar: "example.com أو 203.0.113.1", de: "example.com oder 203.0.113.1", es: "example.com o 203.0.113.1", fr: "example.com ou 203.0.113.1", pt: "example.com ou 203.0.113.1", ru: "example.com или 203.0.113.1", tr: "example.com veya 203.0.113.1" },
    placeholder_headers: { en: "example.com", ar: "example.com", de: "example.com", es: "example.com", fr: "example.com", pt: "example.com", ru: "example.com", tr: "example.com" },
    search: { en: "Search", ar: "بحث", de: "Suchen", es: "Buscar", fr: "Rechercher", pt: "Pesquisar", ru: "Поиск", tr: "Ara" },
    scopeNote: {
      en: "Probe only hosts you own or have written permission to assess. Requests are not logged.",
      ar: "افحص فقط المضيفات التي تملكها أو لديك إذن مكتوب بتقييمها. الطلبات غير مسجّلة.",
      de: "Prüfen Sie nur Hosts, die Sie besitzen oder für die Sie eine schriftliche Erlaubnis haben. Anfragen werden nicht protokolliert.",
      es: "Prueba solo hosts que poseas o para los que tengas permiso escrito. Las peticiones no se registran.",
      fr: "Ne testez que les hôtes que vous possédez ou que vous êtes autorisé à tester par écrit. Les requêtes ne sont pas journalisées.",
      pt: "Teste apenas hosts que você possui ou tem permissão por escrito. As requisições não são registradas.",
      ru: "Проверяйте только хосты, которыми владеете или на тестирование которых получили письменное разрешение. Запросы не логируются.",
      tr: "Yalnızca size ait olduğunuz veya yazılı izniniz olan hostları test edin. İstekler kaydedilmez.",
    },
    errorHost: {
      en: "Enter a valid hostname, e.g. example.com",
      ar: "أدخل اسم مضيف صالح، مثلاً example.com",
      de: "Geben Sie einen gültigen Hostnamen ein, z. B. example.com",
      es: "Introduce un nombre de host válido, p. ej. example.com",
      fr: "Saisissez un nom d'hôte valide, par ex. example.com",
      pt: "Insira um nome de host válido, ex. example.com",
      ru: "Введите корректное имя хоста, например example.com",
      tr: "Geçerli bir host adı girin, örn. example.com",
    },
    errorGeneric: { en: "Lookup failed. Try again in a moment.", ar: "فشل البحث. حاول مجددًا بعد لحظة.", de: "Abfrage fehlgeschlagen. Versuchen Sie es gleich erneut.", es: "La búsqueda falló. Inténtalo de nuevo en un momento.", fr: "La recherche a échoué. Réessayez dans un instant.", pt: "A consulta falhou. Tente novamente em instantes.", ru: "Запрос не удался. Попробуйте снова.", tr: "Sorgu başarısız. Birazdan tekrar deneyin." },
    querying: { en: "Querying public sources…", ar: "جاري الاستعلام من المصادر العامة…", de: "Öffentliche Quellen werden abgefragt…", es: "Consultando fuentes públicas…", fr: "Interrogation des sources publiques…", pt: "Consultando fontes públicas…", ru: "Опрос публичных источников…", tr: "Genel kaynaklar sorgulanıyor…" },
    empty: {
      en: "Enter a host above to enumerate its certificate footprint or inspect its response headers.",
      ar: "أدخل مضيفًا أعلاه لاستكشاف بصمة الشهادات الخاصة به أو فحص ترويسات الاستجابة.",
      de: "Geben Sie oben einen Host ein, um seinen Zertifikats-Footprint aufzulisten oder seine Antwortheader zu prüfen.",
      es: "Introduce un host arriba para enumerar su huella de certificados o inspeccionar sus cabeceras.",
      fr: "Saisissez un hôte ci-dessus pour lister son empreinte de certificats ou inspecter ses en-têtes.",
      pt: "Insira um host acima para listar sua pegada de certificados ou inspecionar seus cabeçalhos.",
      ru: "Введите хост выше, чтобы перечислить его сертификаты или проверить заголовки ответа.",
      tr: "Sertifika izini listelemek veya yanıt başlıklarını incelemek için yukarıya bir host girin.",
    },
    foundTitle: { en: "Names in certificate transparency for {{host}}", ar: "أسماء في شهادات الشفافية لـ {{host}}", de: "Namen in der Certificate Transparency für {{host}}", es: "Nombres en transparencia de certificados para {{host}}", fr: "Noms dans la transparence des certificats pour {{host}}", pt: "Nomes na transparência de certificados para {{host}}", ru: "Имена в прозрачности сертификатов для {{host}}", tr: "{{host}} için sertifika şeffaflığında adlar" },
    noneFound: { en: "No certificates found for this domain.", ar: "لم تُعثر على شهادات لهذا النطاق.", de: "Keine Zertifikate für diese Domäne gefunden.", es: "No se encontraron certificados para este dominio.", fr: "Aucun certificat trouvé pour ce domaine.", pt: "Nenhum certificado encontrado para este domínio.", ru: "Сертификаты для этого домена не найдены.", tr: "Bu alan adı için sertifika bulunamadı." },
    truncated: { en: "Showing {{shown}} of {{total}}", ar: "عرض {{shown}} من {{total}}", de: "{{shown}} von {{total}} werden angezeigt", es: "Mostrando {{shown}} de {{total}}", fr: "{{shown}} affichés sur {{total}}", pt: "Mostrando {{shown}} de {{total}}", ru: "Показано {{shown}} из {{total}}", tr: "{{total}} adetten {{shown}} tanesi gösteriliyor" },
    securityHeaders: { en: "Security headers", ar: "ترويسات الأمان", de: "Sicherheits-Header", es: "Cabeceras de seguridad", fr: "En-têtes de sécurité", pt: "Cabeçalhos de segurança", ru: "Заголовки безопасности", tr: "Güvenlik başlıkları" },
    absent: { en: "Not set", ar: "غير مضبوط", de: "Nicht gesetzt", es: "No configurado", fr: "Non défini", pt: "Não definido", ru: "Не задан", tr: "Ayarlı değil" },
    rowServer: { en: "Server", ar: "الخادم", de: "Server", es: "Servidor", fr: "Serveur", pt: "Servidor", ru: "Сервер", tr: "Sunucu" },
    rowType: { en: "Content type", ar: "نوع المحتوى", de: "Inhaltstyp", es: "Tipo de contenido", fr: "Type de contenu", pt: "Tipo de conteúdo", ru: "Тип содержимого", tr: "İçerik türü" },
    rowRedirect: { en: "Followed redirect", ar: "اتُبع التحويل", de: "Weiterleitung gefolgt", es: "Redirección seguida", fr: "Redirection suivie", pt: "Redirecionamento seguido", ru: "Редирект выполнен", tr: "Yönlendirme takip edildi" },
    rowTls: { en: "HTTPS", ar: "HTTPS", de: "HTTPS", es: "HTTPS", fr: "HTTPS", pt: "HTTPS", ru: "HTTPS", tr: "HTTPS" },
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
