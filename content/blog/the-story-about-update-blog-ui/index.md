---
title: The story about update blog UI
date: "2022-09-16T17:51:56.933Z"
description: "The story about update the blog UI"
tags: ["writing"]
private: true
---

My old blog is really simple, it only have a post list and you can click the post to see the post detail, for a long time, I want it can more powerful, like help me remember some post I like, some tweet I like or more, but I don't have a good idea about how to improve it.

Until I found this wonderful personal site [brianlovin.com](https://brianlovin.com) few days ago, it really impresses me, the design of that site can solve my problems, so I decide to write a similar one.

That site is build by next.js, I don't want to have a database, I like the way that Gatsby works and I want to control the page content just like modify a blog post.

To achieve the goal, my idea is create a different tag for different type of data, like bookmark have a `bookmark` tag, the post have a `writing` tag, the Gatsby provide a powerful Graphql API, let us query post base on the post metadata, we can think our posts just like a database, we can easily filter posts by custom data.

There have another problem, the Gatsby doesn't support nested route like React-Router, the recommended way to create layout is create a layout component and use it as normal component, this introduce a problem is the scroll position will be reset when we navigate to other page, so I create a `useKeepScrollPosition` to save the scroll position and restore the position when navigated.

The improve the site take me a half a day, I thought it will take me a weekend because I not using Gatsby for a long time, but Gatsby really easy to use so I can finish the work as a short of period, thank you Gatsby :).
