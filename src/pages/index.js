import React from "react"
import { graphql } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"

const BlogIndex = ({ data }) => {
  const post = data.markdownRemark

  return (
    <Layout>
      <SEO title="Home" />
      <div className="h-screen overflow-auto py-24 px-5">
        <article
          className="mx-auto prose prose-a:no-underline prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-h4:text-base"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />
      </div>
    </Layout>
  )
}

export default BlogIndex

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
    markdownRemark(fields: { slug: { eq: "/home/" } }) {
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
