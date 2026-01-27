# User Flows

This document describes the primary user flows for the Mini-ATS application.
Flows are grouped by user role and focus on the core MVP experience, including key edge cases.

---

## Customer Flows

### 1. Customer Login & Landing

**Flow**

1. Customer navigates to `/login`
2. Logs in using email/password
3. Authentication is validated server-side
4. User is redirected to `/candidates` (default landing page)

**Result**

- Customer sees the kanban board with candidates
- Job filter and search are available
- Actions to add candidates and manage pipeline stages are visible

**Edge Case**

- If the user or organization is inactive, access is blocked and a message is shown indicating the account is unavailable.

---

### 2. Manage Pipeline Stages (Kanban Columns)

Pipeline stages are organization-wide and configurable.

**Flow**

1. Customer opens “Manage pipeline stages” from the candidates view
2. Customer can:
   - Add new stages
   - Rename existing stages
   - Reorder stages
   - Remove stages (with safety constraints)
3. Customer saves changes
4. Kanban board updates immediately

**Constraints**

- Pipeline stages are shared across all jobs
- Stage removal is restricted if candidates exist in that stage (or requires reassignment)

---

### 3. Add Candidate

**Flow**

1. Customer clicks “Add candidate”
2. Enters:
   - Name (required)
   - Email (optional)
   - LinkedIn URL (optional)
   - Associated job (optional)
3. Candidate is assigned to the first pipeline stage by default
4. Candidate appears on the kanban board

---

### 4. Move Candidate Between Stages

**Flow**

1. Customer moves a candidate to a new stage (drag & drop or stage selector)
2. Stage change is persisted
3. UI updates immediately

**Failure Handling**

- If the update fails, the UI reverts and an error message is shown

---

### 5. Filter Candidates

**Flow**

1. Customer selects a job from the job filter dropdown
2. Customer searches by candidate name
3. Kanban board updates client-side

**Assumption**

- Candidate volumes are small enough for client-side filtering in the MVP

---

### 6. Manage Jobs

**Flow**

1. Customer navigates to `/jobs`
2. Customer can:
   - Create new jobs
   - Edit job details
   - Close jobs (status change)
3. Jobs become available for candidate assignment and filtering

---

## Admin Flows

### 1. Admin Login & Dashboard

**Flow**

1. Admin navigates to `/login`
2. Logs in using email/password
3. Redirected to `/admin`

**Result**

- Admin sees overview information (customers, status, actions)
- Quick access to customer management

---

### 2. Create Customer Organization & User

**Flow**

1. Admin navigates to `/admin/customers`
2. Clicks “Create customer”
3. Enters:
   - Organization name
   - Customer user email
   - Customer name (optional)
4. Submits form

**System Actions**

- Organization is created
- Auth user is created
- Profile is created with role `customer`
- Default pipeline stages are seeded

**Result**

- Admin manually shares login credentials with the customer

---

### 3. Activate / Deactivate Customer Organization

**Flow**

1. Admin views customer list or customer details
2. Toggles active/inactive state

**Result**

- Inactive customers cannot log in
- Existing sessions are blocked on subsequent requests

---

### 4. Admin Acting on Behalf of Customer (Impersonation)

**Flow**

1. Admin selects a customer organization
2. Navigates to:
   - `/admin/customers/[orgId]/candidates`
   - `/admin/customers/[orgId]/jobs`
3. Admin uses the same UI as a customer, scoped to that organization

**UX Note**

- A banner indicates the active organization context
- Admin can exit impersonation at any time

---

### 5. Manage Admin Users (Optional)

**Flow**

1. Admin navigates to `/admin/admins`
2. Can:
   - Create admin users
   - Update admin details
   - Deactivate admin users (optional)

---

## Cross-Cutting Edge Cases

### Deactivated Account Access

- Login is blocked
- Clear messaging is shown
- User is instructed to contact support

### Unauthorized Route Access

- Customers attempting to access `/admin` are redirected
- Admins attempting to access customer-only routes are redirected to `/admin`

---

## Role Capabilities Summary

### Customer

- Log in
- Manage jobs
- Manage candidates
- Move candidates across stages
- Manage pipeline stages (organization-wide)
- Filter candidates

### Admin

- Perform all customer actions
- Create and manage organizations
- Activate / deactivate organizations
- Act on behalf of customers
- Manage admin users (optional)

---
