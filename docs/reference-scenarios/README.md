# Reference scenarios

This folder defines the canonical, real-world scenario packs that ORI-OS uses
to validate product behaviour across CRM and adjacent modules.

## Why this exists

ORI-OS should not drift back into silent placeholder data. Every seeded or
demonstrated record must either be:

- real customer production data;
- an explicit reference scenario approved for development/staging; or
- a clearly labelled dev-only fixture.

## Current canonical scenario

- `FOLGA_RECRUITMENT_EXPANSION.md` — first CRM reference scenario for company,
  contacts, deal progression, tasks, activity feed, and audit trail.

## Source of truth

- Scenario narrative and acceptance expectations live in this folder.
- Scenario bootstrap data for local/dev/staging lives in:
  [packages/db/prisma/reference-scenarios.ts](C:\dev\ORI-OS-PROJECTS\ORI-OS2.0\packages\db\prisma\reference-scenarios.ts)
- Production backfill / normalization scripts live in:
  [scripts/reference-scenarios](C:\dev\ORI-OS-PROJECTS\ORI-OS2.0\scripts\reference-scenarios)

## How to add the next scenario

1. Write the business story first in this folder.
2. Add the structured seed pack in `packages/db/prisma/reference-scenarios.ts`.
3. Link every entity end-to-end:
   - company
   - contacts
   - pipeline/deal
   - tasks
   - activities
   - audit log
4. Verify the scenario appears coherently in:
   - Dashboard
   - Companies
   - Contacts
   - Deals
   - Activity feed
5. If production already contains partial records, add a normalization SQL script
   under `scripts/reference-scenarios/` instead of manually patching rows.

## Minimum bar for a valid scenario

- No anonymous placeholder names
- No disconnected contacts
- No fake lorem activity
- No ambiguous ownership
- At least one measurable business outcome visible in the dashboard
