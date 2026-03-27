# Dirty Data Challenge Sets — Guide

## Overview
Five standalone challenge datasets, each targeting a specific category of real-world data quality issues. Each file comes with a corresponding answer key in the `answer-keys/` folder.

**Version:** 1.0
**Released:** Q3 2026
**Format:** CSV (UTF-8)

---

## Challenge 01 — Duplicate Records
**File:** `challenges/challenge_01_duplicates.csv`
**Answer Key:** `answer-keys/answer_key_01_duplicates.csv`
**Rows:** 183 (150 unique customers)

### What's in here
A customer master table with three types of duplicates layered in:

| Issue | Count | Description |
|---|---|---|
| Exact row duplicates | ~15 | Identical rows on all fields |
| Near-dupes (name casing) | ~10 | Same customer, first_name in CAPS or lowercase |
| Near-dupes (email domain) | ~8 | Same local email address, different domain |
| Whitespace-padded IDs | ~12 | Leading/trailing spaces on customer_id |
| Phone format variations | ~20 | `(555) 123-4567` vs `5551234567` vs `555-123-4567` vs `1-555-123-4567` |

### Your mission
1. Identify and remove all duplicate records (exact and near)
2. Standardize `customer_id` (strip whitespace)
3. Normalize `phone` to a single format
4. Normalize name casing

---

## Challenge 02 — Orphaned Foreign Keys
**File:** `challenges/challenge_02_orphaned_keys.csv`
**Answer Key:** `answer-keys/answer_key_02_orphaned_keys.csv`
**Rows:** 300

### What's in here
An orders table that references customers and products — some of which don't exist.

| Issue | Count | Description |
|---|---|---|
| Orphaned customer_id | ~20 | References customer IDs in the 9000-range (not in any dim table) |
| Orphaned product_id | ~12 | References PROD099/100/101/998/999 (non-existent products) |
| Miscalculated total_amount | ~15 | `total_amount ≠ quantity × unit_price` |
| Missing order_date | ~8 | Blank date field |

### Your mission
1. Identify all orders with customer_id not in the valid customer range
2. Identify all orders with product_id not in the valid product list
3. Flag or recalculate rows where `total_amount ≠ quantity × unit_price`
4. Decide on a strategy for rows with missing order_date

---

## Challenge 03 — Date Format Chaos
**File:** `challenges/challenge_03_date_chaos.csv`
**Answer Key:** `answer-keys/answer_key_03_date_chaos.csv`
**Rows:** 400

### What's in here
An event log where `event_date` contains 9 different date formats — plus invalid entries.

| Format | Example |
|---|---|
| ISO 8601 | `2024-03-15` |
| US slash | `03/15/2024` |
| Ambiguous EU slash | `15/03/2024` |
| Long month name | `March 15, 2024` |
| Short month name | `Mar 15 2024` |
| Day-Month-Year | `15-Mar-2024` |
| Compact | `20240315` |
| 2-digit year | `03-15-24` |
| ISO datetime | `2024-03-15T09:30:00` |
| Invalid/garbage | `2024-13-01`, `TBD`, `N/A`, `""` |

### Your mission
1. Parse all valid date strings into a single standard format (ISO YYYY-MM-DD recommended)
2. Flag the ambiguous EU-format dates (DD/MM/YYYY looks identical to US MM/DD/YYYY for days ≤ 12)
3. Identify and handle the 10 invalid/unparseable entries

---

## Challenge 04 — Null Patterns
**File:** `challenges/challenge_04_null_patterns.csv`
**Answer Key:** `answer-keys/answer_key_04_null_patterns.csv`
**Rows:** 250

### What's in here
An employee survey dataset with three distinct null archetypes:

| Null Type | Column | Description |
|---|---|---|
| **MCAR** (Missing Completely At Random) | `satisfaction_score` | ~10% randomly missing — no pattern |
| **MAR** (Missing At Random) | `bonus_pct` | Missing for IC1/IC2 levels — they don't receive bonuses |
| **MNAR** (Missing Not At Random) | `nps_score` | High flight-risk employees disproportionately skip this question |
| **Null representation chaos** | `gender`, `ethnicity` | Mix of `""`, `N/A`, `null`, `NULL`, `None`, `#N/A`, `Unknown`, `-` |
| **Salary format** | `base_salary` | ~15 rows stored as `$1,234.56` string instead of numeric |

### Your mission
1. Identify which null pattern each column exhibits and document why it matters for imputation
2. Standardize all null representations to a single consistent form
3. Parse salary strings to numeric
4. Decide whether MNAR nulls in `nps_score` can be imputed — or whether imputation would bias results

---

## Challenge 05 — Type Chaos
**File:** `challenges/challenge_05_type_chaos.csv`
**Answer Key:** `answer-keys/answer_key_05_type_chaos.csv`
**Rows:** 200

### What's in here
A product catalog where every column has its own type/format problem.

| Column | Issues |
|---|---|
| `category` | UPPER, lower, Title, sWaPcAsE mixed throughout |
| `unit_price` | `1299.99`, `$1,299.99`, `$1300`, `USD 1299.99`, `1300` (truncated) |
| `is_subscription` | TRUE/True/true/1/Yes/YES/yes/T/Y mixed |
| `in_stock` | FALSE/False/false/0/No/NO/no/F/N mixed |
| `avg_rating` | Some stored as `4.2`, others as `4.2/5` |
| `review_count` | Some as `342`, others as `1,234` (with comma separator) |
| `sku` | `SKU-12345`, `SKU12345`, `sku-12345`, `sku_12345`, ` SKU-12345 ` (padded) |
| `weight_kg` | Blank, `N/A`, `null`, `#VALUE!`, `—` for non-hardware products |

### Your mission
1. Standardize `category` to Title Case
2. Parse `unit_price` to a clean decimal
3. Normalize `is_subscription` and `in_stock` to TRUE/FALSE boolean
4. Parse `avg_rating` to numeric (strip the `/5`)
5. Parse `review_count` to integer (strip comma separators)
6. Standardize `sku` format
7. Decide on appropriate null handling for `weight_kg` given hardware vs. non-hardware products

---

## Suggested Tools
- **SQL:** CTEs + CASE statements for type coercion, GROUP BY deduplication
- **Python:** pandas `read_csv` + `pd.to_datetime()`, `pd.to_numeric(errors='coerce')`, regex
- **Power Query:** Split Column, Replace Values, Data Type transforms
- **dbt:** `dbt_utils.deduplicate`, custom macros for null standardization
