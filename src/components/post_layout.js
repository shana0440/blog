import React from "react"
import PostList from "./post_list"

export default function PostLayout({
  posts,
  children,
  urlPrefix,
  className = "",
}) {
  return (
    <div className={`h-full flex ${className}`}>
      <PostList
        className={`${children ? "hidden lg:block" : "flex-1 lg:flex-none"}`}
        posts={posts}
        urlPrefix={urlPrefix}
      />
      <main className={`flex-1 ${children ? "" : "hidden lg:block"}`}>
        {children}
      </main>
    </div>
  )
}
