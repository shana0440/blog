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

3. It really make building a web more complicated, for example,

   - some libaray or feature depends on `window` or `document`, you cannot get these stuff on server side, so you need to workaround.
   - it hard to handle the environment data on server side and client side, you will need to pass environment data from server side to client side.
   - manage user token become more complex, you need to store the token on cookie or session, so server side can retrive that token to request data, because you need to store data on cookie, you must need to handle some security issues such as CSRF.
   - when data come from server side, you need to make sure the data type is correct, for example above, Date type will be convert to string, and when you need to pass data to server, you also need to do that, when data is complex, it really cause headache.
   - you need to take care the request count, on Remix, when you submit a form, the whole page will reload, so every loader will be invoke, because remix help you handle the synchronization, so you don't need to rerender some stuff by yourself, but it is a lot of requests, and in a lot of case we don't really need that, I'm not sure what next.js have this issue or not?

4. The ux not as well as CSR, in remix, if we not using fetcher, all component will share the same state, for example we have a list page, while loading list, we will display "loading list...", we can use `useTransition` to handle it, but when we navigate to other page, it also trigger the state change, so the "loading list..." will also display, it will stay in the list page until other page is loaded, so it quite weird for user. to avoid this problem, we will need to use fetcher to isolate the network state, so basically we need to use fetcher for every network request to avoid some unwant behavior.

# Conclusion

introduce SSR is really complicated, but I'm not sure that really make the website better, now google can parse the parse the javascript generated content already, and we also have dynamic import to reduce the bundle size, for share content, we can have a nginx to redirect to a server to generated the correspond content, I'm not really sure why we need SSR considering that cost it make and the benefit it brought, maybe it can make the lighthouse report look good, but even report look good, but I don't see it really affect SEO.
