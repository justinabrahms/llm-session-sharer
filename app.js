(function() {
  'use strict';

  const $ = (sel) => document.querySelector(sel);
  const show = (el) => el.classList.remove('hidden');
  const hide = (el) => el.classList.add('hidden');

  // Extract gist ID from various formats
  function parseGistParam(param) {
    if (!param) return null;
    // Handle full URL: https://gist.github.com/user/abc123
    const urlMatch = param.match(/gist\.github\.com\/(?:[\w-]+\/)?([a-f0-9]+)/i);
    if (urlMatch) return urlMatch[1];
    // Handle owner/id format or just id
    const parts = param.split('/');
    return parts[parts.length - 1];
  }

  // Fetch gist content from GitHub API
  async function fetchGist(gistId) {
    const response = await fetch(`https://api.github.com/gists/${gistId}`);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Gist not found. Make sure it exists and is public.');
      }
      if (response.status === 403) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      throw new Error(`Failed to load gist: ${response.status}`);
    }
    const data = await response.json();
    // Get first file's content
    const files = Object.values(data.files);
    if (files.length === 0) {
      throw new Error('Gist has no files.');
    }
    return files[0].content;
  }

  // Parse Claude Code export format
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
        // Continue existing user message instead of starting new one
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
        // For user messages, continue until next segment marker
        if (current.type === 'user') {
          current.content.push(line);
          continue;
        }
        // For assistant messages, preserve indented content and continuations
        if (current.type === 'assistant') {
          current.content.push(line);
          continue;
        }
        // For tool blocks, include everything until next segment type
        if (current.type === 'tool') {
          current.content.push(line);
          continue;
        }
      }
    }

    pushCurrent();
    return segments;
  }

  // Generate tool summary from content
  function getToolSummary(content) {
    const firstLine = content.split('\n')[0];
    if (firstLine.length > 60) {
      return firstLine.slice(0, 60) + '...';
    }
    return firstLine || 'Tool operation';
  }

  // Escape HTML
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Simple markdown to HTML renderer
  function renderMarkdown(text) {
    // First, handle fenced code blocks (``` ... ```)
    const codeBlocks = [];
    text = text.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
      const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
      codeBlocks.push(`<pre><code class="code-block${lang ? ' language-' + lang : ''}">${escapeHtml(code.trim())}</code></pre>`);
      return placeholder;
    });

    // Escape HTML in the remaining text
    text = escapeHtml(text);

    // Restore code blocks (they were already escaped)
    codeBlocks.forEach((block, i) => {
      text = text.replace(`__CODE_BLOCK_${i}__`, block);
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

    // Convert newlines to <br> (but not inside pre blocks)
    text = text.replace(/\n/g, '<br>\n');

    return text;
  }

  // Detect if a line looks like code (tree, path, etc.)
  function isCodeLine(line) {
    // Tree characters
    if (/[├└│─┌┐┘┬┴┼⎿]/.test(line)) return true;
    // Looks like a file/directory path (has slashes and path-like structure)
    if (/^\s*[\w.-]+\/[\w./-]*\s*(#.*)?$/.test(line)) return true;
    // Looks like a file listing with extension
    if (/^\s*[\w-]+\.(md|js|ts|py|json|yaml|yml|txt|html|css)\s*(#.*)?$/.test(line.trim())) return true;
    return false;
  }

  // Format content, wrapping code-like blocks in <code>
  function formatContent(text) {
    const lines = text.split('\n');
    const result = [];
    let inCodeBlock = false;
    let codeLines = [];

    function flushCode() {
      if (codeLines.length > 0) {
        result.push('<code class="code-block">' + codeLines.map(escapeHtml).join('\n') + '</code>');
        codeLines = [];
      }
    }

    for (const line of lines) {
      if (isCodeLine(line)) {
        if (!inCodeBlock) inCodeBlock = true;
        codeLines.push(line);
      } else {
        if (inCodeBlock) {
          flushCode();
          inCodeBlock = false;
        }
        result.push(escapeHtml(line));
      }
    }
    flushCode();

    return result.join('\n');
  }

  // Render conversation
  function renderConversation(segments) {
    const container = $('#conversation');
    container.innerHTML = '';

    // Check if assistant message is just a brief transition (not substantive)
    function isBriefTransition(content) {
      const trimmed = content.trim();
      // Short messages that are just transitions
      if (trimmed.length < 60 && /^(Now|Let me|I'll|Done|Good|Next|Adding|Updating|Creating|Fixed)[^.]*:?\s*$/.test(trimmed)) {
        return true;
      }
      return false;
    }

    // Group consecutive tools (and brief transitions) into tool groups
    const merged = [];
    for (const seg of segments) {
      const last = merged[merged.length - 1];
      if (seg.type === 'tool') {
        if (last && last.type === 'tool-group') {
          last.items.push(seg);
        } else {
          merged.push({ type: 'tool-group', items: [seg] });
        }
      } else if (seg.type === 'assistant' && isBriefTransition(seg.content) && last && last.type === 'tool-group') {
        // Include brief transitions in the tool group
        last.items.push(seg);
      } else {
        merged.push({ ...seg });
      }
    }

    // Convert single-item tool groups back to regular tools
    for (let i = 0; i < merged.length; i++) {
      if (merged[i].type === 'tool-group' && merged[i].items.length === 1) {
        merged[i] = { type: 'tool', content: merged[i].items[0].content };
      }
    }

    for (const segment of merged) {
      if (segment.type === 'user') {
        const el = document.createElement('div');
        el.className = 'message-row user';
        el.innerHTML = `
          <div class="message-label">You</div>
          <div class="message-bubble">${formatContent(segment.content)}</div>
        `;
        container.appendChild(el);
      } else if (segment.type === 'assistant') {
        const el = document.createElement('div');
        el.className = 'message-row assistant';
        el.innerHTML = `
          <div class="message-label">Claude</div>
          <div class="message-bubble">${renderMarkdown(segment.content)}</div>
        `;
        container.appendChild(el);
      } else if (segment.type === 'tool') {
        const el = document.createElement('div');
        el.className = 'tool-block';
        el.innerHTML = `
          <div class="tool-summary">
            <span class="tool-toggle">&#9654;</span>
            <span>${escapeHtml(getToolSummary(segment.content))}</span>
          </div>
          <div class="tool-details">${escapeHtml(segment.content)}</div>
        `;
        el.querySelector('.tool-summary').addEventListener('click', () => {
          el.classList.toggle('expanded');
        });
        container.appendChild(el);
      } else if (segment.type === 'tool-group') {
        const toolCount = segment.items.filter(i => i.type === 'tool').length;
        const el = document.createElement('div');
        el.className = 'tool-block tool-group';
        const details = segment.items.map(item => {
          if (item.type === 'tool') {
            return '▸ ' + item.content;
          } else {
            return '  ' + item.content;
          }
        }).join('\n\n');
        el.innerHTML = `
          <div class="tool-summary">
            <span class="tool-toggle">&#9654;</span>
            <span>${toolCount} tool operation${toolCount > 1 ? 's' : ''}...</span>
          </div>
          <div class="tool-details">${escapeHtml(details)}</div>
        `;
        el.querySelector('.tool-summary').addEventListener('click', () => {
          el.classList.toggle('expanded');
        });
        container.appendChild(el);
      } else if (segment.type === 'snip') {
        const el = document.createElement('div');
        el.className = 'snip';
        el.textContent = segment.content;
        container.appendChild(el);
      }
    }
  }

  // Copy URL to clipboard
  function setupCopyButton() {
    $('#copy-url').addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(window.location.href);
        const btn = $('#copy-url');
        const original = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => { btn.textContent = original; }, 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    });
  }

  // Setup hide Claude toggle
  function setupHideClaudeToggle() {
    const checkbox = $('#hide-claude');
    const conversation = $('#conversation');

    function updateFilter() {
      if (checkbox.checked) {
        conversation.classList.add('hide-claude');
      } else {
        conversation.classList.remove('hide-claude');
      }
    }

    // Use both change and click for better compatibility with in-app browsers
    checkbox.addEventListener('change', updateFilter);
    checkbox.addEventListener('click', () => {
      // Timeout to ensure checked state is updated
      setTimeout(updateFilter, 0);
    });
  }

  // Handle form submission
  function setupForm() {
    $('#gist-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const input = $('#gist-input').value.trim();
      if (input) {
        const gistId = parseGistParam(input);
        if (gistId) {
          window.location.search = `?gist=${input}`;
        }
      }
    });
  }

  // Keyboard navigation (j/k vim-style)
  function setupKeyboardNav() {
    let selectedIndex = -1;

    function getBlocks() {
      return Array.from($('#conversation').children);
    }

    function selectBlock(index) {
      const blocks = getBlocks();
      if (blocks.length === 0) return;

      // Clamp index
      index = Math.max(0, Math.min(index, blocks.length - 1));

      // Remove previous selection
      blocks.forEach(b => b.classList.remove('selected'));

      // Select new block
      selectedIndex = index;
      const block = blocks[selectedIndex];
      block.classList.add('selected');
      block.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    document.addEventListener('keydown', (e) => {
      // Ignore if typing in input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      const blocks = getBlocks();
      if (blocks.length === 0) return;

      if (e.key === 'j') {
        e.preventDefault();
        selectBlock(selectedIndex + 1);
      } else if (e.key === 'k') {
        e.preventDefault();
        selectBlock(selectedIndex - 1);
      }
    });
  }

  // Show error
  function showError(message) {
    hide($('#loading'));
    hide($('#landing'));
    hide($('#viewer'));
    show($('#error'));
    $('.error-message').textContent = message;
  }

  // Main
  async function init() {
    setupForm();
    setupCopyButton();
    setupHideClaudeToggle();

    const params = new URLSearchParams(window.location.search);
    const gistParam = params.get('gist');

    if (!gistParam) {
      show($('#landing'));
      return;
    }

    const gistId = parseGistParam(gistParam);
    if (!gistId) {
      showError('Invalid gist URL or ID.');
      return;
    }

    show($('#loading'));

    try {
      const content = await fetchGist(gistId);
      const segments = parseExport(content);

      if (segments.length === 0) {
        showError('Could not parse any conversation from this gist.');
        return;
      }

      hide($('#loading'));
      show($('#viewer'));
      renderConversation(segments);
      setupKeyboardNav();

      // Show link to original gist
      const gistLink = $('#gist-link');
      gistLink.href = `https://gist.github.com/${gistId}`;
      show(gistLink);
    } catch (err) {
      showError(err.message);
    }
  }

  init();
})();
