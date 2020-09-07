---
title: Deep in to BLoC
date: "2020-03-08T23:55:34.074Z"
description: "introduce BLoC pattern and the problem I encounter"
tags: ["flutter", "state", "bloc"]
---

目前手上的專案是採用 BLoC Pattern，當初採用這個 Pattern 的理由滿簡單的，就是網路上滿多人推薦，而且我不喜歡 redux，因為太多 boilerplate。

先來簡單介紹一下 BLoC Pattern 吧，這個 Pattern 跟 MVC, MVVM 一樣，都是用來將一些商業邏輯抽離 View，讓 View 盡量單純的設計模式，BLoC 是用 Stream 來通知 View state 的改變，view 則針對這個 state 來建立 widget，網路上已經有不少文章再介紹 BLoC Pattern 了，我也就不特別花篇幅重新介紹，看過這個[影片](https://www.youtube.com/watch?v=PLHln7wHgPE)，就應該會有不少了解了。

現在我們來使用 BLoC Pattern 寫一個根據使用者輸入的關鍵字，來搜尋列表的 Widget 吧。

```dart
class BlocSearchListBloc extends Bloc<BlocSearchListEvent, BlocSearchListState> {
  ItemRepository _itemRepo = GetIt.I<ItemRepository>();

  @override
  BlocSearchListState get initialState => IdleState();

  @override
  Stream<BlocSearchListState> mapEventToState(
    BlocSearchListEvent event,
  ) async* {
    if (event is SearchEvent) {
      yield LoadingState();
      final items = await _itemRepo.searchItems(event.keyword);
      yield DisplayState(items);
    }
  }

  void search(String keyword) {
    add(SearchEvent(keyword));
  }
}

class SearchList extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Column(
      children: <Widget>[
        TextField(onChanged: () {
          final bloc = context.bloc<BlocSearchListBloc>();
          bloc.search(value);
        }),
        Expanded(
          child: BlocBuilder<BlocSearchListBloc, BlocSearchListState>(
            builder: (BuildContext context, state) {
              if (state is LoadingState) {
                return Text("loading...");
              }

              if (state is DisplayState) {
                if (state.result.isEmpty) {
                  return Text("no result");
                }
                return ListView.builder(
                  itemCount: state.result.length,
                  itemBuilder: (context, index) {
                    return ListTile(
                      title: Text(state.result[index].name),
                    );
                  },
                );
              }

              return Text("try search something");
            },
          ),
        ),
      ],
    );
  }
}
```

上面是一個經典的 BLoC Pattern，可以看到我們的 View 單純的根據 state 來產生 widget ，成功的分離了商業邏輯跟畫面，但這段程式有個問題，當使用者輸入 `abcd` 的時候，我們應該只需要關注 `abcd` 的結果就好了，前面的結果對我們而言是不重要的，但這段程式卻會取得 `a` 的結果後，再去取得 `ab` 的結果，以此類推，最後取得 `abcd` 的結果的時候，我們已經等待了 `a`, `ab`, `abc`, `abcd` 四個 query 的時間，這導致使用者會覺得畫面卡住了，一直卡在 `LoadingState`。

## Deep in to BLoC source code

透過 BLoC source code 來找找看問題在哪裡，我這邊只節錄一些相關的 function。

````dart
abstract class Bloc<Event, State> extends Stream<State> implements Sink<Event> {
  final PublishSubject<Event> _eventSubject = PublishSubject<Event>();

  BehaviorSubject<State> _stateSubject;

  /// Transforms the [events] stream along with a [next] function into a `Stream<State>`.
  /// Events that should be processed by [mapEventToState] need to be passed to [next].
  /// By default `asyncExpand` is used to ensure all [events] are processed in the order
  /// in which they are received. You can override [transformEvents] for advanced usage
  /// in order to manipulate the frequency and specificity with which [mapEventToState]
  /// is called as well as which [events] are processed.
  ///
  /// For example, if you only want [mapEventToState] to be called on the most recent
  /// [event] you can use `switchMap` instead of `asyncExpand`.
  ///
  /// ```dart
  /// @override
  /// Stream<State> transformEvents(events, next) => events.switchMap(next);
  /// ```
  ///
  /// Alternatively, if you only want [mapEventToState] to be called for distinct [events]:
  ///
  /// ```dart
  /// @override
  /// Stream<State> transformEvents(events, next) {
  ///   return super.transformEvents(
  ///     events.distinct(),
  ///     next,
  ///   );
  /// }
  /// ```
  Stream<State> transformEvents(
    Stream<Event> events,
    Stream<State> Function(Event) next,
  ) {
    return events.asyncExpand(next);
  }

  Stream<State> mapEventToState(Event event);

  /// Transforms the `Stream<State>` into a new `Stream<State>`.
  /// By default [transformStates] returns the incoming `Stream<State>`.
  /// You can override [transformStates] for advanced usage
  /// in order to manipulate the frequency and specificity at which `transitions` (state changes)
  /// occur.
  ///
  /// For example, if you want to debounce outgoing [states]:
  ///
  /// ```dart
  /// @override
  /// Stream<State> transformStates(Stream<State> states) {
  ///   return states.debounceTime(Duration(seconds: 1));
  /// }
  /// ```
  Stream<State> transformStates(Stream<State> states) => states;

  void _bindStateSubject() {
    Event currentEvent;

    transformStates(transformEvents(_eventSubject, (Event event) {
      currentEvent = event;
      return mapEventToState(currentEvent).handleError(_handleError);
    })).forEach(
      (State nextState) {
        if (state == nextState || _stateSubject.isClosed) return;
        final transition = Transition(
          currentState: state,
          event: currentEvent,
          nextState: nextState,
        );
        try {
          BlocSupervisor.delegate.onTransition(this, transition);
          onTransition(transition);
          _stateSubject.add(nextState);
        } on Object catch (error) {
          _handleError(error);
        }
      },
    );
  }
}
````

可以看到 BLoC 的程式碼非常簡單，首先最重要的就是 `_bindStateSubject` 了，這邊透過 `transformEvents` 把 event 轉變為 state, 再透過 `transformStates` 把 state 變成 state，之後在把 state 加到 `_stateSubject` 中，我們的 view 就會針對這個 state 進行重建。

來看一下 `transformEvents`，這邊透過 `asyncExpand` 把 event 轉成 state，`asyncExpand` 會確保 event 被正確處理完畢之後，才處理下一個 event ，這就是我們上面遇到的問題！註解也有說明，我們可以 override 這個 function ，改成 `events.switchMap(next)` ，就會變成只取得最後一個 event，而這恰好就是我們要的。

我們也來看一下 `asyncExpand` 的原始碼吧

```dart
Stream<E> asyncExpand<E>(Stream<E> convert(T event)) {
    _StreamControllerBase<E> controller;
    StreamSubscription<T> subscription;
    void onListen() {
      assert(controller is _StreamController ||
          controller is _BroadcastStreamController);
      subscription = this.listen((T event) {
        Stream<E> newStream;
        try {
          newStream = convert(event);
        } catch (e, s) {
          controller.addError(e, s);
          return;
        }
        if (newStream != null) {
          subscription.pause();
          controller.addStream(newStream).whenComplete(subscription.resume);
        }
      },
          onError: controller._addError, // Avoid Zone error replacement.
          onDone: controller.close);
    }

    if (this.isBroadcast) {
      controller = new StreamController<E>.broadcast(
          onListen: onListen,
          onCancel: () {
            subscription.cancel();
          },
          sync: true);
    } else {
      controller = new StreamController<E>(
          onListen: onListen,
          onPause: () {
            subscription.pause();
          },
          onResume: () {
            subscription.resume();
          },
          onCancel: () => subscription.cancel(),
          sync: true);
    }
    return controller.stream;
  }
```

`asyncExpand` 最重要的就是那段 `onListen` 了，`convert` 就是我們的 `mapEventToState`，可以看到如果 `convert` 回傳一個 stream 的話，我們會暫停目前的 stream，也就是 events，直到 `newStream` 發出 done event，才會繼續處理下一個 event。

`transformStates` 預設是什麼都不做，我也暫時想不到會有什麼需求是要動到 `transformStates` 🤔

回到一開始的範例，要讓他正常運作，我們只需要把 BLoC 修改為下面這段程式碼即可。

```dart
class BlocSearchListBloc extends Bloc<BlocSearchListEvent, BlocSearchListState> {
  ItemRepository _itemRepo = GetIt.I<ItemRepository>();

  @override
  BlocSearchListState get initialState => IdleState();

  @override
  Stream<BlocSearchListState> transformEvents(events, next) {
    return events.switchMap(next);
  }

  @override
  Stream<BlocSearchListState> mapEventToState(
    BlocSearchListEvent event,
  ) async* {
    if (event is SearchEvent) {
      yield LoadingState();
      final items = await _itemRepo.searchItems(event.keyword);
      yield DisplayState(items);
    }
  }

  void search(String keyword) {
    add(SearchEvent(keyword));
  }
}
```
