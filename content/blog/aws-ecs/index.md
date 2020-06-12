---
# TODO: private
title: AWS ECS
date: "2020-06-10T12:46:51.463Z"
description: "I Hate AWS ECS"
---

就只是個短篇紀錄使用 ECS 遇到的問題，有些問題我最後也沒有解決，最後因為我真的太頭大了，PM 看我可憐，或者是時程問題，就讓其他人接手了，我其實真的是鬆了一口氣，弄這些真的太累了，明明有很多問題，但我光是要讓他跑起來，就去掉了半條命，而且最後也還是沒跑起來...

1. Parameter 只能有 60 個
2. TaskDefinition 上的 Environment 會被儲存為 Plain text ，能夠輕鬆地被訪問
3. CloudFormation 上的 TaskDefinition 不支援 EnvironmentFiles
4. 要使用 Secret 的話，要另外使用 AWS Secret Manager
5. AWS::ECS::Service 跑不起來的話，CloudFormation 會整個卡住，要主動去看是不是 Service 跑的時候遇到什麼問題
6. 建立 EC2 Instance 的時候，需要在 `/etc/ecs/ecs.config` 中植入 `ECS_CLUSTER=${YOU_CLUSTER}`，不然 ecs 並不知道他可以控制這個 Instance ，非常之爛，卡超久 =\_=
7. ECS 可以說是一個幾乎沒有人使用的服務，遇到的任何問題，在網路上基本都找不到，只能看 document ，但 AWS 的 document 我是覺得不太好讀拉。
8. 每個 command 支援的方法都不統一，e.g. `aws cloudformation deploy`, `aws cloudformation create-stack` ，一個支援 parameters override ，一個不支援，一個不支援 parameters 從檔案讀，一個支援 :|
