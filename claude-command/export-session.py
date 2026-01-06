#!/usr/bin/env python3
"""Export a Claude Code session to the /export text format."""

import json
import sys
import os
import glob
from pathlib import Path

def get_project_dir(cwd):
    """Convert a working directory to the Claude projects path."""
    # Claude stores sessions in ~/.claude/projects/ with path encoded as dashes
    # /Users/foo/bar becomes -Users-foo-bar
    # Periods are also replaced with dashes
    encoded = cwd.replace("/", "-").replace(".", "-")
    return Path.home() / ".claude" / "projects" / encoded

def find_latest_session(project_dir):
    """Find the most recently modified main session file (not agent files)."""
    sessions = []
    for f in project_dir.glob("*.jsonl"):
        # Skip agent files
        if f.name.startswith("agent-"):
            continue
        sessions.append((f.stat().st_mtime, f))

    if not sessions:
        return None

    sessions.sort(reverse=True)
    return sessions[0][1]

def find_agent_files(project_dir, session_id):
    """Find agent files that belong to this session based on timestamps."""
    # Get all agent files
    agent_files = {}
    for f in project_dir.glob("agent-*.jsonl"):
        agent_id = f.stem.replace("agent-", "")
        agent_files[agent_id] = f
    return agent_files

def format_tool_input(tool_name, input_data):
    """Format tool invocation."""
    if isinstance(input_data, dict):
        if tool_name == "Bash":
            cmd = input_data.get("command", "")
            if len(cmd) > 80:
                cmd = cmd[:77] + "..."
            return f"Bash({cmd})"
        elif tool_name == "Read":
            return f"Read({input_data.get('file_path', '')})"
        elif tool_name == "Edit":
            return f"Edit({input_data.get('file_path', '')})"
        elif tool_name == "Write":
            return f"Write({input_data.get('file_path', '')})"
        elif tool_name == "Glob":
            return f"Glob({input_data.get('pattern', '')})"
        elif tool_name == "Grep":
            return f"Grep({input_data.get('pattern', '')})"
        elif tool_name == "Task":
            desc = input_data.get("description", "")
            return f"Task({desc})"
        else:
            # Generic format
            return f"{tool_name}(...)"
    return f"{tool_name}()"

def format_tool_result(content, max_lines=20):
    """Format tool result, truncating if needed."""
    if isinstance(content, str):
        lines = content.split('\n')
        if len(lines) > max_lines:
            return '\n'.join(lines[:max_lines]) + f"\n[..snip.. {len(lines) - max_lines} more lines]"
        return content
    return str(content)

def parse_session(session_file, agent_files=None):
    """Parse a session file and return formatted export text."""
    output = []
    tool_uses = {}  # Track pending tool uses by ID

    with open(session_file, 'r') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue

            try:
                msg = json.loads(line)
            except json.JSONDecodeError:
                continue

            msg_type = msg.get("type")

            # Skip file-history-snapshot and meta messages
            if msg_type == "file-history-snapshot":
                continue
            if msg.get("isMeta"):
                continue

            content = msg.get("message", {}).get("content", "")

            if msg_type == "user":
                if isinstance(content, str):
                    # Skip system/internal messages
                    if content.startswith("<command-name>") or content.startswith("<local-command"):
                        continue
                    if content.startswith("Caveat:"):
                        continue
                    if content.startswith("<system-reminder>"):
                        continue
                    # User message
                    for line in content.split('\n'):
                        output.append(f"> {line}")
                    output.append("")
                elif isinstance(content, list):
                    # Tool results
                    for item in content:
                        if item.get("type") == "tool_result":
                            tool_id = item.get("tool_use_id")
                            result = item.get("content", "")
                            # Find matching tool use
                            tool_info = tool_uses.get(tool_id, "Tool")
                            formatted_result = format_tool_result(result)
                            for i, line in enumerate(formatted_result.split('\n')):
                                if i == 0:
                                    output.append(f"  \u23bf {line}")
                                else:
                                    output.append(f"    {line}")
                            output.append("")

            elif msg_type == "assistant":
                if isinstance(content, list):
                    for item in content:
                        item_type = item.get("type")

                        if item_type == "text":
                            text = item.get("text", "")
                            if text:
                                output.append(f"\u23fa {text}")
                                output.append("")

                        elif item_type == "tool_use":
                            tool_name = item.get("name", "Tool")
                            tool_input = item.get("input", {})
                            tool_id = item.get("id")
                            formatted = format_tool_input(tool_name, tool_input)
                            tool_uses[tool_id] = formatted
                            output.append(f"\u23fa {formatted}")

                        # Skip thinking blocks
                        elif item_type == "thinking":
                            pass

                elif isinstance(content, str) and content:
                    output.append(f"\u23fa {content}")
                    output.append("")

    return '\n'.join(output)

def main():
    # Get current working directory from arg or environment
    if len(sys.argv) > 1:
        cwd = sys.argv[1]
    else:
        cwd = os.getcwd()

    project_dir = get_project_dir(cwd)

    if not project_dir.exists():
        print(f"Error: No Claude project found for {cwd}", file=sys.stderr)
        sys.exit(1)

    session_file = find_latest_session(project_dir)

    if not session_file:
        print("Error: No session files found", file=sys.stderr)
        sys.exit(1)

    # Get session ID for finding related agent files
    session_id = session_file.stem
    agent_files = find_agent_files(project_dir, session_id)

    # Parse main session
    export_text = parse_session(session_file, agent_files)

    print(export_text)

if __name__ == "__main__":
    main()
