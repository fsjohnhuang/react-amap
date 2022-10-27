export function isArray(x: any): x is Array<any> {
  return Object.prototype.toString.call(x) === '[object Array]'
} 