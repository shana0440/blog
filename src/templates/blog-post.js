import React from "react"
import { graphql } from "gatsby"

import Seo from "../components/seo"
import WritingsIndex from "../pages/writings"
import PostView from "../components/post_view"

const BlogPostTemplate = ({ data, pageContext }) => {
  const post = data.markdownRemark
  const { previous, next } = pageContext

  return (
    <WritingsIndex>
      <Seo
        title={post.frontmatter.title}
        tags={post.frontmatter.tags}
        description={post.frontmatter.description || post.excerpt}
      />
      <PostView
        post={post}
        next={next}
        previous={previous}
        urlPrefix="/writings"
      />
    </WritingsIndex>
  )
}

export default BlogPostTemplate

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
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
