/* Adds the account-page labels the enhanced account page needs.
 *
 * The account page gained an API-enabled badge, an API-key reveal toggle and a
 * localized greeting, which reference a few keys that did not exist yet. Like
 * the other one-shot locale scripts, this writes each value to every locale.
 *
 * Run once: `node scripts/add-account-keys.js`
 */
const fs = require("fs");
const path = require("path");

const DIR = path.join(__dirname, "..", "src", "i18n", "locales");

const VALUES = {
  "account.apiAccess": {
    en: "API enabled", ar: "الـAPI مفعّل", de: "API aktiviert",
    es: "API habilitada", fr: "API activée", pt: "API ativa", ru: "API включена", tr: "API etkin",
  },
  "account.reveal": {
    en: "Reveal", ar: "إظهار", de: "Anzeigen", es: "Mostrar",
    fr: "Afficher", pt: "Mostrar", ru: "Показать", tr: "Göster",
  },
  "account.hide": {
    en: "Hide", ar: "إخفاء", de: "Ausblenden", es: "Ocultar",
    fr: "Masquer", pt: "Ocultar", ru: "Скрыть", tr: "Gizle",
  },
  "common.greeting": {
    en: "Account", ar: "الحساب", de: "Konto", es: "Cuenta",
    fr: "Compte", pt: "Conta", ru: "Аккаунт", tr: "Hesap",
  },
};

for (const [key, byLocale] of Object.entries(VALUES)) {
  for (const [locale, label] of Object.entries(byLocale)) {
    const file = path.join(DIR, `${locale}.json`);
    const data = JSON.parse(fs.readFileSync(file, "utf8"));
    const [ns, k] = key.split(".");
    data[ns] = data[ns] ?? {};
    data[ns][k] = label;
    fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
  }
}

console.log(`${Object.keys(VALUES).length} keys added across 8 locales.`);
