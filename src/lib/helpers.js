export function getPropertyByPath(obj, propPath, defaultValue) {
  return propPath.split('.').reduce((o, p) => (o && o[p]) || defaultValue, obj);
}
