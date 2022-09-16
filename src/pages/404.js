import React from "react"
import { graphql, Link } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"

const NotFoundPage = () => {
  return (
    <Layout>
      <SEO title="Not Found" />
      <div className="py-24 px-5 text-center">
        <h1 className="font-bold text-lg">
          The page you are looking for is not exists
        </h1>
        <p className="text-gray-500 mb-5 text-lg">find your way home</p>
        <Link
          to="/"
          className="px-2 py-1 bg-gray-100 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-200"
        >
          Go home
        </Link>
      </div>
    </Layout>
  )
}

export default NotFoundPage
