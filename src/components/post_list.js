import React from "react"
import useKeepScrollPosition from "../hooks/useKeepScrollPosition"
import Post from "./post"

export default function PostList({ posts, urlPrefix }) {
  const scrollRestoration = useKeepScrollPosition("post-list")

  return (
    <ul
      className="flex flex-col gap-1 h-screen overflow-auto w-96 px-2 py-4 border-r border-r-gray-300"
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
