import React from "react"
import PropTypes from "prop-types"
import { Link } from "gatsby"

const Post = ({ node }) => {
  const title = node.frontmatter.title || node.fields.slug
  return (
    <article key={node.fields.slug}>
      <header>
        <h3 style={{}}>
          <Link style={{ boxShadow: `none` }} to={node.fields.slug}>
            {title}
          </Link>
        </h3>
        <small>{node.frontmatter.date}</small>
      </header>
      <section>
        <p
          dangerouslySetInnerHTML={{
            __html: node.frontmatter.description || node.excerpt,
          }}
        />
      </section>
    </article>
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
