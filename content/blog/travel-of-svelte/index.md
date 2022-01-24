---
title: Travel of svelte
date: "2022-01-24T17:54:39.414Z"
description: "My experience about svelte"
tags: ["svelte"]
private: false
---

從幾個月前開始，我決定寫一個番茄鐘程式來幫助我保持專注，以及追蹤我過往的情況，在這個專案中，我決定給以前一直久仰大名，但是沒有什麼機會嘗試的 svelte 一個機會，這篇文章主要是記錄一些我在使用 svelte 上遇到的問題，以及我對他的想法。

## Pros

第一個我想提的就是 svelte 的語法非常的親切，svelte 的語法像是樣板引擎提供的語法，下面比較一下迴圈的寫法。

```js
// react
tasks.map((task) => <TaskItem {task} key={task.id} />)

// svelte
{#each tasks as task (task.id)}
	<TaskItem {task} />
{/each}

// vue
<TaskItem v-for="task in tasks" task={task} :key="item.id" />
```

語法的問題基本上是習慣就好了，但是 svelte 對我來說相當容易上手，寫錯的話就是沒辦法編譯，不用太擔心打錯字什麼的。

再來是 state 的部分，svelte 非常聰明，會自動追蹤關聯的 state 變化來重新渲染 component，同樣的事情在 react 上就會複雜許多。

```js
// react
const [count, setCount] = useState(0)
const handleClick = () => {
  setCount(prev => prev + 1)
}

// svelte
let count
const handleClick = () => {
  count += 1
}

// 很久沒碰 vue 了不清楚 3.0 是怎樣了就不獻醜了
```

可以看到 react 需要額外引入 `useState` ，如果是用 class component 的話，也要透過 `setState` 來觸發 rendering，svelte 對待 state 就像對待普通的變數一樣，不須用額外做什麼事情，非常的親切。

接著是 computed state，有些 state 會依據其他輸入來產生，當其他輸入發生變化的時候，這個 state 也需要跟著改變，這在 svelte 也是非常容易處理。

```js
// react
const aheadCount = useMemo(() => {
  return count + 1
}, [count])

// svelte
$: aheadCount = count + 1
```

svelte 提供一個 reactive declarations，任何透過 `$` 宣告的變數， svelte 會自動去找出他依賴於那些變數，在那些變數發生變化的時候自動重建，在 react 中，這需要透過 dependency array 來控制，還需要 linter 來幫助免得忘記輸入，不得不說 svelte 真的是弄得非常方便，而且 reactive declarations 是可以接收一個 function 的，即便這個變數的組成在怎麼複雜，也可以很清楚的表達，也可以透過 IIFE (Immedicately Invoked Function Expression)。

reactive declarations 的威力還不止如此，我們可以透過他建立一個 scope，在該 scope 裡面的程式會自動執行，當依賴的變數發生改變。

```js
// react
useEffect(() => {
  console.log(count)
}, [count])

// svelte
$: {
  console.log(count)
}
```

svelte 不需用像 react 一樣要額外引入 hook 就可以做到同樣的事情，而且不用處理 dependency array 真的是非常方便。

整體來說用 svelte 開發是一個非常愉快的體驗，不須用花什麼時間來適應框架，可惜的是 svelte 有些不是那麼方便的地方，但我非常期待 svelte 以後的發展。

## Cons

在我開發番茄鐘的過程中，遇到了一些問題，首先是 function 沒辦法回傳 component ，因此很難做到非常通用的客製化。

```js
// react
<List
	{items}
  renderItem={it => {
    return <li>{it.name}</li>
  }}
/>

// List.jsx
<ul>
	{props.items.map(props.renderItem)}
</ul>
```

在 react 中很常會看到像上面這種程式碼， react 使用 jsx 的關係，讓 function 可以自由的回傳任何的 component，這讓 react 中 component 的組合變得非常的自由，同樣的事情要在 svelte 中完成會變成相當複雜。

```js
// svelte
import Item from './Item.svelte';

<List {items} renderOptions={{
	component: Item,
	extraProps: {...}
}} >

// List.svelte
<ul>
	{#each items as item}
		<svelte:component this={renderOptions.component} {...renderOptions.extraProps} {item} />
	{/each}
</ul>

// Item.svelte
<li>{item.name}</li>
```

同樣的事情在 react 中是非常簡單的，寫起來也非常直覺，但是在 svelte 中就非常的複雜，非常希望 svelte 讓這變得更加簡單。

另外 react declarations 也沒有 react 中的 useEffect 靈活，例如我們想要在 props 改變的時候 reset local state ，在 react 就相當簡單，在 svelte 就比較麻煩。

```js
// react
useEffect(() => {
  // reset state
})

// svelte
let prevProps

$: {
  if (prevProps != props) {
    // reset state
    prevProps = props
  }
}
```

現在 svelte 對 typescript 的支援還不是很好，沒辦法做到 generic ，因此在使用上並沒有像 react 如此的方便。

## References

- https://pomodoro.kwguo.me
