import React from "react"
import useKeepScrollPosition from "../hooks/useKeepScrollPosition"
import Post from "./post"

export default function PostList({ posts, urlPrefix, className = "" }) {
  const scrollRestoration = useKeepScrollPosition("post-list")

  return (
    <ul
      className={`h-full overflow-auto w-96 px-2 py-4 border-r lg:border-r-gray-300 xl:h-screen ${className}`}
      {...scrollRestoration}
    >
      {posts.map(({ node }, i) => (
        <li key={i}>
          <Post to={`${urlPrefix}${node.fields.slug}`} node={node} />
        </li>
      ))}
    </ul>
  )
}
