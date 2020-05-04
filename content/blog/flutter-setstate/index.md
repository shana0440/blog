---
title: flutter setState
date: "2020-05-04T22:45:49.832Z"
description: "Some note for flutter setState"
---

會寫這篇，主要是在公司的專案看到了下面這種寫法。

```dart
class _CounterState extends State<Counter> {
  int _count;

  void increase() {
    _count++;
    setState(() {});
  }
}
```

雖然說這種寫法是可以的，不同於 React 的 `setState`，flutter 並沒有要求 state 必須是 immutable（沒記錯的話，如果在 React 直接去修改 state 在呼叫 `setState`，畫面並不會更新，因為 state 指向同一個 reference，所以 React 會認為資料沒有更新），在 flutter 中， `setState` 會通知 framework 要進行 rebuild ，而 framework 會自己 schedule 一個時間來做這件事情，rebuild 的時候由於 state 已經是新的，所以 `setState(() {})` 看起來是不會有什麼問題。

唯一個問題是 state 改變的時間點，當呼叫 `setState(() {})` 的時候，`setState` 的 callback 會被排入 queue 中，而 framework 會去執行這個 callback，如果我們在 callback 以外的地方更改 state ，當別的 widget 被其他事件 rebuild 的時候，這時候 state 可能沒有全部改變完畢，這會造成一些預料之外的行為，舉例來說，我們有個 widget 用來顯示文件，並且在 local 儲存一份做快取(先不要管我們不應該把這兩個行為放在一起，我想不到什麼好例子)。

```dart
class _DocumentState extends State<Document> {
  bool _isLoading = false;
  String _data;

  @override
  void initState() {
    super.initState();
    counterStream.listen((count) {
      _count = count;
      setState(() {});
    })
  }

  Future<void> downloadDocument(String filename) async {
    _isLoading = true;
    setState(() {});
    if (isDocumentInLocal(filename)) {
      data = await readDocumentFromLocal(filename);
      _isLoading = false;
      _data = data;
    } else {
      final data = await downloadDocument(filename);
      _isLoading = false;
      // if widget rebuild during the async operation
      // then will happened _isLoading is false, but _data is null.
      await storeDocumentToLocal(filename, data);
      _data = data;
    }
    setState(() {});
  }
}
```

雖然我想不到什麼好例子，所以上面的程式感覺像是為犯錯而犯錯，不過已經可以表達我想要說明的問題點了，問題就是在於當我們呼叫 `downloadDocument` 後，修改了 `_isLoading`，接著執行了一個 async operation，最後再做了 `setState(() {})` 來更新畫面，問題是除了 `setState(() {})` 以外，還有其他情況會造成 widget rebuild，像是 parent rebuild 之類的，要是我們在進行 `storeDocumentToLocal` 的時候，widget 因為其他原因 rebuild 了，這時候就會產生 `_isLoading == false` 但是 `_data` 卻是 `null` 的情況。

為了避免這個問題，就是要記住再修改 state 的時候，要記得放進 `setState` 的 callback 裡面。

就我來看，這是一個非常不明顯的問題，平常就算這樣寫我想應該也不會有什麼問題，因為並不會很常去觸發 rebuild ，並且在撰寫程式的時候，其實不太容易發生在修改 state 之後，沒有呼叫 `setState` 就執行 async operation 的情況，所以這個問題很不明顯，但是這當然還是一個問題，可以的話，最好是避免他。

另外在這邊總結一下使用 `setState` 要注意的部分，其實在 `setState` 原始碼的註解上都寫得滿清楚的了，有需要可以去看看。

1. 不要在 `setState` 的 callback 以外的地方去更改會動到畫面的 state
2. 不要在 `setState` 中執行任何 async operation
3. 不要在 `setState` 的 callback 裡頭做一些不會更改 state 的行為，這會拖累 `setState` 的執行時間，進而影響 flutter framework 對於 rebuild 時間的管理。

## Reference

- https://github.com/flutter/flutter/issues/3951#issuecomment-219583755
