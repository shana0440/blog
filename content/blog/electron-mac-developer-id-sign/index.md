---
title: Electron mac developer id sign
date: "2020-09-16T17:35:38.199Z"
description: "How to sign electron app with Developer ID certificate"
tags: ["electron", "sign", "deployment", "entitlement"]
---

> 之前覺得 mas 很麻煩的我真是太天真了 :)

讓我先解釋一下 Developer ID 是用來幹嘛的吧，如果我們要從 mac app store 以外的地方下載 app，那我們就不能使用 mac developer certificate 來 sign app，要使用 Developer ID certificate 來 sign，apple 就是毛這麼多，如果有人可以告訴我為啥要這麼龜毛，那就幫大忙了。

要發布一個通過 apple 認證的 app 而不需用 mac store 需要三個步驟

1. sign app
2. pack app
3. notarize app

### GateKeeper

在講解步驟之前，我想先提一下為什麼事情變得這麼麻煩，就是因為 mac 有個東西叫做 gate keeper ，他會檢查所有 app 是不是都被 apple 認證了，沒有的話他會就警告你 =\_=

### Sign App

這邊基本上就是跟 [sign mas](/electron-mac-app-store-sign) 一樣，不一樣的地方就是 sign 出來的 app 可以執行。

### Pack App

electron builder 有提供 dmg & zip 之類的 build target ，要注意的是如果使用 `zip`，那出來的 artifact 解壓縮之後的檔案可能不能用，在 github repo 中已經有一個 [issue](https://github.com/electron-userland/electron-builder/issues/4299)，不知道什麼時候會處理好。

不過我們可以使用 `ditto -c -k --keepParent "$APP_PATH" "$ZIP_PATH"` 來產生我們的 zip file，這樣 zip file 就不會有問題。

### Notarize App

產生 artifact 之後還沒結束，我們要在 sign 一次 artifact，然後把 artifact 提交到 notarize server 讓 apple 對其認證，這樣我們才可以讓使用者下載這個 artifact。

```bash
# sign artifact
codesign --deep --force --verbose --sign "Developer ID Application: XXXXXX (XXXXX)" "$APP_PATH"

# submit to notarize server, this will return a UUID if upload success
xcrun altool --notarize-app \
  --primary-bundle-id "$APP_ID" \
  --username "$APPLE_ID" \
  --passowrd "$PASSWORD" \
  --file "$ARTIFACT_PATH" \
  # 如果帳號只有連結到一個組織，那就不需用設定這個
  --asc-provider "$PROVIDER_SHORT_NAME"

# list provider
xcrun altool --list-providers -u "$APPLE_ID" -p "$PASSWORD"

# check notarize status
xcrun altool --notarization-info "$UUID" -u "$APPLE_ID" -p "$PASSWORD"
```

當 status 變成 success 之後就代表成功了，如果有錯的話，`notarization-info` 會回傳 log 的網址，上面會說明錯誤。

## Some commands that used to verify codesign

```bash
## check who sign this app
spctl -a -vv "$APP_PATH"

## check codesign is success or not
codesign --verify -vvvv "$APP_PATH"
```

## Electron app blank after sign

有時候會遇到 electron app 在還沒 sign 之前好好的，但是 sign 之後畫面就整個沒出來，直接執行 `$APP_PATH/Contents/MacOS/$APP` 可以看到 terminal 有正常運作，`console.log` 都會顯示出來，如果是這樣的話，那原因可能出在 entitlements & child entitlements 這兩個檔案沒有設定好。

> child entitlement 是給 child process 用的

在我的情況，兩個檔案都必須設置下面的權利。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
  <true/>
</dict>
</plist>
```

> 因為 mac app store 會自己幫你 notarize，所以上傳到 mas 其實會比較簡單，缺點就是沒辦法測試，就這點來說，我寧可自己 notarize。

## References

- https://developer.apple.com/support/developer-id/
- https://developer.apple.com/documentation/xcode/notarizing_macos_software_before_distribution/customizing_the_notarization_workflow?preferredLanguage=occ
- https://github.com/electron-userland/electron-builder/issues/4299
- http://github.com/electron/electron-osx-sign/issues/188
- https://developer.apple.com/documentation/bundleresources/entitlements
