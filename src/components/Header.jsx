import { useEffect, useState } from 'react'
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom'
import { modelList } from '../data/evalData.js'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [modelsOpen, setModelsOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Scrolls to an in-page section (#architecture, #evaluation). If we're
  // not already on the home page, navigate there first, then scroll once
  // the page has rendered. Using navigate()+scrollIntoView instead of a
  // plain <a href="/#id"> because HashRouter treats everything after '#'
  // as a route path, not a scroll anchor — a plain anchor tag would try
  // to route to a nonexistent page instead of scrolling.
  function scrollToSection(id) {
    setModelsOpen(false)
    if (location.pathname !== '/') {
      navigate('/')
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
      }, 50)
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <nav className={`site-nav ${scrolled ? 'site-nav--scrolled' : ''}`}>
      <div className="container site-nav__inner">
        <Link to="/" className="site-nav__brand" onClick={() => setModelsOpen(false)}>
          <span className="site-nav__dot" />
          NL&nbsp;→&nbsp;SQL
        </Link>

        <div className="site-nav__links">
          <NavLink to="/" end className="site-nav__link">
            Overview
          </NavLink>
          <button
            type="button"
            className="site-nav__link site-nav__link--btn"
            onClick={() => scrollToSection('architecture')}
          >
            Architecture
          </button>
          <button
            type="button"
            className="site-nav__link site-nav__link--btn"
            onClick={() => scrollToSection('evaluation')}
          >
            Evaluation
          </button>

          <div
            className="site-nav__dropdown"
            onMouseEnter={() => setModelsOpen(true)}
            onMouseLeave={() => setModelsOpen(false)}
          >
            <button
              type="button"
              className="site-nav__link site-nav__link--btn"
              onClick={() => setModelsOpen((v) => !v)}
              aria-expanded={modelsOpen}
            >
              Models ▾
            </button>
            {modelsOpen && (
              <div className="site-nav__menu">
                {modelList.map((m) => (
                  <Link
                    key={m.slug}
                    to={`/models/${m.slug}`}
                    className={`site-nav__menu-item site-nav__menu-item--${m.verdict}`}
                    onClick={() => setModelsOpen(false)}
                  >
                    <span className="site-nav__menu-dot" />
                    {m.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <a
            href="https://github.com/Asterioxer/nl-to-sql-portfolio-site"
            target="_blank"
            rel="noreferrer"
            className="site-nav__link site-nav__link--ghost"
          >
            GitHub ↗
          </a>
        </div>
      </div>
    </nav>
  )
}
