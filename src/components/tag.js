import React from "react"
import { Link } from "gatsby"
import { toSlug } from "../utils/slug"

const Tag = ({ tag }) => {
  return (
    <span className="bg-gray-300 text-sm rounded-sm">
      <Link className="text-gray-600 p-1" to={`/tags/${toSlug(tag)}`}>
        {tag}
      </Link>
    </span>
  )
}

export default Tag
