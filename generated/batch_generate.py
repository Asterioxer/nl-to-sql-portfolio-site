"""
Batch codegen dispatcher for the portfolio site — reuses the codegen
module from the nl-to-sql-assistant project (sibling folder) rather
than duplicating it.

Same staging discipline as the main project: outputs land here in
generated/, reviewed manually, then promoted into src/components/ —
never written directly into the real project.

Usage:
    python generated/batch_generate.py
"""

import sys
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

# Reuse codegen.py from the sibling nl-to-sql-assistant project instead
# of duplicating the module.
SIBLING_SRC = Path(__file__).parent.parent.parent / "nl-to-sql-assistant" / "src"
sys.path.insert(0, str(SIBLING_SRC))
from codegen import generate_code_only  # noqa: E402

GENERATED_DIR = Path(__file__).parent

FILE_SPECS = [
    (
        "CodeBlock.jsx",
        "Write a React functional component called CodeBlock that "
        "takes props `code` (string) and `language` (string, optional, "
        "default 'sql') and renders the code in a <pre><code> block "
        "with a small header bar showing the language name and a "
        "'Copy' button that copies the code to the clipboard using "
        "navigator.clipboard.writeText, with the button label changing "
        "to 'Copied!' for 1.5 seconds after a successful copy. Do not "
        "use any external syntax-highlighting library — plain "
        "monospace styling only, via a className (e.g. 'code-block') "
        "rather than inline styles, so it can be styled externally. "
        "Export as default. Return ONLY the code, no explanation.",
    ),
    (
        "StatCard.jsx",
        "Write a React functional component called StatCard that "
        "takes props `value` (string or number), `label` (string), and "
        "`variant` (string, optional, one of 'pass', 'fail', "
        "'fail-severe', 'warn', default 'pass') used as a CSS class "
        "suffix (e.g. className={`stat-card stat-card--${variant}`}). "
        "Renders the value large and bold, the label smaller beneath "
        "it. No inline styles, className-based only, so it can be "
        "styled externally. Export as default. Return ONLY the code, "
        "no explanation.",
    ),
]


def run_spec(name: str, prompt: str) -> tuple[str, str]:
    try:
        result = generate_code_only(prompt)
        return name, result
    except Exception as e:
        return name, f"// GENERATION FAILED: {e}"


def main():
    print(f"Dispatching {len(FILE_SPECS)} generation task(s) in parallel...\n")

    with ThreadPoolExecutor(max_workers=min(4, len(FILE_SPECS) or 1)) as executor:
        futures = {
            executor.submit(run_spec, name, prompt): name
            for name, prompt in FILE_SPECS
        }
        for future in as_completed(futures):
            name, content = future.result()
            out_path = GENERATED_DIR / name
            out_path.write_text(content, encoding="utf-8")
            status = "FAILED" if "GENERATION FAILED" in content[:30] else "done"
            print(f"  [{status}] {name} -> {out_path}")

    print(
        f"\nAll tasks complete. Review files in {GENERATED_DIR} before "
        f"copying anything into src/components/. Nothing here has been "
        f"reviewed or trusted yet."
    )


if __name__ == "__main__":
    main()
