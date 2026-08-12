# ORI-OS Reference Scenario Strategy

## Purpose

ORI-OS should not evolve with random placeholder content, disconnected demo entities, or visually attractive but functionally empty records.

From this point onward, every meaningful record we add while polishing the product should belong to a **reference scenario** that behaves like a real business case.

These scenarios serve five purposes at once:

1. validate end-to-end functionality;
2. provide realistic product demos;
3. reveal data-model gaps early;
4. act as implementation guides for future customer use cases;
5. prevent silent regressions back into fake UI behavior.

## Core rule

Any new contact, company, deal, campaign, workflow, page, notification, metric, or activity introduced during product hardening must satisfy at least one of these:

- it is **real production data** created by a real user;
- it belongs to an explicitly defined **reference scenario**;
- it is a **development-only fixture** that is visibly isolated from staging/production.

Silent fake production data is not allowed.

## What a reference scenario is

A reference scenario is a coherent business narrative with linked records across modules.

It is not just a company row and one contact. It should describe:

- the type of organization;
- its business context;
- the actors involved;
- the CRM relationship structure;
- the operational events that happen over time;
- the expected dashboard and analytics consequences.

## Required scenario shape

Every reference scenario should define:

- organization/workspace context;
- at least one company;
- at least one primary contact;
- at least one business objective;
- at least one pipeline journey or commercial state;
- at least one activity trail;
- expected dashboard impact;
- expected linked-module expansion path.

## Reference scenario template

Use this structure whenever we add or formalize a new scenario:

### 1. Scenario identity

- `scenarioKey`: stable machine key
- `scenarioName`: human-readable label
- `sector`: business sector
- `region`: country/city or market
- `businessModel`: B2B SaaS, recruiting, logistics, agency, etc.

### 2. Commercial context

- what problem the company is trying to solve;
- why they entered ORI-OS;
- expected value for sales, marketing, recruiting, SEO, or automation.

### 3. CRM entities

- company profile;
- contacts and their roles;
- deal(s), value, stage, probability;
- tasks, notes, audit trail;
- relationship between company, contact, and deal.

### 4. Operational activity

- timeline of realistic activities;
- changes that should appear in Activity Feed;
- events that should affect dashboard cards and summaries.

### 5. Cross-module expansion

- engagement campaign opportunities;
- automation triggers;
- analytics expectations;
- SEO/content opportunities;
- billing or usage implications when relevant.

### 6. Acceptance expectations

- what should be visible in Companies;
- what should be visible in Contacts;
- what should be visible in Deals;
- what should be visible in Dashboard;
- what should be visible in Activity/Audit.

## Initial scenario packs we should build

These are the priority scenario families for ORI-OS:

### Pack A — CRM foundation

1. `folga_recruitment_expansion`
   - recruitment company
   - one real expansion opportunity
   - contact, company, deal, task, note, activity trail

2. `b2b_saas_midmarket_pipeline`
   - SaaS company
   - multi-contact sales cycle
   - qualification -> proposal -> negotiation

3. `agency_multi_client_ops`
   - services company
   - multiple contacts under one account
   - repeated tasks and follow-ups

### Pack B — Engagement + Deliverability

4. `outbound_sequence_launch`
   - sender, mailbox, audience segment, campaign start, opens, replies

5. `deliverability_recovery_case`
   - bounce/complaint/reputation scenario with operational recommendations

### Pack C — Intelligence + Automation

6. `lead_enrichment_and_scoring`
   - incomplete lead -> enriched profile -> score update -> follow-up task

7. `workflow_reengagement_trigger`
   - inactivity rule -> workflow execution -> activity log -> CRM outcome

### Pack D — SEO + Content

8. `content_pipeline_from_keyword_to_publish`
   - keyword -> brief -> asset -> approval -> publication -> result

## Rules for implementation

### Rule 1 — Stable identifiers

Reference scenarios should use stable keys so seeds are idempotent and testable.

### Rule 2 — Human realism

Names, domains, job titles, deal values, industries, and activity descriptions must feel operationally believable.

### Rule 3 — Cross-linking by design

If a scenario creates a company and a contact, they should be linked.

If it creates a deal, it should be linked to a company and ideally a contact.

If it creates activity, tasks, or notes, they should point back to those entities.

### Rule 4 — Dashboard consequences

Every scenario should have a predictable effect on:

- total contacts;
- total companies;
- active deal count/value;
- recent activity;
- module summary blocks.

### Rule 5 — Production discipline

Production should never auto-seed a broad fake dataset.

Production bootstrapping should be minimal, intentional, and safe:

- admin account;
- organization bootstrap;
- only explicit reference records when intentionally approved.

### Rule 6 — Environment separation

- `development`: may include broader scenario packs;
- `staging`: should include curated reference scenarios only;
- `production`: should contain real tenant data, plus only explicitly approved bootstrap/reference records.

## Immediate application to current CRM work

The current FOLGA case should be treated as the first formal scenario:

- company: `FOLGA SP. Z O.O.`
- contact: `Anna Kowalska`
- deal: `Folga Expansion`
- future additions:
  - follow-up tasks;
  - note history;
  - status progression across stages;
  - dashboard reflection;
  - activity and audit visibility.

This scenario should become the canonical CRM walkthrough for Block 1.

## Engineering workflow from now on

For each module we harden:

1. define or extend a reference scenario;
2. create or update linked records;
3. verify UI, API, and database against that scenario;
4. check dashboard and activity consequences;
5. document what that scenario is proving.

## Exit criterion

A module is not “real” just because it renders.

It becomes real when a reference scenario can pass through it coherently and leave valid state behind.
