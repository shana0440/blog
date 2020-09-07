---
title: Android Intent FLAG_ACTIVITY_NEW_TASK
date: "2020-03-08T18:10:18.791Z"
description: "A brief introduction about Android task, activity, intent"
tags: ["android", "intent"]
---

最近在專案遇到一個對 Android Developer 滿基礎的問題吧，無奈開發 App 一直都不是我的強項（不知道為什麼現在都在開發 App），也是在這問題上折騰了許久，所以打算來了解一下 Android 的一些相關知識。

首先遇到的問題是，我們在專案中使用 [url_launcher](https://pub.dev/packages/url_launcher) 來開啟另一個 App，但在 Android 上，新開的 App 不會開啟新的 Task，而是在原本的 Task 中開啟新的 App，為了解決這個問題，先來了解一下 Android 的一些背景知識。

## Activity

Activity 其實就是一個畫面，使用者可以跟他互動，而開啟 App 的時候，會透過在 AndroidManifest 的設定中，找到所謂的 **主要 Activity** 並啟動，也就是在 Splash Screen 後，第一個顯示的畫面。

一個 App 可以擁有很多 Activity，就像是網頁在不同的畫面中切換一樣，雖然目前 Android 應該是比較流行所謂的 Single Activity Application，因為 Fragment 帶來的使用者體驗比較好，不過我寫 Android 的經驗也不多，就不在此介紹了。

Activity 就像 React Component 一樣，提供許多 life cycle 的 function，我也不在此介紹了，[官方文件](https://developer.android.com/guide/components/activities?hl=zh-tw)說明的很詳細。

## Task

Task 是一個 Back Stack，用來控制及收納 Activity，當從桌面開啟一個新 App 的時候，就會開啟一個新的 Task，所以我們可以在不同的 App 之間切換，並在同一個 Task 中控制 Activity 的切換，[官方文件](https://developer.android.com/guide/components/activities/tasks-and-back-stack)解釋的也是很詳細，我也不在此贅述了。

## Intent

Intent 是 Android 用來向另一個[應用程式元件](https://developer.android.com/guide/components/fundamentals?hl=zh-tw#Components)要求動作的物件。

在 AndroidManifest 中，我們可以設定 `intent-filter`，來控制 Activity 要接收什麼 intent，由於接受 intent 的是 activity，所以當我們接收到一個 intent，開啟一個 activity，他會在原本的 task 開啟，而不是開啟一個新的 task，這就不符合我們的預期，因為這看起來就像是同一個 App 換一個畫面而已，而不是新開了一個 App。

如果要讓新開的 Activity 放到新的 Task，我們需要多加 [`FLAG_ACTIVITY_NEW_TASK`](https://developer.android.com/reference/android/content/Intent#FLAG_ACTIVITY_NEW_TASK)，另外為了避免每次都新開一個新的 Task，需要使用 [`FLAG_ACTIVITY_SINGLE_TOP`](https://developer.android.com/reference/android/content/Intent#FLAG_ACTIVITY_SINGLE_TOP)，這樣就會回到擁有這個 Activity 的 Task，而不是新開一個。

## Deep in to url_launcher source code

接著我們來看 `url_launcher` 是怎麼使用 intent 吧，我這邊就只節錄 `launch` 的程式碼，其他的就自己去 [github](https://github.com/flutter/plugins/tree/master/packages/url_launcher/url_launcher) 看吧

```java
LaunchStatus launch(
    String url,
    Bundle headersBundle,
    boolean useWebView,
    boolean enableJavaScript,
    boolean enableDomStorage) {
  if (activity == null) {
    return LaunchStatus.NO_ACTIVITY;
  }

  Intent launchIntent;
  if (useWebView) {
    launchIntent =
        WebViewActivity.createIntent(
            activity, url, enableJavaScript, enableDomStorage, headersBundle);
  } else {
    launchIntent =
        new Intent(Intent.ACTION_VIEW)
            .setData(Uri.parse(url))
            .putExtra(Browser.EXTRA_HEADERS, headersBundle);
  }

  activity.startActivity(launchIntent);
  return LaunchStatus.OK;
}
```

可以看到在 `launchIntent` 這邊，並沒有指定 `FLAG_ACTIVITY_NEW_TASK`, `FLAG_ACTIVITY_SINGLE_TOP` 兩個 Flags，也就造成了我遇到的問題，如果要上這段程式碼如我預期的運作，則應該改成下面這樣。

```java
    launchIntent =
        new Intent(Intent.ACTION_VIEW)
            .setData(Uri.parse(url))
            .setFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            .setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP)
            .putExtra(Browser.EXTRA_HEADERS, headersBundle);
```

雖然最後我沒有修改這個 package，而是直接使用 [android_intent](https://pub.dev/packages/android_intent) 來解決問題。

## References

- https://developer.android.com/guide/components/activities?hl=zh-tw
- https://developer.android.com/guide/components/activities/tasks-and-back-stack
- https://developer.android.com/guide/components/intents-filters?hl=zh-tw
