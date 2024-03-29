import { Link } from "gatsby"
import React from "react"
import Tags from "./tags"

export default function PostView({ post, previous, next, urlPrefix }) {
  return (
    <div className="lg:h-full xl:h-screen overflow-auto">
      {/* 65ch is follow the prose max width settings */}
      <div className="py-24 px-5 max-w-[65ch] mx-auto">
        <article>
          <header className="mb-10">
            <h1 className="font-bold text-3xl mb-3">
              {post.frontmatter.title}
            </h1>
            <p>{post.frontmatter.date}</p>
            {post.frontmatter.tags && <Tags tags={post.frontmatter.tags} />}
          </header>
          <section
            className="prose prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-h4:text-base"
            dangerouslySetInnerHTML={{ __html: post.html }}
          />
        </article>
        <hr className="my-5" />
        <nav>
          <ul className="flex flex-wrap justify-between list-none p-0">
            <li>
              {previous && (
                <Link to={`${urlPrefix}${previous.fields.slug}`} rel="prev">
                  ← {previous.frontmatter.title}
                </Link>
              )}
            </li>
            <li>
              {next && (
                <Link to={`${urlPrefix}${next.fields.slug}`} rel="next">
                  {next.frontmatter.title} →
                </Link>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </div>
  )
}
