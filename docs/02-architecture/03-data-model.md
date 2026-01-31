# Data Model

## organizations

- id (uuid, pk)
- name (text)
- is_active (boolean)
- created_at (timestamp)

## profiles

- id (uuid, pk, matches auth.users.id)
- org_id (uuid, fk → organizations.id)
- role (text: admin | customer)
- full_name (text)
- is_active (boolean)
- created_at (timestamp)

## jobs

- id (uuid, pk)
- org_id (uuid, fk)
- title (text)
- status (text: open | closed)
- job_url (text, nullable)
- created_at (timestamp)

## candidates

- id (uuid, pk)
- org_id (uuid, fk)
- job_id (uuid, fk, nullable)
- name (text)
- email (text, nullable)
- linkedin_url (text, nullable)
- stage_id (uuid, fk → pipeline_stages.id)
- is_archived (boolean, default false)
- created_at (timestamp)

## pipeline_stages

- id (uuid, pk)
- org_id (uuid, fk → organizations.id)
- name (text)
- position (int)
- is_terminal (boolean)
- created_at (timestamp)

## Indexes

- candidates(org_id)
- candidates(org_id, job_id)
- candidates(org_id, stage)
