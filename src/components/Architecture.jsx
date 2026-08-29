import { architectureSteps } from '../data/evalData.js'
import Reveal from './Reveal.jsx'

export default function Architecture() {
  return (
    <section className="architecture" id="architecture">
      <div className="container">
        <Reveal>
          <h2>How it works</h2>
          <p className="section-intro">
            Every question flows through a schema-grounding step before the
            agent writes SQL, and every generated query passes through a hand
            -enforced safety check before it touches the database.
          </p>
        </Reveal>

        <ol className="steps">
          {architectureSteps.map((s, i) => (
            <Reveal key={s.step} delay={i * 0.06} y={16}>
              <li className="step">
                <span className="step__number">{s.step}</span>
                <div className="step__body">
                  <h3>{s.title}</h3>
                  <p>{s.description}</p>
                </div>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
