// Real Telegram Gifts catalog from fragment.com/gifts.
// Each gift has: slug (== icon filename in /icons/), name, supply, floor (base price in stars).
// No rarity tiers — gifts are differentiated by their floor price (market value).

const GIFTS = [
  { slug: 'plushpepe', name: "Plush Pepe", supply: 2384, floor: 9999 },
  { slug: 'heartlocket', name: "Heart Locket", supply: 981, floor: 4500 },
  { slug: 'preciouspeach', name: "Precious Peach", supply: 2021, floor: 2200 },
  { slug: 'diamondring', name: "Diamond Ring", supply: 7413, floor: 1500 },
  { slug: 'astralshard', name: "Astral Shard", supply: 2672, floor: 1200 },
  { slug: 'eternalrose', name: "Eternal Rose", supply: 4845, floor: 1100 },
  { slug: 'magicpotion', name: "Magic Potion", supply: 3191, floor: 950 },
  { slug: 'genielamp', name: "Genie Lamp", supply: 2477, floor: 900 },
  { slug: 'minioscar', name: "Mini Oscar", supply: 1989, floor: 872 },
  { slug: 'perfumebottle', name: "Perfume Bottle", supply: 1964, floor: 872 },
  { slug: 'gemsignet', name: "Gem Signet", supply: 1903, floor: 856 },
  { slug: 'swisswatch', name: "Swiss Watch", supply: 9468, floor: 850 },
  { slug: 'blingbinky', name: "Bling Binky", supply: 1592, floor: 840 },
  { slug: 'nailbracelet', name: "Nail Bracelet", supply: 1588, floor: 832 },
  { slug: 'heroichelmet', name: "Heroic Helmet", supply: 1145, floor: 816 },
  { slug: 'iongem', name: "Ion Gem", supply: 2471, floor: 750 },
  { slug: 'rarebird', name: "Rare Bird", supply: 1909, floor: 736 },
  { slug: 'crystalball', name: "Crystal Ball", supply: 7401, floor: 700 },
  { slug: 'bondedring', name: "Bonded Ring", supply: 2575, floor: 650 },
  { slug: 'cupidcharm', name: "Cupid Charm", supply: 4835, floor: 600 },
  { slug: 'faithamulet', name: "Faith Amulet", supply: 8751, floor: 550 },
  { slug: 'mightyarm', name: "Mighty Arm", supply: 1564, floor: 500 },
  { slug: 'snakebox', name: "Snake Box", supply: 6612, floor: 450 },
  { slug: 'joyfulbundle', name: "Joyful Bundle", supply: 2770, floor: 428 },
  { slug: 'nekohelmet', name: "Neko Helmet", supply: 3570, floor: 428 },
  { slug: 'artisanbrick', name: "Artisan Brick", supply: 2463, floor: 424 },
  { slug: 'timelessbook', name: "Timeless Book", supply: 2400, floor: 420 },
  { slug: 'electricskull', name: "Electric Skull", supply: 3953, floor: 404 },
  { slug: 'voodoodoll', name: "Voodoo Doll", supply: 9808, floor: 400 },
  { slug: 'valentinebox', name: "Valentine Box", supply: 2918, floor: 396 },
  { slug: 'ionicdryer', name: "Ionic Dryer", supply: 2035, floor: 392 },
  { slug: 'khabibspapakha', name: "Khabib’s Papakha", supply: 2358, floor: 384 },
  { slug: 'prettyposy', name: "Pretty Posy", supply: 3464, floor: 380 },
  { slug: 'lovecandle', name: "Love Candle", supply: 2615, floor: 368 },
  { slug: 'sharptongue', name: "Sharp Tongue", supply: 3576, floor: 368 },
  { slug: 'durovscap', name: "Durov’s Cap", supply: 2851, floor: 364 },
  { slug: 'sleighbell', name: "Sleigh Bell", supply: 3511, floor: 360 },
  { slug: 'lightsword', name: "Light Sword", supply: 14075, floor: 350 },
  { slug: 'bowtie', name: "Bow Ty", supply: 6759, floor: 196 },
  { slug: 'lushbouquet', name: "Lush Bouquet", supply: 4687, floor: 196 },
  { slug: 'snowmittens', name: "Snow Mitten", supply: 4141, floor: 196 },
  { slug: 'hangingstar', name: "Hanging Star", supply: 5630, floor: 194 },
  { slug: 'jinglebells', name: "Jingle Bell", supply: 6886, floor: 194 },
  { slug: 'flyingbroom', name: "Flying Broom", supply: 6117, floor: 189 },
  { slug: 'winterwreath', name: "Winter Wreath", supply: 7531, floor: 185 },
  { slug: 'skullflower', name: "Skull Flower", supply: 6419, floor: 184 },
  { slug: 'skystilettos', name: "Sky Stiletto", supply: 4385, floor: 184 },
  { slug: 'starnotepad', name: "Star Notepad", supply: 7099, floor: 184 },
  { slug: 'lovepotion', name: "Love Potion", supply: 5718, floor: 180 },
  { slug: 'lowrider', name: "Low Rider", supply: 5545, floor: 180 },
  { slug: 'recordplayer', name: "Record Player", supply: 4738, floor: 180 },
  { slug: 'signetring', name: "Signet Ring", supply: 6629, floor: 180 },
  { slug: 'poolfloat', name: "Pool Float", supply: 5451, floor: 178 },
  { slug: 'snowglobe', name: "Snow Globe", supply: 5051, floor: 178 },
  { slug: 'lootbag', name: "Loot Bag", supply: 6038, floor: 176 },
  { slug: 'moneypot', name: "Money Pot", supply: 7086, floor: 176 },
  { slug: 'ufcstrike', name: "UFC Strike", supply: 4540, floor: 176 },
  { slug: 'vintagecigar', name: "Vintage Cigar", supply: 7562, floor: 175 },
  { slug: 'madpumpkin', name: "Mad Pumpkin", supply: 5971, floor: 173 },
  { slug: 'moodpack', name: "Mood Pack", supply: 5330, floor: 171 },
  { slug: 'hypnolollipop', name: "Hypno Lollipop", supply: 7405, floor: 169 },
  { slug: 'restlessjar', name: "Restless Jar", supply: 7381, floor: 169 },
  { slug: 'tophat', name: "Top Hat", supply: 7349, floor: 169 },
  { slug: 'bunnymuffin', name: "Bunny Muffin", supply: 5382, floor: 167 },
  { slug: 'westsidesign', name: "Westside Sign", supply: 4571, floor: 166 },
  { slug: 'freshsocks', name: "Fresh Sock", supply: 7847, floor: 164 },
  { slug: 'happybrownie', name: "Happy Browny", supply: 7904, floor: 164 },
  { slug: 'kissedfrog', name: "Kissed Frog", supply: 7158, floor: 164 },
  { slug: 'holidaydrink', name: "Holiday Drink", supply: 4974, floor: 162 },
  { slug: 'moussecake', name: "Mousse Cake", supply: 4855, floor: 162 },
  { slug: 'sakuraflower', name: "Sakura Flower", supply: 11834, floor: 88 },
  { slug: 'stellarrocket', name: "Stellar Rocket", supply: 13142, floor: 88 },
  { slug: 'eternalcandle', name: "Eternal Candle", supply: 10805, floor: 86 },
  { slug: 'petsnake', name: "Pet Snake", supply: 8038, floor: 86 },
  { slug: 'vicecream', name: "Vice Cream", supply: 11098, floor: 86 },
  { slug: 'victorymedal', name: "Victory Medal", supply: 8058, floor: 86 },
  { slug: 'spicedwine', name: "Spiced Wine", supply: 10682, floor: 85 },
  { slug: 'whipcupcake', name: "Whip Cupcake", supply: 9989, floor: 85 },
  { slug: 'hexpot', name: "Hex Pot", supply: 13413, floor: 82 },
  { slug: 'scaredcat', name: "Scared Cat", supply: 13226, floor: 82 },
  { slug: 'berrybox', name: "Berry Box", supply: 8032, floor: 81 },
  { slug: 'chillflame', name: "Chill Flame", supply: 13280, floor: 81 },
  { slug: 'cloverpin', name: "Clover Pin", supply: 14536, floor: 81 },
  { slug: 'jackinthebox', name: "Jack-in-the-Box", supply: 14587, floor: 81 },
  { slug: 'jollychimp', name: "Jolly Chimp", supply: 11275, floor: 81 },
  { slug: 'santahat', name: "Santa Hat", supply: 10507, floor: 81 },
  { slug: 'springbasket', name: "Spring Basket", supply: 8745, floor: 81 },
  { slug: 'cookieheart', name: "Cookie Heart", supply: 11244, floor: 80 },
  { slug: 'moonpendant', name: "Moon Pendant", supply: 10910, floor: 80 },
  { slug: 'candycane', name: "Candy Cane", supply: 11755, floor: 79 },
  { slug: 'tamagadget', name: "Tama Gadget", supply: 9026, floor: 79 },
  { slug: 'jellybunny', name: "Jelly Bunny", supply: 12291, floor: 78 },
  { slug: 'inputkey', name: "Input Key", supply: 10352, floor: 77 },
  { slug: 'snoopcigar', name: "Snoop Cigar", supply: 13938, floor: 76 },
  { slug: 'lunarsnake', name: "Lunar Snake", supply: 13589, floor: 75 },
  { slug: 'xmasstocking', name: "Xmas Stocking", supply: 9877, floor: 75 },
  { slug: 'bigyear', name: "Big Year", supply: 9763, floor: 74 },
  { slug: 'jesterhat', name: "Jester Hat", supply: 10153, floor: 74 },
  { slug: 'trappedheart', name: "Trapped Heart", supply: 9222, floor: 74 },
  { slug: 'evileye', name: "Evil Eye", supply: 16655, floor: 38 },
  { slug: 'instantramen', name: "Instant Ramen", supply: 16872, floor: 38 },
  { slug: 'partysparkler', name: "Party Sparkler", supply: 18507, floor: 38 },
  { slug: 'swagbag', name: "Swag Bag", supply: 16649, floor: 37 },
  { slug: 'bdaycandle', name: "B-Day Candle", supply: 21352, floor: 36 },
  { slug: 'gingercookie', name: "Ginger Cooky", supply: 15111, floor: 35 },
  { slug: 'easteregg', name: "Easter Egg", supply: 23139, floor: 33 },
  { slug: 'homemadecake', name: "Homemade Cake", supply: 31138, floor: 16 },
  { slug: 'spyagaric', name: "Spy Agaric", supply: 27586, floor: 16 },
  { slug: 'witchhat', name: "Witch Hat", supply: 29712, floor: 16 },
  { slug: 'deskcalendar', name: "Desk Calendar", supply: 29299, floor: 15 },
  { slug: 'lolpop', name: "Lol Pop", supply: 59912, floor: 15 },
  { slug: 'snoopdogg', name: "Snoop Dogg", supply: 44810, floor: 15 },
  { slug: 'icecream', name: "Ice Cream", supply: 26816, floor: 14 },
  { slug: 'toybear', name: "Toy Bear", supply: 28244, floor: 14 },
];

