// Telegram bot for NFT Gift Hub.
// On /start it sends a button that opens the Mini App via WebAppInfo.
// The Mini App URL must be a public HTTPS endpoint (use cloudflared/ngrok in
// dev, or a real host in prod).

const TelegramBot = require('node-telegram-bot-api');

function startBot({ token, webAppUrl, logger = console }) {
  if (!token) {
    logger.warn('⚠️  TELEGRAM_BOT_TOKEN не задан — бот не запущен (только сервер).');
    return null;
  }
  if (!webAppUrl || !/^https:\/\//.test(webAppUrl)) {
    logger.warn(`⚠️  WEBAPP_URL должен начинаться с https:// (сейчас: ${webAppUrl || 'не задан'}). Бот запустится, но кнопка Mini App работать не будет.`);
  }

  const bot = new TelegramBot(token, { polling: true });

  const openButton = webAppUrl
    ? { text: '🎮 Открыть NFT Gift Hub', web_app: { url: webAppUrl } }
    : null;

  bot.onText(/^\/start(?:@\w+)?(?:\s|$)/, (msg) => {
    const chatId = msg.chat.id;
    const name = msg.from?.first_name || 'друг';
    const text =
      `Привет, ${name}! 👋\n\n` +
      `🎁 *NFT Gift Hub* — выращивай, крафти и торгуй NFT прямо в Telegram.\n\n` +
      `Жми кнопку ниже, чтобы открыть Mini App.`;

    const opts = { parse_mode: 'Markdown' };
    if (openButton) {
      opts.reply_markup = { inline_keyboard: [[openButton]] };
    } else {
      opts.reply_markup = {
        keyboard: [[{ text: 'Открыть в браузере (без WebApp)' }]],
        resize_keyboard: true,
      };
    }
    bot.sendMessage(chatId, text, opts);
  });

  bot.onText(/^\/help(?:@\w+)?$/, (msg) => {
    bot.sendMessage(msg.chat.id,
      '🆘 Команды:\n' +
      '/start — открыть мини-приложение\n' +
      '/help — эта справка\n\n' +
      'Если кнопка не открывается — обнови Telegram до последней версии.');
  });

  // Set the persistent menu button to open the Mini App. This makes the
  // button available next to the message input box, not just in /start.
  if (openButton) {
    bot.setChatMenuButton({
      menu_button: {
        type: 'web_app',
        text: 'NFT Hub',
        web_app: { url: webAppUrl },
      },
    }).then(() => logger.log('✅ Menu button установлена на WebApp')).catch(err => {
      logger.warn('⚠️  Не удалось установить menu button:', err.message);
    });

    bot.setMyCommands([
      { command: 'start', description: 'Открыть NFT Gift Hub' },
      { command: 'help', description: 'Справка' },
    ]).catch(() => {});
  }

  bot.on('polling_error', (err) => {
    logger.error('Polling error:', err.code || err.message);
  });

  logger.log('🤖 Telegram бот запущен (polling)');
  return bot;
}

module.exports = { startBot };
