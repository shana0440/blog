---
title: Flutter Inherited Widget
date: "2020-03-01T23:53:28.409Z"
description: "Deep in to inherited widget"
tags: ["writing", "flutter", "state", "inherited widget"]
---

我在目前的專案，都是使用 stream 來儲存資料，讓各個 bloc 來監聽 stream 並輸出不同的 state，而我在 twitter 上看到一篇[文章](https://zonble.github.io/2019/12/07/what-if-states-are-out-of-flutter-widget-tree.html)說使用 stream 來觸發 rebuild 會造成多餘的 build，文章內建議使用 `InheritedWidget` 來處理這種 global state 的問題，而 `InheritedWidget` 對我來說有一個問題，就是他必須依賴 `context` 來獲得，這也因此激起我的興趣，想來研究一下 `InheritedWidget` 到底是怎麼運作的。

## InheritedWidget source code research

先來看一個 `InheritedWidget` 的基本用法，這個 `InheritedWidget` 專門儲存整個 app 的語言設定，而所有 Widget 都可以透過 `context` 取得這個 `InheritedWidget`。

```dart
enum Locale {
    EN,
    ZH,
}

class LocaleProvider extends InheritedWidget {
  final Locale locale;

  LocaleProvider(this.locale, {Widget child}) : super(child: child);

  static LocaleProvider of(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<LocaleProvider>();
  }

  @override
  bool updateShouldNotify(LocaleProvider oldWidget) {
    return oldWidget.locale != locale;
  }
}
```

接著我們來看 `InheritedWidget` 的 source code，可以看到他其實非常單純，唯一特別的是他建立了一個 `InheritedElement`。

```dart
abstract class InheritedWidget extends ProxyWidget {
  const InheritedWidget({ Key key, Widget child })
    : super(key: key, child: child);

  @override
  InheritedElement createElement() => InheritedElement(this);

  @protected
  bool updateShouldNotify(covariant InheritedWidget oldWidget);
}
```

接下來是 `InheritedElement` source code，在那之前，我們要先知道 Widget 是 Element 的 configuration，我們雖然在寫的都是 Widget，但 Flutter Framework 會幫我們把 Widget 轉換成 Element。

```dart
/// An [Element] that uses an [InheritedWidget] as its configuration.
class InheritedElement extends ProxyElement {
  /// Creates an element that uses the given widget as its configuration.
  InheritedElement(InheritedWidget widget) : super(widget);

  @override
  InheritedWidget get widget => super.widget;

  final Map<Element, Object> _dependents = HashMap<Element, Object>();

  @override
  void _updateInheritance() {
    assert(_active);
    final Map<Type, InheritedElement> incomingWidgets = _parent?._inheritedWidgets;
    if (incomingWidgets != null)
      _inheritedWidgets = HashMap<Type, InheritedElement>.from(incomingWidgets);
    else
      _inheritedWidgets = HashMap<Type, InheritedElement>();
    _inheritedWidgets[widget.runtimeType] = this;
  }

  @override
  void debugDeactivated() {
    assert(() {
      assert(_dependents.isEmpty);
      return true;
    }());
    super.debugDeactivated();
  }

  @protected
  Object getDependencies(Element dependent) {
    return _dependents[dependent];
  }

  @protected
  void setDependencies(Element dependent, Object value) {
    _dependents[dependent] = value;
  }

  @protected
  void updateDependencies(Element dependent, Object aspect) {
    setDependencies(dependent, null);
  }

  @protected
  void notifyDependent(covariant InheritedWidget oldWidget, Element dependent) {
    dependent.didChangeDependencies();
  }

  @override
  void updated(InheritedWidget oldWidget) {
    if (widget.updateShouldNotify(oldWidget))
      super.updated(oldWidget); // this will call [notifyClients]
  }

  @override
  void notifyClients(InheritedWidget oldWidget) {
    assert(_debugCheckOwnerBuildTargetExists('notifyClients'));
    for (Element dependent in _dependents.keys) {
      assert(() {
        // check that it really is our descendant
        Element ancestor = dependent._parent;
        while (ancestor != this && ancestor != null)
          ancestor = ancestor._parent;
        return ancestor == this;
      }());
      // check that it really depends on us
      assert(dependent._dependencies.contains(this));
      notifyDependent(oldWidget, dependent);
    }
  }
}
```

可以看到 `InheritedElement` 內部有一個 `_dependents` 的 HashMap，記錄了所有跟他有關的 Element，並提供了一些方法來跟動這個 map，接著看到 `notifyClients`，這裡會遊歷 map 中的所有節點，並依據 `updateShouldNotify` 來決定是否呼叫所有節點的 `didChangeDependencies`。

而我們是在什麼時候把節點加入到 `InheritedElement` 的呢？回到 `LocaleProvider`，我們提供了一個 function `of`，這個 `of` 呼叫了 `context.dependOnInheritedWidgetOfExactType<LocaleProvider>()`，

這個 `dependOnInheritedWidgetOfExactType` 定義在 `Element` 裡面，因為 `Element` 的 source code 很長，所以我只節錄了跟 `dependOnInheritedWidgetOfExactType` 有關的 source code；另外其實可以從 `Element` 的 source code 發現 `Element` 其實就是 `BuildContext`，有興趣再去看吧。

```dart
  Map<Type, InheritedElement> _inheritedWidgets;
  Set<InheritedElement> _dependencies;

  @override
  T dependOnInheritedWidgetOfExactType<T extends InheritedWidget>({Object aspect}) {
    assert(_debugCheckStateIsActiveForAncestorLookup());
    final InheritedElement ancestor = _inheritedWidgets == null ? null : _inheritedWidgets[T];
    if (ancestor != null) {
      assert(ancestor is InheritedElement);
      return dependOnInheritedElement(ancestor, aspect: aspect);
    }
    _hadUnsatisfiedDependencies = true;
    return null;
  }

  @override
  InheritedWidget dependOnInheritedElement(InheritedElement ancestor, { Object aspect }) {
    assert(ancestor != null);
    _dependencies ??= HashSet<InheritedElement>();
    _dependencies.add(ancestor);
    ancestor.updateDependencies(this, aspect);
    return ancestor.widget;
  }
```

可以看到 `Element` 自己也有一個 `_inheritedWidgets` map，並且在呼叫 `dependOnInheritedWidgetOfExactType` 時，會根據我們傳入的 type 來取得對應的 `InheritedWidget`，接著呼叫 `dependOnInheritedElement` 來呼叫 `InheritedElement` 的 `updateDependencies` 進而更新 `InheritedElement` 中的 `_dependents`。

到目前為止我們已經看完 `InheritedWidget` 相關的 source code 了，但是怎麼好像跟 build 一點關係都沒有？從 source code 來看， `InheritedWidget` 單純只是決定是否呼叫相關 Widget 的 `didChangeDependencies` 而已，而且 `InheritedWidget` 本身並沒有提供更新內部資料的方法，不過這篇有點太長了，所以我打算另外開一篇來做 Stream 跟 InheritedWidget 來管理 global state 的比較。

## Reference

- https://juejin.im/post/5c80efde5188251b8a53b306#heading-12
