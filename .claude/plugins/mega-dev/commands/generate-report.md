---
name: generate-report
description: Generate business analytics reports from Firestore data
user_invocable: true
---

Generate a business analytics report for MegaHome Ulgurji.

Arguments: $ARGUMENTS

Steps:

1. **Determine Report Parameters**: Parse the arguments for:
   - **Report type**: `daily`, `weekly`, `monthly`, or `custom`
   - **Date range**: specific start/end dates, or default to current period
   - If no arguments given, default to a monthly report for the current month

2. **Review Data Schema**: Understand the Firestore collections:
   - Read `lib/types.ts` for `Order`, `ProductT`, `CategoryI`, `UserData` interfaces
   - Read `store/useOrderStore.ts` for order data structure
   - Key fields from `orders` collection: `id`, `clientName`, `clientPhone`, `date`, `basketItems[]`, `totalPrice`, `totalQuantity`, `userUid`
   - Key fields from `products` collection: `id`, `title`, `price`, `category`, `quantity`, `time`, `date`
   - Key fields from `user` collection: `uid`, `name`, `email`, `role`, `phone`, `time`, `date`
   - Key fields from `categories` collection: `id`, `name`, `subcategory[]`

3. **Create Report Generator Script**: Build or update `scripts/generate-report.ts`:
   ```bash
   mkdir -p scripts
   ```
   - Import Firebase Admin SDK from `firebase-admin` (already a dependency)
   - Initialize with service account credentials (check for `GOOGLE_APPLICATION_CREDENTIALS` env var or service account JSON)
   - Query Firestore collections with date range filters
   - Reference `firebase/config.ts` for project ID: `mega-ulgurji-1fccf`

4. **Calculate KPIs**: Compute the following metrics from the queried data:
   - **Revenue Metrics**:
     - Total revenue (sum of all `totalPrice` in period)
     - Average order value (total revenue / number of orders)
     - Revenue by day/week (time series breakdown)
   - **Order Metrics**:
     - Total orders count
     - Average items per order (`totalQuantity` average)
     - Orders by day of week distribution
   - **Product Metrics**:
     - Top 10 selling products (by frequency in `basketItems[]`)
     - Top 10 revenue-generating products (by value)
     - Products with zero sales in period
     - Low stock products (quantity below threshold)
   - **Category Metrics**:
     - Revenue breakdown by category
     - Most popular categories by order count
   - **Customer Metrics**:
     - Total unique customers (distinct `userUid`)
     - New customers in period (users registered within date range)
     - Repeat customers (users with multiple orders)
     - Top 10 customers by total spending
   - **Period Comparison** (if applicable):
     - Revenue change vs previous period (percentage)
     - Order count change vs previous period
     - New customer growth rate

5. **Generate Excel Report**: Use the `xlsx` library (already in `package.json`):
   ```bash
   npx ts-node --project tsconfig.json scripts/generate-report.ts
   ```
   - Create workbook with multiple sheets:
     - **Summary**: High-level KPIs in a dashboard layout
     - **Orders**: Full order list with date, customer, items, total
     - **Products**: Product performance table (sales count, revenue, stock)
     - **Categories**: Category breakdown with revenue and order counts
     - **Customers**: Customer list with order count, total spent, last order date
     - **Trends**: Daily/weekly time series data for charting
   - Format cells: currency columns in UZS format, dates in DD.MM.YYYY
   - Save to `reports/` directory:
     ```bash
     mkdir -p reports
     ```
   - File naming: `reports/megahome-report-{type}-{YYYY-MM-DD}.xlsx`

6. **Generate Dashboard Summary**: Create a JSON summary for potential dashboard use:
   - Save to `reports/dashboard-{YYYY-MM-DD}.json`
   - Include all KPIs in a structured format
   - Include chart-ready arrays (labels + values) for:
     - Revenue over time
     - Top products bar chart data
     - Category pie chart data
     - Order volume trend

7. **Report Output**: Present results to the user:
   - Print the KPI summary directly in the terminal
   - Show the file path of the generated Excel report
   - Show the file path of the JSON dashboard data
   - Highlight any concerning metrics:
     - Revenue decline > 10% vs previous period
     - Products with zero stock
     - Days with zero orders
   - Suggest next actions based on the data
