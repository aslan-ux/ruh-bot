import crypto from 'crypto';

/**
 * Проверка подлинности initData из Telegram Mini App.
 * Алгоритм: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 *
 * @param {string} initData  строка window.Telegram.WebApp.initData (query-string)
 * @param {string} botToken  токен бота
 * @param {number} maxAgeSec максимальный возраст данных в секундах (защита от replay)
 * @returns {{ ok: boolean, user?: object, error?: string }}
 */
export function validateInitData(initData, botToken, maxAgeSec = 3600) {
  if (!initData) return { ok: false, error: 'empty initData' };

  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return { ok: false, error: 'no hash' };
  params.delete('hash');

  // Собираем data_check_string: пары key=value, отсортированные по ключу, через \n
  const dataCheckString = [...params.entries()]
    .map(([k, v]) => `${k}=${v}`)
    .sort()
    .join('\n');

  // secret_key = HMAC_SHA256(bot_token) с ключом "WebAppData"
  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest();

  const computedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  if (computedHash !== hash) return { ok: false, error: 'bad signature' };

  // Проверка возраста данных
  const authDate = Number(params.get('auth_date'));
  if (authDate && Date.now() / 1000 - authDate > maxAgeSec) {
    return { ok: false, error: 'expired' };
  }

  let user;
  try {
    user = JSON.parse(params.get('user') || 'null');
  } catch {
    user = null;
  }

  return { ok: true, user };
}
