---
title: Hide sensitive information on mobile
date: "2020-12-16T15:34:27.518Z"
description: "How to hide sensitive information on mobile"
tags: ["writing", "ios", "android"]
---

在 Android 如果我們希望讓使用者不能在輸入帳戶密碼之類的機密訊息的頁面上截圖，我們可以使用下面的方法。

```kotlin
// disable screen capture
activity.window.addFlags(WindowManager.LayoutParams.FLAG_SECURE);
// enable screen capture
activity.window.clearFlags(WindowManager.LayoutParams.FLAG_SECURE);
```

但是在 iOS 我們沒有這種方法，iOS 提供了 `userDidTakeScreenshotNotification` 事件可以讓我們知道使用者截圖了。
但我們沒有方法可以阻止使用者截圖，我們只能讓機密資料不會出現在 task switcher 中，也就是**讓 app 再進入 background 的時候用個畫面來遮住整個 app**，以避免不小心洩露出機密資料。
我們可以透過 `applicationWillResignActive` & `applicationDidBecomeActive` 這兩個 life cycle hook 來遮住我們的 app ，下面是一個用 splash screen 來遮住畫面的範例。

```objective-c
@implementation AppDelegate
...
- (void)applicationWillResignActive:(UIApplication *)application {
  if (ScreenCaptureSecure.hideApp) {
    [RNSplashScreen showSplash:@"LaunchScreen" inRootView:self.window.rootViewController.view];
  }
}

- (void)applicationDidBecomeActive:(UIApplication *)application {
  [RNSplashScreen hide];
}
@end
```

### Refs

- https://developer.apple.com/documentation/uikit/uiapplication/1622966-userdidtakescreenshotnotificatio
- https://developer.apple.com/library/archive/qa/qa1838/_index.html
