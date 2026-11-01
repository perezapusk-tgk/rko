# RKO Partner — MVP plan and implementation notes

## Product

A partner-first platform for referring entrepreneurs (ИП/ООО) to bank current-account (РКО) offers. The platform is free to use for partners and referred businesses in the MVP. Revenue comes from bank partner commissions; no subscriptions.

Primary operating model:
- The platform owner recruits partners who already work with entrepreneurs (accountants, registration services, business lawyers, tax consultants, franchise and business-service providers).
- Partners register leads with the entrepreneur's knowledge and appropriate consent.
- The platform records the lead source, bank offer, status history and bank-confirmed reward.
- The customer share is calculated as 50% of the commission actually received by the platform owner, only if the bank's partner terms permit this and the customer-facing arrangement is legally approved.
- Until written bank approval and reviewed payout terms exist, the customer share must be shown as a forecast/disabled feature, never as a guaranteed payout.

## MVP roles

1. **Owner / administrator** — manage banks, offers, reward rules, partners, leads and payout ledger; reconcile bank reports; approve payouts.
2. **Partner** — personal account, referral URL/code, lead submission form, own leads only, status timeline, commission and payout ledger.
3. **Referred customer** — optional claim/status page using a secure expiring token; see only their own status and any approved customer-share amount.

## Lead lifecycle

draft → submitted → sent_to_bank → contacted → application_started → account_opened → activated → first_business_operation → bank_approved → commission_received → customer_share_due → paid

Exception states: rejected, duplicate, withdrawn, cancelled, disputed.

Every transition must create an immutable status-history event with actor, timestamp and optional note. A lead must not become payable merely because an account is marked opened. Payability requires a bank statement/report and actual receipt of the partner commission.

## Commission ledger

Store money in integer minor units (kopecks), never floating point.

For each bank offer, version the commercial terms: bank and offer identifiers; effective dates; reward model; bank-reported gross reward; adjustments/clawbacks; actual amount received; customer-share percentage; partner remuneration; platform retained amount; currency and evidence reference.

After actual receipt: net_distributable = actual_received - documented_adjustments - approved_partner_costs. If customer sharing is approved, customer_share = floor(net_distributable * 0.50). platform_share = net_distributable - customer_share.

Never calculate a guaranteed customer amount from a public “up to” marketing figure. Show estimates as estimates and include the bank offer version/date.

## Bank integration

Phase 1: admin-managed bank offers and manual status/reward reconciliation from partner statements.
Phase 2: bank-specific referral links and callback/webhook ingestion where officially supported.
Phase 3: API/CRM integration after the bank issues credentials and confirms permitted data fields and use.

For T-Bank, confirm in writing before launch: (1) whether a business partner may share part of earned referral commission with the referred entrepreneur; (2) qualifying RKO actions and when commission is final; (3) whether later account closure triggers reversal/clawback and any minimum active period; (4) whether the platform may collect and transmit leads and required consent wording; (5) whether sub-partners are permitted and how attribution is recorded.

## Security, privacy and compliance requirements

- Replace hard-coded partnerCode=nikita identity with real authentication and server-side authorization before public launch.
- Never trust a partner ID/code supplied by the browser as proof of identity.
- Enforce ownership checks for every lead, commission and payout query.
- Collect only fields required by the bank. Record explicit consent to transmit contact/business data, including consent timestamp, text version and source.
- Encrypt secrets; do not store bank login credentials, card data or unnecessary identity documents.
- Validate and normalize phone, email and INN; rate-limit lead creation; detect duplicates.
- Keep an audit log for admin changes, reward edits, status transitions and payouts.
- Publish privacy notice, partner terms and customer payout terms after legal review.

## Existing repository audit (2026-11-01)

Repository: perezapusk-tgk/rko, branch main.

Already present: Next.js dashboard in app/page.tsx; lead API in app/api/leads/route.ts; bank-offer API in app/api/offers/route.ts; Neon database adapter in lib/db.ts.

Launch blockers found:
- Dashboard hard-codes partner identity nikita in client-side fetches and POST payloads.
- Lead API accepts a partner code from request data and can create a partner record; this is not authentication and permits impersonation.
- Dashboard shows a hard-coded “до 15 000 ₽” headline, which can misrepresent a bank's changing or conditional reward.
- Dashboard referral URL is a placeholder and must not be presented as working until a real domain and attribution route exist.
- No verified evidence yet that T-Bank permits paying 50% of partner commission to the referred customer.
- Commissions, payouts and analytics sections are placeholders, not completed workflows.

## Build order

### P0 — make the data safe
1. Add authentication and server-side partner identity.
2. Remove client-controlled partner identity and placeholder referral link.
3. Add consent capture and duplicate detection.
4. Add database migrations with foreign keys, indexes and status-history table.

### P1 — make the workflow real
1. Admin bank/offer management with dated terms.
2. Partner lead list with status timeline.
3. Admin reconciliation of bank reports and actual commission receipts.
4. Commission ledger and payout approvals.
5. Customer status page with secure expiring access token.

### P2 — scale partner acquisition
1. Partner invitations and onboarding.
2. Unique attribution links and source analytics.
3. Partner-level commission rules and settlement reports.
4. Bank API/webhook integrations where contractually available.
5. Multi-bank comparison and offer eligibility rules.

## Acceptance criteria

- A partner can only create and read their own leads.
- A lead has a recorded consent event and unique attribution source.
- Duplicate INN/contact submissions are flagged for review, not silently double-counted.
- Every status change is timestamped and attributable.
- No commission is payable before bank approval and actual receipt.
- Customer sharing stays disabled until written bank permission and reviewed customer terms are recorded.
- Admin can reconcile a bank report and produce a transparent ledger showing receipt, adjustments, customer share, partner share and platform remainder.
- No marketing page promises a fixed reward unless the active bank offer explicitly guarantees it.