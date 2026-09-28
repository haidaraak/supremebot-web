/* Adds distinct section kicker labels so each landing section's eyebrow reads
 * as a category rather than duplicating its heading.
 *
 * The Kicker component renders `<index> · <label>` above a section heading.
 * When it was first threaded through, several sections set the label to the
 * same key as the <h2>, so the heading appeared twice with no real eyebrow.
 * These keys give every section a short, distinct category word.
 *
 * Run once: `node scripts/add-kickers.js`
 */
const fs = require("fs");
const path = require("path");

const DIR = path.join(__dirname, "..", "src", "i18n", "locales");

// key -> per-locale value. Index order follows the page flow.
const LABELS = {
  "landing.kicks.features": { en: "Capabilities", ar: "الإمكانيات", de: "Funktionen", es: "Capacidades", fr: "Capacités", pt: "Recursos", ru: "Возможности", tr: "Yetenekler" },
  "landing.kicks.console":  { en: "Live telemetry", ar: "القياس الحي", de: "Live-Telemetrie", es: "Telemetría en vivo", fr: "Télémétrie en direct", pt: "Telemetria ao vivo", ru: "Живая телеметрия", tr: "Canlı telemetri" },
  "landing.kicks.steps":    { en: "How it works", ar: "كيف يعمل", de: "So funktioniert's", es: "Cómo funciona", fr: "Comment ça marche", pt: "Como funciona", ru: "Как это работает", tr: "Nasıl çalışır" },
  "landing.kicks.security": { en: "Security", ar: "الأمان", de: "Sicherheit", es: "Seguridad", fr: "Sécurité", pt: "Segurança", ru: "Безопасность", tr: "Güvenlik" },
  "landing.kicks.compare":  { en: "Comparison", ar: "المقارنة", de: "Vergleich", es: "Comparativa", fr: "Comparaison", pt: "Comparação", ru: "Сравнение", tr: "Karşılaştırma" },
  "landing.kicks.pricing":  { en: "Plans", ar: "الخطط", de: "Tarife", es: "Planes", fr: "Offres", pt: "Planos", ru: "Тарифы", tr: "Planlar" },
  "landing.kicks.faq":      { en: "Support", ar: "الدعم", de: "Hilfe", es: "Ayuda", fr: "Assistance", pt: "Suporte", ru: "Поддержка", tr: "Destek" },
};

for (const [key, byLocale] of Object.entries(LABELS)) {
  for (const [locale, label] of Object.entries(byLocale)) {
    const file = path.join(DIR, `${locale}.json`);
    const data = JSON.parse(fs.readFileSync(file, "utf8"));
    // The key is dotted; nest it deep.
    const parts = key.split(".");
    let node = data;
    for (let i = 0; i < parts.length - 1; i++) {
      node[parts[i]] = node[parts[i]] ?? {};
      node = node[parts[i]];
    }
    node[parts[parts.length - 1]] = label;
    fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
  }
}

console.log(`${Object.keys(LABELS).length} kicker keys added across 8 locales.`);
