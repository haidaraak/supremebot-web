/**
 * Phase 6 copy — attack status/countdown, the tools page, and the bento
 * dashboard.
 *
 * Idempotent: an existing key is never overwritten, so hand-edited
 * translations survive a re-run. Run with `node scripts/add-phase6-copy.js`.
 */
const fs = require("fs");
const path = require("path");

const LOCALES_DIR = path.join(__dirname, "..", "src", "i18n", "locales");

/* key -> { locale: text }. English is the source the others were translated
 * from; the `en` entry is what the UI shows when a locale is missing one. */
const COPY = {
  "console.expired": {
    en: "Window elapsed",
    ar: "انتهت النافذة",
    de: "Zeitfenster abgelaufen",
    es: "Ventana transcurrida",
    fr: "Fenêtre écoulée",
    pt: "Janela encerrada",
    ru: "Окно истекло",
    tr: "Süre doldu",
  },
  "nav.tools": {
    en: "Tools",
    ar: "الأدوات",
    de: "Werkzeuge",
    es: "Herramientas",
    fr: "Outils",
    pt: "Ferramentas",
    ru: "Инструменты",
    tr: "Araçlar",
  },
  "tools.dashTitle": {
    en: "Reconnaissance tools",
    ar: "أدوات الاستطلاع",
    de: "Aufklärungswerkzeuge",
    es: "Herramientas de reconocimiento",
    fr: "Outils de reconnaissance",
    pt: "Ferramentas de reconhecimento",
    ru: "Инструменты разведки",
    tr: "Keşif araçları",
  },
  "tools.dashSubtitle": {
    en: "Enumerate and inspect infrastructure you own or are authorised to assess — certificate transparency, DNS resolution and response headers. No signup, no key.",
    ar: "اكتشف وتفحّص البنية التحتية التي تملكها أو المخوّل لك بتقييمها — شفافية الشهادات، وتحليل DNS، وترويسات الاستجابة. دون تسجيل أو مفتاح.",
    de: "Erfassen und prüfen Sie Infrastruktur, die Sie besitzen oder deren Prüfung Ihnen gestattet ist — Certificate Transparency, DNS-Auflösung und Antwortheader. Keine Anmeldung, kein Schlüssel.",
    es: "Enumera e inspecciona infraestructura que posees o estás autorizado a evaluar — transparencia de certificados, resolución DNS y cabeceras de respuesta. Sin registro ni clave.",
    fr: "Énumérez et inspectez l'infrastructure que vous possédez ou que vous êtes autorisé à évaluer — transparence des certificats, résolution DNS et en-têtes de réponse. Sans inscription ni clé.",
    pt: "Enumere e inspecione infraestrutura que você possui ou está autorizado a avaliar — transparência de certificados, resolução DNS e cabeçalhos de resposta. Sem cadastro ou chave.",
    ru: "Обнаруживайте и проверяйте инфраструктуру, которой вы владеете или на тестирование которой у вас есть разрешение — прозрачность сертификатов, DNS и заголовки ответов. Без регистрации и ключей.",
    tr: "Sahip olduğunuz veya test etmeye yetkili olduğunuz altyapıyı keşfedin ve inceleyin — sertifika şeffaflığı, DNS çözümleme ve yanıt başlıkları. Kayıt veya anahtar gerekmez.",
  },
  "tools.dashNote": {
    en: "Every lookup goes through the scoped bridge: the tool name selects the upstream from a fixed list and only a hostname leaves your browser, so this panel cannot be aimed at an arbitrary URL.",
    ar: "يمر كل استعلام عبر الجسر المحدود: يختار اسم الأداة المصدر من قائمة ثابتة ولا يغادر متصفحك سوى اسم المضيف، لذا لا يمكن توجيه هذه اللوحة إلى عنوان عشوائي.",
    de: "Jede Abfrage läuft über die geprüfte Brücke: der Werkzeugname wählt den Upstream aus einer festen Liste und nur ein Hostname verlässt Ihren Browser — das Panel lässt sich nicht auf eine beliebige URL richten.",
    es: "Cada consulta pasa por el puente acotado: el nombre de la herramienta elige el origen de una lista fija y de tu navegador solo sale un nombre de host, por lo que este panel no puede apuntarse a una URL arbitraria.",
    fr: "Chaque requête passe par la passerelle délimitée : le nom de l'outil choisit la source dans une liste fixe et seul un nom d'hôte quitte votre navigateur, ce panneau ne peut donc pas viser une URL arbitraire.",
    pt: "Cada consulta passa pela ponte delimitada: o nome da ferramenta escolhe a origem de uma lista fixa e apenas um nome de host sai do seu navegador, então este painel não pode ser apontado para uma URL arbitrária.",
    ru: "Каждый запрос идёт через ограниченный мост: имя инструмента выбирает источник из фиксированного списка, а браузер покидает только имя хоста — эту панель нельзя направить на произвольный URL.",
    tr: "Her sorgu kapsamlı köprüden geçer: araç adı kaynağı sabit bir listeden seçer ve tarayıcınızdan yalnızca bir ana bilgisayar adı çıkar, dolayısıyla bu panel rastgele bir URL'ye yöneltilamaz.",
  },
};

function setDeep(obj, dottedKey, value) {
  const parts = dottedKey.split(".");
  let node = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (typeof node[parts[i]] !== "object" || node[parts[i]] === null) {
      node[parts[i]] = {};
    }
    node = node[parts[i]];
  }
  const leaf = parts[parts.length - 1];
  if (node[leaf] === undefined) {
    node[leaf] = value;
    return true;
  }
  return false;
}

function main() {
  const files = fs.readdirSync(LOCALES_DIR).filter((f) => f.endsWith(".json"));
  if (files.length === 0) {
    throw new Error(`no locale files under ${LOCALE_DIR}`);
  }

  let added = 0;
  for (const file of files) {
    const locale = path.basename(file, ".json");
    if (!(locale in COPY[Object.keys(COPY)[0]])) {
      console.log(`skip  ${file} (no translations authored for ${locale})`);
      continue;
    }

    const full = path.join(LOCALES_DIR, file);
    const raw = fs.readFileSync(full, "utf8");
    const endsWithNewline = raw.trimEnd().endsWith("}");
    const data = JSON.parse(raw);

    const before = JSON.stringify(data);
    for (const [key, perLocale] of Object.entries(COPY)) {
      setDeep(data, key, perLocale[locale]);
    }

    if (JSON.stringify(data) === before) {
      console.log(`ok    ${file} — already complete`);
      continue;
    }

    fs.writeFileSync(full, JSON.stringify(data, null, 2) + (endsWithNewline ? "\n" : ""));
    console.log(`wrote ${file}`);
    added++;
  }
  console.log(`\n${added} locale file(s) updated.`);
}

main();
