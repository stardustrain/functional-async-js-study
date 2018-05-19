const r = require('./reduce')
const c = require('./common')
const reduce = r.reduce
const thenR = r.thenR
const entriesIter = r.entriesIter
const push = c.push
const set = c.set
const isPlainObject = c.isPlainObject

// filter
const filter = (f, collection) => (
  isPlainObject(collection) ? (
    reduce(
      (res, [k, value]) => thenR(
        f(value), bool => bool ? set(res, k, value) : res
      ), entriesIter(collection), [])
  ) : (
    reduce(
      (res, value) => thenR(
        f(value), bool => bool ? push(res, value) : res
      ), collection, [])
    )
)

console.log(filter(a => a > 1, [1, 2, 3]))
console.log(filter(a => a > 1, { a: 1, b: 2, c: 3 }))
// filter(a => a > 1, Promise.resolve([1, 2, 3])).then(console.log)
filter(a => Promise.resolve(a > 1), [1, 2, 3]).then(console.log)