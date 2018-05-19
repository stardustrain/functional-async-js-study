const r = require('./reduce')
const c = require('./common')
const reduce = r.reduce
const thenR = r.thenR
const entriesIter = r.entriesIter
const push = c.push
const set = c.set
const isPlainObject = c.isPlainObject

const map = (f, collection) => (
  isPlainObject(collection) ? (
    reduce(
      (res, [k, a]) => thenR(
        f(a),
        b => set(res, k, b)
      ), entriesIter(collection), {})
  ) : (
    reduce(
      (res, a) => thenR(
        f(a),
        b => push(res, b)
      ), collection, [])
    )
  )

console.log(map(a => a + 10, [1, 2, 3]))
console.log(map(a => a + 10, { a: 1, b: 2, c: 3 })) // { a: 11, b: 12, c: 13 }
// console.log(map(a => Promise.resolve(a + 10), [1, 2, 3]))
map(a => Promise.resolve(a + 10), [1, 2, 3]).then(console.log)
// map(a => Promise.resolve(a + 10), [1, 2, 3]).then(console.log)
