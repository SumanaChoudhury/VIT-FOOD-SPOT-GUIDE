# Setup & Deployment Guide: VIT Food Spot Guide

## 1. Prerequisites
- **Node.js**: Version 18.0.0 or higher (Tested on Node.js v24.16.0).
- **NPM**: Version 9.0.0 or higher (Tested on NPM v11.13.0).
- **Java JDK** (Optional, for academic JDBC/JSP compilation): JDK 17 or higher (Tested on Oracle JDK 21 LTS).
- **MongoDB** (Optional): MongoDB Community Server or MongoDB Atlas cluster.
  *(Note: The system contains an automatic In-Memory/JSON Persistence Fallback engine, meaning the entire application runs 100% out-of-the-box on student laptops even if MongoDB is not locally installed!)*

---

## 2. Quick Start (Windows PowerShell / Command Prompt)

### Step 1: Open Terminal in Project Directory
```powershell
cd C:\Users\pavit\Downloads\foodspotsvit
```

### Step 2: Install Dependencies (If not already installed)
```powershell
npm install
```

### Step 3: Seed Database & Ingest Datasets
Executes the data pipeline across all 20 CSV files and 2 XLSX files, eliminates duplicates, parses prices, and generates the data quality audit report:
```powershell
npm run seed
```

### Step 4: Start the Application Server
```powershell
npm start
```
The server will start listening on port 5000:
- **Main Web Application**: `http://localhost:5000`
- **Health Check API**: `http://localhost:5000/api/health`
- **XML Feed Export**: `http://localhost:5000/api/export/xml`
- **CSV Feed Export**: `http://localhost:5000/api/export/csv`

---

## 3. Running Automated Tests
Run the 30-point comprehensive automated test suite:
```powershell
npm test
```
This automatically verifies server startup, database fallback, dataset parsing, search, budget filters, One Food World counters, Nescafe shared menus, admin authentication, rate limiting, and compiles the Java JDBC demo.

---

## 4. Academic Demos Execution

### 4.1 HTML5 Interactive Image Map
Open in any browser:
`http://localhost:5000/academic-demos/imagemap/campus-imagemap.html`

### 4.2 HTML Frames vs. Iframes
`http://localhost:5000/academic-demos/frames/modern-iframe.html`

### 4.3 XML, DTD & XSD Validation
Inspect schemas in `academic-demos/xml/`. Dynamic XML feed available at:
`http://localhost:5000/api/export/xml`

### 4.4 Java JDBC Execution
```powershell
javac academic-demos/jdbc/DatabaseReportDemo.java
java -cp academic-demos/jdbc DatabaseReportDemo
```

### 4.5 JavaServer Pages (JSP)
Copy `academic-demos/jsp/MenuReport.jsp` to `$CATALINA_HOME/webapps/ROOT/` and open `http://localhost:8080/MenuReport.jsp`.

---

## 5. Administrator Portal Credentials
- **Login URL**: Click "Admin Portal" in top navbar or footer
- **Default Username**: `admin`
- **Default Password**: `vitfoodguide2026`
- **Features**: View live data quality audit metrics, moderate student recommendations (Approve/Reject), and upload additional CSV/XLSX menu files.
