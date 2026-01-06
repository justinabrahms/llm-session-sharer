#!/bin/bash
# Share a Claude Code session to a gist and copy viewer URL to clipboard

set -e

# Get the working directory (passed as argument or use current)
CWD="${1:-$(pwd)}"

# Export the session
EXPORT=$(python3 ~/.claude/scripts/export-session.py "$CWD")

if [ -z "$EXPORT" ]; then
    echo "Error: No session content to export" >&2
    exit 1
fi

# Create a gist with the export
GIST_URL=$(echo "$EXPORT" | gh gist create --public -f "claude-session.md" - 2>/dev/null)

if [ -z "$GIST_URL" ]; then
    echo "Error: Failed to create gist" >&2
    exit 1
fi

# Extract gist ID from URL (format: https://gist.github.com/username/GIST_ID)
GIST_ID=$(echo "$GIST_URL" | grep -oE '[a-f0-9]+$')

# Construct the viewer URL
VIEWER_URL="https://justinabrahms.github.io/llm-session-sharer/?gist=${GIST_ID}"

# Copy to clipboard (macOS)
echo "$VIEWER_URL" | pbcopy

# Output both URLs
echo "Gist: $GIST_URL"
echo "Viewer: $VIEWER_URL"
echo "(Viewer URL copied to clipboard)"
