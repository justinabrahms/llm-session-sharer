## ADDED Requirements

### Requirement: Annotation Mode Toggle

The system SHALL provide a toggle button to enter and exit annotation mode.
Segment selection for annotations only works when annotation mode is active.

#### Scenario: Enter annotation mode

- **WHEN** a user clicks the "Annotate" toggle button
- **THEN** annotation mode becomes active
- **AND** segments become selectable for annotation
- **AND** the button shows an active state

#### Scenario: Exit annotation mode

- **WHEN** a user clicks the toggle button while annotation mode is active
- **THEN** annotation mode becomes inactive
- **AND** any in-progress selection is cancelled
- **AND** segments are no longer selectable

#### Scenario: Clicking segments when mode is off

- **WHEN** annotation mode is inactive
- **AND** a user clicks on a segment
- **THEN** no selection occurs
- **AND** normal click behavior (e.g., tool expand) works

#### Scenario: Mode persists after saving

- **WHEN** annotation mode is active
- **AND** a user saves an annotation
- **THEN** annotation mode remains active
- **AND** the user can immediately select another range

#### Scenario: Toggle hidden on mobile

- **WHEN** a user views the session on a mobile device
- **THEN** the annotation mode toggle is not displayed
- **AND** existing annotations are still visible

## MODIFIED Requirements

### Requirement: Add Annotation

The system SHALL allow users to annotate a range of conversation segments via
click interaction on desktop devices when annotation mode is active. Mobile
devices are view-only.

#### Scenario: Annotate a single segment

- **WHEN** annotation mode is active
- **AND** a user clicks a segment to start selection
- **AND** clicks the same segment again (or confirms)
- **THEN** an input appears to enter annotation text
- **WHEN** the user enters text and confirms
- **THEN** the annotation is saved covering that single segment

#### Scenario: Annotate a range of segments

- **WHEN** annotation mode is active
- **AND** a user clicks a segment to start selection
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
