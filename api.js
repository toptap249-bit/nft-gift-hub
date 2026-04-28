const express = require('express');
const db = require('./db');
const { verifyInitData } = require('./validateInitData');

const router = express.Router();

// Optional Telegram initData verification middleware. If TELEGRAM_BOT_TOKEN
// is set and request contains x-telegram-init-data header, we validate the
// signature and require that the body's telegram_id matches the signed user.
function authTelegram(req, res, next) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const initData = req.header('x-telegram-init-data');
  if (!token || !initData) return next();

  const result = verifyInitData(initData, token);
  if (!result.ok) return res.status(401).json({ error: 'Invalid Telegram initData' });
  req.tgUser = result.user;

  const claimedId = Number(req.body?.telegram_id ?? req.params?.telegram_id);
  if (claimedId && result.user?.id && claimedId !== Number(result.user.id)) {
    return res.status(403).json({ error: 'telegram_id mismatch' });
  }
  next();
}

router.use(authTelegram);

// ─── USER ───────────────────────────────────────────────────────────────────
router.post('/init', (req, res) => {
  const { telegram_id, first_name, username } = req.body || {};
  if (!telegram_id) return res.status(400).json({ error: 'telegram_id required' });
  const user = db.initUser(Number(telegram_id), first_name || 'Player', username || '');
  res.json(user);
});

router.get('/user/:telegram_id', (req, res) => {
  const user = db.getUser(Number(req.params.telegram_id));
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// ─── DAILY ──────────────────────────────────────────────────────────────────
router.post('/daily', (req, res) => {
  const { telegram_id } = req.body || {};
  const updated = db.claimDaily(Number(telegram_id));
  if (!updated) return res.json({ ok: false, message: 'Уже получено сегодня. Заходи завтра!' });
  res.json({ ok: true, message: '🎁 +25 ⭐ Ежедневная награда!' });
});

// ─── CATALOG ────────────────────────────────────────────────────────────────
router.get('/catalog', (req, res) => {
  res.json({ gifts: db.getCatalog(), boxes: db.getBoxes() });
});

// ─── GIFTS ──────────────────────────────────────────────────────────────────
router.get('/gifts/:telegram_id', (req, res) => {
  res.json({ gifts: db.getGifts(Number(req.params.telegram_id)) });
});

// ─── FARM ───────────────────────────────────────────────────────────────────
router.get('/farm/:telegram_id', (req, res) => {
  const tid = Number(req.params.telegram_id);
  const user = db.getUser(tid);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({
    slots: db.getFarmSlots(tid),
    max_slots: user.max_slots,
    boxes: db.getBoxes(),
  });
});

router.post('/farm/plant', (req, res) => {
  const { telegram_id, slot_index, box_key } = req.body || {};
  const tid = Number(telegram_id);
  const user = db.getUser(tid);
  if (!user) return res.status(404).json({ ok: false, error: 'User not found' });

  const box = db.getBoxes().find(b => b.key === box_key);
  if (!box) return res.status(400).json({ ok: false, error: 'Неизвестный бокс' });
  if (user.stars < box.cost) return res.status(400).json({ ok: false, error: 'Недостаточно звёзд' });

  const slot = db.plantBox(tid, Number(slot_index), box_key);
  if (!slot) return res.status(400).json({ ok: false, error: 'Слот занят или не существует' });

  db.updateUser(tid, { stars: user.stars - box.cost, stars_spent: (user.stars_spent || 0) + box.cost });
  res.json({ ok: true, slot });
});

router.post('/farm/harvest', (req, res) => {
  const { telegram_id, slot_index } = req.body || {};
  const tid = Number(telegram_id);
  const gift = db.harvestSlot(tid, Number(slot_index));
  if (!gift) return res.status(400).json({ ok: false, error: 'Ещё не созрело или слот пуст' });
  res.json({ ok: true, gift });
});

// ─── MARKET ─────────────────────────────────────────────────────────────────
router.get('/market', (req, res) => {
  res.json({ listings: db.getListings() });
});

router.post('/market/list', (req, res) => {
  const { telegram_id, gift_id, price } = req.body || {};
  const tid = Number(telegram_id);
  const gid = Number(gift_id);
  const p = Math.floor(Number(price));
  if (!p || p < 1) return res.status(400).json({ ok: false, error: 'Цена должна быть > 0' });
  const listing = db.listGift(gid, tid, p);
  if (!listing) return res.status(400).json({ ok: false, error: 'NFT не найден или не твой' });
  res.json({ ok: true, listing });
});

router.post('/market/buy', (req, res) => {
  const { telegram_id, listing_id } = req.body || {};
  const tid = Number(telegram_id);
  const lid = Number(listing_id);
  const listing = db.getListing(lid);
  if (!listing || listing.status !== 'active') return res.status(400).json({ ok: false, error: 'Лот недоступен' });
  if (listing.seller_tid === tid) return res.status(400).json({ ok: false, error: 'Нельзя купить свой лот' });
  const buyer = db.getUser(tid);
  if (!buyer) return res.status(404).json({ ok: false, error: 'User not found' });
  if (buyer.stars < listing.price) return res.status(400).json({ ok: false, error: 'Недостаточно звёзд' });
  const gift = db.buyListing(lid, tid);
  if (!gift) return res.status(400).json({ ok: false, error: 'Покупка не удалась' });
  res.json({ ok: true, gift });
});

router.post('/market/cancel', (req, res) => {
  const { telegram_id, listing_id } = req.body || {};
  const ok = db.cancelListing(Number(listing_id), Number(telegram_id));
  if (!ok) return res.status(400).json({ ok: false, error: 'Лот не найден или не твой' });
  res.json({ ok: true });
});

// ─── COMBINE (formerly craft) ───────────────────────────────────────────────
router.post('/combine', (req, res) => {
  const { telegram_id, gift_ids } = req.body || {};
  if (!Array.isArray(gift_ids) || gift_ids.length !== 3) {
    return res.status(400).json({ ok: false, error: 'Нужно ровно 3 NFT' });
  }
  const ids = gift_ids.map(Number);
  const newGift = db.combineGifts(Number(telegram_id), ids);
  if (!newGift) return res.status(400).json({ ok: false, error: 'Объединение не удалось' });
  res.json({ ok: true, gift: newGift });
});

// ─── LEADERBOARD ────────────────────────────────────────────────────────────
router.get('/leaderboard', (req, res) => {
  res.json({ top: db.getLeaderboard(10) });
});

module.exports = router;
