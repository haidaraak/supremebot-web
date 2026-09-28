/* Adds the `nav.menu` label the mobile drawer needs.
 *
 * The drawer is the only way to reach the four section links on a phone, so its
 * trigger needs an accessible name. `common.close` already exists in every
 * locale, so only this one key is added. Translations are supplied per locale
 * rather than left to fall back to English.
 */
const fs = require("fs");
const path = require("path");

const DIR = path.join(__dirname, "..", "src", "i18n", "locales");

const MENU = {
  en: "Menu",
  ar: "القائمة",
  de: "Menü",
  es: "Menú",
  fr: "Menu",
  pt: "Menu",
  ru: "Меню",
  tr: "Menü",
};

for (const [locale, label] of Object.entries(MENU)) {
  const file = path.join(DIR, `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(file, "utf8"));

  if (data.nav?.menu) {
    console.log(`${locale}: already present, skipped`);
    continue;
  }

  data.nav = { ...data.nav, menu: label };
  // Two-space indent matches the existing locale files.
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`${locale}: nav.menu = ${label}`);
}
