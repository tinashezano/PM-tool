# PRD: PM-Tool — Automated Client Onboarding & Sales Workflow

**Status:** Draft for review
**Owner:** Tinashe Zano
**Last updated:** 2026-09-18

## 1. Summary

PM-Tool is a practice management application for an accounting firm. This
PRD defines the end-to-end automated sales-to-onboarding workflow the app
must support, from a website lead enquiry through to a signed client with
active work items in PM-Tool.

The workflow is adapted from a reference diagram (see Appendix A) that used
Typeform/Mailchimp/Calendly/Zoom/GoProposal/Karbon. This version replaces
those tools with the stack the firm has already standardized on:
**Google Workspace, Gamma, and QuickBooks**, feeding into **PM-Tool** itself
as the system of record for clients and work.

## 2. Goals

- Eliminate manual re-entry of a lead's details across email, calendar,
  proposal, invoicing, and client records.
- Cut the time from "lead submits enquiry" to "work item assigned and
  started" from (baseline: manual, ~2-5 business days) to under 1 business
  day of elapsed *process* time (excluding time waiting on the prospect).
- Give the firm a single source of truth (PM-Tool) for client status,
  regardless of which tool originated the data.
- Make every step auditable: who/what created each record, and when.

### Non-goals (v1)

- Replacing QuickBooks as the accounting/invoicing ledger.
- Replacing Gamma as the proposal-authoring tool.
- Building a marketing/email nurture sequence engine (Google Workspace
  handles the single "we received your enquiry" email only, not drip
  campaigns).

## 3. Target workflow

| # | Step | Tool(s) | Trigger → Action |
|---|------|---------|-------------------|
| 1 | Lead submits enquiry | Website enquiry form *(tool TBD — see Open Questions)* | Form submission → lead record created |
| 2 | Automated acknowledgement email sent to prospect | Google Workspace (Gmail / Apps Script) | New lead → templated email sent from firm mailbox |
| 3 | Discovery call booked | Google Calendar | Prospect books a slot → calendar event created, both parties invited |
| 4 | Discovery meeting held | Google Meet | Calendar event fires → Meet link auto-attached; call happens |
| 5 | Proposal sent | Gamma (proposal built from a firm template) | Partner/rep marks lead "qualified" → Gamma proposal generated from template and sent |
| 6 | Invoice created | QuickBooks | Proposal accepted/signed → invoice generated in QuickBooks |
| 7 | Client created | **PM-Tool** | QuickBooks invoice (or "proposal signed" event) → Contact/Lead in PM-Tool converted to a **Client** record |
| 8 | Work items created | **PM-Tool** | Client created → matching engagement template applied → **Work Items/Tasks** created, assignee notified, work begins |

```
Lead visits site
      │
      ▼
 ┌─────────┐     ┌───────────────┐     ┌────────────────┐     ┌───────────────┐
 │ 1. Form │ ──▶ │ 2. Gmail email │ ──▶ │ 3. Google      │ ──▶ │ 4. Google Meet │
 │ enquiry │     │ (Workspace)    │     │    Calendar    │     │   discovery    │
 └─────────┘     └───────────────┘     │    booking     │     │   meeting      │
                                        └────────────────┘     └───────┬────────┘
                                                                        │
                                                                        ▼
 ┌───────────────┐     ┌────────────────┐     ┌────────────────┐     ┌───────────────┐
 │ 8. Work items │ ◀── │ 7. Client      │ ◀── │ 6. Invoice     │ ◀── │ 5. Proposal   │
 │  created in   │     │  created in    │     │  created in    │     │  sent via     │
 │  PM-Tool      │     │  PM-Tool       │     │  QuickBooks    │     │  Gamma        │
 └───────────────┘     └────────────────┘     └────────────────┘     └───────────────┘
```

## 4. In scope for PM-Tool (this app)

PM-Tool does not need to *host* steps 1-6 — those live in Google Workspace,
Gamma, and QuickBooks. What PM-Tool must build:

### 4.1 Lead/Contact intake

- API endpoint / integration receiving the lead payload (from the website
  form or an automation platform such as Zapier/Make) and creating a
  **Lead** record: name, email, phone, enquiry notes, source, timestamp.
- Lead status field: `New → Discovery Booked → Discovery Held → Proposal
  Sent → Won (Client) → Lost`.
- Link the discovery call (Google Calendar event ID / Meet link) to the
  Lead for reference.
- Link the Gamma proposal (URL) and QuickBooks invoice (ID/URL) to the Lead.

### 4.2 Client conversion

- A trigger (QuickBooks webhook on invoice creation/payment, or a manual
  "Mark Won" action as a fallback) converts a Lead into a **Client**,
  preserving all linked history (proposal, invoice, call notes).
- Client record: contact details, billing details (synced/linked from
  QuickBooks, not duplicated as the source of truth), status (active/
  inactive), assigned account manager.

### 4.3 Work item / engagement templates

- Template library: reusable sets of tasks per service line (e.g.
  "Annual Accounts + Tax Return", "Bookkeeping - Monthly", "VAT Return").
