---
title: Match all items SQL
date: "2022-05-28T12:22:42.640Z"
description: "here is your description"
tags: ["sql"]
private: false
---

## What is the problem

I have a scenario is I have a list of user, and each user have many skills, I want to list some of the users that have the skills I required.

For example,

| user   | skills        |
| :----- | :------------ |
| user A | html, js      |
| user B | html, js, php |
| user C | html, php     |

I want to find the user that know html & js.

## How to solve it

We can use `WHERE IN` to query the user that know `html` or `js`, but how to know the user know both?

By using `GROUP BY` and `HAVING` we can group by user, and we can know the count the skills, then match the count is equal 2 (html and js), the SQL will look like

```
SELECT user_id FROM user_skill
	WHERE skill_id IN (?, ?)
	GROUP BY user_id
	HAVING COUNT(user_id) = ?
```

The different between `HAVING` and `WHERE` is `WHERE` apply to each row, the `HAVING` apply to the grouped result.
