---
title: RFC 1738
date: "2020-11-14T14:26:07.759Z"
description: "Let's read some RFC :)"
tags: ["writing", "url", "rfc", "rfc-1738"]
---

## 前言

最近在寫 react-native 的時候，發生了一個 app crash 的問題，原因出在於再接第三方的 api 的時候，對方的 url 會回傳一個空白在 url 的尾端，然後在開啟 webview 的時候 ios 就 crash 了，在 google 的時候看到 RFC 就是不允許 url 有空白，所以想來看一下 RFC 1738。

## URL Scheme

```
<scheme>:<scheme-specific-part>
```

scheme 由 `a-z`, `0-9`, `+`, `-`, `.` 組成，且解析器應該將大小寫視為等效 (`HTTP`跟`http`相等)。

## URL 編碼問題

任何字元都必須要能表示成 US-ASCII ，如果不能找到對應的文字，就必須編碼成 US-ASCII ，像是 emoji 之類的，就必須被 encode

### Unsafe Characters

下列字元是不安全的，基本上是因為歷史遺毒的關係，所以即使在 US-ASCII 可以看到他們，這些字元也必須被 encode

```
space, >, <, ", #, %, {, }, |, \, ^, ~, [, ], `
```

空白需要被 encode 根據 RFC 上寫的，因為空白可能在文字處理程式上被移除或者是加入，因此最好還是要 encode。

> The space character is unsafe because significant spaces may disappear and insignificant spaces may be introduced when URLs are transcribed or typeset or subjected to the treatment of word-processing programs.

### Reserved Characters

下列字元因為有在 scheme 上有特殊的用意，因此也需要被 encode

```
;, /, ?, :, @, =, &
```

## Specific Schemes

下列是一些定義好的 scheme

| Scheme   | Description                       |
| :------- | :-------------------------------- |
| ftp      | File Transfer protocol            |
| http     | Hypertext Transfer Protocol       |
| gopher   | The Gopher protocol               |
| mailto   | Electronic mail address           |
| news     | USENET news                       |
| nntp     | USENET news using NNTP access     |
| telnet   | Reference to interactive sessions |
| wais     | Wide Area Information Servers     |
| file     | Host-specific file names          |
| prospero | Prospero Directory Service        |

### Common Internet Scheme Syntax

```
//<user>:<password>@<host>:<port>/<url-path>
```

其中 `user:password@`, `:password`, `:port`, `/url-path` 是可選的，所以常見的 url 基本上只有 `host` & `host/url-path`。

其中 url-path 用來指定如何找到對應的資源，要注意的是在 host & url-path 中間的 `/` 並不屬於 url-path 的一部分。

下面是 postgresql 的 DSN，就完全符合上面的 syntax

```
postgres://YourUserName:YourPassword@YourHostname:5432/YourDatabaseName
```

## References

- https://tools.ietf.org/html/rfc1738
