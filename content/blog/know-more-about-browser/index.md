---
title: know-more-about-browser
date: "2022-01-03T04:58:24.070Z"
description: "Some browser behavior and js knowledge I should know"
tags: ["js", "browser"]
private: true
---

I'm working on browser very long time, but I never try to understand how js run on the browser, and is browser have any behevior should I know as a javascript developer? So I decide the take some time to learn those stuff, and write a post about it, so I can look back in future in case I forgot.

## Browser

The following order is how browser paint a screen.

```
+-----------------------------------------+
|                                         |
| JS > Style > Layout > Paint > Composite |
|                                         |
+-----------------------------------------+
```

The browser only render the screen when JS stack is empty, **Because JS might change the layout or style**, so to avoid browser keep render the screen, the browser only render when no JS code is running.

However, what if we request some data from layout, for example, like `width`, `offsetWidth`, ..., if we only request the data, but not change it, then the browser can give us information from previous layout, but if you change the layout or style, the browser will pause the JS runtime and force layout to give us the latest layout information, lets take a look about the following code.

```js
let widthSum = 0
const buttons = document.querySelectorAll(".btn")
for (const button of buttons) {
  button.classList.remove(".active")
  widthSum += button.width
}
```

The above code change the style before request the width, it mean browser need to force layout to get the latest width, otherwise the `widthSum` won't be correct, is that mean if we change the style after we request width then everything is ok?

```js
let widthSum = 0
const buttons = document.querySelectorAll(".btn")
for (const button of buttons) {
  widthSum += button.width
  button.classList.remove(".active")
}
```

Unfortunately, if we flat the for-loop, we still request the `width` after we change the style, so the browser still need to force layout, the correct version should be.

```js
let widthSum = 0
const buttons = document.querySelectorAll(".btn")
for (const button of buttons) {
  widthSum += button.width
}
for (const button of buttons) {
  button.classList.remove(".active")
}
```

In above version, we request all `width` before we change the style, so browser no need to force layout.

## JS runtime

How the browser interact with JS runtime? the browser can be two part, the **WebAPIs** and **JS runtime**, the WebAPIs provider us to access the DOM, `setTimeout` and other stuff, the JS runtime execute the JS code for us. so the document is not a part of JS, that's why in nodejs we don't have document, because there is no WebAPIs, however nodejs implement the `setTimeout`, `fetch`, and more useful tools that provider by WebAPIs.

> Because the document is belongs to WebAPIs, so when we bind the event to DOM, is WebAPIs fire the event instead of JS runtime, so if we bind two click event to a div name #click-me, when we click the #click-me, JS stack will push the first click callback, after the click callback finish, then push the second click callback, the change of the JS stack is, `empty -> first click callback -> empty -> second click callback -> empty`, so at the middle we can execute the microtask, but not task due to task will invoke after the render.

### Event loop

The event loop is a important part of js, since js is a single thread language, to avoid any async operator block the thread, we have a event queue, it will queue the async result, so JS runtime can do the other stuff, after no stuff need to handle, the event loop will take a task from event queue and put to JS stack to execute.

```
  JS stack              Event queue
+----------+         +--------------+
|          |         |              |
|          |         |              |
|          |         |              |
|  Task 3  |         | Async Task 3 |
|  Task 2  |         | Async Task 2 |
|  Task 1  |         | Async Task 1 |
+----------+         +--------------+
```

But things is not over, we have two kind of event queue, one is **Tasks**, another is **Microtasks**, the following is the different between **Tasks** and **Microtasks**.

- Tasks
  - execute timing
    - run after JS stack empty and after the render
  - operator
    - setTimeout
    - ...and more
- Microtasks
  - execute timing
    - run when JS stack empty before run Tasks and before the render
    - run after callback finish if JS stack empty and before the render
  - operator
    - Promise
    - MutationObserver
    - ...and more

```
  JS stack          Task Event queue          Microtasks Event queue
+----------+      +------------------+      +------------------------+
|          |      |                  |      |                        |
|          |      |                  |      |                        |
|          |      |                  |      |                        |
|  Task 3  |      |   Async Task 3   |      |    Async Microtask 3   |
|  Task 2  |      |   Async Task 2   |      |    Async Microtask 2   |
|  Task 1  |      |   Async Task 1   |      |    Async Microtask 1   |
+----------+      +------------------+      +------------------------+
```

The execute order is like following flow.

```
+---------------------------------------------------------------------------+
|                                                                           |
| JS stack > Microtasks > Render (Style, Layout, Paint, Composite) -> Tasks |
|                                                                           |
+---------------------------------------------------------------------------+
```

```html
<div class="outer">
  <div class="inner"></div>
</div>

<script>
  const outer = document.querySelector(".outer")
  const inner = document.querySelector(".inner")

  const clickHandler = name => () => {
    console.log(`${name}: click`)
    requestAnimationFrame(() => {
      console.log(`${name}: requestAnimationFrame`)
    })
    setTimeout(() => {
      console.log(`${name}: setTimeout`)
    })
    Promise.resolve().then(() => {
      console.log(`${name}: promise`)
    })
  }
  outer.addEventListener("click", clickHandler("outer"))
  inner.addEventListener("click", clickHandler("inner"))
</script>
```

The print order in edge is.

```
inner: click
inner: promise // execute microtask because the js stack is empty
outer: click
outer: promise // execute microtask because the js stack is empty
inner: requestAnimationFrame // execute before paint
outer: requestAnimationFrame // execute before paint
inner: setTimeout // execute after paint
outer: setTimeout // execute after paint
```

To check the execute order, open the DevTools, and go to performance tab, take a record, you can see the how browser works in chart.

## Event Table

You might curious, what if async job haven't finish? the Event Table will help us handle it, the Event Table will know there is a job haven't finish, and after it finish, Event Table will push Event Queue.

## References

- https://developers.google.com/web/fundamentals/performance/rendering/avoid-large-complex-layouts-and-layout-thrashing
- https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/
- https://www.youtube.com/watch?v=8aGhZQkoFbQ
- https://ithelp.ithome.com.tw/articles/10221944
