# Change: Add Session Viewer for Claude Code Exports

## Why

People learning about LLMs need to see the human-AI conversation flow without
being overwhelmed by the internal "work" (file reads, searches, tool calls).
Claude Code's `/export` produces a text transcript that includes everything,
making it hard to follow the actual dialogue.

## What Changes

- Add a static web UI that renders Claude Code session exports in a readable
  format
- User prompts and assistant responses shown prominently
- Tool operations (file reads, bash commands, searches) collapsed by default
- Gist-based data loading via URL parameter (e.g., `?gist=user/id`)
- Shareable URLs that encode the gist path

## Impact

- Affected specs: `session-viewer` (new capability)
- Affected code: New static site files (HTML, CSS, JS)
- No backend required - purely client-side
