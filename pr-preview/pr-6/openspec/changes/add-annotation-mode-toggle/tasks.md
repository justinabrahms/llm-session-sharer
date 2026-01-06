## 1. UI Changes

- [x] 1.1 Add "Annotate" toggle button to viewer header (next to existing
  controls)
- [x] 1.2 Style button to show active/inactive state
- [x] 1.3 Add visual indicator when annotation mode is active (e.g., border,
  background tint)

## 2. Mode State Management

- [x] 2.1 Add `annotationModeActive` boolean state
- [x] 2.2 Toggle button toggles mode on/off
- [x] 2.3 Exiting mode cancels any in-progress selection
- [x] 2.4 Mode stays active after saving an annotation (user can add multiple)

## 3. Update Selection Logic

- [x] 3.1 Gate segment click handlers behind `annotationModeActive` check
- [x] 3.2 Only show `.selectable` cursor/hover when mode is active
- [x] 3.3 Hide toggle button on mobile (view-only)

## 4. Testing

- [ ] 4.1 Verify clicking segments does nothing when mode is off
- [ ] 4.2 Verify selection works when mode is on
- [ ] 4.3 Verify exiting mode cancels in-progress selection
- [ ] 4.4 Verify toggle button hidden on mobile
