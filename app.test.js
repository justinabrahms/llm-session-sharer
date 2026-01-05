#!/usr/bin/env node
/**
 * Fast tests for message segmentation logic.
 * Run with: node app.test.js
 */
'use strict';

const assert = require('assert');

// Extract parseExport function from app.js (copy for testing)
function parseExport(text) {
  const lines = text.split('\n');
  const segments = [];
  let current = null;

  function pushCurrent() {
    if (current) {
      current.content = current.content.join('\n').trimEnd();
      segments.push(current);
      current = null;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // User message: starts with "> "
    if (line.startsWith('> ')) {
      const text = line.slice(2);
      if (current && current.type === 'user') {
        current.content.push(text);
      } else {
        pushCurrent();
        current = { type: 'user', content: [text] };
      }
      continue;
    }

    // Tool invocation: ⏺ ToolName(args) - detect by pattern
    // Match known tools OR mcp__* server tools (e.g., mcp__github__get_commit)
    const toolMatch = line.match(/^⏺\s*(Bash|Read|Write|Edit|Update|Glob|Grep|Fetch|Task|TodoWrite|WebFetch|WebSearch|NotebookEdit|AskUser|mcp__[\w]+)\s*\(/i);
    if (toolMatch) {
      pushCurrent();
      current = { type: 'tool', content: [line.slice(2)] };
      continue;
    }

    // Tool result: starts with "⎿" (possibly indented)
    if (line.trimStart().startsWith('⎿')) {
      if (current && current.type === 'tool') {
        current.content.push(line);
      } else {
        pushCurrent();
        current = { type: 'tool', content: [line] };
      }
      continue;
    }

    // Assistant message: starts with "⏺" (not a tool)
    if (line.startsWith('⏺')) {
      pushCurrent();
      const content = line.startsWith('⏺ ') ? line.slice(2) : line.slice(1);
      current = { type: 'assistant', content: [content] };
      continue;
    }

    // Legacy tool operation: starts with "! "
    if (line.startsWith('! ')) {
      pushCurrent();
      current = { type: 'tool', content: [line.slice(2)] };
      continue;
    }

    // Snip marker
    if (line.includes('[..snip..]')) {
      pushCurrent();
      segments.push({ type: 'snip', content: '[content snipped]' });
      continue;
    }

    // Header line (Claude Code version info) - skip
    if (line.includes('Claude Code v') || line.includes('▐▛') || line.includes('▝▜')) {
      continue;
    }

    // Continuation: lines that don't start a new segment continue the current one
    if (current) {
      if (current.type === 'user') {
        current.content.push(line);
        continue;
      }
      if (current.type === 'assistant') {
        current.content.push(line);
        continue;
      }
      if (current.type === 'tool') {
        current.content.push(line);
        continue;
      }
    }
  }

  pushCurrent();
  return segments;
}

// Test cases
const tests = [
  {
    name: 'parses user message',
    input: '> Hello world',
    expected: [{ type: 'user', content: 'Hello world' }]
  },
  {
    name: 'parses multi-line user message',
    input: '> Line one\n> Line two',
    expected: [{ type: 'user', content: 'Line one\nLine two' }]
  },
  {
    name: 'parses assistant message',
    input: '⏺ This is Claude responding',
    expected: [{ type: 'assistant', content: 'This is Claude responding' }]
  },
  {
    name: 'parses Bash tool call',
    input: '⏺ Bash(ls -la)\n  ⎿ output here',
    expected: [{ type: 'tool', content: 'Bash(ls -la)\n  ⎿ output here' }]
  },
  {
    name: 'parses MCP tool call with double underscore',
    input: '⏺ mcp__github__get_commit(...)\n  ⎿ result',
    expected: [{ type: 'tool', content: 'mcp__github__get_commit(...)\n  ⎿ result' }]
  },
  {
    name: 'parses mcp__slack__post_message tool',
    input: '⏺ mcp__slack__post_message(channel, text)',
    expected: [{ type: 'tool', content: 'mcp__slack__post_message(channel, text)' }]
  },
  {
    name: 'parses mcp__atlassian__jira_search tool',
    input: '⏺ mcp__atlassian__jira_search(query)',
    expected: [{ type: 'tool', content: 'mcp__atlassian__jira_search(query)' }]
  },
  {
    name: 'parses snip marker',
    input: '[..snip..]',
    expected: [{ type: 'snip', content: '[content snipped]' }]
  },
  {
    name: 'handles conversation with user, assistant, and tools',
    input: `> What files are here?
⏺ Let me check.
⏺ Bash(ls)
  ⎿ file1.txt
    file2.txt
⏺ Found 2 files.`,
    expected: [
      { type: 'user', content: 'What files are here?' },
      { type: 'assistant', content: 'Let me check.' },
      { type: 'tool', content: 'Bash(ls)\n  ⎿ file1.txt\n    file2.txt' },
      { type: 'assistant', content: 'Found 2 files.' }
    ]
  },
  {
    name: 'parses multiple consecutive MCP tool calls',
    input: `⏺ mcp__github__get_commit(...)
⏺ mcp__github__get_commit(...)
  ⎿ result`,
    expected: [
      { type: 'tool', content: 'mcp__github__get_commit(...)' },
      { type: 'tool', content: 'mcp__github__get_commit(...)\n  ⎿ result' }
    ]
  }
];

// Run tests
let passed = 0;
let failed = 0;
const startTime = Date.now();

for (const test of tests) {
  try {
    const result = parseExport(test.input);
    assert.deepStrictEqual(result, test.expected, `Test "${test.name}" failed`);
    passed++;
    console.log(`✓ ${test.name}`);
  } catch (err) {
    failed++;
    console.error(`✗ ${test.name}`);
    console.error(`  Expected: ${JSON.stringify(test.expected)}`);
    console.error(`  Got:      ${JSON.stringify(parseExport(test.input))}`);
  }
}

const elapsed = Date.now() - startTime;
console.log(`\n${passed} passed, ${failed} failed (${elapsed}ms)`);

// Exit with error if any tests failed
process.exit(failed > 0 ? 1 : 0);
