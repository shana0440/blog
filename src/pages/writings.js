import React from "react"
import { graphql, useStaticQuery } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"
import PostList from "../components/post_list"

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
      <div className="flex">
        <PostList posts={posts} urlPrefix="/writings" />
        <main className="flex-1">{children}</main>
      </div>
    </Layout>
  )
}

export default WritingsIndex
