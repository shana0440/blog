import { useLayoutEffect, useRef } from "react"
import { useLocation } from "@gatsbyjs/reach-router"

function useKeepScrollPosition(identifier) {
  const location = useLocation()
  const ref = useRef(null)

  useLayoutEffect(() => {
    if (ref.current) {
      const position = window.sessionStorage.getItem(identifier)
      ref.current.scrollTo(0, position || 0)
    }
  }, [location.key])

  return {
    ref,
    onScroll() {
      if (ref.current) {
        window.sessionStorage.setItem(identifier, ref.current.scrollTop)
      }
    },
  }
}

export default useKeepScrollPosition
