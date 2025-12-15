# Home Page Content Type Setup Guide

This guide explains how to set up the Home Content Type in Contentstack with Modular Blocks that reference other content types.

## 🏗️ Content Type Structure

### Content Type: `home`

**UID:** `home` (must match exactly)

### Fields

#### 1. Title (Single Line Textbox)
- **Field UID:** `title`
- **Field Name:** Title
- **Data Type:** Single Line Textbox
- **Required:** Yes
- **Unique:** Yes
- **Description:** Page title (e.g., "Home Page")

#### 2. Page Sections (Modular Blocks)
- **Field UID:** `page_sections`
- **Field Name:** Page Sections
- **Data Type:** Blocks
- **Required:** No
- **Multiple:** Yes
- **Description:** Modular blocks that define different sections of the home page

## 📦 Modular Blocks Structure

The `page_sections` field contains the following block types:

### Block 1: Slider
- **Block UID:** `slider`
- **Block Title:** Slider
- **Min Instance:** 1
- **Max Instance:** 1
- **Fields:**
  - **Banner** (Reference)
    - **Field UID:** `banner`
    - **Data Type:** Reference
    - **Reference To:** `banner`
    - **Multiple:** Yes
    - **Description:** References to banner entries for the slider

### Block 2: Service
- **Block UID:** `service`
- **Block Title:** Service
- **Min Instance:** 1
- **Max Instance:** 1
- **Fields:**
  - **Services** (Reference)
    - **Field UID:** `services`
    - **Data Type:** Reference
    - **Reference To:** `service`
    - **Multiple:** Yes
    - **Description:** References to service entries

### Block 3: Discount
- **Block UID:** `discount`
- **Block Title:** Discount
- **Fields:**
  - **Products** (Reference)
    - **Field UID:** `products`
    - **Data Type:** Reference
    - **Reference To:** `product`
    - **Multiple:** Yes
    - **Description:** References to products for the "Big Discount" section

### Block 4: New Arrivals
- **Block UID:** `new_arrivals`
- **Block Title:** New Arrivals
- **Fields:**
  - **Product** (Reference)
    - **Field UID:** `product`
    - **Data Type:** Reference
    - **Reference To:** `product`
    - **Multiple:** Yes
    - **Description:** References to products for the "New Arrivals" section

### Block 5: Best Sales
- **Block UID:** `best_sales`
- **Block Title:** Best Sales
- **Fields:**
  - **Product** (Reference)
    - **Field UID:** `product`
    - **Data Type:** Reference
    - **Reference To:** `product`
    - **Multiple:** Yes
    - **Description:** References to products for the "Best Sales" section

### Block 6: Footer
- **Block UID:** `footer`
- **Block Title:** Footer
- **Min Instance:** 1
- **Max Instance:** 1
- **Fields:**
  - **Footer** (Reference)
    - **Field UID:** `footer`
    - **Data Type:** Reference
    - **Reference To:** `footer`
    - **Multiple:** No
    - **Description:** Reference to footer entry

## 📝 Step-by-Step Setup in Contentstack

### Step 1: Create Content Type

1. Log in to Contentstack
2. Navigate to your Stack
3. Go to **Content Types** → **+ New Content Type**
4. Enter:
   - **Name:** Home
   - **UID:** `home` (exactly `home`)
   - **Description:** Home page with modular sections

### Step 2: Add Title Field

1. Click **+ Add Field**
2. Select **Single Line Textbox**
3. Configure:
   - **Field Name:** Title
   - **Field UID:** `title`
   - **Required:** Yes
   - **Unique:** Yes
4. Click **Save**

### Step 3: Add Page Sections Field (Modular Blocks)

1. Click **+ Add Field**
2. Select **Blocks**
3. Configure:
   - **Field Name:** Page Sections
   - **Field UID:** `page_sections`
   - **Multiple:** Yes
   - **Required:** No

### Step 4: Create Block Types

For each block type, click **+ Add Block** in the Blocks field:

#### A. Slider Block
1. **Block Title:** Slider
2. **Block UID:** `slider`
3. **Min Instance:** 1
4. **Max Instance:** 1
5. Add field:
   - **Field Type:** Reference
   - **Field Name:** Banner
   - **Field UID:** `banner`
   - **Reference To:** `banner`
   - **Multiple:** Yes

#### B. Service Block
1. **Block Title:** Service
2. **Block UID:** `service`
3. **Min Instance:** 1
4. **Max Instance:** 1
5. Add field:
   - **Field Type:** Reference
   - **Field Name:** Services
   - **Field UID:** `services`
   - **Reference To:** `service`
   - **Multiple:** Yes

