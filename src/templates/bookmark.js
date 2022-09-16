import React from "react"
import { Link, graphql } from "gatsby"

import Seo from "../components/seo"
import Tag from "../components/tag"
import BookmarksIndex from "../pages/bookmarks"

const BookmarkTemplate = ({ data, pageContext }) => {
  const post = data.markdownRemark
  const { previous, next } = pageContext

  return (
    <BookmarksIndex>
      <Seo
        title={post.frontmatter.title}
        tags={post.frontmatter.tags}
        description={post.frontmatter.description || post.excerpt}
      />
      <div className="h-screen overflow-auto">
        {/* 65ch is follow the prose max width settings */}
        <div className="py-24 px-5 max-w-[65ch] mx-auto">
          <article>
            <header className="mb-10">
              <h1 className="font-bold text-3xl mb-3">
                {post.frontmatter.title}
              </h1>
              <p>{post.frontmatter.date}</p>
              {post.frontmatter.tags &&
                post.frontmatter.tags.map((it, i) => <Tag key={i} tag={it} />)}
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
                  <Link to={`/bookmarks${previous.fields.slug}`} rel="prev">
                    ← {previous.frontmatter.title}
                  </Link>
                )}
              </li>
              <li>
                {next && (
                  <Link to={`/bookmarks${next.fields.slug}`} rel="next">
                    {next.frontmatter.title} →
                  </Link>
                )}
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </BookmarksIndex>
  )
}

export default BookmarkTemplate

export const pageQuery = graphql`
  query BookmarkBySlug($slug: String!) {
    site {
      siteMetadata {
        title
      }
    }
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      excerpt(pruneLength: 160)
      html
      frontmatter {
        title
        tags
        date(formatString: "MMMM DD, YYYY")
        description
      }
    }
  }
`
