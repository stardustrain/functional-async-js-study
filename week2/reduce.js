// 함수를 따로 나눌경우 이 부분을 수정하지만 실제로 쓰인 부분의 로직은 무너지지 않음
// collectionToIter의 내부 로직이 어떻든 무조건 iterator를 return하면 절대 로직이 무너지지 않음
// 파라미터의 다형성을 생각하며 함수를 만들것
// 인자와 리턴값으로 소통한다는 것을 꼭 기억!

function *valuesIter(obj) {
  for (const k in obj) yield obj[k]
}

function *entriesIterG(obj) {
  for (const k in obj) yield [k, obj[k]]
}

class EntriesIter {
  constructor(obj) {
    this._iter = entriesIterG(obj)
  }

  next() {
    return this._iter.next()
  }

  [Symbol.iterator]() { return this }
}

function entriesIter(obj) {
  return new EntriesIter(obj)
}

function *reverseIter(arr) {
  const l = arr.length
  while (l--) yield arr[l]
}

const then = (f, a) => a instanceof Promise ? a.then(f) : f(a)
const thenR = (a, f) => a instanceof Promise ? a.then(f) : f(a)

// instanceof는 상속구조를 모두 체크
// constructor는 해당 type으로 실제로 구현된 녀석인지 체크
const collectionToIter = collection => {
  return (collection.constructor === Object) ?
    valuesIter(collection) : collection[Symbol.iterator]()
}

// reduce
// Symbol iterator가 구현되어있는 object는 무조건 동작 (iterable하기 때문에 for..of가 동작)
const reduce = (f, collection, acc) => {
  /**
   * f: function
   * collection: array | array like object
   * acc(optional): initialized return value (default: first index of collection)
   * if you don't input acc parameter, same type of acc value in collection and reduce return value.
   */
  return then((collection) => {
    const iter = collectionToIter(collection)
  // acc가 없을 경우 iter의 첫 인자를 acc에 할당
    acc = (acc === undefined) ? iter.next().value : acc
    // acc의 첫 인자를 할당한 경우 next()를 통해 빠졌기 때문에 첫 인자를 제외한 collection의 나머지 값이 남게 됨
    return then(function recur(acc) {
      for (const v of iter) {
        acc = f(acc, v)
        if (acc instanceof Promise) return acc.then(recur)
      }
      return acc
    }, acc)

  }, collection)
}

// acc값을 주지 않는 경우는 a와 acc가 같은 타입임을 보장함
// console.log(reduce((acc, a) => acc + a, [1, 2, 3])) // 6
// 위의 코드는 다음과 같이 동작: const result = reduce((acc, a) => acc + a, [2, 3], 1)
// console.log(reduce((acc, a) => acc + a, { a: 1, b: 2, c: 3 }))
// acc값을 주는 경우는 acc와 a가 다른 형일수도 있음
// console.log(reduce((acc, [k, v]) => acc + v, entriesIter({ a: 1, b: 2, c: 3 }), 0))

// 예제
const posts = [
  { id: 1, body: '내용', comments: [{}, {}, {}] },
  { id: 2, body: '내용2', comments: [{}, {}] },
  { id: 3, body: '내용3', comments: [{}] },
  { id: 4, body: '내용4', comments: [{}, {}] },
  { id: 5, body: '내용5', comments: [{}, {}, {}] },
  { id: 6, body: '내용6', comments: [{}, {}] },
]
const getLength = (arr) => arr.length || 0
const counter = (count, post) => getLength(post.comments) + count
// console.log(reduce(counter, posts, 0))
const users = [
  { id: 1, name: 'name', age: 30 },
  { id: 2, name: 'name2', age: 31 },
  { id: 3, name: 'name3', age: 32 },
  { id: 4, name: 'name4', age: 31 },
  { id: 5, name: 'name5', age: 32 },
  { id: 6, name: 'name6', age: 31 },
]
const identity = a => a

const pushSell = (parent, k, v) => {
  (parent[k] || (parent[k] = [])).push(v)
  return parent
}

const increaseSelector = (obj, key) => {
  obj[key] ? obj[key]++ : (obj[key] = 1)
  return obj
}

const countBy = (f, collection) => reduce(
  (counts, a) => increaseSelector(counts, f(a)),
  collection,
  {}
)
const groupBy = (f, collection) => reduce((group, a) => pushSell(group, f(a), a), collection, {})
const count = collection => countBy(identity, collection)


// reduce((acc, v) => acc + v, Promise.resolve([1, 2, 3, 4])).then(console.log)
// reduce((acc, v) => Promise.resolve(acc + v), [1, 2, 3, 4, 5]).then(console.log)
// reduce((acc, v) => Promise.resolve(acc + v), Promise.resolve([1, 2, 3, 4, 5])).then(console.log)
// console.log(reduce(getUsersByAge, users, {}))
// console.log(reduce(getCountUsersAge, users, {}))
// console.log(reduce(pushSell(acc, u.age, u), users, {}))
// console.log(groupBy(user => user.age, users))
// console.log(countBy(user => user.age, users))
// console.log(countBy(identity, [1, 1, 2, 2, 3, 3, 3, 4, 2]))
// console.log(count([1, 1, 2, 2, 3, 3, 3, 4, 2]))
// 예제 end

module.exports = {
  reduce: reduce,
  thenR: thenR,
  entriesIter: entriesIter
}
