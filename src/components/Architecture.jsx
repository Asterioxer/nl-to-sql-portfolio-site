import { architectureSteps } from '../data/evalData.js'

export default function Architecture() {
  return (
    <section className="architecture">
      <div className="container">
        <h2>How it works</h2>
        <p className="section-intro">
          Every question flows through a schema-grounding step before the
          agent writes SQL, and every generated query passes through a hand
          -enforced safety check before it touches the database.
        </p>

        <ol className="steps">
          {architectureSteps.map((s) => (
            <li key={s.step} className="step">
              <span className="step__number">{s.step}</span>
              <div className="step__body">
                <h3>{s.title}</h3>
                <p>{s.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
