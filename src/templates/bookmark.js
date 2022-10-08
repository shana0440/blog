import React from "react"
import { graphql } from "gatsby"

import Seo from "../components/seo"
import BookmarksIndex from "../pages/bookmarks"
import PostView from "../components/post_view"

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
      <PostView
        post={post}
        next={next}
        previous={previous}
        urlPrefix="/bookmarks"
      />
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
