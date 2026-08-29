import { Link } from 'react-router-dom'
import { evalRuns, FAILURE_MODES, modelComparison, modelDetails } from '../data/evalData.js'
import Reveal from './Reveal.jsx'

function ModeBadge({ mode }) {
  const info = FAILURE_MODES[mode]
  return <span className={`badge badge--${info.color}`}>{info.label}</span>
}

export default function EvalResults() {
  const run = evalRuns[evalRuns.length - 1] // most recent run

  const total = run.totalQuestions
  const passCount = run.results.PASS
  const accuracyPct = Math.round((passCount / total) * 100)

  return (
    <section className="eval" id="evaluation">
      <div className="container">
        <Reveal>
          <h2>Evaluation results</h2>
          <p className="section-intro">
            Every answer below was checked against ground truth by
            independently re-running equivalent SQL directly on the seeded
            database — not by trusting the agent's own claimed result. That
            distinction matters:{' '}
            <strong>question 13 is a case where the agent's own narration
            was confidently wrong.</strong>
          </p>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="eval__summary">
            <div className="summary-stat summary-stat--pass">
              <div className="summary-stat__value">{accuracyPct}%</div>
              <div className="summary-stat__label">
                Verified accuracy ({passCount}/{total})
              </div>
            </div>
            <div className="summary-stat summary-stat--fail-severe">
              <div className="summary-stat__value">{run.results.HALLUCINATION}</div>
              <div className="summary-stat__label">Hallucinated result</div>
            </div>
            <div className="summary-stat summary-stat--fail">
              <div className="summary-stat__value">
                {run.results.SILENT_TERMINATION}
              </div>
              <div className="summary-stat__label">Silent early termination</div>
            </div>
            <div className="summary-stat summary-stat--fail">
              <div className="summary-stat__value">{run.results.LOGIC_BUG}</div>
              <div className="summary-stat__label">Logic / aggregation bugs</div>
            </div>
            <div className="summary-stat summary-stat--warn">
              <div className="summary-stat__value">{run.results.AMBIGUITY}</div>
              <div className="summary-stat__label">Unresolved ambiguity</div>
            </div>
          </div>
        </Reveal>

        <p className="eval__note">
          <strong>Model:</strong> {run.model} &nbsp;·&nbsp;
          <strong>Run date:</strong> {run.date}
        </p>

        <Reveal delay={0.1}>
          <div className="eval__table-wrap">
            <table className="eval-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Question</th>
                  <th>Result</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {run.questions.map((q) => (
                  <tr key={q.num} className={q.mode === 'HALLUCINATION' ? 'row--highlight' : ''}>
                    <td>{q.num}</td>
                    <td>{q.question}</td>
                    <td>
                      <ModeBadge mode={q.mode} />
                    </td>
                    <td className="eval-table__note">{q.note || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="eval__actions">
            <h3>Action items from this run</h3>
            <ul>
              {run.actionItems.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={0.14}>
          <div className="eval__model-comparison">
            <h3>Model comparison benchmark</h3>
            <p className="eval__note">
              <strong>Run date:</strong> {modelComparison.date}
            </p>
            <p className="section-intro">{modelComparison.summary}</p>

            <div className="eval__table-wrap">
              <table className="eval-table">
                <thead>
                  <tr>
                    <th>Model</th>
                    <th>Codegen</th>
                    <th>Tool-calling</th>
                    <th>Full eval</th>
                    <th>Note</th>
                  </tr>
                </thead>
                <tbody>
                  {modelComparison.models.map((m) => {
                    const detail = modelDetails[m.name]
                    return (
                      <tr key={m.name}>
                        <td>
                          {detail ? (
                            <Link to={`/models/${detail.slug}`} className="eval-table__model-link">
                              {m.name} →
                            </Link>
                          ) : (
                            m.name
                          )}
                        </td>
                        <td>{m.codegenScore} ({m.codegenTime})</td>
                        <td>{m.toolCallingScore} ({m.toolCallingTime})</td>
                        <td>{m.fullEvalScore}</td>
                        <td className="eval-table__note">{m.fullEvalNote}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <p className="eval__note">{modelComparison.conclusion}</p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
