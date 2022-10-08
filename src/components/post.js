import React from "react"
import PropTypes from "prop-types"
import { Link } from "gatsby"

const Post = ({ node, to }) => {
  const title = node.frontmatter.title || node.fields.slug
  return (
    <Link
      to={to}
      className="rounded-md py-1 px-2 mb-1 hover:bg-gray-300 block"
      activeClassName="bg-gray-300"
    >
      <article key={node.fields.slug}>
        <header>
          <h3>{title}</h3>
          <small>{node.frontmatter.date}</small>
        </header>
      </article>
    </Link>
  )
}

Post.propTypes = {
  frontmatter: PropTypes.shape({
    title: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
  }),
  fields: PropTypes.shape({
    slug: PropTypes.string.isRequired,
  }),
}

export default Post
