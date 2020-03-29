export function getPropertyByPath(obj, propPath, defaultValue) {
  return propPath.split('.').reduce((o, p) => (o && o[p]) || defaultValue, obj);
}

export function isExportProcess() {
  // Next export workers/child processes set `__NEXT_DATA__.nextExport = true` when exporting.
  // We can use that to ensure our code is only being called when intended.
  return typeof global !== 'undefined' && global.__NEXT_DATA__ && global.__NEXT_DATA__.nextExport;
}
