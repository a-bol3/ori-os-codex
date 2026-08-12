# FOLGA Recruitment Expansion

## Scenario key

- `scenarioKey`: `folga_recruitment_expansion`
- `scenarioName`: `FOLGA Recruitment Expansion`
- `sector`: Recruitment / HR
- `region`: Torun, Poland
- `businessModel`: B2B recruitment operations

## Business context

FOLGA is used as the first canonical CRM reference scenario for ORI-OS.

The company is preparing a structured expansion of its recruitment operations and needs:

- shared CRM visibility across employer opportunities;
- contact-level ownership and follow-up history;
- clearer qualification and proposal progression;
- operational notes, tasks, and auditability;
- a dashboard that reflects real pipeline movement instead of placeholders.

## Reference entities

### Company

- `FOLGA SP. Z O.O.`
- domain: `folga.com.pl`
- industry: `HR`
- city: `Torun`
- country: `Poland`

### Contacts

- `Anna Kowalska` — HR Manager — primary business contact
- `Marek Zielinski` — Operations Director — secondary stakeholder for rollout alignment

### Deal

- `Folga Expansion Rollout`
- linked to FOLGA
- primary contact: Anna Kowalska
- target stage: `Qualified`
- target value: `18,000 USD`

## Expected operational trail

The scenario should produce:

- one real company account;
- at least two linked contacts;
- one deal with a believable commercial name;
- pending and completed tasks;
- discovery/qualification notes;
- a call activity;
- a meeting activity;
- audit records for company, contact, deal, task, and note changes where supported.

## Expected dashboard consequences

This scenario should affect:

- total contacts;
- total companies;
- total open deals;
- deal value summary;
- recent activity feed;
- CRM module summary blocks.

## Acceptance checklist

The scenario is considered healthy when:

- Companies shows FOLGA with realistic linked counts;
- Contacts shows Anna and Marek with correct company links;
- Deals shows `Folga Expansion Rollout` without timestamp noise;
- the deal is linked to a contact and a company;
- the company detail modal shows linked contacts and linked deals;
- the deal detail modal shows tasks, notes, and activity;
- the dashboard reflects real counts and recent activity;
- no silent demo fallback is needed to understand this case.

## Why this scenario matters

FOLGA is not just sample data.

It is the first proof that ORI-OS can represent a coherent customer journey across CRM surfaces and that future features should be validated against realistic operational narratives rather than disconnected placeholders.
