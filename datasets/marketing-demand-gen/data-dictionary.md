# Data Dictionary — Marketing & Demand Gen Dataset

**Version:** 1.0
**Released:** Q3 2026
**Format:** CSV (UTF-8)
**Category:** Marketing & Demand Gen

---

## Files Included

| File | Type | Rows | Description |
|------|------|------|-------------|
| `clean/fact_leads.csv` | Fact | 400 | One row per lead, tracking progression through funnel stages |
| `clean/fact_campaign_performance.csv` | Fact | ~266 | Weekly campaign performance roll-ups |
| `clean/dim_campaign.csv` | Dimension | 24 | Campaign master data with budgets and dates |
| `clean/dim_channel.csv` | Dimension | 10 | Marketing channel definitions |
| `clean/dim_lead_stage.csv` | Dimension | 7 | Lead funnel stage definitions |
| `clean/dim_persona.csv` | Dimension | 7 | Buyer persona profiles |
| `dirty/fact_leads_dirty.csv` | Fact (dirty) | ~417 | Lead data with intentional quality issues |

---

## Star Schema Diagram

```
dim_channel ──┐
              ├──── fact_leads ──── dim_lead_stage
dim_campaign ─┤         │
              │     dim_persona
              └──── fact_campaign_performance
```

---

## fact_leads.csv

| Column | Data Type | Description | Example |
|--------|-----------|-------------|---------|
| `lead_id` | VARCHAR | Primary key | `LED-0001` |
| `campaign_id` | VARCHAR | FK → dim_campaign.campaign_id | `CAM008` |
| `channel_id` | VARCHAR | FK → dim_channel.channel_id | `CH01` |
| `persona_id` | VARCHAR | FK → dim_persona.persona_id | `PER03` |
| `lead_stage_id` | VARCHAR | FK → dim_lead_stage.stage_id — current/final stage | `LS04` |
| `created_date` | DATE (YYYY-MM-DD) | Date lead was created | `2024-07-14` |
| `mql_date` | DATE (YYYY-MM-DD) | Date lead became MQL. Null if never reached MQL. | `2024-07-20` |
| `sql_date` | DATE (YYYY-MM-DD) | Date lead became SQL. Null if never reached SQL. | `2024-07-28` |
| `opportunity_date` | DATE (YYYY-MM-DD) | Date opportunity was created in CRM. Null if not reached. | `2024-08-02` |
| `close_date` | DATE (YYYY-MM-DD) | Date deal closed (won or lost). Null if open. | `2024-10-15` |
| `is_won` | BOOLEAN (0/1) | 1 = closed won | `1` |
| `lead_score` | INTEGER | Marketing automation score (10–100) | `72` |
| `content_asset` | VARCHAR | First content asset downloaded or interacted with | `ROI Calculator` |

---

## fact_campaign_performance.csv

| Column | Data Type | Description | Example |
|--------|-----------|-------------|---------|
| `perf_id` | VARCHAR | Primary key | `PF-0012` |
| `campaign_id` | VARCHAR | FK → dim_campaign.campaign_id | `CAM003` |
| `channel_id` | VARCHAR | FK → dim_channel.channel_id | `CH02` |
| `week_start_date` | DATE (YYYY-MM-DD) | Monday of the reporting week | `2024-03-11` |
| `impressions` | INTEGER | Total ad impressions or content views for the week | `24500` |
| `clicks` | INTEGER | Total clicks or visits | `588` |
| `ctr_pct` | DECIMAL | Click-through rate percentage | `2.40` |
| `spend_usd` | DECIMAL | Actual spend for the week (0 for organic channels) | `1842.50` |
| `leads_generated` | INTEGER | New leads created attributed to this campaign/week | `38` |
| `mqls` | INTEGER | MQLs generated this week | `14` |
| `sqls` | INTEGER | SQLs generated this week | `6` |
| `cost_per_lead_usd` | DECIMAL | spend_usd / leads_generated | `48.49` |
| `cost_per_mql_usd` | DECIMAL | spend_usd / mqls | `131.61` |

---

## dim_campaign.csv

