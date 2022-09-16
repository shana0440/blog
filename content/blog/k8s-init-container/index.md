---
title: k8s init container
date: "2021-01-10T22:58:00.878Z"
description: "Just a record"
tags: ["writing", "k8s"]
---

在目前的專案中，有個需求是想要把 static files 上傳到 s3 上，而我們的 static file 每次 build 的 hash code 都會不一樣，所以每次跑 CI/CD 都要重新上傳一次，在這個專案中，我採取的作法是建立一個 k8s job ，讓這個 job 負責上傳 static files。

首先會遇到怎麼上傳資料的問題。
為了避免增加 docker image size，我希望避免在原本的 docker image 中加入 awscli，所幸的是，k8s 允許我們在一個 pod 中放入很多個 container，所以我可以一個放原本的 container ，另一個放 awscli 的 container。

接著會遇到如何共享資料的問題。
k8s 提供 volume，我們可以建立一個 empty 的 volume 並加他 mount 在兩個 container 上面，這樣 container 就可以透過這個 volume 來共享資料。

```
volumes:
  - name: shared-data
    emptyDir: {}
```

再來會遇到啟動的順序性。
如果我們放兩個 container 在同一個 pod 底下，那我們要怎麼保證原本的 container 可能在 awscli 的 container 上傳資料之前，先把資料複製到共享的資料夾底下？

k8s 提供一個 `initContainers` 的功能，他跟 `containers` 可以說是一模一樣，差別在於他會在 containers 運行前執行，k8s 會照 `initContainers` 的順序啟動 container，並在 container 成功之後才執行下一個 container 。

我們可以利用 `initContainers` 的特性，將複製到共享資料夾的步驟，放在 `initContainers` ，再將上傳至 s3 的步驟，放在 `containers`，這樣我們就能確保資料一定會被上傳。

## References

- https://kubernetes.io/docs/tasks/access-application-cluster/communicate-containers-same-pod-shared-volume/
- https://kubernetes.io/docs/concepts/workloads/pods/init-containers/
