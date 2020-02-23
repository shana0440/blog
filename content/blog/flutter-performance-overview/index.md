---
title: Flutter Performance Overview
date: "2020-02-24T02:25:23.284Z"
description: "The best practices of flutter rendering"
---

簡單註記一下 [Performance best practices](https://flutter.dev/docs/perf/rendering/best-practices) 的內容，讓自己以後再開發的時候可以多注意一些。

1. Flutter 是 single thread，所以需要格外注意不要 block thread，不然整個 UI 都會掛掉，所以像是 open/read/write file 之類的方法，都盡量使用 async 來處理。
2. 為了讓整個 UI 的運作是流暢的，所以必須要保持在 **60fps**，因此每次繪製畫面都需要在 `16ms (1000ms/60)` 內完成，維持在這個渲染時間下，也避免手機過熱，以及電量消耗過快的問題。
3. 不要再 `build()` 當中做任何昂貴的操作，像是開啟檔案什麼的，因為 `build()` 會經常被呼叫到，不論是在 `setState` 或者是當任一祖先 rebuild 的時候。
4. 盡量讓避免 `build()` 當中包含大量的元素，取而代之應該建立多個小 widget 各自維護自己的 state。
5. 由於 `setState` 會讓所有的 child widget rebuild，因此必須盡力避免在上層 widget 中呼叫 setState。
6. 盡量避免任何會觸發 [`saveLayer()`](https://api.flutter.dev/flutter/dart-ui/Canvas/saveLayer.html) 的 widget 以及情況。 `saveLayer()` 會建立一個 stack 並把跟任何變化存在裡頭，最後攤平成一個圖層，由於他會請求一個 buffer 來處理這些部分，所以會特別的昂貴，是所有 operation 中最昂貴的一個。
   1. `Opacity` widget, 這個會觸發 `saveLayer()` 盡量使用 `FadeInImage` 或 `AnimatedOpacity` 代替。
   2. `Clipping` with `Clip.antiAliasWithSaveLayer` (雖然一般情況下 `Clipping` 並不會呼叫到 `saveLayer()`，但是 `Clipping` 本身就是一個昂貴的操作，要注意使用)。
   3. [Apply effects only when needed](https://flutter.dev/docs/perf/rendering/best-practices#apply-effects-only-when-needed) 網站上還有列出幾個我認為比較不常遇到的。
7. 使用 `AnimatedBuilder` 的時候，要注意 `builder()` 內的 widget 會在每個 frame 都會 rebuild，除非是跟 animation 有關的 widget，例如 rotate/opacity，否則應該在 child 先 build 好，接著在 `builder()` 當中取得 child 在繪製。 [Performance optimizations](`https://api.flutter.dev/flutter/widgets/AnimatedBuilder-class.html#performance-optimizations`)。
8. 不要在 animation 中使用 clipping，最好先 clipping 之後在使用 animation。
9. 在沒有特殊需求（再不可見的情況下，還需要佔據空間/回應事件等）下，使用 `if (isDisplayWidget) Widget` 取代 `Visibility(child: Widget)`，可以節省 build cost。
10. 使用 `ListView.builder` 繪製大量 item

以上是一些關於性能需要注意的事項，關於 `StatefulWidget` & `InheritedWidget` 的部分打算另外開文章來寫。
