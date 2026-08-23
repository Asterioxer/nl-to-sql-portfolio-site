import { evalRuns, FAILURE_MODES } from '../data/evalData.js'

function ModeBadge({ mode }) {
  const info = FAILURE_MODES[mode]
  return <span className={`badge badge--${info.color}`}>{info.label}</span>
}

export default function EvalResults() {
  const run = evalRuns[0] // most recent run first

  const total = run.totalQuestions
  const passCount = run.results.PASS
  const accuracyPct = Math.round((passCount / total) * 100)

  return (
    <section className="eval">
      <div className="container">
        <h2>Evaluation results</h2>
        <p className="section-intro">
          Every answer below was checked against ground truth by
          independently re-running equivalent SQL directly on the seeded
          database — not by trusting the agent's own claimed result. That
          distinction matters:{' '}
          <strong>question 13 is a case where the agent's own narration
          was confidently wrong.</strong>
        </p>

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

        <p className="eval__note">
          <strong>Model:</strong> {run.model} &nbsp;·&nbsp;
          <strong>Run date:</strong> {run.date}
        </p>

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

        <div className="eval__actions">
          <h3>Action items from this run</h3>
          <ul>
            {run.actionItems.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
