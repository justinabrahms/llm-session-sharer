# Change: Add Session Annotations

## Why

Users sharing LLM sessions for educational purposes want to add context at
different points in the conversation - explaining their thought process,
highlighting breakthroughs, or noting where they changed strategy. Currently
there's no way to annotate a session without modifying the original export.

## What Changes

- Add ability to annotate a range of conversation segments (single segment or
  multiple)
- Store annotations in URL fragment for shareability (no backend required)
- Click-based UI to select range, then add annotation text
- Annotated ranges visually highlighted with annotation displayed alongside

## Impact

- Affected specs: New `session-annotations` capability
- Affected code: `app.js` (parsing, rendering, URL handling), `styles.css`
  (annotation styling), `index.html` (minor)
