// Structured version of tests/eval_results.md from the nl-to-sql-assistant
// project. Kept as data, not hardcoded JSX, so future eval runs (after
// bug fixes) can be added as a new entry without touching component code.

export const projectOverview = {
  title: "NL-to-SQL Query Assistant",
  subtitle:
    "A schema-aware natural language to SQL agent, built with LangChain and local LLMs via Ollama — no API key required.",
  stack: [
    "Python",
    "LangChain",
    "Ollama (qwen2.5:7b)",
    "SQLite",
    "FAISS",
    "Streamlit",
  ],
  highlights: [
    "Schema-aware grounding via vector retrieval over hand-authored table/column business context — not raw DDL dumped into the prompt.",
    "Real enforced safety guardrail: every generated query is validated by a hand-written SQL parser before execution, independent of prompt instructions.",
    "Full query execution logging for evaluation and debugging.",
    "An honest, independently-verified accuracy evaluation — including a documented hallucination, not just a headline 'it works' claim.",
  ],
};

export const architectureSteps = [
  {
    step: 1,
    title: "Question comes in",
    description:
      "A natural language question is embedded and used to retrieve the most relevant table descriptions from a FAISS vector store — not the entire schema.",
  },
  {
    step: 2,
    title: "Schema-grounded prompt",
    description:
      "Retrieved table/column business context (e.g. 'order_items.unit_price is a historical snapshot, not the current catalog price') is injected into the agent's system prompt.",
  },
  {
    step: 3,
    title: "Agent generates & self-checks SQL",
    description:
      "A LangChain tool-calling agent (qwen2.5:7b) writes SQL, runs a query-checker pass, and can retry on error.",
  },
  {
    step: 4,
    title: "Validation guardrail",
    description:
      "Every query is checked by a hand-written validator before touching the database — blocks anything that isn't a single, safe SELECT statement, regardless of what the agent's prompt says.",
  },
  {
    step: 5,
    title: "Execution & logging",
    description:
      "The query runs against SQLite; every attempt (accepted or rejected) is logged to JSONL for evaluation.",
  },
];

// Failure mode taxonomy — used consistently across eval runs so results
// are comparable over time (see eval_results.md "Benchmarking methodology").
export const FAILURE_MODES = {
  PASS: { label: "Clean pass", color: "pass" },
  SILENT_TERMINATION: { label: "Silent early termination", color: "fail" },
  LOGIC_BUG: { label: "Logic / aggregation bug", color: "fail" },
  HALLUCINATION: { label: "Hallucinated result", color: "fail-severe" },
  AMBIGUITY: { label: "Unresolved ambiguity", color: "warn" },
  PARTIAL: { label: "Partially correct", color: "warn" },
};

// Model comparison across 4 local Ollama models on three independent benchmarks:
// 1. Codegen task (hand-written SQL validator, edge cases)
// 2. Tool-calling capability (can the model invoke LangChain tools?)
// 3. Full eval (if tool-calling passes, how many of 18 questions answered correctly)
export const modelComparison = {
  date: "2026-08-23",
  summary: "Benchmarked qwen2.5:7b, deepseek-coder-v2-small, qwen2.5-coder:7b, and gemma3:4b across three stages. Only qwen2.5:7b passed the tool-calling gate and ran full eval. Three distinct failure modes identified: hard API rejection (gemma3:4b, deepseek-coder-v2-small), silent no-call (qwen2.5-coder:7b), and full support (qwen2.5:7b).",
  models: [
    {
      name: "qwen2.5:7b",
      codegenScore: "6/6",
      codegenTime: "29.6s",
      toolCallingScore: "supported",
      toolCallingTime: "4.4s",
      fullEvalScore: "10/18 (55.6%)",
      fullEvalNote: "Only model passing tool-calling gate. 3 silent terminations, 5 false/wrong answers, 10 correct.",
    },
    {
      name: "deepseek-coder-v2-small",
      codegenScore: "3/6",
      codegenTime: "24.7s",
      toolCallingScore: "unsupported",
      toolCallingTime: "2.3s",
      fullEvalScore: "N/A",
      fullEvalNote: "Hard API rejection: 'does not support tools'. Ollama server explicitly blocks tool invocation.",
    },
    {
      name: "qwen2.5-coder:7b",
      codegenScore: "5/6",
      codegenTime: "32.6s",
      toolCallingScore: "no_tool_call",
      toolCallingTime: "4.4s",
      fullEvalScore: "N/A",
      fullEvalNote: "Model responds but never invokes the tool. Prints tool-call JSON as plain text instead of using LangChain binding.",
    },
    {
      name: "gemma3:4b",
      codegenScore: "4/6",
      codegenTime: "30.9s",
      toolCallingScore: "unsupported",
      toolCallingTime: "3.0s",
      fullEvalScore: "N/A",
      fullEvalNote: "Hard API rejection: 'does not support tools'. Same as deepseek-coder-v2-small — Ollama API itself doesn't enable tool support for this model.",
    },
  ],
  conclusion: "qwen2.5:7b is the only viable choice for the agent from this set. The comparison also documents three distinct tool-calling failure modes: (1) API-level rejection, (2) no-call without error, (3) full support. This is reproducible evidence for model selection.",
};

