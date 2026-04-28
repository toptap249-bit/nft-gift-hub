const fs = require('fs');
const path = require('path');
const { GIFTS, GIFTS_BY_SLUG, BOXES, pickGiftFromBox, pickRandomGift } = require('./gifts-pool');

const DB_PATH = path.join(__dirname, 'data.json');

let data = {
  users: {},
  gifts: {},
  farm_slots: {},
  market_listings: {},
  giftIdCounter: 1,
  listingIdCounter: 1,
  schemaVersion: 2,
};

function loadDb() {
  if (fs.existsSync(DB_PATH)) {
    try {
      const loaded = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
      // Drop pre-v2 data (rarity-based schema is incompatible).
      if (loaded.schemaVersion === 2) {
        data = loaded;
        return;
      }
    } catch {}
  }
  seedFakeMarket();
  saveDb();
}

function saveDb() {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// Pre-fill marketplace with NPC listings so the market has visible inventory
// on first boot. Listings are owned by a fake "Fragment" user (telegram_id = 1).
function seedFakeMarket() {
  const NPC_ID = 1;
  data.users[NPC_ID] = {
    telegram_id: NPC_ID, first_name: 'Fragment', username: 'fragment',
    level: 99, xp: 0, xp_needed: 100, stars: 0, stars_spent: 0,
    gift_count: 0, last_daily: null, max_slots: 1,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  };

  // Pick 24 random gifts spread across price bands so the market is interesting.
  const sampleSlugs = pickSpread(24);
  for (const slug of sampleSlugs) {
    const def = GIFTS_BY_SLUG[slug];
    if (!def) continue;
    const giftId = data.giftIdCounter++;
    data.gifts[giftId] = {
      id: giftId, owner_tid: NPC_ID,
      slug: def.slug, gift_name: def.name,
      created_at: new Date().toISOString(),
    };
    const listingId = data.listingIdCounter++;
    // List at floor +/- 15% to feel organic.
    const variance = 0.85 + Math.random() * 0.3;
    data.market_listings[listingId] = {
      id: listingId, gift_id: giftId, seller_tid: NPC_ID,
      seller_name: 'Fragment',
      slug: def.slug, gift_name: def.name,
      price: Math.max(5, Math.round(def.floor * variance)),
      status: 'active', created_at: new Date().toISOString(),
    };
  }
}

function pickSpread(count) {
  // Pick gifts evenly across price bands so the market shows cheap + expensive.
  const sorted = [...GIFTS].sort((a, b) => a.floor - b.floor);
  const out = [];
  for (let i = 0; i < count; i++) {
    const idx = Math.floor((i / count) * sorted.length);
    const jitter = Math.floor(Math.random() * 5) - 2;
    const pick = sorted[Math.max(0, Math.min(sorted.length - 1, idx + jitter))];
    out.push(pick.slug);
  }
  return out;
}

const db = {
  // ─── USER ───
  initUser(telegram_id, first_name, username) {
    if (!data.users[telegram_id]) {
      data.users[telegram_id] = {
        telegram_id,
        first_name,
        username: username || '',
        level: 1,
        xp: 0,
        xp_needed: 100,
        stars: 50,
        stars_spent: 0,
        gift_count: 0,
        last_daily: null,
        max_slots: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      data.farm_slots[telegram_id] = [
        { slot_index: 0, status: 'empty', box_key: null, planted_at: null, ready_at: null }
      ];
      saveDb();
    }
    return data.users[telegram_id];
  },

  getUser(telegram_id) {
    return data.users[telegram_id] || null;
  },

  updateUser(telegram_id, updates) {
    if (data.users[telegram_id]) {
      data.users[telegram_id] = { ...data.users[telegram_id], ...updates, updated_at: new Date().toISOString() };
      saveDb();
      return data.users[telegram_id];
    }
    return null;
  },

  addXp(telegram_id, xp) {
    const user = data.users[telegram_id];
    if (!user) return null;

    user.xp += xp;
    let leveledUp = false;

    while (user.xp >= user.xp_needed) {
      user.xp -= user.xp_needed;
      user.level += 1;
      user.xp_needed = Math.ceil(user.xp_needed * 1.2);
      leveledUp = true;

      if ([3, 7, 15, 30, 60].includes(user.level)) {
        const slotIndex = data.farm_slots[telegram_id].length;
        data.farm_slots[telegram_id].push({
          slot_index: slotIndex,
          status: 'empty',
          box_key: null,
          planted_at: null,
          ready_at: null,
        });
        user.max_slots = data.farm_slots[telegram_id].length;
      }
    }

    saveDb();
    return { user, leveledUp };
  },

  claimDaily(telegram_id) {
    const user = data.users[telegram_id];
    if (!user) return null;
    const today = new Date().toISOString().slice(0, 10);
    if (user.last_daily === today) return null;
    user.stars += 25;
    user.last_daily = today;
    saveDb();
    return user;
  },

  // ─── GIFTS ───
  addGift(owner_tid, slug) {
    const def = GIFTS_BY_SLUG[slug];
    if (!def) return null;
    const id = data.giftIdCounter++;
    data.gifts[id] = {
      id, owner_tid, slug, gift_name: def.name,
      created_at: new Date().toISOString(),
    };
    const user = data.users[owner_tid];
    if (user) {
      user.gift_count++;
      saveDb();
    }
    return data.gifts[id];
  },

  getGifts(owner_tid) {
    return Object.values(data.gifts).filter(g => g.owner_tid === owner_tid);
  },

  getGift(id) {
    return data.gifts[id] || null;
  },

  removeGift(id) {
    const gift = data.gifts[id];
    if (gift) {
      const user = data.users[gift.owner_tid];
      if (user && user.gift_count > 0) user.gift_count--;
      delete data.gifts[id];
      saveDb();
    }
  },

  // ─── FARM ───
  getFarmSlots(user_tid) {
    return data.farm_slots[user_tid] || [];
  },

  plantBox(user_tid, slot_index, box_key) {
    const slots = data.farm_slots[user_tid];
    if (!slots) return null;
    const slot = slots.find(s => s.slot_index === slot_index);
    if (!slot || slot.status !== 'empty') return null;
    const box = BOXES.find(b => b.key === box_key);
    if (!box) return null;

    const now = new Date();
    const readyAt = new Date(now.getTime() + box.growth_minutes * 60 * 1000);
    slot.status = 'growing';
    slot.box_key = box_key;
    slot.planted_at = now.toISOString();
    slot.ready_at = readyAt.toISOString();
    saveDb();
    return slot;
  },

  harvestSlot(user_tid, slot_index) {
    const slots = data.farm_slots[user_tid];
    if (!slots) return null;
    const slot = slots.find(s => s.slot_index === slot_index);
    if (!slot || slot.status !== 'growing') return null;
    if (Date.now() < new Date(slot.ready_at).getTime()) return null;

    const picked = pickGiftFromBox(slot.box_key);
    if (!picked) return null;

    const gift = this.addGift(user_tid, picked.slug);
    this.addXp(user_tid, 10);

    slot.status = 'empty';
    slot.box_key = null;
    slot.planted_at = null;
    slot.ready_at = null;
    saveDb();
    return gift;
  },

  // ─── MARKET ───
  listGift(gift_id, seller_tid, price) {
    const gift = data.gifts[gift_id];
    if (!gift || gift.owner_tid !== seller_tid) return null;
    const id = data.listingIdCounter++;
    const user = data.users[seller_tid];
    data.market_listings[id] = {
      id, gift_id, seller_tid,
      seller_name: user?.first_name || 'Player',
      slug: gift.slug, gift_name: gift.gift_name,
      price,
      status: 'active', created_at: new Date().toISOString(),
    };
    saveDb();
    return data.market_listings[id];
  },

  getListings() {
    return Object.values(data.market_listings).filter(l => l.status === 'active');
  },

  getListing(id) {
    return data.market_listings[id] || null;
  },

  buyListing(listing_id, buyer_tid) {
    const listing = data.market_listings[listing_id];
    if (!listing || listing.status !== 'active') return null;
    const buyer = data.users[buyer_tid];
    const seller = data.users[listing.seller_tid];
    if (!buyer || !seller) return null;
    if (buyer.stars < listing.price) return null;

    const gift = data.gifts[listing.gift_id];
    if (!gift) return null;

    buyer.stars -= listing.price;
    seller.stars += listing.price;
    seller.stars_spent += listing.price;

    gift.owner_tid = buyer_tid;
    buyer.gift_count++;
    if (seller.gift_count > 0) seller.gift_count--;

    listing.status = 'sold';
    this.addXp(buyer_tid, 5);
    saveDb();
    return gift;
  },

  cancelListing(listing_id, user_tid) {
    const listing = data.market_listings[listing_id];
    if (!listing || listing.seller_tid !== user_tid) return false;
    listing.status = 'cancelled';
    saveDb();
    return true;
  },

  // ─── COMBINE ───
  // Replaces old "craft": merge 3 gifts of any slug into 1 random gift whose
  // floor price is ~1.4x the average input floor. No rarity involved.
  combineGifts(user_tid, gift_ids) {
    if (gift_ids.length !== 3) return null;
    const gifts = gift_ids.map(id => data.gifts[id]).filter(g => g && g.owner_tid === user_tid);
    if (gifts.length !== 3) return null;

    const avgFloor = gifts.reduce((sum, g) => sum + (GIFTS_BY_SLUG[g.slug]?.floor || 0), 0) / 3;
    const targetFloor = avgFloor * 1.4;

    // Pick a gift whose floor is closest to (but not below) the target.
    const candidates = GIFTS.filter(g => g.floor >= avgFloor * 0.9 && g.floor <= targetFloor * 1.5);
    const pool = candidates.length ? candidates : GIFTS;
    const picked = pool[Math.floor(Math.random() * pool.length)];

    gift_ids.forEach(id => this.removeGift(id));
    const newGift = this.addGift(user_tid, picked.slug);
    this.addXp(user_tid, 25);
    return newGift;
  },

  // ─── BOXES ───
  getBoxes() {
    return BOXES;
  },

  getCatalog() {
    return GIFTS;
  },

  // ─── LEADERBOARD ───
  getLeaderboard(limit = 10) {
    return Object.values(data.users)
      .filter(u => u.telegram_id !== 1)
      .sort((a, b) => b.level - a.level || b.gift_count - a.gift_count)
      .slice(0, limit);
  },
};

loadDb();
console.log('✅ Database loaded');

module.exports = db;
