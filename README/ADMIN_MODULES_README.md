# Admin Modules - Implementation Notes (Member, Access, Team)

Date: 2025-09-16

## Overview
This document summarizes the changes implemented for the Admin Console today across:
- Member Management (CRUD + UX)
- Access Management (RBAC assignment for Admin Console access)
- Team Management (team list, member counts, per-team roster view)
- Backing API routes (Next.js App Router) using Supabase service role

All endpoints are server-side API routes that use `supabaseAdmin` (service role) to temporarily bypass RLS until final policies are defined.

## API Endpoints

### Members
- GET `/api/members`
  - Returns members with joined team name
  - Supports optional filter: `?team_id=<uuid>`
  - Example: `/api/members?team_id=00000000-0000-0000-0000-000000000000`
- POST `/api/members`
  - Creates a new member
  - Required body fields: `first_name, last_name, email, phone, team_id, role`
  - Optional: `date_of_birth, gender`
- GET `/api/members/[id]`
  - Returns a single member (with joined team name)
- PUT `/api/members/[id]`
  - Updates a member (any subset of updatable fields)
- DELETE `/api/members/[id]`
  - Deletes a member

Data shape (subset):
```
{
  id,
  first_name,
  last_name,
  email,
  phone,
  team_id,
  role,               // cricket role: member/coach/manager/captain/vice_captain
  date_of_birth,
  gender,
  teams: { name },    // joined from teams
}
```

### Teams
- GET `/api/teams`
  - Returns `id, name` (and any available fields). The UI then fetches member counts via `/api/members?team_id=...`.

### Access (RBAC)
- GET `/api/access`
  - Returns list of members with their current Admin Console RBAC role (admin/editor/viewer/none)
  - Derives role from `users.role`; if not found, role is `none`
- POST `/api/access`
  - Body: `{ email: string, role: 'admin'|'editor'|'viewer'|'none', name?: string }`
  - Sets RBAC for the given email in `users` table; `role='none'` clears role

Returned item (subset):
```
{
  member_id,
  name,
  email,
  team,         // team name
  rbac_role,    // admin/editor/viewer/none
  member_role,  // cricket role from members.role
}
```

## UI Wiring

### Member Management
- File: `src/app/admin/members/page.tsx`
  - Loads members via GET `/api/members`
  - Loads teams via GET `/api/teams`
  - Delete action calls DELETE `/api/members/[id]`
  - Added UX:
    - Toast notifications (success/error)
    - Loading panel while fetching
    - Empty state with “Add Member” CTA

- File: `src/app/admin/members/new/page.tsx`
  - Loads teams via GET `/api/teams`
  - Submits new member via POST `/api/members`
  - Client-side validation and submit loading state

- File: `src/app/admin/members/[id]/edit/page.tsx`
  - Loads teams via GET `/api/teams`
  - Loads member via GET `/api/members/[id]`
  - Saves updates via PUT `/api/members/[id]`
  - Toast notifications for success/error

### Access Management (renamed in UI from “User Management”)
- Dashboard label and page header updated to “Access Management”
  - Files:
    - `src/app/admin/page.tsx` (card title/description)
    - `src/app/admin/users/page.tsx` (header and table labels)
- File: `src/app/admin/users/page.tsx`
  - Fetches access assignments via GET `/api/access`
  - Role dropdown posts to `/api/access` and reloads table
  - Toasts + loading panel added

### Team Management
- File: `src/app/admin/teams/page.tsx`
  - Loads teams via GET `/api/teams`
  - For each team, loads member count via GET `/api/members?team_id=<uuid>`
  - Displays “View Members” link per team
- File: `src/app/admin/teams/[id]/members/page.tsx`
  - Displays members of a given team via GET `/api/members?team_id=<uuid>`
  - Loading and empty states included

## Authorization Model (current)
- Admin Console access is granted via `users.role` (RBAC): admin/editor/viewer
- Members’ cricket role (`members.role`) is separate from RBAC
- Access Management assigns RBAC to emails present in the `members` table

## Notes & Next Steps
- Current endpoints use `supabaseAdmin` (service role) temporarily due to RLS. Once RLS policies are finalized, we can move reads to anon client (where safe) and keep writes server-side.
- Next module: Expense Management
  - Create `expenses` table
  - Build endpoints for dues/expenses
  - Add reporting and UI
- RLS: finalize read/write policies for `teams`, `members`, `users`

## Quick Test Guide
- Members
  - Add: Admin → Member Management → Add Member → submit
  - Edit: List → Edit → save
  - Delete: List → Delete → confirm
- Access
  - Admin → Access Management → change a member’s access → toast success → (optionally test login)
- Teams
  - Admin → Team Management → verify counts → View Members per team

## Files Touched Today (key ones)
- API: `src/app/api/members/*`, `src/app/api/teams/route.ts`, `src/app/api/access/route.ts`
- UI: members (list/new/edit), access page, teams (list) and team members view
- Admin dashboard card labels

---
These changes are live in the codebase and ready for continued work on Expense Management and RLS.