// Index by slug for O(1) lookups.
const GIFTS_BY_SLUG = Object.fromEntries(GIFTS.map(g => [g.slug, g]));

// Boxes: 5 tiers, defined by price band [min, max] of gift floor prices.
// Opening a box rolls a random gift whose floor sits in the band.
// No "rarity" word — boxes have themed names instead.
const BOXES = [
  { id: 1, key: 'starter',  name: 'Starter Box',  icon: '✨', cost: 12,  growth_minutes: 2,  band: [5, 25],     gradient: '#7b61ff, #38bdf8' },
  { id: 2, key: 'mystic',   name: 'Mystic Box',   icon: '🌀', cost: 35,  growth_minutes: 5,  band: [25, 80],    gradient: '#38bdf8, #2ee08c' },
  { id: 3, key: 'royal',    name: 'Royal Box',    icon: '👑', cost: 90,  growth_minutes: 12, band: [80, 250],   gradient: '#ffcb45, #ff7d6b' },
  { id: 4, key: 'cosmic',   name: 'Cosmic Box',   icon: '🌌', cost: 240, growth_minutes: 25, band: [250, 700],  gradient: '#c084fc, #ff5dcd' },
  { id: 5, key: 'mythic',   name: 'Mythic Box',   icon: '🔱', cost: 600, growth_minutes: 45, band: [700, 9999], gradient: '#ff5dcd, #ffcb45' },
];

function pickGiftFromBox(boxKey) {
  const box = BOXES.find(b => b.key === boxKey);
  if (!box) return null;
  const [lo, hi] = box.band;
  const pool = GIFTS.filter(g => g.floor >= lo && g.floor <= hi);
  if (!pool.length) return GIFTS[0];
  // Lower-floor gifts are more likely to drop than higher-floor ones in the same band.
  const weights = pool.map(g => 1 / Math.max(g.floor, 1));
  const total = weights.reduce((a,b)=>a+b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < pool.length; i++) {
    r -= weights[i];
    if (r <= 0) return pool[i];
  }
  return pool[pool.length-1];
}

function pickRandomGift() {
  return GIFTS[Math.floor(Math.random() * GIFTS.length)];
}

module.exports = { GIFTS, GIFTS_BY_SLUG, BOXES, pickGiftFromBox, pickRandomGift };
