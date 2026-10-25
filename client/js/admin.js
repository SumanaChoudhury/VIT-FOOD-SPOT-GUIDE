/**
 * VIT Food Spot Guide — Admin Dashboard & Moderation Client
 * Manages admin session, quality metrics display, recommendation moderation, and dataset imports
 */

$(document).ready(function() {
  const $modal = $('#admin-modal');
  const $loginView = $('#admin-login-view');
  const $dashView = $('#admin-dashboard-view');

  // Open Admin Modal
  $('#btn-admin-modal, #footer-admin-btn, #footer-admin-link').on('click', function(e) {
    e.preventDefault();
    $modal.addClass('open active');
    checkSessionState();
  });

  $('#btn-close-admin-modal').on('click', function() {
    $modal.removeClass('open active');
  });

  $modal.on('click', function(e) {
    if (e.target === this) {
      $modal.removeClass('open active');
    }
  });

  // Check Session
  async function checkSessionState() {
    try {
      const res = await API.checkAdminSession();
      if (res.authenticated) {
        showDashboard(res.admin);
      } else {
        showLoginForm();
      }
    } catch (e) {
      showLoginForm();
    }
  }

  function showLoginForm() {
    $loginView.show();
    $dashView.hide();
  }

  function showDashboard(admin) {
    $loginView.hide();
    $dashView.show();
    $('#admin-session-text').text(`Authenticated as: ${admin.username} (${admin.role})`);
    loadQualityMetrics();
  }

  // Handle Login Submit
  $('#admin-login-form').on('submit', async function(e) {
    e.preventDefault();
    const username = $('#admin-user-input').val().trim();
    const password = $('#admin-pass-input').val();

    const $btn = $('#btn-admin-login-submit');
    $btn.prop('disabled', true).text('Verifying...');

    try {
      const res = await API.adminLogin(username, password);
      showDashboard(res.admin);
    } catch (err) {
      alert(`Login failed: ${err.message}`);
    } finally {
      $btn.prop('disabled', false).text('Sign In to Dashboard');
    }
  });

  // Handle Logout
  $('#btn-admin-logout').on('click', async function() {
    try {
      await API.adminLogout();
      showLoginForm();
      alert('Signed out successfully.');
    } catch (err) {
      console.error('Logout error:', err);
    }
  });

  // Dashboard Tab Switching
  $('#tab-btn-quality').on('click', function() {
    $(this).addClass('active').siblings().removeClass('active');
    $('#tab-content-quality').show();
    $('#tab-content-moderation, #tab-content-import').hide();
    loadQualityMetrics();
  });

  $('#tab-btn-moderation').on('click', function() {
    $(this).addClass('active').siblings().removeClass('active');
    $('#tab-content-moderation').show();
    $('#tab-content-quality, #tab-content-import').hide();
    loadModerationQueue();
  });

  $('#tab-btn-import').on('click', function() {
    $(this).addClass('active').siblings().removeClass('active');
    $('#tab-content-import').show();
    $('#tab-content-quality, #tab-content-moderation').hide();
  });

  // Load Data Quality Metrics
  async function loadQualityMetrics() {
    $('#admin-quality-metrics').html('<div class="loading-spinner"></div>');
    try {
      const res = await API.getDataQualityMetrics();
      const m = res.data;

      const html = `
        <div style="background:var(--light); padding:16px; border-radius:8px; border:1px solid var(--border);">
          <div style="font-size:0.8rem; color:var(--text-muted); font-weight:600;">TOTAL OUTLETS</div>
          <div style="font-size:1.8rem; font-weight:800; color:var(--dark);">${m.totalFoodSpots}</div>
          <div style="font-size:0.75rem; color:#16a34a;">${m.activeFoodSpots} Active Outlets</div>
        </div>

        <div style="background:var(--light); padding:16px; border-radius:8px; border:1px solid var(--border);">
          <div style="font-size:0.8rem; color:var(--text-muted); font-weight:600;">TOTAL MENU DISHES</div>
          <div style="font-size:1.8rem; font-weight:800; color:var(--primary);">${m.totalMenuItems}</div>
          <div style="font-size:0.75rem; color:#64748b;">${m.variantPricesCount} Price Variants</div>
        </div>

        <div style="background:var(--light); padding:16px; border-radius:8px; border:1px solid var(--border);">
          <div style="font-size:0.8rem; color:var(--text-muted); font-weight:600;">MISSING PRICES</div>
          <div style="font-size:1.8rem; font-weight:800; color:#b45309;">${m.missingPricesCount}</div>
          <div style="font-size:0.75rem; color:#64748b;">Preserved as null (unlisted)</div>
        </div>

        <div style="background:var(--light); padding:16px; border-radius:8px; border:1px solid var(--border);">
          <div style="font-size:0.8rem; color:var(--text-muted); font-weight:600;">DIETARY BREAKDOWN</div>
          <div style="font-size:0.9rem; font-weight:700; margin-top:4px;">
            <span style="color:#16a34a;">Veg: ${m.vegDishesCount}</span> &bull; 
            <span style="color:#dc2626;">Non-Veg: ${m.nonVegDishesCount}</span>
          </div>
          <div style="font-size:0.75rem; color:#64748b;">Unclassified: ${m.unclassifiedCount}</div>
        </div>

        <div style="background:var(--light); padding:16px; border-radius:8px; border:1px solid var(--border);">
          <div style="font-size:0.8rem; color:var(--text-muted); font-weight:600;">RECOMMENDATIONS</div>
          <div style="font-size:1.8rem; font-weight:800; color:#2563eb;">${m.totalRecommendations}</div>
          <div style="font-size:0.75rem; color:#ea580c; font-weight:bold;">${m.pendingRecommendations} Pending Moderation</div>
        </div>
      `;

      $('#admin-quality-metrics').html(html);
    } catch (err) {
      $('#admin-quality-metrics').html(`<p style="color:red;">Error loading metrics: ${err.message}</p>`);
    }
  }

  // Load Moderation Queue
  async function loadModerationQueue() {
    $('#admin-moderation-list').html('<div class="loading-spinner"></div>');
    try {
      const res = await API.getAllRecommendations();
      const recs = res.data || [];

      if (recs.length === 0) {
        $('#admin-moderation-list').html('<p style="color:var(--text-muted);">No recommendations found.</p>');
        return;
      }

      const html = recs.map(r => {
        const isPending = r.status === 'pending';
        const isApproved = r.status === 'approved';
        const statusColor = isPending ? '#ea580c' : (isApproved ? '#16a34a' : '#dc2626');

        return `
          <div style="background:var(--light); padding:14px; border-radius:8px; border:1px solid var(--border); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
            <div>
              <span class="rec-category-badge">${escapeHtml(r.category)}</span>
              <strong style="margin-left:6px; font-size:1rem;">${escapeHtml(r.dishName)}</strong> at <em>${escapeHtml(r.foodSpotName)}</em>
              <div style="font-size:0.85rem; color:#475569; margin-top:4px;">"${escapeHtml(r.text || 'No text provided')}"</div>
              <div style="font-size:0.75rem; color:var(--text-muted); margin-top:4px;">By: ${escapeHtml(r.displayName)} &bull; Status: <span style="font-weight:bold; color:${statusColor}; text-transform:uppercase;">${r.status}</span></div>
            </div>

            <div style="display:flex; gap:8px;">
              ${isPending || r.status === 'rejected' ? `
                <button class="btn btn-primary btn-sm" style="background:#16a34a;" onclick="moderateRec('${r._id}', 'approved')">Approve</button>
              ` : ''}
              ${isPending || isApproved ? `
                <button class="btn btn-outline btn-sm" style="border-color:#dc2626; color:#dc2626;" onclick="moderateRec('${r._id}', 'rejected')">Reject</button>
              ` : ''}
            </div>
          </div>
        `;
      }).join('');

      $('#admin-moderation-list').html(html);
    } catch (err) {
      $('#admin-moderation-list').html(`<p style="color:red;">Error loading submissions: ${err.message}</p>`);
    }
  }

  // Handle Dataset Upload Form
  $('#admin-import-form').on('submit', async function(e) {
    e.preventDefault();
    const spotSlug = $('#import-spot-select').val();
    const file = $('#import-file-input')[0].files[0];

    if (!spotSlug || !file) {
      alert('Please select both a target food spot and a file.');
      return;
    }

    const formData = new FormData();
    formData.append('foodSpotSlug', spotSlug);
    formData.append('datasetFile', file);

    const $btn = $('#btn-run-import');
    $btn.prop('disabled', true).text('Processing Ingestion Pipeline...');
    $('#import-status-msg').html('<span style="color:#0284c7;">Ingesting and validating dataset...</span>');

    try {
      const res = await API.importDatasetFile(formData);
      $('#import-status-msg').html(`<span style="color:#16a34a; font-weight:bold;">&#10003; ${res.message}</span>`);
      $('#admin-import-form')[0].reset();
      loadQualityMetrics();
    } catch (err) {
      $('#import-status-msg').html(`<span style="color:#dc2626; font-weight:bold;">Import failed: ${err.message}</span>`);
    } finally {
      $btn.prop('disabled', false).text('Upload & Process Menu');
    }
  });

  // Global Moderation Action Function
  window.moderateRec = async function(id, status) {
    try {
      await API.updateRecommendationStatus(id, status);
      loadModerationQueue();
    } catch (err) {
      alert(`Could not update recommendation: ${err.message}`);
    }
  };

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
});
