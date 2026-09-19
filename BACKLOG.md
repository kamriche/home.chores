# Home Chores App — Product Backlog

This backlog turns the approved visual demo into an implementation plan. Items are ordered by delivery sequence. All items should begin in the GitHub Project **Backlog** status.

## Milestone 1 — Product foundation

### P0 · 3 points · Define the household, room, chore, and schedule data model

**User story:** As the product team, we need a stable data model so every feature uses the same household data.

**Acceptance criteria**

- Models cover households, members, floors, rooms, chores, tool/supply items, assignments, schedules, recurrence, and completion records.
- IDs and relationships are documented.
- Removing a member leaves assigned chores unassigned rather than deleting them.
- Removing a room requires chores to be reassigned to another room.

### P0 · 5 points · Scaffold the responsive application shell

**User story:** As a household member, I can navigate between Chores, Planning, People, and Our home.

**Acceptance criteria**

- Primary navigation exposes Chores, Planning, People, and Our home.
- The current section is visibly and programmatically identified.
- Layout works from 320 px mobile width through desktop.
- Loading, empty, and error states have reusable patterns.

### P0 · 5 points · Add persistent household storage

**User story:** As a household member, my setup and chores remain available after closing the app.

**Acceptance criteria**

- Members, rooms, chores, tools, assignments, schedules, and completions persist.
- Create, update, and delete operations report actionable errors.
- Data is scoped to a household.
- Seed/demo data is kept separate from production data.

## Milestone 2 — Household setup

### P0 · 5 points · Build the household onboarding flow

**User story:** As a new user, I can define the number of floors and rooms in my home.

**Acceptance criteria**

- User chooses 1–6 floors and 1–24 rooms or places.
- Validation prevents empty or invalid values.
- User can move backward without losing entered data.
- Completing setup creates the household structure.

### P0 · 5 points · Manage floors, rooms, and room types

**User story:** As a household manager, I can name rooms and classify each space.

**Acceptance criteria**

- Supported types include kitchen, bathroom, living room, bedroom, dining room, office, laundry room, hallway, balcony, garden, and other.
- Rooms can be added, renamed, moved between floors, retyped, and removed.
- Existing chore assignments remain valid or prompt for reassignment.
- The home view groups rooms by floor and shows open chore counts.

### P0 · 3 points · Manage household members

**User story:** As a household manager, I can add family members or roommates.

**Acceptance criteria**

- A member has a name and relationship type.
- Members can be added, edited, and removed.
- The view shows open and completed chore counts per member.
- Removing a member leaves their chores unassigned.

## Milestone 3 — Chore management

### P0 · 5 points · Create and edit chores

**User story:** As a household member, I can create a chore with enough detail for someone to complete it.

**Acceptance criteria**

- A chore includes name, room/place, estimate, frequency, scheduled date, and optional assignee.
- Supported frequencies include daily, weekly, monthly, and one-off.
- Required fields are validated with accessible errors.
- Chores can be edited and archived.

### P0 · 3 points · Assign and reassign chores

**User story:** As a household member, I can assign work to a specific person or leave it unassigned.

**Acceptance criteria**

- Every active household member appears in the assignee picker.
- A chore can be assigned, reassigned, or unassigned.
- Assignment updates appear immediately on the shared board and planning view.
- Assignment history does not rewrite earlier completion records.

### P1 · 3 points · Add tools and supplies to chores

**User story:** As the person doing a chore, I know which tools and supplies I need.

**Acceptance criteria**

- Common options include vacuum, broom, dustpan, mop, bucket, microfiber cloth, sponge, scrub brush, cleaning spray, glass cleaner, gloves, and bin bags.
- Users can add custom items.
- Duplicate items are removed case-insensitively.
- Chore cards clearly handle the “no tools needed” state.

### P0 · 3 points · Complete and reopen chores

**User story:** As a household member, I can record that a chore was completed and correct mistakes.

**Acceptance criteria**

- Completing a chore records the completion date and completing member.
- A completed chore has a distinct accessible state.
- Reopening removes it from completion history while preserving its schedule.
- Progress counts update immediately.

### P1 · 5 points · Implement recurring chore generation

**User story:** As a household member, recurring chores appear on the correct future dates.

**Acceptance criteria**

- Daily, weekly, and monthly rules create the next occurrence without duplicating the current one.
- One-off chores do not recur.
- Completing an occurrence does not alter previous completion history.
- Schedule changes affect future occurrences according to a documented rule.

## Milestone 4 — Personal and planning views

### P0 · 3 points · Add the My tasks view

**User story:** As a household member, I can focus on chores currently assigned to me.

**Acceptance criteria**

- Chores page switches between All chores and My tasks.
- My tasks includes only chores assigned to the signed-in member.
- Personal open and completed counts are accurate.
- Reassigning a chore removes or adds it to My tasks immediately.

### P0 · 5 points · Build the weekly planning view

**User story:** As a household member, I can see planned chores grouped by day.

**Acceptance criteria**

- Planning shows Monday through Sunday for the selected week.
- Each planned chore shows name, room, estimate, assignee, and status.
- Users can navigate to the previous week, next week, and current week.
- Empty days have a clear empty state.

### P0 · 3 points · Schedule and reschedule chores

**User story:** As a household member, I can place a chore on a day and move it when plans change.

**Acceptance criteria**

- Existing chores can be scheduled from the planning view.
- A date can be changed directly from a scheduled chore.
- The chore moves to the correct week and day immediately.
- Chore creation supports an initial scheduled date.

### P1 · 3 points · Add completion history by day

**User story:** As a household member, I can see which chores were completed on each day.

**Acceptance criteria**

- Planning switches between Scheduled and Completed views.
- Completed chores are grouped by actual completion date.
- Each record shows chore, room, duration, and completing member.
- Reopened chores no longer appear as completed.

## Milestone 5 — Experience and release quality

### P1 · 3 points · Add light and dark themes

**User story:** As a user, I can choose a comfortable visual theme.

**Acceptance criteria**

- Light theme uses beige surfaces with amber accents.
- Dark theme uses charcoal surfaces with amber accents.
- A keyboard-accessible switch toggles themes without losing form input.
- The selected theme persists between sessions.

### P0 · 5 points · Meet responsive and accessibility requirements

**User story:** As a user on any device or with assistive technology, I can operate the core app.

**Acceptance criteria**

- Core flows work at 320, 736, and 1024 px widths without horizontal overflow.
- All interactive controls work by keyboard and expose accessible names and states.
- Text and controls meet WCAG AA contrast requirements in both themes.
- Dynamic updates are announced without disrupting focus.

### P1 · 5 points · Add household invitations and member identity

**User story:** As a household manager, I can invite people and each member sees their own tasks.

**Acceptance criteria**

- A household manager can create a time-limited invitation.
- Joining links a user identity to one household member.
- Access is limited to the joined household.
- Revoking membership removes future access without deleting historical completions.

### P1 · 5 points · Add automated tests and release checks

**User story:** As the product team, we can ship changes without breaking the main household flows.

**Acceptance criteria**

- Tests cover onboarding, room management, member management, chore creation, assignment, tools, completion, My tasks, planning, and theme switching.
- Accessibility checks run in CI.
- Responsive smoke tests run at mobile and desktop widths.
- The release workflow blocks on failed required checks.

## Suggested GitHub Project fields

| Field | Values |
|---|---|
| Status | Backlog, Ready, In progress, In review, Done |
| Priority | P0, P1, P2 |
| Estimate | 1, 2, 3, 5, 8 |
| Milestone | Product foundation, Household setup, Chore management, Personal and planning views, Experience and release quality |

