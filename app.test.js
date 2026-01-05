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

// ============================================
// Markdown rendering tests
// ============================================

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderMarkdown(text) {
  // First, handle fenced code blocks (``` ... ```)
  const codeBlocks = [];
  text = text.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
    const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
    codeBlocks.push(`<pre><code class="code-block${lang ? ' language-' + lang : ''}">${escapeHtml(code.trim())}</code></pre>`);
    return placeholder;
  });

  // Handle markdown tables before escaping
  const tables = [];
  text = text.replace(/^(\|.+\|)\n(\|[-:| ]+\|)\n((?:\|.+\|\n?)+)/gm, (match, header, separator, body) => {
    const placeholder = `__TABLE_${tables.length}__`;
    const headerCells = header.split('|').slice(1, -1).map(c => c.trim());
    const bodyRows = body.trim().split('\n').map(row =>
      row.split('|').slice(1, -1).map(c => c.trim())
    );

    let html = '<table><thead><tr>';
    headerCells.forEach(cell => { html += `<th>${escapeHtml(cell)}</th>`; });
    html += '</tr></thead><tbody>';
    bodyRows.forEach(row => {
      html += '<tr>';
      row.forEach(cell => { html += `<td>${escapeHtml(cell)}</td>`; });
      html += '</tr>';
    });
    html += '</tbody></table>';
    tables.push(html);
    return placeholder;
  });

  // Escape HTML in the remaining text
  text = escapeHtml(text);

  // Restore code blocks and tables (they were already escaped)
  codeBlocks.forEach((block, i) => {
    text = text.replace(`__CODE_BLOCK_${i}__`, block);
  });
  tables.forEach((table, i) => {
    text = text.replace(`__TABLE_${i}__`, table);
  });

  // Inline code (must come before other inline formatting)
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Bold (**text** or __text__)
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/__([^_]+)__/g, '<strong>$1</strong>');

  // Italic (*text* or _text_) - be careful not to match inside words
  text = text.replace(/(?<![*\w])\*([^*]+)\*(?![*\w])/g, '<em>$1</em>');
  text = text.replace(/(?<![_\w])_([^_]+)_(?![_\w])/g, '<em>$1</em>');

  // Links [text](url)
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

  // Headers (# text) - convert to bold for simplicity in chat context
  text = text.replace(/^#{1,6}\s+(.+)$/gm, '<strong>$1</strong>');

  // Bullet lists (- or * at start of line)
  text = text.replace(/^[\-\*]\s+(.+)$/gm, '• $1');

  // Numbered lists (1. at start of line) - keep as-is, just ensure proper spacing
  text = text.replace(/^(\d+)\.\s+(.+)$/gm, '$1. $2');

  // Collapse multiple blank lines, then convert single newlines to <br>
  text = text.replace(/\n{3,}/g, '\n\n');  // Max 2 newlines
  text = text.replace(/\n/g, '<br>');

  return text;
}

const markdownTests = [
  {
    name: 'renders markdown table',
    input: `| Col1 | Col2 |
|------|------|
| A | B |
| C | D |`,
    check: (result) => {
      return result.includes('<table>') &&
             result.includes('<th>Col1</th>') &&
             result.includes('<td>A</td>') &&
             result.includes('</table>');
    }
  },
  {
    name: 'renders bold text',
    input: 'This is **bold** text',
    check: (result) => result.includes('<strong>bold</strong>')
  },
  {
    name: 'renders inline code',
    input: 'Use `git status` command',
    check: (result) => result.includes('<code>git status</code>')
  },
  {
    name: 'renders fenced code block',
    input: '```js\nconst x = 1;\n```',
    check: (result) => result.includes('<pre><code class="code-block language-js">') &&
                       result.includes('const x = 1;')
  },
  {
    name: 'renders links',
    input: 'Check [this link](https://example.com)',
    check: (result) => result.includes('<a href="https://example.com"') &&
                       result.includes('>this link</a>')
  },
  {
    name: 'collapses excessive newlines',
    input: 'Line 1\n\n\n\n\nLine 2',
    check: (result) => !result.includes('<br><br><br>')
  },
  {
    name: 'renders bullet list',
    input: '- Item 1\n- Item 2',
    check: (result) => result.includes('• Item 1') && result.includes('• Item 2')
  }
];

console.log('\n--- Markdown rendering tests ---');
for (const test of markdownTests) {
  try {
    const result = renderMarkdown(test.input);
    if (test.check(result)) {
      passed++;
      console.log(`✓ ${test.name}`);
    } else {
      failed++;
      console.error(`✗ ${test.name}`);
      console.error(`  Result: ${result}`);
    }
  } catch (err) {
    failed++;
    console.error(`✗ ${test.name}`);
    console.error(`  Error: ${err.message}`);
  }
}

const elapsed = Date.now() - startTime;
console.log(`\n${passed} passed, ${failed} failed (${elapsed}ms)`);

// Exit with error if any tests failed
process.exit(failed > 0 ? 1 : 0);
