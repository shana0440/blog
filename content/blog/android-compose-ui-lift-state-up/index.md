---
title: Android Compose UI lift state up
date: "2021-02-27T10:17:23.724Z"
description: "How to share the state in Compose UI"
tags: ["android", "compose ui", "state management"]
---

> 這邊文章是基於 `1.0.0-alpha10`
> 由於 Compose UI 仍然在 alpha 階段，任何 API 都尚未確定，請確定自己使用的版本並以[官方文件](https://developer.android.com/jetpack/compose)為主。
> `Ambient` 在 `1.0.0-alpha12` 已經被改名為 `CompositionLocal`

在 React 中，如果我們想要讓兩個 component 共用一個 state ，在傳統的作法，我們可能會引入 redux 這種套件來處理共享 state，但是在有個 context 的情況下，我們就不需用 redux 這麼複雜的解決方案了，我們可以單純的將共同的 state 上升到兩個 component 共同的 ancestor，再透過 context 傳遞 state ，這樣兩個 component 就可以共享同一個 state 了。

### Ambient

在 Compose UI 我們要怎麼做到這件事情呢？
Compose UI 提供了 Ambient + Providers 來讓我們能做到相同的事情，下面是一個 Ambient + Providers 的範例。

```kotlin
class IntlViewModel: ViewModel() {
  val mutLocale = MutableLiveData<Locale>(Locale.EN)
  val locale: LiveData<Locale>() = mutLocale

  val updateLocale(locale: Locale) {
    mutLocale.value = locale
  }
}

val AmbientIntlViewModel = ambientOf<IntlViewModel>

@Composable
fun App() {
  val intlViewModel = viewModel<IntlViewModel>()
  Providers(AmbientIntlViewModel.provides(intlViewModel)) {
    HomeScreen()
  }
}

@Composable
fun HomeScreen() {
  val intlViewModel = AmbientIntlViewModel.current
  val locale = intlViewModel.locale.observeAsState().value
  Text(
    "current locale is %s".format(locale)
  )
}
```

## References

- https://zh-hant.reactjs.org/docs/lifting-state-up.html
- https://foso.github.io/Jetpack-Compose-Playground/general/compositionlocal/
