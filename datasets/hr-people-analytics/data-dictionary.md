# Data Dictionary — HR & People Analytics Dataset

**Version:** 1.0
**Released:** Q3 2026
**Format:** CSV (UTF-8)
**Category:** HR & People Analytics

---

## Files Included

| File | Type | Rows | Description |
|------|------|------|-------------|
| `clean/dim_employee.csv` | Dimension | 150 | Employee master record (active and terminated) |
| `clean/fact_headcount_monthly.csv` | Fact | ~312 | Monthly headcount snapshots by department |
| `clean/fact_hires.csv` | Fact | 150 | One row per hire event with recruiting pipeline dates |
| `clean/dim_department.csv` | Dimension | 13 | Department and division structure |
| `clean/dim_job_level.csv` | Dimension | 9 | Job level / band definitions |
| `clean/dim_location.csv` | Dimension | 9 | Office locations and remote designations |
| `dirty/dim_employee_dirty.csv` | Dimension (dirty) | ~161 | Employee data with intentional quality issues |

---

## Star Schema Diagram

```
dim_department ──┐
                 ├──── fact_headcount_monthly
dim_job_level ───┤
                 ├──── fact_hires
dim_location ────┤
                 └──── dim_employee (slowly changing dimension)
```

---

## dim_employee.csv

| Column | Data Type | Description | Example |
|--------|-----------|-------------|---------|
| `employee_id` | VARCHAR | Primary key | `EMP-0042` |
| `employee_name` | VARCHAR | Full name | `Jordan Chen` |
| `dept_id` | VARCHAR | FK → dim_department.dept_id | `D01` |
| `level_id` | VARCHAR | FK → dim_job_level.level_id | `L3` |
| `location_id` | VARCHAR | FK → dim_location.location_id | `LOC05` |
| `hire_date` | DATE (YYYY-MM-DD) | Employee start date | `2022-04-11` |
| `termination_date` | DATE (YYYY-MM-DD) | Termination date. Null if still active. | `2024-08-30` |
| `employment_status` | VARCHAR | Active or Terminated | `Active` |
| `base_salary_usd` | INTEGER | Annual base salary in USD | `105000` |
| `gender` | VARCHAR | Male, Female, Non-Binary, Prefer not to say | `Female` |
| `ethnicity` | VARCHAR | Self-reported ethnicity category | `Asian` |

---

## fact_headcount_monthly.csv

| Column | Data Type | Description | Example |
|--------|-----------|-------------|---------|
| `snapshot_id` | VARCHAR | Primary key | `HC-00042` |
| `snapshot_month` | DATE (YYYY-MM-DD) | First day of the snapshot month | `2024-06-01` |
| `dept_id` | VARCHAR | FK → dim_department.dept_id | `D05` |
| `level_id` | VARCHAR | Level grouping ("ALL" = department-level roll-up) | `ALL` |
| `location_id` | VARCHAR | Location grouping ("ALL" = department-level roll-up) | `ALL` |
| `headcount_active` | INTEGER | Number of active employees at month end | `18` |
| `headcount_new_hires` | INTEGER | New hires who started during the month | `2` |
| `headcount_terminations` | INTEGER | Terminations that occurred during the month | `1` |
| `avg_tenure_months` | DECIMAL | Average tenure in months for active employees | `22.4` |
| `avg_base_salary_usd` | INTEGER | Average base salary of active employees | `98500` |

---

## fact_hires.csv

