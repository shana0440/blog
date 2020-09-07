---
title: webpack DefinePlugin
date: "2020-07-21T08:32:58.996Z"
description: "Just a short brief about webpack define plugin"
tags: ["webpack", "env", "environment"]
---

事情是這樣的，在公司的 js app 上，需要管理各個版本，在 backend 我們可以簡單地使用 environment variable 來切換各個版本間的資料，像是 Sentry DSN, DB Host 的資料等等，但在 front-end，我們既沒辦法讀 environment，使用者也不可能設定 environment variable，更不要說如果我們把所以資料都 bundle 起來，使用者還可以分析程式，取得別的環境的資料。

在一番研究之後，找到 webpack 內建一個 DefinePlugin，這個 plugin 會在編譯的時候，把 match 到的 string 替換成輸入的資料，而在 build time 我們可以指定環境變數，透過這種方式來替換 bundle 之類的資料。

下面是一個範例，只要在 build time 找到任何符合 `process.env.${key}` 的字串，就會被替換成 `.env` 裡面設定的資料。

```js
// webpack.config.js
const webpack = require('webpack');
const dotenv = require('dotenv');

const env = dotenv.config({ path: `.env.${process.env.NODE_ENV}` })

module.exports = [
  mode: '',
  output: {},
  node: {},
  resolve: {},
  devtool: '',
  plugins: [
    new webpack.DefinePlugin({
      ...Object.entries(env.parsed).reduce((acc, [key, value]) => {
        acc[`process.env.${key}`] = JSON.stringify(value);
        return acc;
      }, {})
    })
  ]
]
```
