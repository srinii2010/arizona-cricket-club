# ACC Admin: Member Management & Access Management

## What’s done so far

- Guest-facing ACC site created and deployed to Vercel; Supabase used for database.
- Admin Console entry point added on the main page; only authorized users can access it.
- Admin Console sections (navigation implemented on dashboard):
  - Member Management
  - Access Management (currently labeled “User Management” in UI; to be renamed)
  - Team Management
  - Expense Management
- Authentication working via Google OAuth (NextAuth). Temporary email-based authorization in place for testing.
- Member Management page loads with mock data (while DB integration is finalized). UI supports:
  - List, search, and filter members
  - Start new member flow (`/admin/members/new`)
  - Edit/delete actions (UI present)

## Terminology

- Member role (cricket role, stored in `members.role`): member, coach, manager, captain, vice_captain
- RBAC role (system access): admin, editor, viewer (controls access to Admin Console)

## Goals and behavior

### Member Management
- Add / Delete / Update / View members
- Fields
  - Mandatory: First Name, Last Name, Phone, Email, Team, Role (default `member`; options: coach, manager, captain, vice_captain)
  - Optional: DOB, Gender
  - Team dropdown values: Vipers, Rattlers (extendable to Black Mambas, Cobras)
- Permissions
  - Admin: add/edit/delete/view
  - Editor: edit/view
  - Viewer: view
- Notes
  - Member “role” here is the cricket/team role (not RBAC)

### Access Management (rename of User Management)
- Purpose: assign Admin Console access levels (RBAC) to people
- Source of truth for people: members created in Member Management
- Behavior
  - Select a member and assign RBAC: admin, editor, viewer, or none
  - Only members with RBAC of admin/editor/viewer can access the Admin Console
  - By default, every member’s RBAC access is “none” until granted here

### Team Management (dependent on Member Management)
- View team rosters based on the team assigned in Member Management
- Future: team-level summaries, captains, vice captains, etc.

### Expense Management (later)
- Track dues/expenses and payment status (to be implemented after Member/Access)

## Database: current understanding

- Tables present: users, user_roles, teams (empty, RLS blocks), members (empty, RLS blocks)
- To create next: expenses
- RLS policies need adjustment on teams/members before full integration

## Next steps (implementation plan)

1) Member Management (DB integration)
- Wire list view to Supabase `members` (join `teams` for team name)
- Implement create (form submit → insert), edit, delete
- Validation (email unique, required fields)
- Filters: by team, by member cricket role

2) Access Management (rename + RBAC wiring)
- Rename UI label “User Management” → “Access Management” (dashboard and page header)
- Show members and their current RBAC (admin/editor/viewer/none)
- Implement set/change RBAC for a member (persist to `users` or a dedicated access table)
- Authorization check on login: email → RBAC lookup → allow/deny Admin Console

3) Team Management (read-only first)
- List teams
- For each team, list members from `members` filtered by `team_id`

4) Hardening & polish
- Toasts for success/error
- Loading/empty states
- Basic audit fields: created_at/updated_at on writes

5) Follow-ups (after the above)
- Expense Management (dues, expenses, reports)
- RLS: finalize read/write policies for all admin operations

## UI tasks checklist

- Rename “User Management” to “Access Management” in:
  - Dashboard card title and description
  - Page header title
- Member Management
  - Replace mock data with live queries
  - Implement create/edit/delete with proper validation
- Access Management
  - Member list with RBAC selector (admin/editor/viewer/none)
  - Persist changes; reflect on login authorization
- Team Management
  - Team roster views driven by `members.team_id`

## Acceptance criteria

- Only members granted admin/editor/viewer in Access Management can log into the Admin Console
- Member Management supports complete CRUD with validation
- Team Management shows accurate rosters from Member records
- No mock data paths remain for these modules

## Notes for deployment

- Ensure environment variables are set (NextAuth + Supabase)
- Verify RLS policies allow Admin Console operations (or use service role on server-side calls)
- Seed teams before enabling member creation in production
