const fs = require("fs")
const path = require("path")

const dirPath = path.resolve(__dirname, "..", "content", "blog")
const files = fs
  .readdirSync(dirPath)
  .map(it => path.resolve(dirPath, it))
  .flatMap(it => {
    const isDir = fs.lstatSync(it).isDirectory()
    if (isDir) {
      return fs.readdirSync(it).map(file => path.resolve(it, file))
    }
    return [it]
  })
  .filter(it => it.endsWith(".md"))

function parseTags(content) {
  const lineOfTagsMatches = content.match(/tags: \[.*?\]/i)
  if (!lineOfTagsMatches) {
    return []
  }
  const lineOfTags = lineOfTagsMatches[0]
  const tagsArrayMatches = lineOfTags.match(/\[.*?\]/i)
  if (!tagsArrayMatches) {
    return []
  }
  const tagsArray = tagsArrayMatches[0].replace(/'/g, '"')
  return JSON.parse(tagsArray)
}

const tags = files.flatMap(it => {
  const content = fs.readFileSync(it, "utf8")
  const tags = parseTags(content)
  return tags
})

const sortedTags = Array.from(new Set(tags)).sort((a, b) =>
  a.toLowerCase().localeCompare(b.toLowerCase())
)

console.log(sortedTags)
