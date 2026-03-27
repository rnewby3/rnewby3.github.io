# Finance & FP&A Dataset — Data Dictionary

## Overview
A fictional Finance & FP&A dataset organized in star schema format, covering general ledger transactions, budget planning, and the building blocks for P&L reporting. Includes clean and intentionally dirty variants for practice purposes.

**Version:** 1.0
**Released:** Q3 2026
**Format:** CSV (UTF-8)
**Records:** 336 clean GL transactions, 112 budget entries

---

## Files Structure

**Clean Files (5 files):**
- `dim_account.csv` (20 rows) — Chart of accounts with type and P&L classification
- `dim_department.csv` (10 rows) — Department and cost center hierarchy
- `dim_period.csv` (24 rows) — Fiscal calendar: Jan 2024 – Dec 2025
- `fact_gl_transactions.csv` (336 rows) — General ledger transaction detail
- `fact_budget.csv` (112 rows) — Quarterly budget entries by account and department
- `finance-fp-and-a-clean.zip` — All clean files bundled

**Dirty File (1 file):**
- `dirty/fact_gl_transactions_dirty.csv` (~348 rows) — GL transactions with documented quality issues

---

## Table Definitions

### dim_account

| Column | Type | Description |
|---|---|---|
| account_id | string | Primary key (e.g. ACC001) |
| account_code | string | GL account code (e.g. 4000) |
| account_name | string | Human-readable account name |
| account_type | string | Revenue, COGS, Operating Expense, Asset, Liability, Equity |
| account_category | string | Sub-classification (ARR, Services, Personnel, Infrastructure, etc.) |
| is_pl_account | boolean | TRUE if this account appears on the P&L |

**Account type breakdown:** 4 Revenue, 3 COGS, 7 Operating Expense, 3 Asset, 2 Liability, 1 Equity

---

### dim_department

| Column | Type | Description |
|---|---|---|
| department_id | string | Primary key (e.g. DEPT01) |
| department_name | string | Department name |
| department_code | string | Short code (ENG, SLS, MKT, etc.) |
| cost_center_code | string | Finance cost center code |
| parent_department_id | string | Foreign key to dim_department (nullable — top-level depts are null) |

**Note:** Finance, HR, and Legal roll up to G&A (DEPT08). Parent is null for top-level departments.

---

### dim_period

| Column | Type | Description |
|---|---|---|
| period_id | string | Primary key (e.g. PER001) |
| fiscal_year | integer | 2024 or 2025 |
| fiscal_quarter | integer | 1–4 |
| fiscal_month | integer | 1–12 |
| period_name | string | Human-readable name (e.g. Jan 2024) |
| period_start_date | date | YYYY-MM-DD |
| period_end_date | date | YYYY-MM-DD |
| is_closed | boolean | TRUE if the period is closed for posting |

**Coverage:** 24 periods (Jan 2024 – Dec 2025). Periods through Sep 2025 are closed.

---

### fact_gl_transactions

| Column | Type | Description |
|---|---|---|
| transaction_id | string | Primary key (e.g. TXN0001) |
| account_id | string | FK → dim_account |
| department_id | string | FK → dim_department |
| period_id | string | FK → dim_period |
| transaction_date | date | Actual posting date (YYYY-MM-DD) |
| amount | decimal | Transaction amount in USD |
| transaction_type | string | Debit or Credit |
| description | string | Line item description |
| journal_entry_id | string | Groups related debit/credit lines (e.g. JE1000) |

**Revenue accounts** are recorded as Credits. **Expense and COGS accounts** are recorded as Debits. P&L is derived by filtering `is_pl_account = TRUE` and summarizing Credits (revenue) minus Debits (expenses).

---

### fact_budget

| Column | Type | Description |
|---|---|---|
| budget_id | string | Primary key (e.g. BUD0001) |
| account_id | string | FK → dim_account |
| department_id | string | FK → dim_department |
| period_id | string | FK → dim_period (points to first month of the quarter) |
| budget_amount | decimal | Budgeted amount in USD for the quarter |
| budget_type | string | Quarterly |
| fiscal_year | integer | 2024 or 2025 |

**Budget vs. Actuals:** Join fact_budget to fact_gl_transactions on account_id + department_id + fiscal_year/quarter to compare planned vs. actual spend.

---

## Dirty Data — Documented Issues

The dirty variant (`fact_gl_transactions_dirty.csv`) intentionally includes the following issues for data quality practice:

| Issue | Count | Description |
|---|---|---|
| Duplicate rows | ~12 | Exact row duplicates simulating double-posting |
| Orphaned account refs | ~5 | account_id = ACC999 (not in dim_account) |
| Mixed date formats | ~40 | Some dates in MM/DD/YYYY instead of YYYY-MM-DD |
| Missing amounts | ~20 | Blank amount field |
| Inconsistent transaction_type | ~30 | Mixed casing and abbreviations: DEBIT, debit, Dr, Cr, CREDIT, credit |
| Missing department | ~10 | Blank department_id |
| Leading whitespace on IDs | ~7% of rows | Whitespace-padded transaction_id values |
| Undocumented extra column | All rows | `legacy_flag` column not in schema |

Total dirty rows: ~348 (336 base + 12 duplicates, order shuffled)

---

## Suggested Applications

- **P&L Reporting:** Filter `is_pl_account = TRUE`, group Credits as revenue and Debits as expenses by period
- **Budget vs. Actuals Analysis:** Compare fact_budget quarterly amounts to aggregated fact_gl_transactions
- **Departmental Spend Analysis:** Slice expense accounts by department_id
- **Data Cleaning Practice:** Use the dirty variant to practice deduplication, referential integrity checks, date standardization, and null handling
- **Star Schema Modeling:** Build semantic layers, DAX measures, or dbt models on top of the clean schema
- **General Ledger Reconciliation:** Practice journal entry validation (debits = credits by journal_entry_id)
