import React from "react"
import { graphql } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"
import Post from "../components/post"

const WritingsIndex = ({ data, children }) => {
  const posts = data.allMarkdownRemark.edges

  return (
    <Layout>
      <SEO title="My writings" />
      <div className="flex">
        <ul className="flex flex-col gap-4 h-screen overflow-auto w-96 p-2 border-r border-r-gray-300">
          {posts.map(({ node }, i) => (
            <li key={i} className="rounded-md py-1 px-2 mb-1 hover:bg-gray-100">
              <Post node={node} />
            </li>
          ))}
        </ul>
        <main className="flex-1">{children}</main>
      </div>
    </Layout>
  )
}

export default WritingsIndex

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(
      sort: { fields: [frontmatter___date], order: DESC }
      filter: { frontmatter: { private: { ne: true } } }
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
`
