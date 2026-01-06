## Context

Claude Code's `/export` command produces a plain-text transcript with specific
formatting:

- `> ` prefix for user input
- `⏺` prefix for assistant responses (with indented content)
- `! command` for tool operations with `⎿` result markers
- `[..snip..]` for omitted content

The viewer needs to parse this format and present it in a learner-friendly way.

## Goals / Non-Goals

**Goals:**

- Parse Claude Code export format from GitHub Gists
- Display user/assistant conversation clearly
- Hide complexity of tool operations behind collapsible sections
- Work as a static site (GitHub Pages)
- Shareable URLs

**Non-Goals:**

- Editing or annotating sessions
- Supporting other export formats (for now)
- User accounts or persistence beyond URL state

## Decisions

### Data Source: GitHub Gist API

- **Decision**: Fetch gist content via `https://api.github.com/gists/{id}`
- **Rationale** : Free, no auth required for public gists, user already has
  workflow for uploading exports
- **Alternative considered** : Direct file upload - rejected because it doesn't
  enable sharing

### URL Structure

- **Decision**: `?gist={owner}/{gist_id}` or `?gist={gist_id}`
- **Rationale**: Simple, shareable, encodes all state needed
- **Example**: `https://user.github.io/llm-session-sharer/?gist=justinabrahms/6db926b87730c81e4d1945d67b5faad6`

### Tech Stack

- **Decision**: Vanilla HTML/CSS/JS, single page
- **Rationale** : Minimal complexity, no build step, easy to deploy to GitHub
  Pages
- **Alternative considered**: React/Vue - overkill for this scope

### Parsing Strategy

- **Decision**: Line-by-line state machine parser
- **Rationale**: Export format is line-oriented with clear prefixes
- **States**: `user`, `assistant`, `tool`, `tool-result`

### Collapse Behavior

- **Decision** : Tool operations collapsed by default, single "expand" toggle
  per tool block
- **Rationale**: Keeps it simple; learners can optionally dig in

## Risks / Trade-offs

- **Risk**: Export format may change between Claude Code versions
  - Mitigation: Parser should be resilient to unknown prefixes (treat as
    continuation)
- **Risk**: GitHub API rate limits (60 req/hour unauthenticated)
  - Mitigation: Acceptable for sharing use case; can add caching later if needed
- **Risk**: Large exports may be slow to parse
  - Mitigation: MVP accepts this; optimize if proven problematic

## Resolved Questions

- **Multiple files in gist?** No - use first file only
- **Styling preferences?** None - keep it simple
