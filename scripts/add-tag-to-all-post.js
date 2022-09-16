const fs = require("fs")
const path = require("path")

const dirPath = path.resolve(__dirname, "..", "content", "blog")
const tag = process.argv[2]

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

function addTag(content, tag) {
  const lines = content.split("\n")
  return lines
    .map(line => {
      const lineOfTagsMatches = line.match(/tags: \[.*?\]/i)
      if (!lineOfTagsMatches) {
        return line
      }

      const lineOfTags = lineOfTagsMatches[0]
      const tagsArrayMatches = lineOfTags.match(/\[.*?\]/i)
      if (!tagsArrayMatches) {
        return `tags: ["${tag}"]`
      }
      const tagsArray = tagsArrayMatches[0].replace(/'/g, '"')
      const tags = JSON.parse(tagsArray)
      return `tags: ["${tag}", ${tags.map(it => `"${it}"`).join(", ")}]`
    })
    .join("\n")
}

files.forEach(it => {
  const content = fs.readFileSync(it, "utf8")
  const newContent = addTag(content, tag)
  return fs.writeFileSync(it, newContent)
})
