---
title: Electron mac app store sign
date: "2020-09-07T21:20:40.341Z"
description: "If didn't works don't surprise"
tags: ["mac app store", "mas", "electron", "sign", "deployment"]
---

最近被公司叫去寫個 electron 的專案，今天來記錄一下再處理 mac app sign 的問題。

眾所皆知，apple 是一間很龜毛的公司，最作為一個開發者，當想要上架程式到 app store 或者是 mac app store，都會是一段痛苦的經驗， app store 有個麻煩的審核流程，而 mac app store 更是有過之而無不及，除了審核流程以外，sign 流程更是痛苦。

在把程式上架到 mac app store(mas) 之前，我們需要兩個 certificate （`3rd Party Mac Developer Application: XXXXXXX (XXXXXX)`, `3rd Party Mac Developer Installer: XXXXXXX (XXXXXX)`） 跟一個 provisioning profile。

我們會透過 [electron-builder](https://github.com/electron-userland/electron-builder) 來 build 我們的 electron app，下面是一個基本的 electron build config for mas build。

```json
{
  "appId": "my.app.id",
  "mac": {
    "identity": "XXXXXXX (XXXXXX)",
    "type": "distribution",
    "target": ["mas"],
    "entitlements": "./entitlements.plist",
    "entitlementsInherit": "./entitlements.inherit.plist",
    "provisioningProfile": "./MY.provisionprofile"
  }
}
```

透過這個[文件](https://www.electron.build/configuration/mac)，我們可以知道 target 中有 `mas` & `mas-dev`，這兩個到底差在哪裡？這就到我開發的時候遇到的問題了。

其實我們不能執行 distribution-signed 的 app， mac app store 會 re-signed 一次讓所有人的 mac 都能安裝這個檔案，我們能做的就是自己用 `Developer ID: XXXXXXX (XXXXX)` certificate resign，這就是 `mas-dev` 的功能，他會幫我們 resign app ，好讓我們可以測試這個東西是不是可以正常運作。

因為我是花了很多時間在上面，才知道我們是沒辦法測試 distribution-signed app 的，才在這邊紀錄一下，避免以後忘記，因為 iOS 就可以直接測試，再不然也有 TestFlight ，誰知道 mac app store 沒有這種東西 =\_=

## References

- https://www.electron.build/code-signing#how-to-export-certificate-on-macos
- https://developer.apple.com/forums/thread/651943
