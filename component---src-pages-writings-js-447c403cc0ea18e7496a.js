"use strict";(self.webpackChunkblog=self.webpackChunkblog||[]).push([[562],{8315:function(e,t,r){var l=r(7294),n=r(1597);t.Z=function(e){var t=e.node,r=e.to,a=t.frontmatter.title||t.fields.slug;return l.createElement(n.Link,{to:r,className:"rounded-md py-1 px-2 mb-1 hover:bg-gray-300 block",activeClassName:"bg-gray-300"},l.createElement("article",{key:t.fields.slug},l.createElement("header",null,l.createElement("h3",null,a),l.createElement("small",null,t.frontmatter.date))))}},6142:function(e,t,r){r.d(t,{Z:function(){return c}});var l=r(7294),n=r(9499);var a=function(e){var t=(0,n.useLocation)(),r=(0,l.useRef)(null);return(0,l.useLayoutEffect)((function(){if(r.current){var t=window.sessionStorage.getItem(e);r.current.scrollTo(0,t||0)}}),[t.key]),{ref:r,onScroll:function(){r.current&&window.sessionStorage.setItem(e,r.current.scrollTop)}}},s=r(8315);function o(e){var t=e.posts,r=e.urlPrefix,n=e.className,o=void 0===n?"":n,c=a("post-list");return l.createElement("ul",Object.assign({className:"h-full overflow-auto w-96 px-2 py-4 border-r lg:border-r-gray-300 xl:h-screen "+o},c),t.map((function(e,t){var n=e.node;return l.createElement("li",{key:t},l.createElement(s.Z,{to:""+r+n.fields.slug,node:n}))})))}function c(e){var t=e.posts,r=e.children,n=e.urlPrefix,a=e.className,s=void 0===a?"":a;return l.createElement("div",{className:"h-full flex "+s},l.createElement(o,{className:r?"hidden lg:block":"flex-1 lg:flex-none",posts:t,urlPrefix:n}),l.createElement("main",{className:"flex-1 "+(r?"":"hidden lg:block")},r))}},2882:function(e,t,r){r.r(t);var l=r(7294),n=r(1597),a=r(4961),s=r(262),o=r(6142);t.default=function(e){var t=e.children,r=(0,n.useStaticQuery)("4111554205").allMarkdownRemark.edges;return l.createElement(a.Z,null,l.createElement(s.Z,{title:"My writings"}),l.createElement(o.Z,{posts:r,urlPrefix:"/writings"},t))}}}]);
//# sourceMappingURL=component---src-pages-writings-js-447c403cc0ea18e7496a.js.map