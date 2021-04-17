---
title: Observable error handling
date: "2021-04-17T05:24:45.065Z"
description: "Be careful when handle observable error"
tags: ["rx"]
private: false
---

最近在專案上遇到一個問題，我們的程式有一個排程在固定每五分鐘執行一次，去 sync server 的資料，但是當 server 掛掉的時候，這個排程就會死掉。

這是原本的程式碼

```kotlin
ObservableInterval(
  0,
  5L,
  TimeUnit.MINUTES,
  Schedulers.io()
).map {
  doSync()
}.map {
  Result.Success
}.onErrorResumeNext { e: Throwable ->
  Result.Failure(e)
}.subscribe {
  when (it) {
    Result.Success -> SHOW_SUCCESS_MESSAGE
    is Result.Failure -> SHOW_ERROR_MESSAGE
  }
}
```

一但執行失敗就會掛掉的原因在於錯誤在最外層的 Observer 處理，一但 Observer 出現 error ，這個 Observer 就會停住，要解決這個問題，就要在裡面處理好錯誤，讓錯誤不要傳到外面來。

```kotlin
ObservableInterval(
  0,
  5L,
  TimeUnit.MINUTES,
  Schedulers.io()
).map {
  doSync().map {
    Result.Success
  }.onErrorResumeNext { e: Throwable ->
    Result.Failure(e)
  }
}.subscribe {
  when (it) {
    Result.Success -> SHOW_SUCCESS_MESSAGE
    is Result.Failure -> SHOW_ERROR_MESSAGE
  }
}
```

對於 rx 新手來說還滿容易出現的錯誤，在這邊紀錄一下。
