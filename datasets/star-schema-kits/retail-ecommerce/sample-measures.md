# Retail & E-Commerce Star Schema — Sample Measures

## DAX (Power BI / Analysis Services)

### Revenue Measures
```dax
Total Gross Revenue =
SUM(fact_sales[gross_revenue])

Total Net Revenue =
SUM(fact_sales[net_revenue])

Total Discount Amount =
SUM(fact_sales[discount_amount])

Discount Rate =
DIVIDE(
    SUM(fact_sales[discount_amount]),
    SUM(fact_sales[gross_revenue]),
    0
)
```

### Profitability
```dax
Gross Profit =
SUM(fact_sales[gross_profit])

Gross Margin % =
DIVIDE(
    SUM(fact_sales[gross_profit]),
    SUM(fact_sales[net_revenue]),
    0
)

COGS =
SUM(fact_sales[cogs])
```

### Volume
```dax
Total Units Sold =
SUM(fact_sales[quantity])

Total Transactions =
COUNTROWS(fact_sales)

Avg Order Value =
DIVIDE(
    SUM(fact_sales[net_revenue]),
    COUNTROWS(fact_sales),
    0
)

Return Rate =
DIVIDE(
    CALCULATE(COUNTROWS(fact_sales), fact_sales[is_return] = "TRUE"),
    COUNTROWS(fact_sales),
    0
)
```

### Time Intelligence (requires dim_date relationship)
```dax
Revenue MTD =
CALCULATE(
    [Total Net Revenue],
    DATESMTD(dim_date[full_date])
)

Revenue YTD =
CALCULATE(
    [Total Net Revenue],
    DATESYTD(dim_date[full_date])
)

Revenue PY =
CALCULATE(
    [Total Net Revenue],
    SAMEPERIODLASTYEAR(dim_date[full_date])
)

Revenue YoY Growth % =
DIVIDE(
    [Total Net Revenue] - [Revenue PY],
    [Revenue PY],
    0
)

Revenue Rolling 90 Days =
CALCULATE(
    [Total Net Revenue],
    DATESINPERIOD(dim_date[full_date], LASTDATE(dim_date[full_date]), -90, DAY)
)
```

### Customer Metrics
```dax
Unique Customers =
DISTINCTCOUNT(fact_sales[customer_id])

Revenue per Customer =
DIVIDE(
    [Total Net Revenue],
    [Unique Customers],
    0
)

New vs Returning =
-- Requires knowing first purchase date per customer
VAR FirstPurchase =
    MINX(
        FILTER(ALL(fact_sales), fact_sales[customer_id] = SELECTEDVALUE(fact_sales[customer_id])),
        RELATED(dim_date[full_date])
    )
RETURN
IF(FirstPurchase = MIN(dim_date[full_date]), "New", "Returning")
```

---

## SQL (Standard / T-SQL / Spark SQL)

### Basic Revenue Summary
```sql
SELECT
    dp.category,
    ds.region,
    dd.fiscal_year,
    dd.fiscal_quarter,
    COUNT(fs.sale_id)              AS transaction_count,
    SUM(fs.quantity)               AS units_sold,
    SUM(fs.gross_revenue)          AS gross_revenue,
    SUM(fs.discount_amount)        AS total_discounts,
    SUM(fs.net_revenue)            AS net_revenue,
    SUM(fs.gross_profit)           AS gross_profit,
    SUM(fs.gross_profit)
        / NULLIF(SUM(fs.net_revenue), 0) AS gross_margin_pct
FROM fact_sales fs
JOIN dim_product  dp ON fs.product_id  = dp.product_id
JOIN dim_store    ds ON fs.store_id    = ds.store_id
JOIN dim_date     dd ON fs.date_id     = dd.date_id
WHERE fs.is_return = 'FALSE'
GROUP BY 1, 2, 3, 4
ORDER BY 3, 4, 1;
```

### Top Products by Revenue
```sql
SELECT
    dp.product_id,
    dp.product_name,
    dp.category,
    dp.brand,
    COUNT(fs.sale_id)     AS transactions,
    SUM(fs.quantity)      AS units_sold,
    SUM(fs.net_revenue)   AS net_revenue,
    SUM(fs.gross_profit)  AS gross_profit,
    ROUND(SUM(fs.gross_profit) / NULLIF(SUM(fs.net_revenue), 0) * 100, 1) AS margin_pct
FROM fact_sales fs
JOIN dim_product dp ON fs.product_id = dp.product_id
WHERE fs.is_return = 'FALSE'
GROUP BY 1, 2, 3, 4
ORDER BY net_revenue DESC
LIMIT 20;
```

### Promotion Effectiveness
```sql
SELECT
    pr.promotion_name,
    pr.promo_type,
    pr.discount_pct,
    COUNT(fs.sale_id)          AS transactions,
    SUM(fs.discount_amount)    AS total_discounts_given,
    SUM(fs.net_revenue)        AS net_revenue,
    SUM(fs.gross_profit)       AS gross_profit,
    AVG(fs.quantity)           AS avg_units_per_transaction
FROM fact_sales fs
JOIN dim_promotion pr ON fs.promotion_id = pr.promotion_id
WHERE fs.is_return = 'FALSE'
GROUP BY 1, 2, 3
ORDER BY net_revenue DESC;
```

### Month-over-Month Revenue (window function)
```sql
WITH monthly AS (
    SELECT
        dd.fiscal_year,
        dd.month,
        dd.month_name,
        SUM(fs.net_revenue) AS monthly_revenue
    FROM fact_sales fs
    JOIN dim_date dd ON fs.date_id = dd.date_id
    WHERE fs.is_return = 'FALSE'
    GROUP BY 1, 2, 3
)
SELECT
    fiscal_year,
    month,
    month_name,
    monthly_revenue,
    LAG(monthly_revenue) OVER (ORDER BY fiscal_year, month) AS prior_month_revenue,
    ROUND(
        (monthly_revenue - LAG(monthly_revenue) OVER (ORDER BY fiscal_year, month))
        / NULLIF(LAG(monthly_revenue) OVER (ORDER BY fiscal_year, month), 0) * 100,
    1) AS mom_growth_pct
FROM monthly
ORDER BY fiscal_year, month;
```

### Customer Cohort Analysis (first purchase month)
```sql
WITH cohorts AS (
    SELECT
        fs.customer_id,
        MIN(dd.fiscal_year * 100 + dd.month) AS cohort_month
    FROM fact_sales fs
    JOIN dim_date dd ON fs.date_id = dd.date_id
    GROUP BY 1
)
SELECT
    c.cohort_month,
    COUNT(DISTINCT fs.customer_id) AS customers,
    SUM(fs.net_revenue)            AS cohort_lifetime_revenue,
    SUM(fs.net_revenue) / COUNT(DISTINCT fs.customer_id) AS avg_ltv
FROM fact_sales fs
JOIN cohorts c ON fs.customer_id = c.customer_id
GROUP BY 1
ORDER BY 1;
```

### Weekend vs Weekday Performance
```sql
SELECT
    dd.is_weekend,
    dd.retail_season,
    COUNT(fs.sale_id)    AS transactions,
    SUM(fs.net_revenue)  AS net_revenue,
    AVG(fs.net_revenue)  AS avg_transaction_value,
    SUM(fs.quantity)     AS units_sold
FROM fact_sales fs
JOIN dim_date dd ON fs.date_id = dd.date_id
WHERE fs.is_return = 'FALSE'
GROUP BY 1, 2
ORDER BY 2, 1;
```
