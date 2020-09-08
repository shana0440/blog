---
private: true
title: state control
date: "2020-06-30T05:13:43.675Z"
description: "A tip about code readability"
tags: ["flutter", "state", "code quality"]
---

起因是這樣的，我們有個 list view ，需要處理 loading, display 的 state，下面是我的作法。

```dart
_search() {
  setState(() => _state = _State.Loading);
  await _fetchFeeds();
}

_refresh() {
  await _fetchFeeds():
}

_loadMore() {
  await _fetchFeeds(cursor);
}

_fetchFeeds([int cursor = 0]) {
  try {
    await feedRepo.fetchFeeds(cursor);
  } catch (e) {
    displayError(context, e);
  } finally {
    setState(() => _state => _State.Display);
  }
}
```

資深的說這樣的問題在於如果只看 `_fetchFeeds` 的話，會不了解這個 `setState` 是幹嘛用的，而且對於 `_refresh` & `_loadMore` 來說，這個 `setState` 是多餘的，因此最好的做法是把 state change 都放到同一個 function 裡面完成，這樣 code 會比較好讀，而且沒有 side effect，當然 `displayError` 還是 side effect 就是了 :|

```dart
_search() {
  setState(() => _state = _State.Loading);
  await _fetchFeeds();
  setState(() => _state => _State.Display);
}

_refresh() {
  await _fetchFeeds():
}

_loadMore() {
  await _fetchFeeds(cursor);
}

_fetchFeeds([int cursor = 0]) {
  try {
    await feedRepo.fetchFeeds(cursor);
  } catch (e) {
    displayError(context, e);
  }
}
```

## Conclusion

簡單來說，就是盡量讓 state change 在同一個 function 內完成，讓其他 function 為 pure function。
