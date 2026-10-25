# Module 6 Academic Demo: JavaServer Pages (JSP)

## 1. Syllabus Context
- **Module 6: Web Servers**: Mandates practical coverage of JavaServer Pages (JSP), server-side rendering, and web application lifecycle.

## 2. Component Overview
- File: `academic-demos/jsp/MenuReport.jsp`
- Purpose: Demonstrates Java server-side scripting (scriptlets `<% %>`, expressions `<%= %>`, page directives `<%@ page %>`) to generate an audit report of verified VIT food outlets.
- Relationship to Node.js Stack: While the primary application operates on Node.js/Express, this module demonstrates the Enterprise Java equivalent, showing how a JSP servlet engine (e.g. Apache Tomcat) consumes RESTful JSON endpoints from the Node.js API to render server-side HTML.

## 3. How to Deploy and Run in Apache Tomcat
1. Ensure Apache Tomcat 9 or 10 is installed and running (`catalina.bat run` or `catalina.sh run`).
2. Copy `MenuReport.jsp` into Tomcat's webapps root:
   ```bash
   cp academic-demos/jsp/MenuReport.jsp $CATALINA_HOME/webapps/ROOT/
   ```
3. Open browser at:
   `http://localhost:8080/MenuReport.jsp`
4. The page executes server-side Java byte-code to dynamically assemble the food spot audit report.
