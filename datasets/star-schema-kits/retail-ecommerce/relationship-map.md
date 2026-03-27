# Retail & E-Commerce Star Schema — Relationship Map

## Schema Diagram

```
                    ┌─────────────┐
                    │  dim_date   │
                    │  (1096 rows)│
                    └──────┬──────┘
                           │ date_id (PK → FK)
                           │
┌─────────────┐    ┌───────┴──────┐    ┌──────────────────┐
│ dim_customer│    │  fact_sales  │    │   dim_product    │
│ (500 rows)  ├────┤  (2000 rows) ├────┤   (100 rows)     │
└─────────────┘    └───────┬──────┘    └──────────────────┘
  customer_id (PK)         │           product_id (PK)
                           │
               ┌───────────┼───────────┐
               │           │           │
        ┌──────┴──────┐   │    ┌──────┴──────────┐
        │  dim_store  │   │    │  dim_promotion   │
        │  (10 rows)  │   │    │  (12 rows)       │
        └─────────────┘   │    └──────────────────┘
          store_id (PK)    │      promotion_id (PK)
                           │
                     (fact_sales is
                     the center table)
```

## Relationship Definitions

| Relationship | From | To | Type | Notes |
|---|---|---|---|---|
| Sales → Date | fact_sales.date_id | dim_date.date_id | Many-to-One | Every sale has exactly one date |
| Sales → Customer | fact_sales.customer_id | dim_customer.customer_id | Many-to-One | Every sale has exactly one customer |
| Sales → Product | fact_sales.product_id | dim_product.product_id | Many-to-One | Every sale has exactly one product |
| Sales → Store | fact_sales.store_id | dim_store.store_id | Many-to-One | Every sale occurs at exactly one store/channel |
| Sales → Promotion | fact_sales.promotion_id | dim_promotion.promotion_id | Many-to-One | PROMO001 = no promotion applied |

## Key Design Decisions

**Date dimension as a proper dim table:** Rather than storing raw dates in the fact table, `date_id` (YYYYMMDD integer key) joins to `dim_date` which carries fiscal calendar, retail season, weekend/holiday flags, and week-of-year. This enables time intelligence in any BI tool without custom date logic.

**"No Promotion" as a row:** `PROMO001` represents no promotion — discount_pct = 0. This avoids NULLs in the fact table and keeps aggregations clean. Every sale has a promotion_id, even if it's "none."

**Pre-calculated metrics in the fact table:** `gross_revenue`, `net_revenue`, `cogs`, `gross_profit`, and `discount_amount` are stored rather than computed at query time. This speeds up BI tool performance at the cost of storage — a common enterprise pattern.

**order_channel denormalized onto fact:** `order_channel` is also on `dim_store` but is duplicated on the fact for query convenience. Either is correct; document your choice.

## Grain

**One row per line item sold.** A single order with 3 products = 3 rows in fact_sales, each with the same `date_id` and `customer_id` but different `product_id`. There is no order-level fact table in this kit (that would be a separate fact for order header aggregations).
