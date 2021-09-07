---
title: The rule of using edittext on recyclerview
date: "2021-08-07T18:57:11.765Z"
description: "My experience of edittext on recyclerview"
tags: ["android", "recyclerview"]
private: true
---

1. 當 recyclerview 重新 render 的時候，並不會 focus 在原本的 edittext 上，因此我們要注意不要再修改 edittext 的同時，重新 render recyclerview，因此 recyclerview 的修改行為，最好不要牽扯到 view model。
