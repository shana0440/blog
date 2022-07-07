---
title: The thing I should know when using server-side rendering
date: "2022-07-07T13:19:58.493Z"
description: "The note that used to record the problem I occur when working on server-side rendering"
tags: ["remix", "react", "ssr"]
private: false
---

Even it just like writing the client side app, but still need to keep in mind that it work on server side, it not the full client side app.

1. Remember handle data type, for example, when using Date object, even we parse the string to Date on server side, we still need to parse again on client side, the server side can only pass the data that can be interpret as string, the Date object will become string when passing to client side, client side have no idea it is Date object or just a string, so we need to parse by ourselve.

2. Remember handle the CSRF, I working on full client side app quite a while, when working on full client side app, we store the access token on local storage, the local storage can only access by same site, so we don't need to worry about the CSRF attack, however when we working on server side rendering, we store the access token on cookie, because we need the access token both on server and client side, this can cause the CSRF attack due to browser will help us carry cookie when sending request, this case is on Remix.
