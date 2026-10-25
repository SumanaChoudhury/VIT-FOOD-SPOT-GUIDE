# Module 2 Academic Demo: HTML5 Interactive Image Map

## 1. Syllabus Context
- **Module 2: Web Designing**: Explicitly mandates the demonstration of HTML `<map>` and `<area>` elements for coordinate-based hyperlinking.

## 2. Implementation Overview
- File: `academic-demos/imagemap/campus-imagemap.html`
- Uses standard HTML5 `<map name="campusMap">` paired with `<area shape="rect" coords="...">` tags.
- Coordinates precisely encapsulate major VIT Vellore academic blocks and hostel clusters:
  - **SJT (Silver Jubilee Tower)**: `coords="40,70,220,180"` -> Discovers Nama Chai, Lassi House, Hangy and Swig, Nescafe SJT.
  - **PRP Block**: `coords="260,70,440,180"` -> Discovers Sri Sabari and Sri Sai Sabari.
  - **TT (Technology Tower)**: `coords="480,70,660,180"` -> Discovers DC near TT, FC, and Nescafe TT.
  - **Boys' Hostel Area**: `coords="40,230,260,360"` -> Discovers One Food World (with its 6 distinct counters) and Just Bake.
  - **Ladies' Hostel Area**: `coords="300,230,500,360"` -> Discovers Aunty's Mess, Good Vibes, Apples Juice, and Nescafe LH.
  - **MGB & GDN Blocks**: `coords="540,230,760,360"` -> Discovers Darling Cafe MGB, Darling Main Canteen, and Aavin Tea Stall.

## 3. How to Run
Visit directly via the running web application at:
`http://localhost:5000/academic-demos/imagemap/campus-imagemap.html`
or click the "Campus Image Map" navigation link in the top menu.
