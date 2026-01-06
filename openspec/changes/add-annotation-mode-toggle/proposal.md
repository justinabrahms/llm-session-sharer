# Change: Add Annotation Mode Toggle

## Why

Currently, clicking on any segment immediately starts annotation selection. This
can be confusing when users just want to read or navigate the conversation. A
dedicated "annotate mode" toggle makes the feature more intentional and prevents
accidental selection.

## What Changes

- Add a toggle button in the viewer header to enter/exit annotation mode
- Segment selection only works when annotation mode is active
- Visual indicator shows when annotation mode is on
- Exiting annotation mode cancels any in-progress selection

## Impact

- Affected specs: Modifies `session-annotations` capability
- Affected code: `app.js` (mode state, click handlers), `styles.css` (button
  styling), `index.html` (toggle button)
