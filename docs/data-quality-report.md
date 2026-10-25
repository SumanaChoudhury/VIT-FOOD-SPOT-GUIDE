# Data Quality Report: VIT Food Spot Guide

Generated on: **2026-10-23T07:45:51.004Z**

## 1. Overview Statistics
- **Total Source Files Inspected**: 22 files (20 CSV, 2 XLSX)
- **Active Files Ingested**: 20 files
- **Duplicate / Draft Files Identified & Safely Handled**: 2 files
  - `IMPERIAL (1).csv` — Byte-for-byte duplicate of `IMPERIAL.csv` (Ignored).
  - `chai_shop_menu.xlsx` — Preliminary draft with unreadable photo prices (Superseded by verified `namachai.xlsx`).
- **Total Raw Rows Processed**: 3036
- **Successfully Ingested Menu Items**: 3034
- **Incomplete / Damaged Rows Discarded**: 2
  - Example: Row in `dcmgb.csv` truncated as `Cakes,Blue` without item name or price.
- **Items with Missing Price (Preserved with `price: null` & labeled "Price not listed")**: 57
- **Items with Size Variants Parsed (e.g. Regular/Medium/Large or 40/70)**: 80
- **Unclassified Items (Marked transparently as `unknown` source)**: 970
- **Total Outlets in Directory**: 32 verified outlets
- **Outlets with Verified Menus**: 24
- **Outlets Awaiting Menu Provision (Transparently Labeled)**: 8

---

## 2. Per-Dataset Breakdown

| Source File | Associated Outlet | Total Rows | Ingested Dishes | Missing Prices | Variant Prices | Discarded Rows |
|---|---|---|---|---|---|---|
| `apples.csv` | Apples Juice & Snacks | 186 | 185 | 0 | 16 | 1 |
| `arasan.csv` | Arasan | 368 | 368 | 0 | 0 | 0 |
| `auntymess.csv` | Aunty's Mess | 234 | 234 | 0 | 0 | 0 |
| `DC.csv` | DC (Darling Cafe near TT) | 419 | 419 | 0 | 0 | 0 |
| `dcmgb.csv` | Darling Cafe (MGB) | 41 | 41 | 1 | 0 | 0 |
| `dominos.csv` | Domino's Pizza | 102 | 102 | 0 | 0 | 0 |
| `flora.csv` | Flora | 250 | 250 | 0 | 0 | 0 |
| `Garnish.csv` | Garnish | 51 | 51 | 29 | 0 | 0 |
| `hangandswig.csv` | Hangy and Swig | 156 | 156 | 0 | 0 | 0 |
| `IMPERIAL.csv` | Imperial Goli Soda | 49 | 49 | 0 | 0 | 0 |
| `justbake.csv` | Just Bake | 181 | 181 | 0 | 0 | 0 |
| `kc.csv` | KC Food | 105 | 105 | 0 | 0 | 0 |
| `lassi.csv` | Lassi House | 97 | 97 | 0 | 0 | 0 |
| `madrascoffee.csv` | Madras Coffee House | 57 | 57 | 0 | 0 | 0 |
| `namachai.xlsx` | Nama Chai | 19 | 19 | 0 | 0 | 0 |
| `nescafe.csv` | Nescafe (SJT) | 33 | 32 | 1 | 0 | 1 |
| `oliv.csv` | Olives | 54 | 54 | 18 | 0 | 0 |
| `onefoodworld.csv` | One Food World | 321 | 321 | 8 | 41 | 0 |
| `srisabari.csv` | Sri Sabari | 63 | 63 | 0 | 15 | 0 |
| `srisai.csv` | Sri Sai Sabari | 250 | 250 | 0 | 8 | 0 |

---

## 3. Data Cleaning & Normalization Rules Enforced
1. **Citation Removal**: Scraped citations like `[cite: 5]` in `dcmgb.csv` were systematically sanitized using regex.
2. **Missing Price Guarantee**: Missing prices are strictly stored as `price: null`. They are **never** treated as ₹0 to prevent distorting budget searches.
3. **One Food World Normalization**: Prefixed categories (e.g. `Al Beirut - Hummus Roll`) were parsed into Counter = `Al Beirut` and Category = `Hummus Roll`.
4. **Fast Food Rule**: Pizza, burgers, and wraps are guaranteed to include the **Fast Food** category tag.
5. **No Hallucinated Outlets**: Outlets with missing menus (such as `Good Vibes`, `Aavin Tea Stall`, `FC`) are displayed with verified metadata and marked with the clean status: *"Menu information not available yet."*
