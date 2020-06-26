---
title: Typescript type override
date: "2020-06-26T19:10:17.011Z"
description: "A problem when I try to override the default type definition"
---

這個問題是我在開發 nodejs 的時候，我想要 override `koa` 的 `request.body`，來讓他支援 type 所遇到的問題。

首先我有一個 handler 接受一個 type ，用來申明 context 的 type。

```typescript
interface Handler<T> {
  handle: (ctx: T) {}
}
```

現在假設我有兩個 middleware ，一個會寫入 config ，一個會解析 body，並且 handler 同時使用兩個 context

```typescript
interface ConfigContext extends Koa.Context {
  config: Config
}

interface MyRequest<T> extends Koa.Request {
  body: T
}

interface BodyContext<T> extends Koa.Context {
  request: MyRequest<T>
}

const handler: Handler<ConfigContext & BodyContext<{ username: string }>> {
  handle(ctx) {
    console.log(ctx.request.body.username) // ctx.request.body is any
  }
}
```

我發現到在這個時候 `body` 的 type 是 `any`，而不是我期望的 `{ username: string }`，這個問題在 [issue](https://github.com/microsoft/TypeScript/issues/2871) 中有被提過，雖然 issue 中說的是 `interface`，但我相信 union type 應該也是同樣的原因，如果不是請告訴我 :|

由於 typescript 會不能了解他應該要拿哪一個 type 才好，所以就會變成 `any`，要解決這個問題，就需要明確的指定我們要使用哪一個 type。

```typescript
interface Context extends ConfigContext {
  request: MyRequest<{ username: string }>
}

const handler: Handler<Context> {
  handle(ctx) {
    console.log(ctx.request.body.username) // now we can enjoy the type :)
  }
}
```
