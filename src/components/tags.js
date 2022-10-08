import React from "react"
import Tag from "./tag"

export default function Tags({ tags }) {
  return (
    <div className="flex gap-2">
      {tags.map((it, i) => (
        <Tag key={i} tag={it} />
      ))}
    </div>
  )
}
