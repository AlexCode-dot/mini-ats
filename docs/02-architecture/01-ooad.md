# Domain Model (OOAD)

## Domain Concepts

### Organization

Represents a customer company using the ATS.

- Owns jobs and candidates
- Users belong to exactly one organization

### User (Profile)

Represents an authenticated user.

- Linked to Supabase Auth user
- Has a role: `admin` or `customer`
- Belongs to an organization (admins may access all)

### Job

Represents an open or closed position.

- Belongs to an organization
- Has many candidates

### Candidate

Represents an applicant.

- Belongs to an organization
- Optionally linked to a job
- References a pipeline stage

## Candidate Pipeline Stages

Pipeline stages are configurable per organization.

Each stage:

- Belongs to an organization
- Has a name and position (order)
- May represent terminal states (e.g. hired, rejected)

Candidates reference a pipeline stage rather than a fixed enum.

## Relationships

- Organization → Users (1:N)
- Organization → Jobs (1:N)
- Organization → Candidates (1:N)
- Job → Candidates (1:N)
