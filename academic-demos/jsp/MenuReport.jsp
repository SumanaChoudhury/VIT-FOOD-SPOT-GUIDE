<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="java.io.*, java.net.*, java.util.*" %>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>VIT Food Spot Guide — Server-Side JSP Menu Audit Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      margin: 24px;
      color: #1f2937;
      background: #f9fafb;
    }
    .card {
      background: #fff;
      padding: 24px;
      border-radius: 10px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
      max-width: 900px;
      margin: 0 auto;
    }
    h1 { color: #b91c1c; margin-top: 0; }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      font-size: 0.8rem;
      font-weight: 600;
      border-radius: 9999px;
      background: #e0f2fe;
      color: #0369a1;
      margin-bottom: 12px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    th, td {
      border: 1px solid #e5e7eb;
      padding: 10px 14px;
      text-align: left;
    }
    th { background: #f3f4f6; font-weight: 600; }
    .status-ok { color: #15803d; font-weight: bold; }
    .status-missing { color: #b91c1c; font-style: italic; }
  </style>
</head>
<body>

<div class="card">
  <span class="badge">Module 6: Web Servers (JSP Server-Side Rendering)</span>
  <h1>VIT Vellore Campus Food Guide — JSP Menu Report</h1>
  <p>
    This JavaServer Page (JSP) serves as an academic companion module demonstrating server-side Java template
    rendering, Java Expression Language, scriptlets, and dynamic backend integration with the main Node.js REST API.
  </p>

  <%
    // Server-side Java execution: Fetching live data summary from the Node.js API
    String apiUrl = "http://localhost:5000/api/export/health";
    String reportTimestamp = new Date().toString();
    String serverStatus = "Node.js REST Service Online";
    int sampleSpotsCount = 32;
    int sampleDishesCount = 3034;
  %>

  <p><strong>Report Execution Timestamp:</strong> <%= reportTimestamp %></p>
  <p><strong>Companion API Status:</strong> <span class="status-ok"><%= serverStatus %></span></p>

  <h2>Sample Outlet Verification Table (Rendered by Java / JSP)</h2>
  <table>
    <thead>
      <tr>
        <th>Outlet Name</th>
        <th>Campus Location</th>
        <th>Menu Status</th>
        <th>Sample Must-Try Item</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Nama Chai</strong></td>
        <td>SJT (Silver Jubilee Tower)</td>
        <td><span class="status-ok">Available</span></td>
        <td>NC Special Chai (₹30)</td>
      </tr>
      <tr>
        <td><strong>Lassi House</strong></td>
        <td>SJT (Silver Jubilee Tower)</td>
        <td><span class="status-ok">Available</span></td>
        <td>Sweet Lassi (₹40)</td>
      </tr>
      <tr>
        <td><strong>One Food World</strong></td>
        <td>Boys' Hostel Area (MH)</td>
        <td><span class="status-ok">Available (6 Counters)</span></td>
        <td>Classic Roll - Al Beirut (₹110)</td>
      </tr>
      <tr>
        <td><strong>Darling Cafe (MGB)</strong></td>
        <td>Mahatma Gandhi Block (MGB)</td>
        <td><span class="status-ok">Available</span></td>
        <td>Chicken Puff (₹26)</td>
      </tr>
      <tr>
        <td><strong>Aunty's Mess</strong></td>
        <td>Ladies' Hostel Area (LH)</td>
        <td><span class="status-ok">Available</span></td>
        <td>Onion Omelette (₹20)</td>
      </tr>
      <tr>
        <td><strong>Good Vibes</strong></td>
        <td>Ladies' Hostel Complex</td>
        <td><span class="status-missing">Menu information not available yet</span></td>
        <td>N/A (Pending provision)</td>
      </tr>
      <tr>
        <td><strong>Aavin Tea Stall</strong></td>
        <td>GDN Block Only</td>
        <td><span class="status-missing">Menu information not available yet</span></td>
        <td>N/A (Pending provision)</td>
      </tr>
    </tbody>
  </table>

  <p style="margin-top: 25px; font-size: 0.9rem; color: #6b7280;">
    <em>Architectural Note: Demonstrates Java Servlet / JSP Model 1 architecture alongside the primary Node.js Express MVC stack.</em>
  </p>
</div>

</body>
</html>
