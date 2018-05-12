## 개발?
개발이란, 작은 단위로 문제를 나누어 해답을 다시 조합하는 과정

순수함수를 많이 늘린 상태에서 마지막에 효과가 있는 함수를 맨 마지막에 배치
> go(add10, add5, add7, console.log)
순수함수 : 인자와 return값만 존재
효과함수(side effect) : console.log, DB 변경, appendChild, 객체지향의 method들

### 1. type and value
Javascript types

- null
- undefined
- boolean
- number
- srting
- symbol
- object: 객체

object인 타입과 object가 아닌 타입이 존재(Array, Map 등 모두 object의 하위 object).
Primitive value의 경우 인자로 전달하거나 할당 할 때 항상 값 복사.
Object의 경우 항상 reference 사본을 넘김(Immutable을 이해하는데 아주 중요함).

undefined? JSON으로 직렬화가 불가능함. stringify하는 순간 null로 변환 혹은 [key]: undefined의 경우 통채로 사라짐.
Set, Map 역시 마찬가지로 직렬화가 불가능(타입이 동적이기 떄문에 모든 파라미터들이 직렬화 된다는 보장을 할 수 없음).

### 2. Iterable, Iterator, Symbol.iterator, Generator
- Iterable: for..of / spread(...) operator와 함께 사용

```javascript
for (const v of [1, 2, 3]) console.log(v)
[...[1]]
[...'ABC']
```

위의 경우 배열이라 동작하는 것이 아닌 Symbol.iterator가 구현되어있어서 동작하는 것!
Symbol.iterator의 next()를 통해 수집되는 value들을 하나씩 return 받음.

```javascript
const obj = {
  a: 1,
  [Symbol.itertator]: () => ({
    cur: 0,
    next: function() {
      if (this.cur > 5) return { value: undefined, done: false }
      return {
        value: ++this.cur,
        done: false // next를 끝냄
      }
    }
  })
}
const iter = obj[Symbol.iterator]()
for (const v of obj[Symbol.iterator]()) console.log(v)
```
Symbol.itertator 함수를 가져야 하고, 내부에 next가 value와 done을 가지고 있는 iterator를 return 하면, iterable로 판단.
*iterator는 iterator를 return 한다

```javascript
iterator[Symbol.iterator]() === iterator
```

### for...in 의 문제?
```javascript
function User(name) {
  this.name
}

User.prototype.getName = function() {
  return this.name
}

const user = new User('test').getName()

for (const key in user) {
  if (user.hasOwnProperty(key)) console.log(key) // hasOwnProperty로 체크하지 않는 경우, prototype에 선언된 변수까지 출력된다(심각)
}
// class User 로 선언한 경우 prototype에 선언한 함수가 출력되지 않는다
// 그러므로 class는 절대 문법설탕이 아니다! 기존과 완전 다른 기능임!
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

```

### 3. FP 관점에서의 JS
```json
dataTypes = {
  string: 'json',
  number: 2,
  object: {
    key: 1
  },
  array: [1, 2, 3],
  true, false, null
}
```
- 적은 종류의 구조와 추상전력을 세울 수 있음(JSON을 기준으로 생각).
- 서버와 클라이언트가 불편함 없이 통신할 수 있음.
- 제일 큰 이점은 서버와 클라이언트가 같은 언어로 개발되었다고 했을때, 같은 기능에서는 같은 코드를 사용할 수 있음.

- undefined: 정의되지 않은 변수, 리턴값이 없는 함수, 객체에 없는 key에 접근했을 때 발생.
  - js의 runtime에서만 발생하기 때문에 undefined를 '함수를 실행해서 아무것도 찾지 못하거나, 아무것도 하지 못한' 상태의 구분자로 사용할 수 있게 됨.
  - 그렇기 때문에 undefined를 값으로 일부러 할당하지 않아야 함

```javascript
[1, 2, 3].find(a => a > 3)
// undefined
[1, 2, 3, undefined].find(a => !a)
// undefined
```

undefined를 값으로 할당하기 시작하는 순간, 위의 상황이 발생함.
값을 찾지 못한것인지, undefined라는 값을 찾아서 리턴한 것인지 헷갈리는 상황.

### collection
- 열거 가능한 값.
- JSON type내의 object(array가 아닌 object)
- Array, Map, Set ...
- Symbol.iterator가 구현된 모든 객체
- Generator를 실행한 결과 값

> map :: Collection a => Collection b // map에는 collection 이외의 값이 들어가지 못함

### 영속성, 종속성

```javascript
const users = [{id :1}, {id :2}, {id :3}]

const users2 = users.filter(a => a.id > 1) // [{id :2}, {id :3}]

// 이 상황에서 users2 내부의 객체들을 다시 만드는 것이 아니라 users 내부의 객체를 참조하게 함.
// users = [{id :1}, {id :2}, {id :3}]
// users2 = [users[1], users[2]]
```

- 무조건적인 값 복사가 일어나지 않기때문에 성능상 이슈가 적다.
- 기존 데이터들을 최대한 남기면서, 변화가 있는 부분만 바꾸며 프로그래밍 하는 것이 불변성.

### Promise
- */yield, async/await와 함꼐 사용 됨.
- 값이 return될 것이란 기대를 갖고 있는 일급 객체(monad ?).

### 4. Collection 중심 프로그래밍
- map, reduce, findVal이 대표적인 함수들임.
- 가장 안쪽의 함수부터 평가되기 시작해서 바깥으로 나오게 됨(LISP like / 모든 로직과 값을 하나의 list에 갖혀있다... 라는 느낌으로).
- 로직, 함수, 파라미터 등 모든 것들을 '값'으로 다루겠다는 사상 (무언가 얻기위해 질의하는 SQL과는 사상이 다름 / 인자와 return값으로 소통함).
- RxJS는 이벤트를 '전파'하고 그 와중에 특정 이벤트에서 반응 하게끔 프로그래밍하게 하는 사상(RxJS의 filter함수는 collection을 받는 것이 아니라 단 한개의 이벤트만을 판단함).
