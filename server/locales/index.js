var i18n = require("i18n");

let languages = {
  en: "English",
  fr: "Français",
  si: "සිංහල",
};
module.exports.languages = languages;
module.exports.languagesKeys = Object.keys(languages);

i18n.configure({
  locales: Object.keys(languages),
  directory: __dirname,
  defaultLocale: "en",
});
module.exports.locales = i18n;