#### C. Discount Block
1. **Block Title:** Discount
2. **Block UID:** `discount`
3. Add field:
   - **Field Type:** Reference
   - **Field Name:** Products
   - **Field UID:** `products`
   - **Reference To:** `product`
   - **Multiple:** Yes

#### D. New Arrivals Block
1. **Block Title:** New Arrivals
2. **Block UID:** `new_arrivals`
3. Add field:
   - **Field Type:** Reference
   - **Field Name:** Product
   - **Field UID:** `product`
   - **Reference To:** `product`
   - **Multiple:** Yes

#### E. Best Sales Block
1. **Block Title:** Best Sales
2. **Block UID:** `best_sales`
3. Add field:
   - **Field Type:** Reference
   - **Field Name:** Product
   - **Field UID:** `product`
   - **Reference To:** `product`
   - **Multiple:** Yes

#### F. Footer Block
1. **Block Title:** Footer
2. **Block UID:** `footer`
3. **Min Instance:** 1
4. **Max Instance:** 1
5. Add field:
   - **Field Type:** Reference
   - **Field Name:** Footer
   - **Field UID:** `footer`
   - **Reference To:** `footer`
   - **Multiple:** No

### Step 5: Publish Content Type

1. Click **Save** on the Content Type
2. Click **Publish** to make it available

### Step 6: Create Home Entry

1. Go to **Entries** → **Home**
2. Click **+ New Entry**
3. Fill in:
   - **Title:** Home Page (or any title)
4. Add blocks in **Page Sections**:
   - **Add Slider Block:**
     - Select banner entries for the slider
   - **Add Service Block:**
     - Select service entries
   - **Add Discount Block:**
     - Select products with discounts
   - **Add New Arrivals Block:**
     - Select new arrival products
   - **Add Best Sales Block:**
     - Select best-selling products
   - **Add Footer Block:**
     - Select footer entry
5. Click **Save**
6. Click **Publish**

## 🔄 How It Works

The `fetchHomePage()` function:

1. Fetches the Home entry with all references included
2. Parses the `page_sections` modular blocks
3. Extracts references from each block type
4. Transforms referenced entries to match component expectations
5. Returns structured data:
   ```javascript
   {
     title: "Home Page",
     sections: {
       slider: [...banners],
       services: [...services],
       discountProducts: [...products],
       newArrivals: [...products],
       bestSales: [...products],
       footer: {...footerData}
     }
   }
   ```

## 📊 Block Type Mapping

| Block UID | Component | Data Extracted |
|-----------|-----------|----------------|
| `slider` | SliderHome | `block.banner` → banners array |
| `service` | Wrapper | `block.services` → services array |
| `discount` | Section | `block.products` → products array |
| `new_arrivals` | Section | `block.product` → products array |
| `best_sales` | Section | `block.product` → products array |
| `footer` | Footer | `block.footer` → footer object |

## ✅ Benefits

1. **Single Source of Truth:** All home page content in one entry
2. **Easy Management:** Content editors can manage everything from one place
3. **Flexible:** Add/remove/reorder sections easily
4. **Efficient:** Single API call fetches all content
5. **Structured:** Clear organization with modular blocks

## 🔍 Troubleshooting

### Issue: References not loading
- **Check:** References are included using `.includeReference()` in the query
- **Check:** Referenced entries are published
- **Check:** Block UIDs match exactly (case-sensitive)

### Issue: Blocks not parsing correctly
- **Check:** Block structure in Contentstack matches the expected format
- **Check:** Field UIDs in blocks match the code (`banner`, `services`, `products`, etc.)
- **Check:** Browser console for block structure logs

### Issue: Empty sections
- **Check:** References are selected in the Home entry
- **Check:** Referenced entries are published
- **Check:** Block types are added to the entry

## 📝 Example Entry Structure

```
Title: Home Page

Page Sections:
  - Slider Block
    - Banner: [Banner 1, Banner 2, Banner 3, Banner 4]
  
  - Service Block
    - Services: [Service 1, Service 2, Service 3, Service 4]
  
  - Discount Block
    - Products: [Product A, Product B, Product C]
  
  - New Arrivals Block
    - Product: [Product X, Product Y, Product Z]
  
  - Best Sales Block
    - Product: [Product 1, Product 2, Product 3]
  
  - Footer Block
    - Footer: Footer Entry
```

---

**Note:** The service function automatically handles:
- Nested array format `[[{entry}]]`
- Reference extraction from modular blocks
- Data transformation to match component expectations
- Multiple field name variations

