/**
 * Bio component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */

import React from "react"

import { rhythm } from "../utils/typography"
import { useStaticQuery, graphql } from "gatsby"

const Bio = () => {
  const { site } = useStaticQuery(
    graphql`
      query {
        site {
          siteMetadata {
            description
            social {
              github
            }
          }
        }
      }
    `
  )

  return (
    <div>
      <ul style={{ listStyle: "none", display: "grid" }}>
        <li>
          <a target="_blank" href={site.siteMetadata.social.github}>
            Github
          </a>
        </li>
      </ul>
      <p>{site.siteMetadata.description}</p>
    </div>
  )
}

export default Bio
