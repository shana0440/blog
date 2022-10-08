import React from "react"
import { graphql, useStaticQuery } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"
import PostList from "../components/post_list"

const BookmarksIndex = ({ children }) => {
  const data = useStaticQuery(graphql`
    query {
      allMarkdownRemark(
        sort: { fields: [frontmatter___date], order: DESC }
        filter: {
          frontmatter: { private: { ne: true }, tags: { in: ["bookmark"] } }
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
      <SEO title="Bookmarks" />
      <div className="flex">
        <PostList posts={posts} urlPrefix="/bookmarks" />
        <main className="flex-1">{children}</main>
      </div>
    </Layout>
  )
}

export default BookmarksIndex
