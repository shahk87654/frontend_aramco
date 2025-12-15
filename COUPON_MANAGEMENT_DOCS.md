# Non-Fuel Revenue Coupon Management System

## Overview
Created two comprehensive coupon management pages for the Aramco Review Admin Panel with Excel export capabilities and phone-based coupon generation.

---

## Features Implemented

### 1. **Coupon Statistics Dashboard** ([AdminCouponStats.js](src/pages/AdminCouponStats.js))

#### Filters:
- **Date Range Selector**: Start and end date pickers to filter coupon data
- **Station Selector**: Optional dropdown to filter by specific station
- **Load Stats Button**: Fetches data based on selected filters

#### Display Components:
- **Summary Cards**: 
  - Total Coupons
  - Used Coupons
  - Unused Coupons
  - Utilisation Rate (%)

- **Data Table**: 
  - Station Name
  - Total Coupons
  - Used
  - Unused
  - Manual (manually generated coupons)
  - Review-Based (coupons from reviews)
  - Utilisation Rate (%)
  - Date Range

- **Totals Row**: Aggregated summary at bottom of table

#### Export Functionality:
- **Export to Excel Button**: Downloads data as `Coupon_Statistics_[YYYY-MM-DD].xlsx`
- Professional Excel formatting with headers, colors, and proper column widths

#### API Integration:
```
GET /api/admin/coupons-stats
Parameters:
  - startDate (YYYY-MM-DD format)
  - endDate (YYYY-MM-DD format)
  - stationId (optional)
```

---

### 2. **Manual Coupon Generation** ([AdminManualCoupon.js](src/pages/AdminManualCoupon.js))

#### Input Fields:
- **Phone Number**: Customer phone number input with validation
- **Station Selector**: Dropdown to select target station
- **Quantity**: Number input (1-100 range enforcement)

#### Generated Output:
- **Summary Cards**: Display phone, station, count, and generation date
- **Coupon Codes Table**: 
  - Coupon Code (monospace font)
  - Status (Used/Unused badge)
  - Copy to Clipboard Button

#### Features:
- Input validation for all fields
- Real-time quantity range enforcement (1-100)
- One-click copy-to-clipboard for coupon codes
- Clear & Generate More option
- Visual feedback for copied codes

#### API Integration:
```
POST /api/admin/coupons-by-phone
Body:
{
  "phoneNumber": "customer phone",
  "stationId": "selected station ID",
  "count": quantity (1-100)
}
```

---

## Navigation Integration

Updated [Admin.js](src/pages/Admin.js) with new tabs:
- **Dashboard** (existing)
- **Reviews** (existing)
- **Coupons** (existing)
- **Coupon Stats** ✨ NEW
- **Generate Coupons** ✨ NEW

---

## Dependencies Installed

```
@mui/x-date-pickers: Date picker components
@mui/x-data-grid: Advanced data grid (for future use)
exceljs: Excel file generation and formatting
```

All components use Material-UI (already installed) for consistent styling.

---

## Styling & UX

- **Consistent Design**: Gradient backgrounds, Material-UI components
- **Responsive Layout**: Grid system for mobile, tablet, desktop
- **Visual Feedback**: Success/error alerts, loading states, hover effects
- **Accessibility**: Proper labels, ARIA attributes, keyboard navigation
- **Data Validation**: Input validation with helpful error messages

---

## Usage

### Admin Dashboard Access:
1. Navigate to `/admin/*` (Admin Login required)
2. New tabs appear in the admin panel

### Coupon Statistics:
1. Select date range and optional station
2. Click "Load Stats"
3. Review summary cards and detailed table
4. Click "Export to Excel" to download report

### Generate Coupons:
1. Enter customer phone number
2. Select target station
3. Specify quantity (1-100)
4. Click "Generate Coupons"
5. Copy generated codes using the copy button
6. Use "Clear & Generate More" for batch generation

---

## Notes
- All API endpoints assume admin authentication token in localStorage
- Phone number validation accepts international formats
- Excel export includes formatting and automatic column width adjustment
- Component state management handled with React hooks
- Error handling with user-friendly Snackbar alerts
