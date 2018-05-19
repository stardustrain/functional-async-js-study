'use strict'
// 1. --------------------------------
const add10 = a => new Promise(resolve => resolve(a + 10))
const sub5 = a => a - 5
// f1 :: a -> b
// async는 반드시 promise를 return해야 함
async function f1(a) {
  var b = a
  // await: async와 짝으로 사용
  // add10이 promise object를 return 하기 때문에 await가 동작, then을 사용한 것 처럼 promise를 펼쳐줌
  b = await add10(b)
  b = sub5(b)
  return b
}

// Promise값이 오거나 아닌 값이 오더라도 항상 같은 결과가 기대됨
// 다형성
function log(a) {
  a instanceof Promise ? a.then(console.log) : console.log(a)
}

// log(f1(10)) // << console.log를 찍어보면 Promise가 reutrn / then으로 promise chain을 풀어주어야 함
// log(20)

// 2. 위의 문제를 한 번에 해결하기 --------------------------------
function _go(a, ...fs) {
  var b = a
  var iter = fs[Symbol.iterator]()
  return (function recur() {
    // iter대신 fs를 직접받으면 무한 loop를 돌게 된다.
    // iter는 next를 통해 다음의 fs를 가리키게 되지만, fs를 직접 넣는다면 계속 맨 처음의 index로 인식하게 된다.
    for (const f of iter) {
      b = f(b)
      if (b instanceof Promise) return b.then(recur)
    }
    return b
  })(b)
}
// _go(10, a => a + 1, b => b + 2, log)
// _go(10, add10, sub5, log)

// 작은 문제로 나누어 해결해보기
const then = f => a => a instanceof Promise ? a.then(f) : f(a)
const callRight = (b, f) => f(b)
const go = (a, ...fs) => fs.map(then).reduce(callRight, a)

// go(10, add10, sub5, console.log)
// 인자와 return만으로 소통하고 부분을 나누게 되면 개발자의 실수가 줄어든다

// 3. Iterable, Iterator protocol --------------------------------

// Iterable, Iterator, Symbol.iterator, Generator
const obj = {
  a: 1,
  [Symbol.iterator]: function() {
    return {
      cur: 0,
      next: function() {
        if (this.cur > 5) return { value: undefined, done: false }
        return {
          value: ++this.cur,
          done: false // next를 끝냄
        }
      },
      [Symbol.iterator]: function() {
        return this
      }
    }
  }
}

const iter = obj[Symbol.iterator]()

// generate는 쉽게 iterable을 만들어 줌 (함수 이름 앞에 * 를 붙인다)
// 실행시 iterable만 만들어 놓고 next()호출 전 까지는 동작하지 않음(미리 평가 되지 않음 / 지연성)
function *gen(len) {
  var i = -1
  while (++i < len) yield i
}

const iter2 = gen(5)
// for (const v of iter2) console.log(v)

// javascript의 reverse()는 새로운 배열을 만들어 버림
// arr[l]을 yield 한 뒤는 더 이상 참조하지 않아 메모리가 비워진 상태가 되기 때문에 성능상의 이득도 있음
function *reverseIter(arr) {
  var l = arr.length
  while (l--) yield arr[l]
}

// for (const v of reverseIter([1, 2, 3, 4])) console.log(v)

// 배열이 아닌 id가 있는 object는 O(1) 이기 때문에 array O(n)보다 성능상의 이득이 있음
const users = {
  cid1: {
    id:1, name: ''
  },
  cid2: {
    id:2, name: ''
  },
  cid3: {
    id:3, name: ''
  },
}

// Object.values(users)는 평가 시점에서 배열을 만들고 시작함
// for (const u of Object.values(users)) console.log(u)
// console.log([...Object.values(users), {id:4, name: ''}])

// generator를 통해 더 잘 만들어 보자
function *valuesIterObj(obj) {
  for (const key in obj) yield obj[key]
}
// 배열을 전부 만들지 않고 yield를 통해 하나씩 전달되며(지연성), 필요한 시점에서 멈추고 메모리를 비울 수 있음
// for (const u of valuesIterObj(users)) console.log(u)
// 다음과 같은 코드에서 더욱 가치를 발휘할 수 있음
for (const u of valuesIterObj(users)) {
  if (u.id === 2) break
  console.log(u)
}

function User(name) {
  this.name = name
}
User.prototype.getName = function() {
  return this.name
}

const user = new User('test')
console.log(user)

for (const key in user) {
  if (user.hasOwnProperty(key)) console.log(key)
}

class User2 {
  constructor(name) {
    this.name = name
  }

  getName() {
    return this.name
  }
}

const user2 = new User2('test')
for (const key in user2) {
  console.log(key)
}

// 4. Array like object --------------------------------
const a = valuesIterObj({0: 1, 1: 20, length: 2})
a.next() // values: 1
a.next() // values: 20
a.next() // values: 2
// length라는 key가 의미를 갖는경우 문제가 된다
// es6 + webApi 의 경우 Symbol.iterator를 갖는다
// 앞으로 유사배열(arguments)은 쓰지 않는 걸로

// 5. --------------------------------