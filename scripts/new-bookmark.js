const fs = require("fs")
const path = require("path")

const title = process.argv[2]
const dirName = title.toLocaleLowerCase().replace(/\s/g, "-")

const dirPath = path.resolve(__dirname, "..", "content", "blog", dirName)

fs.mkdirSync(dirPath)

const template = `
---
title: ${title}
date: "${new Date().toISOString()}"
description: "here is your description"
tags: ["bookmark"]
private: false
---

<a href="{__URL__}" class="visit-link" target="_blank" rel="noopener noreferrer">
  <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-link" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M10 14a3.5 3.5 0 0 0 5 0l4 -4a3.5 3.5 0 0 0 -5 -5l-.5 .5" />
    <path d="M14 10a3.5 3.5 0 0 0 -5 0l-4 4a3.5 3.5 0 0 0 5 5l.5 -.5" />
  </svg>
  Visit
</a>
`

const postPath = path.resolve(dirPath, "index.md")
fs.writeFileSync(postPath, template.trim())
console.log(postPath)
