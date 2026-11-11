import 'dotenv/config';

export const config = {
  owner: (process.env.OWNER_NUMBER || '2347053098253').replace(/\\D/g, ''),
  name: process.env.BOT_NAME || '𓉳 𝐏𝐫𝐢𝐧𝐜𝐞 🥀',
  prefix: process.env.PREFIX || '.',
  mode: (process.env.BOT_MODE || 'public').toLowerCase(),
  authDir: process.env.AUTH_DIR || './.data/auth',
  databaseUrl: process.env.DATABASE_URL || '',
  logLevel: process.env.LOG_LEVEL || 'info',
  timezone: process.env.TZ || 'Africa/Lagos'
};
if (!['public', 'private'].includes(config.mode)) throw new Error('BOT_MODE must be public or private');