| Column | Data Type | Description | Example |
|--------|-----------|-------------|---------|
| `hire_id` | VARCHAR | Primary key | `HIR-0023` |
| `employee_id` | VARCHAR | FK → dim_employee.employee_id | `EMP-0023` |
| `dept_id` | VARCHAR | FK → dim_department.dept_id | `D02` |
| `level_id` | VARCHAR | FK → dim_job_level.level_id | `L4` |
| `location_id` | VARCHAR | FK → dim_location.location_id | `LOC01` |
| `application_date` | DATE (YYYY-MM-DD) | Date candidate applied | `2022-03-01` |
| `offer_date` | DATE (YYYY-MM-DD) | Date offer was extended | `2022-03-22` |
| `hire_date` | DATE (YYYY-MM-DD) | Employee start date (matches dim_employee) | `2022-04-11` |
| `days_to_offer` | INTEGER | Days from application to offer | `21` |
| `days_to_hire` | INTEGER | Days from application to start date | `41` |
| `source` | VARCHAR | Recruiting source: LinkedIn, Indeed, Employee Referral, etc. | `Employee Referral` |
| `offer_accepted_flag` | BOOLEAN (0/1) | Always 1 in this dataset (only accepted offers become hires) | `1` |

---

## dim_department.csv

| Column | Data Type | Description | Example |
|--------|-----------|-------------|---------|
| `dept_id` | VARCHAR | Primary key | `D01` |
| `dept_name` | VARCHAR | Department name | `Analytics & BI` |
| `division` | VARCHAR | Parent division: Data, Finance & Admin, Revenue, Product & Engineering, G&A | `Data` |
| `cost_center` | VARCHAR | Finance cost center code | `CC-410` |

---

## dim_job_level.csv

| Column | Data Type | Description | Example |
|--------|-----------|-------------|---------|
| `level_id` | VARCHAR | Primary key | `L3` |
| `level_name` | VARCHAR | Level title | `Senior` |
| `level_band` | VARCHAR | Compensation band grouping | `Mid` |
| `individual_contributor_flag` | BOOLEAN (0/1) | 1 = IC role, 0 = people manager | `1` |

---

## dim_location.csv

| Column | Data Type | Description | Example |
|--------|-----------|-------------|---------|
| `location_id` | VARCHAR | Primary key | `LOC01` |
| `city` | VARCHAR | City name. Blank for remote locations. | `Austin` |
| `state_province` | VARCHAR | State or province. Blank for international/remote. | `TX` |
| `country` | VARCHAR | Country. "Multiple" for global remote. | `USA` |
| `remote_flag` | BOOLEAN (0/1) | 1 = remote/distributed location | `0` |

---

## Dirty Dataset — Known Issues

The file `dirty/dim_employee_dirty.csv` contains the following intentional data quality problems:

| Issue Type | Count | Description |
|------------|-------|-------------|
| Duplicate rows | 9 | Exact duplicates of existing employee records |
| Orphaned dept refs | 2 | Employees referencing D99, D00 — not in dim_department |
| Mixed date formats | ~50 rows | hire_date and termination_date in MM/DD/YYYY instead of YYYY-MM-DD |
| Inconsistent employment status | All rows | Status values use mix of "Active", "active", "ACTIVE", "A", "Current", "TERM", "T", etc. |
| Mixed gender values | ~30% of rows | Gender field uses abbreviations, different casing (M/F/NB, male/female, MALE/FEMALE) |
| Null salaries | ~8% of rows | base_salary_usd blank |
| Leading whitespace | ~7% of rows | employee_id padded with spaces |
| Duplicate name column | All rows | full_name_alt column added with name in ALL CAPS |
| Extra columns | All rows | full_name_alt and notes columns added |

---

## Suggested Use Cases

- **Headcount trending:** Track active headcount month-over-month by department and division
- **Attrition analysis:** Calculate voluntary/involuntary turnover rates and identify high-churn departments
- **Time-to-hire benchmarking:** Analyze recruiting velocity by department, level, and source
- **Compensation equity:** Compare average salaries across gender, level, and department
- **DEI reporting:** Headcount breakdown by gender and ethnicity across levels and departments
- **Data cleaning:** Use the dirty variant to practice standardizing status fields, merging duplicate records, and handling nullable salary columns

---

*Dataset generated for portfolio and practice purposes. All names, companies, and figures are fictional.*