| Column | Data Type | Description | Example |
|--------|-----------|-------------|---------|
| `campaign_id` | VARCHAR | Primary key | `CAM001` |
| `campaign_name` | VARCHAR | Descriptive campaign name | `Q1 Brand Awareness - LinkedIn` |
| `channel_id` | VARCHAR | FK → dim_channel.channel_id | `CH03` |
| `campaign_type` | VARCHAR | Brand, Demand Gen, Webinar, Nurture, Content, Partner, Product Launch | `Demand Gen` |
| `start_date` | DATE (YYYY-MM-DD) | Campaign start date | `2024-01-08` |
| `end_date` | DATE (YYYY-MM-DD) | Campaign end date | `2024-03-29` |
| `budget_usd` | INTEGER | Total campaign budget in USD | `22000` |
| `target_segment` | VARCHAR | SMB, Mid-Market, Enterprise, or All | `Mid-Market` |

---

## dim_channel.csv

| Column | Data Type | Description | Example |
|--------|-----------|-------------|---------|
| `channel_id` | VARCHAR | Primary key | `CH01` |
| `channel_name` | VARCHAR | Channel display name | `Google Search` |
| `channel_type` | VARCHAR | Paid Search, Paid Social, Paid Display, Email, Organic, Event, Referral, Direct | `Paid Search` |
| `paid_flag` | BOOLEAN (0/1) | 1 = paid channel with spend | `1` |

---

## dim_lead_stage.csv

| Column | Data Type | Description | Example |
|--------|-----------|-------------|---------|
| `stage_id` | VARCHAR | Primary key | `LS03` |
| `stage_name` | VARCHAR | Stage label | `MQL` |
| `stage_order` | INTEGER | Sequential order in funnel | `3` |
| `description` | VARCHAR | Plain-language description of what qualifies for this stage | `Marketing Qualified Lead — meets scoring threshold` |

---

## dim_persona.csv

| Column | Data Type | Description | Example |
|--------|-----------|-------------|---------|
| `persona_id` | VARCHAR | Primary key | `PER01` |
| `persona_name` | VARCHAR | Persona label | `Director of Analytics` |
| `seniority` | VARCHAR | C-Suite, VP, Director, Manager, Individual Contributor | `Director` |
| `function` | VARCHAR | Business function of this persona | `Analytics / BI` |
| `company_size` | VARCHAR | SMB (<100), Mid-Market (100-999), Enterprise (1000+) | `Enterprise (1000+)` |

---

## Dirty Dataset — Known Issues

The file `dirty/fact_leads_dirty.csv` contains the following intentional data quality problems:

| Issue Type | Count | Description |
|------------|-------|-------------|
| Duplicate rows | 15 | Exact duplicates of existing lead rows |
| Orphaned campaign refs | 2 | Leads referencing CAM099, CAM000 — not in dim_campaign |
| Mixed date formats | ~60 rows | All date columns in MM/DD/YYYY instead of YYYY-MM-DD |
| Inconsistent stage values | All rows | lead_stage_id replaced with free-text in mixed casing (e.g., "mql", "MQL", "Marketing Qualified") |
| Mixed boolean | ~30% of rows | is_won uses mix of 0/1, Yes/No, TRUE/FALSE |
| Null lead scores | ~8% of rows | lead_score blank |
| Leading whitespace | ~7% of rows | lead_id padded with spaces |
| Extra columns | All rows | utm_source and notes columns added |

---

## Suggested Use Cases

- **Funnel analysis:** Calculate stage conversion rates (Lead → MQL → SQL → Opp → Won) by channel and campaign type
- **CAC / ROI modeling:** Join campaign spend to closed-won opportunities to calculate true customer acquisition cost
- **Attribution modeling:** Explore first-touch vs. last-touch attribution across paid and organic channels
- **Cohort analysis:** Group leads by creation month and track how long they take to progress through each stage
- **Data cleaning:** Use the dirty variant to practice standardizing funnel stage labels, deduplication, and date normalization

---

*Dataset generated for portfolio and practice purposes. All names, companies, and figures are fictional.*
