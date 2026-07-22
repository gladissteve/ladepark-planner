export const MODULE_MANIFEST = [
  // Core trägt sich hier nicht ein. Künftige Module fügen GENAU EINEN
  // neuen, eigenen Eintrag hinzu — niemals bestehende Einträge anderer
  // Module ändern, entfernen oder umsortieren:
  // { name: '<modulname>', entry: '<relativer Pfad zur eigenen main.js, von js/core/ aus>' }
  { name: 'Standards', entry: '../standards/main.js' }
];
