---
title: iOS in app browser cookie
date: "2021-01-10T22:38:53.942Z"
description: "Just a record"
tags: ["cookie", "ios", "webview"]
---

先說結論，當使用 `SFSafariViewController` 的時候，就沒辦法使用 Cookie 。要用 Cookie 的話請使用 `UIWebView` or `WKWebView`。

會有這個問題是因為在目前開發的 app 中，會需要開啟一個需要使用者填資料的 webview ，為了取得目前的使用者，希望能夠在開啟 webview 的時候設定 cookie ，這樣才能夠知道使用者的資訊，但是試了很久發現不行， google 之後才知道本來就不行。

## References

- https://developer.apple.com/forums/thread/7713
- https://stackoverflow.com/questions/41226012/sfsafariviewcontroller-cookies
