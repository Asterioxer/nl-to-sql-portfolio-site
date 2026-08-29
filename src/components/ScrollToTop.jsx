import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Without this, navigating between the overview and a model page keeps
// whatever scroll position the previous page had, which feels broken.
export default function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1))
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
        return
      }
    }
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' })
  }, [pathname, hash])

  return null
}
