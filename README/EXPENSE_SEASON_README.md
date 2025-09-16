# Expense Management & Season Management - Requirements

Date: 2025-09-16

## Overview
This document outlines the requirements for the Expense Management and Season Management modules in the Admin Console. These modules handle member dues, general expenses, and tournament season tracking.

## Season Management

### Purpose
Track different tournament formats for each year and associate them with expenses.

### Data Structure
- **Year** (e.g., 2025)
- **Tournament Formats** (T20Platinum, T40DivA, T40DivB, etc.)
- **Multiple formats** can exist per year
- **Status** (Active/Inactive)

### CRUD Operations
- Create new season with formats
- View all seasons and their formats
- Edit existing seasons
- Delete seasons (with validation)

### UI Features
- Season list with year and format count
- Add/Edit season form
- Format management within seasons
- Status toggle (Active/Inactive)

## Expense Management

### 1. Member Dues Management

#### Purpose
Track individual member dues based on tournament formats they play.

#### Key Features
- **Member Selection**: Members are selected from the existing Member Management list
- **Format Assignment**: Each member can be assigned to multiple tournament formats for a year
- **Dues Calculation**: Manual entry of dues amount per member per format
- **Itemized Tracking**: Shows breakdown by format, extra items, adjustments
- **Payment Status**: Track if dues are settled or pending
- **Due Date**: Deadline for payment
- **Email Notifications**: Send due reminders via email
- **Comments**: Track discrepancies and notes

#### Data Structure per Member
```
{
  member_id,           // Reference to members table
  member_name,         // From members table
  email,              // From members table
  phone,              // From members table
  year,               // Season year
  tournament_formats, // Array of format IDs
  season_dues,        // Base dues amount
  extra_jersey_dues,  // Jersey costs
  extra_trouser_dues, // Trouser costs
  credit_adjustment,  // Default: 0
  total_dues,         // Calculated total
  due_date,           // Payment deadline
  payment_status,     // Paid/Not Paid
  settlement_date,    // When paid
  comments            // Notes/discrepancies
}
```

#### UI Views
- **Yearly Overview**: All members with total dues for selected year
- **Member Detail**: Itemized breakdown when clicking on individual member
- **Summary**: Total dues across all members for the year
- **Email Reminders**: Send due date reminders

### 2. General Expenses Management

#### Purpose
Track non-dues expenses (umpire, equipment, storage, etc.).

#### Key Features
- **Expense Categories**: Umpire, Equipment, Storage, LiveStream, Mat, Food, Others
- **Format Association**: Can be associated with specific Year/Format or all formats
- **Payment Tracking**: Track who paid what amount
- **Settlement Tracking**: What ACC owes to members or vice versa
- **Yearly Summary**: Total general expenses for the year
- **Comments**: Track notes and discrepancies

#### Data Structure
```
{
  id,
  year,                    // Season year
  tournament_format_id,    // Optional - specific format or null for all
  category,               // Umpire, Equipment, Storage, LiveStream, Mat, Food, Others
  description,            // Required if category is "Others"
  amount,                 // Expense amount
  paid_by_member_id,      // Reference to members table
  paid_by_member_name,    // From members table
  paid_by_email,          // From members table
  paid_by_phone,          // From members table
  settlement_status,      // Settled/Not Settled
  settlement_date,        // When settled
  comments                // Notes/discrepancies
}
```

#### Expense Categories
- **Umpire**: Umpire fees and related costs
- **Equipment**: Balls, bats, protective gear, etc.
- **Storage**: Storage facility costs
- **LiveStream**: Live streaming equipment and services
- **Mat**: Matting and ground preparation
- **Food**: Food and beverage expenses
- **Others**: Custom category with description

#### UI Views
- **Expense List**: All expenses with filters by year/format/category
- **Add/Edit Expense**: Form with category dropdown and member selection
- **Settlement Tracking**: Mark expenses as settled
- **Reports**: Yearly summaries and totals

## Database Tables

