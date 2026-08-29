import { useParams, Link, Navigate } from 'react-router-dom'
import { getModelBySlug, modelList, evalRuns, FAILURE_MODES } from '../data/evalData.js'
import Reveal from '../components/Reveal.jsx'

function ModeBadge({ mode }) {
  const info = FAILURE_MODES[mode]
  return <span className={`badge badge--${info.color}`}>{info.label}</span>
}

function StageCard({ title, status, statusTone, time, children }) {
  return (
    <div className={`model-card model-card--${statusTone}`}>
      <div className="model-card__head">
        <h3>{title}</h3>
        <span className={`model-card__status model-card__status--${statusTone}`}>
          {status}
        </span>
      </div>
      {time && <p className="model-card__time">Elapsed: {time}</p>}
      {children}
    </div>
  )
}

export default function ModelPage() {
  const { slug } = useParams()
  const model = getModelBySlug(slug)

  if (!model) {
    return <Navigate to="/" replace />
  }

  const qwenRun = evalRuns.find((r) => r.model.startsWith('qwen2.5:7b'))
  const showFullEvalTable = model.fullEval.applicable && model.name === 'qwen2.5:7b' && qwenRun

  return (
    <article className="model-page">
      <div className="container">
        <Reveal y={16}>
          <Link to="/" className="model-page__back">
            ← Back to overview
          </Link>

          <div className="model-page__head">
            <h1>{model.name}</h1>
            <span className={`model-page__verdict model-page__verdict--${model.verdict}`}>
              {model.verdict === 'pass' ? 'Selected' : 'Rejected'}
            </span>
          </div>
          <p className="model-page__tagline">{model.tagline}</p>
        </Reveal>

        <div className="model-page__grid">
          <Reveal delay={0.05}>
            <StageCard
              title="Stage 1 · Codegen"
              status={model.codegen.score}
              statusTone={model.codegen.mismatches.length === 0 && !model.codegen.harnessError ? 'pass' : 'warn'}
              time={model.codegen.time}
            >
              <p className="model-card__note">{model.codegen.note}</p>
              {model.codegen.mismatches.length > 0 && (
                <ul className="model-card__mismatches">
                  {model.codegen.mismatches.map((m, i) => (
                    <li key={i}>
                      <code>{m.input}</code>
                      <span className="model-card__mismatch-detail">
                        expected <strong>{m.expected}</strong>, got <strong>{m.got}</strong>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {model.codegen.harnessError && (
                <pre className="model-card__error">{model.codegen.harnessError}</pre>
              )}
            </StageCard>
          </Reveal>

          <Reveal delay={0.1}>
            <StageCard
              title="Stage 2 · Tool-calling"
              status={model.toolCalling.result}
              statusTone={model.toolCalling.result === 'supported' ? 'pass' : 'fail'}
              time={model.toolCalling.time}
            >
              <pre className="model-card__error model-card__error--neutral">
                {model.toolCalling.detail}
              </pre>
              <p className="model-card__note">{model.toolCalling.note}</p>
            </StageCard>
          </Reveal>

          <Reveal delay={0.15}>
            <StageCard
              title="Stage 3 · Full eval"
              status={
                model.fullEval.applicable
                  ? `${model.fullEval.passed}/${model.fullEval.total}`
                  : 'N/A'
              }
              statusTone={model.fullEval.applicable ? 'pass' : 'fail'}
            >
              {model.fullEval.applicable ? (
                <>
                  <p className="model-card__note">
                    {model.fullEval.silentTerminations} silent terminations ·{' '}
                    {model.fullEval.errors} hard errors
                  </p>
                  <p className="model-card__note">{model.fullEval.note}</p>
                </>
              ) : (
                <p className="model-card__note">{model.fullEval.reason}</p>
              )}
            </StageCard>
          </Reveal>
        </div>

        {showFullEvalTable && (
          <Reveal delay={0.1} className="model-page__questions">
            <h2>Question-by-question breakdown</h2>
            <p className="section-intro">
              The 18-question suite this model ran, from the {qwenRun.date} evaluation
              run. Every result was independently re-verified against the database.
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
                  {qwenRun.questions.map((q) => (
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
        )}

        <Reveal delay={0.05}>
          <div className="model-page__other">
            <h3>Other models tested</h3>
            <div className="model-page__other-links">
              {modelList
                .filter((m) => m.slug !== model.slug)
                .map((m) => (
                  <Link key={m.slug} to={`/models/${m.slug}`} className="pill pill--link">
                    {m.name}
                  </Link>
                ))}
            </div>
          </div>
        </Reveal>
      </div>
    </article>
  )
}
