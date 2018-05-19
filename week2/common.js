const push = (arr, v) => (arr.push(v), arr)
const set = (obj, k, v) => (obj[k] = v, obj)
const isPlainObject = (obj) => obj.constructor === Object

module.exports = {
  push,
  set,
  isPlainObject
}