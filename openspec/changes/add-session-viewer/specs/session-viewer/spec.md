## ADDED Requirements

### Requirement: Gist-Based Session Loading

The system SHALL load Claude Code export content from a GitHub Gist specified
via URL parameter.

#### Scenario: Valid gist URL parameter

- **WHEN** user navigates to `/?gist={owner}/{gist_id}` or `/?gist={gist_id}`
- **THEN** the system fetches the gist content from GitHub API
- **AND** parses and displays the session

#### Scenario: Missing gist parameter

- **WHEN** user navigates to `/` without a gist parameter
- **THEN** the system displays a form to input a gist URL or ID

#### Scenario: Invalid or inaccessible gist

- **WHEN** the gist ID is invalid or the gist is private/deleted
- **THEN** the system displays an error message explaining the issue

---

### Requirement: Export Format Parsing

The system SHALL parse Claude Code `/export` text format into structured
conversation segments.

#### Scenario: User message detection

- **WHEN** a line starts with `> `
- **THEN** the content is identified as a user message

#### Scenario: Assistant message detection

- **WHEN** a line starts with `⏺` (or `⏺` followed by content)
- **THEN** the content is identified as an assistant message
- **AND** subsequent indented lines are included in the same message

#### Scenario: Tool operation detection

- **WHEN** a line starts with `! ` (tool invocation)
- **THEN** the content is identified as a tool operation
- **AND** lines starting with `⎿` are included as tool results

---

### Requirement: Conversation Display

The system SHALL display the parsed conversation with clear visual distinction
between message types.

#### Scenario: User messages displayed prominently

- **WHEN** rendering a user message
- **THEN** it is displayed with distinct styling (e.g., different background,
  alignment, or border)
- **AND** it is clearly attributable to "User" or "Human"

#### Scenario: Assistant messages displayed prominently

- **WHEN** rendering an assistant message
- **THEN** it is displayed with distinct styling from user messages
- **AND** it is clearly attributable to "Claude" or "Assistant"

---

### Requirement: Tool Operation Collapsing

The system SHALL collapse tool operations by default to reduce visual noise for
learners.

#### Scenario: Tool blocks collapsed by default

- **WHEN** rendering a tool operation block
- **THEN** it is displayed in a collapsed state showing a summary (e.g., "Tool:
  Read file...")
- **AND** the full content is hidden

#### Scenario: Tool blocks expandable

- **WHEN** user clicks on a collapsed tool block
- **THEN** the block expands to show the full tool invocation and results

---

### Requirement: Shareable URLs

The system SHALL support shareable URLs that encode the gist reference.

#### Scenario: URL contains full session state

- **WHEN** viewing a session loaded from a gist
- **THEN** the current URL can be shared with others
- **AND** opening that URL loads the same session
