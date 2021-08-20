# Simple JS Router

## Installation

    npm install ot-router

## Простой пример

```js
import Router from "ot-router";

const router = new Router()
onEnter() {
  console.log('Hello world')
}
router.on({match: '/', onEnter: [onEnter]})
```

### параметры конструктор Router

```js
const router = new Router(hashMode, selector);
```

`hashMode` - boolean значение, которое говорит, использовать hash вместо History Api, по умолчанию false

`selctor` - css селектор, по которому выбираются теги для роутинга, по умолчанию берутся все теги "a"

### Методы

`router.on` - прослушивает путь по заданному правилу

```js
router.on({
  match: "/",
  beforeEnter: [onLeave],
  onEnter: [onEnter, onEnter2],
  onLeave: [onLeave],
});
```

`router.go` - перейти по заданному пути

```js
const someParams = { a: 12, c: "test arg" };
router.go("/path-to-go", someParams);
```
