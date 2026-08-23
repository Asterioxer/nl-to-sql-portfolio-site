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
