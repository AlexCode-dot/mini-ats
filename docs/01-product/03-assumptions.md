# Assumptions & Scope Decisions

This document describes decisions and assumptions made where the assignment left room for interpretation.
The goal was to ship a realistic, usable MVP as quickly as possible while keeping the system extensible.

---

## 1. Multi-Tenancy via Organizations

**Not specified in brief**  
The assignment mentions “customers” but does not define how data separation should work.

**Decision**  
Introduce an explicit `Organization` concept.
All jobs and candidates belong to an organization, and users are scoped to one organization.

**Why**

- Prevents data leakage between customers
- Reflects how real ATS products are structured
- Keeps authorization logic clear and secure

---

## 2. Admin Role & Impersonation

**Not specified in brief**  
Admins are said to “do everything customers can do”, but how this works is undefined.

**Decision**  
Admins can select an organization and manage jobs and candidates on behalf of that customer using the same UI.

**Why**

- Avoids duplicating customer/admin interfaces
- Mirrors real operational workflows (support, onboarding)
- Reduces implementation complexity

---

## 3. Configurable Candidate Pipeline Stages

**Not specified in brief**  
The assignment does not define whether recruitment pipeline stages are fixed or configurable.

**Decision**  
Allow customers to manage their recruitment pipeline stages, including:

- Adding new stages
- Renaming stages
- Reordering stages
- Removing stages with safety constraints

Pipeline stages are defined per organization and shared across jobs in the MVP.

**Why**

- Recruitment processes vary significantly between companies
- Pipeline flexibility is core value in an ATS product
- A constrained, organization-wide pipeline avoids unnecessary complexity
- Provides flexibility without introducing per-job pipelines or advanced configuration

---

## 4. Job-Centric Candidate Ownership

**Not specified in brief**  
It is unclear whether candidates exist independently or must belong to a job.

**Decision**  
Candidates are primarily associated with a job, but the model allows job-less candidates if needed.

**Why**

- Keeps kanban views relevant and focused
- Matches how early-stage ATS users think (“candidates for a job”)
- Leaves room for a shared talent pool later

---

## 5. User Account Creation Flow

**Not specified in brief**  
How customer accounts are created is not described.

**Decision**  
Admins create customer accounts directly from the admin interface.

**Why**

- Simplifies onboarding in an early-stage product
- Avoids building invitation or self-signup flows
- Fits a controlled first-customer rollout

---

## 6. Candidate Filtering Strategy

**Not specified in brief**  
Filtering behavior and scale are not described.

**Decision**  
Filtering by job and candidate name is handled client-side.

**Why**

- Improves perceived UI responsiveness
- Reduces backend complexity for the MVP
- Assumes relatively small candidate volumes initially

---

## 7. Authentication Method

**Not specified in brief**  
The authentication method is not defined.

**Decision**  
Use email/password authentication via Supabase Auth.

**Why**

- Fastest reliable authentication method
- Well-supported by Supabase
- Suitable for internal and B2B tools

---

## 8. Minimal Candidate Profile Fields

**Not specified in brief**  
The brief mentions “profile information” but does not define scope.

**Decision**  
Limit candidate profiles to:

- Name
- Email (optional)
- LinkedIn URL (optional)

**Why**

- Keeps data entry fast
- Avoids premature complexity
- Focuses on the kanban workflow

---

## 9. AI-Assisted Development

**Explicitly encouraged in brief**

**Decision**  
AI tools (Lovable, Cursor, Codex) are used throughout development.

**Why**

- Enables rapid iteration within a one-week deadline
- Reflects modern development workflows
- Allows more focus on product decisions and architecture

## 10. Pipeline Configuration Scope

Pipeline configuration is intentionally limited to an organization-wide definition in the MVP.
Per-job pipelines, conditional stages, and historical pipeline versions are out of scope.

## 11. Deletion & Data Safety

To prevent accidental data loss, destructive actions in the MVP use soft deletion or status-based removal rather than hard deletes.

Jobs are closed rather than deleted.
Candidates can be archived.
Pipeline stages can only be removed if they are empty or after reassignment.
Archived candidates can be purged later with a scheduled cleanup (out of scope for the MVP).
