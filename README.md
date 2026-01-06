# LLM Session Viewer

View Claude Code conversation exports in a readable format. Collapse tool
operations, highlight the human-AI dialogue.

**Live at:** <https://justinabrahms.github.io/llm-session-sharer/>

## Usage

1. Export a Claude Code session with `/export`
2. Upload it to a GitHub Gist
3. Paste the gist URL at the viewer

Or use the `/share` command below to do it all in one step.

## `/share` Command for Claude Code

Install the `/share` slash command to quickly share your current Claude Code
session:

### Installation

```bash
# Create directories
mkdir -p ~/.claude/commands ~/.claude/scripts

# Copy the command and scripts
curl -o ~/.claude/commands/share.md https://raw.githubusercontent.com/justinabrahms/llm-session-sharer/main/claude-command/share.md
curl -o ~/.claude/scripts/share-session.sh https://raw.githubusercontent.com/justinabrahms/llm-session-sharer/main/claude-command/share-session.sh
curl -o ~/.claude/scripts/export-session.py https://raw.githubusercontent.com/justinabrahms/llm-session-sharer/main/claude-command/export-session.py

# Make scripts executable
chmod +x ~/.claude/scripts/share-session.sh ~/.claude/scripts/export-session.py
```

### Requirements

- Python 3
- GitHub CLI (`gh`) authenticated
- macOS (uses `pbcopy` for clipboard)

### Usage

In any Claude Code session, type `/share`. This will:

1. Export your current session
2. Create a public GitHub Gist
3. Copy the viewer URL to your clipboard

## Features

- Collapsible tool operations
- "User only" filter to see just your messages
- Keyboard navigation (j/k)
- Link to original gist
