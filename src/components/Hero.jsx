import { projectOverview } from '../data/evalData.js'

export default function Hero() {
  return (
    <header className="hero">
      <div className="container">
        <p className="hero__eyebrow">Build log & evaluation</p>
        <h1 className="hero__title">{projectOverview.title}</h1>
        <p className="hero__subtitle">{projectOverview.subtitle}</p>

        <div className="hero__stack">
          {projectOverview.stack.map((tech) => (
            <span key={tech} className="pill">
              {tech}
            </span>
          ))}
        </div>

        <ul className="hero__highlights">
          {projectOverview.highlights.map((h, i) => (
            <li key={i}>{h}</li>
          ))}
        </ul>
      </div>
    </header>
  )
}
