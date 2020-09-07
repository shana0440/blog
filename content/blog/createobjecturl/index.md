---
title: URL.createObjectURL
date: "2020-09-07T04:19:35.582Z"
description: "URL.createObjectURL is deprecated :shocked:"
---

## 前情提要

最近在開發一個功能是匯出 Excel，由於牽扯到權限的問題，如果另外開啟一個分頁的話，沒辦法從 `localStorage` 中拿出 `api token` 自動帶在 header 裡面，因此我透過 api 取得 backend 匯出的 excel，並透過 `URL.createObjectURL` 來產生一個 URL 對應到這個 excel ，這樣就可以下載這個檔案了。

```
browser -> call export excel api -> get excel in js ->
call URL.createObjectURL -> open return url ->
call URL.revokeObjectURL
```

## What is URL.createObjectURL?

先來介紹一下 `URL.createObjectURL` ，這是一個 function 提供使用者傳入 `Blob`, `File` 等 binary 的資料，並產生一個 URL，讓使用者可以透過讀取這個 url 來讀取 binary data，`URL.createObjectURL` 會將 binary data 儲存在 browser 的 memory，並產生一個 URL 對應到該 binary data，所以記得要呼叫 `URL.revokeObjectURL` 來釋放這個資源，說明可能有點模糊，我們來搭配一些例子。

#### 顯示圖片

圖片是一個 binary file，假設使用者上傳一個圖片，我們想要提供預覽圖片的功能（先假裝我們沒有 FileReader），我們可以透過 `const url = URL.createObjectURL(__USER_UPLOAD_FILE__)`，來建立一個 URL 對應到這個 file ，之後透過 `img.src = url`，就可以顯示圖片了。

#### 下載檔案

假設我們要產生一個巨大的 excel 檔，直接 `window.open`，會卡超級久，我們可以透過 api call 拿回整個 excel 的 binary data ，並且能夠在產生 excel 的途中顯示這個 loading state，提供較好的 UX。

```ts
// display loading
const resp = axios.get("excel")
const url = URL.createObjectURL(resp.data)
const anchor = document.createElement("a")
anchor.href = url
anchor.download = "__FILENAME__"
anchor.click()
URL.revokeObjectURL(url)
// dismiss loading
```

## What is the problem now?

從上面的例子可以看出 `URL.createObjectURL` 非常萬用，但是我在最新個 chrome 使用 `URL.createObjectURL` 時，遇到下面的錯誤。

```
Failed to execute 'createObjectURL' on 'URL': No function was found that matched the signature provided.
```

經過一番搜尋之後，知道了現在推薦直接使用 `MediaSource`, `MediaStream`, `Blob`, `File` 等 binary 資料，而不透過 `URL.createObjectURL`。

```ts
const mediaSource = new MediaSource();
const mediaStream = new MediaStream();
const blob = new Blob([]);
const file = new File();

if ('srcObject' in video) {
  video.srcObject = mediaSource or mediaStream;
} else {
  video.src = URL.createObjectURL(mediaSource or mediaStream);
}

if ('srcObject' in img) {
  img.srcObject = blob or file;
} else {
  img.src = URL.createObjectURL(blob or file);
}
```

對於 media 的元素來說，這沒有什麼問題，但是如果我們想要達成下載 excel 的範例，就我所知目前沒有任何辦法。

## What can we do?

我想到的方法是是改變我們的下載流程。

```
// 原始流程
call export excel api -> get excel binary -> create URL -> download file by js.
// 修改後的流程
call export excel api -> return url for exported excel -> open url.
```

差別就在於現在我們不能直接輸出 excel 到 http response，而是先產生一個 file 到 storage (like S3 for example)，再回傳這個 download url 給 browser ，然後 browser 再去開啟這個檔案，如此一來我們還是可以保有 error handling & loading state。

## References

- https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL
- https://stackoverflow.com/questions/27120757/failed-to-execute-createobjecturl-on-url
- https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/srcObject
