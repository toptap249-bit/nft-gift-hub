const crypto = require('crypto');

/**
 * Validate Telegram Mini App initData per
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 *
 * @param {string} initData - raw query-string from Telegram.WebApp.initData
 * @param {string} botToken - bot token from BotFather
 * @returns {{ok: boolean, user?: object, authDate?: number, reason?: string}}
 */
function verifyInitData(initData, botToken) {
  if (!initData || !botToken) return { ok: false, reason: 'missing args' };

  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return { ok: false, reason: 'no hash' };
  params.delete('hash');

  // Build data_check_string: keys sorted alphabetically, joined as key=value with \n
  const dataCheckString = [...params.entries()]
    .map(([k, v]) => [k, v])
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');

  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const computed = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  if (computed !== hash) return { ok: false, reason: 'bad hash' };

  // Reject stale initData (older than 24h)
  const authDate = Number(params.get('auth_date') || 0);
  if (!authDate || Date.now() / 1000 - authDate > 86400) {
    return { ok: false, reason: 'stale auth_date' };
  }

  let user;
  try {
    user = JSON.parse(params.get('user') || 'null');
  } catch {
    user = null;
  }
  if (!user || !user.id) return { ok: false, reason: 'no user' };

  return { ok: true, user, authDate };
}

module.exports = { verifyInitData };
