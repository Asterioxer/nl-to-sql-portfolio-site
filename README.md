# NL-to-SQL Assistant — Portfolio Site

A static React site presenting the build and evaluation of the
[nl-to-sql-assistant](../nl-to-sql-assistant) project — sibling folder,
separate repo. Kept separate deliberately: that project is the
experimental/testing ground, this is the polished proof-of-work.

## What it shows

- Architecture: how schema grounding + the safety guardrail work
- A real, independently-verified accuracy evaluation — including an
  honest writeup of a hallucination found during testing, not just a
  headline "it works" claim

## Setup

```bash
npm install
npm run dev       # local dev server
npm run build     # production build -> dist/
```

## Content source of truth

`src/data/evalData.js` is a structured version of
`../nl-to-sql-assistant/tests/eval_results.md`. When a new evaluation
run happens in the main project, add a new entry to the `evalRuns`
array here rather than editing the existing one — keeps run history
comparable over time.

## Codegen staging

Like the main project, `generated/` is a staging area for
LLM-generated component drafts (via a local Ollama model, reusing
`../nl-to-sql-assistant/src/codegen.py`). Nothing there is trusted
until manually reviewed and promoted into `src/components/`.

```bash
python generated/batch_generate.py
```

## Deployment

Static build (`npm run build` → `dist/`) — deployable to GitHub Pages,
Vercel, Netlify, or any static host. No backend, no server to
maintain.
