# Data Dictionary — Sales & Revenue Dataset

**Version:** 1.0
**Released:** Q2 2026
**Format:** CSV (UTF-8)
**Category:** Sales & Revenue

---

## Files Included

| File | Type | Rows | Description |
|------|------|------|-------------|
| `clean/fact_opportunities.csv` | Fact | 200 | One row per sales opportunity, model-ready |
| `clean/dim_rep.csv` | Dimension | 12 | Sales rep master data |
| `clean/dim_product.csv` | Dimension | 6 | Product catalog |
| `clean/dim_region.csv` | Dimension | 8 | Sales territories |
| `clean/dim_stage.csv` | Dimension | 7 | Pipeline stage definitions |
| `dirty/fact_opportunities_dirty.csv` | Fact (dirty) | ~218 | Same data with intentional quality issues |

---

## Star Schema Diagram

```
                   dim_rep
                     │
dim_region ──── fact_opportunities ──── dim_product
                     │
                 dim_stage
```

---

## fact_opportunities.csv

| Column | Data Type | Description | Example |
|--------|-----------|-------------|---------|
| `opportunity_id` | VARCHAR | Primary key. Unique identifier per deal. | `OPP-0001` |
| `rep_id` | VARCHAR | Foreign key → dim_rep.rep_id | `REP03` |
| `product_id` | VARCHAR | Foreign key → dim_product.product_id | `P02` |
| `region_id` | VARCHAR | Foreign key → dim_region.region_id | `R01` |
| `stage_id` | VARCHAR | Foreign key → dim_stage.stage_id | `S06` |
| `created_date` | DATE (YYYY-MM-DD) | Date the opportunity was opened | `2024-03-15` |
| `close_date_target` | DATE (YYYY-MM-DD) | Expected/forecasted close date | `2024-05-30` |
| `close_date_actual` | DATE (YYYY-MM-DD) | Actual close date. Null if still open. | `2024-06-08` |
| `deal_amount_usd` | INTEGER | Negotiated deal value in USD | `47500` |
| `is_closed` | BOOLEAN (0/1) | 1 = deal is closed (won or lost) | `1` |
| `is_won` | BOOLEAN (0/1) | 1 = closed won. Always 0 if is_closed = 0 | `1` |
| `days_to_close` | INTEGER | Days from created_date to close_date_actual. Null if open. | `85` |

---

## dim_rep.csv

| Column | Data Type | Description | Example |
|--------|-----------|-------------|---------|
| `rep_id` | VARCHAR | Primary key | `REP01` |
| `rep_name` | VARCHAR | Full name of sales rep | `Sarah Chen` |
| `team` | VARCHAR | Sales segment: SMB, Mid-Market, Enterprise, International | `Mid-Market` |
| `hire_date` | DATE (YYYY-MM-DD) | Rep's start date | `2022-03-14` |
| `quota_annual_usd` | INTEGER | Annual quota in USD | `450000` |
| `manager_name` | VARCHAR | Sales manager's full name | `James Okafor` |

---

## dim_product.csv

| Column | Data Type | Description | Example |
|--------|-----------|-------------|---------|
| `product_id` | VARCHAR | Primary key | `P01` |
| `product_name` | VARCHAR | Product or service name | `Analytics Pro` |
| `category` | VARCHAR | Platform, Add-on, or Professional Services | `Platform` |
| `list_price_usd` | INTEGER | Published monthly list price (MRR) or one-time fee | `5000` |
| `mrr_flag` | BOOLEAN (0/1) | 1 = recurring revenue product, 0 = one-time | `1` |

---

## dim_region.csv

| Column | Data Type | Description | Example |
|--------|-----------|-------------|---------|
| `region_id` | VARCHAR | Primary key | `R01` |
| `region_name` | VARCHAR | Named sales region | `Northeast` |
| `territory` | VARCHAR | Broader territory grouping: East, Central, West, International | `East` |
| `country` | VARCHAR | Country or "Multiple" for international | `USA` |

---

## dim_stage.csv

| Column | Data Type | Description | Example |
|--------|-----------|-------------|---------|
| `stage_id` | VARCHAR | Primary key | `S04` |
| `stage_name` | VARCHAR | Stage label as it appears in CRM | `Proposal / Price Quote` |
| `stage_order` | INTEGER | Sequential order of stages in the pipeline | `4` |
| `probability_pct` | INTEGER | Default win probability % for this stage | `60` |

---

## Dirty Dataset — Known Issues

The file `dirty/fact_opportunities_dirty.csv` contains the following intentional data quality problems for practice:

| Issue Type | Count | Description |
|------------|-------|-------------|
| Duplicate rows | 15 | Exact duplicates of existing opportunity rows |
| Orphaned foreign keys | 3 | Rows referencing rep_ids not in dim_rep (REP00, REP13, REP99) |
| Mixed date formats | ~40 rows | created_date, close_date_target, close_date_actual in MM/DD/YYYY instead of YYYY-MM-DD |
| Inconsistent region values | All rows | region_id replaced with free-text region names in mixed casing (e.g., "northeast", "NORTH EAST", "NE") |
| Missing deal amounts | ~10 rows | deal_amount_usd blank on closed-won deals |
| Mixed boolean formats | ~35% of rows | is_closed and is_won use mix of 0/1, Yes/No, TRUE/FALSE |
| Leading/trailing whitespace | ~8% of rows | opportunity_id padded with spaces |
| Extra columns | All rows | account_name and notes columns added (not in clean version) |

---

## Suggested Use Cases

- **Power BI / Tableau:** Build a sales performance dashboard with win rate, pipeline by stage, and quota attainment by rep
- **SQL practice:** Write CTEs to calculate rolling monthly ARR, stage conversion rates, and average days-to-close by product
- **Data cleaning:** Use the dirty variant to practice deduplication, date standardization, and null handling in Python/SQL
- **Star schema modeling:** Practice creating relationships between fact and dimension tables in a semantic layer
- **DAX measures:** Build running totals, period-over-period comparisons, and weighted pipeline forecasts

---

*Dataset generated for portfolio and practice purposes. All names, companies, and figures are fictional.*