### New Tables Needed
1. **`seasons`**
   - `id` (UUID, Primary Key)
   - `year` (Integer)
   - `name` (String, e.g., "2025 Season")
   - `status` (String: Active/Inactive)
   - `created_at`, `updated_at`

2. **`tournament_formats`**
   - `id` (UUID, Primary Key)
   - `season_id` (UUID, Foreign Key to seasons)
   - `name` (String, e.g., "T20Platinum", "T40DivA")
   - `description` (String, optional)
   - `created_at`, `updated_at`

3. **`member_dues`**
   - `id` (UUID, Primary Key)
   - `member_id` (UUID, Foreign Key to members)
   - `year` (Integer)
   - `tournament_format_ids` (Array of UUIDs)
   - `season_dues` (Decimal)
   - `extra_jersey_dues` (Decimal, default 0)
   - `extra_trouser_dues` (Decimal, default 0)
   - `credit_adjustment` (Decimal, default 0)
   - `total_dues` (Decimal, calculated)
   - `due_date` (Date)
   - `payment_status` (String: Paid/Not Paid)
   - `settlement_date` (Date, nullable)
   - `comments` (Text, nullable)
   - `created_at`, `updated_at`

4. **`general_expenses`**
   - `id` (UUID, Primary Key)
   - `year` (Integer)
   - `tournament_format_id` (UUID, Foreign Key to tournament_formats, nullable)
   - `category` (String: Umpire/Equipment/Storage/LiveStream/Mat/Food/Others)
   - `description` (String, required if category is "Others")
   - `amount` (Decimal)
   - `paid_by_member_id` (UUID, Foreign Key to members)
   - `settlement_status` (String: Settled/Not Settled)
   - `settlement_date` (Date, nullable)
   - `comments` (Text, nullable)
   - `created_at`, `updated_at`

5. **`due_reminders`**
   - `id` (UUID, Primary Key)
   - `member_dues_id` (UUID, Foreign Key to member_dues)
   - `reminder_date` (Date)
   - `sent_at` (Date, nullable)
   - `status` (String: Pending/Sent/Failed)
   - `created_at`

## API Endpoints

### Seasons
- `GET /api/seasons` - List all seasons
- `POST /api/seasons` - Create new season
- `GET /api/seasons/[id]` - Get season details
- `PUT /api/seasons/[id]` - Update season
- `DELETE /api/seasons/[id]` - Delete season

### Tournament Formats
- `GET /api/tournament-formats` - List formats (optionally filtered by season)
- `POST /api/tournament-formats` - Create new format
- `PUT /api/tournament-formats/[id]` - Update format
- `DELETE /api/tournament-formats/[id]` - Delete format

### Member Dues
- `GET /api/member-dues` - List dues (optionally filtered by year/member)
- `POST /api/member-dues` - Create new dues entry
- `GET /api/member-dues/[id]` - Get dues details
- `PUT /api/member-dues/[id]` - Update dues
- `DELETE /api/member-dues/[id]` - Delete dues
- `POST /api/member-dues/[id]/settle` - Mark as settled
- `POST /api/member-dues/send-reminders` - Send due date reminders

### General Expenses
- `GET /api/general-expenses` - List expenses (optionally filtered by year/format/category)
- `POST /api/general-expenses` - Create new expense
- `GET /api/general-expenses/[id]` - Get expense details
- `PUT /api/general-expenses/[id]` - Update expense
- `DELETE /api/general-expenses/[id]` - Delete expense
- `POST /api/general-expenses/[id]/settle` - Mark as settled

## UI Components

### Season Management
- Season list page
- Add/Edit season form
- Format management within seasons

### Member Dues
- Yearly dues overview
- Member dues detail view
- Add/Edit dues form
- Settlement tracking
- Email reminder system

### General Expenses
- Expense list with filters
- Add/Edit expense form
- Settlement tracking
- Category-based reporting

## Next Steps
1. Create database tables
2. Implement API endpoints
3. Build UI components
4. Add email notification system
5. Implement reporting features

---
This system will provide comprehensive expense tracking and season management for the ACC website.
