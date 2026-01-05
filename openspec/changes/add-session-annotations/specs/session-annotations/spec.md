## ADDED Requirements

### Requirement: Annotation Storage

The system SHALL store annotations in the URL fragment so they can be shared
without modifying the original gist.

#### Scenario: Annotations encoded in URL

- **WHEN** a user adds an annotation
- **THEN** the URL fragment is updated to include the encoded annotation data
- **AND** the page can be refreshed without losing annotations

#### Scenario: Shared URL preserves annotations

- **WHEN** a user copies the URL and shares it
- **THEN** the recipient sees the same annotations when they open the link

### Requirement: Add Annotation

The system SHALL allow users to add annotations between any two conversation
segments via click interaction.

#### Scenario: Add annotation via click

- **WHEN** a user hovers between two conversation segments
- **THEN** an "add annotation" button appears
- **WHEN** the user clicks the button
- **THEN** an inline text input appears
- **WHEN** the user enters text and confirms
- **THEN** the annotation is saved and displayed

#### Scenario: Cancel adding annotation

- **WHEN** a user is entering an annotation
- **AND** the user cancels (clicks cancel or presses Escape)
- **THEN** the input is dismissed without saving

### Requirement: Edit Annotation

The system SHALL allow users to edit existing annotations.

#### Scenario: Edit annotation

- **WHEN** a user clicks the edit button on an annotation
- **THEN** the annotation text becomes editable
- **WHEN** the user modifies the text and confirms
- **THEN** the updated annotation is saved and the URL is updated

### Requirement: Delete Annotation

The system SHALL allow users to delete annotations.

#### Scenario: Delete annotation

- **WHEN** a user clicks the delete button on an annotation
- **THEN** the annotation is removed
- **AND** the URL is updated to reflect the removal

### Requirement: Annotation Display

The system SHALL display annotations as visually distinct elements separate from
the conversation content.

#### Scenario: Annotation styling

- **WHEN** an annotation exists at a segment boundary
- **THEN** it is rendered with distinct styling (e.g., note/callout appearance)
- **AND** it is clearly distinguishable from user messages, assistant messages,
  and tool blocks
