Share the current Claude Code session to a GitHub Gist and copy the viewer URL
to clipboard.

Run this command:

```bash
~/.claude/scripts/share-session.sh "$(pwd)"
```

This will:

1. Export the current session conversation
2. Create a public GitHub Gist with the export
3. Copy the LLM Session Viewer URL to your clipboard

The viewer URL will be in the format: <https://justinabrahms.github.io/llm-session-sharer/?gist=GIST_ID>
