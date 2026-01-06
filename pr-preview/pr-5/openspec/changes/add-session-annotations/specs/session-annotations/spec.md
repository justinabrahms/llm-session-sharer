## ADDED Requirements

### Requirement: Annotation Storage

The system SHALL store annotations in the URL fragment so they can be shared
without modifying the original gist. Each annotation references a range of
segments (start and end index, inclusive). A range of one segment is valid.

#### Scenario: Annotations encoded in URL

- **WHEN** a user adds an annotation
- **THEN** the URL fragment is updated to include the encoded annotation data
- **AND** the page can be refreshed without losing annotations

#### Scenario: Shared URL preserves annotations

- **WHEN** a user copies the URL and shares it
- **THEN** the recipient sees the same annotations when they open the link

### Requirement: Add Annotation

The system SHALL allow users to annotate a range of conversation segments via
click interaction on desktop devices. Mobile devices are view-only.

#### Scenario: Annotate a single segment

- **WHEN** a user clicks a segment to start selection
- **AND** clicks the same segment again (or confirms)
- **THEN** an input appears to enter annotation text
- **WHEN** the user enters text and confirms
- **THEN** the annotation is saved covering that single segment

#### Scenario: Annotate a range of segments

- **WHEN** a user clicks a segment to start selection
- **AND** clicks a different segment to end selection
- **THEN** an input appears to enter annotation text
- **WHEN** the user enters text and confirms
- **THEN** the annotation is saved covering the selected range

#### Scenario: Cancel adding annotation

- **WHEN** a user is selecting segments or entering an annotation
- **AND** the user cancels (clicks cancel or presses Escape)
- **THEN** the selection/input is dismissed without saving

#### Scenario: Mobile view-only

- **WHEN** a user views the session on a mobile device
- **THEN** existing annotations are displayed
- **AND** no UI for adding annotations is shown

### Requirement: Edit Annotation

The system SHALL allow users to edit existing annotations on desktop devices.

#### Scenario: Edit annotation text

- **WHEN** a user clicks the edit button on an annotation
- **THEN** the annotation text becomes editable
- **WHEN** the user modifies the text and confirms
- **THEN** the updated annotation is saved and the URL is updated

### Requirement: Delete Annotation

The system SHALL allow users to delete annotations on desktop devices.

#### Scenario: Delete annotation

- **WHEN** a user clicks the delete button on an annotation
- **THEN** the annotation is removed
- **AND** the URL is updated to reflect the removal

### Requirement: Annotation Display

The system SHALL display annotations with visual highlighting of the referenced
segment range and the annotation text displayed alongside.

#### Scenario: Range highlighting

- **WHEN** an annotation exists for a range of segments
- **THEN** those segments are visually highlighted (e.g., background color,
  border)
- **AND** the annotation text is displayed adjacent to the range

#### Scenario: Single segment annotation

- **WHEN** an annotation covers a single segment
- **THEN** that segment is highlighted
- **AND** the annotation text is displayed adjacent to it
