/**
 * VIT Food Spot Guide — Main Client Application
 * Premium Campus Food Directory & Modern Café Guide
 * Architecture: Clean Vanilla JS + jQuery for DOM & REST API
 */

// Safe HTML Escaping Utility
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
window.escapeHtml = escapeHtml;

// Application State
const AppState = {
  allSpots: [],
  filteredSpots: [],
  locations: [],
  ofwCounters: [],
  currentUser: null,
  userFavorites: [],
  userFavoritesSet: new Set(),
  activeView: 'explore',
  activeBlock: 'prp',
  activeLocation: '',
  activeDietary: '',
  activeBudget: '',
  activeCategory: '',
  activeHostelTab: 'boys',
  activeFavTab: 'spots',
  searchDebounceTimer: null
};

// SVG Icons (Bitewise Image 3 Palette)
const SVG_ICONS = {
  heartFilled: `<svg width="18" height="18" viewBox="0 0 24 24" fill="#E63946" stroke="#E63946" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`,
  heartOutline: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`,
  arrowRight: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`,
  user: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`
};

// Representative Campus Food & Restaurant Imagery Map (Curated Unsplash CDN + fallback)
const SPOT_IMAGE_MAP = {
  'one-food-world': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
  'just-bake': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80',
  'nescafe-mh': 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80',
  'nescafe-sjt': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
  'nescafe-tt': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80',
  'nescafe-library': 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=600&q=80',
  'nescafe-lh': 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=600&q=80',
  'flora': 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=600&q=80',
  'auntys-mess': 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=600&q=80',
  'olives': 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?auto=format&fit=crop&w=600&q=80',
  'darling-main-canteen': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
  'darling-cafe-mgb': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
  'amul': 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=600&q=80',
  'sugarcane': 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
  'aavin': 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
  'dominos': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
  'sri-sai-sabari': 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80',
  'sri-sabari': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
  'madras-coffee-house': 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=600&q=80',
  'lassi-house': 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=600&q=80',
  'apples-juice': 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=600&q=80',
  'fruit-juice-shop': 'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?auto=format&fit=crop&w=600&q=80',
  'nama-chai': 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=600&q=80',
  'arasan': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
  'dc-near-tt': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
  'fc-near-tt': 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80',
  'garnish': 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80',
  'hangy-and-swig': 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80',
  'kc-food': 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=600&q=80',
  'imperial-goli-soda': 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=600&q=80',
  'margerita': 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=600&q=80'
};

const CATEGORY_IMAGE_MAP = {
  'Beverages': 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
  'Chai': 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
  'Tea': 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
  'Coffee': 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80',
  'Ice Cream': 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=600&q=80',
  'Bakery': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
  'Pizza': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
  'Burgers': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
  'Meals': 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=600&q=80',
  'South Indian': 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80',
  'Fast Food': 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=600&q=80',
  'Desserts': 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?auto=format&fit=crop&w=600&q=80',
  'Chinese': 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80'
};

// Light / Dark / System Theme Manager
const ThemeManager = {
  currentTheme: localStorage.getItem('vit_food_theme') || 'system',

  init() {
    this.applyTheme(this.currentTheme);

    // Watch system changes
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (this.currentTheme === 'system') {
          this.updateDOMTheme(e.matches ? 'dark' : 'light');
        }
      });
    }

    // Toggle popover
    $('#btn-theme-settings').on('click', function(e) {
      e.stopPropagation();
      $('#settings-popover').toggle();
    });

    $(document).on('click', function(e) {
      if (!$(e.target).closest('.settings-menu-wrapper').length) {
        $('#settings-popover').hide();
      }
    });

    // Theme buttons
    $('.theme-option-btn').on('click', function() {
      const chosen = $(this).attr('data-theme-val');
      ThemeManager.setTheme(chosen);
      $('#settings-popover').hide();
    });
  },

  setTheme(val) {
    this.currentTheme = val;
    try {
      localStorage.setItem('vit_food_theme', val);
    } catch (e) {}
    this.applyTheme(val);
  },

  applyTheme(val) {
    $('.theme-option-btn').removeClass('active');
    $(`.theme-option-btn[data-theme-val="${val}"]`).addClass('active');

    let effective = val;
    if (val === 'system') {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      effective = prefersDark ? 'dark' : 'light';
    }
    this.updateDOMTheme(effective);
  },

  updateDOMTheme(effective) {
    const $themeBtnSvg = $('#theme-btn-svg');
    if (effective === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      if ($themeBtnSvg.length) {
        $themeBtnSvg.html(`
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        `);
      }
    } else {
      document.documentElement.removeAttribute('data-theme');
      if ($themeBtnSvg.length) {
        $themeBtnSvg.html(`
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        `);
      }
    }
  }
};

// Initialize Application on DOM Ready
$(document).ready(function() {
  ThemeManager.init();
  initializeApp();
  bindEventHandlers();
  handleHashRouting();
});

// Routing
function handleHashRouting() {
  const hash = window.location.hash.replace('#', '') || 'explore';
  switchView(hash);
}

window.addEventListener('hashchange', () => {
  handleHashRouting();
});

// Global Search Trigger from Nav
window.triggerGlobalSearchFocus = function() {
  switchView('explore');
  window.location.hash = 'explore';
  const $searchForm = $('#master-search-form');
  if ($searchForm.length) {
    $('html, body').stop().animate({
      scrollTop: $searchForm.offset().top - 90
    }, 250, () => {
      $('#global-search-input').focus();
    });
  } else {
    $('#global-search-input').focus();
  }
};

function switchView(viewName) {
  const validViews = ['explore', 'hostels', 'mens-hostel', 'ladies-hostel', 'academic-blocks', 'chatbot', 'feedback', 'favorites'];
  const targetView = validViews.includes(viewName) ? viewName : 'explore';

  AppState.activeView = targetView;

  // Update nav link active state
  $('.nav-link').removeClass('active');

  if (targetView === 'mens-hostel' || targetView === 'ladies-hostel' || targetView === 'hostels') {
    $('.nav-link[data-view="hostels"]').addClass('active');
    $('.spa-view').hide();
    $('#view-hostels').show();
    showHostelTab(targetView === 'ladies-hostel' ? 'girls' : 'boys');
  } else {
    $(`.nav-link[data-view="${targetView}"]`).addClass('active');
    $('.spa-view').hide();
    $(`#view-${targetView}`).show();

    if (targetView === 'explore') {
      $('#food-spots-directory').show();
      $('#cravings-section').show();
      $('#blocks-quicknav-section').show();
      const currentQuery = $('#global-search-input').val().trim();
      if (currentQuery.length < 2) {
        $('#dish-search-section').hide();
      }
      const spotsToRender = (AppState.filteredSpots && AppState.filteredSpots.length > 0)
        ? AppState.filteredSpots
        : AppState.allSpots;
      renderFoodSpots(spotsToRender);
      $('#directory-count-text').text(`${spotsToRender.length} food ${spotsToRender.length === 1 ? 'spot' : 'spots'}`);
    } else if (targetView === 'academic-blocks') {
      showAcademicBlock(AppState.activeBlock || 'prp');
    } else if (targetView === 'feedback') {
      loadFeedbackView();
    } else if (targetView === 'favorites') {
      loadFavoritesView();
    }
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showHostelTab(tab) {
  AppState.activeHostelTab = tab;
  if (tab === 'girls' || tab === 'ladies-hostel') {
    $('#tab-hostel-girls').addClass('active');
    $('#tab-hostel-boys').removeClass('active');
    $('#hostel-boys-content').hide();
    $('#hostel-girls-content').show();
    renderLadiesHostelView();
  } else {
    $('#tab-hostel-boys').addClass('active');
    $('#tab-hostel-girls').removeClass('active');
    $('#hostel-girls-content').hide();
    $('#hostel-boys-content').show();
    renderMensHostelView();
  }
}

async function initializeApp() {
  showLoader('#outlets-grid');
  try {
    const [spotsRes, locsRes, ofwRes, userRes] = await Promise.all([
      API.getFoodSpots(),
      API.getLocations(),
      API.getCounters('one-food-world'),
      API.authGetMe().catch(() => ({ authenticated: false }))
    ]);

    AppState.allSpots = spotsRes.data || [];
    AppState.filteredSpots = [...AppState.allSpots];
    AppState.locations = locsRes.data || [];
    AppState.ofwCounters = ofwRes.data || [];

    if (userRes.authenticated && userRes.user) {
      AppState.currentUser = userRes.user;
      updateAuthUI(true, userRes.user);
    } else {
      updateAuthUI(false);
    }
    await loadUserFavorites();

    renderFoodSpots(AppState.allSpots);
    populateInlineFeedbackSpots();

  } catch (err) {
    console.error('App initialization error:', err);
    $('#outlets-grid').html(`
      <div class="empty-state" style="grid-column: 1 / -1;">
        <h4>Unable to load food spots</h4>
        <p>Please check your connection and refresh the page.</p>
      </div>
    `);
  }
}

function populateInlineFeedbackSpots() {
  const $select = $('#inline-fb-spot');
  if ($select.length) {
    $select.empty();
    $select.append('<option value="">Select a food spot</option>');
    AppState.allSpots.forEach(s => {
      $select.append(`<option value="${s.id || s.slug}">${s.name} (${s.zone})</option>`);
    });
  }
}

function bindEventHandlers() {
  // Navigation
  $('.nav-link').on('click', function(e) {
    e.preventDefault();
    const view = $(this).data('view');
    window.location.hash = view;
    switchView(view);
  });

  // Hostels Toggle
  $('#tab-hostel-boys').on('click', () => showHostelTab('boys'));
  $('#tab-hostel-girls').on('click', () => showHostelTab('girls'));

  // Global Search Input & Form Submit
  function doSearch() {
    clearTimeout(AppState.searchDebounceTimer);
    const query = $('#global-search-input').val();
    handleGlobalDishSearch(query, true);
  }

  $('#master-search-form').on('submit', function(e) {
    e.preventDefault();
    doSearch();
  });

  $('#btn-search-submit').on('click', function(e) {
    e.preventDefault();
    doSearch();
  });

  $('#global-search-input').on('input', function() {
    clearTimeout(AppState.searchDebounceTimer);
    const query = $(this).val();
    AppState.searchDebounceTimer = setTimeout(() => {
      handleGlobalDishSearch(query);
    }, 200);
  });

  $('#btn-close-search').on('click', () => {
    $('#global-search-input').val('');
    $('#dish-search-section').slideUp(150);
    $('#cravings-section').show();
    $('#food-spots-directory').show();
    $('#blocks-quicknav-section').show();
    applyActiveFilters();
  });

  // Craving Nav Cards & Pill Chips
  $(document).on('click', '.craving-card, .craving-pill-chip', function() {
    const cat = $(this).data('category');
    const isAlreadyActive = $(this).hasClass('active');
    $('.craving-card, .craving-pill-chip').removeClass('active');
    if (isAlreadyActive) {
      $('#category-filter-select').val('').trigger('change');
    } else {
      $(this).addClass('active');
      $('#category-filter-select').val(cat).trigger('change');
      const $spots = $('#food-spots-directory');
      if ($spots.length && $spots.is(':visible')) {
        $('html, body').animate({ scrollTop: $spots.offset().top - 80 }, 300);
      }
    }
  });

  // Bitewise Category Icon Strip Tabs (Image 3)
  $(document).on('click', '.bw-category-btn', function() {
    const cat = $(this).attr('data-cat') || '';
    $('.bw-category-btn').removeClass('active');
    $(this).addClass('active');
    $('#category-filter-select').val(cat).trigger('change');
    const $spots = $('#food-spots-directory');
    if ($spots.length && $spots.is(':visible')) {
      $('html, body').animate({ scrollTop: $spots.offset().top - 80 }, 300);
    }
  });

  // 4 Compact Filters
  $('#location-select').on('change', function() {
    AppState.activeLocation = $(this).val();
    applyActiveFilters();
  });

  $('#dietary-filter').on('change', function() {
    AppState.activeDietary = $(this).val();
    applyActiveFilters();
  });

  $('#budget-filter-select').on('change', function() {
    AppState.activeBudget = $(this).val();
    applyActiveFilters();
  });

  $('#category-filter-select').on('change', function() {
    const cat = $(this).val();
    AppState.activeCategory = cat;
    $('.bw-category-btn').removeClass('active');
    if (cat) {
      $(`.bw-category-btn[data-cat="${cat}"]`).addClass('active');
    } else {
      $('.bw-category-btn[data-cat=""]').addClass('active');
    }
    applyActiveFilters();
  });

  $('#btn-reset-filters').on('click', resetFilters);

  // Academic Block Dropdown
  $('#academic-block-select').on('change', function() {
    const block = $(this).val();
    AppState.activeBlock = block;
    showAcademicBlock(block);
  });

  // Luxury Academic Block Tabs
  $(document).on('click', '.luxury-block-tab', function() {
    const block = $(this).data('block');
    AppState.activeBlock = block;
    showAcademicBlock(block);
  });

  // Favorites Sub-tabs
  $('#tab-fav-spots').on('click', function() {
    $(this).addClass('active').siblings().removeClass('active');
    AppState.activeFavTab = 'spots';
    renderFavoritesTabContent();
  });

  $('#tab-fav-dishes').on('click', function() {
    $(this).addClass('active').siblings().removeClass('active');
    AppState.activeFavTab = 'dishes';
    renderFavoritesTabContent();
  });

  // Modals
  $('#btn-close-spot-modal').on('click', () => $('#spot-modal').removeClass('open'));
  $('#btn-close-auth-modal').on('click', closeAuthModal);
  $('#btn-close-admin-modal').on('click', () => $('#admin-modal').removeClass('open'));
  $('#btn-admin-modal, #footer-admin-btn').on('click', () => $('#admin-modal').addClass('open'));

  // Auth Tabs
  $('#tab-auth-login').on('click', function() {
    $(this).addClass('active');
    $('#tab-auth-register').removeClass('active');
    $('#auth-login-view').show();
    $('#auth-register-view').hide();
  });

  $('#tab-auth-register').on('click', function() {
    $(this).addClass('active');
    $('#tab-auth-login').removeClass('active');
    $('#auth-login-view').hide();
    $('#auth-register-view').show();
  });

  $('#student-login-form').on('submit', handleStudentLogin);
  $('#student-register-form').on('submit', handleStudentRegister);
  $('#btn-auth-modal').on('click', () => openAuthModal());

  // Feedback Form
  $('#inline-feedback-form').on('submit', handleInlineFeedbackSubmit);

  // Close modals on Esc or backdrop click
  $(document).on('keydown', function(e) {
    if (e.key === 'Escape') {
      $('.modal-overlay').removeClass('open');
    }
  });

  $('.modal-overlay').on('click', function(e) {
    if (e.target === this) {
      $(this).removeClass('open');
    }
  });
}

// Render Food Spot Cards (Clean Redesign)
function renderFoodSpots(spots, containerId = '#outlets-grid') {
  const $container = $(containerId);
  $container.empty();

  if (!spots || spots.length === 0) {
    $container.html(`
      <div class="empty-state" style="grid-column: 1 / -1;">
        <h4>No food spots found</h4>
        <p>Try resetting filters or adjusting your search.</p>
        <button class="btn btn-outline btn-sm" onclick="resetFilters()" style="margin-top:14px;">Reset filters</button>
      </div>
    `);
    return;
  }

  spots.forEach(spot => {
    const isFav = AppState.userFavoritesSet.has(spot.id) || AppState.userFavoritesSet.has(spot.slug);
    const hasMenu = spot.status === 'available';
    const primaryCategory = (spot.categories && spot.categories.length > 0) ? spot.categories[0] : 'Campus Dining';
    const locationText = spot.specificLocation || spot.locationName || spot.location;

    // Resolve representative food image
    const spotKey = spot.slug || spot.id;
    let imageUrl = SPOT_IMAGE_MAP[spotKey] || SPOT_IMAGE_MAP[spot.id];
    if (!imageUrl && primaryCategory) {
      imageUrl = CATEGORY_IMAGE_MAP[primaryCategory];
    }
    if (!imageUrl) {
      imageUrl = 'assets/images/fallback.svg';
    }

    // Only 1-2 most useful tags
    const tags = [];
    if (spot.zone) {
      if (spot.zone.includes('Hostel')) tags.push(spot.zone);
      else if (spot.zone.includes('Academic')) tags.push('Academic Block');
      else tags.push('Campus Hub');
    }
    if (primaryCategory && !tags.includes(primaryCategory)) {
      tags.push(primaryCategory);
    }
    const displayTags = tags.slice(0, 2);

    const favIcon = isFav ? SVG_ICONS.heartFilled : SVG_ICONS.heartOutline;

    const card = `
      <div class="spot-card" id="card-${spot.id || spot.slug}" onclick="openSpotDetailModal('${spot.slug || spot.id}')" role="button" tabindex="0">
        <div class="spot-card-media">
          <img src="${imageUrl}" alt="${spot.name} - food and dining" loading="lazy" class="spot-card-img" onerror="this.onerror=null; this.src='assets/images/fallback.svg';">
          <div class="spot-card-media-overlay">
            <span class="spot-card-category">${primaryCategory}</span>
            <span class="spot-verified-pill">Verified Menu</span>
          </div>
          <button class="btn-fav-toggle ${isFav ? 'active' : ''}" onclick="event.stopPropagation(); toggleFavorite('${spot.id || spot.slug}', null)" title="${isFav ? 'Remove from favorites' : 'Save to favorites'}" aria-label="Favorite">
            ${favIcon}
          </button>
        </div>
        <div class="spot-card-body">
          <div class="spot-card-content">
            <h3 class="spot-name">${escapeHtml(spot.name)}</h3>
            <div class="spot-location">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px; flex-shrink:0;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              <span>${escapeHtml(locationText)}</span>
            </div>
            <p class="spot-desc">${escapeHtml(spot.description || 'Verified campus dining outlet at VIT Vellore.')}</p>
          </div>
          <div class="spot-card-actions">
            <button class="btn-card-arrow" onclick="event.stopPropagation(); openSpotDetailModal('${spot.slug || spot.id}')" aria-label="View menu">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
            <button class="btn-view-menu" style="display:none;" onclick="event.stopPropagation(); openSpotDetailModal('${spot.slug || spot.id}')">View menu</button>
          </div>
        </div>
        <div class="spot-tags-row" style="display:none;">
          ${displayTags.map(t => `<span class="spot-tag-chip">${escapeHtml(t)}</span>`).join('')}
        </div>
      </div>
    `;
    $container.append(card);
  });
}

// Render One Food World Counters
function renderOfwCounters(counters) {
  const $list = $('#ofw-counters-list');
  $list.empty();

  counters.forEach(c => {
    const card = `
      <div class="ofw-counter-chip" onclick="openSpotDetailModal('one-food-world', '${c.slug}')">
        <h4>${c.name}</h4>
        <p>${c.cuisine}</p>
      </div>
    `;
    $list.append(card);
  });
}

// Men's Hostel View
function renderMensHostelView() {
  const mensSpots = AppState.allSpots.filter(s => s.zone === "Boys' Hostel" || s.location === 'mh');
  renderFoodSpots(mensSpots, '#mens-hostel-spots-grid');
  renderOfwCounters(AppState.ofwCounters);
}

// Ladies' Hostel View
function renderLadiesHostelView() {
  const ladiesSpots = AppState.allSpots.filter(s => s.zone === "Girls' Hostel" || s.location === 'lh');
  renderFoodSpots(ladiesSpots, '#ladies-hostel-spots-grid');
}

// Academic Blocks View (Luxury Concourse Showcase)
function showAcademicBlock(blockSlug) {
  AppState.activeBlock = blockSlug;
  $('#academic-block-select').val(blockSlug);
  $('.luxury-block-tab').removeClass('active');
  $(`.luxury-block-tab[data-block="${blockSlug}"]`).addClass('active');

  const blockMap = {
    prp: {
      name: 'Pearl Research Park (PRP)',
      badge: 'PRESTIGE RESEARCH & ACADEMIC PAVILION',
      code: 'PRP',
      desc: 'Pearl Research Park (PRP) houses advanced computing laboratories, landmark lecture theatres, and ground-floor dining hubs including the renowned Olives Cafe and Sri Sabari.',
      highlights: ['Ground Floor Courtyard Dining', 'Famous Belgian Waffles at Olives', '2 Min Walk to Central Walkway'],
      insideSpots: ['olives', 'sri-sabari', 'sri-sai-sabari', 'nescafe-tt'],
      nearbySpots: ['darling-cafe-mgb', 'madras-coffee-house', 'dc-near-tt']
    },
    sjt: {
      name: 'Silver Jubilee Tower (SJT)',
      badge: 'CENTRAL COMPUTING & HIGH-TECH CONCOURSE',
      code: 'SJT',
      desc: 'Silver Jubilee Tower is VIT\'s primary computing landmark, hosting a bustling multi-cuisine ground concourse with Arasan, authentic chai stalls, and Domino\'s.',
      highlights: ['Multi-cuisine Ground Food Concourse', 'Express Chai & Nescafe Hub', 'Air-Conditioned Indoor Seating'],
      insideSpots: ['arasan', 'nama-chai', 'lassi-house', 'hangy-and-swig', 'garnish', 'dominos', 'nescafe-sjt'],
      nearbySpots: ['kc-food', 'imperial-goli-soda', 'dc-near-tt']
    },
    mgb: {
      name: 'Mahatma Gandhi Block (MGB)',
      badge: 'ENGINEERING SCIENCE PAVILION',
      code: 'MGB',
      desc: 'Mahatma Gandhi Block features advanced engineering laboratories, faculty chambers, and the popular Darling Cafe patisserie outlet for gourmet pastries and snacks.',
      highlights: ['Artisanal Pastries & Puffs', 'Authentic Filter Coffee', 'Fast Walk to Central Lawns'],
      insideSpots: ['darling-cafe-mgb', 'madras-coffee-house'],
      nearbySpots: ['olives', 'sri-sabari', 'darling-main-canteen']
    },
    tt: {
      name: 'Technology Tower (TT)',
      badge: 'ICONIC CENTRAL LANDMARK',
      code: 'TT',
      desc: 'Technology Tower stands as a central architectural icon of VIT, featuring high-capacity breakfast cafeterias, South Indian dosas, and courtyard beverages.',
      highlights: ['Early Morning Breakfast & Dosas', 'Courtyard Shakes & Refreshments', 'Central Hub Position'],
      insideSpots: ['dc-near-tt', 'fc-near-tt', 'nescafe-tt'],
      nearbySpots: ['arasan', 'nama-chai', 'kc-food']
    },
    gdn: {
      name: 'G.D. Naidu Block (GDN)',
      badge: 'ADMINISTRATION & HISTORIC QUAD',
      code: 'GDN',
      desc: 'GDN Block accommodates administrative offices, historic auditoriums, and the expansive Darling Main Canteen serving hearty meals, biryanis, and Aavin milk bar.',
      highlights: ['Full Lunch & Biryani Thalis', 'Fresh Aavin Dairy Bar', 'Shaded Heritage Quadrangle'],
      insideSpots: ['darling-main-canteen', 'aavin'],
      nearbySpots: ['darling-cafe-mgb', 'amul', 'sugarcane']
    },
    smv: {
      name: 'SMV & Central Library Corridor',
      badge: 'ACADEMIC GREEN CORRIDOR',
      code: 'SMV',
      desc: 'The shaded avenue linking Sir M. Visvesvaraya Block to the Central Library features fresh sugarcane juice kiosks, chilled Amul dairy treats, and reading cafes.',
      highlights: ['Cold Pressed Sugarcane & Juices', 'Amul Ice Cream & Shakes', 'Serene Library Promenade'],
      insideSpots: ['amul', 'sugarcane', 'apples-juice', 'nescafe-library'],
      nearbySpots: ['aavin', 'darling-main-canteen']
    }
  };

  const blockInfo = blockMap[blockSlug] || blockMap.prp;
  const inside = AppState.allSpots.filter(s => blockInfo.insideSpots.includes(s.id) || blockInfo.insideSpots.includes(s.slug));
  const nearby = AppState.allSpots.filter(s => blockInfo.nearbySpots && (blockInfo.nearbySpots.includes(s.id) || blockInfo.nearbySpots.includes(s.slug)));

  let html = `
    <!-- Luxury Landmark Showcase Banner -->
    <div class="luxury-landmark-banner">
      <div class="landmark-banner-inner">
        <div class="landmark-header-row">
          <span class="landmark-prestige-badge">✦ ${blockInfo.badge} ✦</span>
          <span class="landmark-code-pill">${blockInfo.code}</span>
        </div>
        <h3 class="landmark-title">${blockInfo.name}</h3>
        <p class="landmark-desc">${blockInfo.desc}</p>
        <div class="landmark-highlights-row">
          ${blockInfo.highlights.map(h => `<span class="landmark-highlight-chip"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> ${h}</span>`).join('')}
        </div>
      </div>
    </div>

    <!-- Inside Landmark Outlets -->
    <div class="luxury-section-divider">
      <div class="divider-line"></div>
      <div class="divider-badge">
        <span class="divider-icon">❖</span>
        <span>Curated Dining Inside ${blockInfo.name.split(' (')[0]}</span>
      </div>
      <div class="divider-line"></div>
    </div>
    <div class="outlets-grid" id="academic-inside-grid"></div>
  `;

  if (nearby.length > 0) {
    html += `
      <div class="luxury-section-divider" style="margin-top: 48px;">
        <div class="divider-line"></div>
        <div class="divider-badge">
          <span class="divider-icon">✦</span>
          <span>Nearby Recommended Dining (Within 2–3 Min Walk)</span>
        </div>
        <div class="divider-line"></div>
      </div>
      <div class="outlets-grid" id="academic-nearby-grid"></div>
    `;
  }

  $('#academic-block-content').html(html);
  renderFoodSpots(inside, '#academic-inside-grid');
  if (nearby.length > 0) {
    renderFoodSpots(nearby, '#academic-nearby-grid');
  }
}

// Global Navigate To Academic Block
window.navigateToBlock = function(blockSlug) {
  window.location.hash = '#academic-blocks';
  setTimeout(() => {
    $('#academic-block-select').val(blockSlug).trigger('change');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 60);
};

// Global Dish & Spot Search
async function handleGlobalDishSearch(query, shouldScroll = false) {
  if (!query || query.trim().length < 2) {
    $('#dish-search-section').slideUp(150);
    $('#cravings-section').show();
    $('#food-spots-directory').show();
    $('#blocks-quicknav-section').show();
    $('#directory-count-text').text(`${AppState.filteredSpots.length} food spots`);
    return;
  }

  const trimmed = query.trim();

  try {
    const filters = {};
    if (AppState.activeBudget && AppState.activeBudget !== 'all') {
      const b = Number(AppState.activeBudget);
      if (!isNaN(b)) {
        if (b === 50) { filters.maxPrice = 50; }
        else if (b === 100) { filters.minPrice = 50; filters.maxPrice = 100; }
        else if (b === 150) { filters.minPrice = 100; filters.maxPrice = 150; }
        else if (b === 250) { filters.minPrice = 150; filters.maxPrice = 250; }
        else { filters.maxPrice = b; }
      }
    }
    if (AppState.activeDietary && AppState.activeDietary !== 'all') {
      filters.dietary = AppState.activeDietary;
    }
    if (AppState.activeCategory && AppState.activeCategory !== 'all') {
      filters.category = AppState.activeCategory;
    }
    if (AppState.activeLocation && AppState.activeLocation !== 'all') {
      filters.location = AppState.activeLocation;
    }
    filters.limit = 100;

    const res = await API.searchDishes(trimmed, filters);

    let items = res.data || [];
    let spots = res.spots || [];

    const $grid = $('#dishes-results-grid');
    const $spotsGrid = $('#matching-spots-grid');
    const $spotsContainer = $('#matching-spots-container');

    $grid.empty();
    $spotsGrid.empty();

    $('#dish-search-heading').text(`Search results for "${trimmed}"`);
    $('#dish-search-subheading').text(`${items.length} ${items.length === 1 ? 'dish' : 'dishes'} found${spots.length > 0 ? ` • ${spots.length} food ${spots.length === 1 ? 'spot' : 'spots'}` : ''}`);
    $('#matching-dishes-count').text(`${items.length} ${items.length === 1 ? 'dish' : 'dishes'}`);
    $('#matching-spots-count').text(`${spots.length} food ${spots.length === 1 ? 'spot' : 'spots'}`);

    // Hide default discovery sections while searching
    $('#cravings-section').hide();
    $('#food-spots-directory').hide();
    $('#blocks-quicknav-section').hide();
    $('#dish-search-section').show();
    if (shouldScroll) {
      const targetTop = $('#dish-search-section').offset().top - 85;
      $('html, body').stop().animate({ scrollTop: targetTop }, 250);
    }

    // Matching Food Spots
    if (spots.length > 0) {
      renderFoodSpots(spots, '#matching-spots-grid');
      $spotsContainer.show();
    } else {
      $spotsContainer.hide();
    }

    // Matching Dishes List (Compact clean rows)
    if (items.length === 0) {
      $grid.html('<p style="color:var(--text-muted); padding:20px 0;">No matching dishes found.</p>');
    } else {
      items.forEach(dish => {
        const priceText = dish.price !== null ? `₹${dish.price}` : '<span class="dish-row-price unlisted">Price not listed</span>';
        const isVeg = dish.foodClassification === 'veg' || dish.dietary === 'veg';
        const isNonVeg = dish.foodClassification === 'non-veg' || dish.dietary === 'non-veg';
        const dishId = dish.id;
        const spotKey = dish.foodSpotSlug || dish.foodSpotId || dish.foodSpot;
        const isFav = AppState.userFavoritesSet.has(dishId);

        const row = `
          <div class="dish-row-item" onclick="openSpotDetailModal('${spotKey}')" role="button" tabindex="0">
            <div class="dish-row-left">
              <div class="dish-row-name">
                ${isVeg ? '<span class="diet-dot veg" title="Vegetarian"></span>' : (isNonVeg ? '<span class="diet-dot non-veg" title="Non-vegetarian"></span>' : '')}
                <span>${dish.name}</span>
              </div>
              <div class="dish-row-meta">
                <span>${dish.spotName}</span>
                &bull;
                <span>${dish.category || 'General'}</span>
                ${dish.counterName ? `&bull; <span>${dish.counterName}</span>` : ''}
              </div>
            </div>
            <div class="dish-row-right">
              <span class="dish-row-price">${priceText}</span>
              <button class="btn-fav-toggle ${isFav ? 'active' : ''}" onclick="event.stopPropagation(); toggleFavorite('${spotKey}', '${dishId}')" title="${isFav ? 'Remove bookmark' : 'Bookmark dish'}" aria-label="Bookmark">
                ${isFav ? SVG_ICONS.heartFilled : SVG_ICONS.heartOutline}
              </button>
              <button class="btn btn-outline btn-sm" onclick="event.stopPropagation(); openSpotDetailModal('${spotKey}')">View menu</button>
            </div>
          </div>
        `;
        $grid.append(row);
      });
    }

  } catch (err) {
    console.error('Search query error:', err);
  }
}

// Apply Compact Filters
function applyActiveFilters() {
  const currentSearch = $('#global-search-input').val().trim();
  if (currentSearch.length >= 2) {
    handleGlobalDishSearch(currentSearch);
    return;
  }

  let filtered = [...AppState.allSpots];

  // 1. Location filter
  if (AppState.activeLocation && AppState.activeLocation !== 'all') {
    const loc = AppState.activeLocation.toLowerCase();
    filtered = filtered.filter(s => (s.location && s.location.toLowerCase() === loc) || (s.locationId && s.locationId.toLowerCase() === loc));
  }

  // 2. Category filter
  if (AppState.activeCategory && AppState.activeCategory !== 'all') {
    const cat = AppState.activeCategory.toLowerCase();
    filtered = filtered.filter(s => {
      if (!s.categories || !Array.isArray(s.categories)) return false;
      return s.categories.some(c => {
        const cLower = c.toLowerCase();
        if (cat === 'chai') return cLower.includes('chai') || cLower.includes('tea');
        if (cat === 'beverages') return cLower.includes('beverage') || cLower.includes('juice') || cLower.includes('shake');
        if (cat === 'fast food') return cLower.includes('fast food') || cLower.includes('sandwich') || cLower.includes('burger') || cLower.includes('pizza') || cLower.includes('wrap') || cLower.includes('noodle') || cLower.includes('chaat');
        if (cat === 'pizza') return cLower.includes('pizza') || cLower.includes('fast food');
        if (cat === 'burgers') return cLower.includes('burger') || cLower.includes('fast food');
        if (cat === 'wraps') return cLower.includes('wrap') || cLower.includes('roll') || cLower.includes('fast food');
        if (cat === 'meals') return cLower.includes('meal') || cLower.includes('thali') || cLower.includes('south indian') || cLower.includes('north indian') || cLower.includes('biriyani');
        if (cat === 'south indian') return cLower.includes('south indian') || cLower.includes('meal');
        if (cat === 'bakery') return cLower.includes('bakery') || cLower.includes('cake') || cLower.includes('pastry');
        if (cat === 'desserts') return cLower.includes('dessert') || cLower.includes('waffle') || cLower.includes('ice cream');
        if (cat === 'ice cream') return cLower.includes('ice cream') || cLower.includes('dessert') || cLower.includes('dairy');
        return cLower.includes(cat);
      });
    });
  }

  // 3. Dietary filter
  if (AppState.activeDietary && AppState.activeDietary !== 'all') {
    if (AppState.activeDietary === 'veg') {
      filtered = filtered.filter(s => s.hasVeg !== false);
    } else if (AppState.activeDietary === 'non-veg') {
      filtered = filtered.filter(s => s.hasNonVeg === true);
    }
  }

  // 4. Budget filter
  if (AppState.activeBudget && AppState.activeBudget !== 'all') {
    const b = Number(AppState.activeBudget);
    if (!isNaN(b) && b > 0) {
      if (b === 50) {
        filtered = filtered.filter(s => s.minPrice !== null && s.minPrice !== undefined && s.minPrice <= 50);
      } else if (b === 100) {
        filtered = filtered.filter(s => s.minPrice !== null && s.minPrice !== undefined && s.minPrice <= 100);
      } else if (b === 150) {
        filtered = filtered.filter(s => s.minPrice !== null && s.minPrice !== undefined && s.minPrice <= 150);
      } else if (b === 250) {
        filtered = filtered.filter(s => s.minPrice !== null && s.minPrice !== undefined && s.minPrice <= 250);
      } else {
        filtered = filtered.filter(s => s.minPrice !== null && s.minPrice !== undefined && s.minPrice <= b);
      }
    }
  }

  AppState.filteredSpots = filtered;
  renderFoodSpots(filtered);
  $('#directory-count-text').text(`${filtered.length} food ${filtered.length === 1 ? 'spot' : 'spots'}`);

  const hasActiveFilters = Boolean(AppState.activeLocation || AppState.activeDietary || AppState.activeBudget || AppState.activeCategory);
  if (hasActiveFilters) {
    $('#filter-reset-wrapper').show();
  } else {
    $('#filter-reset-wrapper').hide();
  }
}

function resetFilters() {
  AppState.activeLocation = '';
  AppState.activeDietary = '';
  AppState.activeBudget = '';
  AppState.activeCategory = '';

  $('#location-select').val('');
  $('#dietary-filter').val('');
  $('#budget-filter-select').val('');
  $('#category-filter-select').val('');
  $('.craving-card, .craving-pill-chip').removeClass('active');
  $('.bw-category-btn').removeClass('active');
  $('.bw-category-btn[data-cat=""]').addClass('active');
  $('#filter-reset-wrapper').hide();

  const currentSearch = $('#global-search-input').val().trim();
  if (currentSearch.length >= 2) {
    handleGlobalDishSearch(currentSearch);
  } else {
    AppState.filteredSpots = [...AppState.allSpots];
    renderFoodSpots(AppState.allSpots);
    $('#directory-count-text').text(`${AppState.allSpots.length} food spots`);
  }
}

// Global Modal Closer helper
window.closeSpotModal = function() {
  $('#spot-modal').removeClass('open');
};

// Spot Detail / Menu Modal
async function openSpotDetailModal(spotSlug, filterCounter = null) {
  const $modal = $('#spot-modal');
  const $body = $('#spot-modal-body');
  $body.html('<div style="text-align:center; padding:40px;"><div class="loader-spinner"></div><p style="margin-top:12px; color:var(--text-muted);">Loading outlet menu...</p></div>');
  $modal.addClass('open');

  try {
    const res = await API.getFoodSpot(spotSlug);
    const spot = res.data;

    let countersTabsHtml = '';
    if (spot.isCounterBased && spot.counters && spot.counters.length > 0) {
      countersTabsHtml = `
        <div style="margin: 14px 0 16px;">
          <div class="menu-categories-bar" id="modal-counter-tabs">
            <button class="menu-cat-btn ${!filterCounter ? 'active' : ''}" data-counter="">All 6 Counters</button>
            ${spot.counters.map(c => `<button class="menu-cat-btn ${filterCounter === c.slug ? 'active' : ''}" data-counter="${c.slug}">${c.name}</button>`).join('')}
          </div>
        </div>
      `;
    }

    const menuItems = spot.menuItems || [];

    // Extract unique categories from this menu
    const uniqueCategories = Array.from(new Set(menuItems.map(m => m.category).filter(Boolean)));
    let categoriesTabsHtml = '';
    if (!spot.isCounterBased && uniqueCategories.length > 1) {
      categoriesTabsHtml = `
        <div class="menu-categories-bar" id="modal-category-tabs">
          <button class="menu-cat-btn active" data-category="">All</button>
          ${uniqueCategories.slice(0, 8).map(c => `<button class="menu-cat-btn" data-category="${c}">${c}</button>`).join('')}
        </div>
      `;
    }

    const modalHtml = `
      <div>
        <div style="margin-bottom: 14px;">
          <h2 style="font-size: 1.5rem; color: var(--text-dark); margin-bottom: 4px;">${spot.name}</h2>
          <div style="font-size: 0.88rem; color: var(--text-muted);">${spot.specificLocation || spot.locationName}</div>
        </div>

        <p style="color: var(--text-dark); font-size: 0.92rem; margin-bottom: 16px; line-height: 1.5;">${spot.description || ''}</p>

        ${countersTabsHtml}
        ${categoriesTabsHtml}

        <div class="menu-search-bar">
          <input type="search" id="modal-menu-search" placeholder="Search menu..." autocomplete="off">
        </div>

        <div style="margin-top: 14px;">
          <div class="menu-items-list" id="modal-dishes-container">
            ${renderModalDishes(menuItems, filterCounter)}
          </div>
        </div>
      </div>
    `;

    $body.html(modalHtml);

    // Bind Counter tabs click inside modal
    $('#modal-counter-tabs .menu-cat-btn').on('click', function() {
      $(this).addClass('active').siblings().removeClass('active');
      const counter = $(this).data('counter');
      $('#modal-dishes-container').html(renderModalDishes(menuItems, counter, null, $('#modal-menu-search').val()));
    });

    // Bind Category tabs click
    $('#modal-category-tabs .menu-cat-btn').on('click', function() {
      $(this).addClass('active').siblings().removeClass('active');
      const cat = $(this).data('category');
      $('#modal-dishes-container').html(renderModalDishes(menuItems, null, cat, $('#modal-menu-search').val()));
    });

    // Bind In-Menu search
    $('#modal-menu-search').on('input', function() {
      const q = $(this).val();
      const activeCounter = $('#modal-counter-tabs .menu-cat-btn.active').data('counter');
      const activeCategory = $('#modal-category-tabs .menu-cat-btn.active').data('category');
      $('#modal-dishes-container').html(renderModalDishes(menuItems, activeCounter, activeCategory, q));
    });

  } catch (err) {
    console.error('Error loading spot details:', err);
    $body.html(`
      <div style="text-align:center; padding:40px 20px;">
        <p style="color:var(--text-dark); font-size:1.05rem; margin-bottom:16px;">Sorry, we couldn't load this food spot. Please try again.</p>
        <button class="btn btn-primary btn-sm" onclick="openSpotDetailModal('${spotSlug}', '${filterCounter || ''}')">Try again</button>
      </div>
    `);
  }
}

function renderModalDishes(items, counterFilter = null, categoryFilter = null, searchFilter = null) {
  let filtered = [...items];

  if (counterFilter) {
    filtered = filtered.filter(i => i.counter && i.counter.toLowerCase() === counterFilter.toLowerCase());
  }

  if (categoryFilter) {
    filtered = filtered.filter(i => i.category && i.category.toLowerCase() === categoryFilter.toLowerCase());
  }

  if (searchFilter && searchFilter.trim().length > 0) {
    const q = searchFilter.toLowerCase().trim();
    filtered = filtered.filter(i => (i.name && i.name.toLowerCase().includes(q)) || (i.category && i.category.toLowerCase().includes(q)));
  }

  if (filtered.length === 0) {
    return '<p style="color:var(--text-muted); padding:24px 0; text-align:center;">No dishes found matching this criteria.</p>';
  }

  return filtered.map(d => {
    const priceText = d.price !== null ? `₹${d.price}` : '<span style="color:var(--text-muted); font-size:0.84rem;">Price not listed</span>';
    const isVeg = d.foodClassification === 'veg';
    const isNonVeg = d.foodClassification === 'non-veg';
    const isFav = AppState.userFavoritesSet.has(d.id);

    return `
      <div class="menu-list-item">
        <div>
          <div style="font-weight: 600; color: var(--text-dark); font-size: 0.95rem; display: flex; align-items: center; gap: 8px;">
            ${isVeg ? '<span class="diet-dot veg"></span>' : (isNonVeg ? '<span class="diet-dot non-veg"></span>' : '')}
            <span>${d.name}</span>
          </div>
          <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 3px;">
            ${d.counter ? `<span style="color: var(--primary-forest); font-weight: 500;">${d.counter}</span> &bull; ` : ''}
            <span>${d.category || 'General'}</span>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 14px;">
          <span style="font-weight: 600; color: var(--text-dark); font-size: 0.95rem;">${priceText}</span>
          <button class="btn-fav-toggle ${isFav ? 'active' : ''}" onclick="toggleFavorite('${d.foodSpotSlug || d.foodSpot}', '${d.id}')" title="Save dish to favorites">
            ${isFav ? SVG_ICONS.heartFilled : SVG_ICONS.heartOutline}
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// Student Authentication
function openAuthModal(notice = '') {
  if (notice) {
    $('#login-error-msg').text(notice).show();
  } else {
    $('#login-error-msg').hide();
  }
  $('#reg-error-msg').hide();
  $('#auth-modal').addClass('open');
}

function closeAuthModal() {
  $('#auth-modal').removeClass('open');
}

function updateAuthUI(isLoggedIn, user = null) {
  const $nav = $('#auth-nav-container');
  if (isLoggedIn && user) {
    $nav.html(`
      <div style="display:flex; align-items:center; gap:8px;">
        <div class="user-profile-badge">
          ${SVG_ICONS.user}
          <span>${user.name || user.email.split('@')[0]}</span>
        </div>
        <button class="btn btn-outline btn-sm" onclick="handleStudentLogout()">Sign Out</button>
      </div>
    `);
  } else {
    $nav.html(`
      <button class="btn btn-outline btn-sm" id="btn-auth-modal" onclick="openAuthModal()">
        ${SVG_ICONS.user}
        <span>Sign In</span>
      </button>
    `);
  }
}

async function handleStudentLogin(e) {
  e.preventDefault();
  const email = $('#login-email').val().trim();
  const password = $('#login-password').val();

  $('#login-error-msg').hide();

  try {
    const res = await API.authLogin(email, password);
    AppState.currentUser = res.user;
    updateAuthUI(true, res.user);
    loadUserFavorites();
    closeAuthModal();
  } catch (err) {
    $('#login-error-msg').text(err.message).show();
  }
}

async function handleStudentRegister(e) {
  e.preventDefault();
  const name = $('#reg-name').val().trim();
  const email = $('#reg-email').val().trim();
  const password = $('#reg-password').val();

  $('#reg-error-msg').hide();

  try {
    const res = await API.authRegister(email, password, name);
    AppState.currentUser = res.user;
    updateAuthUI(true, res.user);
    closeAuthModal();
  } catch (err) {
    $('#reg-error-msg').text(err.message).show();
  }
}

async function handleStudentLogout() {
  try {
    await API.authLogout();
    AppState.currentUser = null;
    AppState.userFavoritesSet.clear();
    updateAuthUI(false);
    $('#nav-fav-count').hide();
    if (AppState.activeView === 'favorites') {
      loadFavoritesView();
    }
  } catch (err) {
    console.error('Logout error:', err);
  }
}

// Favorites Management
async function loadUserFavorites() {
  let localFavs = [];
  try {
    const raw = localStorage.getItem('vit_guest_favorites');
    if (raw) localFavs = JSON.parse(raw);
  } catch (e) {
    localFavs = [];
  }

  try {
    const res = await API.getFavorites();
    const serverFavs = res.favorites || [];
    AppState.userFavorites = serverFavs;
    const combinedSet = new Set([
      ...serverFavs.map(f => f.menuItemId || f.foodSpotId),
      ...localFavs
    ]);
    AppState.userFavoritesSet = combinedSet;

    const count = combinedSet.size;
    if (count > 0) {
      $('#nav-fav-count').text(count).show();
    } else {
      $('#nav-fav-count').hide();
    }
  } catch (e) {
    if (localFavs.length > 0) {
      AppState.userFavoritesSet = new Set(localFavs);
      $('#nav-fav-count').text(localFavs.length).show();
    } else {
      $('#nav-fav-count').hide();
    }
  }
}

async function toggleFavorite(spotId, menuItemId = null) {
  const key = menuItemId || spotId;
  const wasFav = AppState.userFavoritesSet.has(key);

  // Instantly toggle local state for immediate visual feedback
  if (wasFav) {
    AppState.userFavoritesSet.delete(key);
  } else {
    AppState.userFavoritesSet.add(key);
  }

  // Persist to localStorage
  try {
    localStorage.setItem('vit_guest_favorites', JSON.stringify([...AppState.userFavoritesSet]));
  } catch (e) {}

  // Update DOM buttons for this key immediately
  const isNowFav = !wasFav;
  const newSvg = isNowFav ? SVG_ICONS.heartFilled : SVG_ICONS.heartOutline;

  // Find all buttons on the page for this spot/dish and toggle active state
  $(`.btn-fav-toggle`).each(function() {
    const onclickAttr = $(this).attr('onclick') || '';
    if (onclickAttr.includes(`'${key}'`)) {
      $(this).toggleClass('active', isNowFav);
      $(this).html(newSvg);
      $(this).attr('title', isNowFav ? 'Remove from favorites' : 'Save to favorites');
    }
  });

  const count = AppState.userFavoritesSet.size;
  if (count > 0) {
    $('#nav-fav-count').text(count).show();
  } else {
    $('#nav-fav-count').hide();
  }

  // Sync with API in background
  try {
    if (wasFav) {
      await API.removeFavorite(key);
    } else {
      await API.addFavorite(spotId, menuItemId);
    }
  } catch (err) {
    console.warn('Favorite API sync notice:', err.message);
  }

  // Re-render active view if on favorites
  if (AppState.activeView === 'favorites') {
    loadFavoritesView();
  }
}

async function loadFavoritesView() {
  const $container = $('#favorites-list-container');
  showLoader('#favorites-list-container');

  try {
    const res = await API.getFavorites();
    let favs = res.favorites || [];

    // Also populate any saved items from localStorage into view
    const localKeys = Array.from(AppState.userFavoritesSet);
    localKeys.forEach(k => {
      const alreadyIn = favs.some(f => f.menuItemId === k || f.foodSpotId === k);
      if (!alreadyIn) {
        const spot = AppState.allSpots.find(s => s.id === k || s.slug === k);
        if (spot) {
          favs.push({
            id: 'local_' + k,
            foodSpotId: spot.id,
            foodSpotName: spot.name,
            zone: spot.zone,
            menuItemId: null
          });
        }
      }
    });

    AppState.userFavorites = favs;
    renderFavoritesTabContent();
  } catch (err) {
    console.warn('Favorites loading error:', err);
    renderFavoritesTabContent();
  }
}

function renderFavoritesTabContent() {
  const $container = $('#favorites-list-container');
  const favs = AppState.userFavorites || [];

  const guestBanner = !AppState.currentUser ? `
    <div style="background:var(--bg-sage-light); border:1px solid var(--border-subtle); border-radius:8px; padding:12px 18px; margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
      <span style="font-size:0.88rem; color:var(--text-dark);">Favorites are saved on this device. Sign in with your VIT student email to sync across devices.</span>
      <button class="btn btn-outline btn-sm" onclick="openAuthModal()">Sign in</button>
    </div>
  ` : '';

  if (AppState.activeFavTab === 'spots') {
    const spotFavs = favs.filter(f => !f.menuItemId);
    if (spotFavs.length === 0) {
      $container.html(`
        ${guestBanner}
        <div class="empty-state">
          <h4>No food spots saved yet</h4>
          <p>Click the bookmark icon on any food spot card on Explore to save it here.</p>
        </div>
      `);
      return;
    }

    const matchedSpots = AppState.allSpots.filter(s => spotFavs.some(f => f.foodSpotId === s.id || f.foodSpotId === s.slug));
    $container.html(guestBanner);
    const $grid = $('<div class="outlets-grid"></div>');
    $container.append($grid);
    renderFoodSpots(matchedSpots, $grid);

  } else {
    // Dishes tab
    const dishFavs = favs.filter(f => f.menuItemId);
    if (dishFavs.length === 0) {
      $container.html(`
        ${guestBanner}
        <div class="empty-state">
          <h4>No dishes saved yet</h4>
          <p>Save a dish from any outlet menu and it will appear here.</p>
        </div>
      `);
      return;
    }

    let html = guestBanner + '<div class="dishes-results-container">';
    dishFavs.forEach(f => {
      const priceText = f.price !== null && f.price !== undefined ? `₹${f.price}` : 'Price not listed';
      html += `
        <div class="dish-row-item">
          <div class="dish-row-left">
            <div class="dish-row-name">${escapeHtml(f.menuItemName || f.itemName || 'Saved Dish')}</div>
            <div class="dish-row-meta">
              <span>${escapeHtml(f.foodSpotName || f.foodSpotId)}</span>
              &bull;
              <span>${escapeHtml(f.zone || 'Campus Outlet')}</span>
            </div>
          </div>
          <div class="dish-row-right">
            <span class="dish-row-price">${priceText}</span>
            <button class="btn btn-outline btn-sm" onclick="openSpotDetailModal('${f.foodSpotId}')">View menu</button>
            <button class="btn-fav-toggle active" onclick="toggleFavorite('${f.foodSpotId}', '${f.menuItemId}')" title="Remove">${SVG_ICONS.heartFilled}</button>
          </div>
        </div>
      `;
    });
    html += '</div>';
    $container.html(html);
  }
}

// Feedback View & Submission
async function loadFeedbackView() {
  populateInlineFeedbackSpots();
  const $reviewsGrid = $('#community-feedback-grid');

  try {
    const res = await API.getFeedback();
    const reviews = res.feedback || [];
    $reviewsGrid.empty();

    if (reviews.length === 0) {
      $reviewsGrid.html(`
        <div class="empty-state">
          <h4>No student reviews yet.</h4>
          <p>Be the first to share your experience above.</p>
        </div>
      `);
      return;
    }

    reviews.forEach(fb => {
      const card = `
        <div class="review-card">
          <div class="review-card-header">
            <span class="review-card-author">${escapeHtml(fb.userName || 'Student')}</span>
            <span class="review-card-rating">★ ${fb.rating}/5</span>
          </div>
          ${fb.menuItemName ? `<div class="review-card-dish">Dish: ${escapeHtml(fb.menuItemName)}</div>` : ''}
          <p class="review-card-text">"${escapeHtml(fb.feedbackText)}"</p>
          <div class="review-card-meta">
            Food Spot: <strong>${escapeHtml(fb.foodSpotName || fb.foodSpotId)}</strong>
          </div>
        </div>
      `;
      $reviewsGrid.append(card);
    });
  } catch (err) {
    console.error('Feedback loading error:', err);
    $reviewsGrid.html('<div class="empty-state"><p>Unable to load reviews right now.</p></div>');
  }
}

async function handleInlineFeedbackSubmit(e) {
  e.preventDefault();
  const $status = $('#inline-fb-status');
  $status.hide();

  const spotId = $('#inline-fb-spot').val();
  const dishName = $('#inline-fb-dish').val().trim();
  const rating = $('#inline-fb-rating').val();
  const text = $('#inline-fb-text').val().trim();
  const author = $('#inline-fb-author').val().trim();

  if (!spotId) {
    $status.css({ background: '#FDE8E8', color: '#9B1C1C' }).text('Please select a food spot.').show();
    return;
  }

  if (!text) {
    $status.css({ background: '#FDE8E8', color: '#9B1C1C' }).text('Please enter your review comments.').show();
    return;
  }

  try {
    await API.submitFeedback({
      foodSpotId: spotId,
      menuItemName: dishName || null,
      rating: parseInt(rating, 10),
      feedbackText: text,
      authorName: author || (AppState.currentUser ? AppState.currentUser.name : 'Student')
    });

    $('#inline-fb-text').val('');
    $('#inline-fb-dish').val('');
    $status.css({ background: '#DEF7EC', color: '#03543F' }).text('Thank you! Your review was submitted successfully.').show();
    loadFeedbackView();
  } catch (err) {
    console.error('Feedback submission error:', err);
    $status.css({ background: '#FDE8E8', color: '#9B1C1C' }).text(`Unable to submit feedback: ${err.message}`).show();
  }
}

function showLoader(selector) {
  $(selector).html('<div style="grid-column:1/-1; text-align:center; padding:40px;"><div class="loader-spinner"></div><p style="margin-top:12px; color:var(--text-muted); font-size:0.88rem;">Loading...</p></div>');
}
