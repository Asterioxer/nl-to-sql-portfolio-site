import { projectOverview } from '../data/evalData.js'
import ThreeBackground from './ThreeBackground.jsx'
import Reveal from './Reveal.jsx'

export default function Hero() {
  return (
    <section className="hero">
      <ThreeBackground />
      <div className="container hero__content">
        <Reveal y={16}>
          <p className="hero__eyebrow">Build log & evaluation</p>
          <h1 className="hero__title">{projectOverview.title}</h1>
          <p className="hero__subtitle">{projectOverview.subtitle}</p>
        </Reveal>

        <Reveal delay={0.12} y={16}>
          <div className="hero__stack">
            {projectOverview.stack.map((tech) => (
              <span key={tech} className="pill">
                {tech}
              </span>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.2} y={16}>
          <ul className="hero__highlights">
            {projectOverview.highlights.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}
