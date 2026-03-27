# Retail & E-Commerce Star Schema Kit — Data Dictionary

## Overview
A complete star schema modeling kit built around a fictional retail/e-commerce business. Designed for Power BI model building, DAX measure practice, SQL analytics, and semantic layer design. Includes a proper date dimension, relationship map, and sample measures.

**Version:** 1.0
**Released:** Q3 2026
**Format:** CSV (UTF-8)
**Grain:** One row per sales line item

---

## Files

| File | Rows | Type | Description |
|---|---|---|---|
| `fact_sales.csv` | 2,000 | Fact | Sales transactions with pre-calculated metrics |
| `dim_date.csv` | 1,096 | Dimension | Full date spine: Jan 2023 – Dec 2025, 18 attributes |
| `dim_product.csv` | 100 | Dimension | Product catalog with category, brand, pricing |
| `dim_customer.csv` | 500 | Dimension | Customer master with segment and loyalty tier |
| `dim_store.csv` | 10 | Dimension | Store/channel master (7 physical + 3 online) |
| `dim_promotion.csv` | 12 | Dimension | Promotion codes, including "No Promotion" row |
| `relationship-map.md` | — | Docs | Schema diagram + relationship definitions |
| `sample-measures.md` | — | Docs | DAX and SQL measures ready to use |

---

## fact_sales

| Column | Type | Description |
|---|---|---|
| sale_id | string | Primary key (SLS000001) |
| date_id | string | FK → dim_date (YYYYMMDD format) |
| customer_id | string | FK → dim_customer |
| product_id | string | FK → dim_product |
| store_id | string | FK → dim_store |
| promotion_id | string | FK → dim_promotion (PROMO001 = no promotion) |
| quantity | integer | Units sold |
| unit_price | decimal | List price before discount |
| discount_pct | decimal | Promotion discount as a decimal (0.15 = 15%) |
| discount_amount | decimal | Total discount in USD (unit_price × discount_pct × quantity) |
| gross_revenue | decimal | Revenue before discounts (unit_price × quantity) |
| net_revenue | decimal | Revenue after discounts (gross_revenue − discount_amount) |
| unit_cost | decimal | COGS per unit |
| cogs | decimal | Total cost of goods sold (unit_cost × quantity) |
| gross_profit | decimal | net_revenue − cogs |
| is_return | boolean | TRUE if this transaction was a return |
| order_channel | string | Convenience denormalization of dim_store.channel |

---

## dim_date

| Column | Type | Description |
|---|---|---|
| date_id | string | Primary key (YYYYMMDD) |
| full_date | date | ISO date (YYYY-MM-DD) |
| year | integer | Calendar year |
| quarter | integer | Calendar quarter (1–4) |
| month | integer | Month number (1–12) |
| month_name | string | Full month name (January) |
| month_short | string | Abbreviated month (Jan) |
| week_of_year | integer | ISO week number |
| day_of_week | integer | 1 = Monday, 7 = Sunday |
| day_name | string | Full day name (Monday) |
| day_short | string | Abbreviated day (Mon) |
| is_weekend | boolean | TRUE for Saturday and Sunday |
| is_holiday | boolean | TRUE for US federal holidays |
| season | string | Calendar season (Winter/Spring/Summer/Fall) |
| retail_season | string | Holiday, Back to School, Valentine's, Summer Sale, Regular |
| fiscal_year | integer | Fiscal year (Feb 1 start — common retail calendar) |
| fiscal_quarter | integer | Fiscal quarter aligned to Feb start |
| is_last_day_of_month | boolean | TRUE for last calendar day of each month |

---

## dim_product

| Column | Type | Description |
|---|---|---|
| product_id | string | Primary key (PRD0001) |
| product_name | string | Full product name |
| category | string | Top-level category (Electronics, Apparel, etc.) |
| subcategory | string | Subcategory within the category |
| brand | string | Brand name |
| unit_cost | decimal | Cost to the retailer per unit |
| list_price | decimal | Retail selling price before discounts |
| is_active | boolean | FALSE for discontinued products |
| launch_date | date | Date product became available |
| weight_kg | decimal | Shipping weight in kilograms |
| is_digital | boolean | TRUE for digital-only products (Books & Media) |

---

## dim_customer

| Column | Type | Description |
|---|---|---|
| customer_id | string | Primary key (CUST00001) |
| first_name | string | Customer first name |
| last_name | string | Customer last name |
| email | string | Customer email |
| state | string | US state code |
| customer_segment | string | Budget / Value / Mainstream / Premium / Luxury |
| preferred_channel | string | Most frequently used shopping channel |
| signup_date | date | Account creation date |
| loyalty_tier | string | Bronze / Silver / Gold / Platinum |
| total_orders_lifetime | integer | Lifetime order count (at time of data extract) |
| is_active | boolean | FALSE for churned/inactive customers |

---

## dim_store

| Column | Type | Description |
|---|---|---|
| store_id | string | Primary key (STR001) |
| store_name | string | Store or channel name |
| store_type | string | Physical or Online |
| address | string | Street address (null for online) |
| region | string | Geographic region |
| channel | string | In-Store / Online / Mobile / Marketplace |
| state | string | State code (All for national online channels) |

---

## dim_promotion

| Column | Type | Description |
|---|---|---|
| promotion_id | string | Primary key (PROMO001) |
| promotion_name | string | Promotion display name |
| discount_pct | decimal | Discount rate as decimal (0.15 = 15% off) |
| start_date | date | Promotion start (null for always-on) |
| end_date | date | Promotion end (null for always-on) |
| promo_type | string | Seasonal / Clearance / Flash / Always |
| applicable_category | string | Product category scope (All = no restriction) |

**Note:** PROMO001 ("No Promotion") has discount_pct = 0.00 and represents transactions with no promotional discount applied. Every row in fact_sales has a promotion_id — there are no NULLs in this foreign key.

---

## Suggested Practice Scenarios

| Scenario | Tables Needed |
|---|---|
| Monthly revenue trend with YoY growth | fact_sales + dim_date |
| Top 10 products by gross profit margin | fact_sales + dim_product |
| Channel performance comparison | fact_sales + dim_store |
| Promotion ROI and discount effectiveness | fact_sales + dim_promotion |
| Customer segment revenue breakdown | fact_sales + dim_customer |
| Holiday vs. non-holiday sales lift | fact_sales + dim_date |
| Return rate by category | fact_sales + dim_product |
| Cohort analysis by signup month | fact_sales + dim_customer + dim_date |
| Weekend vs. weekday basket size | fact_sales + dim_date |
| Fiscal quarter close reporting | fact_sales + dim_date + dim_product |
