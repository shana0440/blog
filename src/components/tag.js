import React from "react"
import styled from "styled-components"
import { Link } from "gatsby"
import { toSlug } from "../utils/slug"

const Container = styled.span`
  background-color: #eee;
  font-size: 14px;
  padding: 1px 5px;
  border-radius: 3px;
  margin-right: 7px;

  a {
    color #4f4f4f;
    box-shadow: none;
  }
`

const Tag = ({ tag }) => {
  return (
    <Container>
      <Link to={`tags/${toSlug(tag)}`}>{tag}</Link>
    </Container>
  )
}

export default Tag
