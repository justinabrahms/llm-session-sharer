## 1. URL Fragment Encoding

- [x] 1.1 Define annotation data format:
  `{startIndex: number, endIndex: number, text: string}[]`
- [x] 1.2 Implement `encodeAnnotations()` to serialize to URL-safe string
- [x] 1.3 Implement `decodeAnnotations()` to parse from URL fragment
- [x] 1.4 Update URL fragment when annotations change (preserve existing params)

## 2. Annotation State Management

- [x] 2.1 Add annotations array to application state
- [x] 2.2 Load annotations from URL on init
- [x] 2.3 Implement `addAnnotation(startIndex, endIndex, text)`
- [x] 2.4 Implement `editAnnotation(index, text)`
- [x] 2.5 Implement `deleteAnnotation(index)`

## 3. Range Selection UI (Desktop Only)

- [x] 3.1 Detect mobile devices and hide selection UI
- [x] 3.2 Add click handler to segments for range selection
- [x] 3.3 Track selection state (none, started, complete)
- [x] 3.4 Highlight segments during selection (visual feedback)
- [x] 3.5 Show text input after range is selected
- [x] 3.6 Save button commits annotation and updates URL
- [x] 3.7 Cancel button or Escape dismisses selection/input

## 4. Annotation Display

- [x] 4.1 Highlight segments that are part of an annotation range
- [x] 4.2 Render annotation text adjacent to the highlighted range
- [x] 4.3 Add edit button to annotations (desktop only)
- [x] 4.4 Add delete button to annotations (desktop only)
- [x] 4.5 Style annotations distinctly from conversation content

## 5. Testing

- [x] 5.1 Test URL encoding/decoding roundtrip
- [x] 5.2 Test single-segment annotation (startIndex === endIndex)
- [x] 5.3 Test multi-segment range annotation
- [x] 5.4 Test annotation CRUD operations
- [x] 5.5 Test URL sharing (annotations persist when URL is copied)
- [x] 5.6 Test edge cases (special characters, overlapping ranges, many
  annotations)