- On client creation, the correct template is selected (manually or by a
  service-type field carried over from the proposal) and instantiated into
  real **Work Items** with due dates, assignees, and checklists.
- Work Items support: status, due date, assignee, checklist/sub-tasks,
  file attachments, comments.

### 4.4 Notifications

- Assignee is notified (in-app + email) when a Work Item is created or
  assigned to them.
- Client-facing task requests (e.g. "please upload your bank statements")
  can be sent from a Work Item — channel TBD (email via Google Workspace,
  or an in-app client portal in a later phase).

### 4.5 Integration layer

- Inbound webhook receiver(s) for:
  - QuickBooks (invoice created/paid) → drives step 7.
  - Lead source (website form or automation platform) → drives step 1
    intake.
- Outbound calls/links to:
  - Gamma (deep link to the proposal for reference; Gamma remains
    source of truth for the proposal document itself).
  - Google Calendar/Meet (store event ID and Meet link; no need to manage
    scheduling logic in PM-Tool for v1).
- Recommend **Zapier or Make** as the interim automation glue between
  Google Workspace / Google Calendar / Gamma / QuickBooks and PM-Tool's
  webhook endpoints, rather than building native integrations for each
  tool in v1. Native integrations (e.g. QuickBooks OAuth app) can replace
  Zapier steps later where reliability/cost demands it.

## 5. Data model (initial sketch)

- **Lead**: id, name, email, phone, source, status, notes, created_at,
  discovery_event_id, discovery_meet_link, proposal_url, invoice_id
- **Client**: id, lead_id (nullable, origin), name, billing_contact,
  quickbooks_customer_id, account_manager_id, status, created_at
- **EngagementTemplate**: id, name, service_line, task_list (ordered)
- **WorkItem**: id, client_id, template_id (nullable), title, status,
  due_date, assignee_id, checklist[], created_at
- **Task/Checklist item**: id, work_item_id, title, done, due_date
- **IntegrationEvent** (audit log): id, source (quickbooks/calendar/
  gamma/form), event_type, payload, received_at, processed_status

## 6. Roles & permissions (v1)

- **Partner/Admin**: full access, manages templates, sees all
  leads/clients.
- **Account Manager / Staff**: sees assigned leads/clients/work items,
  can update status, cannot manage templates or firm-wide settings.
- **(Future) Client portal user**: read-only view of their own work items
  and requested-document tasks.

## 7. Non-functional requirements

- **Security**: QuickBooks and Google integrations use OAuth 2.0; no
  storage of Google/QuickBooks passwords. Webhook endpoints must verify
  signatures (QuickBooks webhook HMAC, Zapier shared-secret header).
- **Auditability**: every automated record creation (Lead, Client, Work
  Item) stores which integration/event created it (see
  `IntegrationEvent`).
- **PII/financial data handling**: client billing data should reference
  QuickBooks rather than duplicate sensitive financial details in PM-Tool.
- **Reliability**: webhook receivers must be idempotent (safe to receive
  the same QuickBooks/Calendar event twice without duplicating records).

## 8. Success metrics

- % of new clients whose Client + Work Items were created automatically
  (no manual re-entry) — target 90%+ within first 2 months live.
- Median time from "invoice created in QuickBooks" to "work item assigned
  and assignee notified" — target under 1 hour.
- Reduction in duplicate/mismatched client records between QuickBooks and
  PM-Tool.

## 9. Phased rollout

**Phase 1 (MVP)**
- Lead intake endpoint + manual lead list in PM-Tool.
- Manual "Convert to Client" action (QuickBooks webhook deferred).
- Engagement templates + Work Item creation + assignee notification.

**Phase 2**
- QuickBooks webhook → automatic Client conversion.
- Google Calendar event linkage on the Lead.
- Gamma proposal link capture.

**Phase 3**
- Client portal for task requests/document upload.
- Reporting: pipeline conversion rates, work item throughput.

## 10. Open questions / assumptions to confirm

1. **Step 1 tool**: what captures the initial website enquiry — a plain
   website contact form, Google Forms, or another tool? This PRD assumes
   a generic form whose submission is relayed to PM-Tool via webhook or
   Zapier/Make; please confirm so the intake integration can be scoped
   precisely.
2. **"Practice Manager" in steps 7-8**: this PRD assumes these refer to
   **PM-Tool itself** (matching this repository), not a third-party
   practice-management SaaS like Karbon. Please confirm.
3. **Automation glue**: is Zapier/Make already licensed/preferred, or
   should PM-Tool build native API integrations with Google Workspace,
   Gamma, and QuickBooks from day one?
4. **Proposal → invoice trigger**: does Gamma support a "proposal
   accepted/signed" signal, or is invoice creation in QuickBooks always a
   manual step performed by staff after a verbal/email confirmation?
5. **Client-facing communication** for step 8 task requests — email only,
   or is a client portal required for v1?

## Appendix A: Reference diagram

The original reference workflow (Typeform → Mailchimp → Calendly → Zoom →
GoProposal/Practice Ignition → Karbon, with QuickBooks/Xero for invoicing)
was supplied as a visual diagram and is adapted above to the firm's actual
tool stack (Google Workspace, Gamma, QuickBooks, PM-Tool).
