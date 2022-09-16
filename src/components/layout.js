import React from "react"
import { Link } from "gatsby"
import {
  Home,
  Bookmark,
  Writing,
  BrandGithub,
  ArrowUpRight,
} from "tabler-icons-react"

const Layout = ({ location, title, children }) => {
  const rootPath = `${__PATH_PREFIX__}/`

  return (
    <div className="flex">
      <nav className="w-72 px-3">
        <h3 className="font-bold px-2 mt-5 mb-10">kwguo</h3>
        <ul>
          <li>
            <Item to="/" icon={<Home />}>
              Home
            </Item>
          </li>
          <li>
            <Item to="/writings" icon={<Writing />}>
              Writings
            </Item>
          </li>
        </ul>
        <ul>
          <li>
            <h4>
              <ItemHeader>Me</ItemHeader>
            </h4>
          </li>
          <li>
            <Item to="/bookmarks" icon={<Bookmark />}>
              Bookmarks
            </Item>
          </li>
        </ul>
        <ul>
          <li>
            <h4>
              <ItemHeader>Links</ItemHeader>
            </h4>
          </li>
          <li>
            <Item
              icon={<BrandGithub />}
              to="https://github.com/shana0440"
              newTab
            >
              Github
            </Item>
          </li>
        </ul>
      </nav>
      <main>{children}</main>
    </div>
  )
}

function ItemHeader({ children }) {
  return <h4 className="py-1 px-2 mt-3 mb-1">{children}</h4>
}

function Item({ children, icon, to, newTab = false }) {
  return (
    <Link
      to={to}
      target={newTab ? "_blank" : "_self"}
      className="flex justify-between shadow-none rounded-md py-1 px-2 mb-1 hover:bg-gray-100"
    >
      <div className="flex gap-2">
        {icon}
        {children}
      </div>
      {newTab && <ArrowUpRight />}
    </Link>
  )
}

export default Layout
