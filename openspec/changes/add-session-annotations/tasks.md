## 1. URL Fragment Encoding

- [ ] 1.1 Define annotation data format:
  `{startIndex: number, endIndex: number, text: string}[]`
- [ ] 1.2 Implement `encodeAnnotations()` to serialize to URL-safe string
- [ ] 1.3 Implement `decodeAnnotations()` to parse from URL fragment
- [ ] 1.4 Update URL fragment when annotations change (preserve existing params)

## 2. Annotation State Management

- [ ] 2.1 Add annotations array to application state
- [ ] 2.2 Load annotations from URL on init
- [ ] 2.3 Implement `addAnnotation(startIndex, endIndex, text)`
- [ ] 2.4 Implement `editAnnotation(index, text)`
- [ ] 2.5 Implement `deleteAnnotation(index)`

## 3. Range Selection UI (Desktop Only)

- [ ] 3.1 Detect mobile devices and hide selection UI
- [ ] 3.2 Add click handler to segments for range selection
- [ ] 3.3 Track selection state (none, started, complete)
- [ ] 3.4 Highlight segments during selection (visual feedback)
- [ ] 3.5 Show text input after range is selected
- [ ] 3.6 Save button commits annotation and updates URL
- [ ] 3.7 Cancel button or Escape dismisses selection/input

## 4. Annotation Display

- [ ] 4.1 Highlight segments that are part of an annotation range
- [ ] 4.2 Render annotation text adjacent to the highlighted range
- [ ] 4.3 Add edit button to annotations (desktop only)
- [ ] 4.4 Add delete button to annotations (desktop only)
- [ ] 4.5 Style annotations distinctly from conversation content

## 5. Testing

- [ ] 5.1 Test URL encoding/decoding roundtrip
- [ ] 5.2 Test single-segment annotation (startIndex === endIndex)
- [ ] 5.3 Test multi-segment range annotation
- [ ] 5.4 Test annotation CRUD operations
- [ ] 5.5 Test URL sharing (annotations persist when URL is copied)
- [ ] 5.6 Test edge cases (special characters, overlapping ranges, many
  annotations)
