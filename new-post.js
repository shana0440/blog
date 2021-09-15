const fs = require("fs")
const path = require("path")

const title = process.argv[2]
const dirName = title.toLocaleLowerCase().replace(/\s/g, "-")

const dirPath = path.resolve(__dirname, "content", "blog", dirName)

fs.mkdirSync(dirPath)

const template = `
---
title: ${title}
date: "${new Date().toISOString()}"
description: "here is your description"
tags: []
private: true
---

## What is the problem

## How to solve it

## The best solution or practice

## The mechanism, key techniques, and source code

# Pros/Cons

## Conclusion

## References

`

const postPath = path.resolve(dirPath, "index.md")
fs.writeFileSync(postPath, template.trim())
console.log(postPath)
