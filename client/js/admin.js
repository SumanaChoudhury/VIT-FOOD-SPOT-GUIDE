/**
 * VIT Food Spot Guide — Admin Dashboard & Operations Controller
 * Provides full CRUD for restaurants (food spots) and menu items,
 * along with database quality audit metrics.
 */

$(document).ready(function() {
  const $modal = $('#admin-modal');
  const $loginView = $('#admin-login-view');
  const $dashView = $('#admin-dashboard-view');

  // Internal cache of spots and dishes for fast editing & lookup
  let allAdminSpots = [];
  let allAdminDishes = [];

  // =========================================================================
  // MODAL TOGGLING & SESSION STATE
  // =========================================================================

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

  async function checkSessionState() {
    try {
      const res = await API.checkAdminSession();
      if (res && res.authenticated) {
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
    const adminLabel = admin ? `${admin.username} (${admin.role})` : 'admin (admin)';
    $('#admin-session-text').text(`Authenticated as: ${adminLabel}`);
    loadQualityMetrics();
    loadAdminSpots();
    loadAdminDishes();
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
      $btn.prop('disabled', false).text('Sign in to Dashboard');
    }
  });

  // Handle Logout
  $('#btn-admin-logout').on('click', async function() {
    try {
      await API.adminLogout();
      showLoginForm();
    } catch (err) {
      console.error('Logout error:', err);
      showLoginForm();
    }
  });

  // =========================================================================
  // TAB NAVIGATION
  // =========================================================================

  $('#tab-btn-quality').on('click', function() {
    $(this).addClass('active').siblings().removeClass('active');
    $('#tab-content-quality').show();
    $('#tab-content-spots, #tab-content-dishes').hide();
    loadQualityMetrics();
  });

  $('#tab-btn-spots').on('click', function() {
    $(this).addClass('active').siblings().removeClass('active');
    $('#tab-content-spots').show();
    $('#tab-content-quality, #tab-content-dishes').hide();
    loadAdminSpots();
  });

  $('#tab-btn-dishes').on('click', function() {
    $(this).addClass('active').siblings().removeClass('active');
    $('#tab-content-dishes').show();
    $('#tab-content-quality, #tab-content-spots').hide();
    loadAdminDishes();
  });

  // =========================================================================
  // 1. QUALITY METRICS
  // =========================================================================

  async function loadQualityMetrics() {
    $('#admin-quality-metrics').html('<div class="loading-spinner"></div>');
    try {
      const res = await API.getDataQualityMetrics();
      const m = res.data;

      $('#admin-spots-badge-count').text(m.totalFoodSpots);
      $('#admin-dishes-badge-count').text(m.totalMenuItems);

      const html = `
        <div class="admin-metric-card">
          <div class="admin-metric-label">TOTAL RESTAURANTS</div>
          <div class="admin-metric-value" style="color:var(--text-dark);">${m.totalFoodSpots}</div>
          <div class="admin-metric-sub" style="color:#16a34a;">${m.activeFoodSpots} Active on Campus</div>
        </div>

        <div class="admin-metric-card">
          <div class="admin-metric-label">TOTAL MENU DISHES</div>
          <div class="admin-metric-value" style="color:#C5A059;">${m.totalMenuItems}</div>
          <div class="admin-metric-sub" style="color:#64748b;">Live Authenticated Items</div>
        </div>

        <div class="admin-metric-card">
          <div class="admin-metric-label">MISSING / UNLISTED PRICES</div>
          <div class="admin-metric-value" style="color:#b45309;">${m.missingPricesCount}</div>
          <div class="admin-metric-sub" style="color:#64748b;">Displayed as "Price not listed"</div>
        </div>

        <div class="admin-metric-card">
          <div class="admin-metric-label">DIETARY CLASSIFICATION</div>
          <div style="font-size:0.95rem; font-weight:700; margin-top:8px;">
            <span style="color:#16a34a;">Veg: ${m.vegDishesCount}</span> &bull; 
            <span style="color:#dc2626;">Non-Veg: ${m.nonVegDishesCount}</span>
          </div>
          <div class="admin-metric-sub" style="color:#64748b; margin-top:4px;">Unclassified: ${m.unclassifiedCount}</div>
        </div>

        <div class="admin-metric-card">
          <div class="admin-metric-label">COMMUNITY REVIEWS</div>
          <div class="admin-metric-value" style="color:#2563eb;">${m.totalRecommendations}</div>
          <div class="admin-metric-sub" style="color:#16a34a;">Verified Student Feedback</div>
        </div>

        <div class="admin-metric-card">
          <div class="admin-metric-label">DATABASE ENGINE</div>
          <div class="admin-metric-value" style="font-size:1.3rem; color:var(--text-dark);">${m.databaseEngine.toUpperCase()}</div>
          <div class="admin-metric-sub" style="color:#16a34a;">Relational Storage Operational</div>
        </div>
      `;

      $('#admin-quality-metrics').html(html);
    } catch (err) {
      $('#admin-quality-metrics').html(`<p style="color:#dc2626; padding:12px;">Error loading metrics: ${escapeHtml(err.message)}</p>`);
    }
  }

  // =========================================================================
  // 2. RESTAURANTS (FOOD SPOTS) MANAGEMENT
  // =========================================================================

  async function loadAdminSpots() {
    $('#admin-spots-tbody').html('<tr><td colspan="7" style="text-align:center; padding:24px;">Loading restaurants...</td></tr>');
    try {
      const res = await API.getAdminFoodSpots();
      allAdminSpots = res.data || [];

      // Update spot selection dropdowns
      populateSpotDropdowns(allAdminSpots);
      renderAdminSpotsTable();
    } catch (err) {
      $('#admin-spots-tbody').html(`<tr><td colspan="7" style="color:#dc2626; text-align:center; padding:20px;">Failed to load restaurants: ${escapeHtml(err.message)}</td></tr>`);
    }
  }

  function populateSpotDropdowns(spots) {
    // 1. Menu filter dropdown
    const currentFilterVal = $('#admin-dish-spot-filter').val();
    let filterOptions = '<option value="">-- All Restaurants --</option>';
    spots.forEach(s => {
      filterOptions += `<option value="${escapeHtml(s.id)}">${escapeHtml(s.name)} (${escapeHtml(s.locationId.toUpperCase())})</option>`;
    });
    $('#admin-dish-spot-filter').html(filterOptions);
    if (currentFilterVal) $('#admin-dish-spot-filter').val(currentFilterVal);

    // 2. Dish Form restaurant dropdown
    let formOptions = '<option value="">Select Restaurant...</option>';
    spots.forEach(s => {
      formOptions += `<option value="${escapeHtml(s.id)}">${escapeHtml(s.name)} (${escapeHtml(s.locationId.toUpperCase())})</option>`;
    });
    $('#dish-form-spot-id').html(formOptions);
  }

  function renderAdminSpotsTable() {
    const searchVal = $('#admin-spot-search').val().trim().toLowerCase();
    const locVal = $('#admin-spot-location-filter').val().toLowerCase();

    let filtered = allAdminSpots.filter(s => {
      if (locVal && (s.locationId || '').toLowerCase() !== locVal && (s.location || '').toLowerCase() !== locVal) {
        return false;
      }
      if (searchVal) {
        const nameMatch = (s.name || '').toLowerCase().includes(searchVal);
        const locMatch = (s.specificLocation || '').toLowerCase().includes(searchVal) || (s.locationId || '').toLowerCase().includes(searchVal);
        const descMatch = (s.description || '').toLowerCase().includes(searchVal);
        return nameMatch || locMatch || descMatch;
      }
      return true;
    });

    if (filtered.length === 0) {
      $('#admin-spots-tbody').html('<tr><td colspan="7" style="text-align:center; padding:24px; color:var(--text-muted);">No matching restaurants found.</td></tr>');
      return;
    }

    const rows = filtered.map(s => {
      const isAvailable = s.status === 'available';
      const statusPill = isAvailable
        ? '<span class="admin-badge admin-badge-success">Active</span>'
        : '<span class="admin-badge admin-badge-danger">Unavailable</span>';

      const locName = formatLocationName(s.locationId);

      return `
        <tr data-spot-id="${escapeHtml(s.id)}">
          <td>
            <div style="font-weight:700; color:var(--text-dark);">${escapeHtml(s.name)}</div>
            <div style="font-size:0.75rem; color:var(--text-muted); font-family:monospace;">${escapeHtml(s.slug || s.id)}</div>
          </td>
          <td>
            <div style="font-weight:600; color:#1C231F;">${escapeHtml(locName)}</div>
            <div style="font-size:0.75rem; color:var(--text-muted);">${escapeHtml(s.specificLocation || 'VIT Campus')}</div>
          </td>
          <td><span style="font-size:0.82rem; color:#4A443C;">${escapeHtml(s.zone || 'Academic')}</span></td>
          <td><span style="font-size:0.82rem; font-style:italic;">${escapeHtml(s.mustTryItem || '—')}</span></td>
          <td>${statusPill}</td>
          <td>
            <span class="admin-badge admin-badge-gold" style="font-weight:700;">${s.itemCount || 0} dishes</span>
          </td>
          <td style="text-align:right; white-space:nowrap;">
            <button type="button" class="admin-btn-action btn-view-spot-menu" data-id="${escapeHtml(s.id)}" title="View & Manage Menu Dishes">Dishes</button>
            <button type="button" class="admin-btn-action btn-edit-spot" data-id="${escapeHtml(s.id)}" title="Edit Restaurant Details">Edit</button>
            <button type="button" class="admin-btn-action btn-delete-spot delete" data-id="${escapeHtml(s.id)}" data-name="${escapeHtml(s.name)}" title="Delete Restaurant">Delete</button>
          </td>
        </tr>
      `;
    }).join('');

    $('#admin-spots-tbody').html(rows);
  }

  function formatLocationName(locId) {
    const map = {
      prp: 'PRP (Pearl Research Park)',
      sjt: 'SJT (Silver Jubilee Tower)',
      tt: 'TT (Technology Tower)',
      mgb: 'MGB (Mahatma Gandhi Block)',
      gdn: 'GDN (G.D. Naidu Block)',
      smv: 'SMV (Sir M. Visvesvaraya)',
      lh: "Ladies' Hostel (LH)",
      mh: "Men's Hostel (MH)",
      library: 'Central Library & Walkway',
      kc: 'KC Food & Gazebo Hub'
    };
    return map[locId] || (locId ? locId.toUpperCase() : 'Campus');
  }

  // Filter events for restaurants table
  $('#admin-spot-search, #admin-spot-location-filter').on('input change', renderAdminSpotsTable);

  // Add Restaurant Modal Trigger
  $('#btn-open-add-spot').on('click', function() {
    $('#spot-form-title').text('Add New Restaurant');
    $('#spot-form-mode').val('add');
    $('#spot-form-target-id').val('');
    $('#admin-spot-edit-form')[0].reset();
    $('#spot-form-slug-wrapper').show();
    $('#modal-spot-form').addClass('open active');
  });

  // Edit Restaurant
  $(document).on('click', '.btn-edit-spot', function() {
    const id = $(this).data('id');
    const spot = allAdminSpots.find(s => s.id === id || s.slug === id);
    if (!spot) return;

    $('#spot-form-title').text(`Edit Restaurant: ${spot.name}`);
    $('#spot-form-mode').val('edit');
    $('#spot-form-target-id').val(spot.id);

    $('#spot-form-name').val(spot.name);
    $('#spot-form-slug').val(spot.slug || spot.id);
    $('#spot-form-slug-wrapper').hide(); // Cannot alter primary slug in edit mode
    $('#spot-form-location').val(spot.locationId || spot.location || 'prp');
    $('#spot-form-zone').val(spot.zone || 'Academic Blocks');
    $('#spot-form-specific-loc').val(spot.specificLocation || '');
    const catStr = Array.isArray(spot.categories) ? spot.categories.join(', ') : (spot.categories || '');
    $('#spot-form-categories').val(catStr);
    $('#spot-form-desc').val(spot.description || '');
    $('#spot-form-must-try').val(spot.mustTryItem || '');
    $('#spot-form-status').val(spot.status || 'available');

    $('#modal-spot-form').addClass('open active');
  });

  $('#btn-close-spot-form, #btn-cancel-spot-form').on('click', function() {
    $('#modal-spot-form').removeClass('open active');
  });

  // Save Restaurant Form Submit
  $('#admin-spot-edit-form').on('submit', async function(e) {
    e.preventDefault();
    const mode = $('#spot-form-mode').val();
    const targetId = $('#spot-form-target-id').val();

    const payload = {
      name: $('#spot-form-name').val().trim(),
      slug: $('#spot-form-slug').val().trim(),
      locationId: $('#spot-form-location').val(),
      zone: $('#spot-form-zone').val(),
      specificLocation: $('#spot-form-specific-loc').val().trim(),
      categories: $('#spot-form-categories').val().split(',').map(c => c.trim()).filter(Boolean),
      description: $('#spot-form-desc').val().trim(),
      mustTryItem: $('#spot-form-must-try').val().trim(),
      status: $('#spot-form-status').val()
    };

    const $btn = $('#btn-save-spot-form');
    $btn.prop('disabled', true).text('Saving...');

    try {
      if (mode === 'add') {
        await API.addAdminFoodSpot(payload);
        alert('Restaurant created successfully!');
      } else {
        await API.updateAdminFoodSpot(targetId, payload);
        alert('Restaurant updated successfully!');
      }
      $('#modal-spot-form').removeClass('open active');
      await loadAdminSpots();
      loadQualityMetrics();
      // Notify main app to refresh explore views
      if (window.AppState && typeof window.AppState.refreshSpots === 'function') {
        window.AppState.refreshSpots();
      }
    } catch (err) {
      alert(`Error saving restaurant: ${err.message}`);
    } finally {
      $btn.prop('disabled', false).text('Save Restaurant');
    }
  });

  // Delete Restaurant
  $(document).on('click', '.btn-delete-spot', async function() {
    const id = $(this).data('id');
    const name = $(this).data('name');

    if (!confirm(`Are you sure you want to delete restaurant "${name}" and all of its dishes?\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      await API.deleteAdminFoodSpot(id);
      alert(`Restaurant "${name}" has been deleted.`);
      await loadAdminSpots();
      loadQualityMetrics();
      if (window.AppState && typeof window.AppState.refreshSpots === 'function') {
        window.AppState.refreshSpots();
      }
    } catch (err) {
      alert(`Error deleting restaurant: ${err.message}`);
    }
  });

  // View Dishes for specific restaurant
  $(document).on('click', '.btn-view-spot-menu', function() {
    const spotId = $(this).data('id');
    $('#tab-btn-dishes').trigger('click');
    $('#admin-dish-spot-filter').val(spotId).trigger('change');
  });

  // =========================================================================
  // 3. MENU ITEMS CRUD MANAGEMENT
  // =========================================================================

  async function loadAdminDishes() {
    $('#admin-dishes-tbody').html('<tr><td colspan="7" style="text-align:center; padding:24px;">Loading menu dishes...</td></tr>');
    const spotFilter = $('#admin-dish-spot-filter').val();
    const searchFilter = $('#admin-dish-search').val().trim();
    const dietFilter = $('#admin-dish-diet-filter').val();

    try {
      const res = await API.getAdminMenuItems({
        foodSpot: spotFilter || undefined,
        search: searchFilter || undefined,
        dietary: dietFilter || undefined,
        limit: 1000
      });

      allAdminDishes = res.data || [];
      renderAdminDishesTable(allAdminDishes);
    } catch (err) {
      $('#admin-dishes-tbody').html(`<tr><td colspan="7" style="color:#dc2626; text-align:center; padding:20px;">Failed to load dishes: ${escapeHtml(err.message)}</td></tr>`);
    }
  }

  function renderAdminDishesTable(dishes) {
    if (dishes.length === 0) {
      $('#admin-dishes-tbody').html('<tr><td colspan="7" style="text-align:center; padding:24px; color:var(--text-muted);">No dishes match the selected criteria.</td></tr>');
      return;
    }

    const rows = dishes.map(d => {
      const isVeg = d.dietary === 'veg';
      const isNonVeg = d.dietary === 'non-veg';
      const dietDot = isVeg
        ? '<span class="admin-diet-dot veg" title="Vegetarian"></span>'
        : (isNonVeg ? '<span class="admin-diet-dot non-veg" title="Non-vegetarian"></span>' : '<span style="color:#64748b; font-size:0.75rem;">—</span>');

      const priceText = d.price !== null && d.price !== undefined
        ? `<strong style="color:var(--text-dark);">₹${d.price}</strong>`
        : '<span style="color:#94a3b8; font-style:italic;">Unlisted</span>';

      const mustTryPill = d.isMustTry
        ? '<span class="admin-badge admin-badge-gold">Must-Try</span>'
        : '<span style="color:#94a3b8;">—</span>';

      return `
        <tr data-dish-id="${escapeHtml(d.id)}">
          <td style="width:40px; text-align:center;">${dietDot}</td>
          <td>
            <div style="font-weight:700; color:var(--text-dark);">${escapeHtml(d.name)}</div>
            <div style="font-size:0.72rem; color:var(--text-muted); font-family:monospace;">${escapeHtml(d.id)}</div>
          </td>
          <td>
            <span style="font-weight:600; color:#1C231F;">${escapeHtml(d.foodSpotName || d.foodSpotId)}</span>
          </td>
          <td>
            <span class="admin-badge admin-badge-neutral">${escapeHtml(d.category || 'General')}</span>
          </td>
          <td>${priceText}</td>
          <td>${mustTryPill}</td>
          <td style="text-align:right; white-space:nowrap;">
            <button type="button" class="admin-btn-action btn-edit-dish" data-id="${escapeHtml(d.id)}" title="Edit Menu Dish">Edit</button>
            <button type="button" class="admin-btn-action btn-delete-dish delete" data-id="${escapeHtml(d.id)}" data-name="${escapeHtml(d.name)}" title="Delete Menu Dish">Delete</button>
          </td>
        </tr>
      `;
    }).join('');

    $('#admin-dishes-tbody').html(rows);
  }

  // Filter triggers for dishes
  let dishFilterTimer = null;
  $('#admin-dish-spot-filter, #admin-dish-diet-filter').on('change', loadAdminDishes);
  $('#admin-dish-search').on('input', function() {
    clearTimeout(dishFilterTimer);
    dishFilterTimer = setTimeout(loadAdminDishes, 250);
  });

  // Add Dish Modal Trigger
  $('#btn-open-add-dish').on('click', function() {
    $('#dish-form-title').text('Add New Menu Dish');
    $('#dish-form-mode').val('add');
    $('#dish-form-target-id').val('');
    $('#admin-dish-edit-form')[0].reset();

    // Pre-select current filter if a restaurant is chosen
    const activeFilter = $('#admin-dish-spot-filter').val();
    if (activeFilter) {
      $('#dish-form-spot-id').val(activeFilter);
    }

    $('#modal-dish-form').addClass('open active');
  });

  // Edit Dish
  $(document).on('click', '.btn-edit-dish', function() {
    const id = $(this).data('id');
    const dish = allAdminDishes.find(d => d.id === id);
    if (!dish) return;

    $('#dish-form-title').text(`Edit Dish: ${dish.name}`);
    $('#dish-form-mode').val('edit');
    $('#dish-form-target-id').val(dish.id);

    $('#dish-form-spot-id').val(dish.foodSpotId || dish.foodSpot);
    $('#dish-form-name').val(dish.name);
    $('#dish-form-category').val(dish.category || 'Fast Food');
    $('#dish-form-price').val(dish.price !== null && dish.price !== undefined ? dish.price : '');
    $('#dish-form-dietary').val(dish.dietary || 'unclassified');
    $('#dish-form-must-try').prop('checked', Boolean(dish.isMustTry));

    $('#modal-dish-form').addClass('open active');
  });

  $('#btn-close-dish-form, #btn-cancel-dish-form').on('click', function() {
    $('#modal-dish-form').removeClass('open active');
  });

  // Save Dish Form Submit
  $('#admin-dish-edit-form').on('submit', async function(e) {
    e.preventDefault();
    const mode = $('#dish-form-mode').val();
    const targetId = $('#dish-form-target-id').val();

    const priceInput = $('#dish-form-price').val();
    const payload = {
      foodSpotId: $('#dish-form-spot-id').val(),
      name: $('#dish-form-name').val().trim(),
      category: $('#dish-form-category').val().trim(),
      price: priceInput !== '' ? Number(priceInput) : null,
      dietary: $('#dish-form-dietary').val(),
      isMustTry: $('#dish-form-must-try').is(':checked')
    };

    const $btn = $('#btn-save-dish-form');
    $btn.prop('disabled', true).text('Saving...');

    try {
      if (mode === 'add') {
        await API.addAdminMenuItem(payload);
        alert('Menu dish created successfully!');
      } else {
        await API.updateAdminMenuItem(targetId, payload);
        alert('Menu dish updated successfully!');
      }
      $('#modal-dish-form').removeClass('open active');
      await loadAdminDishes();
      loadAdminSpots();
      loadQualityMetrics();
    } catch (err) {
      alert(`Error saving dish: ${err.message}`);
    } finally {
      $btn.prop('disabled', false).text('Save Dish');
    }
  });

  // Delete Dish
  $(document).on('click', '.btn-delete-dish', async function() {
    const id = $(this).data('id');
    const name = $(this).data('name');

    if (!confirm(`Are you sure you want to delete dish "${name}"?\n\nThis item will be removed from all menus.`)) {
      return;
    }

    try {
      await API.deleteAdminMenuItem(id);
      alert(`Dish "${name}" has been deleted.`);
      await loadAdminDishes();
      loadAdminSpots();
      loadQualityMetrics();
    } catch (err) {
      alert(`Error deleting dish: ${err.message}`);
    }
  });

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
});
