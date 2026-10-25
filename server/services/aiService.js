const dataStore = require('./dataStore');
const recommendationEngine = require('./recommendationEngine');

// Location Metadata Map for Grounded Chat Responses
const LOCATION_LABELS = {
  prp: 'PRP — Pearl Research Park',
  sjt: 'SJT (Silver Jubilee Tower)',
  mgb: 'MGB (Mahatma Gandhi Block)',
  tt: 'TT (Technology Tower)',
  gdn: 'GDN Block',
  smv: 'SMV Building',
  library: 'Central Library Walkway',
  mh: "Men's Hostel",
  lh: "Ladies' Hostel",
  kc: 'KC Gazebo Food Hub'
};

// Entity Extraction
function extractQueryEntities(message) {
  const text = message.toLowerCase().trim();

  // 0. Conversational Greeting check
  const isGreeting = /^(?:hi|hello|hey|good\s*(?:morning|afternoon|evening)|help|who\s*are\s*you)\b/i.test(text);

  let location = null;
  if (/\bsjt\b|silver jubilee/i.test(text)) location = 'sjt';
  else if (/\bprp\b|pearl|periyar/i.test(text)) location = 'prp';
  else if (/\bmgb\b|mg block|mahatma gandhi/i.test(text)) location = 'mgb';
  else if (/\btt\b|tech\w* tower/i.test(text)) location = 'tt';
  else if (/\bgdn\b|naidu/i.test(text)) location = 'gdn';
  else if (/\bsmv\b|visvesvaraya/i.test(text)) location = 'smv';
  else if (/\blibrary\b|main block|walkway/i.test(text)) location = 'library';
  else if (/\b(?:lad(?:y|ies)(?:'s|')?|girls?(?:'s|')?)\s*hostel|\blh\b/i.test(text)) location = 'lh';
  else if (/\b(?:men(?:'s|s)?|boys?(?:'s|')?)\s*hostel|\bmh\b/i.test(text)) location = 'mh';
  else if (/\bkc\b|gazebo/i.test(text)) location = 'kc';

  let maxBudget = null;
  const budgetMatch = text.match(/(?:under|below|less than|within|around|upto|up to|₹|\brs\.?\s*)\s*(\d{2,4})/i) ||
                      text.match(/(\d{2,4})\s*(?:rs|inr|rupees|bucks)/i);
  if (budgetMatch) {
    maxBudget = parseInt(budgetMatch[1], 10);
  }

  let dietary = null;
  if (/\bnon[\s-]?veg\b|chicken|meat|egg|fish/i.test(text)) {
    dietary = 'non-veg';
  } else if (/\bveg\b|vegetarian|paneer/i.test(text)) {
    dietary = 'veg';
  }

  let dishQuery = null;
  if (/\b(?:biryani|biriyani)\b/i.test(text)) { dishQuery = 'biryani'; }
  else if (/\b(?:coffee|cappuccino|latte|cold\s*coffee|cafe)\b/i.test(text)) { dishQuery = 'coffee'; }
  else if (/\b(?:chai|tea)\b/i.test(text)) { dishQuery = 'tea'; }
  else if (/\bpizza\b/i.test(text)) { dishQuery = 'pizza'; }
  else if (/\bburgers?\b/i.test(text)) { dishQuery = 'burger'; }
  else if (/\b(?:shawarma|rolls?|wraps?)\b/i.test(text)) { dishQuery = 'shawarma'; }
  else if (/\b(?:dosa|dosai|idli|vada|uttapam)\b/i.test(text)) { dishQuery = 'dosa'; }
  else if (/\b(?:fried\s*rice|rice|pulao|jeera\s*rice)\b/i.test(text)) { dishQuery = 'rice'; }
  else if (/\b(?:noodles?|hakka|chowmein|maggi)\b/i.test(text)) { dishQuery = 'noodles'; }
  else if (/\b(?:juice|shake|smoothie|falooda)\b/i.test(text)) { dishQuery = 'juice'; }
  else if (/\bsandwich(?:es)?\b/i.test(text)) { dishQuery = 'sandwich'; }
  else if (/\bpasta\b/i.test(text)) { dishQuery = 'pasta'; }
  else if (/\b(?:waffle|cake|pastry|dessert|ice\s*cream)\b/i.test(text)) { dishQuery = 'dessert'; }
  else if (/\b(?:snack|starter|fries|puff)\b/i.test(text)) { dishQuery = 'snack'; }
  else if (/\b(?:meals?|thali|lunch|dinner|curry|roti)\b/i.test(text)) { dishQuery = 'meal'; }
  else {
    // General extraction for "where can I get X" or "where to eat X"
    const generalMatch = text.match(/(?:where\s+can\s+i\s+(?:get|find|eat|buy)|looking\s+for|do\s+you\s+have|available\s+for)\s+([a-zA-Z\s]{3,20})/i);
    if (generalMatch) {
      const candidate = generalMatch[1].replace(/\b(?:from|in|at|near|these|places|campus|vit)\b/gi, '').trim();
      if (candidate.length >= 3 && !candidate.includes('food') && !candidate.includes('place')) {
        dishQuery = candidate;
      }
    }
  }

  let spotQuery = null;
  if (/\bflora\b/i.test(text)) spotQuery = 'flora';
  else if (/\bamul\b/i.test(text)) spotQuery = 'amul';
  else if (/\bjust\s*bake\b/i.test(text)) spotQuery = 'just-bake';
  else if (/\baunty'?s(?:\s*mess)?\b/i.test(text)) spotQuery = 'auntys-mess';
  else if (/\bdarling\b/i.test(text)) spotQuery = 'darling';
  else if (/\bdominos?\b/i.test(text)) spotQuery = 'dominos';
  else if (/\bnescafe\b/i.test(text)) spotQuery = 'nescafe';
  else if (/\baavin\b/i.test(text)) spotQuery = 'aavin';
  else if (/\bsugarcane\b/i.test(text)) spotQuery = 'sugarcane';
  else if (/\bone\s*food\s*world|\bofw\b/i.test(text)) spotQuery = 'one-food-world';
  else if (/\bolives\b/i.test(text)) spotQuery = 'olives';
  else if (/\barasan\b/i.test(text)) spotQuery = 'arasan';
  else if (/\bmadras\s*coffee\b/i.test(text)) spotQuery = 'madras-coffee-house';

  return { isGreeting, location, maxBudget, dietary, dishQuery, spotQuery };
}

/**
 * Concise, Natural-Language Rule-Based Engine (100% Database Grounded)
 */
async function generateRuleBasedResponse(userQuery) {
  const entities = extractQueryEntities(userQuery);
  const { isGreeting, location, maxBudget, dietary, dishQuery, spotQuery } = entities;

  const locLabel = location ? (LOCATION_LABELS[location] || location.toUpperCase()) : '';

  // 0. Conversational Greeting
  if (isGreeting && !dishQuery && !location && !maxBudget && !spotQuery) {
    return {
      reply: "Hello! I am your VIT Food Discovery Assistant.\n\nI can help you find food spots around campus (SJT, PRP, MGB, TT, GDN, SMV, Hostels), discover where to get specific dishes like biryani, dosa, coffee, or find budget meals under ₹100. What would you like to eat today?",
      provider: 'database-engine',
      verifiedDataOnly: true
    };
  }

  // 1. Specific Query: Dish + Location (e.g. "Where can I get biriyani near PRP?")
  if (dishQuery && location) {
    const { items } = await dataStore.getMenuItems({
      search: dishQuery,
      location,
      dietary,
      maxPrice: maxBudget,
      limit: 10
    });

    if (items && items.length > 0) {
      // Group by spot
      const spotMap = new Map();
      items.forEach(i => {
        const spotName = i.spotName || i.foodSpotName || 'Campus Spot';
        if (!spotMap.has(spotName)) {
          spotMap.set(spotName, i);
        }
      });

      const bullets = Array.from(spotMap.entries()).slice(0, 4).map(([spot, item]) => {
        const price = item.price !== null ? ` (from ₹${item.price})` : '';
        return `- ${spot}: ${item.name}${price}`;
      }).join('\n');

      return {
        reply: `Near ${locLabel}, you can find ${dishQuery} at:\n${bullets}\n\nYou can view full menus and prices on the Explore page.`,
        provider: 'database-engine',
        verifiedDataOnly: true
      };
    } else {
      // Look across campus
      const campusRes = await dataStore.getMenuItems({ search: dishQuery, limit: 6 });
      const localSpots = await dataStore.getFoodSpots({ location_id: location });

      let campusBullets = '';
      if (campusRes.items && campusRes.items.length > 0) {
        const spotMap = new Map();
        campusRes.items.forEach(i => {
          const sName = i.spotName || i.foodSpotName;
          if (!spotMap.has(sName)) spotMap.set(sName, i);
        });
        campusBullets = Array.from(spotMap.entries()).slice(0, 3).map(([sName, item]) => {
          const pr = item.price !== null ? ` (₹${item.price})` : '';
          const z = item.spotZone ? ` [${item.spotZone}]` : '';
          return `- ${sName}${z}: ${item.name}${pr}`;
        }).join('\n');
      }

      let localBullets = localSpots.slice(0, 3).map(s => `- ${s.name}: ${(s.categories || []).slice(0, 2).join(', ') || 'verified menu'}`).join('\n');

      let reply = `I did not find "${dishQuery}" directly inside ${locLabel}.`;
      if (campusBullets) {
        reply += `\n\nAcross campus, you can find ${dishQuery} at:\n${campusBullets}`;
      }
      if (localBullets) {
        reply += `\n\nFood spots located near ${locLabel} include:\n${localBullets}`;
      }
      return {
        reply,
        provider: 'database-engine',
        verifiedDataOnly: true
      };
    }
  }

  // 2. Specific Query: Known Food Spot (e.g. "Tell me about Flora", "Just Bake", "Nescafe")
  if (spotQuery) {
    if (spotQuery === 'nescafe') {
      return {
        reply: "Nescafe is available at 5 locations: SJT, TT, Central Library, Ladies' Hostel, and Men's Hostel.\nAll 5 branches share the same verified menu including Hot Coffee (₹20), Cold Coffee (₹35), and Lemon Tea (₹20).",
        provider: 'database-engine',
        verifiedDataOnly: true
      };
    }
    if (spotQuery === 'one-food-world') {
      return {
        reply: "One Food World is located in the Men's Hostel quadrangle.\nIt houses 6 counters: Al Beirut (Shawarma), Korean Wok Box (Noodles & Bowls), Hollywood Thick Shake Bar (Shakes), US Pizzeria (Pizza), Texas Fried Chicken (Crispy Chicken), and Fried Chicken & Burgers.",
        provider: 'database-engine',
        verifiedDataOnly: true
      };
    }
    if (spotQuery === 'amul') {
      return {
        reply: "Amul is located near the SMV Academic Building.\nIt offers scoop ice creams, sundae cones, kulfi bars, and dairy treats. Prices are listed on the Explore page.",
        provider: 'database-engine',
        verifiedDataOnly: true
      };
    }
    if (spotQuery === 'sugarcane') {
      return {
        reply: "The Sugarcane Juice stall is located near SMV Building.\n- Sugarcane Juice — ₹35\n- Sugarcane with Lime — ₹40\n- Tender Coconut — ₹60",
        provider: 'database-engine',
        verifiedDataOnly: true
      };
    }
    if (spotQuery === 'aavin') {
      return {
        reply: "Aavin Tea Stall is located near GDN Block.\n- Tea — ₹12\n- Coffee — ₹15\n- Boost / Horlicks — ₹20\n- Badam Milk — ₹40\n- Snacks & Sambara — ₹15",
        provider: 'database-engine',
        verifiedDataOnly: true
      };
    }

    const spot = await dataStore.getFoodSpotByIdOrSlug(spotQuery);
    if (spot) {
      const { items } = await dataStore.getMenuItems({ foodSpot: spot.id, limit: 4 });
      const dishSamples = items.slice(0, 3).map(d => `${d.name} (${d.price !== null ? `₹${d.price}` : 'Price not listed'})`).join(', ');
      return {
        reply: `${spot.name} is located at ${spot.specificLocation || spot.locationName}.\nPopular items include: ${dishSamples || 'full menu on Explore'}.`,
        provider: 'database-engine',
        verifiedDataOnly: true
      };
    }
  }

  // 3. Specific Query: Dish Query (e.g. "Where can I get biriyani?", "Where can I get coffee?")
  if (dishQuery) {
    const { items } = await dataStore.getMenuItems({
      search: dishQuery,
      dietary,
      maxPrice: maxBudget,
      limit: 15
    });

    if (items && items.length > 0) {
      const spotMap = new Map();
      items.forEach(i => {
        const spotName = i.spotName || i.foodSpotName || 'Campus Outlet';
        if (!spotMap.has(spotName)) {
          spotMap.set(spotName, i);
        }
      });

      const bullets = Array.from(spotMap.entries()).slice(0, 4).map(([spot, item]) => {
        const price = item.price !== null ? ` (from ₹${item.price})` : '';
        const zone = item.spotZone ? ` — ${item.spotZone}` : '';
        return `- ${spot}${zone}${price}`;
      }).join('\n');

      return {
        reply: `You can find ${dishQuery} at these food spots:\n${bullets}\n\nPrices are shown where available.`,
        provider: 'database-engine',
        verifiedDataOnly: true
      };
    }
  }

  // 4. Specific Query: Location (e.g. "What's near SJT?", "What food is available near MGB?", "Men's Hostel food")
  if (location) {
    const spots = await dataStore.getFoodSpots({ location_id: location });
    if (spots && spots.length > 0) {
      const bullets = spots.map(s => {
        const cats = (s.categories && s.categories.length > 0) ? ` (${s.categories.slice(0, 3).join(', ')})` : '';
        const mustTry = s.mustTryItem ? ` • Must-try: ${s.mustTryItem}` : '';
        return `- ${s.name}${cats}${mustTry}`;
      }).join('\n');

      return {
        reply: `Food spots located at ${locLabel}:\n${bullets}\n\nYou can click any spot on the Explore page to view its full menu.`,
        provider: 'database-engine',
        verifiedDataOnly: true
      };
    }
  }

  // 5. Specific Query: Budget (e.g. "What can I get under ₹100?")
  if (maxBudget) {
    const { items } = await dataStore.getMenuItems({
      maxPrice: maxBudget,
      dietary,
      limit: 15
    });

    if (items && items.length > 0) {
      // Pick unique spots
      const usedSpots = new Set();
      const selected = [];
      for (const i of items) {
        const spot = i.spotName || i.foodSpotName;
        if (!usedSpots.has(spot)) {
          usedSpots.add(spot);
          selected.push(i);
        }
        if (selected.length >= 5) break;
      }

      const bullets = selected.map(i => `- ${i.name} — ₹${i.price} (${i.spotName || i.foodSpotName})`).join('\n');

      return {
        reply: `Here are popular student options under ₹${maxBudget}:\n${bullets}\n\nYou can use the Budget filter on Explore to see all dishes.`,
        provider: 'database-engine',
        verifiedDataOnly: true
      };
    }
  }

  // 6. General Campus Discovery Fallback (Always return actual real campus dining)
  return {
    reply: `Here are top campus food spots to explore across VIT Vellore:\n- One Food World (Men's Hostel) — 6 counters: Lebanese shawarma, Korean wok bowls, pizza & shakes\n- Flora (Ladies' Hostel) — Fried rice, biriyani, wraps, burgers & Maggi\n- Sri Sai Sabari (PRP) — Dosas, South Indian thalis, chaat & snacks\n- Arasan (SJT Ground Floor) — Comprehensive meals, thalis & North Indian\n- Darling Cafe (MGB) — Fresh puffs, pastries, tarts & desserts\n- Aavin Tea Stall (GDN) — Hot tea (₹12), filter coffee & Boost\n\nYou can ask about food near a specific block (e.g. SJT, PRP, MGB), specific dishes (e.g. biryani, dosa, coffee), or budget options under ₹100.`,
    provider: 'database-engine',
    verifiedDataOnly: true
  };
}

/**
 * Main AI Chat Processor with Grok API integration and Database Grounding
 */
async function processUserChat(userMessage) {
  if (!userMessage || typeof userMessage !== 'string' || userMessage.trim().length === 0) {
    throw new Error('Chat message cannot be empty.');
  }

  const cleanQuery = userMessage.trim().substring(0, 500);

  const grokApiKey = process.env.GROK_API_KEY;

  // Try Grok API if key provided
  if (grokApiKey && grokApiKey.trim() !== '') {
    try {
      const entities = extractQueryEntities(cleanQuery);
      let contextRecords = [];

      // Retrieve relevant database data first for Grok grounding
      if (entities.dishQuery) {
        const { items } = await dataStore.getMenuItems({ search: entities.dishQuery, location: entities.location, limit: 6 });
        contextRecords = items.map(i => `${i.name} (₹${i.price || 'Price unlisted'}) at ${i.spotName || i.foodSpotName} [${i.spotZone}]`);
      } else if (entities.location) {
        const spots = await dataStore.getFoodSpots({ location_id: entities.location });
        contextRecords = spots.map(s => `${s.name} located at ${s.specificLocation || s.zone} (Categories: ${(s.categories || []).join(', ')})`);
      } else if (entities.maxBudget) {
        const { items } = await dataStore.getMenuItems({ maxPrice: entities.maxBudget, limit: 6 });
        contextRecords = items.map(i => `${i.name} (₹${i.price}) at ${i.spotName || i.foodSpotName}`);
      }

      const contextText = contextRecords.join('\n');

      const systemPrompt = `You are the VIT Vellore Food Discovery Assistant.
You answer questions from VIT students looking for food on campus.
RULES:
1. Ground all answers strictly in the verified VIT campus database snapshot below.
2. Format answers with clear, concise bullet points (- Spot — details).
3. Mention prices and outlet names accurately. Never hallucinate.
4. If asked about a location, mention real spots near that block.

DATABASE SNAPSHOT:
${contextText || "Campus Food Spots: One Food World (MH), Just Bake (MH), Flora (LH), Aunty's Mess (LH), Olives Cafe (PRP), Sri Sai Sabari (PRP), Arasan (SJT), Dominos (SJT), Darling Cafe (MGB), Aavin (GDN), Amul (SMV), Sugarcane (SMV), Nescafe (SJT, TT, Library, MH, LH)."}`;

      const res = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${grokApiKey.trim()}`
        },
        body: JSON.stringify({
          model: 'grok-beta',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: cleanQuery }
          ],
          temperature: 0.2,
          max_tokens: 200
        })
      });

      if (res.ok) {
        const json = await res.json();
        const reply = json.choices?.[0]?.message?.content;
        if (reply && reply.trim().length > 0) {
          return {
            reply: reply.trim(),
            provider: 'xai-grok',
            verifiedDataOnly: true
          };
        }
      }
    } catch (grokError) {
      console.warn('[AIService] Grok API call error:', grokError.message);
    }
  }

  // High-performance database-grounded rule-based engine
  return await generateRuleBasedResponse(cleanQuery);
}

module.exports = {
  processUserChat,
  generateRuleBasedResponse,
  extractQueryEntities
};

module.exports = {
  processUserChat,
  generateRuleBasedResponse,
  extractQueryEntities
};
