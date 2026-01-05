<!-- OPENSPEC:START -->

# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:

- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big
  performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:

- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

## Project Guidelines

## Testing

When fixing bugs, **always add a regression test** to `app.test.js` that covers
the bug being fixed. This ensures the bug doesn't recur.

Tests should:

- Be fast (the entire test suite should run in < 1 second)
- Be self-contained (no external dependencies)
- Run via `node app.test.js`

A pre-push git hook runs tests automatically before pushing.

## Code Structure

- `app.js` - Main application logic (parsing, rendering)
- `app.test.js` - Unit tests for segmentation and markdown rendering
- `styles.css` - All styling
- `index.html` - Static HTML shell
