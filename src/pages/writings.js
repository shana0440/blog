import React from "react"
import { graphql, useStaticQuery } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"
import PostLayout from "../components/post_layout"

const WritingsIndex = ({ children }) => {
  const data = useStaticQuery(graphql`
    query {
      allMarkdownRemark(
        sort: { fields: [frontmatter___date], order: DESC }
        filter: {
          frontmatter: { private: { ne: true }, tags: { in: ["writing"] } }
        }
      ) {
        edges {
          node {
            excerpt
            fields {
              slug
            }
            frontmatter {
              date(formatString: "MMMM DD, YYYY")
              title
              description
            }
          }
        }
      }
    }
  `)
  const posts = data.allMarkdownRemark.edges

  return (
    <Layout>
      <SEO title="My writings" />
      <PostLayout posts={posts} urlPrefix="/writings">
        {children}
      </PostLayout>
    </Layout>
  )
}

export default WritingsIndex
