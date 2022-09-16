---
title: Import private key to ssh-agent
date: "2021-08-11T17:01:52.208Z"
description: "How to avoid ssh keep asking passphrase"
tags: ["writing", "ssh", "linux", "devops"]
private: false
---

## TL;DR

```
eval "(ssh-agent -s)"
ssh-add /path/to/private_key
```

## Story

最近在替公司的專案執行文件自動發布的時候，使用到了 github 的 deploy key，deploy key 需要建立一個 ssh key，透過這個 ssh key，我們可以對該專案進行特定的操作，例如 update repo。

在目前的專案，是會把文件編譯好之後，發到 docs/ 底下的 branch，例如 /docs/apis ，這樣 PM 就可以去看這個文件，我們是使用 gitlab runner 來執行 CI/CD，會需要把 ssh private key 放到 container 裡面，再放進去的時候，遇到了沒有對應的 ssh private key 的問題(忘記了詳細的錯誤訊息，之後遇到再補吧，如果我還記得)，總之就是跑了一個 ssh agent，然後再透過 ssh-add 加入新的 ssh key，之後再執行 git push 的時候就行了，下面就來介紹一下這兩個指令。

> 大概是下面的錯誤
>
> ```
> Could not open a connection to your authentication agent.
> ```

## ssh-agent

根據 man 的解釋呢，基本上就是一個程式會幫你拿著所有 private key，通常在每個 session(開啟一個新的 terminal) 開始的時候，就會自動啟動，看起來在我們的 CI/CD 執行的期間，並沒有啟動 ssh-agent 才會造成這次的問題。

## ssh-add

這個指令就是會幫你把 private key 加入 ssh agent，可以透過 ssh-add /path/to/private_key 來加入特定的 private key。

## References

- https://linux.die.net/man/1/ssh-agent
- https://linux.die.net/man/1/ssh-add