// Full per-model detail, sourced directly from the eval/compare_models.py
// run log (2026-08-23). Every mismatch, error string, and timing here is
// copied verbatim from the actual terminal output — not summarized.
export const modelDetails = {
  "qwen2.5:7b": {
    slug: "qwen2-5-7b",
    name: "qwen2.5:7b",
    verdict: "pass",
    tagline: "The only model that made it through all three gates.",
    codegen: {
      score: "6/6",
      time: "29.6s",
      mismatches: [],
      note: "Clean pass on every hand-written validator edge case — no mismatches, no harness errors.",
    },
    toolCalling: {
      result: "supported",
      time: "4.4s",
      detail: "Tool call made: get_current_count",
      note: "Model correctly bound to the LangChain tool schema and invoked it on the first attempt.",
    },
    fullEval: {
      applicable: true,
      passed: 10,
      total: 18,
      silentTerminations: 3,
      errors: 0,
      note: "Only model to pass the tool-calling gate, so it's the only one that ran the full 18-question suite. See the question-by-question breakdown below (2026-08-20 run — question wording and grading are identical to the 2026-08-23 run, whose only difference was 1 additional silent termination flipping the pass count from 9 to 10 depending on run variance).",
    },
  },
  "deepseek-coder-v2-small": {
    slug: "deepseek-coder-v2-small",
    name: "deepseek-coder-v2-small",
    verdict: "fail",
    tagline: "Hard-rejected by Ollama before it ever got a chance to write SQL.",
    codegen: {
      score: "3/6",
      time: "24.7s",
      mismatches: [
        { input: "SELECT * FROM users", expected: "True", got: "False" },
        { input: "SELECT * FROM users;", expected: "True", got: "False" },
        { input: "SELECT update_count FROM stats", expected: "True", got: "False" },
      ],
      note: "Failed on plain, unambiguous single-table SELECTs — not edge cases. Half the failures were on the simplest possible query shape.",
    },
    toolCalling: {
      result: "unsupported",
      time: "2.3s",
      detail: "ResponseError: registry.ollama.ai/library/deepseek-coder-v2-small:latest does not support tools (status code: 400)",
      note: "Hard API-level rejection — Ollama itself refuses to bind tools to this model. No amount of prompt engineering fixes this; it's a model capability gap, not an agent bug.",
    },
    fullEval: {
      applicable: false,
      reason: "Never reached the full eval stage — blocked at the tool-calling gate.",
    },
  },
  "qwen2.5-coder:7b": {
    slug: "qwen2-5-coder-7b",
    name: "qwen2.5-coder:7b",
    verdict: "fail",
    tagline: "Writes good SQL, but silently refuses to ever call a tool.",
    codegen: {
      score: "5/6",
      time: "32.6s",
      mismatches: [],
      harnessError: "ERROR on 'SELECT update_count FROM stats': name 'keyword' is not defined",
      note: "Best raw codegen score of the non-qwen2.5:7b models — the one failure here is a bug in the test harness itself (an undefined 'keyword' reference), not necessarily the model.",
    },
    toolCalling: {
      result: "no_tool_call",
      time: "4.4s",
      detail: "Model responded but did not invoke the tool",
      note: "The most deceptive failure mode of the four: no error, no rejection — it just prints tool-call-shaped JSON as plain chat text instead of using LangChain's actual binding. Would silently produce zero results in production with no exception to catch.",
    },
    fullEval: {
      applicable: false,
      reason: "Never reached the full eval stage — blocked at the tool-calling gate (silent no-call, not an error).",
    },
  },
  "gemma3:4b": {
    slug: "gemma3-4b",
    name: "gemma3:4b",
    verdict: "fail",
    tagline: "Same hard rejection as deepseek-coder-v2-small.",
    codegen: {
      score: "4/6",
      time: "30.9s",
      mismatches: [
        { input: "SELECT * FROM users;", expected: "True", got: "False" },
        { input: "SELECT update_count FROM stats", expected: "True", got: "False" },
      ],
      note: "Passed the unterminated SELECT * but failed the same query with a trailing semicolon — inconsistent handling of statement terminators.",
    },
    toolCalling: {
      result: "unsupported",
      time: "3.0s",
      detail: "ResponseError: registry.ollama.ai/library/gemma3:4b does not support tools (status code: 400)",
      note: "Identical failure mode to deepseek-coder-v2-small — the Ollama API itself doesn't expose tool support for this model, regardless of prompt or agent design.",
    },
    fullEval: {
      applicable: false,
      reason: "Never reached the full eval stage — blocked at the tool-calling gate.",
    },
  },
};

