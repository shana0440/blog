import React, { useState } from "react"
import { Link } from "gatsby"
import {
  Home,
  Bookmark,
  Writing,
  BrandGithub,
  ArrowUpRight,
  BrandLinkedin,
  Menu2,
} from "tabler-icons-react"

const Layout = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)
  const handleToggleNav = () => {
    setIsOpen((prev) => !prev)
  }

  return (
    <div className="flex flex-col xl:flex-row bg-dominant">
      <nav className="p-2 border-b border-b-gray-300 flex justify-between items-center relative xl:px-3 xl:block xl:w-72 xl:h-screen xl:border-r xl:border-r-gray-300">
        <h3 className="font-bold px-2 xl:mt-5 xl:mb-10">kwguo</h3>
        <button
          onClick={handleToggleNav}
          className="p-2 border-2 rounded-md border-gray-300 xl:hidden lg:block"
        >
          <Menu2 />
        </button>
        <div
          className={`${
            isOpen ? "block" : "hidden"
          } absolute top-full left-0 px-2 bg-dominant w-full h-screen xl:h-auto xl:!block xl:static`}
        >
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
              <ItemHeader>Me</ItemHeader>
            </li>
            <li>
              <Item to="/bookmarks" icon={<Bookmark />}>
                Bookmarks
              </Item>
            </li>
          </ul>
          <ul>
            <li>
              <ItemHeader>Links</ItemHeader>
            </li>
            <li>
              <Item
                icon={<BrandGithub />}
                to="https://github.com/shana0440"
                newTab
              >
                Github
              </Item>
              <Item
                icon={<BrandLinkedin />}
                to="https://www.linkedin.com/in/%E9%8E%A7%E7%91%8B-%E9%83%AD-8354aa116/"
                newTab
              >
                LinkedIn
              </Item>
            </li>
          </ul>
        </div>
      </nav>
      <div className="flex-1">{children}</div>
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
      className="flex justify-between rounded-md py-1 px-2 mb-1 hover:bg-gray-300"
      activeClassName="bg-gray-300"
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
