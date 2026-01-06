## 1. Project Setup

- [x] 1.1 Create index.html with basic structure
- [x] 1.2 Add styles.css with layout and typography
- [x] 1.3 Create app.js for main logic
- [x] 1.4 Configure GitHub Pages deployment

## 2. Gist Loading

- [x] 2.1 Parse gist ID from URL query parameter
- [x] 2.2 Fetch gist content via GitHub API
- [x] 2.3 Handle errors (invalid gist, network failure, rate limit)
- [x] 2.4 Show loading state while fetching

## 3. Export Parser

- [x] 3.1 Implement line-by-line parser for export format
- [x] 3.2 Detect user messages (`> ` prefix)
- [x] 3.3 Detect assistant messages (`⏺` prefix)
- [x] 3.4 Detect tool operations (`! ` prefix, `⎿` results)
- [x] 3.5 Handle multi-line content and indentation
- [x] 3.6 Handle `[..snip..]` markers

## 4. Rendering

- [x] 4.1 Render user messages with distinct styling
- [x] 4.2 Render assistant messages with distinct styling
- [x] 4.3 Render tool blocks as collapsed sections
- [x] 4.4 Add expand/collapse toggle for tool blocks
- [x] 4.5 Style the overall conversation flow

## 5. Landing Experience

- [x] 5.1 Show input form when no gist parameter present
- [x] 5.2 Allow pasting gist URL or ID
- [x] 5.3 Navigate to viewer with gist parameter

## 6. Polish

- [x] 6.1 Add copy-to-clipboard for shareable URL
- [x] 6.2 Basic responsive styling for mobile
- [x] 6.3 Add brief instructions/help text