export const modelList = Object.values(modelDetails);

export function getModelBySlug(slug) {
  return modelList.find((m) => m.slug === slug) ?? null;
}

export const evalRuns = [
  {
    id: "2026-08-20-qwen2.5-7b",
    date: "2026-08-20",
    model: "qwen2.5:7b (local, Ollama)",
    summary:
      "First full evaluation pass after schema grounding (Day 2) and the SQL safety guardrail (Day 3). Ground truth for every question was independently verified by re-running equivalent SQL directly against the seeded database — not read from the agent's own claims.",
    totalQuestions: 18,
    results: {
      PASS: 9,
      SILENT_TERMINATION: 4,
      LOGIC_BUG: 2, // Q10, Q12 (Q17 counted as PARTIAL, not pure logic bug)
      HALLUCINATION: 1,
      AMBIGUITY: 1,
      PARTIAL: 1,
    },
    questions: [
      { num: 1, question: "How many customers do we have?", mode: "SILENT_TERMINATION", note: "Empty response, ~8s (vs 40-125s typical) — chain terminated early." },
      { num: 2, question: "List all product categories.", mode: "PASS" },
      { num: 3, question: "What is the most expensive product?", mode: "PASS" },
      { num: 4, question: 'How many employees work in the "South" region?', mode: "PASS" },
      { num: 5, question: "How many orders were placed by customers in India?", mode: "AMBIGUITY", note: "Agent used ship_country (156); customers.country gives 174 — a >10% swing the agent didn't flag." },
      { num: 6, question: "Which employee has processed the most orders?", mode: "SILENT_TERMINATION" },
      { num: 7, question: 'List Electronics products with <50 units in stock.', mode: "PASS" },
      { num: 8, question: 'Total number of orders with status "cancelled"?', mode: "PASS" },
      { num: 9, question: "Total revenue from completed orders?", mode: "PASS", note: "Exact match — correctly used order_items.unit_price (historical) over products.unit_price (current), evidence schema grounding works." },
      { num: 10, question: "Which product category generated the most revenue?", mode: "LOGIC_BUG", note: "Grouped by product_id instead of category before LIMIT 1 — returned neither the correct category nor a number matching any real category or product total." },
      { num: 11, question: "Top 5 customers by total amount spent?", mode: "SILENT_TERMINATION" },
      { num: 12, question: "Average order value, broken down by ship_country?", mode: "LOGIC_BUG", note: "Computed SUM per country, mislabeled as 'average' — off by 20-49x depending on country. Classic naive-AVG-over-a-join mistake." },
      { num: 13, question: "Customers who signed up in 2024 but never ordered?", mode: "HALLUCINATION", note: "Agent fabricated a JSON result row that the database never actually returned — re-running its exact SQL gives an empty result. Most serious finding in this eval." },
      { num: 14, question: "Month-over-month revenue for 2025?", mode: "PASS", note: "Hardest question in the set (date extraction, multi-join, grouping) — exact match across all 12 months." },
      { num: 15, question: 'Top revenue employee for orders shipped to "USA"?', mode: "SILENT_TERMINATION" },
      { num: 16, question: 'What\'s the "date" for order 42?', mode: "PASS", note: "Correctly resolved an ambiguous field name to orders.order_date without needing to ask." },
      { num: 17, question: "Show me our best customer.", mode: "PARTIAL", note: "Right customer, wrong number — SQL omitted the (1 - discount) term used correctly in Q9/10/14 in the same run." },
      { num: 18, question: "What products are we out of stock on?", mode: "PASS", note: "Correct answer (none), but the agent's own narration misread the empty result set as a tool failure before concluding correctly — a near-miss." },
    ],
    actionItems: [
      "Root-cause and fix silent early termination (22% of questions, zero partial credit) — likely max_iterations or a silently-swallowed malformed tool call.",
      "Fix the category-aggregation bug (Q10) — group by category before ranking, not by product.",
      "Fix the average-vs-sum bug (Q12) — average order value requires aggregating to one row per order first.",
      "Disambiguate customer.country vs. orders.ship_country in the schema metadata (Q5).",
      "Investigate the Q13 hallucination specifically as a distinct, more serious failure class from a logic bug.",
      "Investigate the discount-term inconsistency (Q17 vs Q9/10/14) — same rule, applied correctly 3 times and incorrectly once in one session.",
    ],
  },
];
