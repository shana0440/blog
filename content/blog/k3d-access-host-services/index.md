---
title: k3d access host services
date: "2021-01-10T22:46:21.968Z"
description: "Just a record"
tags: ["writing", "docker", "k8s", "k3d"]
---

一般來說，我們不會將 database 這種資料放在 k8s 上面，這也延伸出一個問題，當我們要在 local setup k8s 的環境時，就會少了 database 等需要 persistent 特性的服務。

我目前是使用 [k3d](https://github.com/rancher/k3d) 來幫助我在 local 設定一個 k8s cluster，k3d 本身就使用 [traefik](https://github.com/traefik/traefik) 作為 ingress controller，可以直接支援 ingress 這點也很方便。

回到正題，我在 local 的時候，會再另外用 docker-compose 啟動 persistent 的服務，但是 k8s cluster 沒辦法透過 service name 來 access docker-compose 的服務，因為他們不在同一個 network 底下，docker-compose 允許我們透過 ports 來 forward host port 到 container port ，藉此來 access container，那我們能不能讓 k3d 來 access host port ，這樣就可以訪問 docker-compose 啟動的 container 了，其實也很簡單，只是我沒有在文件看到，所以在這邊紀錄一下，在 k3d 當中，`host.k3d.internal` 代表著 host 的位址。

舉例來說，如果我們用 docker-compose 啟動一個 mysql 服務，並將 host 3306 port map to container 3306 port，而 k3d 啟動的 k8s cluster 想要訪問這個 mysql ，我們可以透過 `host.k3d.internal:3306` 來訪問 mysql。

## References

- https://github.com/rancher/k3d/issues/101
