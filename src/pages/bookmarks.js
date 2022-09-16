import React from "react"
import { graphql, useStaticQuery } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"
import Post from "../components/post"
import useKeepScrollPosition from "../hooks/useKeepScrollPosition"

const BookmarksIndex = ({ children }) => {
  const scrollRestoration = useKeepScrollPosition("bookmarks-list")
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
        <ul
          className="flex flex-col gap-4 h-screen overflow-auto w-96 p-2 border-r border-r-gray-300"
          {...scrollRestoration}
        >
          {posts.map(({ node }, i) => (
            <li key={i} className="rounded-md py-1 px-2 mb-1 hover:bg-gray-100">
              <Post to={`/bookmarks${node.fields.slug}`} node={node} />
            </li>
          ))}
        </ul>
        <main className="flex-1">{children}</main>
      </div>
    </Layout>
  )
}

export default BookmarksIndex
