---
title: react-native aspectRatio
date: "2020-10-05T09:19:43.426Z"
description: "Save us from image size of different device"
tags: ["flutter", "react-native"]
---

最近在寫 react-native ，當再處理圖片相關的元件時，常常需要注意在不同 device 上呈現的樣子，因為每個 device 的寬度都不同，如果固定高度的話，就會遇到圖片被壓縮的情況，這時候我們可以使用 `aspectRatio` 這個 style 來幫助我們在不同 device 上圖片會自動調整他的高度來避免被壓縮的情況。

```ts
{
  aspectRatio: width / height,
}
```

順帶一提 flutter 的話，有 `AspectRatio` 這個元件可以使用

```dart
AspectRatio(
  aspectRatio: width / height,
  child: Image(
    image: AssetImage('assets/images/image.png'),
    fit: BoxFit.fill,
  )
)
```
