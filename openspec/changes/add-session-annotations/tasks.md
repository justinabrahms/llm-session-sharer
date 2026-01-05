## 1. URL Fragment Encoding

- [ ] 1.1 Define annotation data format:
  `{segmentIndex: number, text: string}[]`
- [ ] 1.2 Implement `encodeAnnotations()` to serialize to URL-safe string
- [ ] 1.3 Implement `decodeAnnotations()` to parse from URL fragment
- [ ] 1.4 Update URL fragment when annotations change (preserve existing hash
  params)

## 2. Annotation State Management

- [ ] 2.1 Add annotations array to application state
- [ ] 2.2 Load annotations from URL on init
- [ ] 2.3 Implement `addAnnotation(segmentIndex, text)`
- [ ] 2.4 Implement `editAnnotation(segmentIndex, text)`
- [ ] 2.5 Implement `deleteAnnotation(segmentIndex)`

## 3. Click-Based UI (Desktop Only)

- [ ] 3.1 Detect mobile devices and hide editing UI
- [ ] 3.2 Add "+" button between each segment (hidden by default, shown on
  hover)
- [ ] 3.3 Clicking "+" opens inline text input for annotation
- [ ] 3.4 Save button commits annotation and updates URL
- [ ] 3.5 Cancel button or Escape dismisses input

## 4. Annotation Display

- [ ] 4.1 Render existing annotations as styled callout blocks
- [ ] 4.2 Add edit button to existing annotations (desktop only)
- [ ] 4.3 Add delete button to existing annotations (desktop only)
- [ ] 4.4 Style annotations distinctly (e.g., yellow/note color, icon)

## 5. Testing

- [ ] 5.1 Test URL encoding/decoding roundtrip
- [ ] 5.2 Test annotation CRUD operations
- [ ] 5.3 Test URL sharing (annotations persist when URL is copied)
- [ ] 5.4 Test edge cases (empty text, special characters, many annotations)
